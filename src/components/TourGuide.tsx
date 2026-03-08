import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { UserRole } from "../types";

// Tour Principal
// Tour Principal
export const startProductTour = (
  userName: string = "Usuario",
  role: UserRole = UserRole.DOCENTE,
) => {
  // Prevenir que se inicien múltiples tours al mismo tiempo
  if (document.querySelector(".driver-popover")) {
    console.warn("Tour ya está en ejecución");
    return;
  }

  // Marcamos que el tour está activo para que el modal lo detecte
  localStorage.setItem("sase_tour_active", "true");

  // 1. Pasos Base (Bienvenida + Sidebar Global)
  const steps: any[] = [
    {
      // Pantalla de Bienvenida (Sin elemento = Modal Centrado)
      popover: {
        title: `NÚCLEO SASE-310: Hola, ${userName} 👋`,
        description:
          "<div style='margin-bottom: 20px; display: flex; justify-content: center;'><div style='width: 60px; height: 60px; background: rgba(59, 130, 246, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(59, 130, 246, 0.3);'><span class='material-symbols-outlined' style='color: #60a5fa; font-size: 32px;'>smart_toy</span></div></div>" +
          "Soy la <b>IA de SASE-310</b>. Mi núcleo de procesamiento está listo para optimizar tu gestión escolar.<br><br>" +
          "He calibrado tu entorno de trabajo. Permíteme guiarte por los protocolos clave de tu operación institucional.",
        side: "center",
        align: "center",
      },
    },
    {
      element: "#sidebar-logo",
      popover: {
        title: "Identidad & Rango Institucional 🛡️",
        description:
          `Protocolos de seguridad verificados para: <b>${role}</b>. ` +
          "He desplegado automáticamente las facultades, accesos y herramientas que corresponden a tu rango en la estructura educativa.",
        side: "right",
        align: "start",
      },
    },
    {
      element: "#sidebar-nav",
      popover: {
        title: "Consola de Navegación 🧭",
        description:
          "Aquí residen los módulos de inteligencia: Expedientes, Agendas y Metadatos. Todo está interconectado para que la información fluya sin fricciones.",
        side: "right",
        align: "center",
      },
    },
    {
      element: "#sidebar-feedback",
      popover: {
        title: "Sincronización de Mejoras 🗣️",
        description:
          "Mi red neuronal aprende de tu experiencia. Si detectas una anomalía o tienes una sugerencia de mejora, este es el portal directo hacia mis desarrolladores.",
        side: "right",
        align: "center",
      },
    },
  ];

  // 2. Pasos Contextuales por Rol (Dashboard Específico)
  switch (role) {
    case UserRole.DIRECTIVO:
      steps.push(
        {
          element: "#dashboard-header",
          popover: {
            title: "Centro de Comando Institucional 🏛️",
            description:
              "Esta es tu vista satelital. Desde aquí supervisas el pulso vital de la escuela con datos procesados en tiempo real.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#kpi-assist",
          popover: {
            title: "Métricas de Presencia 📈",
            description:
              "Monitoreo constante de asistencia. La IA detecta automáticamente desviaciones que podrían indicar riesgos de deserción.",
            side: "top",
            align: "center",
          },
        },
        {
          element: "#kpi-risk",
          popover: {
            title: "Radar de Riesgo Crítico 🚨",
            description:
              "<b>Prioridad Máxima.</b> Estas son las alertas rojas que requieren tu intervención directa o delegación inmediata a protocolos de seguimiento.",
            side: "top",
            align: "center",
          },
        },
        {
          element: "#panel-risk-groups",
          popover: {
            title: "Focalización Estratégica 🎯",
            description:
              "He identificado los grupos con mayores índices de conflicto. Dirige los recursos de Orientación y Prefectura hacia estos nodos críticos.",
            side: "right",
            align: "start",
          },
        },
        {
          element: "#export-btn",
          popover: {
            title: "Inteligencia Documental 🖨️",
            description:
              "Transformo los datos en reportes ejecutivos listos para imprimir. Eficacia administrativa para tus juntas de consejo.",
            side: "left",
            align: "center",
          },
        },
      );
      break;

    case UserRole.PREFECTURA:
      steps.push(
        {
          element: "#pref-header",
          popover: {
            title: "Unidad de Control Operativo",
            description:
              "Bienvenido, Prefecto. Tu consola está configurada para el monitoreo táctico de la convivencia diaria.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#pref-quick-register",
          popover: {
            title: "Ingreso de Datos Táctico ⚡",
            description:
              "Registra anomalías (retardos, uniforme, conducta) en menos de 5 segundos. Mi sistema se encarga del resto del papeleo legal.",
            side: "right",
            align: "center",
          },
        },
        {
          element: "#pref-kpi-grid",
          popover: {
            title: "Análisis del Flujo Escolar 📊",
            description:
              "Métricas vivas sobre retardos y cumplimiento normativo. Si los números suben, es hora de un patrullaje intensivo.",
            side: "top",
            align: "center",
          },
        },
        {
          element: "#pref-recent-activity",
          popover: {
            title: "Historial de Eventos 🕒",
            description:
              "Seguimiento segundo a segundo de todas las incidencias en el plantel. Nada escapa al registro institucional.",
            side: "top",
            align: "center",
          },
        },
        {
          element: "#pref-daily-alerts",
          popover: {
            title: "Detección de Patrones ⚠️",
            description:
              "Mis algoritmos te alertarán sobre alumnos recurrentes automáticamente. Actúa antes de que la falta se vuelva hábito.",
            side: "left",
            align: "center",
          },
        },
      );
      break;

    case UserRole.SECRETARIA:
      steps.push(
        {
          element: "#nav-expedientes",
          popover: {
            title: "Célula Administrativa 📝",
            description:
              "Gestión de expedientes e integridad de la base de datos de los alumnos. Actualizaciones de estatus en un entorno confiable.",
            side: "right",
            align: "center",
          },
        },
        {
          element: "#nav-agenda",
          popover: {
            title: "Coordinación de Citas y Eventos 📅",
            description:
              "Módulo central de agendamiento. Lleva el control de citas de área, reuniones de directivos y eventos institucionales con eficiencia.",
            side: "right",
            align: "center",
          },
        },
      );
      break;

    default:
      // Para roles operativos (Docente, Prefecto, etc.) que usan el Registro Rápido
      steps.push({
        element: "#quick-register-btn",
        popover: {
          title: "⚡ Protocolo de Registro Rápido",
          description:
            "Esta es la herramienta más poderosa: <b>Reporta en solo 3 clics</b>. <br>Yo proceso la narrativa, notifico a tus superiores y genero el acta oficial. Tú solo enfócate en educar.",
          side: "bottom",
          align: "center",
        },
      });
      break;
  }

  // 3. Feedback Global y Cierre
  steps.push({
    element: "#sidebar-feedback",
    popover: {
      title: "Voz Activa del Usuario 🗣️",
      description:
        "Utiliza este panel en cualquier momento para enviar tus <b>comentarios, sugerencias o reportar errores</b> directamente al equipo de Ingeniería.",
      side: "right",
      align: "end",
    },
  });

  steps.push({
    popover: {
      title: "Protocolo de Inducción Finalizado 🌟",
      description:
        "Has sido sincronizado satisfactoriamente con el núcleo SASE-310. Explora con confianza, estás respaldado por inteligencia institucional.<br><br><i>Tu éxito es la paz de nuestra escuela.</i>",
      side: "center",
      align: "center",
    },
  });


  const driverObj = driver({
    showProgress: true,
    animate: true,
    allowClose: true,
    stagePadding: 6,
    popoverClass: "sase-tour-popover", // NUEVA CLASE PREMIUM
    doneBtnText: "FINALIZAR INDUCCIÓN",
    nextBtnText: "SIGUIENTE FASE ➔",
    prevBtnText: "⬅ PROTOCOLO ANTERIOR",
    progressText: "ETAPA {{current}} DE {{total}}",
    steps: steps,
    onDestroyStarted: () => {
      // Cleanup cleanup
      localStorage.removeItem("sase_tour_active");
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
