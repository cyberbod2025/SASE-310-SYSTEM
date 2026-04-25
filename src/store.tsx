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
import type { SystemState } from "./types/systemState";

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

  // Extra (from original store)
  updateStudentAudit: any;
  saveEvidence: any;
  addInstitutionalDocument: any;
  addDocumentoInstitucional: any;
  deleteDocumentoInstitucional: any;
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

  const saveEvidence = async (data: EvidenceInput) => {
    if (!user) {
      toast.error("No hay sesión activa para guardar evidencia");
      return;
    }

    const payload = {
      title: data?.title?.trim() || "Evidencia",
      link: data?.link?.trim() || null,
      file_type: data?.fileType?.trim() || null,
      notes: data?.notes?.trim() || null,
      impacto_estimado:
        typeof data?.impactoEstimado === "number" ? data.impactoEstimado : null,
      proyecto_nombre: data?.proyectoNombre?.trim() || null,
      role: data?.role || currentUserRole,
      user_id: data?.userId || user.id,
    };

    try {
      const { error } = await supabase.from("evidence_log").insert(payload);
      if (error) throw error;
      toast.success("Evidencia registrada");
    } catch (err) {
      console.error("Error saving evidence", err);
      toast.error("No se pudo guardar la evidencia");
    }
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
        // Students & Incidents
        students: studentsSlice.students,
        fetchStudents: studentsSlice.fetchStudents,
        groups: studentsSlice.groups,
        fetchGroups: studentsSlice.fetchGroups,
        addIncident: studentsSlice.addIncident,
        markIncidentAsNotified: studentsSlice.markIncidentAsNotified,
        ...statsSlice,
        ...audit,
        updateStudentAudit,
        saveEvidence,
        updateCredencialStatus,
        addInstitutionalDocument,
        addDocumentoInstitucional: studentsSlice.addDocumentoInstitucional,
        deleteDocumentoInstitucional: studentsSlice.deleteDocumentoInstitucional,
        addObjetoRetenido: studentsSlice.addObjetoRetenido,
        updateEstadoObjeto: studentsSlice.updateEstadoObjeto,
        registrarDevolucion: studentsSlice.registrarDevolucion,
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
