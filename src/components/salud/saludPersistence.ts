import { supabase } from "../../supabase/client";
import type {
  HealthAlertRecord,
  HealthAlertType,
  HealthMemory,
  MedicalAttentionRecord,
  MedicalAttentionStatus,
  MedicalExitType,
  MedicalUrgency,
  RegisterHealthAlertInput,
  RegisterMedicalAttentionInput,
  UpdateMedicalAttentionInput,
} from "./saludTypes";

type MedicalAttentionRow = {
  id: string;
  alumno_id: string;
  nombre_alumno: string | null;
  grupo: string | null;
  motivo: string | null;
  sintomas: string;
  diagnostico: string | null;
  signos_vitales: string | null;
  atencion_brindada: string | null;
  tratamiento: string;
  medicamento: string | null;
  notificacion_padres: string | null;
  acudieron_por_el: string | null;
  condiciones_entrega: string | null;
  observaciones: string | null;
  estado_atencion: string;
  nivel_urgencia: string;
  fecha_seguimiento: string | null;
  tipo_salida: string | null;
  atendido_por: string | null;
  generado_por: string | null;
  hora: string;
  updated_at: string;
};

type HealthAlertRow = {
  id: string;
  alumno_id: string;
  tipo_alerta: string;
  padecimiento: string | null;
  alergias: string | null;
  medicamentos: string | null;
  indicaciones: string | null;
  activa: boolean;
  actualizado_por: string | null;
  created_at: string;
  ultima_actualizacion: string;
};

const attentionStatuses: MedicalAttentionStatus[] = [
  "abierta",
  "observacion",
  "referida",
  "cerrada",
];

const urgencies: MedicalUrgency[] = [
  "baja",
  "media",
  "alta",
  "emergencia",
];

const exitTypes: MedicalExitType[] = [
  "regreso_clase",
  "entrega_familiar",
  "referencia_medica",
  "emergencia",
];

const alertTypes: HealthAlertType[] = [
  "padecimiento",
  "alergia",
  "medicamento",
  "otra",
];

const isAttentionStatus = (
  value: string,
): value is MedicalAttentionStatus =>
  attentionStatuses.includes(value as MedicalAttentionStatus);

const isUrgency = (value: string): value is MedicalUrgency =>
  urgencies.includes(value as MedicalUrgency);

const isExitType = (value: string): value is MedicalExitType =>
  exitTypes.includes(value as MedicalExitType);

const isAlertType = (value: string): value is HealthAlertType =>
  alertTypes.includes(value as HealthAlertType);

const parseDatabaseBoolean = (value: string | null) =>
  value?.trim().toLowerCase() === "true";

const authenticatedUserId = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.id) {
    throw new Error("La sesión institucional no está disponible.");
  }
  return data.user.id;
};

const mapAttention = (
  row: MedicalAttentionRow,
): MedicalAttentionRecord => {
  if (
    !row.id
    || !row.alumno_id
    || !row.hora
    || !row.updated_at
    || !isAttentionStatus(row.estado_atencion)
    || !isUrgency(row.nivel_urgencia)
    || (row.tipo_salida !== null && !isExitType(row.tipo_salida))
  ) {
    throw new Error("Supabase devolvió una atención médica incompleta.");
  }

  return {
    id: row.id,
    studentId: row.alumno_id,
    studentName: row.nombre_alumno,
    group: row.grupo,
    reason: row.motivo?.trim() || "Motivo no documentado",
    symptoms: row.sintomas?.trim() || "Observación no documentada",
    assessment: row.diagnostico,
    vitalSigns: row.signos_vitales,
    careProvided:
      row.atencion_brindada?.trim()
      || row.tratamiento?.trim()
      || "Atención no documentada",
    medication: row.medicamento,
    familyNotified: parseDatabaseBoolean(row.notificacion_padres),
    familyPickedUp: parseDatabaseBoolean(row.acudieron_por_el),
    deliveryConditions: row.condiciones_entrega,
    observations: row.observaciones,
    status: row.estado_atencion,
    urgency: row.nivel_urgencia,
    followUpDate: row.fecha_seguimiento,
    exitType: row.tipo_salida as MedicalExitType | null,
    attendedBy: row.atendido_por,
    createdBy: row.generado_por,
    occurredAt: row.hora,
    updatedAt: row.updated_at,
  };
};

const mapAlert = (row: HealthAlertRow): HealthAlertRecord => {
  if (
    !row.id
    || !row.alumno_id
    || !row.created_at
    || !row.ultima_actualizacion
    || !isAlertType(row.tipo_alerta)
  ) {
    throw new Error("Supabase devolvió una alerta clínica incompleta.");
  }

  const condition = row.padecimiento?.trim()
    || row.alergias?.trim()
    || row.medicamentos?.trim()
    || "Alerta clínica sin descripción";

  return {
    id: row.id,
    studentId: row.alumno_id,
    type: row.tipo_alerta,
    condition,
    allergies: row.alergias,
    medications: row.medicamentos,
    instructions: row.indicaciones,
    active: row.activa,
    updatedBy: row.actualizado_por,
    createdAt: row.created_at,
    updatedAt: row.ultima_actualizacion,
  };
};

const attentionColumns =
  "id, alumno_id, nombre_alumno, grupo, motivo, sintomas, diagnostico, signos_vitales, atencion_brindada, tratamiento, medicamento, notificacion_padres, acudieron_por_el, condiciones_entrega, observaciones, estado_atencion, nivel_urgencia, fecha_seguimiento, tipo_salida, atendido_por, generado_por, hora, updated_at";

const alertColumns =
  "id, alumno_id, tipo_alerta, padecimiento, alergias, medicamentos, indicaciones, activa, actualizado_por, created_at, ultima_actualizacion";

export const loadHealthMemory = async (
  studentIds: string[],
): Promise<HealthMemory> => {
  if (studentIds.length === 0) {
    return { attentions: [], alerts: [] };
  }

  await authenticatedUserId();

  const [attentionsResult, alertsResult] = await Promise.all([
    supabase
      .from("atenciones_medicas")
      .select(attentionColumns)
      .in("alumno_id", studentIds)
      .order("hora", { ascending: false }),
    supabase
      .from("salud")
      .select(alertColumns)
      .in("alumno_id", studentIds)
      .eq("activa", true)
      .order("ultima_actualizacion", { ascending: false }),
  ]);

  if (attentionsResult.error) throw attentionsResult.error;
  if (alertsResult.error) throw alertsResult.error;

  return {
    attentions: (attentionsResult.data ?? []).map((row) =>
      mapAttention(row as MedicalAttentionRow)
    ),
    alerts: (alertsResult.data ?? []).map((row) =>
      mapAlert(row as HealthAlertRow)
    ),
  };
};

export const persistMedicalAttention = async (
  input: RegisterMedicalAttentionInput,
): Promise<MedicalAttentionRecord> => {
  const userId = await authenticatedUserId();

  const { data, error } = await supabase
    .from("atenciones_medicas")
    .insert({
      alumno_id: input.studentId,
      nombre_alumno: input.studentName.trim(),
      grupo: input.group.trim(),
      motivo: input.reason.trim(),
      sintomas: input.symptoms.trim(),
      diagnostico: input.assessment?.trim() || null,
      signos_vitales: input.vitalSigns?.trim() || null,
      atencion_brindada: input.careProvided.trim(),
      tratamiento: input.careProvided.trim(),
      medicamento: input.medication?.trim() || null,
      notificacion_padres: String(input.familyNotified),
      acudieron_por_el: String(input.familyPickedUp),
      condiciones_entrega: input.deliveryConditions?.trim() || null,
      observaciones: input.observations?.trim() || null,
      estado_atencion: input.status,
      nivel_urgencia: input.urgency,
      fecha_seguimiento: input.followUpDate || null,
      tipo_salida: input.exitType || null,
      generado_por: userId,
      atendido_por: userId,
      hora: new Date().toISOString(),
    })
    .select(attentionColumns)
    .single();

  if (error) throw error;
  if (!data) {
    throw new Error("Supabase no confirmó la atención médica.");
  }
  return mapAttention(data as MedicalAttentionRow);
};

export const persistHealthAlert = async (
  input: RegisterHealthAlertInput,
): Promise<HealthAlertRecord> => {
  const userId = await authenticatedUserId();
  const condition = input.condition.trim();

  const { data, error } = await supabase
    .from("salud")
    .insert({
      alumno_id: input.studentId,
      tipo_alerta: input.type,
      padecimiento: condition,
      alergias: input.type === "alergia" ? condition : null,
      medicamentos: input.type === "medicamento" ? condition : null,
      indicaciones: input.instructions.trim(),
      activa: true,
      actualizado_por: userId,
    })
    .select(alertColumns)
    .single();

  if (error) throw error;
  if (!data) {
    throw new Error("Supabase no confirmó la alerta clínica.");
  }
  return mapAlert(data as HealthAlertRow);
};

export const updateMedicalAttention = async (
  attentionId: string,
  input: UpdateMedicalAttentionInput,
): Promise<MedicalAttentionRecord> => {
  await authenticatedUserId();

  const { data, error } = await supabase
    .from("atenciones_medicas")
    .update({
      estado_atencion: input.status,
      fecha_seguimiento: input.followUpDate || null,
      condiciones_entrega: input.deliveryConditions?.trim() || null,
      observaciones: input.observations?.trim() || null,
      tipo_salida: input.exitType || null,
    })
    .eq("id", attentionId)
    .select(attentionColumns)
    .single();

  if (error) throw error;
  if (!data) {
    throw new Error("Supabase no confirmó el seguimiento médico.");
  }
  return mapAttention(data as MedicalAttentionRow);
};

export const deactivateHealthAlert = async (
  alertId: string,
): Promise<HealthAlertRecord> => {
  await authenticatedUserId();

  const { data, error } = await supabase
    .from("salud")
    .update({ activa: false })
    .eq("id", alertId)
    .select(alertColumns)
    .single();

  if (error) throw error;
  if (!data) {
    throw new Error("Supabase no confirmó el cierre de la alerta clínica.");
  }
  return mapAlert(data as HealthAlertRow);
};
