import { AIPromptTemplate } from "./types";

export const PROMPTS: Record<string, AIPromptTemplate> = {
  // Orientación: Análisis de Patrones
  ANALYZE_RISK_PATTERN: (context: {
    studentName: string;
    incidents: any[];
  }) => {
    return `Analiza el siguiente historial de incidencias del alumno ${
      context.studentName
    }:
    ${JSON.stringify(
      context.incidents
    )}. Identifica patrones de riesgo conductual o emocional y sugiere 3 estrategias de intervención pedagógica. Responde en formato JSON.`;
  },

  // Dirección: Resumen Ejecutivo
  GENERATE_EXECUTIVE_SUMMARY: (context: { stats: any }) => {
    return `Genera un resumen ejecutivo de 3 párrafos para el Director escolar basado en las siguientes estadísticas del día: ${JSON.stringify(
      context.stats
    )}. Enfócate en asistencia, seguridad y puntos críticos.`;
  },

  // Docente: Sugerencia de Planeación
  SUGGEST_ACTIVITY: (context: { topic: string; grade: string }) => {
    return `Suggere una actividad didáctica de 50 minutos para el tema "${context.topic}" dirigida a alumnos de ${context.grade}. Incluye objetivos, materiales y rúbrica de evaluación simple.`;
  },
};
