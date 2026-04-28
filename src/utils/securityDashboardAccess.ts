import { UserRole } from "../types";

const SECURITY_DASHBOARD_ROLES = new Set<UserRole>([
  UserRole.DIRECTIVO,
  UserRole.SYSTEM_ADMIN,
  UserRole.DEVELOPER,
]);

export const canAccessSecurityDashboard = (role: UserRole): boolean =>
  SECURITY_DASHBOARD_ROLES.has(role);
