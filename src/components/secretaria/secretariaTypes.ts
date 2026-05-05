import { Student } from "../../types";

export type ExpedienteStatus = "completo" | "incompleto";

export type SecretariaDocumentType = "citatorio" | "carta_compromiso" | "acta_hechos" | "constancia";

export interface SecretariaStudentSummary {
  id: string;
  name: string;
  matricula: string;
  curp?: string;
  group: string;
  birthdate?: string;
  guardianName?: string;
  guardianPhone?: string;
  documentsCount: number;
  expedienteStatus: ExpedienteStatus;
  missingFields: string[];
  student: Student;
}

export interface AdminAlert {
  id: string;
  label: string;
  detail: string;
  count: number;
  tone: "danger" | "warning" | "info";
  filter: (student: SecretariaStudentSummary) => boolean;
}

export interface SecretariaMetric {
  label: string;
  value: number | string;
  detail: string;
  icon: string;
}

export interface AgendaItem {
  id: string;
  title: string;
  detail: string;
  time: string;
}

export const DOCUMENT_OPTIONS: Array<{ type: SecretariaDocumentType; label: string; detail: string; icon: string }> = [
  {
    type: "citatorio",
    label: "Citatorio",
    detail: "Convocatoria institucional para madres, padres o tutores.",
    icon: "contact_mail",
  },
  {
    type: "carta_compromiso",
    label: "Carta compromiso",
    detail: "Acuerdo administrativo de entrega, registro o regularización documental.",
    icon: "edit_document",
  },
  {
    type: "acta_hechos",
    label: "Acta de hechos",
    detail: "Registro formal de trámite, entrega o aclaración administrativa.",
    icon: "description",
  },
  {
    type: "constancia",
    label: "Constancia",
    detail: "Documento escolar de inscripción, estudio o situación administrativa.",
    icon: "verified",
  },
];

export const AGENDA_ITEMS: AgendaItem[] = [
  {
    id: "agenda-padres",
    title: "Citas con madres, padres y tutores",
    detail: "Confirmar horarios y documentos requeridos antes de recepción.",
    time: "Hoy",
  },
  {
    id: "agenda-direccion",
    title: "Coordinación Dirección/Subdirección",
    detail: "Validar solicitudes administrativas pendientes de autorización.",
    time: "Semana",
  },
  {
    id: "agenda-ciclo",
    title: "Preparación de cierre de ciclo",
    detail: "Revisar grupos, expedientes incompletos y documentación escolar.",
    time: "Corte",
  },
];

const isMissing = (value?: string | null) => !String(value || "").trim();

export const buildStudentSummary = (student: Student): SecretariaStudentSummary => {
  const missingFields: string[] = [];
  const group = isMissing(student.group) ? "Sin grupo" : student.group;
  const documentsCount = student.documentos?.length || 0;
  const guardianPhone = student.guardianInfo?.phonePrimary;

  if (isMissing(student.curp)) missingFields.push("CURP");
  if (isMissing(student.group)) missingFields.push("grupo");
  if (!student.guardianInfo?.name) missingFields.push("tutor");
  if (isMissing(guardianPhone)) missingFields.push("teléfono de contacto");
  if (documentsCount === 0) missingFields.push("documentos");

  const expedienteStatus: ExpedienteStatus = student.documentationComplete === true || missingFields.length === 0
    ? "completo"
    : "incompleto";

  return {
    id: student.id,
    name: student.name,
    matricula: student.matricula,
    curp: student.curp,
    group,
    birthdate: student.birthdate,
    guardianName: student.guardianInfo?.name,
    guardianPhone,
    documentsCount,
    expedienteStatus,
    missingFields,
    student,
  };
};

export const getAdminAlerts = (students: SecretariaStudentSummary[]): AdminAlert[] => [
  {
    id: "sin-curp",
    label: "Expedientes sin CURP",
    detail: "Completar CURP antes de emitir documentos oficiales.",
    count: students.filter((student) => student.missingFields.includes("CURP")).length,
    tone: "danger",
    filter: (student) => student.missingFields.includes("CURP"),
  },
  {
    id: "sin-grupo",
    label: "Alumnos sin grupo asignado",
    detail: "Asignación pendiente para matrícula y listas institucionales.",
    count: students.filter((student) => student.missingFields.includes("grupo")).length,
    tone: "warning",
    filter: (student) => student.missingFields.includes("grupo"),
  },
  {
    id: "incompletos",
    label: "Expedientes incompletos",
    detail: "Revisar datos base, tutor y documentación asociada.",
    count: students.filter((student) => student.expedienteStatus === "incompleto").length,
    tone: "info",
    filter: (student) => student.expedienteStatus === "incompleto",
  },
  {
    id: "sin-documentos",
    label: "Documentos faltantes",
    detail: "Adjuntar documentos para cerrar validación administrativa.",
    count: students.filter((student) => student.documentsCount === 0).length,
    tone: "warning",
    filter: (student) => student.documentsCount === 0,
  },
];
