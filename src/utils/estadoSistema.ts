import { Student, CaseState } from "../types";

export type SystemStatus =
  | "green"
  | "yellow"
  | "red"
  | "blue"
  | "thinking"
  | "gold";

/**
 * Calcula el estado del semáforo institucional basado en la salud de la escuela
 * y la actividad de la IA.
 */
export const calcularEstadoSistema = (
  students: Student[],
  isAssistantOpen: boolean,
  assistantStatus: string,
): SystemStatus => {
  // 1. Interacción activa (Dorado Institucional)
  if (isAssistantOpen) return "gold";

  // 2. IA Procesando (Procesando)
  if (assistantStatus === "thinking") return "thinking";

  // 3. Casos Críticos (Rojo)
  const hasCriticalCases = students.some(
    (s) =>
      s.caseState === CaseState.INTERVENCION ||
      s.caseState === CaseState.PATRON_DETECTADO,
  );

  const hasMedicalAlerts = students.some(
    (s) => s.medicalAlerts && s.medicalAlerts.length > 0,
  );

  if (hasCriticalCases || hasMedicalAlerts) return "red";

  // 4. Incidencias del Día (Amarillo)
  const today = new Date().toISOString().split("T")[0];
  const hasIncidentsToday = students.some((s) =>
    s.incidents?.some((i) => i.date.startsWith(today)),
  );

  if (hasIncidentsToday) return "yellow";

  // 5. Estado Óptimo / IA Activa (Gris/Dorado)
  const hasAIKey = !!import.meta.env.VITE_GOOGLE_API_KEY;
  if (hasAIKey) return "gold";

  // 6. Estable (Dorado por defecto)
  return "gold";
};
