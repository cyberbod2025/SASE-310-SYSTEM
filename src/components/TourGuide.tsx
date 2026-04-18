import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { UserRole } from "../types";

// Tour Principal
export const startProductTour = (
  userName: string = "Usuario",
  role: UserRole = UserRole.DOCENTE,
  setIsTourActive?: (active: boolean) => void,
  setTourStep?: (step: number) => void,
) => {
  if (setIsTourActive) setIsTourActive(true);
  
  // Prevenir que se inicien múltiples tours al mismo tiempo
  if (document.querySelector(".driver-popover")) {
    console.warn("Tour ya está en ejecución");
    return;
  }

  // Marcamos que el tour está activo para que el modal lo detecte
  localStorage.setItem("sase_tour_active", "true");

  // Helper para añadir la "cara" de Sasito a cada paso si es necesario
  const withSasito = (title: string, desc: string) => ({
    title: `<div class='flex items-center gap-3'><span class='text-violet-400 font-bold'>🤖 SASITO:</span> <span class='text-white uppercase tracking-wider font-black text-xs'>${title}</span></div>`,
    description: `<div class='sase-tour-step-orb-container'><div class='sase-tour-step-orb'></div></div>` + 
                 `<div class='mt-4 text-slate-300 font-medium italic'>"${desc}"</div>`,
  });

  // 1. Pasos Base (Bienvenida + Sidebar Global)
  const steps: any[] = [
    {
      popover: {
        title: `NÚCLEO SASE-310: Hola, ${userName} 👋`,
        description:
          "<div style='margin-bottom: 20px; display: flex; justify-content: center;'>" +
          "  <div class='sase-tour-welcome-orb'></div>" +
          "</div>" +
          "Soy <b>Sasito</b>, tu Copiloto IA. Mi núcleo de procesamiento está listo para optimizar tu gestión escolar.<br><br>" +
          "Permíteme guiarte por los 11 protocolos clave para asegurar una operación institucional impecable.",
        side: "center",
        align: "center",
      },
    },
    {
      element: "#sidebar-logo",
      popover: withSasito("Paso 2: Rango Institucional 🛡️", `He verificado tu identidad como docente con rango: <b class="text-violet-400 uppercase">${role}</b>. Mis algoritmos se han adaptado a tus facultades específicas.`),
    },
    {
      element: "#sidebar-nav",
      popover: withSasito("Paso 3: Consola de Inteligencia 🧭", "Aquí convergen los nodos de información: Expedientes, Agendas y Metadatos. Todo está interconectado para tu comodidad."),
    },
    {
      element: "#sidebar-feedback",
      popover: withSasito("Paso 4: Sincronización de Mejoras 🗣️", "¿Detectas alguna anomalía en mi núcleo? Este es tu enlace directo con mi equipo de ingeniería."),
    },
    {
      element: "#dashboard-header",
      popover: withSasito("Paso 5: Centro de Comando 🏛️", "Desde aquí supervisas el pulso vital de la escuela. Una vista satelital de todo lo que importa ahora mismo."),
    },
    {
      element: "#kpi-assist",
      popover: withSasito("Paso 6: Métricas de Presencia 📈", "Monitoreo constante de asistencia. Mis sensores detectarán cualquier patrón de inasistencia inusual."),
    },
    {
      element: "#kpi-risk",
      popover: withSasito("Paso 7: Radar de Riesgo Crítico 🚨", "¡Cuidado aquí! Estas alertas requieren tu intervención inmediata. Son trayectorias que necesitan nuestro apoyo."),
    },
    {
      element: "#panel-risk-groups",
      popover: withSasito("Paso 8: Focalización Estratégica 🎯", "Aquí agrupo a los estudiantes con mayores índices de conflicto. Dirige tu atención aquí para maximizar el impacto."),
    },
    {
      element: "#export-btn",
      popover: withSasito("Paso 9: Inteligencia Documental 🖨️", "¿Necesitas un reporte? Genero documentos ejecutivos con un solo clic, listos para los protocolos oficiales."),
    },
    {
      element: "#quick-register-btn",
      popover: withSasito("Paso 10: Registro Rápido ⚡", "¿Algo sucedió? Reporta incidencias en segundos. Yo me encargo de procesar la narrativa y preparar el acta."),
    },
    {
      popover: withSasito("Paso 11: Inducción Finalizada 🌟", "Sincronización completa. Ahora eres parte integral del núcleo SASE-310. Estaré aquí si me necesitas."),
    }
  ];

  const driverObj = driver({
    showProgress: true,
    animate: true,
    allowClose: true,
    stagePadding: 8,
    popoverClass: "sase-tour-popover", 
    doneBtnText: "FINALIZAR INDUCCIÓN",
    nextBtnText: "SIGUIENTE FASE ➔",
    prevBtnText: "⬅ PROTOCOLO ANTERIOR",
    progressText: "ETAPA {{current}} DE {{total}}",
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
