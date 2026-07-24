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

export interface SocialInterventionRecord {
  id: string;
  caseId: string;
  fecha: string;
  accion: string;
  resultado: string;
  notas: string | null;
}

const today = () => new Date().toISOString().slice(0, 10);

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
  .map((caseItem) => ({
    id: caseItem.id,
    alumno: caseItem.alumno,
    grupo: caseItem.grupo,
    responsablePrevio: responsablePrevioFor(caseItem.estado),
    estadoIntervencion: statusFor(caseItem.estado, caseItem.prioridad),
    prioridad: caseItem.prioridad,
    motivo: caseItem.motivo,
    riesgo: caseItem.riesgo,
    ultimaActividad: caseItem.ultimaActividad || null,
    interventionPlan: caseItem.estado === CaseState.SEGUIMIENTO
      ? "Verificar cumplimiento de acuerdos familiares definidos por el equipo institucional."
      : "Establecer contacto familiar, documentar respuesta y asegurar continuidad del plan.",
    student: caseItem.student,
  }));

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
