/**
 * useInstitutionalActions.ts
 * 
 * Hook centralizado para acciones institucionales que ESCRIBEN en la base de datos.
 * Regla SASE: Si no escribe en DB → no existe.
 * 
 * Sustituye todos los toast.success("mock operativo") del sistema.
 */
import { useCallback } from "react";
import { supabase } from "../supabase/client";
import type { Json } from "../supabase/types";
import { useAuth } from "../components/AuthProvider";
import { useApp } from "../store";
import { UserRole, AppModule, CaseState } from "../types";
import toast from "react-hot-toast";

export type InstitutionalActionType =
  | "ESCALAMIENTO"
  | "CIERRE_CASO"
  | "REAPERTURA_CASO"
  | "SEGUIMIENTO"
  | "EVIDENCIA"
  | "SOS"
  | "CANALIZACIÓN"
  | "NOTIFICACION_DEPARTAMENTAL";

interface ActionResult {
  success: boolean;
  error?: string;
}

const isJsonObject = (
  value: Json | null | undefined,
): value is Record<string, Json | undefined> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const mergeJsonObject = (
  base: Json | null | undefined,
  patch: Record<string, Json>,
): Json => ({
  ...(isJsonObject(base) ? base : {}),
  ...patch,
});

const getJsonString = (
  value: Json | null | undefined,
  key: string,
): string | undefined => {
  if (!isJsonObject(value)) return undefined;
  const candidate = value[key];
  return typeof candidate === "string" ? candidate : undefined;
};

export const useInstitutionalActions = () => {
  const { user } = useAuth();
  const {
    addNotification,
    logAudit,
    fetchStudents,
    currentUserRole,
    currentUserProfile,
  } = useApp();

  const reporterName =
    currentUserProfile?.nombre_completo ||
    currentUserProfile?.full_name ||
    user?.email ||
    "Sistema SASE";

  /**
   * Escalar caso: inserta en interventions_log + notifica roles superiores
   */
  const escalateCase = useCallback(
    async (
      studentId: string,
      studentName: string,
      reason: string,
      ): Promise<ActionResult> => {
      if (!user) return { success: false, error: "Sin sesión" };
      try {
        const { error } = await supabase.from("interventions_log").insert({
          student_id: studentId,
          user_id: user.id,
          reason: `ESCALAMIENTO: ${reason}`,
          result: "ESCALADO",
          notes: `Escalado por ${reporterName} (${currentUserRole}). Motivo: ${reason}`,
        });
        if (error) throw error;

        // Actualizar estado del alumno si está en observación
        const { error: updateError } = await supabase
          .from("alumnos")
          .update({ estado_semaforo: CaseState.INTERVENCION })
          .eq("id", studentId);
        if (updateError) throw updateError;

        addNotification({
          title: "🚨 CASO ESCALADO",
          message: `${studentName} ha sido escalado a intervención directiva. Motivo: ${reason}`,
          type: "error",
          targetRole: UserRole.DIRECTIVO,
          actionModule: AppModule.EXPEDIENTES,
        });

        addNotification({
          title: "⚠️ Escalamiento recibido",
          message: `Caso de ${studentName} requiere atención de Orientación.`,
          type: "warning",
          targetRole: UserRole.ORIENTACION,
          actionModule: AppModule.REPORTES,
        });

        await logAudit(
          "CREACION",
          `Escalamiento: ${studentName} — ${reason}`,
          "interventions_log",
          studentId,
          studentName,
        );

        toast.success(`Caso escalado: ${studentName}`);
        fetchStudents();
        return { success: true };
      } catch (err: any) {
        console.error("Error al escalar caso:", err);
        toast.error("Error al escalar caso");
        return { success: false, error: err.message };
      }
    },
    [user, addNotification, logAudit, fetchStudents, reporterName, currentUserRole],
  );

  /**
   * Cerrar caso: actualiza estado + registro de cierre
   */
  const closeCase = useCallback(
    async (
      studentId: string,
      studentName: string,
      closureNotes?: string,
    ): Promise<ActionResult> => {
      if (!user) return { success: false, error: "Sin sesión" };
      try {
        // Registrar la intervención de cierre
        const { error: logError } = await supabase
          .from("interventions_log")
          .insert({
            student_id: studentId,
            user_id: user.id,
            reason: "CIERRE DE CASO INSTITUCIONAL",
            result: "CERRADO",
            notes: closureNotes || `Caso cerrado por ${reporterName}`,
          });
        if (logError) throw logError;

        // Actualizar estado del alumno
        const { error: updateError } = await supabase
          .from("alumnos")
          .update({ estado_semaforo: CaseState.CERRADO })
          .eq("id", studentId);
        if (updateError) throw updateError;

        await logAudit(
          "ACTUALIZACION",
          `Cierre institucional: ${studentName}`,
          "alumnos",
          studentId,
          studentName,
        );

        toast.success(`Caso cerrado: ${studentName}`);
        fetchStudents();
        return { success: true };
      } catch (err: any) {
        console.error("Error al cerrar caso:", err);
        toast.error("Error al cerrar caso");
        return { success: false, error: err.message };
      }
    },
    [user, logAudit, fetchStudents, reporterName],
  );

  /**
   * Reabrir caso: revierte a INTERVENCION + registro
   */
  const reopenCase = useCallback(
    async (
      studentId: string,
      studentName: string,
      reason?: string,
    ): Promise<ActionResult> => {
      if (!user) return { success: false, error: "Sin sesión" };
      try {
        const { error: logError } = await supabase
          .from("interventions_log")
          .insert({
            student_id: studentId,
            user_id: user.id,
            reason: `REAPERTURA: ${reason || "Seguimiento adicional requerido"}`,
            result: "REABIERTO",
            notes: `Caso reabierto por ${reporterName}`,
          });
        if (logError) throw logError;

        const { error: updateError } = await supabase
          .from("alumnos")
          .update({ estado_semaforo: CaseState.INTERVENCION })
          .eq("id", studentId);
        if (updateError) throw updateError;

        await logAudit(
          "ACTUALIZACION",
          `Caso reabierto: ${studentName}`,
          "alumnos",
          studentId,
          studentName,
        );

        toast.success(`Caso reabierto: ${studentName}`);
        fetchStudents();
        return { success: true };
      } catch (err: any) {
        console.error("Error al reabrir caso:", err);
        toast.error("Error al reabrir caso");
        return { success: false, error: err.message };
      }
    },
    [user, logAudit, fetchStudents, reporterName],
  );

  /**
   * Registrar seguimiento: agenda + interventions_log
   */
  const scheduleFollowUp = useCallback(
    async (
      studentId: string,
      studentName: string,
      notes: string,
      followUpDate?: string,
    ): Promise<ActionResult> => {
      if (!user) return { success: false, error: "Sin sesión" };
      try {
        // Registro en interventions_log
        const { error: logError } = await supabase
          .from("interventions_log")
          .insert({
            student_id: studentId,
            user_id: user.id,
            reason: "SEGUIMIENTO PROGRAMADO",
            result: "PENDIENTE",
            notes: `${notes} — Programado por ${reporterName}`,
          });
        if (logError) throw logError;

        // Si hay fecha, crear cita
        if (followUpDate) {
          const { error: appointmentError } = await supabase.from("citas_padres").insert({
            alumno_id: studentId,
            creado_por: user.id,
            fecha_cita: followUpDate,
            motivo: `Seguimiento: ${notes}`,
            estado: "PENDIENTE",
            observaciones: `Generado desde Dashboard de ${currentUserRole}`,
          });
          if (appointmentError) throw appointmentError;
        }

        await logAudit(
          "CREACION",
          `Seguimiento programado: ${studentName} — ${notes}`,
          "interventions_log",
          studentId,
          studentName,
        );

        toast.success(`Seguimiento programado: ${studentName}`);
        return { success: true };
      } catch (err: any) {
        console.error("Error al programar seguimiento:", err);
        toast.error("Error al programar seguimiento");
        return { success: false, error: err.message };
      }
    },
    [user, logAudit, reporterName, currentUserRole],
  );

  /**
   * Registrar evidencia: inserta en evidence_log
   */
  const registerEvidence = useCallback(
    async (
      studentId: string,
      studentName: string,
      description: string,
    ): Promise<ActionResult> => {
      if (!user) return { success: false, error: "Sin sesión" };
      try {
        const { error } = await supabase.from("evidence_log").insert({
          user_id: user.id,
          title: `Evidencia: ${studentName}`,
          notes: description,
          role: currentUserRole,
          proyecto_nombre: "Seguimiento Institucional",
        });
        if (error) throw error;

        await logAudit(
          "CREACION",
          `Evidencia registrada: ${studentName} — ${description}`,
          "evidence_log",
          studentId,
          studentName,
        );

        toast.success(`Evidencia registrada: ${studentName}`);
        return { success: true };
      } catch (err: any) {
        console.error("Error al registrar evidencia:", err);
        toast.error("Error al registrar evidencia");
        return { success: false, error: err.message };
      }
    },
    [user, logAudit, currentUserRole],
  );

  /**
   * SOS: alerta operativa en alertas_emergencia + registro institucional.
   */
  const sosAlert = useCallback(
    async (
      studentId?: string,
      studentName?: string,
      context?: string,
    ): Promise<ActionResult> => {
      if (!user) return { success: false, error: "Sin sesión" };
      try {
        const now = new Date().toISOString();
        const alertMetadata: Record<string, Json> = {
          student_id: studentId || null,
          student_name: studentName || null,
          context: context || null,
          origin: "useInstitutionalActions.sosAlert",
        };

        const { data: emergencyAlert, error: emergencyAlertError } = await supabase
          .from("alertas_emergencia")
          .insert({
            tipo_alerta: "otros",
            descripcion_opcional: context || (studentName ? `Alumno relacionado: ${studentName}` : "SOS institucional"),
            grupo: null,
            aula: null,
            docente_id: user.id,
            docente_nombre: reporterName,
            estado: "activa",
            prioridad: "critica",
            protocolo_activado: "SOS",
            metadata: alertMetadata,
            escalado_nivel: 0,
            ultima_notificacion_at: now,
          })
          .select("id")
          .single();
        if (emergencyAlertError) throw emergencyAlertError;

        // Registro obligatorio en interventions_log (histórico)
        const { error: logError } = await supabase
          .from("interventions_log")
          .insert({
            student_id: studentId || null,
            user_id: user.id,
            reason: "ALERTA SOS INSTITUCIONAL",
            result: "ACTIVADO",
            notes: `SOS activado por ${reporterName} (${currentUserRole}). ${context || "Sin contexto adicional."}`,
          });
        if (logError) throw logError;

        // Notificación inmediata a Prefectura (T+0)
        addNotification({
          title: "🚨 ALERTA SOS ACTIVADA",
          message: `${reporterName} ha activado SOS.${studentName ? ` Alumno: ${studentName}.` : ""} ${context || ""}`,
          type: "error",
          targetRole: UserRole.PREFECTURA,
          actionModule: AppModule.DASHBOARD,
        });

        // Auditoría
        await logAudit(
          "CREACION",
          `SOS INSTITUCIONAL: ${reporterName}${studentName ? ` — Alumno: ${studentName}` : ""}`,
          "alertas_emergencia",
          emergencyAlert.id,
          studentName || reporterName,
        );

        toast.success("SOS activado — Prefectura notificada y alerta operativa creada.");
        return { success: true };
      } catch (err: any) {
        console.error("Error al activar SOS:", err);
        toast.error("Error al activar alerta SOS");
        return { success: false, error: err.message };
      }
    },
    [user, addNotification, logAudit, reporterName, currentUserRole],
  );

  /**
   * Confirmar atención: marca que un departamento ya atendió la alerta
   */
  const confirmAttention = useCallback(
    async (
      studentId: string,
      studentName: string,
      attentionType: string,
    ): Promise<ActionResult> => {
      if (!user) return { success: false, error: "Sin sesión" };
      try {
        const { error } = await supabase
          .from("interventions_log")
          .insert({
            student_id: studentId,
            user_id: user.id,
            reason: `CONFIRMACIÓN DE ATENCIÓN: ${attentionType}`,
            result: "ATENDIDO",
            notes: `Atención confirmada por ${reporterName} (${currentUserRole})`,
          });
        if (error) throw error;

        await logAudit(
          "ACTUALIZACION",
          `Atención confirmada: ${studentName} — ${attentionType}`,
          "interventions_log",
          studentId,
          studentName,
        );

        toast.success(`Atención confirmada: ${studentName}`);
        return { success: true };
      } catch (err: any) {
        console.error("Error al confirmar atención:", err);
        toast.error("Error al confirmar atención");
        return { success: false, error: err.message };
      }
    },
    [user, logAudit, reporterName, currentUserRole],
  );

  /**
   * Notificar a un departamento específico: notificación + registro
   */
  const notifyDepartment = useCallback(
    async (
      targetRole: UserRole,
      studentId: string,
      studentName: string,
      message: string,
    ): Promise<ActionResult> => {
      if (!user) return { success: false, error: "Sin sesión" };
      try {
        const { error } = await supabase
          .from("interventions_log")
          .insert({
            student_id: studentId,
            user_id: user.id,
            reason: `NOTIFICACIÓN A ${targetRole}`,
            result: "ENVIADO",
            notes: message,
          });
        if (error) throw error;

        addNotification({
          title: `📋 Notificación de ${currentUserRole}`,
          message: `${message} (Alumno: ${studentName})`,
          type: "warning",
          targetRole,
          actionModule: AppModule.EXPEDIENTES,
        });

        await logAudit(
          "CREACION",
          `Notificación a ${targetRole}: ${studentName} — ${message}`,
          "interventions_log",
          studentId,
          studentName,
        );

        toast.success(`Notificación enviada a ${targetRole}`);
        return { success: true };
      } catch (err: any) {
        console.error("Error al notificar departamento:", err);
        toast.error("Error al enviar notificación");
        return { success: false, error: err.message };
      }
    },
    [user, addNotification, logAudit, currentUserRole],
  );

  /**
   * Reconocer SOS: deja constancia de atención preliminar sin cerrar la alerta.
   */
  const acknowledgeSOS = useCallback(
    async (
      sosAlertId: string,
      resolutionNotes?: string,
    ): Promise<ActionResult> => {
      if (!user) return { success: false, error: "Sin sesión" };
      try {
        const acknowledgedAt = new Date().toISOString();
        const { data: currentAlert, error: currentAlertError } = await supabase
          .from("alertas_emergencia")
          .select("metadata, atendida_at")
          .eq("id", sosAlertId)
          .maybeSingle();
        if (currentAlertError) throw currentAlertError;

        const { error } = await supabase
          .from("alertas_emergencia")
          .update({
            estado: "atendida",
            atendida_at: currentAlert?.atendida_at || acknowledgedAt,
            atendida_por: user.id,
            metadata: mergeJsonObject(currentAlert?.metadata, {
              status: "acknowledged",
              acknowledged_at: acknowledgedAt,
              acknowledged_by: user.id,
              resolution_notes: resolutionNotes || `Atendido por ${reporterName} (${currentUserRole})`,
            }),
          })
          .eq("id", sosAlertId);
        if (error) throw error;

        await logAudit(
          "ACTUALIZACION",
          `SOS reconocido: ${sosAlertId}`,
          "alertas_emergencia",
          sosAlertId,
          reporterName,
        );

        toast.success("SOS reconocido — atención registrada.");
        return { success: true };
      } catch (err: any) {
        console.error("Error al reconocer SOS:", err);
        toast.error("Error al reconocer alerta SOS");
        return { success: false, error: err.message };
      }
    },
    [user, logAudit, reporterName, currentUserRole],
  );

  /**
   * Resolver SOS: cierra definitivamente la alerta operativa
   */
  const resolveSOS = useCallback(
    async (
      sosAlertId: string,
      resolutionNotes: string,
    ): Promise<ActionResult> => {
      if (!user) return { success: false, error: "Sin sesión" };
      try {
        const resolvedAt = new Date().toISOString();
        const { data: currentAlert, error: currentAlertError } = await supabase
          .from("alertas_emergencia")
          .select("metadata, atendida_at")
          .eq("id", sosAlertId)
          .maybeSingle();
        if (currentAlertError) throw currentAlertError;

        const relatedStudentId = getJsonString(currentAlert?.metadata, "student_id") || null;

        const { error } = await supabase
          .from("alertas_emergencia")
          .update({
            estado: "cancelada",
            cerrada_at: resolvedAt,
            atendida_at: currentAlert?.atendida_at || resolvedAt,
            atendida_por: user.id,
            metadata: mergeJsonObject(currentAlert?.metadata, {
              status: "resolved",
              acknowledged_at: currentAlert?.atendida_at || resolvedAt,
              acknowledged_by: user.id,
              resolved_at: resolvedAt,
              resolved_by: user.id,
              resolution_notes: resolutionNotes,
            }),
          })
          .eq("id", sosAlertId);
        if (error) throw error;

        // Registro en interventions_log
        const { error: resolutionLogError } = await supabase
          .from("interventions_log")
          .insert({
            student_id: relatedStudentId,
            user_id: user.id,
            reason: "SOS RESUELTO",
            result: "RESUELTO",
            notes: `SOS ${sosAlertId} resuelto por ${reporterName}. ${resolutionNotes}`,
          });
        if (resolutionLogError) throw resolutionLogError;

        await logAudit(
          "ACTUALIZACION",
          `SOS resuelto: ${sosAlertId} — ${resolutionNotes}`,
          "alertas_emergencia",
          sosAlertId,
          reporterName,
        );

        toast.success("SOS resuelto — Alerta cerrada");
        return { success: true };
      } catch (err: any) {
        console.error("Error al resolver SOS:", err);
        toast.error("Error al resolver SOS");
        return { success: false, error: err.message };
      }
    },
    [user, logAudit, reporterName, currentUserRole],
  );

  return {
    escalateCase,
    closeCase,
    reopenCase,
    scheduleFollowUp,
    registerEvidence,
    sosAlert,
    confirmAttention,
    notifyDepartment,
    acknowledgeSOS,
    resolveSOS,
  };
};
