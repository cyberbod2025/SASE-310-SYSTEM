import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { UserRole } from "../types";

const sasitoTourMarkup = (label: string) => `
  <div class="sase-tour-sasito-row" aria-hidden="true">
    <div class="sase-tour-sasito-orb">
      <span></span><span></span>
    </div>
    <div class="sase-tour-sasito-label">${label}</div>
  </div>
`;

// Tour Principal
export const startProductTour = (
  userName: string = "Usuario",
  role: UserRole = UserRole.DOCENTE,
  setIsTourActive?: (active: boolean) => void,
  setTourStep?: (step: number) => void,
) => {
  const LEGACY_TOUR_DISABLED = false;

  if (LEGACY_TOUR_DISABLED) {
    console.warn("Legacy tour is disabled. Use the new onboarding system.");
    return;
  }

  // Prevenir que se inicien múltiples tours al mismo tiempo
  if (document.querySelector(".driver-popover")) {
    console.warn("Tour ya está en ejecución");
    return;
  }

  if (setIsTourActive) setIsTourActive(true);

  // Marcamos que el tour está activo para que el modal lo detecte
  localStorage.setItem("sase_tour_active", "true");

  const buildPopover = (title: string, desc: string, label = "Sasito te guía") => ({
    title: `<div class='text-[11px] font-black uppercase tracking-[0.28em] text-emerald-300'>${title}</div>`,
    description: `${sasitoTourMarkup(label)}<div class='mt-3 text-[13px] leading-relaxed text-slate-200'>${desc}</div>`,
  });

  const isCompactViewport = window.innerWidth < 1024;

  const rawSteps: any[] = isCompactViewport
    ? [
        {
          popover: {
            title: `Guía rápida SASE`,
            description: `${sasitoTourMarkup("Inicio guiado")}Hola, ${userName}. Esta guía compacta resume lo esencial: usa el menú lateral para navegar, MI PERFIL para corregir tus datos visibles, NOTIFICACIONES para atender avisos y REPORTE RÁPIDO para registrar acciones operativas. Los módulos del ecosistema aparecerán cuando tu cuenta tenga acceso.`,
            side: "center",
            align: "center",
          },
        },
      ]
    : [
    {
      popover: {
        title: `Guía rápida SASE`,
        description: `${sasitoTourMarkup("Inicio guiado")}Hola, ${userName}. Vamos a recorrer las zonas principales en orden para que sepas qué hace cada parte del sistema y dónde pedir apoyo.`,
        side: "center",
        align: "center",
      },
    },
    {
      element: "#sidebar-logo",
      popover: buildPopover("Identidad institucional", `Tu sesión quedó validada con el rol <b class="text-emerald-300 uppercase">${role}</b>. Aquí se muestra tu contexto actual dentro del sistema.`),
    },
    {
      element: "#sidebar-nav",
      popover: buildPopover("Navegación principal", "Este menú concentra los módulos institucionales de uso diario. Si quieres volver a tu tablero o cambiar de área, siempre regresas aquí."),
    },
    {
      element: "#sidebar-ecosistema",
      popover: buildPopover("Ecosistema", "En este bloque deben aparecer Feria, Diagnóstico Colectivo y otros módulos externos habilitados para tu perfil."),
    },
    {
      element: "#notification-bell",
      popover: buildPopover("Notificaciones", "La campana avisa cuando hay pendientes nuevos. Si parpadea o cambia de color, abre el panel para revisar avisos y entrar al módulo relacionado."),
    },
    {
      element: "#quick-register-btn",
      popover: buildPopover("Registro rápido", "Este acceso te lleva al flujo operativo más ágil del sistema para registrar incidencias o eventos sin perder contexto."),
    },
    {
      element: "#sasito-assistant-anchor",
      popover: buildPopover("Sasito", "Sasito permanece disponible para explicar funciones, iniciar este tour y ejecutar acciones permitidas por tu perfil. Si una acción no corresponde a tu rol, te lo dirá sin forzar el acceso."),
    },
    {
      popover: buildPopover("Listo", "La guía terminó. El manual y Sasito siguen disponibles para resolver dudas sin sacarte del flujo de trabajo.", "Tour completado"),
    }
  ];

  const steps = rawSteps.filter((step) => {
    if (!step.element) {
      return true;
    }

    const el = document.querySelector(step.element) as HTMLElement;
    if (!el) return false;

    // Verificar visibilidad física (dimensiones mayores a cero y no oculto en estilos)
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      style.display !== "none" &&
      style.visibility !== "hidden"
    );
  });

  if (steps.length === 0) {
    localStorage.removeItem("sase_tour_active");
    if (setIsTourActive) setIsTourActive(false);
    if (setTourStep) setTourStep(0);
    console.warn("No hay pasos válidos para el tour en la vista actual");
    return;
  }

  const driverObj = driver({
    showProgress: true,
    animate: true,
    allowClose: true,
    stagePadding: 8,
    popoverClass: "sase-tour-popover", 
    doneBtnText: isCompactViewport ? "Entendido" : "Cerrar guía",
    nextBtnText: "Siguiente",
    prevBtnText: "Atrás",
    progressText: "Paso {{current}} de {{total}}",
    disableActiveInteraction: false,
    smoothScroll: true,
    steps: steps,
    onHighlightStarted: (element, step, { state }) => {
      if (setTourStep) setTourStep(state.activeIndex);
    },
    onDestroyStarted: () => {
      localStorage.removeItem("sase_tour_active");
      localStorage.setItem("sase_onboarding_v2_completed", "true");
      if (setIsTourActive) setIsTourActive(false);
      if (setTourStep) setTourStep(0);
      driverObj.destroy();
    },
  });

  driverObj.drive();
};

// Tour Secundario (Dentro del Modal)
export const startRegisterModalTour = () => {
  const driverObj = driver({
    showProgress: true,
    animate: true,
    allowClose: true,
    doneBtnText: "¡Misión Cumplida! 🎉",
    nextBtnText: "Siguiente ➡",
    prevBtnText: "⬅ Atrás",
    progressText: "Misión: Paso {{current}} de {{total}}",
    steps: [
      {
        element: "#qr-search",
        popover: {
          title: "1. Busca al Estudiante 🔍",
          description:
            "Empieza escribiendo el nombre (ej. 'Carlos') o la matrícula. El sistema filtrará en tiempo real.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#qr-type",
        popover: {
          title: "2. Clasifica el Evento 🏷️",
          description:
            "¿Es un tema de Salud, Conducta o Académico? Esto ayuda a generar estadísticas automáticas.",
          side: "right",
          align: "center",
        },
      },
      {
        element: "#qr-desc",
        popover: {
          title: "3. Detalles (o Voz) 🎙️",
          description:
            "Escribe brevemente lo sucedido. Si tienes prisa, usa el micrófono para dictar.",
          side: "top",
          align: "start",
        },
      },
      {
        element: "#qr-save",
        popover: {
          title: "4. ¡Guardar! 💾",
          description:
            "Al pulsar aquí, la incidencia se anexa al expediente digital del alumno y se notifica a quien corresponda.",
          side: "top",
          align: "end",
        },
      },
      {
        popover: {
          title: "¡Excelente Trabajo! 🌟",
          description:
            "Has completado tu primera capacitación. Ya sabes usar el módulo más importante de SASE-310.",
        },
      },
    ],
    onDestroyStarted: () => {
      // Al terminar este tour, limpiamos la bandera
      localStorage.removeItem("sase_tour_active");
      driverObj.destroy();
    },
  });

  driverObj.drive();
};
