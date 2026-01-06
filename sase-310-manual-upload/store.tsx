import React, { createContext, useContext, useState, useEffect } from "react";
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
} from "./types";

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  time: string;
  type?: "info" | "warning" | "success" | "error";
  actionModule?: AppModule; // Module to navigate to when clicked
  actionData?: any; // Additional data for the action
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
    description: string
  ) => void;
  addJustificante: (
    studentId: string,
    data: Omit<Justificante, "id" | "issuedAt" | "folio">
  ) => void;
  importStudents: (newStudents: Student[]) => void;
  quickRegisterOpen: boolean;
  setQuickRegisterOpen: (open: boolean) => void;
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
    newValues?: any
  ) => Promise<void>;
  currentModule: AppModule;
  setCurrentModule: (module: AppModule) => void;
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  updateStudentAudit: (studentId: string, modifiedBy: string) => void;
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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, role } = useAuth();
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(
    UserRole.DOCENTE
  );

  // Sync role from AuthProvider
  useEffect(() => {
    if (role) {
      setCurrentUserRole(role);
    }
  }, [role]);
  const [students, setStudents] = useState<Student[]>([]);
  const [quickRegisterOpen, setQuickRegisterOpen] = useState(false);
  const [assistantMessage, setAssistantMessage] = useState<string | null>(null);

  const [isTutorMode, setIsTutorMode] = useState(false);
  const [currentModule, setCurrentModule] = useState<AppModule>(
    AppModule.DASHBOARD
  );
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
    setCurrentModule(AppModule.DASHBOARD); // Reset view logic
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
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
    newValues?: any
  ) => {
    // Log to console for debugging
    console.log(
      `%c[AUDIT] ${actionType}: ${description} | Table: ${targetTable} | Record: ${targetRecordId}`,
      "color: #ef4444; font-weight: bold;"
    );

    // Persist to Supabase audit_log table
    try {
      const { error } = await supabase.from("audit_log").insert([
        {
          user_id: user?.id,
          user_email: user?.email,
          user_role: currentUserRole,
          action_type: actionType,
          action_description: description,
          target_table: targetTable,
          target_record_id: targetRecordId,
          target_student_name: studentName,
          old_values: oldValues ? JSON.stringify(oldValues) : null,
          new_values: newValues ? JSON.stringify(newValues) : null,
        },
      ]);

      if (error) {
        console.warn(
          "Error persisting audit log (table may not exist yet):",
          error.message
        );
      }
    } catch (err) {
      console.warn("Audit logging failed:", err);
    }
  };

  // Función simplificada para registrar acceso/consulta
  const logAccess = (
    action: string,
    studentId: string,
    studentName?: string
  ) => {
    // Log local immediately
    console.log(
      `%c[ACCESS LOG] Role: ${currentUserRole} | Action: ${action} | StudentID: ${studentId} | Time: ${new Date().toISOString()}`,
      "color: #3b82f6; font-weight: bold;"
    );

    // Persist to audit_log as CONSULTA action
    logAudit("CONSULTA", action, "alumnos", studentId, studentName);
  };

  // -- 1. Fetch Data from Supabase --
  useEffect(() => {
    if (!user) return;

    const fetchStudents = async () => {
      try {
        const { data, error } = await supabase.from("students").select(`
          *,
          incidents (
            id, type, description, created_at, reported_by
          ),
          justificantes (
            id, folio, start_date, end_date, reason, description, created_at, issued_by
          ),
          salud (
            padecimiento, documento_url
          )
        `);

        if (error) {
          console.error("Error fetching students:", error);
          return;
        }

        if (data) {
          const mappedStudents: Student[] = data.map((d: any) => ({
            id: d.id,
            matricula: d.matricula,
            name: d.name,
            group: d.group_id, // Assuming group_id maps to group name or we need a join. For now assuming simple string or id
            avatar: d.avatar_url || "https://i.pravatar.cc/150",
            caseState: calculateState(d.incidents || []),
            incidents: (d.incidents || []).map((i: any) => ({
              id: i.id,
              type: i.type,
              description: i.description,
              date: i.date, // Use the incident date, not creation time
              reportedBy: i.reported_by,
            })),
            justificantes: (d.justificantes || []).map((j: any) => ({
              id: j.id,
              folio: j.folio,
              startDate: j.start_date,
              endDate: j.end_date,
              reason: j.reason,
              description: j.description,
              issuedAt: j.created_at,
              issuedBy: j.issued_by,
            })),
            medicalAlerts: (d.salud || [])
              .map((s: any) => s.padecimiento)
              .filter(Boolean),
            lastModifiedBy: d.last_modified_by,
            lastModifiedAt: d.last_modified_at,
            guardianInfo: d.guardian_info || undefined,
            bapInfo: {
              // Mock BAP info for now as we don't have a table
              hasBAP: false,
              diagnosisPrivate: "",
              accommodations: [],
              lastUpdated: "",
            },
          }));
          setStudents(mappedStudents);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    };

    fetchStudents();
  }, [user]);

  const addIncident = async (
    studentId: string,
    type: IncidentType,
    description: string
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
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const newIncidents = [newIncidentLocal, ...s.incidents];
        // Minimal Auto-Escalation Logic locally
        let newState = s.caseState;
        if (newIncidents.length >= 3 && s.caseState === CaseState.OBSERVADO) {
          newState = CaseState.PATRON_DETECTADO;
        }
        return { ...s, incidents: newIncidents, caseState: newState };
      })
    );

    // Persist to Supabase
    try {
      const { error } = await supabase.from("incidents").insert([
        {
          student_id: studentId,
          type: type,
          description: description,
          reported_by: user?.id,
          date: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("Error saving incident:", error);
        // Revert logic would go here in a robust app
        alert("Error al guardar incidencia en la nube. Verifique conexión.");
      }
    } catch (err) {
      console.error("Async error in addIncident:", err);
    }
  };

  const addJustificante = async (
    studentId: string,
    data: Omit<Justificante, "id" | "issuedAt" | "folio">
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
      })
    );

    // Persist
    try {
      const { error } = await supabase.from("justificantes").insert([
        {
          alumno_id: studentId,
          folio,
          start_date: data.startDate,
          end_date: data.endDate,
          reason: data.reason,
          description: data.description,
          issued_by: user?.id,
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
          : s
      )
    );

    // 2. Persist to Supabase
    try {
      const { error } = await supabase
        .from("alumnos")
        .update({
          last_modified_by: modifiedBy,
          last_modified_at: timestamp,
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

  const importStudents = (newStudents: Student[]) => {
    // For manual import, just add to local state?
    // Usually Inscripciones component handles the DB insert now.
    // If this is called from CSV upload, we should loop and insert.
    // For now, we will just update local state to reflect additions
    setStudents((prev) => [...prev, ...newStudents]);
    // logAccess("Importación Masiva de Datos", "SISTEMA");
  };

  // Contextual AI Assistant Logic
  useEffect(() => {
    // Generate institutional message based on Role + Data State
    let msg = "";
    const greeting = "Buenos días.";

    switch (currentUserRole) {
      case UserRole.DOCENTE:
        const highRisk = students.filter(
          (s) =>
            s.caseState === CaseState.PATRON_DETECTADO ||
            s.caseState === CaseState.INTERVENCION
        ).length;
        msg = `${greeting} Docente. Tiene ${highRisk} alumnos que requieren seguimiento cercano hoy.`;
        break;
      case UserRole.PREFECTURA:
        const lateToday = 32; // Mocked from dashboard
        msg = `${greeting} Prefectura. Se detecta un patrón de retardos en 3º B (5 casos hoy). Se sugiere revisión de uniforme.`;
        break;
      case UserRole.ENFERMERIA:
        msg = `${greeting} Enfermería. Inventario bajo: Vendas elásticas (4 unidades). Revise el stock de emergencia.`;
        break;
      case UserRole.ORIENTACION:
        const pendingCases = students.filter(
          (s) => s.caseState === CaseState.PATRON_DETECTADO
        ).length;
        msg = `${greeting} Orientación. Se han detectado ${pendingCases} nuevos patrones de conducta esta semana que requieren análisis.`;
        break;
      case UserRole.TRABAJO_SOCIAL:
        msg = `${greeting} Trabajo Social. Tiene 2 seguimientos domiciliarios pendientes y 1 justificante por validar.`;
        break;
      case UserRole.SECRETARIA:
        msg = `${greeting} Secretaría. El sistema está listo para la carga masiva. Recuerde verificar la integridad de los CURP antes de importar.`;
        break;
      case UserRole.DIRECTIVO:
        const totalIncidents = students.reduce(
          (acc, s) => acc + s.incidents.length,
          0
        );
        msg = `${greeting} Director. Resumen global: ${totalIncidents} incidencias registradas este mes. La asistencia general es del 92%.`;
        break;
      /* UDEII Temporarily disabled until Role added in DB
        case UserRole.UDEII:
             const bapStudents = students.filter(s => s.bapInfo?.hasBAP).length;
             msg = `${greeting} UDEII. Hay ${bapStudents} alumnos con BAP activos. Se recomienda actualizar los ajustes razonables del grupo 2º A.`;
             break; 
        */
      default:
        msg = "Bienvenido al Sistema SASE-310.";
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
