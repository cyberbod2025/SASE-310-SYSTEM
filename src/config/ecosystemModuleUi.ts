import { AppModule } from "../types";

export type EcosystemModuleKey = "feria" | "diagnostico" | "mate";

export interface EcosystemModuleUiConfig {
  key: EcosystemModuleKey;
  appModule: AppModule;
  icon: string;
  accentClass: string;
  orbitColor: string;
  launchSubtitle: string;
  deniedMessage: string;
  description: string;
}

export const ECOSYSTEM_MODULE_UI: Record<EcosystemModuleKey, EcosystemModuleUiConfig> = {
  feria: {
    key: "feria",
    appModule: AppModule.FERIA,
    icon: "rocket_launch",
    accentClass: "text-indigo-400",
    orbitColor: "from-indigo-600 to-violet-600",
    launchSubtitle: "Lanzamiento seguro SASE para docentes piloto.",
    deniedMessage:
      "Este acceso permanece en piloto cerrado. Tu cuenta no tiene habilitacion activa para Feria.",
    description: "Modulo temporal del ecosistema para docentes piloto y handoff institucional seguro.",
  },
  diagnostico: {
    key: "diagnostico",
    appModule: AppModule.DIAGNOSTICO,
    icon: "analytics",
    accentClass: "text-cyan-400",
    orbitColor: "from-cyan-600 to-blue-600",
    launchSubtitle: "Acceso institucional permanente para lectura y seguimiento colectivo.",
    deniedMessage:
      "Tu cuenta no tiene habilitacion activa para Diagnostico Colectivo en este momento.",
    description: "Modulo permanente del ecosistema para diagnostico, lectura transversal y seguimiento institucional.",
  },
  mate: {
    key: "mate",
    appModule: AppModule.MATE,
    icon: "calculate",
    accentClass: "text-emerald-400",
    orbitColor: "from-emerald-600 to-teal-500",
    launchSubtitle: "Rollout provisional de consulta para usuarios autenticados actuales de SASE.",
    deniedMessage:
      "Mate aun no esta habilitado para tu cuenta dentro del rollout provisional actual.",
    description:
      "Modulo de consulta y acompanamiento en clase. Su acceso actual es provisional y no representa el modelo final de alumnos.",
  },
};

export function isEcosystemModuleKey(value: string): value is EcosystemModuleKey {
  return value in ECOSYSTEM_MODULE_UI;
}

export function getEcosystemModuleUiByAppModule(module: AppModule) {
  return Object.values(ECOSYSTEM_MODULE_UI).find((item) => item.appModule === module) || null;
}
