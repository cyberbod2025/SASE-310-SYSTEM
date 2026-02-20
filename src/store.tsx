import React, { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { supabase } from "./supabase/client";
import { useAuth } from "./components/AuthProvider";
import {
  Student,
  Incident,
  UserRole,
  CaseState,
  IncidentType,
  Justificante,
  GuardianInfo,
  BAPInfo,
  calculateState,
  AppModule,
  Calificacion,
  DocumentoInstitucional,
  RoleLabels,
  SystemNotice,
  CredencialStatus,
} from "./types";
import { evaluateEscalation } from "./utils/saseUtils";
import { getSaludo } from "./config/sase.config";

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  time: string;
  type?: "info" | "warning" | "success" | "error" | "SYSTEM";
  actionModule?: AppModule; // Module to navigate to when clicked
  actionData?: any; // Additional data for the action
  targetRole?: UserRole; // Role that should see this notification
}

export interface Suministro {
  id: string;
  nombre: string;
  cantidad: number;
  cantidadMaxima: number;
  categoria: string;
  unidad: string;
}

export interface DailyStats {
  attendanceCount: number;
  lateCount: number;
}

// Tipos de acción para auditoría
export type AuditActionType =
  | "CONSULTA"
  | "ACTUALIZACION"
  | "CREACION"
  | "ELIMINACION";

interface AppContextType {
  currentUserRole: UserRole;
  switchRole: (role: UserRole) => void;
  students: Student[];
  addIncident: (
    studentId: string,
    type: IncidentType,
    description: string,
  ) => void;
  addJustificante: (
    studentId: string,
    data: Omit<Justificante, "id" | "issuedAt" | "folio">,
  ) => void;
  importStudents: (newStudents: Student[]) => void;
  quickRegisterOpen: boolean;
  setQuickRegisterOpen: (open: boolean) => void;
  quickRegisterType: IncidentType;
  openQuickRegister: (type?: IncidentType) => void;
  assistantMessage: string | null;
  isTutorMode: boolean;
  toggleTutorMode: () => void;
  logAccess: (action: string, studentId: string, studentName?: string) => void;
  logAudit: (
    actionType: AuditActionType,
    description: string,
    targetTable: string,
    targetRecordId: string,
    studentName?: string,
    oldValues?: any,
    newValues?: any,
  ) => Promise<void>;
  currentModule: AppModule;
  setCurrentModule: (module: AppModule) => void;
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  updateStudentAudit: (studentId: string, modifiedBy: string) => void;
  // New: Advanced Management
  updateGrades: (studentId: string, grades: Calificacion[]) => Promise<void>;
  addInstitutionalDocument: (
    doc: Omit<DocumentoInstitucional, "id" | "fecha">,
  ) => Promise<void>;
  toggleDistanceState: (
    studentId: string,
    isDistancia: boolean,
  ) => Promise<void>;
  addNotification: (
    notification: Omit<Notification, "id" | "read" | "time">,
  ) => void;
  // UDEII
  updateBapInfo: (studentId: string, bapData: BAPInfo) => Promise<void>;
  // Suministros (Enfermería)
  suministros: Suministro[];
  fetchSuministros: () => Promise<void>;
  updateSuministroStock: (id: string, delta: number) => Promise<void>;
  // Stats (Prefectura)
  dailyStats: DailyStats;
  fetchDailyStats: () => Promise<void>;
  registerAttendance: (
    alumnoId: string,
    estado: "presente" | "falta" | "retardo" | "justificado",
  ) => Promise<void>;
  // System Notices (Secretariat)
  notices: SystemNotice[];
  addSystemNotice: (
    notice: Omit<SystemNotice, "id" | "date" | "resolved">,
  ) => void;
  resolveSystemNotice: (id: string) => void;
  updateCredencialStatus: (studentId: string, status: CredencialStatus) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_STUDENTS: Student[] = [
  {
    id: "1",
    matricula: "2023-4492",
    name: "Carlos Alberto Ruiz",
    group: "3º B",
    avatar: "https://i.pravatar.cc/150?u=1",
    caseState: CaseState.OBSERVADO,
    incidents: [
      {
        id: "i1",
        studentId: "1",
        type: IncidentType.RETARDO,
        description: "Llegada tarde 15 min",
        date: new Date().toISOString(),
        reportedBy: "Prefectura",
      },
    ],
    medicalAlerts: ["Alergia Estacional"],
    guardianInfo: {
      name: "María Ruiz (Madre)",
      relationship: "Madre",
      phonePrimary: "55-1234-5678",
      address: "Calle 10 #402, Col. Centro",
    },
    justificantes: [],
    bapInfo: {
      hasBAP: false,
      diagnosisPrivate: "",
      accommodations: [],
      lastUpdated: "",
    },
  },
  {
    id: "2",
    matricula: "2023-1122",
    name: "Sofia Hernández G.",
    group: "2º A",
    avatar: "https://i.pravatar.cc/150?u=2",
    caseState: CaseState.PATRON_DETECTADO,
    incidents: [
      {
        id: "i2",
        studentId: "2",
        type: IncidentType.CONDUCTA,
        description: "Uso de celular en clase",
        date: new Date().toISOString(),
        reportedBy: "Docente",
      },
      {
        id: "i3",
        studentId: "2",
        type: IncidentType.UNIFORME,
        description: "Falta de uniforme completo",
        date: new Date().toISOString(),
        reportedBy: "Prefectura",
      },
      {
        id: "i4",
        studentId: "2",
        type: IncidentType.CONDUCTA,
        description: "Interrupción reiterada",
        date: new Date().toISOString(),
        reportedBy: "Docente",
      },
    ],
    guardianInfo: {
      name: "Roberto Hernández",
      relationship: "Padre",
      phonePrimary: "55-8765-4321",
    },
    justificantes: [],
    bapInfo: {
      hasBAP: true,
      diagnosisPrivate: "TDAH (Diagnóstico Clínico Confidencial)",
      accommodations: [
        "Ubicación preferencial frente al pizarrón",
        "Segmentación de tareas largas",
        "Permitir uso de material manipulativo",
      ],
      lastUpdated: "2023-10-01",
    },
  },
  {
    id: "3",
    matricula: "2023-9988",
    name: "Juan López Pérez",
    group: "3º B",
    avatar: "https://i.pravatar.cc/150?u=3",
    caseState: CaseState.INTERVENCION,
    incidents: [],
    guardianInfo: {
      name: "Abuela López",
      relationship: "Tutora Legal",
      phonePrimary: "55-5555-5555",
    },
    justificantes: [
      {
        id: "j1",
        folio: "TS-2023-001",
        startDate: "2023-09-10",
        endDate: "2023-09-12",
        reason: "Médico",
        description: "Infección estomacal. Receta IMSS anexa.",
        issuedBy: "Trabajo Social",
        issuedAt: "2023-09-13",
      },
    ],
    bapInfo: {
      hasBAP: false,
      diagnosisPrivate: "",
      accommodations: [],
      lastUpdated: "",
    },
  },
];

export const AppProvider: React.FC<{
  children: React.ReactNode;
  initialRole?: UserRole;
}> = ({ children, initialRole = UserRole.GUEST }) => {
  const { user, role } = useAuth();
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(initialRole);

  // Sync role from AuthProvider
  useEffect(() => {
    if (role) {
      setCurrentUserRole(role);
    }
  }, [role]);
  const [students, setStudents] = useState<Student[]>([]);
  const [quickRegisterOpen, setQuickRegisterOpen] = useState(false);
  const [quickRegisterType, setQuickRegisterType] = useState<IncidentType>(
    IncidentType.CONDUCTA,
  );
  const [assistantMessage, setAssistantMessage] = useState<string | null>(null);

  const [isTutorMode, setIsTutorMode] = useState(false);
  const [currentModule, setCurrentModule] = useState<AppModule>(AppModule.HOME);
  const [suministros, setSuministros] = useState<Suministro[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    attendanceCount: 0,
    lateCount: 0,
  });
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "n1",
      title: "Stock Crítico en Enfermería",
      message: "Paracetamol bajo (2 unidades). Se recomienda reabastecer.",
      read: false,
      time: "10:30 AM",
      type: "warning",
      actionModule: AppModule.DASHBOARD,
    },
    {
      id: "n2",
      title: "Justificante Pendiente",
      message: "Nuevo justificante de 3º B pendiente de validación.",
      read: false,
      time: "09:15 AM",
      type: "info",
      actionModule: AppModule.DASHBOARD,
    },
    {
      id: "n3",
      title: "Patrón de Riesgo Detectado",
      message: "Estudiante con 3+ incidencias requiere intervención.",
      read: false,
      time: "Ayer",
      type: "error",
      actionModule: AppModule.REPORTES,
    },
  ]);

  const switchRole = (role: UserRole) => {
    setCurrentUserRole(role);
    setAssistantMessage(null); // Will be regenerated by effect
    setIsTutorMode(false);
    setCurrentModule(AppModule.HOME); // Reset view logic
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const addNotification = (
    data: Omit<Notification, "id" | "read" | "time">,
  ) => {
    const newNotif: Notification = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      read: false,
      time: "Ahora mismo",
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const openQuickRegister = (type?: IncidentType) => {
    if (type) setQuickRegisterType(type);
    setQuickRegisterOpen(true);
  };

  const toggleTutorMode = () => {
    setIsTutorMode(!isTutorMode);
  };

  // Función de auditoría completa que persiste en Supabase
  const logAudit = async (
    actionType: AuditActionType,
    description: string,
    targetTable: string,
    targetRecordId: string,
    studentName?: string,
    oldValues?: any,
    newValues?: any,
  ) => {
    // Log to console for debugging
    console.log(
      `%c[AUDIT] ${actionType}: ${description} | Table: ${targetTable} | Record: ${targetRecordId}`,
      "color: #ef4444; font-weight: bold;",
    );

    // MÁSCARA DE SUPER ADMIN (CAJA NEGRA)
    // Regla X.A: Super Admin no debe ser visible
    let auditUserId = user?.id;
    let auditUserEmail = user?.email;
    let auditUserRole = currentUserRole as string;
    let internalNote = null;

    if (currentUserRole === UserRole.DEVELOPER) {
      auditUserId = "SYSTEM";
      auditUserRole = "SYSTEM_ADMIN";
      auditUserEmail = "system@esd-310.mx";
      internalNote = "Acción realizada por Super Admin (oculto)";
    }

    // Persist to Supabase audit_log table
    try {
      const { error } = await supabase.from("audit_log").insert([
        {
          user_id: auditUserId,
          user_email: auditUserEmail,
          user_role: auditUserRole,
          action_type: actionType,
          action_description: internalNote
            ? `${description} [INTERNAL: ${internalNote}]`
            : description,
          target_table: targetTable,
          target_record_id: targetRecordId,
          target_student_name: studentName,
          old_values: oldValues || null,
          new_values: newValues || null,
        },
      ]);

      if (error) {
        console.warn("Error persisting audit log:", error.message);
      }
    } catch (err) {
      console.warn("Audit logging failed:", err);
    }
  };

  // Función simplificada para registrar acceso/consulta
  const logAccess = (
    action: string,
    studentId: string,
    studentName?: string,
  ) => {
    // Log local immediately
    console.log(
      `%c[ACCESS LOG] Role: ${currentUserRole} | Action: ${action} | StudentID: ${studentId} | Time: ${new Date().toISOString()}`,
      "color: #3b82f6; font-weight: bold;",
    );

    // Persist to audit_log as CONSULTA action
    logAudit("CONSULTA", action, "alumnos", studentId, studentName);
  };

  // -- 1. Fetch Data from Supabase --
  useEffect(() => {
    if (!user) {
      setStudents(INITIAL_STUDENTS);
      return;
    }

    const fetchStudents = async () => {
      try {
        const { data, error } = await supabase.from("alumnos").select(`
          *,
          incidencias (
            id, tipo, descripcion, creado_en, reportado_por
          ),
          justificantes (
            id, folio, fecha_inicio, fecha_fin, motivo, descripcion, creado_en, emitido_por
          ),
          salud (
            padecimiento, documento_url
          ),
          calificaciones (
            id, materia, trimestre1, trimestre2, trimestre3, promedio_final, ciclo_escolar
          )
        `);

        if (error) {
          console.error("Error fetching students (alumnos):", error);
          return;
        }

        if (error) {
          console.error("Error fetching students:", error);
          toast.error(
            "Error al cargar datos de estudiantes: " + error.message,
            {
              id: "fetch-error",
            },
          );
          return;
        }

        if (data) {
          const mappedStudents: Student[] = data.map((d: any) => ({
            id: d.id,
            matricula: d.matricula,
            name: d.nombre_completo, // Mapped from nombre_completo
            group: d.grupo, // Mapped from grupo
            avatar: d.avatar_url || "https://i.pravatar.cc/150",
            caseState: calculateState(d.incidencias || []),
            incidents: (d.incidencias || []).map((i: any) => ({
              id: i.id,
              type: i.tipo,
              description: i.descripcion,
              date: i.fecha || i.creado_en,
              reportedBy: i.reportado_por,
            })),
            justificantes: (d.justificantes || []).map((j: any) => ({
              id: j.id,
              folio: j.folio,
              startDate: j.fecha_inicio,
              endDate: j.fecha_fin,
              reason: j.motivo,
              description: j.descripcion,
              issuedAt: j.creado_en,
              issuedBy: j.emitido_por,
            })),
            medicalAlerts: (d.salud || [])
              .map((s: any) => s.padecimiento)
              .filter(Boolean),
            lastModifiedBy: d.modificado_por,
            lastModifiedAt: d.modificado_en,
            guardianInfo: d.datos_tutor || undefined,
            bapInfo: d.datos_bap
              ? {
                  hasBAP: d.datos_bap.hasBAP || false,
                  diagnosisPrivate: d.datos_bap.diagnosisPrivate || "",
                  accommodations: d.datos_bap.accommodations || [],
                  lastUpdated: d.datos_bap.lastUpdated || "",
                }
              : {
                  hasBAP: false,
                  diagnosisPrivate: "",
                  accommodations: [],
                  lastUpdated: "",
                },
            calificaciones: (d.calificaciones || []).map((c: any) => ({
              materia: c.materia,
              trimestre1: c.trimestre1,
              trimestre2: c.trimestre2,
              trimestre3: c.trimestre3,
              promedioFinal: c.promedio_final,
            })),
            documentos: [], // documentos_institucionales aún no existe
            isDistancia: d.is_distancia || false,
          }));
          setStudents(mappedStudents);
        }
      } catch (err: any) {
        console.error("Unexpected error:", err);
        toast.error("Error de conexión: " + (err.message || "Desconocido"));
      }
    };

    fetchStudents();
  }, [user]);

  // -- 2. Fetch Suministros (Enfermería) --
  const fetchSuministros = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("suministros")
        .select("*")
        .order("nombre");
      if (error) throw error;
      if (data) {
        setSuministros(
          data.map((s: any) => ({
            id: s.id,
            nombre: s.nombre,
            cantidad: s.cantidad,
            cantidadMaxima: s.cantidad_maxima,
            categoria: s.categoria,
            unidad: s.unidad,
          })),
        );
      }
    } catch (err) {
      console.error("Error fetching suministros:", err);
    }
  };

  const updateSuministroStock = async (id: string, delta: number) => {
    const item = suministros.find((s) => s.id === id);
    if (!item) return;

    const newQty = Math.max(0, item.cantidad + delta);

    // Optimistic update
    setSuministros((prev) =>
      prev.map((s) => (s.id === id ? { ...s, cantidad: newQty } : s)),
    );

    try {
      const { error } = await (supabase as any)
        .from("suministros")
        .update({
          cantidad: newQty,
          ultima_actualizacion: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    } catch (err) {
      console.error("Error updating stock:", err);
      // Revert if error
      fetchSuministros();
    }
  };

  // -- 3. Fetch Daily Stats (Prefectura) --
  const fetchDailyStats = async () => {
    const today = new Date().toISOString().split("T")[0];
    try {
      const { data, error } = await supabase
        .from("attendance_logs")
        .select("estado")
        .eq("fecha", today);

      if (error) throw error;

      if (data) {
        const attendanceCount = data.filter(
          (d: any) => d.estado === "presente" || d.estado === "retardo",
        ).length;
        const lateCount = data.filter(
          (d: any) => d.estado === "retardo",
        ).length;
        setDailyStats({ attendanceCount, lateCount });
      }
    } catch (err) {
      console.error("Error fetching daily stats:", err);
    }
  };

  const registerAttendance = async (
    alumnoId: string,
    estado: "presente" | "falta" | "retardo" | "justificado",
  ) => {
    try {
      const { error } = await (supabase as any).from("attendance_logs").insert([
        {
          alumno_id: alumnoId,
          estado: estado,
          registrado_por: user?.id,
        },
      ] as any);

      if (error) {
        if (error.code === "23505") {
          // Unique constraint violation - already registered today
          toast.error("Este alumno ya tiene registro de asistencia hoy");
        } else {
          throw error;
        }
      } else {
        fetchDailyStats(); // Refresh KPIs
      }
    } catch (err) {
      console.error("Error registering attendance:", err);
      toast.error("Error en registro de asistencia");
    }
  };

  useEffect(() => {
    if (user) {
      fetchSuministros();
      fetchDailyStats();
    }
  }, [user]);

  const addIncident = async (
    studentId: string,
    type: IncidentType,
    description: string,
  ) => {
    // Optimistic Update
    const tempId = Math.random().toString(36).substr(2, 9);
    const newIncidentLocal: Incident = {
      id: tempId,
      studentId,
      type,
      description,
      date: new Date().toISOString(),
      reportedBy: currentUserRole,
    };

    // Update local state immediately
    let escalationResult = null;

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const newIncidents = [newIncidentLocal, ...s.incidents];

        // Calculate Escalation (3-strikes, etc)
        escalationResult = evaluateEscalation(newIncidentLocal, s.incidents);

        // Minimal Auto-Escalation Logic locally for visual State
        let newState = s.caseState;
        if (newIncidents.length >= 3 && s.caseState === CaseState.OBSERVADO) {
          newState = CaseState.PATRON_DETECTADO;
        }
        return { ...s, incidents: newIncidents, caseState: newState };
      }),
    );

    // Refresh daily stats if it was a late/attendance incident
    if (type === IncidentType.RETARDO || type === IncidentType.ASISTENCIA) {
      fetchDailyStats();
    }

    // Dispatch Notifications based on Escalation Engine
    if (escalationResult && (escalationResult as any).notifyRoles) {
      const { notifyRoles, priority, message, protocolId } =
        escalationResult as any;
      const newNotifs = notifyRoles.map((role: UserRole) => ({
        id: Math.random().toString(36).substr(2, 9),
        title:
          priority === "CRITICAL"
            ? "🚨 ALERTA DE PROTOCOLO CRÍTICO"
            : "Aviso de Seguimiento",
        message: `${message} (Alumno: ${
          students.find((s) => s.id === studentId)?.name || "N/A"
        })`,
        read: false,
        time: "Ahora mismo",
        type:
          priority === "CRITICAL"
            ? "error"
            : priority === "HIGH"
              ? "warning"
              : "info",
        actionModule: protocolId ? AppModule.PROTOCOLOS : AppModule.REPORTES,
        actionData: { protocolId },
        targetRole: role,
      }));

      // Extra toast for critical
      if (priority === "CRITICAL") {
        toast.error(`¡ACTIVACIÓN DE PROTOCOLO! ${message}`, {
          duration: 6000,
          position: "top-center",
        });
      }

      setNotifications((prev) => [...newNotifs, ...prev]);

      if (priority === "CRITICAL") {
        // Also log to audit for history
        logAudit(
          "CREACION",
          `Protocolo Activado: ${message}`,
          "incidencias",
          tempId,
          students.find((s) => s.id === studentId)?.name,
        );
      }
    }

    // Persist to Supabase
    try {
      const { error } = await supabase.from("incidencias").insert([
        {
          alumno_id: studentId,
          tipo: type,
          descripcion: description,
          reportado_por: user?.id,
          fecha: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("Error saving incident:", error);
        toast.error("Error al guardar incidencia: " + error.message);
        // Revert logic would go here in a robust app
      } else {
        toast.success("Incidencia registrada correctamente");
      }
    } catch (err: any) {
      console.error("Async error in addIncident:", err);
      toast.error("Error de conexión al guardar incidencia");
    }
  };

  const addJustificante = async (
    studentId: string,
    data: Omit<Justificante, "id" | "issuedAt" | "folio">,
  ) => {
    // Optimistic Update
    const tempId = Math.random().toString(36).substr(2, 9);
    const folio = `JUST-${Math.floor(Math.random() * 10000)}`;
    const newJustLocal: Justificante = {
      ...data,
      id: tempId,
      folio,
      issuedAt: new Date().toISOString(),
    };

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        return { ...s, justificantes: [newJustLocal, ...s.justificantes] };
      }),
    );

    // Persist
    try {
      const { error } = await supabase.from("justificantes").insert([
        {
          alumno_id: studentId,
          folio: folio,
          fecha_inicio: data.startDate,
          fecha_fin: data.endDate,
          motivo: data.reason,
          descripcion: data.description,
          emitido_por: user?.id,
        },
      ]);
      if (error) console.error("Error saving justificante:", error);
    } catch (err) {
      console.error(err);
    }
  };

  const updateStudentAudit = async (studentId: string, modifiedBy: string) => {
    const timestamp = new Date().toISOString();

    // 1. Optimistic Update Local State
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? { ...s, lastModifiedBy: modifiedBy, lastModifiedAt: timestamp }
          : s,
      ),
    );

    // 2. Persist to Supabase
    try {
      const { error } = await supabase
        .from("alumnos")
        .update({
          modificado_por: modifiedBy,
          modificado_en: timestamp,
        })
        .eq("id", studentId);

      if (error) {
        console.error("Error updating audit log:", error);
        // Optional: Revert local state if critical
      }
    } catch (err) {
      console.error("Async error in updateStudentAudit:", err);
    }
  };

  const updateGrades = async (studentId: string, grades: Calificacion[]) => {
    if (
      currentUserRole !== UserRole.SECRETARIA &&
      currentUserRole !== UserRole.DEVELOPER
    ) {
      throw new Error(
        "Solo la Secretaría puede emitir o modificar calificaciones.",
      );
    }

    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId ? { ...s, calificaciones: grades } : s,
      ),
    );

    try {
      const { error } = await supabase.from("calificaciones").upsert(
        grades.map((g) => ({ ...g, alumno_id: studentId })),
        { onConflict: "alumno_id,materia" },
      );

      if (error) throw error;

      logAudit(
        "ACTUALIZACION",
        `Calificaciones actualizadas`,
        "calificaciones",
        studentId,
      );
    } catch (err) {
      console.error(err);
    }
  };

  const addInstitutionalDocument = async (
    doc: Omit<DocumentoInstitucional, "id" | "fecha">,
  ) => {
    const tempId = Math.random().toString(36).substr(2, 9);
    const newDoc: DocumentoInstitucional = {
      ...doc,
      id: tempId,
      fecha: new Date().toISOString(),
    };

    setStudents((prev) =>
      prev.map((s) =>
        s.id === doc.studentId
          ? { ...s, documentos: [newDoc, ...(s.documentos || [])] }
          : s,
      ),
    );

    try {
      const { error } = await supabase
        .from("documentos_institucionales")
        .insert([
          {
            alumno_id: doc.studentId,
            tipo: doc.tipo,
            folio: doc.folio,
            titulo: doc.titulo,
            contenido: doc.contenido,
            narracion_ia: doc.narracionIA,
            firmas: doc.firmas,
            creado_por: user?.id,
          },
        ]);
      if (error) throw error;
      logAudit(
        "CREACION",
        `Documento ${doc.tipo} generado: ${doc.folio}`,
        "documentos_institucionales",
        tempId,
      );
    } catch (err) {
      console.error(err);
    }
  };

  const toggleDistanceState = async (
    studentId: string,
    isDistancia: boolean,
  ) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, isDistancia } : s)),
    );

    try {
      const { error } = await supabase
        .from("alumnos")
        .update({ is_distancia: isDistancia })
        .eq("id", studentId);

      if (error) throw error;

      logAudit(
        "ACTUALIZACION",
        `Alumno puesto en modo ${isDistancia ? "A DISTANCIA" : "PRESENCIAL"}`,
        "alumnos",
        studentId,
      );
    } catch (err) {
      console.error(err);
    }
  };

  const updateBapInfo = async (studentId: string, bapData: BAPInfo) => {
    // 1. Update local state
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, bapInfo: bapData } : s)),
    );

    // 2. Persist to Supabase
    try {
      const { error } = await supabase
        .from("alumnos")
        .update({
          datos_bap: {
            hasBAP: bapData.hasBAP,
            diagnosisPrivate: bapData.diagnosisPrivate,
            accommodations: bapData.accommodations,
            lastUpdated: new Date().toISOString().split("T")[0],
          },
        })
        .eq("id", studentId);

      if (error) throw error;

      logAudit(
        "ACTUALIZACION",
        `Información BAP/Inclusión actualizada`,
        "alumnos",
        studentId,
      );
    } catch (err) {
      console.error("Error updating BAP info:", err);
      toast.error("Error al persistir cambios de UDEII");
    }
  };

  const importStudents = (newStudents: Student[]) => {
    // For manual import, just add to local state?
    // Usually Inscripciones component handles the DB insert now.
    // If this is called from CSV upload, we should loop and insert.
    // For now, we will just update local state to reflect additions
    setStudents((prev) => [...prev, ...newStudents]);
    // logAccess("Importación Masiva de Datos", "SISTEMA");
  };

  const [notices, setNotices] = useState<SystemNotice[]>([]);

  const addSystemNotice = (
    notice: Omit<SystemNotice, "id" | "date" | "resolved">,
  ) => {
    const newNotice: SystemNotice = {
      ...notice,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      resolved: false,
    };
    setNotices((prev) => [newNotice, ...prev]);
    addNotification({
      title: "Nuevo Aviso Administrativo",
      message: `${notice.requestedBy} solicita ${notice.type.replace("_", " ")} para ${notice.studentName}`,
      type: "SYSTEM",
      targetRole: UserRole.SECRETARIA,
    });
  };

  const resolveSystemNotice = (id: string) => {
    setNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, resolved: true } : n)),
    );
    toast.success("Aviso resuelto correctamente");
  };

  const updateCredencialStatus = (
    studentId: string,
    status: CredencialStatus,
  ) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId ? { ...s, credencialStatus: status } : s,
      ),
    );
    logAudit(
      "ACTUALIZACION",
      `Estado de credencial: ${status}`,
      "alumnos",
      studentId,
    );
  };

  // Contextual AI Assistant Logic
  useEffect(() => {
    // Generate institutional message based on Role + Data State
    let msg = "";

    // Humanized greeting logic (Action 1)
    const rawName =
      user?.user_metadata?.full_name || user?.email?.split("@")[0];
    const isInvalidName = !rawName || /^\d+$/.test(rawName.toString());
    const roleLabel = RoleLabels[currentUserRole];
    const userName = isInvalidName ? roleLabel : rawName;

    const greeting = getSaludo();
    const contextPrefix = `${greeting}, ${userName}. (Turno Vespertino | CCT 09DES4310M).`;

    switch (currentUserRole) {
      case UserRole.DOCENTE:
        const highRisk = students.filter(
          (s) =>
            s.caseState === CaseState.PATRON_DETECTADO ||
            s.caseState === CaseState.INTERVENCION,
        ).length;
        msg =
          highRisk > 0
            ? `Hola ${userName}. Hoy acompañamos ${highRisk} trayectorias con atención prioritaria activa. El sistema respalda su noble labor educativa.`
            : `Hola ${userName}. Las trayectorias están en calma institucional. Su presencia es el corazón de nuestra comunidad escolar.`;
        break;
      case UserRole.PREFECTURA:
        msg = `Hola ${userName}. Se han detectado patrones de puntualidad en 3º B. Iniciemos juntos este seguimiento para transformar hábitos.`;
        break;
      case UserRole.ENFERMERIA:
        msg = `Hola ${userName}. El inventario de emergencia requiere su revisión experta. El sistema acompaña su labor para cuidar la salud de los alumnos.`;
        break;
      case UserRole.ORIENTACION:
        const pendingCases = students.filter(
          (s) => s.caseState === CaseState.PATRON_DETECTADO,
        ).length;
        msg =
          pendingCases > 0
            ? `Hola ${userName}. Tenemos ${pendingCases} patrones detectados que requieren atención. Su mirada experta es clave para el bienestar estudiantil.`
            : `Hola ${userName}. No hay patrones críticos hoy. Gracias por mantener encendida la llama del bienestar escolar.`;
        break;
      case UserRole.TRABAJO_SOCIAL:
        msg = `Hola ${userName}. Tenemos 2 seguimientos y un justificante por validar. Juntos fortalecemos el vínculo familia-escuela.`;
        break;
      case UserRole.SECRETARIA:
        msg = `Hola ${userName}. El sistema está listo para validación masiva. Su gestión impecable garantiza la integridad de nuestra comunidad.`;
        break;
      case UserRole.DIRECTIVO:
        msg = `Hola ${userName}. La asistencia global es del 92%. Agradecemos su liderazgo estratégico para el éxito de la comunidad ESD 310.`;
        break;
      case UserRole.DEVELOPER:
        msg = `Hola ${userName}. Núcleo SASE operando con integridad total. Todo el personal colaborando en tiempo real por el éxito escolar.`;
        break;
      default:
        msg = `Hola ${userName}. Bienvenido al núcleo SASE de la ESD 310. Juntos construimos un entorno de acompañamiento y éxito educativo.`;
    }

    setAssistantMessage(msg);
  }, [currentUserRole, students]);

  return (
    <AppContext.Provider
      value={{
        currentUserRole,
        switchRole,
        students,
        addIncident,
        addJustificante,
        importStudents,
        quickRegisterOpen,
        setQuickRegisterOpen,
        quickRegisterType,
        openQuickRegister,
        assistantMessage,
        isTutorMode,
        toggleTutorMode,

        logAccess,
        logAudit,
        currentModule,
        setCurrentModule,
        notifications,
        markNotificationRead,
        updateStudentAudit,
        updateGrades,
        addInstitutionalDocument,
        toggleDistanceState,
        addNotification,
        updateBapInfo,
        suministros,
        fetchSuministros,
        updateSuministroStock,
        dailyStats,
        fetchDailyStats,
        registerAttendance,
        notices,
        addSystemNotice,
        resolveSystemNotice,
        updateCredencialStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
