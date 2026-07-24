import { supabase } from "../../supabase/client";
import type { BAPInfo } from "../../types";
import type {
  BapEventType,
  BapStatus,
  BapTrackingRecord,
  PersistedBapEvent,
  RegisterBapEventInput,
} from "./udeiiTypes";

type BapRow = {
  id: string;
  alumno_id: string;
  tipo_evento: string;
  tipo_bap: string;
  ajuste_razonable: string;
  estatus: string;
  observaciones: string | null;
  responsable: string | null;
  fecha_revision: string | null;
  creado_por: string | null;
  creado_en: string | null;
};

const eventTypes: BapEventType[] = [
  "deteccion",
  "ajuste",
  "seguimiento",
  "revision",
  "cierre",
];

const statuses: BapStatus[] = [
  "activo",
  "en_seguimiento",
  "cumplido",
  "cerrado",
  "cancelado",
];

const isEventType = (value: string): value is BapEventType =>
  eventTypes.includes(value as BapEventType);

const isStatus = (value: string): value is BapStatus =>
  statuses.includes(value as BapStatus);

const authenticatedUserId = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.id) {
    throw new Error("La sesión institucional no está disponible.");
  }
  return data.user.id;
};

const mapRecord = (row: BapRow): BapTrackingRecord => {
  if (
    !row.id
    || !row.alumno_id
    || !isEventType(row.tipo_evento)
    || !isStatus(row.estatus)
  ) {
    throw new Error("Supabase devolvió un seguimiento BAP incompleto.");
  }

  return {
    id: row.id,
    studentId: row.alumno_id,
    eventType: row.tipo_evento,
    barrierType: row.tipo_bap,
    action: row.ajuste_razonable,
    status: row.estatus,
    observations: row.observaciones,
    responsible: row.responsable || "Responsable no documentado",
    reviewDate: row.fecha_revision,
    authorId: row.creado_por,
    createdAt: row.creado_en,
  };
};

const mapBapInfo = (value: unknown): BAPInfo => {
  const snapshot = value && typeof value === "object"
    ? value as Record<string, unknown>
    : {};

  return {
    hasBAP: snapshot.hasBAP === true,
    diagnosisPrivate:
      typeof snapshot.diagnosisPrivate === "string"
        ? snapshot.diagnosisPrivate
        : "",
    accommodations: Array.isArray(snapshot.accommodations)
      ? snapshot.accommodations.filter(
        (item): item is string => typeof item === "string",
      )
      : [],
    lastUpdated:
      typeof snapshot.lastUpdated === "string"
        ? snapshot.lastUpdated
        : "",
  };
};

export const loadBapTracking = async (
  studentIds: string[],
): Promise<BapTrackingRecord[]> => {
  if (studentIds.length === 0) return [];

  await authenticatedUserId();

  const { data, error } = await supabase
    .from("seguimiento_bap")
    .select(
      "id, alumno_id, tipo_evento, tipo_bap, ajuste_razonable, estatus, observaciones, responsable, fecha_revision, creado_por, creado_en",
    )
    .in("alumno_id", studentIds)
    .order("creado_en", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapRecord(row));
};

export const persistBapEvent = async (
  input: RegisterBapEventInput,
): Promise<PersistedBapEvent> => {
  await authenticatedUserId();

  const { data, error } = await supabase
    .rpc("registrar_evento_bap", {
      p_alumno_id: input.studentId,
      p_tipo_evento: input.eventType,
      p_tipo_bap: input.barrierType.trim(),
      p_ajuste_razonable: input.action.trim(),
      p_estatus: input.status,
      p_observaciones: input.observations?.trim() || undefined,
      p_responsable: input.responsible.trim(),
      p_fecha_revision: input.reviewDate || undefined,
    })
    .single();

  if (error) throw error;
  if (!data) {
    throw new Error("Supabase no confirmó el seguimiento BAP.");
  }

  return {
    record: mapRecord(data),
    bapInfo: mapBapInfo(data.datos_bap),
  };
};
