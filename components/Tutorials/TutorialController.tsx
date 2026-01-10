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
      [UserRole.DOCENTE]: [
        ...commonSteps,
        {
          element: "#docente-dashboard-title",
          popover: {
            title: "Panel Docente",
            description:
              "Bienvenido a tu centro de control. Aquí verás el estado general de tus grupos.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#docente-tabs",
          popover: {
            title: "Herramientas de Clase",
            description:
              "Cambia entre el Panel Principal, Pase de Lista y Captura de Calificaciones.",
            side: "top",
            align: "start",
          },
        },
        {
          element: "#risk-semaphore",
          popover: {
            title: "Semáforo de Riesgo",
            description:
              "Visualiza rápidamente cuántos alumnos requieren atención prioritaria.",
            side: "right",
            align: "start",
          },
        },
      ],
      [UserRole.ORIENTACION]: [
        ...commonSteps,
        {
          element: "#orientacion-title",
          popover: {
            title: "Módulo de Orientación",
            description: "Gestión de seguimiento conductual y emocional.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#citation-manager",
          popover: {
            title: "Gestión de Citatorios",
            description: "Programa y administra citas con padres de familia.",
            side: "left",
            align: "start",
          },
        },
      ],
      [UserRole.ENFERMERIA]: [
        ...commonSteps,
        {
          element: "#enfermeria-header",
          popover: {
            title: "Enfermería Escolar",
            description: "Panel de control para salud y primeros auxilios.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#enfermeria-alerts",
          popover: {
            title: "Alertas Médicas",
            description:
              "Monitorea estudiantes con condiciones críticas en tiempo real.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#enfermeria-inventory",
          popover: {
            title: "Control de Inventario",
            description: "Gestiona medicamentos y material de curación.",
            side: "left",
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
            description: "Gestión administrativa y documental.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#secretaria-search",
          popover: {
            title: "Búsqueda Avanzada",
            description: "Localiza expedientes por nombre, matrícula o grupo.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#secretaria-list",
          popover: {
            title: "Directorio Estudiantil",
            description:
              "Consulta, edita y genera documentación (Boletas/Kardex) desde aquí.",
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
            title: "Control de Prefectura",
            description: "Gestión de disciplina y reportes diarios.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#pref-kpi-grid",
          popover: {
            title: "Indicadores Clave",
            description: "Monitoreo en tiempo real de asistencia y retardos.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#pref-quick-register",
          popover: {
            title: "Registro Express",
            description:
              "Captura rápida de incidencias (uniforme, retardos) por matrícula.",
            side: "right",
            align: "center",
          },
        },
      ],
      [UserRole.TRABAJO_SOCIAL]: [
        ...commonSteps,
        {
          element: "#ts-header",
          popover: {
            title: "Trabajo Social",
            description: "Gestión de intervención social y justificantes.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#ts-generator",
          popover: {
            title: "Generador de Justificantes",
            description:
              "Emite documentos oficiales con opción de dictado por voz.",
            side: "right",
            align: "start",
          },
        },
      ],
      [UserRole.DIRECTIVO]: [
        ...commonSteps,
        {
          element: "body", // No hay IDs específicos aun, step global
          popover: {
            title: "Vista Directiva",
            description:
              "Acceso privilegiado a todos los KPIs de la institución.",
            side: "mid-center",
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
      // Mensaje de bienvenida SASE-IA
      setTimeout(() => {
        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? "animate-enter" : "animate-leave"
              } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src="/assets/branding/AI_AVATAR_SASE.jpg"
                      alt="IA SASE"
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Hola, soy SASE IA
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Bienvenido al sistema. Permíteme guiarte en un breve
                      recorrido por tus nuevas herramientas.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Omitir
                </button>
              </div>
            </div>
          ),
          { duration: 5000 }
        );
      }, 500);

      const driverObj = driver({
        showProgress: true,
        steps: steps,
        nextBtnText: "Siguiente",
        prevBtnText: "Atrás",
        doneBtnText: "Entendido",
        onDestroyed: () => {
          // Marcar como visto al finalizar o cerrar
          localStorage.setItem(tutorialKey, "true");
          toast.success(
            "¡Tutorial completado! Recuerda que siempre estoy aquí para ayudarte."
          );
        },
      });

      // Delay para asegurar que el DOM esté listo y el toast aparezca primero
      setTimeout(() => {
        driverObj.drive();
      }, 2500); // Dar tiempito para leer el mensaje de la IA
    }
  }, [currentUserRole]);

  return null;
};
