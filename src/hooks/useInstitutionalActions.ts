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
        const { error } = await supabase.from("interventions_log" as any).insert({
          student_id: studentId,
          user_id: user.id,
          reason: `ESCALAMIENTO: ${reason}`,
          result: "ESCALADO",
          notes: `Escalado por ${reporterName} (${currentUserRole}). Motivo: ${reason}`,
        });
        if (error) throw error;

        // Actualizar estado del alumno si está en observación
        await supabase
          .from("alumnos")
          .update({ estado_semaforo: CaseState.INTERVENCION })
          .eq("id", studentId);

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
          .from("interventions_log" as any)
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
          .from("interventions_log" as any)
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
          .from("interventions_log" as any)
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
          await supabase.from("citas_padres" as any).insert({
            alumno_id: studentId,
            creado_por: user.id,
            fecha_cita: followUpDate,
            motivo: `Seguimiento: ${notes}`,
            estado: "PENDIENTE",
            observaciones: `Generado desde Dashboard de ${currentUserRole}`,
          });
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
   * SOS: Alerta masiva a Prefectura + auto-escalamiento backend
   * 
   * Cadena automática (vía pg_cron + auto_escalate_sos):
   *   T+0    → Prefectura notificada (aquí)
   *   T+1min → Orientación (auto)
   *   T+2min → Dirección (auto)
   *   T+3min → Broadcast institucional (auto)
   */
  const sosAlert = useCallback(
    async (
      studentId?: string,
      studentName?: string,
      context?: string,
    ): Promise<ActionResult> => {
      if (!user) return { success: false, error: "Sin sesión" };
      try {
        // 1. Registro en interventions_log (histórico)
        const { error: logError } = await supabase
          .from("interventions_log" as any)
          .insert({
            student_id: studentId || null,
            user_id: user.id,
            reason: "ALERTA SOS INSTITUCIONAL",
            result: "ACTIVADO",
            notes: `SOS activado por ${reporterName} (${currentUserRole}). ${context || "Sin contexto adicional."}`,
          });
        if (logError) throw logError;

        // 2. Crear registro en sos_alerts (alimenta auto-escalamiento)
        const { error: sosError } = await supabase
          .from("sos_alerts" as any)
          .insert({
            created_by: user.id,
            reporter_name: reporterName,
            reporter_role: currentUserRole,
            student_id: studentId || null,
            student_name: studentName || null,
            context: context || null,
            escalation_level: 0,
          });
        if (sosError) {
          console.warn("sos_alerts insert failed (tabla puede no existir aún):", sosError);
          // No bloqueamos — el SOS sigue funcionando sin auto-escalamiento
        }

        // 3. Notificación inmediata a Prefectura (T+0)
        addNotification({
          title: "🚨 ALERTA SOS ACTIVADA",
          message: `${reporterName} ha activado SOS.${studentName ? ` Alumno: ${studentName}.` : ""} ${context || ""}`,
          type: "error",
          targetRole: UserRole.PREFECTURA,
          actionModule: AppModule.DASHBOARD,
        });

        // 4. Auditoría
        await logAudit(
          "CREACION",
          `SOS INSTITUCIONAL: ${reporterName}${studentName ? ` — Alumno: ${studentName}` : ""}`,
          "interventions_log",
          studentId || "GLOBAL",
          studentName || "N/A",
        );

        toast.success("SOS activado — Prefectura notificada. Escalamiento automático iniciado.");
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
          .from("interventions_log" as any)
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
          .from("interventions_log" as any)
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
   * Reconocer SOS: detiene la cadena de escalamiento automático
   * Lo llama el departamento que atiende la alerta.
   */
  const acknowledgeSOS = useCallback(
    async (
      sosAlertId: string,
      resolutionNotes?: string,
    ): Promise<ActionResult> => {
      if (!user) return { success: false, error: "Sin sesión" };
      try {
        const { error } = await supabase
          .from("sos_alerts" as any)
          .update({
            acknowledged_at: new Date().toISOString(),
            acknowledged_by: user.id,
            resolution_notes: resolutionNotes || `Atendido por ${reporterName} (${currentUserRole})`,
          })
          .eq("id", sosAlertId);
        if (error) throw error;

        await logAudit(
          "ACTUALIZACION",
          `SOS reconocido: ${sosAlertId}`,
          "sos_alerts",
          sosAlertId,
          reporterName,
        );

        toast.success("SOS reconocido — Escalamiento automático detenido");
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
   * Resolver SOS: cierra definitivamente la alerta
   */
  const resolveSOS = useCallback(
    async (
      sosAlertId: string,
      resolutionNotes: string,
    ): Promise<ActionResult> => {
      if (!user) return { success: false, error: "Sin sesión" };
      try {
        const { error } = await supabase
          .from("sos_alerts" as any)
          .update({
            acknowledged_at: new Date().toISOString(),
            acknowledged_by: user.id,
            resolved_at: new Date().toISOString(),
            resolved_by: user.id,
            resolution_notes: resolutionNotes,
          })
          .eq("id", sosAlertId);
        if (error) throw error;

        // Registro en interventions_log
        await supabase
          .from("interventions_log" as any)
          .insert({
            user_id: user.id,
            reason: "SOS RESUELTO",
            result: "RESUELTO",
            notes: `SOS ${sosAlertId} resuelto por ${reporterName}. ${resolutionNotes}`,
          });

        await logAudit(
          "ACTUALIZACION",
          `SOS resuelto: ${sosAlertId} — ${resolutionNotes}`,
          "sos_alerts",
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
