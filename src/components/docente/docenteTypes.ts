import { Incident, IncidentType, Student } from "../../types";

export type QuickIncidentKind = "conducta" | "material" | "agresion" | "incumplimiento";

export type TeacherIncidentStatus = "abierta" | "escalada";

export interface QuickIncidentOption {
  kind: QuickIncidentKind;
  label: string;
  detail: string;
  icon: string;
  incidentType: IncidentType;
  defaultDescription: string;
}

export interface TeacherStudentSummary {
  id: string;
  name: string;
  matricula: string;
  group: string;
  avatar?: string;
  student: Student;
}

export interface TeacherGroupSummary {
  id: string;
  name: string;
  total: number;
  incidentsToday: number;
}

export interface TeacherIncidentSummary {
  id: string;
  studentId: string;
  studentName: string;
  group: string;
  type: string;
  description: string;
  date: string;
  status: TeacherIncidentStatus;
  hasEvidence: boolean;
}

export interface TeacherAlert {
  id: string;
  label: string;
  detail: string;
  count: number;
  tone: "warning" | "info" | "danger";
}

export interface QuickIncidentDraft {
  studentId: string;
  kind: QuickIncidentKind | "";
  description: string;
  evidenceNote: string;
  evidenceFileName: string;
}

export const QUICK_INCIDENT_OPTIONS: QuickIncidentOption[] = [
  {
    kind: "conducta",
    label: "Conducta",
    detail: "Interrupción, indisciplina o convivencia en aula.",
    icon: "campaign",
    incidentType: IncidentType.CONDUCTA,
    defaultDescription: "Observación de conducta en clase",
  },
  {
    kind: "material",
    label: "Falta de material",
    detail: "No trae materiales, tarea o recursos solicitados.",
    icon: "inventory_2",
    incidentType: IncidentType.ACADEMICO,
    defaultDescription: "Falta de material para la actividad",
  },
  {
    kind: "agresion",
    label: "Agresión",
    detail: "Situación que requiere atención inmediata del equipo escolar.",
    icon: "report",
    incidentType: IncidentType.CONDUCTA,
    defaultDescription: "Reporte por agresión o conflicto entre alumnos",
  },
  {
    kind: "incumplimiento",
    label: "Incumplimiento",
    detail: "No cumple actividad, acuerdo o indicación básica.",
    icon: "assignment_late",
    incidentType: IncidentType.ACADEMICO,
    defaultDescription: "Incumplimiento de actividad o acuerdo de clase",
  },
];

const todayKey = () => new Date().toISOString().slice(0, 10);

const incidentDate = (incident: Incident) => incident.fecha || incident.date || "";

const isToday = (incident: Incident) => incidentDate(incident).slice(0, 10) === todayKey();

const normalize = (value?: string | null) => String(value || "").trim().toLowerCase();

export const getTeacherIdentityTokens = (profile: any, userEmail?: string) => [
  normalize(profile?.nombre),
  normalize(profile?.nombre_completo),
  normalize(profile?.nombres),
  normalize(userEmail),
  normalize(userEmail?.split("@")[0]),
].filter(Boolean);

export const buildTeacherStudents = (students: Student[]): TeacherStudentSummary[] => students.map((student) => ({
  id: student.id,
  name: student.name,
  matricula: student.matricula,
  group: student.group || "Sin grupo",
  avatar: student.avatar,
  student,
}));

export const buildTeacherGroups = (students: TeacherStudentSummary[]): TeacherGroupSummary[] => {
  const groups = students.reduce<Record<string, TeacherStudentSummary[]>>((acc, student) => {
    const groupName = student.group || "Sin grupo";
    acc[groupName] = [...(acc[groupName] || []), student];
    return acc;
  }, {});

  return Object.entries(groups)
    .map(([name, groupStudents]) => ({
      id: name,
      name,
      total: groupStudents.length,
      incidentsToday: groupStudents.reduce(
        (total, student) => total + (student.student.incidents || []).filter(isToday).length,
        0,
      ),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

const isOwnIncident = (incident: Incident, role: string, identityTokens: string[]) => {
  const reporter = normalize(incident.reporta || incident.reportedBy || incident.reportadoPorDocente);
  if (reporter === normalize(role)) return true;
  return identityTokens.some((token) => reporter.includes(token));
};

export const buildRecentTeacherIncidents = (
  students: TeacherStudentSummary[],
  role: string,
  identityTokens: string[],
): TeacherIncidentSummary[] => students
  .flatMap((student) => (student.student.incidents || []).map((incident) => ({ student, incident })))
  .filter(({ incident }) => isOwnIncident(incident, role, identityTokens))
  .map(({ student, incident }) => {
    const status: TeacherIncidentStatus = incident.gravedad === "grave" || incident.gravedad === "critica"
      ? "escalada"
      : "abierta";

    return {
      id: incident.id,
      studentId: student.id,
      studentName: student.name,
      group: student.group,
      type: incident.type,
      description: incident.description,
      date: incidentDate(incident),
      status,
      hasEvidence: Array.isArray(incident.evidence) && incident.evidence.length > 0,
    };
  })
  .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
  .slice(0, 8);

export const getTeacherAlerts = (incidents: TeacherIncidentSummary[]): TeacherAlert[] => {
  const missingEvidence = incidents.filter((incident) => !incident.hasEvidence).length;
  const shortReports = incidents.filter((incident) => incident.description.trim().length < 12).length;

  return [
    {
      id: "sin-evidencia",
      label: "Incidencias sin evidencia",
      detail: "Puedes agregar una foto o nota breve cuando sea útil.",
      count: missingEvidence,
      tone: missingEvidence > 0 ? "warning" : "info",
    },
    {
      id: "reportes-cortos",
      label: "Reportes por completar",
      detail: "Una descripción corta puede bastar, pero agrega contexto si aplica.",
      count: shortReports,
      tone: shortReports > 0 ? "danger" : "info",
    },
  ];
};
