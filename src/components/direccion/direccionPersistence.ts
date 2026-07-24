import { supabase } from "../../supabase/client";

export interface DirectionPanoramaItem {
  studentId: string;
  enrollment: string;
  studentName: string;
  group: string;
  riskScore: number;
  semaphoreState: string;
  openIncidents: number;
  lastIncidentAt: string | null;
  orientationCaseId: string | null;
  orientationState: string | null;
  orientationPriority: string | null;
  orientationUpdatedAt: string | null;
  orientationFollowUps: number;
  teacherDiagnoses: number;
  activeOrientationPlans: number;
  nextOrientationReview: string | null;
  openSocialWorkItems: number;
  socialWorkUpdatedAt: string | null;
  pendingBapItems: number;
  nextBapReview: string | null;
  pendingHealthFollowUps: number;
  nextHealthReview: string | null;
  totalPendingItems: number;
  nextActionDate: string | null;
  recentlyUpdatedAt: string | null;
  requiresAttention: boolean;
  attentionReasons: string[];
  activeSources: string[];
}

const toCount = (value: unknown) => {
  const count = Number(value);
  return Number.isFinite(count) && count >= 0 ? count : 0;
};

const nullableString = (value: unknown) =>
  typeof value === "string" && value.trim() ? value : null;

const stringList = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

const mapPanoramaRow = (row: any): DirectionPanoramaItem => {
  if (
    typeof row?.alumno_id !== "string" ||
    typeof row?.nombre_alumno !== "string" ||
    typeof row?.matricula !== "string" ||
    typeof row?.grupo !== "string"
  ) {
    throw new Error("Supabase devolvió un panorama de Dirección inválido.");
  }

  return {
    studentId: row.alumno_id,
    enrollment: row.matricula,
    studentName: row.nombre_alumno,
    group: row.grupo,
    riskScore: toCount(row.puntaje_riesgo),
    semaphoreState:
      nullableString(row.estado_semaforo) ?? "NO_DOCUMENTADO",
    openIncidents: toCount(row.incidencias_abiertas),
    lastIncidentAt: nullableString(row.ultima_incidencia),
    orientationCaseId: nullableString(row.caso_orientacion_id),
    orientationState: nullableString(row.estado_orientacion),
    orientationPriority: nullableString(row.prioridad_orientacion),
    orientationUpdatedAt: nullableString(row.actualizacion_orientacion),
    orientationFollowUps: toCount(row.seguimientos_orientacion),
    teacherDiagnoses: toCount(row.diagnosticos_docentes),
    activeOrientationPlans: toCount(row.planes_orientacion_activos),
    nextOrientationReview: nullableString(
      row.proxima_revision_orientacion,
    ),
    openSocialWorkItems: toCount(row.trabajo_social_abiertos),
    socialWorkUpdatedAt: nullableString(
      row.ultima_actualizacion_social,
    ),
    pendingBapItems: toCount(row.bap_pendientes),
    nextBapReview: nullableString(row.proxima_revision_bap),
    pendingHealthFollowUps: toCount(
      row.salud_seguimientos_pendientes,
    ),
    nextHealthReview: nullableString(row.proxima_revision_salud),
    totalPendingItems: toCount(row.total_pendientes),
    nextActionDate: nullableString(row.proxima_accion),
    recentlyUpdatedAt: nullableString(row.actualizacion_reciente),
    requiresAttention: row.requiere_atencion === true,
    attentionReasons: stringList(row.razones_atencion),
    activeSources: stringList(row.fuentes_activas),
  };
};

export const loadDirectionPanorama = async (): Promise<
  DirectionPanoramaItem[]
> => {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user?.id) {
    throw new Error("La sesión institucional no está disponible.");
  }

  const { data, error } = await supabase.rpc(
    "obtener_panorama_direccion",
  );
  if (error) throw error;
  if (!Array.isArray(data)) {
    throw new Error("Supabase no confirmó el panorama de Dirección.");
  }

  return data.map(mapPanoramaRow);
};
