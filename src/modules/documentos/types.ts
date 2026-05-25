// Tipos para el módulo de documentos institucionales SASE
// Centro Documental completo

export type TipoDocumentoInstitucional =
  | "citatorio_padres"
  | "acta_hechos"
  | "acta_corresponsabilidad"
  | "hoja_acuerdos"
  | "informe_supervision"
  | "informe_caso"
  | "circular_docentes"
  | "aviso_comunidad"
  | "minuta_cte";

export interface DatosDocumento {
  alumno_nombre: string;
  alumno_id: string;
  grupo: string;
  docente_reporta: string;
  fecha: string;
  hora: string;
  lugar_incidente: string;
  descripcion: string;
  // Extras opcionales
  tipo_falta?: string;
  testigos?: string;
  acuerdos?: string[];
  fecha_citatorio?: string;
  hora_citatorio?: string;
  tutor_nombre?: string;
  tutor_parentesco?: string;
  personal_prefectura?: string;
  testigo_institucional?: string;
  reflexion_alumno?: string;
  compromiso_alumno?: string;
  compromiso_familia?: string;
  observaciones?: string;
  // Extras para nuevos tipos
  destinatario?: string;
  asunto?: string;
  ciclo_escolar?: string;
  participantes?: string[];
}

export interface DocumentoGenerado {
  tipo: TipoDocumentoInstitucional;
  folio: string;
  titulo: string;
  contenido_html: string;
  datos: DatosDocumento;
  generado_por: string;
  fecha_generacion: string;
  hora_generacion: string;
}

// Categorías para organizar en el Centro Documental
export type CategoriaDocumento = "disciplinario" | "operativo" | "comunicacion";

// Etiquetas legibles para el usuario
export const TIPOS_DOCUMENTO: Record<
  TipoDocumentoInstitucional,
  {
    label: string;
    icon: string;
    color: string;
    categoria: CategoriaDocumento;
    descripcion: string;
  }
> = {
  // === DISCIPLINARIOS ===
  citatorio_padres: {
    label: "Citatorio a Padres de Familia",
    icon: "mail",
    color: "amber",
    categoria: "disciplinario",
    descripcion: "Solicitud formal de presencia del tutor en el plantel.",
  },
  acta_hechos: {
    label: "Acta de Hechos",
    icon: "description",
    color: "rose",
    categoria: "disciplinario",
    descripcion: "Narración formal de hechos para el expediente escolar.",
  },
  acta_corresponsabilidad: {
    label: "Acta de Hechos y Corresponsabilidad",
    icon: "contract_edit",
    color: "indigo",
    categoria: "disciplinario",
    descripcion:
      "Formato institucional con hechos, acuerdos, compromisos y firmas.",
  },
  hoja_acuerdos: {
    label: "Hoja de Acuerdos / Compromisos",
    icon: "handshake",
    color: "blue",
    categoria: "disciplinario",
    descripcion: "Acuerdos y compromisos post-reunión con tutor y alumno.",
  },
  informe_caso: {
    label: "Informe de Caso",
    icon: "assignment_ind",
    color: "purple",
    categoria: "disciplinario",
    descripcion: "Informe detallado de seguimiento a caso específico.",
  },

  // === OPERATIVOS ===
  informe_supervision: {
    label: "Informe de Supervisión",
    icon: "fact_check",
    color: "teal",
    categoria: "operativo",
    descripcion: "Informe de supervisión docente o de área.",
  },
  minuta_cte: {
    label: "Minuta CTE",
    icon: "groups",
    color: "indigo",
    categoria: "operativo",
    descripcion: "Minuta del Consejo Técnico Escolar.",
  },

  // === COMUNICACIÓN ===
  circular_docentes: {
    label: "Circular a Docentes",
    icon: "campaign",
    color: "emerald",
    categoria: "comunicacion",
    descripcion: "Comunicado interno dirigido al personal docente.",
  },
  aviso_comunidad: {
    label: "Aviso a Comunidad Escolar",
    icon: "public",
    color: "sky",
    categoria: "comunicacion",
    descripcion: "Aviso general para la comunidad escolar.",
  },
};

// Helper: agrupar por categoría
export function getDocumentosPorCategoria(): Record<
  CategoriaDocumento,
  TipoDocumentoInstitucional[]
> {
  const resultado: Record<CategoriaDocumento, TipoDocumentoInstitucional[]> = {
    disciplinario: [],
    operativo: [],
    comunicacion: [],
  };

  for (const [key, val] of Object.entries(TIPOS_DOCUMENTO)) {
    resultado[val.categoria].push(key as TipoDocumentoInstitucional);
  }

  return resultado;
}

export const CATEGORIAS_LABEL: Record<
  CategoriaDocumento,
  { label: string; icon: string }
> = {
  disciplinario: { label: "Disciplinarios", icon: "gavel" },
  operativo: { label: "Operativos", icon: "settings" },
  comunicacion: { label: "Comunicación", icon: "campaign" },
};
