import { useState, useEffect, useMemo } from "react";
import { UserRole, Student, CaseState, RoleLabels } from "../../types";
import { getSaludo as getSaludoConfig } from "../../config/sase.config";
import { calcularEstadoSistema, OrbState } from "../../utils/estadoSistema";

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
  const [activePrintJob, setActivePrintJob] = useState<any>(null);
  const [printModal, setPrintModal] = useState({
    isOpen: false,
    title: "",
    html: "",
  });

  // Estado del Orbe Global
  const systemState = useMemo(
    () => calcularEstadoSistema(students, isAssistantOpen, assistantStatus),
    [students, isAssistantOpen, assistantStatus],
  );

  const openQuickRegister = (type?: any) => {
    if (type) setQuickRegisterType(type);
    setQuickRegisterOpen(true);
  };

  const printDocument = (job: any, showPreview: boolean = true) => {
    setActivePrintJob(job);

    if (showPreview) {
      // Si se solicita preview, no imprimimos de inmediato, solo preparamos los datos
      // La UI (App.tsx o similar) reaccionará abriendo el modal de previsualización
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
      // ... Otros casos simplificados para el asistente
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
    systemState,
    activePrintJob,
    setActivePrintJob,
    printDocument,
    printModal,
    setPrintModal,
  };
};
