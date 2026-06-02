import { DatosDocumento, TipoDocumentoInstitucional } from "./types";
import { generarPieInstitucional } from "./trazabilidad";

const EN_PREPARACION_HTML =
  '<span style="font-weight:900; color:#92400e; background:#fffbeb; padding:1px 5px; border-radius:4px;">En preparación</span>';

function escapeHtml(valor: string): string {
  return valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function datoOPreparacion(valor?: string): string {
  const limpio = valor?.trim();
  return limpio ? escapeHtml(limpio) : EN_PREPARACION_HTML;
}

function parrafosOPreparacion(valor?: string): string {
  const limpio = valor?.trim();
  if (!limpio) {
    return `<p style="margin:0 0 10px;">${EN_PREPARACION_HTML}</p>`;
  }

  return limpio
    .split(/\n+/)
    .map(
      (parrafo) =>
        `<p style="margin:0 0 10px; text-align:justify;">${escapeHtml(parrafo.trim())}</p>`,
    )
    .join("");
}

function limpiarMarcadorLista(valor: string): string {
  return valor.replace(/^\s*(?:[-*•□]|\d+[.)])\s*/, "").trim();
}

function listaOPreparacion(valor?: string, respaldo: string[] = []): string {
  const lineas = valor
    ?.split(/\n+/)
    .map(limpiarMarcadorLista)
    .filter(Boolean);
  const elementos = lineas && lineas.length > 0 ? lineas : respaldo;

  if (elementos.length === 0) {
    return `<ul style="margin:0; padding-left:18px;"><li>${EN_PREPARACION_HTML}</li></ul>`;
  }

  return `
    <ul style="margin:0; padding-left:18px; line-height:1.75;">
      ${elementos.map((item) => `<li style="margin:0 0 6px;">${escapeHtml(item)}</li>`).join("")}
    </ul>
  `;
}

/**
 * Genera el HTML de un documento institucional con encabezado oficial,
 * cuerpo normativo, espacios de firma, y pie institucional con QR.
 */
export function generarPlantillaHTML(
  tipo: TipoDocumentoInstitucional,
  datos: DatosDocumento,
  contenidoIA: string,
  folio: string,
): string {
  if (tipo === "acta_corresponsabilidad") {
    return generarActaCorresponsabilidadHTML(datos, contenidoIA, folio);
  }

  if (tipo === "reporte_seguimiento_individual") {
    return generarReporteSeguimientoIndividualHTML(datos, contenidoIA, folio);
  }

  if (tipo === "informe_seguimiento_grupal") {
    return generarInformeSeguimientoGrupalHTML(datos, contenidoIA, folio);
  }

  const encabezado = `
    <div style="text-align:center; margin-bottom:30px; border-bottom:2px solid #1e3a8a; padding-bottom:20px;">
      <p style="font-size:11px; font-weight:900; text-transform:uppercase; letter-spacing:3px; color:#64748b; margin:0;">
        SECRETARÍA DE EDUCACIÓN PÚBLICA
      </p>
      <p style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:#94a3b8; margin:4px 0;">
        ADMINISTRACIÓN FEDERAL DE SERVICIOS EDUCATIVOS EN EL D.F.
      </p>
      <p style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:#94a3b8; margin:4px 0;">
        DIRECCIÓN GENERAL DE EDUCACIÓN SECUNDARIA TÉCNICA
      </p>
      <h1 style="font-size:18px; font-weight:900; color:#1e3a8a; margin:16px 0 4px; text-transform:uppercase; letter-spacing:1px;">
        ESCUELA SECUNDARIA DIURNA No. 310
      </h1>
      <p style="font-size:10px; color:#94a3b8; margin:0; font-weight:600;">
        "JOSÉ MA. MORELOS Y PAVÓN" — TURNO MATUTINO — C.C.T. 09DES0310Z
      </p>
      <p style="font-size:10px; color:#cbd5e1; margin:8px 0 0; font-weight:700;">
        FOLIO: ${folio} | FECHA: ${datos.fecha}
      </p>
    </div>
  `;

  const tituloDoc = {
    citatorio_padres: "CITATORIO A PADRES DE FAMILIA O TUTORES",
    acta_hechos: "ACTA CIRCUNSTANCIADA DE HECHOS",
    acta_corresponsabilidad:
      "ACTA DE HECHOS Y ACUERDOS DE CORRESPONSABILIDAD",
    hoja_acuerdos: "HOJA DE ACUERDOS Y COMPROMISOS",
    reporte_seguimiento_individual:
      "REPORTE DE SEGUIMIENTO ACADÉMICO Y CONDUCTUAL",
    informe_seguimiento_grupal:
      "INFORME GRUPAL DE SEGUIMIENTO ACADÉMICO Y CONDUCTUAL",
    informe_supervision: "INFORME DE SUPERVISIÓN",
    informe_caso: "INFORME DE CASO",
    circular_docentes: "CIRCULAR INTERNA",
    aviso_comunidad: "AVISO A LA COMUNIDAD ESCOLAR",
    minuta_cte: "MINUTA DEL CONSEJO TÉCNICO ESCOLAR",
  }[tipo];

  const datosAlumno = `
    <table style="width:100%; border-collapse:collapse; margin:20px 0; font-size:12px;">
      <tr>
        <td style="padding:8px 12px; border:1px solid #e2e8f0; font-weight:800; background:#f8fafc; width:30%; text-transform:uppercase; font-size:10px; color:#64748b;">Alumno(a)</td>
        <td style="padding:8px 12px; border:1px solid #e2e8f0; font-weight:700;">${datos.alumno_nombre}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px; border:1px solid #e2e8f0; font-weight:800; background:#f8fafc; text-transform:uppercase; font-size:10px; color:#64748b;">Grupo</td>
        <td style="padding:8px 12px; border:1px solid #e2e8f0; font-weight:700;">${datos.grupo}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px; border:1px solid #e2e8f0; font-weight:800; background:#f8fafc; text-transform:uppercase; font-size:10px; color:#64748b;">Fecha del incidente</td>
        <td style="padding:8px 12px; border:1px solid #e2e8f0; font-weight:700;">${datos.fecha} a las ${datos.hora} hrs.</td>
      </tr>
      <tr>
        <td style="padding:8px 12px; border:1px solid #e2e8f0; font-weight:800; background:#f8fafc; text-transform:uppercase; font-size:10px; color:#64748b;">Lugar</td>
        <td style="padding:8px 12px; border:1px solid #e2e8f0; font-weight:700;">${datos.lugar_incidente}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px; border:1px solid #e2e8f0; font-weight:800; background:#f8fafc; text-transform:uppercase; font-size:10px; color:#64748b;">Reporta</td>
        <td style="padding:8px 12px; border:1px solid #e2e8f0; font-weight:700;">${datos.docente_reporta}</td>
      </tr>
    </table>
  `;

  const cuerpo = `
    <div style="margin:24px 0; padding:20px; background:#fafbff; border:1px solid #e2e8f0; border-radius:8px; font-size:13px; line-height:1.8; text-align:justify;">
      ${contenidoIA}
    </div>
  `;

  const normativa = `
    <div style="margin:20px 0; padding:12px 16px; background:#fffbeb; border-left:4px solid #f59e0b; font-size:10px; color:#92400e; line-height:1.6;">
      <strong>FUNDAMENTO NORMATIVO:</strong> El presente documento se emite en apego al 
      <em>Marco para la Convivencia Escolar en las Escuelas de Educación Básica del Distrito Federal</em> 
      y la <em>Guía Operativa para la Organización y Funcionamiento de los Servicios de Educación Básica, 
      Especial y para Adultos en el Distrito Federal</em>. Se privilegia el enfoque formativo y de 
      corresponsabilidad establecido en los artículos aplicables.
    </div>
  `;

  // Citatorio: agregar fecha y hora de cita
  let seccionExtra = "";
  if (tipo === "citatorio_padres") {
    seccionExtra = `
      <div style="margin:20px 0; padding:16px; background:#fef3c7; border:1px solid #fbbf24; border-radius:8px; text-align:center;">
        <p style="font-size:12px; font-weight:800; color:#92400e; text-transform:uppercase; letter-spacing:2px; margin:0 0 8px;">
          SE CITA PARA PRESENTARSE EL DÍA
        </p>
        <p style="font-size:18px; font-weight:900; color:#78350f; margin:0;">
          ${datos.fecha_citatorio || "[FECHA POR DEFINIR]"} a las ${datos.hora_citatorio || "[HORA POR DEFINIR]"} hrs.
        </p>
        <p style="font-size:10px; color:#a16207; margin:8px 0 0;">
          En la Oficina de Orientación y Tutoría Educativa de este plantel.
        </p>
      </div>
    `;
  }

  // Acuerdos: agregar lista si aplica
  if (tipo === "hoja_acuerdos" && datos.acuerdos && datos.acuerdos.length > 0) {
    seccionExtra = `
      <div style="margin:20px 0;">
        <p style="font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:2px; color:#1e40af; margin-bottom:12px;">
          Acuerdos y Compromisos Establecidos:
        </p>
        <ol style="font-size:12px; line-height:2; padding-left:20px;">
          ${datos.acuerdos.map((a) => `<li style="margin-bottom:4px;">${a}</li>`).join("")}
        </ol>
      </div>
    `;
  }

  const firmas = `
    <div style="margin-top:60px; display:flex; justify-content:space-around; text-align:center;">
      <div style="width:200px;">
        <div style="border-top:1px solid #333; margin-bottom:6px;"></div>
        <p style="font-size:10px; font-weight:800; color:#64748b; text-transform:uppercase; letter-spacing:1px; margin:0;">
          Padre/Madre de Familia<br/>o Tutor
        </p>
      </div>
      <div style="width:200px;">
        <div style="border-top:1px solid #333; margin-bottom:6px;"></div>
        <p style="font-size:10px; font-weight:800; color:#64748b; text-transform:uppercase; letter-spacing:1px; margin:0;">
          Alumno(a)
        </p>
      </div>
    </div>
    <div style="margin-top:40px; display:flex; justify-content:space-around; text-align:center;">
      <div style="width:200px;">
        <div style="border-top:1px solid #333; margin-bottom:6px;"></div>
        <p style="font-size:10px; font-weight:800; color:#1e40af; text-transform:uppercase; letter-spacing:1px; margin:0;">
          Vo.Bo. Orientación<br/>y Tutoría Educativa
        </p>
      </div>
      <div style="width:200px;">
        <div style="border-top:1px solid #333; margin-bottom:6px;"></div>
        <p style="font-size:10px; font-weight:800; color:#1e40af; text-transform:uppercase; letter-spacing:1px; margin:0;">
          Vo.Bo. Dirección<br/>Escolar
        </p>
      </div>
    </div>
  `;

  // Pie institucional con QR y trazabilidad
  const pie = generarPieInstitucional(folio, datos.fecha);

  return `
    <div style="font-family:'Inter',system-ui,sans-serif; max-width:750px; margin:0 auto; padding:40px; color:#1e293b;">
      ${encabezado}
      <h2 style="text-align:center; font-size:16px; font-weight:900; color:#1e3a8a; text-transform:uppercase; letter-spacing:3px; margin:30px 0 20px; border-bottom:1px solid #e2e8f0; padding-bottom:12px;">
        ${tituloDoc}
      </h2>
      ${datosAlumno}
      ${cuerpo}
      ${seccionExtra}
      ${normativa}
      ${firmas}
      ${pie}
    </div>
  `;
}

function generarReporteSeguimientoIndividualHTML(
  datos: DatosDocumento,
  contenidoIA: string,
  folio: string,
): string {
  const pie = generarPieInstitucional(folio, datos.fecha);
  const sintesis = contenidoIA.trim() || datos.descripcion;
  const asunto =
    datos.asunto ||
    "Seguimiento académico y conductual del alumno(a)";
  const soporte =
    datos.soporte_atencion_familia ||
    "Se hace constar que la madre, padre o tutor fue atendido de manera oportuna, amable, respetuosa e institucional, en un ambiente de diálogo, escucha y colaboración orientado al bienestar del alumno(a).";

  const firma = (cargo: string, nombre?: string) => `
    <div style="width:45%; min-width:230px; margin:28px 0 12px; text-align:center;">
      <p style="font-size:10px; font-weight:900; color:#334155; text-transform:uppercase; letter-spacing:1.5px; margin:0 0 28px;">
        ${escapeHtml(cargo)}
      </p>
      <div style="border-top:1px solid #1f2937; padding-top:7px; font-size:11px; line-height:1.5;">
        ${datoOPreparacion(nombre)}<br/>
        <span style="color:#64748b;">Nombre y firma</span>
      </div>
    </div>
  `;

  return `
    <div style="font-family:Arial, Helvetica, sans-serif; max-width:760px; margin:0 auto; padding:34px 38px; color:#111827; font-size:12px; line-height:1.65;">
      <header style="text-align:center; border-bottom:2px solid #111827; padding-bottom:14px; margin-bottom:18px;">
        <h1 style="font-size:16px; font-weight:900; margin:0 0 4px; text-transform:uppercase;">
          ESCUELA SECUNDARIA DIURNA No. 310 "PRESIDENTES DE MÉXICO"
        </h1>
        <p style="font-size:11px; font-weight:800; margin:0 0 8px; text-transform:uppercase;">Turno vespertino</p>
        <h2 style="font-size:14px; font-weight:900; margin:0; text-transform:uppercase; letter-spacing:1px;">
          REPORTE DE SEGUIMIENTO ACADÉMICO Y CONDUCTUAL
        </h2>
      </header>

      <table style="width:100%; border-collapse:collapse; margin:0 0 18px; font-size:12px;">
        <tbody>
          <tr>
            <td style="border:1px solid #cbd5e1; padding:7px; width:22%; font-weight:900; background:#f8fafc;">Alumno(a)</td>
            <td style="border:1px solid #cbd5e1; padding:7px;">${datoOPreparacion(datos.alumno_nombre)}</td>
            <td style="border:1px solid #cbd5e1; padding:7px; width:16%; font-weight:900; background:#f8fafc;">Grupo</td>
            <td style="border:1px solid #cbd5e1; padding:7px;">${datoOPreparacion(datos.grupo)}</td>
          </tr>
          <tr>
            <td style="border:1px solid #cbd5e1; padding:7px; font-weight:900; background:#f8fafc;">Docente / Personal</td>
            <td style="border:1px solid #cbd5e1; padding:7px;">${datoOPreparacion(datos.docente_reporta)}</td>
            <td style="border:1px solid #cbd5e1; padding:7px; font-weight:900; background:#f8fafc;">Fecha</td>
            <td style="border:1px solid #cbd5e1; padding:7px;">${datoOPreparacion(datos.fecha)}</td>
          </tr>
          <tr>
            <td style="border:1px solid #cbd5e1; padding:7px; font-weight:900; background:#f8fafc;">Madre, padre o tutor</td>
            <td style="border:1px solid #cbd5e1; padding:7px;">${datoOPreparacion(datos.tutor_nombre)}</td>
            <td style="border:1px solid #cbd5e1; padding:7px; font-weight:900; background:#f8fafc;">Parentesco</td>
            <td style="border:1px solid #cbd5e1; padding:7px;">${datoOPreparacion(datos.tutor_parentesco)}</td>
          </tr>
          <tr>
            <td style="border:1px solid #cbd5e1; padding:7px; font-weight:900; background:#f8fafc;">Asunto</td>
            <td colspan="3" style="border:1px solid #cbd5e1; padding:7px;">${datoOPreparacion(asunto)}</td>
          </tr>
        </tbody>
      </table>

      <section style="margin:18px 0;">
        <p style="margin:0 0 10px; text-align:justify;">
          Por medio del presente se documenta el seguimiento académico y conductual del alumno(a) ${datoOPreparacion(datos.alumno_nombre)}, con la finalidad de dejar constancia objetiva de las situaciones observadas, las acciones implementadas y los compromisos de corresponsabilidad establecidos entre escuela y familia.
        </p>
        <p style="margin:0; text-align:justify;">${escapeHtml(soporte)}</p>
      </section>

      <section style="margin:18px 0;">
        <h3 style="font-size:12px; font-weight:900; margin:0 0 8px; text-transform:uppercase;">I. Síntesis institucional</h3>
        ${parrafosOPreparacion(sintesis)}
      </section>

      <section style="margin:18px 0;">
        <h3 style="font-size:12px; font-weight:900; margin:0 0 8px; text-transform:uppercase;">II. Situaciones observadas</h3>
        ${listaOPreparacion(datos.situaciones_observadas, [
          "Cumplimiento irregular de actividades o evidencias académicas.",
          "Necesidad de redireccionamiento para iniciar o concluir el trabajo escolar.",
          "Dificultad para sostener condiciones adecuadas de participación y convivencia.",
        ])}
      </section>

      <section style="margin:18px 0;">
        <h3 style="font-size:12px; font-weight:900; margin:0 0 8px; text-transform:uppercase;">III. Acciones implementadas</h3>
        ${listaOPreparacion(datos.acciones_implementadas, [
          "Explicación grupal e individual de actividades.",
          "Seguimiento durante las sesiones de clase.",
          "Registro de incidencias académicas o conductuales relevantes.",
          "Comunicación y orientación para fortalecer hábitos de responsabilidad.",
        ])}
      </section>

      <section style="margin:18px 0;">
        <h3 style="font-size:12px; font-weight:900; margin:0 0 8px; text-transform:uppercase;">IV. Observación académica relevante</h3>
        ${parrafosOPreparacion(
          datos.observacion_academica ||
            "Las actividades, indicaciones y oportunidades de trabajo han sido proporcionadas durante las sesiones ordinarias, por lo que se considera necesario fortalecer hábitos de organización, atención a instrucciones y entrega de evidencias.",
        )}
      </section>

      <section style="margin:18px 0;">
        <h3 style="font-size:12px; font-weight:900; margin:0 0 8px; text-transform:uppercase;">V. Objetivo del seguimiento</h3>
        ${parrafosOPreparacion(
          datos.objetivo_seguimiento ||
            "Favorecer el desarrollo de hábitos de responsabilidad, organización, respeto a las normas de convivencia y cumplimiento de actividades académicas, fortaleciendo el trabajo coordinado entre alumno, familia y escuela.",
        )}
      </section>

      <section style="margin:18px 0;">
        <h3 style="font-size:12px; font-weight:900; margin:0 0 8px; text-transform:uppercase;">VI. Compromisos</h3>
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px;">
          <div style="border:1px solid #cbd5e1; padding:10px;">
            <p style="font-size:10px; font-weight:900; text-transform:uppercase; margin:0 0 6px;">Alumno(a)</p>
            ${listaOPreparacion(datos.compromiso_alumno, [
              "Atender indicaciones emitidas por el personal escolar.",
              "Realizar y entregar las actividades solicitadas.",
              "Mantener un lenguaje respetuoso durante la convivencia escolar.",
            ])}
          </div>
          <div style="border:1px solid #cbd5e1; padding:10px;">
            <p style="font-size:10px; font-weight:900; text-transform:uppercase; margin:0 0 6px;">Familia</p>
            ${listaOPreparacion(datos.compromiso_familia, [
              "Dar seguimiento al cuaderno, avisos y actividades escolares.",
              "Acompañar el cumplimiento de los compromisos establecidos.",
              "Mantener comunicación respetuosa y oportuna con la escuela.",
            ])}
          </div>
          <div style="border:1px solid #cbd5e1; padding:10px;">
            <p style="font-size:10px; font-weight:900; text-transform:uppercase; margin:0 0 6px;">Escuela</p>
            ${listaOPreparacion(datos.medidas_implementadas, [
              "Continuar brindando acompañamiento académico y formativo.",
              "Mantener seguimiento y registro de avances.",
              "Informar oportunamente situaciones relevantes del desempeño escolar.",
            ])}
          </div>
        </div>
      </section>

      <section style="margin:18px 0; padding:12px; border:1px solid #cbd5e1; background:#f8fafc;">
        <h3 style="font-size:12px; font-weight:900; margin:0 0 8px; text-transform:uppercase;">VII. Soporte institucional y constancia de atención</h3>
        <p style="margin:0 0 10px; text-align:justify;">
          Se deja constancia de que la madre, padre o tutor fue atendido de manera oportuna, amable, respetuosa e institucional, brindando un espacio de escucha, aclaración y revisión objetiva de la situación académica y conductual observada.
        </p>
        <p style="margin:0; text-align:justify;">
          La intervención se realizó en un ambiente de respeto e institucionalidad, privilegiando el diálogo, la corresponsabilidad familia-escuela, el interés superior del estudiante y el seguimiento formativo.
        </p>
      </section>

      <section style="margin:18px 0;">
        <h3 style="font-size:12px; font-weight:900; margin:0 0 8px; text-transform:uppercase;">VIII. Observaciones finales</h3>
        ${parrafosOPreparacion(datos.observaciones)}
      </section>

      <section style="margin:20px 0 10px;">
        <h3 style="font-size:12px; font-weight:900; margin:0 0 8px; text-transform:uppercase;">IX. Firmas</h3>
        <div style="display:flex; flex-wrap:wrap; justify-content:space-between;">
          ${firma("Madre, padre o tutor", datos.tutor_nombre)}
          ${firma("Alumno(a)", datos.alumno_nombre)}
          ${firma("Docente / personal que atiende", datos.docente_reporta)}
          ${firma("Tutor(a) de grupo")}
        </div>
      </section>

      ${pie}
    </div>
  `;
}

function generarInformeSeguimientoGrupalHTML(
  datos: DatosDocumento,
  contenidoIA: string,
  folio: string,
): string {
  const pie = generarPieInstitucional(folio, datos.fecha);
  const sintesis = contenidoIA.trim() || datos.descripcion;
  const asunto =
    datos.asunto ||
    `Seguimiento académico y conductual del grupo ${datos.grupo}`;
  const soporte =
    datos.soporte_atencion_familia ||
    "Las madres, padres o tutores que soliciten aclaración o seguimiento serán atendidos de manera oportuna, amable, respetuosa e institucional, en un ambiente de escucha y corresponsabilidad.";

  const firma = (cargo: string, nombre?: string) => `
    <div style="width:30%; min-width:190px; margin:30px 0 12px; text-align:center;">
      <p style="font-size:10px; font-weight:900; color:#334155; text-transform:uppercase; letter-spacing:1.5px; margin:0 0 28px;">
        ${escapeHtml(cargo)}
      </p>
      <div style="border-top:1px solid #1f2937; padding-top:7px; font-size:11px; line-height:1.5;">
        ${datoOPreparacion(nombre)}<br/>
        <span style="color:#64748b;">Nombre y firma</span>
      </div>
    </div>
  `;

  return `
    <div style="font-family:Arial, Helvetica, sans-serif; max-width:760px; margin:0 auto; padding:34px 38px; color:#111827; font-size:12px; line-height:1.65;">
      <header style="text-align:center; border-bottom:2px solid #111827; padding-bottom:14px; margin-bottom:18px;">
        <h1 style="font-size:16px; font-weight:900; margin:0 0 4px; text-transform:uppercase;">
          ESCUELA SECUNDARIA DIURNA No. 310 "PRESIDENTES DE MÉXICO"
        </h1>
        <p style="font-size:11px; font-weight:800; margin:0 0 8px; text-transform:uppercase;">Turno vespertino</p>
        <h2 style="font-size:14px; font-weight:900; margin:0; text-transform:uppercase; letter-spacing:1px;">
          INFORME GRUPAL DE SEGUIMIENTO ACADÉMICO Y CONDUCTUAL
        </h2>
      </header>

      <table style="width:100%; border-collapse:collapse; margin:0 0 18px; font-size:12px;">
        <tbody>
          <tr>
            <td style="border:1px solid #cbd5e1; padding:7px; width:20%; font-weight:900; background:#f8fafc;">Grupo</td>
            <td style="border:1px solid #cbd5e1; padding:7px;">${datoOPreparacion(datos.grupo)}</td>
            <td style="border:1px solid #cbd5e1; padding:7px; width:20%; font-weight:900; background:#f8fafc;">Fecha</td>
            <td style="border:1px solid #cbd5e1; padding:7px;">${datoOPreparacion(datos.fecha)}</td>
          </tr>
          <tr>
            <td style="border:1px solid #cbd5e1; padding:7px; font-weight:900; background:#f8fafc;">Periodo</td>
            <td style="border:1px solid #cbd5e1; padding:7px;">${datoOPreparacion(datos.periodo_seguimiento)}</td>
            <td style="border:1px solid #cbd5e1; padding:7px; font-weight:900; background:#f8fafc;">Docente / Personal</td>
            <td style="border:1px solid #cbd5e1; padding:7px;">${datoOPreparacion(datos.docente_reporta)}</td>
          </tr>
          <tr>
            <td style="border:1px solid #cbd5e1; padding:7px; font-weight:900; background:#f8fafc;">Asunto</td>
            <td colspan="3" style="border:1px solid #cbd5e1; padding:7px;">${datoOPreparacion(asunto)}</td>
          </tr>
        </tbody>
      </table>

      <section style="margin:18px 0;">
        <p style="margin:0 0 10px; text-align:justify;">
          A quien corresponda: por medio del presente se informa el seguimiento académico y conductual del grupo ${datoOPreparacion(datos.grupo)}, con base en registros de clase, observaciones de trabajo y acciones implementadas para fortalecer la organización escolar.
        </p>
        <p style="margin:0; text-align:justify;">${escapeHtml(soporte)}</p>
      </section>

      <section style="margin:18px 0;">
        <h3 style="font-size:12px; font-weight:900; margin:0 0 8px; text-transform:uppercase;">I. Contexto y síntesis institucional</h3>
        ${parrafosOPreparacion(sintesis)}
      </section>

      <section style="margin:18px 0;">
        <h3 style="font-size:12px; font-weight:900; margin:0 0 8px; text-transform:uppercase;">II. Situaciones observadas</h3>
        ${listaOPreparacion(datos.situaciones_observadas, [
          "Falta de realización de actividades previamente indicadas.",
          "Ausencia de materiales o evidencias solicitadas.",
          "Necesidad de redireccionamiento para mantener condiciones adecuadas de trabajo grupal.",
          "Conversaciones o distracciones que afectan el desarrollo de actividades académicas.",
        ])}
        <p style="margin:10px 0 0; text-align:justify;">
          Se reconoce que puede existir alumnado que sí da seguimiento a las indicaciones, presenta evidencias y mantiene participación acorde con lo solicitado; el presente informe evita generalizaciones absolutas y se emite para seguimiento formativo.
        </p>
      </section>

      <section style="margin:18px 0;">
        <h3 style="font-size:12px; font-weight:900; margin:0 0 8px; text-transform:uppercase;">III. Acciones y medidas implementadas</h3>
        ${listaOPreparacion(
          datos.acciones_implementadas || datos.medidas_implementadas,
          [
            "Actividades cortas y verificables durante cada sesión.",
            "Revisión periódica de evidencias en cuaderno.",
            "Registro individual de cumplimiento e incumplimiento.",
            "Seguimiento continuo mediante listas de control y revisión docente.",
          ],
        )}
      </section>

      <section style="margin:18px 0;">
        <h3 style="font-size:12px; font-weight:900; margin:0 0 8px; text-transform:uppercase;">IV. Objetivo del seguimiento grupal</h3>
        ${parrafosOPreparacion(
          datos.objetivo_seguimiento ||
            "Fortalecer hábitos de organización, cumplimiento académico, escucha de indicaciones y convivencia respetuosa, mediante acciones verificables y seguimiento continuo del desempeño grupal.",
        )}
      </section>

      <section style="margin:18px 0;">
        <h3 style="font-size:12px; font-weight:900; margin:0 0 8px; text-transform:uppercase;">V. Compromisos</h3>
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px;">
          <div style="border:1px solid #cbd5e1; padding:10px;">
            <p style="font-size:10px; font-weight:900; text-transform:uppercase; margin:0 0 6px;">Grupo</p>
            ${listaOPreparacion(datos.compromiso_alumno, [
              "Atender instrucciones durante las sesiones de clase.",
              "Presentar evidencias y materiales solicitados.",
              "Conservar condiciones de trabajo respetuosas y colaborativas.",
            ])}
          </div>
          <div style="border:1px solid #cbd5e1; padding:10px;">
            <p style="font-size:10px; font-weight:900; text-transform:uppercase; margin:0 0 6px;">Familias</p>
            ${listaOPreparacion(datos.compromiso_familia, [
              "Dar seguimiento al cumplimiento de actividades y avisos escolares.",
              "Apoyar hábitos de responsabilidad y organización en casa.",
              "Mantener comunicación respetuosa y oportuna con el plantel.",
            ])}
          </div>
          <div style="border:1px solid #cbd5e1; padding:10px;">
            <p style="font-size:10px; font-weight:900; text-transform:uppercase; margin:0 0 6px;">Escuela</p>
            ${listaOPreparacion(datos.medidas_implementadas, [
              "Continuar con seguimiento académico verificable.",
              "Registrar avances y áreas de oportunidad.",
              "Brindar atención institucional a familias que requieran aclaración o acompañamiento.",
            ])}
          </div>
        </div>
      </section>

      <section style="margin:18px 0; padding:12px; border:1px solid #cbd5e1; background:#f8fafc;">
        <h3 style="font-size:12px; font-weight:900; margin:0 0 8px; text-transform:uppercase;">VI. Soporte institucional y atención a familias</h3>
        <p style="margin:0 0 10px; text-align:justify;">
          Se deja constancia de que las madres, padres o tutores serán atendidos de manera oportuna, amable y respetuosa para revisar inquietudes, aclaraciones o solicitudes de seguimiento relacionadas con el desempeño académico y conductual del grupo.
        </p>
        <p style="margin:0; text-align:justify;">
          La atención se realizará en ambiente institucional, privilegiando el diálogo, la escucha activa, la colaboración familia-escuela y el carácter formativo de las acciones implementadas.
        </p>
      </section>

      <section style="margin:18px 0;">
        <h3 style="font-size:12px; font-weight:900; margin:0 0 8px; text-transform:uppercase;">VII. Observaciones finales</h3>
        ${parrafosOPreparacion(datos.observaciones)}
      </section>

      <p style="margin:20px 0 0; text-align:justify;">
        Sin más por el momento, se emite el presente para conocimiento y seguimiento correspondiente.
      </p>

      <section style="margin:20px 0 10px;">
        <h3 style="font-size:12px; font-weight:900; margin:0 0 8px; text-transform:uppercase;">VIII. Firmas</h3>
        <div style="display:flex; flex-wrap:wrap; justify-content:space-between;">
          ${firma("Docente / personal que emite", datos.docente_reporta)}
          ${firma("Tutor(a) de grupo")}
          ${firma("Vo. Bo. Dirección")}
        </div>
      </section>

      ${pie}
    </div>
  `;
}

function generarActaCorresponsabilidadHTML(
  datos: DatosDocumento,
  contenidoIA: string,
  folio: string,
): string {
  const pie = generarPieInstitucional(folio, datos.fecha);
  const hechos = contenidoIA.trim() || datos.descripcion;
  const checkbox = (texto: string) => `
    <li style="margin:0 0 8px; line-height:1.55;">
      <span style="font-size:13px; margin-right:8px;">&#9633;</span>${escapeHtml(texto)}
    </li>
  `;

  const bloqueRespuesta = (titulo: string, valor?: string) => `
    <div style="margin:14px 0 22px;">
      <p style="font-size:10px; font-weight:900; color:#334155; text-transform:uppercase; letter-spacing:1.5px; margin:0 0 8px;">
        ${escapeHtml(titulo)}
      </p>
      <div style="min-height:64px; border:1px solid #cbd5e1; padding:12px; font-size:12px; line-height:1.65; background:#ffffff;">
        ${parrafosOPreparacion(valor)}
      </div>
    </div>
  `;

  const firma = (cargo: string, nombre?: string) => `
    <div style="width:45%; min-width:230px; margin:26px 0 12px; text-align:center;">
      <p style="font-size:10px; font-weight:900; color:#334155; text-transform:uppercase; letter-spacing:1.5px; margin:0 0 28px;">
        ${escapeHtml(cargo)}
      </p>
      <div style="border-top:1px solid #1f2937; padding-top:7px; font-size:11px; line-height:1.5;">
        ${datoOPreparacion(nombre)}<br/>
        <span style="color:#64748b;">Nombre y firma</span>
      </div>
    </div>
  `;

  return `
    <div style="font-family:Arial, Helvetica, sans-serif; max-width:760px; margin:0 auto; padding:34px 38px; color:#111827; font-size:12px; line-height:1.65;">
      <header style="text-align:center; border-bottom:2px solid #111827; padding-bottom:14px; margin-bottom:18px;">
        <h1 style="font-size:16px; font-weight:900; margin:0 0 6px; text-transform:uppercase;">
          ESCUELA SECUNDARIA DIURNA No. 310 "PRESIDENTES DE MÉXICO"
        </h1>
        <h2 style="font-size:14px; font-weight:900; margin:0; text-transform:uppercase; letter-spacing:1px;">
          ACTA DE HECHOS Y ACUERDOS DE CORRESPONSABILIDAD
        </h2>
      </header>

      <table style="width:100%; border-collapse:collapse; margin:0 0 18px; font-size:12px;">
        <tbody>
          <tr>
            <td style="border:1px solid #cbd5e1; padding:7px; width:22%; font-weight:900; background:#f8fafc;">Ciclo Escolar</td>
            <td style="border:1px solid #cbd5e1; padding:7px;">${datoOPreparacion(datos.ciclo_escolar)}</td>
            <td style="border:1px solid #cbd5e1; padding:7px; width:14%; font-weight:900; background:#f8fafc;">Fecha</td>
            <td style="border:1px solid #cbd5e1; padding:7px;">${datoOPreparacion(datos.fecha)}</td>
          </tr>
          <tr>
            <td style="border:1px solid #cbd5e1; padding:7px; font-weight:900; background:#f8fafc;">Grupo</td>
            <td style="border:1px solid #cbd5e1; padding:7px;">${datoOPreparacion(datos.grupo)}</td>
            <td style="border:1px solid #cbd5e1; padding:7px; font-weight:900; background:#f8fafc;">Alumno(a)</td>
            <td style="border:1px solid #cbd5e1; padding:7px;">${datoOPreparacion(datos.alumno_nombre)}</td>
          </tr>
          <tr>
            <td style="border:1px solid #cbd5e1; padding:7px; font-weight:900; background:#f8fafc;">Tutor(a)</td>
            <td style="border:1px solid #cbd5e1; padding:7px;">${datoOPreparacion(datos.tutor_nombre)}</td>
            <td style="border:1px solid #cbd5e1; padding:7px; font-weight:900; background:#f8fafc;">Parentesco</td>
            <td style="border:1px solid #cbd5e1; padding:7px;">${datoOPreparacion(datos.tutor_parentesco)}</td>
          </tr>
        </tbody>
      </table>

      <section style="margin:18px 0;">
        <h3 style="font-size:12px; font-weight:900; margin:0 0 8px; text-transform:uppercase;">I. Datos de la reunión</h3>
        <p style="margin:0; text-align:justify;">
          En la Ciudad de México, siendo las ${datoOPreparacion(datos.hora)} horas del día ${datoOPreparacion(datos.fecha)}, reunidos en las instalaciones de la Escuela Secundaria Diurna No. 310 "Presidentes de México", comparecen el alumno(a) ${datoOPreparacion(datos.alumno_nombre)}, su madre, padre o tutor ${datoOPreparacion(datos.tutor_nombre)}, el personal escolar ${datoOPreparacion(datos.docente_reporta)} y Prefectura ${datoOPreparacion(datos.personal_prefectura)}, con la finalidad de dar seguimiento a la situación descrita en la presente acta.
        </p>
      </section>

      <section style="margin:18px 0;">
        <h3 style="font-size:12px; font-weight:900; margin:0 0 8px; text-transform:uppercase;">II. Acta de hechos</h3>
        ${parrafosOPreparacion(hechos)}
        <p style="margin:0 0 10px; text-align:justify;">
          Asimismo, se hace constar que la presente intervención tiene carácter preventivo, formativo y de acompañamiento, privilegiando el interés superior del estudiante, la corresponsabilidad familia-escuela y la mejora de la convivencia escolar.
        </p>
      </section>

      <section style="margin:18px 0;">
        <h3 style="font-size:12px; font-weight:900; margin:0 0 8px; text-transform:uppercase;">III. Fundamento</h3>
        <p style="margin:0 0 8px;">La presente actuación se realiza con fundamento en:</p>
        <ul style="margin:0 0 0 18px; padding:0;">
          <li>Artículo 3° de la Constitución Política de los Estados Unidos Mexicanos.</li>
          <li>Artículos 7, 15 y 16 de la Ley General de Educación.</li>
          <li>Marco para la Convivencia Escolar de Educación Secundaria en la Ciudad de México.</li>
          <li>Guía Operativa para la Organización y Funcionamiento de los Servicios de Educación Básica de la Autoridad Educativa Federal en la Ciudad de México.</li>
        </ul>
      </section>

      <section style="margin:18px 0;">
        <h3 style="font-size:12px; font-weight:900; margin:0 0 8px; text-transform:uppercase;">IV. Reflexión del alumno</h3>
        ${bloqueRespuesta("Describe con tus propias palabras lo ocurrido y qué pudiste haber hecho de manera diferente", datos.reflexion_alumno)}
      </section>

      <section style="margin:18px 0;">
        <h3 style="font-size:12px; font-weight:900; margin:0 0 8px; text-transform:uppercase;">V. Acuerdos y compromisos del alumno</h3>
        <p style="margin:0 0 8px;">El alumno se compromete a:</p>
        <ul style="list-style:none; padding:0; margin:0;">
          ${checkbox("Permanecer dentro del aula durante el horario correspondiente a cada clase.")}
          ${checkbox("Informar oportunamente al docente responsable cuando requiera atender alguna situación extraordinaria.")}
          ${checkbox("Respetar los horarios de ingreso al salón después del receso.")}
          ${checkbox("Evitar ausentarse de actividades escolares sin autorización.")}
          ${checkbox("Mantener una comunicación respetuosa y veraz con docentes y autoridades escolares.")}
          ${checkbox("Cumplir las indicaciones emitidas por personal docente, prefectura y directivos.")}
        </ul>
        ${bloqueRespuesta("Compromiso personal del alumno", datos.compromiso_alumno)}
      </section>

      <section style="margin:18px 0;">
        <h3 style="font-size:12px; font-weight:900; margin:0 0 8px; text-transform:uppercase;">VI. Acuerdos y compromisos del padre, madre o tutor</h3>
        <p style="margin:0 0 8px;">La madre, padre o tutor se compromete a:</p>
        <ul style="list-style:none; padding:0; margin:0;">
          ${checkbox("Dialogar con su hijo(a) respecto a la importancia de respetar horarios y normas escolares.")}
          ${checkbox("Dar seguimiento al cumplimiento de los acuerdos establecidos.")}
          ${checkbox("Mantener comunicación con la escuela cuando sea requerido.")}
          ${checkbox("Favorecer hábitos de responsabilidad y cumplimiento escolar.")}
          ${checkbox("Acudir a reuniones de seguimiento cuando la escuela lo solicite.")}
        </ul>
        ${bloqueRespuesta("Compromiso de la familia", datos.compromiso_familia)}
      </section>

      <section style="margin:18px 0;">
        <h3 style="font-size:12px; font-weight:900; margin:0 0 8px; text-transform:uppercase;">VII. Compromisos de la escuela</h3>
        <p style="margin:0 0 8px;">La escuela se compromete a:</p>
        <ul style="list-style:none; padding:0; margin:0;">
          ${checkbox("Brindar acompañamiento y seguimiento formativo al alumno.")}
          ${checkbox("Escuchar y atender respetuosamente a la familia.")}
          ${checkbox("Favorecer espacios de diálogo para la solución de conflictos.")}
          ${checkbox("Aplicar las medidas correspondientes con apego a la normatividad vigente.")}
          ${checkbox("Garantizar un trato digno y respetuoso hacia el alumno y su familia.")}
        </ul>
      </section>

      <section style="margin:18px 0;">
        <h3 style="font-size:12px; font-weight:900; margin:0 0 8px; text-transform:uppercase;">VIII. Constancia de atención</h3>
        <p style="margin:0 0 10px; text-align:justify;">
          Se hace constar que durante la presente reunión el alumno y su madre, padre o tutor fueron atendidos de manera respetuosa, profesional y cordial por el personal de la escuela.
        </p>
        <p style="margin:0 0 10px; text-align:justify;">
          Asimismo, se brindó la oportunidad de expresar observaciones, comentarios, aclaraciones y puntos de vista respecto de los hechos tratados, privilegiando en todo momento el diálogo, la escucha activa, el interés superior del estudiante y el carácter formativo de los acuerdos establecidos.
        </p>
        <p style="margin:0; text-align:justify;">
          Las partes manifiestan haber comprendido el contenido del presente documento y recibir copia del mismo para su conocimiento y seguimiento.
        </p>
      </section>

      <section style="margin:18px 0;">
        <h3 style="font-size:12px; font-weight:900; margin:0 0 8px; text-transform:uppercase;">IX. Observaciones adicionales</h3>
        <div style="min-height:58px; border:1px solid #cbd5e1; padding:12px;">
          ${parrafosOPreparacion(datos.observaciones)}
        </div>
      </section>

      <section style="margin:20px 0 10px;">
        <h3 style="font-size:12px; font-weight:900; margin:0 0 8px; text-transform:uppercase;">X. Firmas</h3>
        <div style="display:flex; flex-wrap:wrap; justify-content:space-between;">
          ${firma("Alumno(a)", datos.alumno_nombre)}
          ${firma("Madre, padre o tutor", datos.tutor_nombre)}
          ${firma("Docente tutor / personal que atiende", datos.docente_reporta)}
          ${firma("Prefectura", datos.personal_prefectura)}
          ${firma("Testigo institucional (si asiste)", datos.testigo_institucional)}
        </div>
      </section>

      <section style="margin:22px 0 0; padding:12px; border:1px solid #cbd5e1; background:#f8fafc;">
        <p style="font-size:10px; font-weight:900; color:#334155; text-transform:uppercase; letter-spacing:1.5px; margin:0 0 6px;">Nota final</p>
        <p style="margin:0; font-size:11px; line-height:1.55; text-align:justify;">
          El presente documento tiene carácter preventivo, formativo y de seguimiento escolar. No constituye por sí mismo una sanción disciplinaria. Su finalidad es fortalecer la corresponsabilidad entre familia y escuela, favorecer el desarrollo integral del alumno y contribuir a una convivencia escolar respetuosa, segura y orientada al aprendizaje.
        </p>
      </section>

      ${pie}
    </div>
  `;
}
