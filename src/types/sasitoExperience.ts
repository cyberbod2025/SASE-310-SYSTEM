export type IncidenceType =
  | "academica"
  | "conductual"
  | "seguridad"
  | "socioemocional"
  | "familiar"
  | "inclusion_bap"
  | "seguimiento";

export type RiskLevel = "verde" | "amarillo" | "rojo";

export type MomentOfRisk =
  | "inicio_clase"
  | "despues_receso"
  | "cambio_clase"
  | "trabajo_equipo"
  | "entrega_evidencia"
  | "cierre_clase"
  | "pasillo_o_patio";

export interface SasitoExperience {
  id: string;
  nombre: string;
  tipo: IncidenceType;
  senales: readonly string[];
  riesgoBase: RiskLevel;
  accionesRecomendadas: readonly string[];
  noHacer: readonly string[];
  plantillaSugerida?: string;
  activo: boolean;
}

export interface SasitoIncidentInput {
  conducta: string;
  descripcion?: string;
  experienciaId?: string;
  reincidenciasPrevias?: number;
  esReincidencia?: boolean;
  momento?: MomentOfRisk;
}

export interface SasitoRecommendation {
  experienciaId?: string;
  experienciaNombre?: string;
  tipo: IncidenceType;
  riesgo: RiskLevel;
  accionesRecomendadas: string[];
  noHacer: string[];
  plantillaSugerida?: string;
  requiereEscalamiento: boolean;
  reglaAplicada: string;
  revisionHumana: boolean;
}
