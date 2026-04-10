import { AppModule, UserRole } from "../types";

export type OnboardingPhase = "fase1" | "fase2" | "fase3";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const normalizeDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
};

export const getOnboardingPhase = (userCreatedAt?: string | null): OnboardingPhase => {
  const created = normalizeDate(userCreatedAt) ?? new Date();
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - created.getTime()) / MS_PER_DAY);

  if (diffDays <= 30) return "fase1"; // 0–30 días
  if (diffDays <= 60) return "fase2"; // 31–60 días
  return "fase3"; // 61+ días
};

export const getAllowedModules = (
  phase: OnboardingPhase,
  role: UserRole,
): Set<AppModule> | null => {
  // Roles de plataforma con acceso pleno siempre
  if (role === UserRole.SYSTEM_ADMIN || role === UserRole.DEVELOPER) {
    return null;
  }

  if (phase === "fase1") {
    return new Set<AppModule>([
      AppModule.DASHBOARD,
      AppModule.ASISTENCIA,
      AppModule.WELCOME,
      AppModule.HOME,
    ]);
  }

  if (phase === "fase2") {
    return new Set<AppModule>([
      AppModule.DASHBOARD,
      AppModule.ASISTENCIA,
      AppModule.EXPEDIENTES,
      AppModule.PROTOCOLOS,
      AppModule.WELCOME,
      AppModule.HOME,
    ]);
  }

  // fase3 = acceso total
  return null;
};

export const isModuleAllowed = (
  module: AppModule,
  allowed: Set<AppModule> | null,
): boolean => {
  if (!allowed) return true;
  return allowed.has(module);
};
