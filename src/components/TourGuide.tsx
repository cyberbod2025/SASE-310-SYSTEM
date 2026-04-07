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
  const steps: any[] = [
    {
      // Pantalla de Bienvenida (Sin elemento = Modal Centrado)
      popover: {
        title: `NÚCLEO SASE-310: Hola, ${userName} 👋`,
        description:
          "<div style='margin-bottom: 20px; display: flex; justify-content: center;'>" +
          "  <div class='sase-tour-welcome-orb'></div>" +
          "</div>" +
          "Soy <b>Sasito</b>, tu Copiloto IA. Mi núcleo de procesamiento está listo para optimizar tu gestión escolar.<br><br>" +
          "He calibrado tu entorno de trabajo según tu rango. Permíteme guiarte por los protocolos clave para asegurar una operación institucional impecable.",
        side: "center",
        align: "center",
      },
    },
    {
      element: "#sidebar-logo",
      popover: withSasito("Identidad & Rango Institucional 🛡️", 
        `Protocolos de seguridad verificados para: <b>${role}</b>. ` +
        "He desplegado automáticamente las facultades, accesos y herramientas que corresponden a tu rango en la estructura educativa."
      ),
    },
    {
      element: "#sidebar-nav",
      popover: withSasito("Consola de Navegación 🧭", 
        "Aquí residen los módulos de inteligencia: Expedientes, Agendas y Metadatos. Todo está interconectado para que la información fluya sin fricciones."
      ),
    },
    {
      element: "#sidebar-feedback",
      popover: withSasito("Sincronización de Mejoras 🗣️", 
        "Mi red neuronal aprende de tu experiencia. Si detectas una anomalía o tienes una sugerencia de mejora, este es el portal directo hacia mis desarrolladores."
      ),
    },
  ];

  // 2. Pasos Contextuales por Rol (Dashboard Específico)
  switch (role) {
    case UserRole.DIRECTIVO:
      steps.push(
        {
          element: "#dashboard-header",
          popover: withSasito("Centro de Comando Institucional 🏛️", 
            "Esta es tu vista satelital. Desde aquí supervisas el pulso vital de la escuela con datos procesados en tiempo real."
          ),
        },
        {
          element: "#kpi-assist",
          popover: withSasito("Métricas de Presencia 📈", 
            "Monitoreo constante de asistencia. La IA detecta automáticamente desviaciones que podrían indicar riesgos de deserción."
          ),
        },
        {
          element: "#kpi-risk",
          popover: withSasito("Radar de Riesgo Crítico 🚨", 
            "<b>Prioridad Máxima.</b> Estas son las alertas rojas que requieren tu intervención directa o delegación inmediata a protocolos de seguimiento."
          ),
        },
        {
          element: "#panel-risk-groups",
          popover: withSasito("Focalización Estratégica 🎯", 
            "He identificado los grupos con mayores índices de conflicto. Dirige los recursos de Orientación y Prefectura hacia estos nodos críticos."
          ),
        },
        {
          element: "#export-btn",
          popover: withSasito("Inteligencia Documental 🖨️", 
            "Transformo los datos en reportes ejecutivos listos para imprimir. Eficacia administrativa para tus juntas de consejo."
          ),
        },
      );
      break;

    case UserRole.PREFECTURA:
      steps.push(
        {
          element: "#pref-header",
          popover: withSasito("Unidad de Control Operativo", 
            "Bienvenido, Prefecto. Tu consola está configurada para el monitoreo táctico de la convivencia diaria."
          ),
        },
        {
          element: "#pref-quick-register",
          popover: withSasito("Ingreso de Datos Táctico ⚡", 
            "Registra anomalías (retardos, uniforme, conducta) en menos de 5 segundos. Mi sistema se encarga del resto del papeleo legal."
          ),
        },
        {
          element: "#pref-kpi-grid",
          popover: withSasito("Análisis del Flujo Escolar 📊", 
            "Métricas vivas sobre retardos y cumplimiento normativo. Si los números suben, es hora de un patrullaje intensivo."
          ),
        },
        {
          element: "#pref-recent-activity",
          popover: withSasito("Historial de Eventos 🕒", 
            "Seguimiento segundo a segundo de todas las incidencias en el plantel. Nada escapa al registro institucional."
          ),
        },
        {
          element: "#pref-daily-alerts",
          popover: withSasito("Detección de Patrones ⚠️", 
            "Mis algoritmos te alertarán sobre alumnos recurrentes automáticamente. Actúa antes de que la falta se vuelva hábito."
          ),
        },
      );
      break;

    case UserRole.SECRETARIA:
      steps.push(
        {
          element: "#nav-expedientes",
          popover: withSasito("Célula Administrativa 📝", 
            "Gestión de expedientes e integridad de la base de datos de los alumnos. Actualizaciones de estatus en un entorno confiable."
          ),
        },
        {
          element: "#nav-agenda",
          popover: withSasito("Coordinación de Citas y Eventos 📅", 
            "Módulo central de agendamiento. Lleva el control de citas de área, reuniones de directivos y eventos institucionales con eficiencia."
          ),
        },
      );
      break;

    default:
      // Para roles operativos (Docente, Prefecto, etc.) que usan el Registro Rápido
      steps.push({
        element: "#quick-register-btn",
        popover: withSasito("⚡ Protocolo de Registro Rápido", 
          "Esta es la herramienta más poderosa: <b>Reporta en solo 3 clics</b>. <br>Yo proceso la narrativa, notifico a tus superiores y genero el acta oficial. Tú solo enfócate en educar."
        ),
      });
      break;
  }

  // 3. Feedback Global y Cierre
  steps.push({
    element: "#sidebar-feedback",
    popover: withSasito("Voz Activa del Usuario 🗣️", 
      "Utiliza este panel en cualquier momento para enviar tus <b>comentarios, sugerencias o reportar errores</b> directamente al equipo de Ingeniería."
    ),
  });

  steps.push({
    popover: withSasito("Protocolo de Inducción Finalizado 🌟", 
      "Has sido sincronizado satisfactoriamente con el núcleo SASE-310. Ahora tienes el control total de tu sector.<br><br>Recuerda que estaré siempre disponible para asistirte en tiempo real.<br><br><i>Tu éxito es la paz de nuestra escuela. ¡Adelante!</i>"
    ),
  });


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
