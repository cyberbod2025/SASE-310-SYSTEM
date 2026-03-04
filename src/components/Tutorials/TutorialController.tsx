import React, { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useApp } from "../../store";
import { UserRole } from "../../types";
import toast from "react-hot-toast";

export const TutorialController: React.FC = () => {
  const { currentUserRole, isTutorMode } = useApp();

  useEffect(() => {
    // Pasos comunes para la navegación global
    const commonSteps = [
      {
        element: "#sidebar-logo",
        popover: {
          title: "Identidad Institucional",
          description: "Tu rol y nivel de acceso actual están visibles aquí.",
          side: "right",
          align: "start",
        },
      },
      {
        element: "#sidebar-nav",
        popover: {
          title: "Navegación Principal",
          description:
            "Accede a los diferentes módulos de tu área desde este menú lateral.",
          side: "right",
          align: "start",
        },
      },
      {
        element: "#notification-bell",
        popover: {
          title: "Centro de Notificaciones",
          description:
            "Mantente al tanto de alertas urgentes y actualizaciones del sistema.",
          side: "bottom",
          align: "end",
        },
      },
    ];

    const stepsByRole: Record<string, any[]> = {
      [UserRole.DIRECTIVO]: [
        ...commonSteps,
        {
          element: "#dashboard-header",
          popover: {
            title: "Centro de Mando",
            description:
              "Visualice el estado general de la institución y el semáforo de riesgo.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#kpi-risk",
          popover: {
            title: "Casos Críticos",
            description:
              "Monitoreo en tiempo real de los alumnos que requieren intervención inmediata.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#panel-risk-groups",
          popover: {
            title: "Detalle de Riesgo",
            description:
              "Gestione los casos específicos y tome decisiones directivas.",
            side: "top",
            align: "center",
          },
        },
        {
          element: "#export-btn",
          popover: {
            title: "Informes Ejecutivos",
            description:
              "Genere informes detallados para supervisión o juntas de consejo.",
            side: "left",
            align: "start",
          },
        },
      ],
      [UserRole.DOCENTE]: [
        ...commonSteps,
        {
          element: "#docente-dashboard-title",
          popover: {
            title: "Control de Aula",
            description: "Gestione sus grupos y materias desde un solo lugar.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#docente-tabs",
          popover: {
            title: "Módulos de Grupo",
            description:
              "Acceda al Pase de Lista, Calificaciones y Panel General.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#risk-semaphore",
          popover: {
            title: "Semáforo de Alumnos",
            description:
              "Identifique rápidamente a los estudiantes que necesitan apoyo académico o conductual.",
            side: "top",
            align: "center",
          },
        },
      ],
      [UserRole.PREFECTURA]: [
        ...commonSteps,
        {
          element: "#pref-header",
          popover: {
            title: "Operativo de Prefectura",
            description: "Controle la disciplina y asistencia en tiempo real.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#pref-kpi-grid",
          popover: {
            title: "Estadísticas del Turno",
            description: "Visualice retardos, faltas y reportes del día.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#pref-quick-register",
          popover: {
            title: "Registro Ágil",
            description:
              "Registre incidencias con un solo clic o usando el escáner de matrícula.",
            side: "top",
            align: "center",
          },
        },
      ],
      [UserRole.ORIENTACION]: [
        ...commonSteps,
        {
          element: "#orientacion-title",
          popover: {
            title: "Acompañamiento",
            description:
              "Gestione el bienestar emocional y académico de los alumnos.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#citation-manager",
          popover: {
            title: "Agenda de Citatorios",
            description:
              "Administre las citas con padres de familia y el seguimiento de casos.",
            side: "left",
            align: "start",
          },
        },
      ],
      [UserRole.TRABAJO_SOCIAL]: [
        ...commonSteps,
        {
          element: "#ts-header",
          popover: {
            title: "Gestión Social",
            description:
              "Control de justificantes y vinculación con la comunidad escolar.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#ts-form-justificante",
          popover: {
            title: "Emisor de Justificantes",
            description: "Genere y timbre justificantes oficiales rápidamente.",
            side: "right",
            align: "start",
          },
        },
        {
          element: "#ts-history",
          popover: {
            title: "Archivo Histórico",
            description:
              "Consulte todos los justificantes emitidos por la institución.",
            side: "left",
            align: "start",
          },
        },
      ],
      [UserRole.PROMOTORA]: [
        ...commonSteps,
        {
          element: "#promotora-header",
          popover: {
            title: "Fomento a la Lectura",
            description:
              "Gestione las actividades y avances de los grupos asignados.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#promotora-groups",
          popover: {
            title: "Grupos Asignados",
            description:
              "Visualice el estado de cada grupo bajo su supervisión.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#promotora-tabs",
          popover: {
            title: "Registro de Avances",
            description:
              "Documente actividades, eventos y evidencias fotográficas.",
            side: "top",
            align: "center",
          },
        },
      ],
      [UserRole.SECRETARIA]: [
        ...commonSteps,
        {
          element: "#secretaria-header",
          popover: {
            title: "Control Escolar",
            description:
              "Gestión administrativa de la matrícula y expedientes.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#secretaria-search",
          popover: {
            title: "Búsqueda Global",
            description:
              "Encuentre cualquier expediente por nombre o matrícula instantáneamente.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#secretaria-list",
          popover: {
            title: "Directorio Estudiantil",
            description: "Acceso total a la base de datos institucional.",
            side: "top",
            align: "center",
          },
        },
      ],
      [UserRole.UDEII]: [
        ...commonSteps,
        {
          element: "#udeii-header",
          popover: {
            title: "Inclusión Educativa",
            description:
              "Acompañamiento a alumnos con Barreras para el Aprendizaje (BAP).",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#udeii-new",
          popover: {
            title: "Nuevos Expedientes",
            description: "Inicie el seguimiento especializado para un alumno.",
            side: "left",
            align: "start",
          },
        },
        {
          element: "#udeii-list",
          popover: {
            title: "Padrón de Inclusión",
            description:
              "Gestione los ajustes razonables y bitácoras de seguimiento.",
            side: "top",
            align: "center",
          },
        },
      ],
      [UserRole.ENFERMERIA]: [
        ...commonSteps,
        {
          element: "#enfermeria-header",
          popover: {
            title: "Servicio Médico",
            description:
              "Control de salud, alergias y atención de primeros auxilios.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#enfermeria-alerts",
          popover: {
            title: "Alertas Médicas",
            description:
              "Monitoreo constante de alumnos con condiciones de salud críticas.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#enfermeria-inventory",
          popover: {
            title: "Estadísticas de Salud",
            description:
              "Seguimiento a consultas diarias y administración de medicamentos.",
            side: "top",
            align: "center",
          },
        },
      ],
    };

    const tutorialKey = `sase_tutorial_seen_${currentUserRole}`;
    const hasSeenTutorial = localStorage.getItem(tutorialKey);

    // Solo iniciar si hay pasos definidos para el rol actual y no se ha visto
    const steps = stepsByRole[currentUserRole];

    if (steps && !hasSeenTutorial) {
      const driverObj = driver({
        showProgress: true,
        popoverClass: "sase-tour-popover", // Enable custom SASE styles
        animate: true, // Force animation
        steps: steps,
        nextBtnText: "Siguiente",
        prevBtnText: "Atrás",
        doneBtnText: "¡Empezar a trabajar!",
        onDestroyed: () => {
          // Marcar como visto al finalizar o cerrar
          localStorage.setItem(tutorialKey, "true");

          // Bienvenida FINAL de la IA (User request: IA welcome after tutorial)
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
                      <div className="relative size-12 shrink-0 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 animate-[spin_3s_linear_infinite] blur-sm opacity-50"></div>
                        <div className="absolute inset-0.5 rounded-full bg-black/90 flex items-center justify-center">
                          <img
                            className="h-8 w-8 object-contain"
                            src="/assets/branding/SASE_ICON.png"
                            alt="IA SASE"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-black text-white uppercase tracking-tighter italic">
                        PROTOCOLOS INICIADOS
                      </p>
                      <p className="mt-1 text-xs font-bold text-blue-200/70 leading-relaxed uppercase tracking-widest">
                        ¡Excelente! Ahora tienes el control total. Soy tu
                        asistente virtual y estaré presente en cada módulo para
                        apoyarte.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex border-l border-white/5">
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-xs font-black text-blue-400 hover:text-white uppercase tracking-widest transition-colors"
                  >
                    OK
                  </button>
                </div>
              </div>
            ),
            { duration: 6000 },
          );
        },
      });

      // Iniciar el tour inmediatamente si el DOM está listo
      setTimeout(() => driverObj.drive(), 1000);
    }
  }, [currentUserRole]);

  return null;
};
