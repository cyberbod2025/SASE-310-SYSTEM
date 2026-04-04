import { useState, useEffect, useMemo } from "react";
import { UserRole, Student, CaseState, RoleLabels } from "../../types";
import { getSaludo as getSaludoConfig } from "../../config/sase.config";
import { SystemState } from "../../types/systemState";

export const useUiSlice = (
  user: any,
  currentUserRole: UserRole,
  students: Student[],
) => {
  const [quickRegisterOpen, setQuickRegisterOpen] = useState(false);
  const [quickRegisterType, setQuickRegisterType] = useState<any>(null);
  const [assistantMessage, setAssistantMessage] = useState<string | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [assistantStatus, setAssistantStatus] = useState<
    "idle" | "listening" | "thinking"
  >("idle");
  const [isTourActive, setIsTourActive] = useState(false);
  const [activePrintJob, setActivePrintJob] = useState<any>(null);
  const [printModal, setPrintModal] = useState({
    isOpen: false,
    title: "",
    html: "",
  });

  // Determinar el estado visual del semáforo basado en los riesgos calculados en DB
  const systemState = useMemo(() => {
    // 1. Estados de la IA (Prioridad visual)
    if (isAssistantOpen) return "normal"; // Orbe dorado en legado, normal/calma en nuevo
    if (assistantStatus === "thinking") return "thinking";

    // 2. Estados Institucionales (Fuente de verdad: DB)
    const highRiskCount = students.filter(s => 
      s.estadoSemaforo === 'INTERVENCION' || 
      s.estadoSemaforo === 'EN_ANALISIS'
    ).length;

    const warningCount = students.filter(s => 
      s.estadoSemaforo === 'PATRON_DETECTADO' || 
      s.estadoSemaforo === 'OBSERVADO'
    ).length;

    if (highRiskCount > 0) return "alert";
    if (warningCount > 0) return "warning";
    
    return "normal"; 
  }, [students, isAssistantOpen, assistantStatus]);

  const openQuickRegister = (type?: any) => {
    if (type) setQuickRegisterType(type);
    setQuickRegisterOpen(true);
  };

  const printDocument = (job: any, showPreview: boolean = true) => {
    setActivePrintJob(job);

    if (showPreview) {
      return;
    }

    setTimeout(() => {
      window.print();
      setTimeout(() => setActivePrintJob(null), 1000);
    }, 500);
  };

  useEffect(() => {
    if (!user) return;
    let msg = "";
    const rawName =
      user?.user_metadata?.full_name || user?.email?.split("@")[0];
    const roleLabel = RoleLabels[currentUserRole];
    const userName = rawName || roleLabel;
    const greeting = getSaludoConfig();

    switch (currentUserRole) {
      case UserRole.DOCENTE:
        const highRisk = students.filter(
          (s) =>
            s.caseState === CaseState.PATRON_DETECTADO ||
            s.caseState === CaseState.INTERVENCION,
        ).length;
        msg = `${greeting}, ${userName}. Hoy acompañamos ${highRisk} trayectorias críticas.`;
        break;
      case UserRole.DEVELOPER:
        msg = `${greeting}, ${userName}. Núcleo SASE operando con integridad total.`;
        break;
      default:
        msg = `${greeting}, ${userName}. Bienvenido al núcleo SASE de la ESD 310.`;
    }
    setAssistantMessage(msg);
  }, [currentUserRole, students, user]);

  return {
    quickRegisterOpen,
    setQuickRegisterOpen,
    quickRegisterType,
    setQuickRegisterType,
    openQuickRegister,
    assistantMessage,
    isAssistantOpen,
    setIsAssistantOpen,
    isFeedbackOpen,
    setIsFeedbackOpen,
    assistantStatus,
    setAssistantStatus,
    isTourActive,
    setIsTourActive,
    systemState,
    activePrintJob,
    setActivePrintJob,
    printDocument,
    printModal,
    setPrintModal,
  };
};
