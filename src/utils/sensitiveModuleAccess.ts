import { AppModule, UserRole } from "../types";

const sensitiveModuleRoles: Partial<
  Record<AppModule, readonly UserRole[]>
> = {
  [AppModule.SALUD]: [
    UserRole.MEDICO_ESCOLAR,
    UserRole.DIRECTIVO,
    UserRole.SUBDIRECCION,
    UserRole.SYSTEM_ADMIN,
  ],
  [AppModule.UDEII_TRACKER]: [
    UserRole.UDEII,
    UserRole.DIRECTIVO,
    UserRole.SUBDIRECCION,
    UserRole.SYSTEM_ADMIN,
  ],
  [AppModule.TRABAJO_SOCIAL_TRACKER]: [
    UserRole.TRABAJO_SOCIAL,
    UserRole.DIRECTIVO,
    UserRole.SUBDIRECCION,
    UserRole.SYSTEM_ADMIN,
  ],
};

export const canAccessSensitiveModule = (
  module: AppModule,
  role: UserRole,
): boolean => {
  const allowedRoles = sensitiveModuleRoles[module];
  return allowedRoles ? allowedRoles.includes(role) : true;
};
