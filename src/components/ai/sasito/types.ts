import type { AppModule, Student, UserRole } from "../../../types";
import type { PermisosSASE } from "../../../utils/permisos";
import type { SystemState } from "../../../types/systemState";

export type SasitoIntent =
  | "open_quick_register"
  | "search_student"
  | "open_student_record"
  | "open_health_module"
  | "open_orientation_cases"
  | "open_collective_diagnosis"
  | "show_notifications"
  | "explain_next_step"
  | "unknown";

export type SasitoExecutionType =
  | "navigate"
  | "open_modal"
  | "show_card"
  | "suggest_only"
  | "deny";

export interface SasitoEntities {
  studentId?: string;
  studentName?: string;
  group?: string;
  caseId?: string;
  moduleKeyword?: string;
  rawMatches?: string[];
}

export interface SasitoIntentResult {
  intent: SasitoIntent;
  confidence: number;
  entities: SasitoEntities;
  moduleTarget?: AppModule;
  reason: string;
}

export interface SasitoSelectedStudent {
  id: string;
  name: string;
  group?: string;
}

export interface SasitoSelectedCase {
  id: string;
  studentId?: string;
  studentName?: string;
  status?: string;
}

export interface SasitoRuntimeContext {
  currentUserRole: UserRole;
  currentUserProfile: unknown | null;
  currentModule: AppModule;
  currentRouteHash: string;
  selectedStudent?: SasitoSelectedStudent | null;
  selectedGroup?: string | null;
  selectedCase?: SasitoSelectedCase | null;
  notifications: unknown[];
  students: Student[];
  aiSystemState: SystemState;
  permissions: PermisosSASE;
}

export interface SasitoActionDefinition {
  id: string;
  intent: SasitoIntent;
  label: string;
  requiredPermission: keyof PermisosSASE | null;
  allowedRoles: UserRole[];
  moduleTarget?: AppModule;
  executionType: SasitoExecutionType;
  safetyMessage: string;
  requiresConfirmation?: boolean;
}
