import React, { useEffect, useState } from "react";
import { useApp } from "../../store";
import { UserRole } from "../../types";
import toast from "react-hot-toast";
import { SaseSplineOrb } from "../SaseSplineOrb";
import { TacticalSpotlight } from "../ui/TacticalSpotlight";

export const TutorialController: React.FC = () => {
  const { currentUserRole, currentUserProfile } = useApp();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const autoTutorialEnabled = localStorage.getItem("sase_autotutorial_enabled") !== "false"; 
    const tutorialKey = `sase_tutorial_seen_${currentUserRole}`;
    const hasSeenTutorial = localStorage.getItem(tutorialKey);

    if (autoTutorialEnabled && !hasSeenTutorial) {
      const timer = setTimeout(() => setIsActive(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [currentUserRole]);

  const commonSteps: any[] = [
    {
      element: "#sidebar-logo",
      title: "Identidad Institucional",
      description: "Tu rol y nivel de acceso actual están visibles aquí. Mantén tu perfil actualizado para recibir las herramientas correctas.",
      side: "right",
    },
    {
      element: "#sidebar-nav",
      title: "Navegación Táctica",
      description: "Accede a los diferentes módulos de tu área desde este menú lateral. El sistema prioriza las herramientas según la urgencia.",
      side: "right",
    },
    {
      element: "#notification-bell",
      title: "Centro de Alertas",
      description: "Mantente al tanto de alertas urgentes y actualizaciones críticas del sistema en tiempo real.",
      side: "bottom",
    },
  ];

  const stepsByRole: Record<string, any[]> = {
    [UserRole.DIRECTIVO]: [
      ...commonSteps,
      {
        element: "#dashboard-header",
        title: "Centro de Mando",
        description: "Visualice el estado general de la institución y el semáforo de riesgo consolidado.",
        side: "bottom",
      },
      {
        element: "#panel-risk-groups",
        title: "Indicadores Clave",
        description: "Monitoreo en tiempo real de los alumnos que requieren intervención inmediata por derivas conductuales.",
        side: "bottom",
      },
      {
        element: "#export-btn",
        title: "Informes Ejecutivos",
        description: "Genere informes detallados con un solo clic para supervisión o juntas de consejo.",
        side: "left",
      },
    ],
    [UserRole.DOCENTE]: [
      ...commonSteps,
      {
        element: "#dashboard-header",
        title: "Control de Aula",
        description: "Gestiona tus grupos y materias desde un solo lugar. SASE te ayuda a detectar patrones tempranos.",
        side: "bottom",
      },
      {
        element: "#export-btn",
        title: "Reporte Rápido",
        description: "Registra incidencias o derivas académicas al instante para activar los protocolos de apoyo.",
        side: "left",
      },
    ],
    [UserRole.PREFECTURA]: [
      ...commonSteps,
      {
        element: "#pref-header",
        title: "Operativo de Prefectura",
        description: "Controla la disciplina y asistencia en tiempo real con herramientas tácticas de campo.",
        side: "bottom",
      },
      {
        element: "#pref-quick-register",
        title: "Registro Ágil",
        description: "Registre incidencias con un solo clic o usando el escáner de matrícula institucional.",
        side: "top",
      },
    ],
  };

  const steps = stepsByRole[currentUserRole] || commonSteps;

  const handleComplete = () => {
    setIsActive(false);
    const tutorialKey = `sase_tutorial_seen_${currentUserRole}`;
    localStorage.setItem(tutorialKey, "true");

    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } max-w-md w-full bg-[#0a1930] shadow-2xl rounded-2xl pointer-events-auto flex border border-white/10 backdrop-blur-xl`}
        >
          <div className="flex-1 w-0 p-5">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="relative size-14 shrink-0 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-pulse blur-md"></div>
                  <div className="absolute inset-0 flex items-center justify-center scale-[1.5]">
                    <SaseSplineOrb state="thinking" />
                  </div>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-black text-white uppercase tracking-tighter italic">
                  PROTOCOLOS INICIADOS
                </p>
                <p className="mt-1 text-xs font-bold text-blue-200/70 leading-relaxed uppercase tracking-widest">
                  ¡Excelente! Ahora tienes el control total. Soy Sasito, tu
                  asistente virtual. Estaré aquí para guiarte en cada paso.
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-white/5">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-xs font-black text-blue-400 hover:text-white uppercase tracking-widest transition-colors"
            >
              ENTENDIDO
            </button>
          </div>
        </div>
      ),
      { duration: 6000 },
    );
  };

  return (
    <TacticalSpotlight 
      isActive={isActive}
      steps={steps}
      onComplete={handleComplete}
      onClose={() => setIsActive(false)}
      userName={currentUserProfile?.nombre || "Usuario"}
    />
  );
};
