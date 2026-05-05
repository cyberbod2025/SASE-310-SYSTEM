import { CaseState, Student } from "../../types";
import { getPendingCases, OperationalPriority } from "../../utils/caseEngine";

export type TrabajoSocialInterventionStatus =
  | "asignado"
  | "seguimiento"
  | "contacto_familiar"
  | "visita_programada"
  | "acuerdos_en_proceso"
  | "alerta_sin_respuesta";

export type CitatorioResponse = "sin_respuesta" | "asistio" | "reprogramado";
export type ContactType = "llamada" | "mensaje" | "reunion";
export type ComplianceStatus = "cumplido" | "en_proceso" | "incumplido";

export interface TrabajoSocialCase {
  id: string;
  alumno: string;
  grupo: string;
  responsablePrevio: "Orientacion" | "Subdireccion" | "Direccion";
  estadoIntervencion: TrabajoSocialInterventionStatus;
  prioridad: OperationalPriority;
  motivo: string;
  riesgo: number;
  ultimaActividad: string | null;
  interventionPlan: string;
  student: Student;
}

export interface CitatorioRecord {
  id: string;
  caseId: string;
  numero: number;
  fecha: string;
  respuesta: CitatorioResponse;
}

export interface FamilyContactRecord {
  id: string;
  caseId: string;
  fecha: string;
  tipo: ContactType;
  resultado: string;
}

export interface HomeVisitRecord {
  id: string;
  caseId: string;
  fecha: string;
  observaciones: string;
  contextoFamiliar: string;
}

export interface ComplianceAgreement {
  id: string;
  caseId: string;
  acuerdo: string;
  responsable: string;
  estado: ComplianceStatus;
}

const today = () => new Date().toISOString().slice(0, 10);

const dateDaysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
};

const responsablePrevioFor = (state: CaseState): TrabajoSocialCase["responsablePrevio"] => {
  if (state === CaseState.SEGUIMIENTO) return "Subdireccion";
  if (state === CaseState.CERRADO) return "Direccion";
  return "Orientacion";
};

const statusFor = (state: CaseState, priority: OperationalPriority): TrabajoSocialInterventionStatus => {
  if (priority === "critica") return "alerta_sin_respuesta";
  if (state === CaseState.SEGUIMIENTO) return "acuerdos_en_proceso";
  if (state === CaseState.INTERVENCION) return "seguimiento";
  return "asignado";
};

export const statusLabels: Record<TrabajoSocialInterventionStatus, string> = {
  asignado: "Asignado",
  seguimiento: "Seguimiento activo",
  contacto_familiar: "Contacto familiar",
  visita_programada: "Visita programada",
  acuerdos_en_proceso: "Acuerdos en proceso",
  alerta_sin_respuesta: "Alerta sin respuesta",
};

export const priorityLabels: Record<OperationalPriority, string> = {
  critica: "Critica",
  alta: "Alta",
  media: "Media",
};

export const buildTrabajoSocialCases = (students: Student[]): TrabajoSocialCase[] => getPendingCases(students)
  .map((caseItem, index) => ({
    id: caseItem.id,
    alumno: caseItem.alumno,
    grupo: caseItem.grupo,
    responsablePrevio: responsablePrevioFor(caseItem.estado),
    estadoIntervencion: statusFor(caseItem.estado, caseItem.prioridad),
    prioridad: caseItem.prioridad,
    motivo: caseItem.motivo,
    riesgo: caseItem.riesgo,
    ultimaActividad: caseItem.ultimaActividad || dateDaysAgo(index === 0 ? 16 : 5),
    interventionPlan: caseItem.estado === CaseState.SEGUIMIENTO
      ? "Verificar cumplimiento de acuerdos familiares definidos por el equipo institucional."
      : "Establecer contacto familiar, documentar respuesta y asegurar continuidad del plan.",
    student: caseItem.student,
  }));

export const buildInitialCitatorios = (cases: TrabajoSocialCase[]): CitatorioRecord[] => cases.flatMap((caseItem, index) => {
  if (index === 0 || caseItem.prioridad === "critica") {
    return [1, 2, 3].map((numero) => ({
      id: `${caseItem.id}-citatorio-${numero}`,
      caseId: caseItem.id,
      numero,
      fecha: dateDaysAgo(10 - numero * 2),
      respuesta: "sin_respuesta" as const,
    }));
  }

  return [{
    id: `${caseItem.id}-citatorio-1`,
    caseId: caseItem.id,
    numero: 1,
    fecha: dateDaysAgo(3),
    respuesta: index % 2 === 0 ? "sin_respuesta" : "asistio",
  }];
});

export const buildInitialContacts = (cases: TrabajoSocialCase[]): FamilyContactRecord[] => cases.slice(0, 2).map((caseItem, index) => ({
  id: `${caseItem.id}-contacto-${index + 1}`,
  caseId: caseItem.id,
  fecha: dateDaysAgo(index + 1),
  tipo: index === 0 ? "llamada" : "mensaje",
  resultado: index === 0 ? "No contestan; se deja registro para segundo intento." : "Tutor confirma recepcion y queda pendiente reunion.",
}));

export const buildInitialVisits = (cases: TrabajoSocialCase[]): HomeVisitRecord[] => cases.slice(1, 2).map((caseItem) => ({
  id: `${caseItem.id}-visita-1`,
  caseId: caseItem.id,
  fecha: dateDaysAgo(4),
  observaciones: "Visita de verificacion realizada sin incidencias de seguridad.",
  contextoFamiliar: "Se requiere seguimiento de acuerdos y presencia del tutor.",
}));

export const buildInitialAgreements = (cases: TrabajoSocialCase[]): ComplianceAgreement[] => cases.flatMap((caseItem) => [
  {
    id: `${caseItem.id}-acuerdo-1`,
    caseId: caseItem.id,
    acuerdo: "Tutor asiste a reunion de seguimiento semanal.",
    responsable: "Familia",
    estado: "en_proceso" as const,
  },
  {
    id: `${caseItem.id}-acuerdo-2`,
    caseId: caseItem.id,
    acuerdo: "Alumno mantiene asistencia regular y reporta avances.",
    responsable: "Alumno y familia",
    estado: caseItem.prioridad === "critica" ? "incumplido" as const : "en_proceso" as const,
  },
]);

export const unansweredCitatoriosFor = (caseId: string, citatorios: CitatorioRecord[]) => citatorios
  .filter((citatorio) => citatorio.caseId === caseId && citatorio.respuesta === "sin_respuesta")
  .length;

export const hasThreeUnansweredCitatorios = (caseId: string, citatorios: CitatorioRecord[]) => unansweredCitatoriosFor(caseId, citatorios) >= 3;

export const createCitatorio = (caseId: string, currentCount: number): CitatorioRecord => ({
  id: `${caseId}-citatorio-${Date.now()}`,
  caseId,
  numero: currentCount + 1,
  fecha: today(),
  respuesta: "sin_respuesta",
});

export const createContact = (caseId: string, tipo: ContactType, resultado: string): FamilyContactRecord => ({
  id: `${caseId}-contacto-${Date.now()}`,
  caseId,
  fecha: today(),
  tipo,
  resultado: resultado.trim() || "Contacto registrado; resultado pendiente de confirmar.",
});

export const createVisit = (caseId: string, observaciones: string): HomeVisitRecord => ({
  id: `${caseId}-visita-${Date.now()}`,
  caseId,
  fecha: today(),
  observaciones: observaciones.trim() || "Visita domiciliaria registrada para seguimiento.",
  contextoFamiliar: "Contexto familiar reservado para expediente institucional.",
});
