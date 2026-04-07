import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { UserRole } from "../types";

// Tour Principal
// Tour Principal
export const startProductTour = (
  userName: string = "Usuario",
  role: UserRole = UserRole.DOCENTE,
  setIsTourActive?: (active: boolean) => void,
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
    title: `<div class='flex items-center gap-3'><span>🤖 <b>SASITO:</b> ${title}</span></div>`,
    description: `<div class='sase-tour-step-orb-container'><div class='sase-tour-step-orb'></div></div>` + desc,
  });

  // 1. Pasos Base (Bienvenida + Sidebar Global)
  // 11 Pasos Lineales Universales (Secuenciador)
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
      popover: withSasito("Paso 2: Rango Institucional 🛡️", `Identidad verificada como: <b class="uppercase">${role}</b>. He ajustado tus facultades.`),
    },
    {
      element: "#sidebar-nav",
      popover: withSasito("Paso 3: Consola Central 🧭", "Módulos de inteligencia: Expedientes, Agendas y Metadatos interconectados."),
    },
    {
      element: "#sidebar-feedback",
      popover: withSasito("Paso 4: Sincronización de Mejoras 🗣️", "Portal de comunicación con Ingeniería para reportar anomalías."),
    },
    {
      element: "#dashboard-header",
      popover: withSasito("Paso 5: Centro de Comando 🏛️", "Vista satelital. Supervisa el pulso vital de la escuela en tiempo real."),
    },
    {
      element: "#kpi-assist",
      popover: withSasito("Paso 6: Métricas de Presencia 📈", "Monitoreo constante. Detección automática de desviaciones."),
    },
    {
      element: "#kpi-risk",
      popover: withSasito("Paso 7: Radar de Riesgo Crítico 🚨", "Alertas rojas que requieren intervención delegada inmediata."),
    },
    {
      element: "#panel-risk-groups",
      popover: withSasito("Paso 8: Focalización Estratégica 🎯", "Grupos con índices de conflicto. Dirige los recursos aquí."),
    },
    {
      element: "#export-btn",
      popover: withSasito("Paso 9: Inteligencia Documental 🖨️", "Transformo datos en reportes ejecutivos listos para imprimir."),
    },
    {
      element: "#quick-register-btn",
      popover: withSasito("Paso 10: Registro Rápido ⚡", "Reporta incidencias en solo 3 clics. Yo proceso la narrativa y el acta."),
    },
    {
      popover: withSasito("Paso 11: Inducción Finalizada 🌟", "Has sido sincronizado con el núcleo SASE-310. ¡Adelante!"),
    }
  ];


  const driverObj = driver({
    showProgress: true,
    animate: true,
    allowClose: true,
    stagePadding: 6,
    popoverClass: "sase-tour-popover", 
    doneBtnText: "FINALIZAR INDUCCIÓN",
    nextBtnText: "SIGUIENTE FASE ➔",
    prevBtnText: "⬅ PROTOCOLO ANTERIOR",
    progressText: "ETAPA {{current}} DE {{total}}",
    steps: steps,
    onDestroyStarted: () => {
      localStorage.removeItem("sase_tour_active");
      if (setIsTourActive) setIsTourActive(false);
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
