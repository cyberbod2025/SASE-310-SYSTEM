import { AppModule, UserRole } from "../../../types";
import type { Student } from "../../../types";
import { PERMISOS_POR_ROL, type PermisosSASE } from "../../../utils/permisos";
import type { SystemState } from "../../../types/systemState";
import type { SasitoRuntimeContext, SasitoSelectedCase, SasitoSelectedStudent } from "./types";

interface SasitoContextSource {
  currentUserRole?: UserRole;
  currentUserProfile?: unknown | null;
  currentModule?: AppModule;
  currentRouteHash?: string;
  selectedStudent?: SasitoSelectedStudent | null;
  selectedGroup?: string | null;
  selectedCase?: SasitoSelectedCase | null;
  notifications?: unknown[];
  students?: Student[];
  aiSystemState?: SystemState;
  permissions?: PermisosSASE;
}

const resolvePermissions = (role: UserRole, permissions?: PermisosSASE): PermisosSASE => {
  if (permissions) return permissions;
  return PERMISOS_POR_ROL[role] || PERMISOS_POR_ROL.guest;
};

const getCurrentRouteHash = (provided?: string) => {
  if (provided) return provided;
  if (typeof window === "undefined") return "";
  return window.location.hash || "";
};

export function buildSasitoContext(source: SasitoContextSource): SasitoRuntimeContext {
  const role = source.currentUserRole || UserRole.GUEST;

  return {
    currentUserRole: role,
    currentUserProfile: source.currentUserProfile ?? null,
    currentModule: source.currentModule || AppModule.HOME,
    currentRouteHash: getCurrentRouteHash(source.currentRouteHash),
    selectedStudent: source.selectedStudent ?? null,
    selectedGroup: source.selectedGroup ?? null,
    selectedCase: source.selectedCase ?? null,
    notifications: source.notifications || [],
    students: source.students || [],
    aiSystemState: source.aiSystemState || "normal",
    permissions: resolvePermissions(role, source.permissions),
  };
}
