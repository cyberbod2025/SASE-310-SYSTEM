import { CaseLabels, CaseState, IncidentType, Student } from "../types";

export type OperationalPriority = "critica" | "alta" | "media";

export interface PendingCase {
  id: string;
  alumno: string;
  grupo: string;
  estado: CaseState;
  estadoLabel: string;
  riesgo: number;
  prioridad: OperationalPriority;
  motivo: string;
  incidentes: number;
  ultimaActividad: string | null;
  dueDate: string;
  overdue: boolean;
  student: Student;
}

export interface OverdueFollowUp {
  id: string;
  alumno: string;
  grupo: string;
  dueDate: string;
  diasVencido: number;
  accion: string;
  prioridad: OperationalPriority;
  student: Student;
}

export interface GroupPulse {
  grupo: string;
  total: number;
  activos: number;
  criticos: number;
  observados: number;
  riesgoPromedio: number;
  tendencia: "estable" | "presion" | "critica";
}

export interface TeacherRequest {
  id: string;
  docente: string;
  alumno: string;
  grupo: string;
  tipo: string;
  fecha: string;
  prioridad: OperationalPriority;
  accion: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const isActiveCase = (student: Student) => student.caseState !== CaseState.CERRADO;

const parseDate = (value?: string | null) => {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
};

const formatIsoDate = (time: number) => new Date(time).toISOString().slice(0, 10);

const daysBetween = (from: number, to = Date.now()) => Math.floor((to - from) / DAY_MS);

const latestIncidentTime = (student: Student) => {
  const times = (student.incidents || [])
    .map((incident) => parseDate(incident.fecha || incident.date))
    .filter((time): time is number => time !== null);
  return times.length ? Math.max(...times) : null;
};

const riskOf = (student: Student) => Number(student.puntajeRiesgo || 0);

const priorityOf = (student: Student): OperationalPriority => {
  const risk = riskOf(student);
  if (risk >= 75 || student.caseState === CaseState.INTERVENCION) return "critica";
  if (risk >= 50 || [CaseState.PATRON_DETECTADO, CaseState.SEGUIMIENTO].includes(student.caseState)) return "alta";
  return "media";
};

const dueDateFor = (student: Student) => {
  const latest = latestIncidentTime(student) || Date.now();
  const windowDays = student.caseState === CaseState.INTERVENCION
    ? 1
    : student.caseState === CaseState.SEGUIMIENTO
      ? 3
      : 5;
  return latest + windowDays * DAY_MS;
};

const caseReason = (student: Student) => {
  if (student.caseState === CaseState.INTERVENCION) return "Intervención activa requiere seguimiento operativo";
  if (student.caseState === CaseState.SEGUIMIENTO) return "Seguimiento institucional pendiente";
  if (student.caseState === CaseState.PATRON_DETECTADO) return "Patrón detectado por acumulación de incidencias";
  if (student.caseState === CaseState.EN_ANALISIS) return "Análisis de trayectoria en curso";
  return CaseLabels[student.caseState] || "Caso abierto";
};

export const getPendingCases = (students: Student[]): PendingCase[] => students
  .filter(isActiveCase)
  .map((student) => {
    const dueDate = dueDateFor(student);
    const latest = latestIncidentTime(student);
    return {
      id: student.id,
      alumno: student.name,
      grupo: student.group,
      estado: student.caseState,
      estadoLabel: CaseLabels[student.caseState],
      riesgo: riskOf(student),
      prioridad: priorityOf(student),
      motivo: caseReason(student),
      incidentes: student.incidents?.length || 0,
      ultimaActividad: latest ? formatIsoDate(latest) : null,
      dueDate: formatIsoDate(dueDate),
      overdue: Date.now() > dueDate,
      student,
    };
  })
  .sort((a, b) => Number(b.overdue) - Number(a.overdue) || b.riesgo - a.riesgo || b.incidentes - a.incidentes);

export const getOverdueFollowUps = (students: Student[]): OverdueFollowUp[] => getPendingCases(students)
  .filter((caseItem) => caseItem.overdue || caseItem.prioridad === "critica")
  .map((caseItem) => {
    const dueTime = parseDate(caseItem.dueDate) || Date.now();
    return {
      id: `${caseItem.id}-follow-up`,
      alumno: caseItem.alumno,
      grupo: caseItem.grupo,
      dueDate: caseItem.dueDate,
      diasVencido: Math.max(0, daysBetween(dueTime)),
      accion: caseItem.estado === CaseState.INTERVENCION ? "Validar intervención y responsable" : "Programar seguimiento",
      prioridad: caseItem.prioridad,
      student: caseItem.student,
    };
  });

export const getGroupPulse = (students: Student[]): GroupPulse[] => {
  const groups = students.reduce<Record<string, Student[]>>((acc, student) => {
    const group = student.group || "Sin grupo";
    acc[group] = acc[group] || [];
    acc[group].push(student);
    return acc;
  }, {});

  return Object.entries(groups)
    .map(([grupo, groupStudents]) => {
      const activos = groupStudents.filter(isActiveCase).length;
      const criticos = groupStudents.filter((student) => priorityOf(student) === "critica").length;
      const observados = groupStudents.filter((student) => student.caseState === CaseState.OBSERVADO).length;
      const riesgoPromedio = groupStudents.length
        ? Math.round(groupStudents.reduce((total, student) => total + riskOf(student), 0) / groupStudents.length)
        : 0;
      return {
        grupo,
        total: groupStudents.length,
        activos,
        criticos,
        observados,
        riesgoPromedio,
        tendencia: criticos > 1 || riesgoPromedio >= 70 ? "critica" : activos > 3 || riesgoPromedio >= 45 ? "presion" : "estable",
      } satisfies GroupPulse;
    })
    .sort((a, b) => b.criticos - a.criticos || b.riesgoPromedio - a.riesgoPromedio || a.grupo.localeCompare(b.grupo));
};

export const getTeacherRequests = (students: Student[]): TeacherRequest[] => students
  .flatMap((student) => (student.incidents || []).map((incident) => ({ student, incident })))
  .filter(({ incident }) => {
    const reporter = String(incident.reporta || incident.reportedBy || "").toLowerCase();
    return reporter.includes("docente") || reporter.includes("tutor") || incident.type === IncidentType.ACADEMICO;
  })
  .map(({ student, incident }) => ({
    id: incident.id,
    docente: incident.reporta || incident.reportedBy || "Docente",
    alumno: student.name,
    grupo: student.group,
    tipo: incident.type,
    fecha: (incident.fecha || incident.date || "").slice(0, 10),
    prioridad: incident.gravedad === "critica" || riskOf(student) >= 75 ? "critica" : incident.gravedad === "grave" || riskOf(student) >= 50 ? "alta" : "media",
    accion: incident.type === IncidentType.ACADEMICO ? "Revisar apoyo académico" : "Responder solicitud docente",
  }))
  .sort((a, b) => b.fecha.localeCompare(a.fecha))
  .slice(0, 8);
