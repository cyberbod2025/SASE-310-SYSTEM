import { Student } from "../types";
import { generateSecureToken } from "./security";

export const getDocumentTemplate = (
  type: "JUSTIFICANTE" | "REPORTE_INCIDENCIA" | "BITACORA",
  student: Student | undefined,
  data: any,
  schoolName: string = "ESCUELA SECUNDARIA DIURNA No. 310 'CUAHTEPEX'",
) => {
  const today = new Date().toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const folio = data.folio || "0000-0000";
  const issuedBy = data.issuedBy || "TRABAJO SOCIAL";
  const uuid = generateSecureToken(12);

  let content = "";

  if (type === "JUSTIFICANTE") {
    content = `
      <div class="space-y-6">
        <p style="font-weight: bold; text-decoration: underline; text-transform: uppercase;">
          A QUIEN CORRESPONDA / CUERPO DOCENTE:
        </p>
        <p>
          Por medio de la presente, el departamento de <strong>TRABAJO SOCIAL</strong> de esta institución educativa,
          hace constar que el C. estudiante <strong>${student?.name.toUpperCase() || "ESTUDIANTE"}</strong>, 
          con matrícula <strong> ${student?.matricula || "S/M"}</strong> del grupo <strong>${student?.group || "S/G"}</strong>, 
          ha presentado la documentación necesaria para justificar sus inasistencias durante el periodo
          comprendido del <strong> ${data.startDate}</strong> al <strong>${data.endDate}</strong>.
        </p>
        <p>
          <strong>MOTIVO DEL JUSTIFICANTE:</strong> ${data.reason.toUpperCase()}
        </p>
        <p>
          <strong>OBSERVACIONES:</strong> ${data.description || "Ninguna."}
        </p>
        ${
          data.distal
            ? `
          <div style="padding: 1rem; background: #f3f4f6; border-left: 4px solid #000; font-weight: bold; font-style: italic;">
            NOTA: El alumno cuenta con autorización para realizar TRABAJO A DISTANCIA durante este periodo. 
            Se solicita a los docentes de grupo brindar las facilidades académicas pertinentes.
          </div>
        `
            : ""
        }
      </div>
    `;
  } else if (type === "REPORTE_INCIDENCIA") {
    content = `
      <div class="space-y-6">
        <p style="font-weight: bold; text-decoration: underline; text-transform: uppercase;">
          REPORTE DE INCIDENCIA DISCIPLINARIA / CONDUCTUAL:
        </p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; background: #f9fafb; padding: 1rem; border: 1px solid rgba(0,0,0,0.1);">
          <p><strong>ALUMNO:</strong> ${student?.name.toUpperCase() || "N/A"}</p>
          <p><strong>GRUPO:</strong> ${student?.group || "N/A"}</p>
          <p><strong>FECHA:</strong> ${data.date || today}</p>
          <p><strong>CATEGORÍA:</strong> ${data.type || "CONDUCTA"}</p>
        </div>
        <div class="space-y-4">
          <p><strong>DESCRIPCIÓN DE LOS HECHOS:</strong></p>
          <div style="padding: 1rem; border: 1px solid rgba(0,0,0,0.05); background: #fff; min-height: 150px; font-style: italic;">
            "${data.description || ""}"
          </div>
        </div>
      </div>
    `;
  } else if (type === "BITACORA") {
    const items = data.items || [];
    content = `
      <div class="space-y-6">
        <p style="font-weight: bold; text-decoration: underline; text-transform: uppercase;">
          BITÁCORA DE SEGUIMIENTO ESCOLAR:
        </p>
        <p>
          Registro detallado de acciones, intervenciones y seguimientos realizados durante el periodo 
          <strong>${data.startDate || today}</strong> al <strong>${data.endDate || today}</strong>.
        </p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 1rem; font-size: 11px;">
          <thead>
            <tr style="background: #f3f4f6; text-align: left; border-bottom: 2px solid #000;">
              <th style="padding: 8px; border: 1px solid #e5e7eb;">FECHA</th>
              <th style="padding: 8px; border: 1px solid #e5e7eb;">ESTUDIANTE</th>
              <th style="padding: 8px; border: 1px solid #e5e7eb;">CATEGORÍA</th>
              <th style="padding: 8px; border: 1px solid #e5e7eb;">DESCRIPCIÓN / ACUERDOS</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (i: any) => `
              <tr>
                <td style="padding: 8px; border: 1px solid #e5e7eb;">${i.date}</td>
                <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">${i.studentName || "GENERAL"}</td>
                <td style="padding: 8px; border: 1px solid #e5e7eb;">${i.type}</td>
                <td style="padding: 8px; border: 1px solid #e5e7eb;">${i.description}</td>
              </tr>
            `,
              )
              .join("")}
            ${items.length === 0 ? '<tr><td colspan="4" style="padding: 20px; text-align: center; color: #9ca3af;">Sin registros en el periodo seleccionado.</td></tr>' : ""}
          </tbody>
        </table>
        <div style="margin-top: 20px;">
          <p><strong>SÍNTESIS DE LA JORNADA:</strong></p>
          <div style="padding: 1rem; border: 1px solid rgba(0,0,0,0.05); background: #fff; min-height: 100px;">
            ${data.summary || "Sin observaciones adicionales."}
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div style="font-family: 'Inter', serif; color: #000; padding: 2rem; position: relative;">
      <!-- HEADER -->
      <div style="display: flex; justify-content: space-between; align-items: start; border-bottom: 2px solid #000; padding-bottom: 1.5rem; margin-bottom: 2rem;">
        <div style="width: 80px; height: 80px; border: 1px solid #000; display: flex; align-items: center; justify-content: center; font-size: 8px; text-align: center; font-weight: bold; text-transform: uppercase;">
          ESCUDO<br/>OFICIAL<br/>SEP
        </div>
        <div style="flex: 1; text-align: center; padding: 0 2rem;">
          <h1 style="margin: 0; font-size: 1.2rem; font-weight: 900; text-transform: uppercase;">${schoolName}</h1>
          <p style="margin: 5px 0; font-size: 10px; font-weight: bold; text-transform: uppercase; color: #374151;">Subdirección de Gestión Escolar // Turno Vespertino</p>
          <p style="margin: 0; font-size: 9px; font-weight: bold;">C.C.T. 09DES4310M | SISTEMA SASE 310 - NÚCLEO OPERATIVO</p>
        </div>
        <div style="text-align: right;">
          <p style="margin: 0; font-size: 10px; font-weight: 900; text-transform: uppercase;">FOLIO_SINCRO</p>
          <p style="margin: 0; font-size: 1.2rem; font-family: monospace; font-weight: bold; color: #dc2626;">${folio}</p>
        </div>
      </div>

      <!-- TITULO -->
      <div style="text-align: center; margin-bottom: 2.5rem;">
        <h2 style="display: inline-block; font-size: 1.5rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 0.5rem 2rem; font-style: italic;">
          ${type.replace("_", " ")}
        </h2>
      </div>

      <!-- CUERPO -->
      <div style="font-size: 14px; line-height: 1.6; text-align: justify;">
        <div style="display: flex; justify-content: end; font-weight: bold; margin-bottom: 2rem;">
          Ciudad de México, a ${today}
        </div>
        
        ${content}

        <div style="margin-top: 4rem;">
          <p>Se extiende la presente para los fines legales y administrativos que al interesado convengan.</p>
        </div>
      </div>

      <!-- FIRMAS -->
      <div style="margin-top: 6rem; display: grid; grid-template-columns: 1fr 1fr; gap: 4rem;">
        <div style="text-align: center;">
          <div style="border-top: 1px solid #000; padding-top: 0.5rem;">
            <p style="margin: 0; font-weight: 900; text-transform: uppercase; font-size: 10px;">${issuedBy}</p>
            <p style="margin: 0; font-size: 8px; color: #4b5563; font-style: italic;">SELLO Y FIRMA DE EMISIÓN</p>
          </div>
          <div style="width: 80px; height: 80px; border: 1px solid #d1d5db; margin: 1rem auto; opacity: 0.3; display: flex; align-items: center; justify-content: center; font-size: 8px; text-transform: uppercase;">
            Sello de la<br/>Escuela
          </div>
        </div>
        <div style="text-align: center;">
          <div style="border-top: 1px solid #000; padding-top: 0.5rem;">
            <p style="margin: 0; font-weight: 900; text-transform: uppercase; font-size: 10px;">DIRECCIÓN DEL PLANTEL</p>
            <p style="margin: 0; font-size: 8px; color: #4b5563; font-style: italic;">VALIDACIÓN INSTITUCIONAL</p>
          </div>
          <div style="margin-top: 1rem; display: flex; flex-direction: column; align-items: center;">
            <div style="width: 70px; height: 70px; background: #000; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 7px; font-family: monospace; padding: 5px; text-align: center; text-transform: uppercase;">
              VALIDACIÓN QR SASE-DIGITAL
            </div>
            <p style="margin: 5px 0 0; font-size: 7px; font-family: monospace; color: #9ca3af;">UUID: ${uuid}</p>
          </div>
        </div>
      </div>

      <!-- WATERMARK -->
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); opacity: 0.03; font-size: 5rem; font-weight: 900; pointer-events: none; text-transform: uppercase; white-space: nowrap; z-index: -1;">
        CUAHTEPEX 310 SASE-CORE
      </div>
    </div>
  `;
};
