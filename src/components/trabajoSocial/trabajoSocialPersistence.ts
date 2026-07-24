import { supabase } from "../../supabase/client";
import type {
  CitatorioRecord,
  ComplianceAgreement,
  ComplianceStatus,
  ContactType,
  FamilyContactRecord,
  HomeVisitRecord,
  SocialInterventionRecord,
} from "./trabajoSocialTypes";

type InterventionInput = {
  studentId: string;
  reason: string;
  result?: string;
  notes?: string;
};

const authenticatedUserId = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("La sesión institucional no está disponible.");
  return data.user.id;
};

export const persistFamilyContact = async (input: {
  studentId: string;
  method: string;
  outcome: string;
}) => {
  const userId = await authenticatedUserId();
  const { error } = await supabase.from("contacts_log").insert({
    student_id: input.studentId,
    user_id: userId,
    method: input.method,
    outcome: input.outcome,
    notes: "Registro de contacto familiar desde Trabajo Social.",
  }).select("id").single();
  if (error) throw error;
};

export const persistCitatorio = async (input: {
  studentId: string;
  date: string;
  reason: string;
}) => {
  const userId = await authenticatedUserId();
  const { data, error } = await supabase.from("citas_padres").insert({
    alumno_id: input.studentId,
    creado_por: userId,
    fecha_cita: `${input.date}T09:00:00.000Z`,
    motivo: input.reason,
    observaciones: "Citatorio registrado desde Trabajo Social.",
  }).select("id").single();
  if (error) throw error;
  return data.id;
};

export const persistCitatorioAttendance = async (citatorioId: string) => {
  const { error } = await supabase
    .from("citas_padres")
    .update({ estado: "asistio" })
    .eq("id", citatorioId)
    .select("id")
    .single();
  if (error) throw error;
};

export const persistIntervention = async (input: InterventionInput) => {
  const userId = await authenticatedUserId();
  const { data, error } = await supabase
    .from("interventions_log")
    .insert({
      student_id: input.studentId,
      user_id: userId,
      reason: input.reason,
      result: input.result || null,
      notes: input.notes || null,
    })
    .select("id, student_id, created_at, reason, result, notes")
    .single();
  if (error) throw error;
  return {
    id: data.id,
    caseId: data.student_id || input.studentId,
    fecha: data.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    accion: data.reason || input.reason,
    resultado: data.result || input.result || "registrado",
    notas: data.notes,
  } satisfies SocialInterventionRecord;
};

const metadataObject = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};

const complianceStatus = (value: string | null): ComplianceStatus =>
  value === "cumplido" || value === "incumplido" ? value : "en_proceso";

const contactType = (value: string | null): ContactType =>
  value === "mensaje" || value === "reunion" ? value : "llamada";

export const loadSocialTracking = async (studentIds: string[]): Promise<{
  citatorios: CitatorioRecord[];
  contacts: FamilyContactRecord[];
  visits: HomeVisitRecord[];
  agreements: ComplianceAgreement[];
  interventions: SocialInterventionRecord[];
}> => {
  if (studentIds.length === 0) {
    return { citatorios: [], contacts: [], visits: [], agreements: [], interventions: [] };
  }

  const [socialResult, contactsResult, citatoriosResult, interventionsResult] = await Promise.all([
    supabase
      .from("seguimiento_social")
      .select("id, alumno_id, tipo_evento, seguimiento, acuerdos, estatus, fecha, metadata")
      .in("alumno_id", studentIds)
      .in("tipo_evento", ["visita_domiciliaria", "acuerdo"])
      .order("fecha", { ascending: false }),
    supabase
      .from("contacts_log")
      .select("id, student_id, created_at, method, outcome")
      .in("student_id", studentIds)
      .order("created_at", { ascending: false }),
    supabase
      .from("citas_padres")
      .select("id, alumno_id, fecha_cita, estado")
      .in("alumno_id", studentIds)
      .order("fecha_cita", { ascending: true }),
    supabase
      .from("interventions_log")
      .select("id, student_id, created_at, reason, result, notes")
      .in("student_id", studentIds)
      .order("created_at", { ascending: false }),
  ]);

  if (socialResult.error) throw socialResult.error;
  if (contactsResult.error) throw contactsResult.error;
  if (citatoriosResult.error) throw citatoriosResult.error;
  if (interventionsResult.error) throw interventionsResult.error;

  const citatorios: CitatorioRecord[] = [];
  const contacts: FamilyContactRecord[] = contactsResult.data
    .filter((record) => Boolean(record.student_id))
    .map((record) => ({
      id: record.id,
      caseId: record.student_id as string,
      fecha: record.created_at?.slice(0, 10) || "",
      tipo: contactType(record.method),
      resultado: record.outcome || "Contacto familiar registrado.",
    }));
  const visits: HomeVisitRecord[] = [];
  const agreements: ComplianceAgreement[] = [];
  const interventions: SocialInterventionRecord[] = interventionsResult.data
    .filter((record) => Boolean(record.student_id))
    .map((record) => ({
      id: record.id,
      caseId: record.student_id as string,
      fecha: record.created_at?.slice(0, 10) || "",
      accion: record.reason || "Intervención registrada",
      resultado: record.result || "registrado",
      notas: record.notes,
    }));
  const citatorioCountByStudent = new Map<string, number>();

  for (const record of citatoriosResult.data) {
    const number = (citatorioCountByStudent.get(record.alumno_id) || 0) + 1;
    citatorioCountByStudent.set(record.alumno_id, number);
    citatorios.push({
      id: record.id,
      caseId: record.alumno_id,
      numero: number,
      fecha: record.fecha_cita.slice(0, 10),
      respuesta: record.estado === "asistio"
        ? "asistio"
        : record.estado === "reprogramado"
          ? "reprogramado"
          : "sin_respuesta",
    });
  }

  for (const record of socialResult.data) {
    const metadata = metadataObject(record.metadata);
    if (record.tipo_evento === "visita_domiciliaria") {
      visits.push({
        id: record.id,
        caseId: record.alumno_id,
        fecha: record.fecha?.slice(0, 10) || "",
        observaciones: record.seguimiento || "Visita domiciliaria registrada.",
        contextoFamiliar: typeof metadata.contexto_familiar === "string"
          ? metadata.contexto_familiar
          : "Contexto familiar reservado para expediente institucional.",
      });
    }

    if (record.tipo_evento === "acuerdo") {
      agreements.push({
        id: record.id,
        caseId: record.alumno_id,
        acuerdo: record.acuerdos || "Acuerdo institucional registrado.",
        responsable: typeof metadata.responsable === "string"
          ? metadata.responsable
          : "Por definir",
        estado: complianceStatus(record.estatus),
      });
    }
  }

  return { citatorios, contacts, visits, agreements, interventions };
};

export const persistHomeVisit = async (input: {
  studentId: string;
  observations: string;
  familyContext?: string;
}): Promise<HomeVisitRecord> => {
  const userId = await authenticatedUserId();
  const { data, error } = await supabase
    .from("seguimiento_social")
    .insert({
      alumno_id: input.studentId,
      creado_por: userId,
      tipo_evento: "visita_domiciliaria",
      motivo: "Visita domiciliaria",
      seguimiento: input.observations,
      estatus: "realizada",
      es_sensible: true,
      metadata: {
        contexto_familiar: input.familyContext || "Contexto familiar reservado para expediente institucional.",
      },
    })
    .select("id, alumno_id, fecha, seguimiento, metadata")
    .single();

  if (error) throw error;
  const metadata = metadataObject(data.metadata);
  return {
    id: data.id,
    caseId: data.alumno_id,
    fecha: data.fecha?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    observaciones: data.seguimiento || input.observations,
    contextoFamiliar: typeof metadata.contexto_familiar === "string"
      ? metadata.contexto_familiar
      : "Contexto familiar reservado para expediente institucional.",
  };
};

export const persistAgreement = async (input: {
  studentId: string;
  agreement: string;
  responsible: string;
}): Promise<ComplianceAgreement> => {
  const userId = await authenticatedUserId();
  const { data, error } = await supabase
    .from("seguimiento_social")
    .insert({
      alumno_id: input.studentId,
      creado_por: userId,
      tipo_evento: "acuerdo",
      motivo: "Acuerdo de corresponsabilidad",
      acuerdos: input.agreement,
      seguimiento: `Responsable: ${input.responsible}`,
      estatus: "en_proceso",
      es_sensible: true,
      metadata: { responsable: input.responsible },
    })
    .select("id, alumno_id, acuerdos, estatus, metadata")
    .single();

  if (error) throw error;
  const metadata = metadataObject(data.metadata);
  return {
    id: data.id,
    caseId: data.alumno_id,
    acuerdo: data.acuerdos || input.agreement,
    responsable: typeof metadata.responsable === "string"
      ? metadata.responsable
      : input.responsible,
    estado: complianceStatus(data.estatus),
  };
};

export const persistAgreementStatus = async (
  agreementId: string,
  status: ComplianceStatus,
) => {
  const { error } = await supabase
    .from("seguimiento_social")
    .update({ estatus: status })
    .eq("id", agreementId)
    .select("id")
    .single();

  if (error) throw error;
};
