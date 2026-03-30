// Módulo de Documentos Institucionales SASE-310
// Centro Documental — Barrel export

// Componentes
export { GeneradorDocumentos } from "./GeneradorDocumentos";
export { PanelAdvertencias } from "./PanelAdvertencias";

// Plantillas y prompts
export { generarPlantillaHTML } from "./plantillas";
export {
  generarPromptDocumento,
  promptHacerFormal,
  promptResumir,
} from "./prompts";

// Servicios IA
export {
  mejorarRedaccionInstitucional,
  detectarIncidenciasPrevias,
  hacerMasFormal,
  resumirTexto,
} from "./serviciosIA";

// Detector de advertencias
export {
  detectarLenguajeSubjetivo,
  detectarCamposIncompletos,
  analizarDocumento,
} from "./detectarAdvertencias";

// Trazabilidad
export {
  generarFolioInstitucional,
  generarQRDataUrl,
  generarPieInstitucional,
  getDocumentMetadata,
} from "./trazabilidad";

// Tipos
export type {
  TipoDocumentoInstitucional,
  DatosDocumento,
  DocumentoGenerado,
  CategoriaDocumento,
} from "./types";
export {
  TIPOS_DOCUMENTO,
  getDocumentosPorCategoria,
  CATEGORIAS_LABEL,
} from "./types";
