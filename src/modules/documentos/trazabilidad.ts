import { TipoDocumentoInstitucional } from "./types";
import { generateSecureNumCode } from "../../utils/security";

/**
 * Sistema de Seguimiento Documental SASE-310
 *
 * Formato de folio: SASE-310-[TIPO]-[GRUPO]-[FECHA]-[ID]
 * Ejemplo: SASE-310-ACTA-2B-2026-03-06-001
 */

// Prefijos por tipo de documento
const PREFIJO_TIPO: Record<TipoDocumentoInstitucional, string> = {
  citatorio_padres: "CIT",
  acta_hechos: "ACTA",
  acta_corresponsabilidad: "COR",
  hoja_acuerdos: "ACU",
  reporte_seguimiento_individual: "SEG-IND",
  informe_seguimiento_grupal: "SEG-GRP",
  informe_supervision: "SUP",
  informe_caso: "CASO",
  circular_docentes: "CIRC",
  aviso_comunidad: "AVIS",
  minuta_cte: "CTE",
};

/**
 * Genera un folio institucional único con el formato:
 * SASE-310-[TIPO]-[GRUPO]-[FECHA]-[ID]
 */
export function generarFolioInstitucional(
  tipo: TipoDocumentoInstitucional,
  grupo: string,
  secuencial?: number,
): string {
  const prefijo = PREFIJO_TIPO[tipo];
  const grupoClean = grupo.replace(/\s+/g, "").toUpperCase();
  const fecha = new Date();
  const fechaStr = [
    fecha.getFullYear(),
    String(fecha.getMonth() + 1).padStart(2, "0"),
    String(fecha.getDate()).padStart(2, "0"),
  ].join("-");

  // ID secuencial o generado
  const id = secuencial
    ? String(secuencial).padStart(3, "0")
    : generateSecureNumCode(3);

  return `SASE-310-${prefijo}-${grupoClean}-${fechaStr}-${id}`;
}

/**
 * Genera una URL de imagen QR para el folio del documento.
 * Usa la API pública de QR Server (sin dependencias adicionales).
 */
export function generarQRDataUrl(folio: string): string {
  // Datos del QR: el folio completo + URL de verificación
  const datosQR = encodeURIComponent(
    `SASE-310 | Folio: ${folio} | Verificar en sistema institucional`,
  );
  // API pública — genera un PNG de 100x100
  return `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${datosQR}&format=svg`;
}

/**
 * Genera el bloque HTML del pie institucional con QR y metadata.
 */
export function generarPieInstitucional(folio: string, fecha: string): string {
  const qrUrl = generarQRDataUrl(folio);
  const timestamp = new Date().toISOString();

  return `
    <div style="margin-top:40px; padding-top:20px; border-top:2px solid #1e3a8a;">
      <div style="display:flex; align-items:center; justify-content:space-between;">
        <div style="flex:1;">
          <p style="font-size:8px; color:#64748b; font-weight:700; text-transform:uppercase; letter-spacing:2px; margin:0 0 6px;">
            Folio Institucional
          </p>
          <p style="font-size:11px; color:#1e3a8a; font-weight:900; font-family:monospace; letter-spacing:1px; margin:0 0 8px;">
            ${folio}
          </p>
          <p style="font-size:7px; color:#94a3b8; font-weight:600; margin:0; line-height:1.6;">
            Documento registrado en el Sistema de Atención y Seguimiento Escolar SASE-310.<br/>
            Generado: ${fecha} | Timestamp: ${timestamp}<br/>
            Creator: SASE-310 | System: Sistema de Atención y Seguimiento Escolar
          </p>
        </div>
        <div style="margin-left:20px; text-align:center;">
          <img
            src="${qrUrl}"
            alt="QR Verificación ${folio}"
            style="width:80px; height:80px; border:1px solid #e2e8f0; border-radius:4px;"
          />
          <p style="font-size:6px; color:#cbd5e1; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-top:4px;">
            Verificación
          </p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Metadata interna para el PDF (se inyecta vía window.document.title y meta tags).
 */
export function getDocumentMetadata(folio: string) {
  return {
    creator: "SASE-310",
    system: "Sistema de Atención y Seguimiento Escolar",
    folio,
    timestamp: new Date().toISOString(),
    version: "3.10",
  };
}
