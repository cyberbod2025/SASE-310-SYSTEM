import { supabase } from "../../supabase/client";
import { UserRole, AuditActionType } from "../../types";

export const useAuditLogic = (user: any, currentUserRole: UserRole) => {
  const logAudit = async (
    actionType: AuditActionType,
    description: string,
    targetTable: string,
    targetRecordId: string,
    studentName?: string,
    oldValues?: any,
    newValues?: any,
  ) => {
    console.log(
      `%c[REGISTRO] ${actionType}: ${description}`,
      "color: #3b82f6; font-weight: bold;",
    );

    let auditUserId = user?.id;
    let auditUserEmail = user?.email;
    let auditUserRole = currentUserRole as string;
    let internalNote = null;

    if (currentUserRole === UserRole.DEVELOPER) {
      auditUserId = "SYSTEM";
      auditUserRole = "SYSTEM_ADMIN";
      auditUserEmail = "system@esd-310.mx";
      internalNote = "Acción realizada por Super Admin (oculto)";
    }

    try {
      await supabase.from("audit_log").insert([
        {
          user_id: auditUserId,
          user_email: auditUserEmail,
          user_role: auditUserRole,
          action_type: actionType,
          action_description: internalNote
            ? `${description} [INTERNAL: ${internalNote}]`
            : description,
          target_table: targetTable,
          target_record_id: targetRecordId,
          target_student_name: studentName,
          old_values: oldValues || null,
          new_values: newValues || null,
        },
      ]);
    } catch (err) {
      console.warn("Audit logging failed:", err);
    }
  };

  const logAccess = (
    action: string,
    studentId: string,
    studentName?: string,
  ) => {
    logAudit("CONSULTA", action, "alumnos", studentId, studentName);
  };

  return { logAudit, logAccess };
};
