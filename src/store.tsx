import React, { createContext, useContext } from "react";
import toast from "react-hot-toast";

import { useAuth } from "./components/AuthProvider";
import { UserRole, AuditActionType, AppModule } from "./types";

import { supabase } from "./supabase/client";

// Import Slices
import { useAuthSlice } from "./store/slices/useAuthSlice";
import { useNotificationSlice } from "./store/slices/useNotificationSlice";
import { useInventoryStatsSlice } from "./store/slices/useInventoryStatsSlice";
import { useStudentsSlice } from "./store/slices/useStudentsSlice";
import { useUiSlice } from "./store/slices/useUiSlice";
import { useAuditLogic } from "./store/slices/useAuditLogic";
import { useSystemStateSlice } from "./store/slices/useSystemStateSlice";
import { useMatriculaSlice } from "./store/slices/useMatriculaSlice";
import { useCierreCicloSlice } from "./store/slices/useCierreCicloSlice";
import { useObservabilitySlice } from "./store/slices/useObservabilitySlice";
import { useEmergencySlice } from "./store/slices/useEmergencySlice";
import { useSecurityDashboardSlice } from "./store/slices/useSecurityDashboardSlice";
import type { EmergencyCreateOptions } from "./types/emergency";
import type { SystemState } from "./types/systemState";
import type { SecurityDashboardSnapshot } from "./types";

// Re-export types for backward compatibility
export * from "./types";

interface AppContextType {
  // Auth & Roles
  currentUserRole: UserRole;
  currentUserProfile: any | null;
  userCreatedAt: string | null;
  switchRole: (role: UserRole) => void;
  currentModule: any;
  setCurrentModule: any;
  isTutorMode: any;
  toggleTutorMode: any;

  // Students, Groups & Incidents
  students: any;
  fetchStudents: any;
  groups: any[];
  fetchGroups: any;
  addIncident: any;
  markIncidentAsNotified: any;
  addJustificante: any;
  updateGrades: any;
  updateBapInfo: any;
  toggleDistanceState: any;
  importStudents: any;
  addObjetoRetenido: any;
  updateEstadoObjeto: any;
  registrarDevolucion: any;

  // UI & UX
  quickRegisterOpen: any;
  setQuickRegisterOpen: any;
  quickRegisterType: any;
  quickRegisterContext: any;
  setQuickRegisterContext: any;
  openQuickRegister: any;
  assistantMessage: any;
  assistantSuggestion: { text: string, state?: string, actionLabel?: string, actionType?: string } | null;
  setAssistantSuggestion: (suggestion: { text: string, state?: string, actionLabel?: string, actionType?: string } | null) => void;
  isAssistantOpen: any;
  setIsAssistantOpen: any;
  isFeedbackOpen: any;
  setIsFeedbackOpen: any;
  assistantStatus: any;
  setAssistantStatus: any;
  systemState: SystemState;
  aiSystemState: SystemState;
  systemMessage: string | null;
  setSystemState: (state: SystemState, message?: string) => void;
  resetSystemState: () => void;
  isTourActive: boolean;
  setIsTourActive: (active: boolean) => void;
  tourStep: number;
  setTourStep: (step: number) => void;
  onboarding: any;
  updateOnboarding: (data: any) => void;
  highlightedModule: AppModule | null;
  highlightModule: (moduleKey: string | AppModule) => void;
  autoNavigate: boolean;
  clearHighlight: () => void;
  activePrintJob: any;
  printDocument: any;
  printModal: any;
  setPrintModal: any;

  // Notifications & Notices
  notifications: any;
  markNotificationRead: any;
  addNotification: any;
  notices: any;
  addSystemNotice: any;
  resolveSystemNotice: any;
  updateCredencialStatus: any;

  // Inventory & Stats
  suministros: any;
  fetchSuministros: any;
  updateSuministroStock: any;
  dailyStats: any;
  fetchDailyStats: any;
  registerAttendance: any;

  // Audit
  logAudit: any;
  logAccess: any;
  logEvent: (module: string, action: string, result: string, details?: any) => Promise<any>;

  // Seguridad
  securityDashboard: SecurityDashboardSnapshot | null;
  securityDashboardLoading: boolean;
  securityDashboardError: string | null;
  canViewSecurityDashboard: boolean;
  fetchSecurityDashboard: () => Promise<void>;

  // Extra (from original store)
  updateStudentAudit: any;
  addInstitutionalDocument: any;
  addDocumentoInstitucional: any;
  deleteDocumentoInstitucional: any;
  saveEvidence: (data: EvidenceInput) => Promise<void>;

  // Matricula Inteligente
  matricula: any;
  fetchMatricula: () => Promise<void>;
  moveAlumno: (alumnoCicloId: string, grupoNuevo: string) => void;
  undoLastMove: () => void;
  solicitarSugerenciasIA: () => Promise<void>;
  aprobarLote: () => Promise<void>;
  toggleLock: (alumnoCicloId: string) => Promise<void>;

  // Cierre de Ciclo
  cierre: any;
  fetchCiclos: () => Promise<void>;
  crearCicloNuevo: (nombre: string) => Promise<void>;
  simularPromocion: () => Promise<void>;
  setOverride: (alumnoId: string, decision: any) => void;
  ejecutarPromocion: () => Promise<void>;
  resetCierre: () => void;

  // Modo Emergencia
  activeAlerts: any[];
  myActiveAlert: any | null;
  emergencyResponses: Record<string, any[]>;
  emergencyLoading: boolean;
  createEmergencyAlert: (tipo: any, options?: EmergencyCreateOptions) => Promise<void>;
  respondToEmergency: (alertaId: string, respuesta: any) => Promise<void>;
  closeEmergencyAlert: (alertaId: string) => Promise<void>;
}

interface EvidenceInput {
  title?: string;
  link?: string;
  fileType?: string;
  notes?: string;
  impactoEstimado?: number;
  proyectoNombre?: string;
  role?: string;
  userId?: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{
  children: React.ReactNode;
  initialRole?: UserRole;
}> = ({ children, initialRole = UserRole.GUEST }) => {
  const { user } = useAuth();

  // 1. Core Auth & Role Slice
  const auth = useAuthSlice(initialRole);
  const currentUserRole = auth.currentUserRole;

  // 2. Audit Logic Slice (Needs auth status)
  const audit = useAuditLogic(user, auth.currentUserRole);

  // 3. Notifications Slice
  const notificationsSlice = useNotificationSlice();

  // 4. Inventory & Stats Slice
  const statsSlice = useInventoryStatsSlice(user);

  const userProfile = auth.currentUserProfile;

  // 5. Students & Incidents Slice (The heavy one)
  const studentsSlice = useStudentsSlice(
    user,
    auth.currentUserRole,
    notificationsSlice.addNotification,
    audit.logAudit,
    statsSlice.fetchDailyStats,
    userProfile,
  );

  // 6. UI State Slice
  const ui = useUiSlice(user, auth.currentUserRole, studentsSlice.students, auth.currentUserProfile);

  const aiSystem = useSystemStateSlice(ui.systemState as SystemState);

  // 7. Matricula & Cierre Slices
  const matriculaSlice = useMatriculaSlice(user?.id, audit.logAudit);
  const cierreSlice = useCierreCicloSlice(audit.logAudit);

  // 8. Observability Slice (Realtime alerts)
  const observability = useObservabilitySlice(aiSystem.setSystemState);

  // 9. Security Dashboard Slice
  const securityDashboard = useSecurityDashboardSlice(auth.currentUserRole);

  // 10. Emergency Mode Slice
  const emergency = useEmergencySlice(user, auth.currentUserProfile);

  // Compatibility functions for missing ones in slices
  const updateStudentAudit = async (studentId: string, modifiedBy: string) => {
    // Basic implementation to match original
    studentsSlice.setStudents((prev: any) =>
      prev.map((s: any) =>
        s.id === studentId
          ? {
              ...s,
              lastModifiedBy: modifiedBy,
              lastModifiedAt: new Date().toISOString(),
            }
          : s,
      ),
    );
  };

  const updateCredencialStatus = (studentId: string, status: any) => {
    studentsSlice.setStudents((prev: any) =>
      prev.map((s: any) =>
        s.id === studentId ? { ...s, credencialStatus: status } : s,
      ),
    );
  };

  const addInstitutionalDocument = async (doc: any) => {
    await audit.logAudit(
      "CREACION",
      `Documento Institucional IA: ${doc.titulo} (Folio: ${doc.folio})`,
      "documentos",
      doc.studentId,
      doc.studentName || "N/A",
      null,
      { tipo: doc.tipo, folio: doc.folio },
    );
    toast.success(
      `Documento ${doc.tipo} guardado en expediente con folio ${doc.folio}`,
    );
  };

  const saveEvidence = async (data: EvidenceInput) => {
    try {
      const { error } = await supabase.from("evidence_log").insert({
        title: data.title,
        link: data.link,
        file_type: data.fileType,
        notes: data.notes,
        impacto_estimado: data.impactoEstimado,
        proyecto_nombre: data.proyectoNombre,
        role: data.role || auth.currentUserRole,
        user_id: user?.id,
      });

      if (error) throw error;
      toast.success("Evidencia guardada correctamente");
    } catch (error: any) {
      console.error("Error saving evidence:", error);
      toast.error("Error al guardar evidencia");
    }
  };

  return (
    <AppContext.Provider
      value={{
        ...auth,
        currentUserProfile: useAuth().profile,
        userCreatedAt: auth.userCreatedAt,
        ...studentsSlice,
        ...ui,
        systemState: ui.systemState as SystemState,
        ...aiSystem,
        ...notificationsSlice,
        onboarding: ui.onboarding,
        updateOnboarding: ui.updateOnboarding,
        // Students & Incidents
        students: studentsSlice.students,
        fetchStudents: studentsSlice.fetchStudents,
        groups: studentsSlice.groups,
        fetchGroups: studentsSlice.fetchGroups,
        addIncident: studentsSlice.addIncident,
        markIncidentAsNotified: studentsSlice.markIncidentAsNotified,
        ...statsSlice,
        ...audit,
        ...securityDashboard,
        updateStudentAudit,
        updateCredencialStatus,
        addInstitutionalDocument,
        addDocumentoInstitucional: studentsSlice.addDocumentoInstitucional,
        deleteDocumentoInstitucional: studentsSlice.deleteDocumentoInstitucional,
        saveEvidence,
        addObjetoRetenido: studentsSlice.addObjetoRetenido,
        updateEstadoObjeto: studentsSlice.updateEstadoObjeto,
        registrarDevolucion: studentsSlice.registrarDevolucion,
        ...matriculaSlice,
        ...cierreSlice,
        ...emergency,
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
