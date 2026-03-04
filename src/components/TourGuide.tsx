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
          "Soy la <b>IA de SASE-310</b>. Mi objetivo es optimizar tu gestión escolar.<br><br>" +
          "He configurado tu entorno de trabajo. Permíteme mostrarte los módulos clave para tu operación diaria.",
        side: "center",
        align: "center",
      },
    },
    {
      element: "#sidebar-logo",
      popover: {
        title: "Tu Identidad Profesional 🛡️",
        description:
          `El sistema ha detectado tu perfil de <b>${role}</b>. ` +
          "Todas las herramientas, permisos y accesos directos se han configurado automáticamente para ti.",
        side: "right",
        align: "start",
      },
    },
    {
      element: "#sidebar-nav",
      popover: {
        title: "Navegación Principal 🧭",
        description:
          "Aquí encontrarás los módulos esenciales para tu rol. Desde reportes hasta gestión de expedientes.",
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
            title: "Tablero de Dirección 🏛️",
            description:
              "Este es tu centro de comando. Visualiza el estado actual de la escuela con datos en tiempo real.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#kpi-assist",
          popover: {
            title: "Termómetro de Asistencia 📈",
            description:
              "Monitoreamos la asistencia global. Un indicador clave para la retención escolar.",
            side: "top",
            align: "center",
          },
        },
        {
          element: "#kpi-risk",
          popover: {
            title: "Radar de Riesgo 🚨",
            description:
              "<b>¡Crítico!</b> Aquí verás el número de estudiantes que requieren intervención inmediata por patrones de conducta o ausentismo.",
            side: "top",
            align: "center",
          },
        },
        {
          element: "#panel-risk-groups",
          popover: {
            title: "Focalización de Grupos 🎯",
            description:
              "Identifica rápidamente qué salones necesitan mayor apoyo o supervisión de prefectura y orientación.",
            side: "right",
            align: "start",
          },
        },
        {
          element: "#export-btn",
          popover: {
            title: "Informes Ejecutivos 🖨️",
            description:
              "¿Junta urgente? Descarga un resumen ejecutivo con todas las métricas actuales en un clic.",
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
            title: "Control de Disciplina",
            description:
              "Bienvenido al módulo de prefectura. Aquí gestionas la operación diaria del plantel.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#pref-quick-register",
          popover: {
            title: "Registro de Incidencias ⚡",
            description:
              "Esta es tu herramienta principal. Registra retardos, falta de uniforme o uso de celulares en segundos usando solo la matrícula.",
            side: "right",
            align: "center",
          },
        },
        {
          element: "#pref-kpi-grid",
          popover: {
            title: "Métricas del Día 📊",
            description:
              "Un vistazo rápido a cómo va el día: retardos acumulados y alumnos con incidencias de uniforme.",
            side: "top",
            align: "center",
          },
        },
        {
          element: "#pref-recent-activity",
          popover: {
            title: "Bitácora en Vivo 🕒",
            description:
              "Aquí aparecerán todas las acciones registradas por tu equipo en tiempo real.",
            side: "top",
            align: "center",
          },
        },
        {
          element: "#pref-daily-alerts",
          popover: {
            title: "Alertas Automáticas ⚠️",
            description:
              "El sistema te avisará si detecta patrones preocupantes (ej. alumnos con 3 retardos seguidos).",
            side: "left",
            align: "center",
          },
        },
      );
      break;

    case UserRole.SECRETARIA:
      steps.push(
        {
          element: "#nav-inscripciones",
          popover: {
            title: "Gestión de Matrícula 📝",
            description:
              "Aquí podrás dar de alta nuevos ingresos, gestionar bajas y cambios de turno.",
            side: "right",
            align: "center",
          },
        },
        {
          element: "#nav-reportes",
          popover: {
            title: "Listas Oficiales 📋",
            description:
              "Genera listas de asistencia, concentrados de calificaciones y estadística 911.",
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
          title: "⚡ Acción Principal: Registro Rápido",
          description:
            "La función más importante: reportar incidencias al momento. <br>Úsalo para registrar faltas, retardos, conductas o temas de salud.",
          side: "bottom",
          align: "center",
        },
      });
      break;
  }

  // 3. Cierre
  steps.push({
    popover: {
      title: "¡Estás listo! 🌟",
      description:
        "Ahora tienes el control. Explora SASE-310 y transforma tu gestión escolar.<br><br><i>Si necesitas ayuda, el asistente virtual siempre estará disponible.</i>",
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
