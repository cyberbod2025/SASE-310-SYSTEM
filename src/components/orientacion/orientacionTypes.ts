export type OrientacionCaseEstado =
  | "recibido"
  | "en_analisis"
  | "diagnostico_solicitado"
  | "plan_definido"
  | "derivado_trabajo_social"
  | "escalado_direccion"
  | "cerrado";

export type OrientacionCasePrioridad = "baja" | "media" | "alta" | "critica";

export type OrientacionRequestEstado = "pendiente" | "respondido" | "vencido";

export interface OrientacionStudentSummary {
  id: string;
  nombre: string;
  grupo: string | null;
  matricula: string | null;
  puntajeRiesgo: number | null;
  estadoSemaforo: string | null;
}

export interface OrientacionCaseSummary {
  id: string;
  alumnoId: string;
  alumnoNombre: string;
  grupo: string | null;
  matricula: string | null;
  estado: OrientacionCaseEstado;
  prioridad: OrientacionCasePrioridad;
  motivo: string;
  resumen: string | null;
  fechaApertura: string;
  fechaActualizacion: string;
  responsableId: string | null;
}

export interface OrientacionDocenteOption {
  id: string;
  nombreCompleto: string;
  rol: string;
}

export interface OrientacionDiagnosisRequest {
  id: string;
  casoId: string;
  alumnoId: string;
  docenteId: string;
  estado: OrientacionRequestEstado;
  fechaSolicitud: string;
  fechaRespuesta: string | null;
  observaciones: string | null;
}

export interface OrientacionPlan {
  id: string;
  casoId: string;
  objetivo: string;
  acciones: string;
  responsable: string;
  fechaInicio: string;
  fechaRevision: string | null;
  estado: string;
}

export interface OrientacionFollowUp {
  id: string;
  casoId: string;
  tipo: string;
  descripcion: string;
  evidenciaUrl: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface OrientacionHistoryItem {
  id: string;
  fecha: string | null;
  titulo: string;
  detalle: string;
  fuente: string;
}

export const ORIENTACION_CASE_LABELS: Record<OrientacionCaseEstado, string> = {
  recibido: "Recibido",
  en_analisis: "En análisis",
  diagnostico_solicitado: "Diagnóstico solicitado",
  plan_definido: "Plan definido",
  derivado_trabajo_social: "Derivado a Trabajo Social",
  escalado_direccion: "Escalado a Dirección",
  cerrado: "Cerrado",
};

export const ORIENTACION_PRIORITY_LABELS: Record<OrientacionCasePrioridad, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
  critica: "Crítica",
};

export const ORIENTACION_PRIORITY_STYLES: Record<OrientacionCasePrioridad, string> = {
  baja: "bg-emerald-500/15 text-emerald-200 border-emerald-400/20",
  media: "bg-violet-500/15 text-violet-200 border-violet-400/20",
  alta: "bg-amber-500/15 text-amber-200 border-amber-400/20",
  critica: "bg-rose-500/15 text-rose-200 border-rose-400/20",
};

export const ORIENTACION_STATE_STYLES: Record<OrientacionCaseEstado, string> = {
  recibido: "bg-slate-500/15 text-slate-200 border-slate-400/20",
  en_analisis: "bg-cyan-500/15 text-cyan-200 border-cyan-400/20",
  diagnostico_solicitado: "bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-400/20",
  plan_definido: "bg-indigo-500/15 text-indigo-200 border-indigo-400/20",
  derivado_trabajo_social: "bg-amber-500/15 text-amber-200 border-amber-400/20",
  escalado_direccion: "bg-rose-500/15 text-rose-200 border-rose-400/20",
  cerrado: "bg-emerald-500/15 text-emerald-200 border-emerald-400/20",
};
