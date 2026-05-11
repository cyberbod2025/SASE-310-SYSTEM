import { AppModule } from "../../../types";
import type { Student } from "../../../types";
import type { SasitoEntities, SasitoIntent, SasitoIntentResult, SasitoRuntimeContext } from "./types";

export interface SasitoIntentInput {
  text: string;
  context: SasitoRuntimeContext;
}

const LOW_CONFIDENCE_THRESHOLD = 0.65;

export const normalizeSasitoText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9@.\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const hasAny = (normalizedText: string, keywords: string[]) =>
  keywords.some((keyword) => normalizedText.includes(normalizeSasitoText(keyword)));

const mergeEntities = (...entities: SasitoEntities[]) =>
  entities.reduce<SasitoEntities>((merged, entity) => {
    const rawMatches = [...(merged.rawMatches || []), ...(entity.rawMatches || [])];
    return {
      ...merged,
      ...entity,
      rawMatches: rawMatches.length > 0 ? rawMatches : undefined,
    };
  }, {});

const selectedStudentEntity = (context: SasitoRuntimeContext): SasitoEntities => {
  if (!context.selectedStudent) return {};

  return {
    studentId: context.selectedStudent.id,
    studentName: context.selectedStudent.name,
    group: context.selectedStudent.group,
    rawMatches: [context.selectedStudent.name],
    source: "selected_context",
  };
};

const findStudentMention = (text: string, students: Student[]): SasitoEntities => {
  if (students.length === 0) return {};

  const normalizedText = normalizeSasitoText(text);
  const match = students.find((student) => {
    const normalizedName = normalizeSasitoText(student.name || "");
    const normalizedMatricula = normalizeSasitoText(student.matricula || "");
    return (
      normalizedName.length > 2 && normalizedText.includes(normalizedName)
    ) || (
      normalizedMatricula.length > 2 && normalizedText.includes(normalizedMatricula)
    );
  });

  if (!match) return {};

  return {
    studentId: match.id,
    studentName: match.name,
    group: match.group,
    rawMatches: [match.name],
    source: "explicit_text",
  };
};

const findGroupMention = (text: string, context: SasitoRuntimeContext): SasitoEntities => {
  const normalizedText = normalizeSasitoText(text).toUpperCase();
  const match = normalizedText.match(/\b([1-6])\s*-?\s*([A-Z])\b/);

  if (match) {
    return {
      group: `${match[1]}${match[2]}`,
      rawMatches: [match[0]],
      source: "explicit_text",
    };
  }

  if (context.selectedGroup && hasAny(normalizedText.toLowerCase(), ["grupo", "mi grupo", "este grupo"])) {
    return {
      group: context.selectedGroup,
      rawMatches: [context.selectedGroup],
      source: "selected_context",
    };
  }

  return {};
};

const findCaseContext = (text: string, context: SasitoRuntimeContext): SasitoEntities => {
  if (!context.selectedCase) return {};

  const normalizedText = normalizeSasitoText(text);
  if (!hasAny(normalizedText, ["caso", "este caso", "seguimiento", "que sigue", "siguiente paso"])) {
    return {};
  }

  return {
    caseId: context.selectedCase.id,
    studentId: context.selectedCase.studentId,
    studentName: context.selectedCase.studentName,
    caseStatus: context.selectedCase.status,
    rawMatches: [context.selectedCase.id],
    source: "selected_context",
  };
};

const moduleEntity = (moduleKeyword: string, moduleTarget: AppModule): SasitoEntities => ({
  moduleKeyword,
  moduleTarget,
  rawMatches: [moduleKeyword],
});

const result = (
  intent: SasitoIntent,
  confidence: number,
  reason: string,
  entities: SasitoEntities = {},
  moduleTarget?: AppModule,
): SasitoIntentResult => ({
  intent: confidence < LOW_CONFIDENCE_THRESHOLD ? "unknown" : intent,
  confidence,
  entities: confidence < LOW_CONFIDENCE_THRESHOLD ? {} : entities,
  moduleTarget: confidence < LOW_CONFIDENCE_THRESHOLD ? undefined : moduleTarget,
  reason: confidence < LOW_CONFIDENCE_THRESHOLD ? "Confianza insuficiente para ejecutar una accion segura." : reason,
});

export function detectSasitoIntent({ text, context }: SasitoIntentInput): SasitoIntentResult {
  const normalized = normalizeSasitoText(text);
  const explicitStudent = findStudentMention(text, context.students || []);
  const baseStudent = Object.keys(explicitStudent).length > 0 ? explicitStudent : selectedStudentEntity(context);
  const group = findGroupMention(text, context);
  const selectedCase = findCaseContext(text, context);
  const contextualEntities = mergeEntities(baseStudent, group, selectedCase);

  if (!normalized) {
    return result("unknown", 0, "No hay texto para clasificar.");
  }

  if (hasAny(normalized, ["reporte rapido", "registro rapido", "incidencia", "registrar incidencia", "crear incidencia", "levantar reporte", "reportar alumno"])) {
    return result("open_quick_register", 0.94, "El usuario solicita registrar una incidencia o reporte rapido.", contextualEntities);
  }

  if (hasAny(normalized, ["diagnostico colectivo", "diagnostico de grupo", "diagnostico grupal", "reporte colectivo", "diagnostico 1a", "diagnostico 2b", "diagnostico 3c"])) {
    const entities = mergeEntities(contextualEntities, moduleEntity("diagnostico colectivo", AppModule.DIAGNOSTICO));
    return result("open_collective_diagnosis", 0.92, "El usuario solicita abrir Diagnostico Colectivo.", entities, AppModule.DIAGNOSTICO);
  }

  if (hasAny(normalized, ["que sigue", "siguiente paso", "que hago", "como procedo", "proxima accion", "siguiente accion"])) {
    return result("explain_next_step", 0.9, "El usuario pide orientacion operativa sobre el siguiente paso.", contextualEntities);
  }

  if (hasAny(normalized, ["salud", "medico", "servicio medico", "enfermeria", "alergia", "padecimiento", "medicamento", "historial medico"])) {
    const entities = mergeEntities(contextualEntities, moduleEntity("salud", AppModule.SALUD));
    return result("open_health_module", 0.88, "El usuario solicita informacion o modulo de salud.", entities, AppModule.SALUD);
  }

  if (hasAny(normalized, ["orientacion", "casos de orientacion", "casos orientacion", "socioemocional", "canalizacion", "seguimiento psicopedagogico"])) {
    const entities = mergeEntities(contextualEntities, moduleEntity("orientacion", AppModule.REPORTES));
    return result("open_orientation_cases", 0.86, "El usuario solicita casos de Orientacion.", entities, AppModule.REPORTES);
  }

  if (hasAny(normalized, ["abrir expediente", "expediente", "historial", "archivo del alumno", "record del alumno", "antecedentes"])) {
    const entities = mergeEntities(contextualEntities, moduleEntity("expedientes", AppModule.EXPEDIENTES));
    return result("open_student_record", 0.86, "El usuario solicita abrir o consultar expediente.", entities, AppModule.EXPEDIENTES);
  }

  if (hasAny(normalized, ["notificaciones", "avisos", "campana", "pendientes por leer", "pendientes"])) {
    const entities = moduleEntity("notificaciones", AppModule.NOTIFICATIONS);
    return result("show_notifications", 0.88, "El usuario solicita revisar notificaciones.", entities, AppModule.NOTIFICATIONS);
  }

  if (hasAny(normalized, ["buscar alumno", "buscar a", "busca a", "encuentra a", "localiza a", "donde esta"]) || explicitStudent.studentId) {
    return result("search_student", 0.8, "El usuario solicita busqueda de alumno.", mergeEntities(explicitStudent, group));
  }

  return result("unknown", 0.2, "No se encontro una intencion institucional segura.");
}
