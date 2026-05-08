import { AppModule } from "../../../types";
import type { Student } from "../../../types";
import type { SasitoEntities, SasitoIntent, SasitoIntentResult, SasitoRuntimeContext } from "./types";

interface SasitoIntentInput {
  text: string;
  context: SasitoRuntimeContext;
}

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const hasAny = (normalizedText: string, keywords: string[]) =>
  keywords.some((keyword) => normalizedText.includes(normalizeText(keyword)));

const findStudentMention = (text: string, students: Student[]): SasitoEntities => {
  const normalizedText = normalizeText(text);
  const match = students.find((student) => {
    const normalizedName = normalizeText(student.name || "");
    return normalizedName.length > 2 && normalizedText.includes(normalizedName);
  });

  if (!match) return {};

  return {
    studentId: match.id,
    studentName: match.name,
    group: match.group,
    rawMatches: [match.name],
  };
};

const result = (
  intent: SasitoIntent,
  confidence: number,
  reason: string,
  entities: SasitoEntities = {},
  moduleTarget?: AppModule,
): SasitoIntentResult => ({
  intent,
  confidence,
  entities,
  moduleTarget,
  reason,
});

export function detectSasitoIntent({ text, context }: SasitoIntentInput): SasitoIntentResult {
  const normalized = normalizeText(text);
  const studentEntities = findStudentMention(text, context.students || []);

  if (!normalized) {
    return result("unknown", 0, "No hay texto para clasificar.");
  }

  if (hasAny(normalized, ["reporte rapido", "registro rapido", "registrar incidencia", "crear incidencia", "levantar reporte", "reportar alumno"])) {
    return result("open_quick_register", 0.92, "El usuario solicita registrar una incidencia o reporte rapido.");
  }

  if (hasAny(normalized, ["diagnostico colectivo", "diagnostico de grupo", "diagnostico grupal", "reporte colectivo"])) {
    return result("open_collective_diagnosis", 0.9, "El usuario solicita abrir Diagnostico Colectivo.", {}, AppModule.DIAGNOSTICO);
  }

  if (hasAny(normalized, ["que sigue", "siguiente paso", "que hago", "como procedo", "proxima accion"])) {
    return result("explain_next_step", 0.88, "El usuario pide orientacion operativa sobre el siguiente paso.");
  }

  if (hasAny(normalized, ["salud", "medico", "enfermeria", "alergia", "padecimiento", "medicamento"])) {
    return result("open_health_module", 0.86, "El usuario solicita informacion o modulo de salud.", studentEntities, AppModule.SALUD);
  }

  if (hasAny(normalized, ["orientacion", "casos de orientacion", "socioemocional", "canalizacion", "seguimiento psicopedagogico"])) {
    return result("open_orientation_cases", 0.84, "El usuario solicita casos de Orientacion.", studentEntities, AppModule.REPORTES);
  }

  if (hasAny(normalized, ["expediente", "historial", "archivo del alumno", "record del alumno", "antecedentes"])) {
    return result("open_student_record", 0.84, "El usuario solicita abrir o consultar expediente.", studentEntities, AppModule.EXPEDIENTES);
  }

  if (hasAny(normalized, ["notificaciones", "avisos", "campana", "pendientes por leer"])) {
    return result("show_notifications", 0.86, "El usuario solicita revisar notificaciones.", {}, AppModule.NOTIFICATIONS);
  }

  if (hasAny(normalized, ["buscar alumno", "busca a", "encuentra a", "localiza a", "donde esta"]) || studentEntities.studentId) {
    return result("search_student", 0.78, "El usuario solicita busqueda de alumno.", studentEntities);
  }

  return result("unknown", 0.2, "No se encontro una intencion institucional segura.");
}
