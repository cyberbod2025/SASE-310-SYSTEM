export enum UserRole {
  DIRECTIVO = "directivo",
  DOCENTE = "docente",
  DOCENTE_TUTOR = "docente_tutor",
  PREFECTURA = "prefectura",
  ORIENTACION = "orientacion",
  TRABAJO_SOCIAL = "trabajo_social",
  ENFERMERIA = "enfermeria",
  SECRETARIA = "secretaria",
  UDEII = "udeii",
  PROMOTORA = "promotora", // Promotora de Lectura
  GUEST = "guest",
  DEVELOPER = "developer", // God Mode
}

export const RoleLabels: Record<UserRole, string> = {
  [UserRole.DIRECTIVO]: "Dirección",
  [UserRole.DOCENTE]: "Docente",
  [UserRole.DOCENTE_TUTOR]: "Docente Tutor",
  [UserRole.PREFECTURA]: "Prefectura",
  [UserRole.ORIENTACION]: "Orientación",
  [UserRole.TRABAJO_SOCIAL]: "Trabajo Social",
  [UserRole.ENFERMERIA]: "Enfermería",
  [UserRole.SECRETARIA]: "Secretaría",
  [UserRole.UDEII]: "UDEII",
  [UserRole.PROMOTORA]: "Promotora de Lectura",
  [UserRole.GUEST]: "Invitado",
  [UserRole.DEVELOPER]: "Desarrollador (Acceso Total)",
};

export enum CaseState {
  OBSERVADO = "Observado", // 1-2 Incidents
  PATRON_DETECTADO = "Patrón Detectado", // 3 Incidents
  EN_ANALISIS = "En Análisis",
  INTERVENCION = "Intervención",
  SEGUIMIENTO = "Seguimiento",
  CERRADO = "Cerrado",
}

export enum IncidentType {
  ASISTENCIA = "Asistencia / Falta",
  RETARDO = "Retardo",
  CONDUCTA = "Incidencia Conductual",
  ACADEMICO = "Observación Académica",
  SALUD = "Atención Médica",
  UNIFORME = "Falta de Uniforme",
}

export interface Incident {
  id: string;
  studentId: string;
  type: IncidentType;
  description: string;
  date: string; // ISO string
  reportedBy: string; // Role or Name
  subject?: string; // Optional: Academic subject
  comments?: string; // Optional: Additional supervisor comments
  evidence?: string[]; // Optional: URLs to images/docs
}

export interface Justificante {
  id: string;
  folio: string;
  startDate: string;
  endDate: string;
  reason: "Médico" | "Social" | "Legal";
  description: string;
  issuedBy: string;
  issuedAt: string;
}

export interface BAPInfo {
  hasBAP: boolean;
  diagnosisPrivate: string; // Only visible to UDEII
  accommodations: string[]; // Visible to Teachers
  lastUpdated: string;
}

export interface GuardianInfo {
  name: string;
  relationship: string;
  phonePrimary: string;
  phoneSecondary?: string;
  email?: string;
  address?: string;
  details?: any; // Para metadatos extra como 'is_udeii'
  photoUrl?: string; // New: Foto del Responsable
}

export interface Student {
  id: string;
  matricula: string;
  name: string;
  birthdate?: string; // ISO Date
  gender?: "M" | "F" | "X";
  previousGpa?: number;
  group: string;
  avatar: string;
  caseState: CaseState;
  incidents: Incident[];
  medicalAlerts?: string[];
  // New Modules
  guardianInfo?: GuardianInfo; // Protected: Secretariat/Tutor only
  lastModifiedBy?: string;
  lastModifiedAt?: string; // ISO Date
  bapInfo?: BAPInfo;
  justificantes: Justificante[];
}

export type ProtocolType =
  | "convivencia"
  | "salud"
  | "proteccion_civil"
  | "apoyo";

export interface Protocol {
  id: string;
  titulo: string;
  tipo: ProtocolType;
  objetivo: string;
  activacion: string;
  fuente: string;
  roles_responsables: string[];
  icono: string;
}

export interface ProtocolStep {
  id: string;
  protocolo_id: string;
  orden: number;
  accion: string;
  descripcion_detalle?: string;
  es_advertencia: boolean;
  rol_responsable?: string;
}

export interface ProtocolActivation {
  id: string;
  protocolo_id: string;
  incidencia_id?: string;
  usuario_id: string;
  fecha_inicio: string;
  estado: "activo" | "finalizado";
  paso_actual?: number;
}

// Helper to determine state based on incident count
export const calculateState = (incidents: Incident[]): CaseState => {
  const recentCount = incidents.length;
  if (recentCount === 0) return CaseState.CERRADO;
  if (recentCount < 3) return CaseState.OBSERVADO;
  return CaseState.PATRON_DETECTADO;
};

export enum AppModule {
  DASHBOARD = "dashboard",
  INSCRIPCIONES = "inscripciones",
  ARCHIVO = "archivo",
  AGENDA = "agenda",
  REPORTES = "reportes",
  NOTIFICATIONS = "notifications",
  BITACORA = "bitacora",
  SOLICITUDES = "solicitudes",
  REPORTES_DOCENTES = "reportes_docentes",
  PROTOCOLOS = "protocolos",
  APROBACIONES_PERSONAL = "aprobaciones_personal",
  NOT_FOUND = "not_found",
  HOME = "home",
}

export interface Group {
  id: string;
  nombre: string;
  tutor_id?: string;
  ciclo_escolar: string;
}

export interface TeacherAssignment {
  id: string;
  profesor_id: string;
  grupo_id: string;
  materia: string;
}
