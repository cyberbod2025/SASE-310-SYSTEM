import React, { createContext, useContext } from "react";
import { useAuth } from "./components/AuthProvider";
import { UserRole, AuditActionType } from "./types";
import toast from "react-hot-toast";

// Import Slices
import { useAuthSlice } from "./store/slices/useAuthSlice";
import { useNotificationSlice } from "./store/slices/useNotificationSlice";
import { useInventoryStatsSlice } from "./store/slices/useInventoryStatsSlice";
import { useStudentsSlice } from "./store/slices/useStudentsSlice";
import { useUiSlice } from "./store/slices/useUiSlice";
import { useAuditLogic } from "./store/slices/useAuditLogic";

// Re-export types for backward compatibility
export * from "./types";

interface AppContextType {
  // Auth & Roles
  currentUserRole: any;
  switchRole: any;
  currentModule: any;
  setCurrentModule: any;
  isTutorMode: any;
  toggleTutorMode: any;

  // Students & Incidents
  students: any;
  fetchStudents: any;
  addIncident: any;
  addJustificante: any;
  updateGrades: any;
  updateBapInfo: any;
  toggleDistanceState: any;
  importStudents: any;

  // UI & UX
  quickRegisterOpen: any;
  setQuickRegisterOpen: any;
  quickRegisterType: any;
  openQuickRegister: any;
  assistantMessage: any;
  isAssistantOpen: any;
  setIsAssistantOpen: any;
  isFeedbackOpen: any;
  setIsFeedbackOpen: any;
  assistantStatus: any;
  setAssistantStatus: any;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{
  children: React.ReactNode;
  initialRole?: UserRole;
}> = ({ children, initialRole = UserRole.GUEST }) => {
  const { user } = useAuth();

  // 1. Core Auth & Role Slice
  const auth = useAuthSlice(initialRole);

  // 2. Audit Logic Slice (Needs auth status)
  const audit = useAuditLogic(user, auth.currentUserRole);

  // 3. Notifications Slice
  const notificationsSlice = useNotificationSlice();

  // 4. Inventory & Stats Slice
  const statsSlice = useInventoryStatsSlice(user);

  // 5. Students & Incidents Slice (The heavy one)
  const studentsSlice = useStudentsSlice(
    user,
    auth.currentUserRole,
    notificationsSlice.addNotification,
    audit.logAudit,
    statsSlice.fetchDailyStats,
  );

  // 6. UI State Slice
  const ui = useUiSlice(user, auth.currentUserRole, studentsSlice.students);

  // Update UI slice with real students for assistant messages
  // (In a real refactor, we might use a combined hook, but this works for now)
  // We can't re-call useUiSlice here, but we can pass the students to it via effect if needed.
  // For simplicity, we'll just merge everything in the context value.

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

  const saveEvidence = async (data: any) => {
    // Basic implementation placeholder
    console.log("Saving evidence:", data);
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
        ...studentsSlice,
        ...ui,
        ...notificationsSlice,
        ...statsSlice,
        ...audit,
        updateStudentAudit,
        saveEvidence,
        updateCredencialStatus,
        addInstitutionalDocument,
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
