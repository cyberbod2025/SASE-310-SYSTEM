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
      context.incidents,
    )}. Identifica patrones de riesgo conductual o emocional y sugiere 3 estrategias de intervención pedagógica. Responde en formato JSON.`;
  },

  // Dirección: Resumen Ejecutivo
  GENERATE_EXECUTIVE_SUMMARY: (context: { stats: any }) => {
    return `Genera un resumen ejecutivo de 3 párrafos para el Director escolar basado en las siguientes estadísticas del día: ${JSON.stringify(
      context.stats,
    )}. Enfócate en asistencia, seguridad y puntos críticos.`;
  },

  SUGGEST_ACTIVITY: (context: { topic: string; grade: string }) => {
    return `Suggere una actividad didáctica de 50 minutos para el tema "${context.topic}" dirigida a alumnos de ${context.grade}. Incluye objetivos, materiales y rúbrica de evaluación simple.`;
  },

  GENERATE_NARRATIVE_FACTS: (context: {
    studentName: string;
    incidentType: string;
    details: string;
    date: string;
  }) => {
    return `Genera una NARRACIÓN DE HECHOS institucional y formal para una Bitácora o Acta Administrativa Escolar, basada estrictamente en el "Marco para la Convivencia Escolar de la CDMX".
    
    Alumno: ${context.studentName}
    Tipo de incidencia: ${context.incidentType}
    Fecha: ${context.date}
    Detalles Reportados: "${context.details}"

    INSTRUCCIONES CLAVE:
    1. Usa lenguaje técnico-pedagógico, neutral y objetivo. Evita juicios de valor.
    2. Clasifica la falta según el Marco (Leve, Moderada, Grave).
    3. NO hables de "castigos", usa el término "ACCIONES FORMATIVAS" o "MEDIDAS DISCIPLINARIAS FORMATIVAS".
    4. Sugiere una ruta de actuación basada en la progresividad (Diálogo -> Compromiso -> Inclusión Familiar).
    5. Menciona artículos aplicables si los detectas (ej. corresponsabilidad de los padres).`;
  },

  GENERATE_MINUTA_ACUERDO: (context: {
    participants: string[];
    topic: string;
    agreements: string[];
  }) => {
    return `Genera una minuta de reunión escolar formal. Participantes: ${context.participants.join(
      ", ",
    )}. Tema: ${context.topic}. Acuerdos alcanzados: ${context.agreements.join(
      "; ",
    )}. Estructura el documento con: Antecedentes, Desarrollo de la reunión, Acuerdos y Compromisos, y Cierre.`;
  },

  GENERATE_DISTANCE_LEARNING_REQUEST: (context: {
    studentName: string;
    reason: string;
    startDate: string;
    endDate: string;
  }) => {
    return `Genera una circular dirigida a los docentes solicitando actividades académicas para el alumno ${context.studentName}, quien se encontrará en modalidad "A Distancia" por motivos de ${context.reason} desde el ${context.startDate} hasta el ${context.endDate}. Solicita que las actividades sean entregadas vía correo o plataforma institucional para garantizar el derecho a la educación del alumno.`;
  },
};
