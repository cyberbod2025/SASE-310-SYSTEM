import { DatosDocumento, TipoDocumentoInstitucional } from "./types";
import { generarPieInstitucional } from "./trazabilidad";

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
    hoja_acuerdos: "HOJA DE ACUERDOS Y COMPROMISOS",
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
