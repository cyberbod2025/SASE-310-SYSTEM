import { AppModule, UserRole } from "../../../types";
import { tienePermiso } from "../../../utils/permisos";
import type { SasitoActionDefinition, SasitoIntent, SasitoIntentResult, SasitoRuntimeContext } from "./types";

const STAFF_ROLES = [
  UserRole.DIRECTIVO,
  UserRole.SUBDIRECCION,
  UserRole.DOCENTE,
  UserRole.DOCENTE_TUTOR,
  UserRole.PREFECTURA,
  UserRole.ORIENTACION,
  UserRole.TRABAJO_SOCIAL,
  UserRole.MEDICO_ESCOLAR,
  UserRole.UDEII,
  UserRole.PROMOTORA_LECTURA,
  UserRole.SECRETARIA,
  UserRole.DEVELOPER,
  UserRole.SYSTEM_ADMIN,
];

const ACTION_CATALOG: Record<SasitoIntent, SasitoActionDefinition> = {
  open_quick_register: {
    id: "open_quick_register",
    intent: "open_quick_register",
    label: "Abrir Registro Rapido",
    requiredPermission: "can_register",
    allowedRoles: STAFF_ROLES,
    executionType: "open_modal",
    safetyMessage: "Tu rol no tiene autorizado abrir Registro Rapido desde Sasito.",
    requiresConfirmation: false,
  },
  search_student: {
    id: "search_student",
    intent: "search_student",
    label: "Buscar alumno",
    requiredPermission: "can_view_names",
    allowedRoles: STAFF_ROLES,
    executionType: "show_card",
    safetyMessage: "Tu rol no tiene autorizado buscar alumnos desde Sasito.",
  },
  open_student_record: {
    id: "open_student_record",
    intent: "open_student_record",
    label: "Abrir expediente",
    requiredPermission: "can_view_names",
    allowedRoles: [UserRole.DIRECTIVO, UserRole.SUBDIRECCION, UserRole.ORIENTACION, UserRole.TRABAJO_SOCIAL, UserRole.SECRETARIA, UserRole.DEVELOPER, UserRole.SYSTEM_ADMIN],
    moduleTarget: AppModule.EXPEDIENTES,
    executionType: "navigate",
    safetyMessage: "Tu rol no tiene autorizado abrir expedientes desde Sasito.",
  },
  open_health_module: {
    id: "open_health_module",
    intent: "open_health_module",
    label: "Abrir modulo de salud",
    requiredPermission: "can_view_sensitive",
    allowedRoles: [UserRole.DIRECTIVO, UserRole.SUBDIRECCION, UserRole.ORIENTACION, UserRole.TRABAJO_SOCIAL, UserRole.MEDICO_ESCOLAR, UserRole.UDEII, UserRole.DEVELOPER, UserRole.SYSTEM_ADMIN],
    moduleTarget: AppModule.SALUD,
    executionType: "navigate",
    safetyMessage: "Tu rol no tiene autorizado consultar Salud desde Sasito.",
  },
  open_orientation_cases: {
    id: "open_orientation_cases",
    intent: "open_orientation_cases",
    label: "Abrir casos de Orientacion",
    requiredPermission: "can_edit",
    allowedRoles: [UserRole.DIRECTIVO, UserRole.SUBDIRECCION, UserRole.ORIENTACION, UserRole.TRABAJO_SOCIAL, UserRole.UDEII, UserRole.DEVELOPER, UserRole.SYSTEM_ADMIN],
    moduleTarget: AppModule.REPORTES,
    executionType: "navigate",
    safetyMessage: "Tu rol no tiene autorizado abrir casos de Orientacion desde Sasito.",
  },
  open_collective_diagnosis: {
    id: "open_collective_diagnosis",
    intent: "open_collective_diagnosis",
    label: "Abrir Diagnostico Colectivo",
    requiredPermission: "can_register",
    allowedRoles: [UserRole.DOCENTE, UserRole.DOCENTE_TUTOR, UserRole.DIRECTIVO, UserRole.SUBDIRECCION, UserRole.DEVELOPER, UserRole.SYSTEM_ADMIN],
    moduleTarget: AppModule.DIAGNOSTICO,
    executionType: "navigate",
    safetyMessage: "Tu rol no tiene autorizado abrir Diagnostico Colectivo desde Sasito.",
  },
  show_notifications: {
    id: "show_notifications",
    intent: "show_notifications",
    label: "Mostrar notificaciones",
    requiredPermission: null,
    allowedRoles: Object.values(UserRole),
    moduleTarget: AppModule.NOTIFICATIONS,
    executionType: "navigate",
    safetyMessage: "No fue posible abrir notificaciones para este perfil.",
  },
  explain_next_step: {
    id: "explain_next_step",
    intent: "explain_next_step",
    label: "Explicar siguiente paso",
    requiredPermission: null,
    allowedRoles: STAFF_ROLES,
    executionType: "suggest_only",
    safetyMessage: "Selecciona primero un caso o alumno para recibir una recomendacion institucional segura.",
  },
  unknown: {
    id: "unknown",
    intent: "unknown",
    label: "Intencion no reconocida",
    requiredPermission: null,
    allowedRoles: Object.values(UserRole),
    executionType: "deny",
    safetyMessage: "No tengo esa accion configurada de forma segura.",
  },
};

const denyAction = (action: SasitoActionDefinition): SasitoActionDefinition => ({
  ...action,
  moduleTarget: undefined,
  executionType: "deny",
  requiresConfirmation: false,
});

export function getSasitoActionDefinition(intent: SasitoIntent): SasitoActionDefinition {
  return ACTION_CATALOG[intent] || ACTION_CATALOG.unknown;
}

export function resolveSasitoAction(
  intentResult: SasitoIntentResult,
  context: SasitoRuntimeContext,
): SasitoActionDefinition {
  const action = getSasitoActionDefinition(intentResult.intent);

  if (action.executionType === "deny") return action;

  if (!action.allowedRoles.includes(context.currentUserRole)) {
    return denyAction(action);
  }

  if (action.requiredPermission && !tienePermiso(context.permissions, action.requiredPermission)) {
    return denyAction(action);
  }

  if (action.intent === "explain_next_step" && !context.selectedCase) {
    return {
      ...action,
      executionType: "suggest_only",
      safetyMessage: "Selecciona un caso institucional antes de pedir el siguiente paso.",
    };
  }

  return action;
}
