import { supabase } from "../../supabase/client";
import { UserRole, AuditActionType } from "../../types";

export interface AuditResult {
  success: boolean;
  error?: string;
  rawError?: unknown;
}

export const AUDIT_FAILURE_MESSAGE = "No se pudo registrar la auditoría institucional.";

const getAuditErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error) {
    return String((error as { message?: unknown }).message || AUDIT_FAILURE_MESSAGE);
  }
  return AUDIT_FAILURE_MESSAGE;
};

export const requireAuditSuccess = (result: AuditResult | undefined | null): AuditResult => {
  if (result?.success) return result;
  throw new Error(result?.error || AUDIT_FAILURE_MESSAGE);
};

export const useAuditLogic = (user: any, currentUserRole: UserRole) => {
  const logAudit = async (
    actionType: AuditActionType,
    description: string,
    targetTable: string,
    targetRecordId: string,
    studentName?: string,
    oldValues?: any,
    newValues?: any,
  ): Promise<AuditResult> => {
    console.log(
      `%c[AUDIT] ${actionType}: ${description}`,
      "color: #ef4444; font-weight: bold;",
    );

    let auditUserId = user?.id ?? null;
    let auditUserEmail = user?.email;
    let auditUserRole = currentUserRole as string;
    let internalNote = null;

    if (currentUserRole === UserRole.DEVELOPER) {
      auditUserId = null;
      auditUserRole = "SYSTEM_ADMIN";
      auditUserEmail = "system@esd-310.mx";
      internalNote = "Acción realizada por Super Admin (oculto)";
    }

    try {
      const { error } = await (supabase.from("auditoria") as any).insert([
        {
          usuario_id: auditUserId,
          email_usuario: auditUserEmail,
          rol_usuario: auditUserRole,
          tipo_accion: actionType,
          descripcion_accion: internalNote
            ? `${description}${studentName ? ` [ALUMNO: ${studentName}]` : ""} [INTERNAL: ${internalNote}]`
            : `${description}${studentName ? ` [ALUMNO: ${studentName}]` : ""}`,
          tabla_objetivo: targetTable,
          id_registro_objetivo: targetRecordId,
          old_values: oldValues || null,
          new_values: newValues || null,
        },
      ]);
      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.warn("Audit logging failed:", err);
      return { success: false, error: getAuditErrorMessage(err), rawError: err };
    }
  };

  const logAccess = (
    action: string,
    studentId: string,
    studentName?: string,
  ) => {
    return logAudit("CONSULTA", action, "alumnos", studentId, studentName);
  };

  const logEvent = async (
    module: string,
    action: string,
    result: string,
    details: any = {},
  ) => {
    try {
      const { data, error } = await supabase.rpc("log_event" as any, {
        p_module: module,
        p_action: action,
        p_result: result,
        p_details: details,
      });
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn("Log event failed:", err);
    }
  };

  return { logAudit, logAccess, logEvent };
};
