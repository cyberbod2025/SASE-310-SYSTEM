import { GoogleGenerativeAI } from "@google/generative-ai";
import type {
  DatosAlumnoExpediente,
  IncidenciaExpediente,
  DocumentoExpediente,
  EventoLinea,
  ExpedienteCompleto,
} from "./types";
import { generarQRDataUrl } from "../documentos/trazabilidad";

/**
 * Recopila incidencias del alumno desde Supabase.
 */
export async function recopilarIncidencias(
  supabase: any,
  alumnoId: string,
): Promise<IncidenciaExpediente[]> {
  try {
    const { data, error } = await supabase
      .from("incidencias")
      .select("id, fecha, tipo, descripcion, estado, reporta, clasificacion")
      .eq("alumno_id", alumnoId)
      .order("fecha", { ascending: false });

    if (error || !data) return [];

    return data.map((inc: any) => ({
      id: inc.id,
      fecha: inc.fecha || "S/F",
      tipo: inc.tipo || "Sin clasificar",
      descripcion: inc.descripcion || "",
      estado: inc.estado || "Registrada",
      reporta: inc.reporta || "No especificado",
      clasificacion: inc.clasificacion,
    }));
  } catch {
    return [];
  }
}

/**
 * Recopila documentos generados asociados al alumno.
 */
export async function recopilarDocumentos(
  supabase: any,
  alumnoId: string,
): Promise<DocumentoExpediente[]> {
  try {
    // Los documentos se registran en auditoria_accesos con el patrón FOLIO_GENERADO
    const { data, error } = await (supabase as any)
      .from("auditoria_accesos")
      .select("pantalla, fecha, hora, usuario")
      .eq("alumno_id", alumnoId)
      .ilike("pantalla", "FOLIO_GENERADO:%")
      .order("fecha", { ascending: false });

    if (error || !data) return [];

    return data.map((doc: any) => {
      const partes = (doc.pantalla || "").split(":");
      return {
        folio: partes[1] || "S/F",
        tipo: partes[2] || "documento",
        fecha: doc.fecha || "S/F",
        generado_por: doc.usuario || "Sistema",
      };
    });
  } catch {
    return [];
  }
}

/**
 * Construye la línea de tiempo cronológica del caso.
 */
export function construirLineaTiempo(
  incidencias: IncidenciaExpediente[],
  documentos: DocumentoExpediente[],
): EventoLinea[] {
  const eventos: EventoLinea[] = [];

  // Agregar incidencias
  for (const inc of incidencias) {
    eventos.push({
      fecha: inc.fecha,
      tipo: "incidencia",
      titulo: `Incidencia: ${inc.tipo}`,
      descripcion:
        inc.descripcion.substring(0, 120) +
        (inc.descripcion.length > 120 ? "..." : ""),
      icon: "report",
      color:
        inc.clasificacion === "Tipo III"
          ? "rose"
          : inc.clasificacion === "Tipo II"
            ? "amber"
            : "blue",
    });
  }

  // Agregar documentos
  for (const doc of documentos) {
    const tipoLabel: Record<string, string> = {
      citatorio_padres: "Citatorio",
      acta_hechos: "Acta de Hechos",
      hoja_acuerdos: "Hoja de Acuerdos",
      informe_caso: "Informe de Caso",
      informe_supervision: "Informe de Supervisión",
      circular_docentes: "Circular",
      aviso_comunidad: "Aviso",
      minuta_cte: "Minuta CTE",
    };

    eventos.push({
      fecha: doc.fecha,
      tipo: "documento",
      titulo: `Documento: ${tipoLabel[doc.tipo] || doc.tipo}`,
      descripcion: `Folio: ${doc.folio}`,
      icon: "description",
      color: "indigo",
    });
  }

  // Ordenar cronológicamente (más reciente primero)
  eventos.sort((a, b) => {
    if (a.fecha > b.fecha) return -1;
    if (a.fecha < b.fecha) return 1;
    return 0;
  });

  return eventos;
}

/**
 * Genera análisis institucional del caso con IA.
 */
export async function generarAnalisisIA(
  alumno: DatosAlumnoExpediente,
  incidencias: IncidenciaExpediente[],
  documentos: DocumentoExpediente[],
): Promise<string> {
  const resumenIncidencias = incidencias
    .slice(0, 10)
    .map((i) => `- ${i.fecha}: ${i.tipo} — ${i.descripcion.substring(0, 80)}`)
    .join("\n");

  const resumenDocs = documentos
    .slice(0, 10)
    .map((d) => `- ${d.fecha}: ${d.tipo} — Folio: ${d.folio}`)
    .join("\n");

  const prompt = `Eres el sistema IA-SASE de la Escuela Secundaria Diurna No. 310, CDMX.
Genera un ANÁLISIS INSTITUCIONAL breve del expediente del alumno, basado en el 
"Marco para la Convivencia Escolar en las Escuelas de Educación Básica del Distrito Federal".

DATOS DEL ALUMNO:
- Nombre: ${alumno.nombre}
- Grupo: ${alumno.grupo}

HISTORIAL DE INCIDENCIAS (${incidencias.length} registradas):
${resumenIncidencias || "Sin incidencias registradas."}

DOCUMENTOS GENERADOS (${documentos.length}):
${resumenDocs || "Sin documentos generados."}

INSTRUCCIONES:
1. Resume la situación del alumno de forma objetiva (2-3 párrafos)
2. Identifica patrones de conducta si existen
3. Clasifica el nivel de atención según el Marco (Preventivo, Formativo, Correctivo)
4. Sugiere acciones de seguimiento
5. Usa lenguaje técnico-pedagógico. NUNCA uses juicios de valor.
6. NO incluyas encabezados ni formato — solo el análisis.

ANÁLISIS INSTITUCIONAL:`;

  try {
    const response = await fetch("/api/ai/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, model: "gemini-2.0-flash" }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error || response.statusText);
    }

    const data = await response.json();
    return (data?.text || "").trim();
  } catch (proxyError) {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    if (!apiKey) {
      return "Análisis no disponible — sin conexión con IA-SASE.";
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (err) {
      console.error("[EXPEDIENTE] Error IA:", err);
      return "Error al generar análisis con IA. Intente nuevamente.";
    }
  }
}

/**
 * Genera folio de expediente: SASE-310-EXP-[GRUPO]-[AÑO]-[ID]
 */
export function generarFolioExpediente(grupo: string): string {
  const grupoClean = grupo.replace(/\s+/g, "").toUpperCase();
  const anio = new Date().getFullYear();
  const id = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
  return `SASE-310-EXP-${grupoClean}-${anio}-${id}`;
}

/**
 * Genera la plantilla HTML del expediente institucional completo.
 */
export function generarHTMLExpediente(exp: ExpedienteCompleto): string {
  const qrUrl = generarQRDataUrl(exp.folio);

  const incidenciasHTML =
    exp.incidencias.length > 0
      ? exp.incidencias
          .map(
            (inc) => `
      <tr>
        <td style="padding:6px 10px; border:1px solid #e2e8f0; font-size:10px; font-weight:700;">${inc.fecha}</td>
        <td style="padding:6px 10px; border:1px solid #e2e8f0; font-size:10px;">${inc.tipo}</td>
        <td style="padding:6px 10px; border:1px solid #e2e8f0; font-size:10px;">${inc.descripcion.substring(0, 100)}${inc.descripcion.length > 100 ? "..." : ""}</td>
        <td style="padding:6px 10px; border:1px solid #e2e8f0; font-size:10px; text-align:center;">${inc.clasificacion || "-"}</td>
        <td style="padding:6px 10px; border:1px solid #e2e8f0; font-size:10px; text-align:center;">${inc.estado}</td>
      </tr>
    `,
          )
          .join("")
      : '<tr><td colspan="5" style="padding:12px; text-align:center; color:#94a3b8; font-size:10px;">Sin incidencias registradas.</td></tr>';

  const documentosHTML =
    exp.documentos.length > 0
      ? exp.documentos
          .map(
            (doc) => `
      <tr>
        <td style="padding:6px 10px; border:1px solid #e2e8f0; font-size:10px; font-weight:700;">${doc.fecha}</td>
        <td style="padding:6px 10px; border:1px solid #e2e8f0; font-size:10px;">${doc.tipo}</td>
        <td style="padding:6px 10px; border:1px solid #e2e8f0; font-size:10px; font-family:monospace;">${doc.folio}</td>
      </tr>
    `,
          )
          .join("")
      : '<tr><td colspan="3" style="padding:12px; text-align:center; color:#94a3b8; font-size:10px;">Sin documentos generados.</td></tr>';

  const timestamp = new Date().toISOString();

  return `
    <div style="font-family:'Inter',system-ui,sans-serif; max-width:750px; margin:0 auto; padding:40px; color:#1e293b;">
      <!-- ENCABEZADO -->
      <div style="text-align:center; margin-bottom:30px; border-bottom:2px solid #1e3a8a; padding-bottom:20px;">
        <p style="font-size:11px; font-weight:900; text-transform:uppercase; letter-spacing:3px; color:#64748b; margin:0;">
          SECRETARÍA DE EDUCACIÓN PÚBLICA
        </p>
        <p style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:#94a3b8; margin:4px 0;">
          ADMINISTRACIÓN FEDERAL DE SERVICIOS EDUCATIVOS EN EL D.F.
        </p>
        <h1 style="font-size:18px; font-weight:900; color:#1e3a8a; margin:16px 0 4px; text-transform:uppercase; letter-spacing:1px;">
          ESCUELA SECUNDARIA DIURNA No. 310
        </h1>
        <p style="font-size:10px; color:#94a3b8; margin:0; font-weight:600;">
          "JOSÉ MA. MORELOS Y PAVÓN" — TURNO MATUTINO — C.C.T. 09DES0310Z
        </p>
        <p style="font-size:10px; color:#cbd5e1; margin:8px 0 0; font-weight:700;">
          FOLIO: ${exp.folio} | FECHA: ${exp.fechaGeneracion}
        </p>
      </div>

      <h2 style="text-align:center; font-size:16px; font-weight:900; color:#1e3a8a; text-transform:uppercase; letter-spacing:3px; margin:20px 0; border-bottom:1px solid #e2e8f0; padding-bottom:12px;">
        EXPEDIENTE INSTITUCIONAL DEL ALUMNO
      </h2>

      <!-- DATOS DEL ALUMNO -->
      <table style="width:100%; border-collapse:collapse; margin:20px 0; font-size:12px;">
        <tr>
          <td style="padding:8px 12px; border:1px solid #e2e8f0; font-weight:800; background:#f8fafc; width:30%; text-transform:uppercase; font-size:10px; color:#64748b;">Alumno(a)</td>
          <td style="padding:8px 12px; border:1px solid #e2e8f0; font-weight:700;">${exp.alumno.nombre}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px; border:1px solid #e2e8f0; font-weight:800; background:#f8fafc; text-transform:uppercase; font-size:10px; color:#64748b;">Grupo</td>
          <td style="padding:8px 12px; border:1px solid #e2e8f0; font-weight:700;">${exp.alumno.grupo}</td>
        </tr>
        ${
          exp.alumno.curp
            ? `<tr>
          <td style="padding:8px 12px; border:1px solid #e2e8f0; font-weight:800; background:#f8fafc; text-transform:uppercase; font-size:10px; color:#64748b;">CURP</td>
          <td style="padding:8px 12px; border:1px solid #e2e8f0; font-weight:700; font-family:monospace;">${exp.alumno.curp}</td>
        </tr>`
            : ""
        }
        ${
          exp.alumno.tutor
            ? `<tr>
          <td style="padding:8px 12px; border:1px solid #e2e8f0; font-weight:800; background:#f8fafc; text-transform:uppercase; font-size:10px; color:#64748b;">Tutor</td>
          <td style="padding:8px 12px; border:1px solid #e2e8f0; font-weight:700;">${exp.alumno.tutor}</td>
        </tr>`
            : ""
        }
      </table>

      <!-- HISTORIAL DISCIPLINARIO -->
      <h3 style="font-size:12px; font-weight:900; color:#1e3a8a; text-transform:uppercase; letter-spacing:2px; margin:30px 0 10px; border-left:4px solid #1e3a8a; padding-left:12px;">
        Historial Disciplinario (${exp.incidencias.length} registros)
      </h3>
      <table style="width:100%; border-collapse:collapse; font-size:11px;">
        <thead>
          <tr style="background:#f1f5f9;">
            <th style="padding:6px 10px; border:1px solid #e2e8f0; text-align:left; font-size:9px; font-weight:800; text-transform:uppercase; color:#64748b;">Fecha</th>
            <th style="padding:6px 10px; border:1px solid #e2e8f0; text-align:left; font-size:9px; font-weight:800; text-transform:uppercase; color:#64748b;">Tipo</th>
            <th style="padding:6px 10px; border:1px solid #e2e8f0; text-align:left; font-size:9px; font-weight:800; text-transform:uppercase; color:#64748b;">Descripción</th>
            <th style="padding:6px 10px; border:1px solid #e2e8f0; text-align:center; font-size:9px; font-weight:800; text-transform:uppercase; color:#64748b;">Clasif.</th>
            <th style="padding:6px 10px; border:1px solid #e2e8f0; text-align:center; font-size:9px; font-weight:800; text-transform:uppercase; color:#64748b;">Estado</th>
          </tr>
        </thead>
        <tbody>${incidenciasHTML}</tbody>
      </table>

      <!-- DOCUMENTOS GENERADOS -->
      <h3 style="font-size:12px; font-weight:900; color:#1e3a8a; text-transform:uppercase; letter-spacing:2px; margin:30px 0 10px; border-left:4px solid #1e3a8a; padding-left:12px;">
        Documentos Generados (${exp.documentos.length})
      </h3>
      <table style="width:100%; border-collapse:collapse; font-size:11px;">
        <thead>
          <tr style="background:#f1f5f9;">
            <th style="padding:6px 10px; border:1px solid #e2e8f0; text-align:left; font-size:9px; font-weight:800; text-transform:uppercase; color:#64748b;">Fecha</th>
            <th style="padding:6px 10px; border:1px solid #e2e8f0; text-align:left; font-size:9px; font-weight:800; text-transform:uppercase; color:#64748b;">Tipo</th>
            <th style="padding:6px 10px; border:1px solid #e2e8f0; text-align:left; font-size:9px; font-weight:800; text-transform:uppercase; color:#64748b;">Folio</th>
          </tr>
        </thead>
        <tbody>${documentosHTML}</tbody>
      </table>

      <!-- ANÁLISIS INSTITUCIONAL -->
      ${
        exp.analisisIA
          ? `
        <h3 style="font-size:12px; font-weight:900; color:#1e3a8a; text-transform:uppercase; letter-spacing:2px; margin:30px 0 10px; border-left:4px solid #1e3a8a; padding-left:12px;">
          Análisis Institucional IA-SASE
        </h3>
        <div style="margin:16px 0; padding:20px; background:#fafbff; border:1px solid #e2e8f0; border-radius:8px; font-size:12px; line-height:1.8; text-align:justify;">
          ${exp.analisisIA}
        </div>
      `
          : ""
      }

      <!-- NORMATIVA -->
      <div style="margin:20px 0; padding:12px 16px; background:#fffbeb; border-left:4px solid #f59e0b; font-size:10px; color:#92400e; line-height:1.6;">
        <strong>FUNDAMENTO NORMATIVO:</strong> Expediente elaborado conforme al 
        <em>Marco para la Convivencia Escolar en las Escuelas de Educación Básica del Distrito Federal</em>, 
        con fines de seguimiento formativo y corresponsabilidad educativa.
      </div>

      <!-- PIE INSTITUCIONAL CON QR -->
      <div style="margin-top:40px; padding-top:20px; border-top:2px solid #1e3a8a;">
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <div style="flex:1;">
            <p style="font-size:8px; color:#64748b; font-weight:700; text-transform:uppercase; letter-spacing:2px; margin:0 0 6px;">
              Folio Institucional
            </p>
            <p style="font-size:11px; color:#1e3a8a; font-weight:900; font-family:monospace; letter-spacing:1px; margin:0 0 8px;">
              ${exp.folio}
            </p>
            <p style="font-size:7px; color:#94a3b8; font-weight:600; margin:0; line-height:1.6;">
              Registro institucional SASE-310<br/>
              Fecha y hora de generación: ${exp.fechaGeneracion} - ${new Date(timestamp).toLocaleTimeString("es-MX", { hour12: false })}<br/>
              Creator: SASE-310 | System: Sistema de Atención y Seguimiento Escolar
            </p>
          </div>
          <div style="margin-left:20px; text-align:center;">
            <img src="${qrUrl}" alt="QR ${exp.folio}" style="width:80px; height:80px; border:1px solid #e2e8f0; border-radius:4px;" />
            <p style="font-size:6px; color:#cbd5e1; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-top:4px;">
              Verificación
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}
