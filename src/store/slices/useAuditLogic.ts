import { supabase } from "../../supabase/client";
import { UserRole, AuditActionType } from "../../types";
import { registerAuditEvent } from "../../components/auditoria/auditoriaPersistence";
import toast from "react-hot-toast";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const purposeForAction = (actionType: AuditActionType) => {
  if (actionType === "CONSULTA") {
    return "Consulta autorizada para acompañamiento institucional";
  }
  return "Trazabilidad de una acción institucional confirmada";
};

export const useAuditLogic = (
  _user: any,
  _currentUserRole: UserRole,
) => {
  const logAudit = async (
    actionType: AuditActionType,
    description: string,
    targetTable: string,
    targetRecordId: string,
    _studentName?: string,
    _oldValues?: any,
    _newValues?: any,
  ) => {
    try {
      await registerAuditEvent({
        actionType,
        description,
        targetTable,
        targetRecordId,
        purpose: purposeForAction(actionType),
        studentId:
          targetTable === "alumnos" && UUID_PATTERN.test(targetRecordId)
            ? targetRecordId
            : null,
      });
    } catch (err) {
      console.error("No se confirmó la trazabilidad institucional:", err);
      toast.error(
        "La acción pudo completarse, pero no se confirmó su trazabilidad.",
      );
    }
  };

  const logAccess = async (
    action: string,
    studentId: string,
    studentName?: string,
  ) => {
    return logAudit(
      "CONSULTA",
      action,
      "alumnos",
      studentId,
      studentName,
    );
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
