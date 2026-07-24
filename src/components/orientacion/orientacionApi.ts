import { supabase } from "../../supabase/client";
import type {
  OrientacionCasePrioridad,
  OrientacionCaseSummary,
  OrientacionDiagnosisRequest,
  OrientacionDocenteOption,
  OrientacionFollowUp,
  OrientacionHistoryItem,
  OrientacionPlan,
  OrientacionStudentSummary,
} from "./orientacionTypes";

const selectStudentFields = "id, nombre_completo, grupo, matricula, puntaje_riesgo, estado_semaforo";

export async function loadOrientacionCasos(): Promise<OrientacionCaseSummary[]> {
  const { data: casos, error } = await supabase
    .from("orientacion_casos")
    .select("id, alumno_id, creado_por, responsable_id, estado, prioridad, motivo, resumen, fecha_apertura, fecha_actualizacion")
    .order("fecha_actualizacion", { ascending: false });

  if (error) throw error;

  const casosRows = (casos ?? []) as any[];
  const alumnoIds = Array.from(new Set(casosRows.map((item) => item.alumno_id)));
  const alumnosResult = alumnoIds.length
    ? await supabase
        .from("alumnos" as any)
        .select(selectStudentFields)
        .in("id", alumnoIds)
    : { data: [] as any[], error: null };

  if (alumnosResult.error) throw alumnosResult.error;

  const alumnosById = new Map<string, any>(
    ((alumnosResult.data ?? []) as any[]).map((item) => [item.id, item]),
  );

  return casosRows.map((caso) => {
    const alumno = alumnosById.get(caso.alumno_id);
    return {
      id: caso.id,
      alumnoId: caso.alumno_id,
      alumnoNombre: alumno?.nombre_completo ?? "Alumno no disponible",
      grupo: alumno?.grupo ?? null,
      matricula: alumno?.matricula ?? null,
      estado: caso.estado as OrientacionCaseSummary["estado"],
      prioridad: caso.prioridad as OrientacionCasePrioridad,
      motivo: caso.motivo,
      resumen: caso.resumen,
      fechaApertura: caso.fecha_apertura,
      fechaActualizacion: caso.fecha_actualizacion,
      responsableId: caso.responsable_id,
    };
  });
}

export async function loadDocentes(): Promise<OrientacionDocenteOption[]> {
  const { data, error } = await supabase
    .from("perfiles_usuario" as any)
    .select("id, nombre_completo, rol")
    .in("rol", ["docente", "docente_tutor"])
    .order("nombre_completo", { ascending: true });

  if (error) throw error;

  return ((data ?? []) as any[]).map((item) => ({
    id: item.id,
    nombreCompleto:
      item.nombre_completo ?? "Docente sin nombre documentado",
    rol: item.rol ?? "docente",
  }));
}

export async function loadStudentHistory(studentId: string, caseId?: string): Promise<{
  summary: any | null;
  incidents: OrientacionHistoryItem[];
  citations: OrientacionHistoryItem[];
  contacts: OrientacionHistoryItem[];
  interventions: OrientacionHistoryItem[];
  teacherReports: OrientacionHistoryItem[];
  plans: OrientacionPlan[];
  requests: OrientacionDiagnosisRequest[];
  followUps: OrientacionFollowUp[];
}> {
  const [summaryResult, incidentsResult, citationsResult, contactsResult, interventionsResult, teacherReportsResult, plansResult, requestsResult, followUpsResult] = await Promise.all([
    supabase
      .from("expediente_integral_alumno" as any)
      .select("alumno_id, total_incidencias, total_justificantes")
      .eq("alumno_id", studentId)
      .maybeSingle(),
    supabase.from("incidencias" as any).select("id, fecha, tipo, descripcion, estado").eq("alumno_id", studentId).order("fecha", { ascending: false }).limit(5),
    supabase.from("citas_padres" as any).select("id, created_at, fecha_cita, motivo, estado").eq("alumno_id", studentId).order("fecha_cita", { ascending: false }).limit(5),
    supabase.from("contacts_log" as any).select("id, created_at, method, notes, outcome").eq("student_id", studentId).order("created_at", { ascending: false }).limit(5),
    supabase.from("interventions_log" as any).select("id, created_at, reason, notes, result").eq("student_id", studentId).order("created_at", { ascending: false }).limit(5),
    caseId
      ? supabase
          .from("diagnosticos_docentes")
          .select("id, created_at, conducta, aprovechamiento, asistencia, observaciones, recomendaciones")
          .eq("caso_id", caseId)
          .order("created_at", { ascending: false })
          .limit(5)
      : supabase
          .from("diagnosticos_docentes")
          .select("id, created_at, conducta, aprovechamiento, asistencia, observaciones, recomendaciones")
          .eq("caso_id", "00000000-0000-0000-0000-000000000000"),
    caseId
      ? supabase.from("planes_intervencion" as any).select("*").eq("caso_id", caseId).order("fecha_inicio", { ascending: false })
      : supabase.from("planes_intervencion" as any).select("*").eq("caso_id", "00000000-0000-0000-0000-000000000000"),
    caseId
      ? supabase.from("solicitudes_diagnostico" as any).select("*").eq("caso_id", caseId).order("fecha_solicitud", { ascending: false })
      : supabase.from("solicitudes_diagnostico" as any).select("*").eq("caso_id", "00000000-0000-0000-0000-000000000000"),
    caseId
      ? supabase.from("seguimiento_orientacion" as any).select("*").eq("caso_id", caseId).order("created_at", { ascending: false }).limit(20)
      : supabase.from("seguimiento_orientacion" as any).select("*").eq("caso_id", "00000000-0000-0000-0000-000000000000"),
  ]);

  if (incidentsResult.error) throw incidentsResult.error;
  if (citationsResult.error) throw citationsResult.error;
  if (contactsResult.error) throw contactsResult.error;
  if (interventionsResult.error) throw interventionsResult.error;
  if (teacherReportsResult.error) throw teacherReportsResult.error;
  if (plansResult.error) throw plansResult.error;
  if (requestsResult.error) throw requestsResult.error;
  if (followUpsResult.error) throw followUpsResult.error;
  if (summaryResult.error) throw summaryResult.error;

  const incidentsRows = (incidentsResult.data ?? []) as any[];
  const citationsRows = (citationsResult.data ?? []) as any[];
  const contactsRows = (contactsResult.data ?? []) as any[];
  const interventionsRows = (interventionsResult.data ?? []) as any[];
  const teacherReportRows = (teacherReportsResult.data ?? []) as any[];
  const plansRows = (plansResult.data ?? []) as any[];
  const requestsRows = (requestsResult.data ?? []) as any[];
  const followUpRows = (followUpsResult.data ?? []) as any[];

  return {
    summary: summaryResult.data ?? null,
    incidents: incidentsRows.map((item) => ({
      id: item.id,
      fecha: item.fecha ?? null,
      titulo: item.tipo ?? "Incidencia",
      detalle: item.descripcion ?? "Sin descripción",
      fuente: `Estado: ${item.estado ?? "No documentado"}`,
    })),
    citations: citationsRows.map((item) => ({
      id: item.id,
      fecha: item.fecha_cita ?? item.created_at ?? null,
      titulo: item.motivo ?? "Citatorio",
      detalle: `Estado: ${item.estado ?? "No documentado"}`,
      fuente: "Citas a familias",
    })),
    contacts: contactsRows.map((item) => ({
      id: item.id,
      fecha: item.created_at ?? null,
      titulo: item.method ?? "Contacto sin método documentado",
      detalle: item.notes ?? item.outcome ?? "Sin nota documentada",
      fuente: "Bitácora de contactos",
    })),
    interventions: interventionsRows.map((item) => ({
      id: item.id,
      fecha: item.created_at ?? null,
      titulo: item.reason ?? "Intervención sin motivo documentado",
      detalle: item.notes ?? item.result ?? "Sin resultado documentado",
      fuente: "Bitácora institucional",
    })),
    teacherReports: teacherReportRows.map((item) => ({
      id: item.id,
      fecha: item.created_at ?? null,
      titulo: "Diagnóstico docente del caso",
      detalle: [
        item.conducta ? `Conducta: ${item.conducta}` : null,
        item.aprovechamiento
          ? `Aprovechamiento: ${item.aprovechamiento}`
          : null,
        item.asistencia ? `Asistencia: ${item.asistencia}` : null,
        item.observaciones,
        item.recomendaciones,
      ].filter(Boolean).join(" · ") || "Sin observaciones documentadas",
      fuente: "Diagnósticos docentes asignados",
    })),
    plans: plansRows.map((item) => ({
      id: item.id,
      casoId: item.caso_id,
      objetivo: item.objetivo,
      acciones: item.acciones,
      responsable: item.responsable,
      fechaInicio: item.fecha_inicio,
      fechaRevision: item.fecha_revision,
      estado: item.estado,
    })),
    requests: requestsRows.map((item) => ({
      id: item.id,
      casoId: item.caso_id,
      alumnoId: item.alumno_id,
      docenteId: item.docente_id,
      estado: item.estado,
      fechaSolicitud: item.fecha_solicitud,
      fechaRespuesta: item.fecha_respuesta,
      observaciones: item.observaciones,
    })),
    followUps: followUpRows.map((item) => ({
      id: item.id,
      casoId: item.caso_id,
      tipo: item.tipo,
      descripcion: item.descripcion,
      evidenciaUrl: item.evidencia_url,
      createdBy: item.created_by,
      createdAt: item.created_at,
    })),
  };
}

export async function abrirCasoOrientacion(params: {
  alumnoId: string;
  motivo: string;
  resumen?: string | null;
  prioridad?: OrientacionCasePrioridad;
  responsableId?: string | null;
}): Promise<string> {
  const { data, error } = await supabase.rpc("abrir_caso_orientacion", {
    p_alumno_id: params.alumnoId,
    p_motivo: params.motivo,
    p_resumen: params.resumen ?? null,
    p_prioridad: params.prioridad ?? "media",
    p_responsable_id: params.responsableId ?? null,
  });

  if (error) throw error;
  return data;
}

export async function solicitarDiagnostico(params: {
  docenteId: string;
  casoId: string;
  observaciones?: string | null;
}): Promise<string> {
  const { data, error } = await supabase.rpc("solicitar_diagnostico", {
    p_docente_id: params.docenteId,
    p_caso_id: params.casoId,
    p_observaciones: params.observaciones ?? null,
  });
  if (error) throw error;
  return data;
}

export async function registrarDiagnostico(params: {
  solicitudId: string;
  conducta?: string;
  aprovechamiento?: string;
  asistencia?: string;
  observaciones?: string;
  recomendaciones?: string;
}): Promise<string> {
  const { data, error } = await supabase.rpc("registrar_diagnostico", {
    p_solicitud_id: params.solicitudId,
    p_conducta: params.conducta ?? null,
    p_aprovechamiento: params.aprovechamiento ?? null,
    p_asistencia: params.asistencia ?? null,
    p_observaciones: params.observaciones ?? null,
    p_recomendaciones: params.recomendaciones ?? null,
  });
  if (error) throw error;
  return data;
}

export async function crearPlanIntervencion(params: {
  casoId: string;
  objetivo: string;
  acciones: string;
  responsable: string;
  fechaInicio?: string;
  fechaRevision?: string | null;
  estado?: string;
}): Promise<string> {
  const { data, error } = await supabase.rpc("crear_plan_intervencion", {
    p_caso_id: params.casoId,
    p_objetivo: params.objetivo,
    p_acciones: params.acciones,
    p_responsable: params.responsable,
    p_fecha_inicio: params.fechaInicio ?? undefined,
    p_fecha_revision: params.fechaRevision ?? null,
    p_estado: params.estado ?? "activo",
  });
  if (error) throw error;
  return data;
}

export async function registrarSeguimientoOrientacion(params: {
  casoId: string;
  tipo: string;
  descripcion: string;
  evidenciaUrl?: string | null;
}): Promise<OrientacionFollowUp> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user?.id) {
    throw new Error("La sesión institucional no está disponible.");
  }

  const { data, error } = await supabase
    .from("seguimiento_orientacion")
    .insert({
      caso_id: params.casoId,
      tipo: params.tipo,
      descripcion: params.descripcion.trim(),
      evidencia_url: params.evidenciaUrl?.trim() || null,
      created_by: authData.user.id,
    })
    .select(
      "id, caso_id, tipo, descripcion, evidencia_url, created_by, created_at",
    )
    .single();

  if (error) throw error;
  if (!data) {
    throw new Error("Supabase no confirmó el seguimiento de Orientación.");
  }

  return {
    id: data.id,
    casoId: data.caso_id,
    tipo: data.tipo,
    descripcion: data.descripcion,
    evidenciaUrl: data.evidencia_url,
    createdBy: data.created_by,
    createdAt: data.created_at,
  };
}

export async function derivarTrabajoSocial(casoId: string): Promise<void> {
  const { error } = await supabase.rpc("derivar_trabajo_social", {
    p_caso_id: casoId,
  });
  if (error) throw error;
}

export async function escalarDireccion(casoId: string): Promise<void> {
  const { error } = await supabase.rpc("escalar_direccion", {
    p_caso_id: casoId,
  });
  if (error) throw error;
}
