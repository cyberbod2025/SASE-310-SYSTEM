import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useApp } from "../../store";
import { UserRole, AppModule } from "../../types";
import { VoiceInput } from "../VoiceInput";
import toast from "react-hot-toast";
import { SaseSplineOrb } from "../SaseSplineOrb";

interface AIOrbAssistantProps {
  initialPosition?: "floating" | "central";
  onActivate?: () => void;
  onDeactivate?: () => void;
  status?: "idle" | "listening" | "thinking";
  hideFloating?: boolean;
}

const AIOrbAssistant: React.FC<AIOrbAssistantProps> = ({
  onActivate,
  onDeactivate,
  status = "idle",
  hideFloating = false,
}) => {
  const {
    assistantMessage,
    currentUserRole,
    setCurrentModule,
    setQuickRegisterOpen,
    isAssistantOpen,
    setIsAssistantOpen,
    setIsFeedbackOpen,
    students,
    notifications,
    aiSystemState,
  } = useApp();

  const [chatInput, setChatInput] = useState("");
  const [idleMessage, setIdleMessage] = useState<string | null>(null);
  const [idleKind, setIdleKind] = useState<"aviso" | "tip">("tip");

  const idleTips = useMemo(
    () => [
      `Asistencia estimada hoy: ${
        students.length > 0
          ? Math.round(
              ((students.length - students.filter((s) => s.caseState !== "CERRADO").length) /
                students.length) *
                100,
            )
          : 0
      }%. ¿Quieres revisar incidencias?`,
      "Recuerda: lo que no se documenta, se olvida. ¿Registramos una incidencia?",
      "Puedo abrir reportes, agenda, protocolos y expedientes según tu rol.",
      "Si detectas un objeto no permitido, usa el módulo de Objetos Retenidos.",
      "Soy Sasito, tu copiloto institucional. ¿En qué te apoyo?",
      "Revisa alertas críticas con patrones de riesgo en Reportes.",
      "Pídeme acciones concretas: \"abrir agenda\", \"nueva incidencia\", \"ver bitácora\".",
      "No olvides cerrar tus reportes una vez se haya concluido el acompañamiento.",
      "La seguridad institucional empieza con el registro oportuno.",
      "¿Necesitas ayuda con los protocolos? Yo te guío paso a paso.",
    ],
    [students],
  );

  const idleNotices = useMemo(() => {
    const unread = notifications.filter((n: any) => !n.read);
    return unread.map((n: any) => ({
      kind: "aviso" as const,
      text: `Aviso: ${n.title}. ${n.message}`,
    }));
  }, [notifications]);

  useEffect(() => {
    if (isAssistantOpen) return;
    const options = idleNotices.length > 0
      ? idleNotices
      : idleTips.map((text) => ({ kind: "tip" as const, text }));

    if (options.length === 0) return;

    const initialIndex = Math.floor(Math.random() * options.length);
    setIdleMessage(options[initialIndex].text);
    setIdleKind(options[initialIndex].kind);

    const interval = setInterval(() => {
      const nextIndex = Math.floor(Math.random() * options.length);
      setIdleMessage(options[nextIndex].text);
      setIdleKind(options[nextIndex].kind);
    }, 12000);

    return () => clearInterval(interval);
  }, [isAssistantOpen, idleNotices, idleTips]);

  // Logic from AssistantBanner - Unified in AI Orb
  // Role-specific background activity simulation
  const getIAActivities = () => {
    switch (currentUserRole) {
      case UserRole.DOCENTE:
      case UserRole.DOCENTE_TUTOR:
        return [
          {
            icon: "analytics",
            label: "Analizando patrones de conducta en el grupo",
          },
          { icon: "schedule", label: "Optimización de agenda de evaluaciones" },
          {
            icon: "check_circle",
            label: "Sincronización de asistencias en tiempo real",
          },
        ];
      case UserRole.DIRECTIVO:
      case UserRole.SUBDIRECCION:
        return [
          {
            icon: "verified_user",
            label: "Auditoría de integridad RLS activa",
          },
          {
            icon: "query_stats",
            label: "Generando reportes KPI institucionales",
          },
          {
            icon: "security",
            label: "Monitoreo de protocolos de seguridad crítica",
          },
        ];
      case UserRole.SECRETARIA:
        return [
          {
            icon: "assignment_ind",
            label: "Validación de expedientes digitales",
          },
          { icon: "cloud_sync", label: "Sincronización de bases de datos SEP" },
        ];
      case UserRole.UDEII:
        return [
          { icon: "psychology", label: "Rastreo de Ajustes Razonables" },
          {
            icon: "diversity_1",
            label: "Análisis de barreras para el aprendizaje",
          },
        ];
      case UserRole.PREFECTURA:
        return [
          { icon: "fact_check", label: "Validación de asistencias por aula" },
          {
            icon: "security_update_good",
            label: "Vigilancia de zonas de riesgo activa",
          },
          { icon: "history", label: "Consolidando reportes de disciplina" },
        ];
      case UserRole.ORIENTACION:
      case UserRole.TRABAJO_SOCIAL:
        return [
          { icon: "psychology", label: "Evaluación de clima de convivencia" },
          {
            icon: "family_restroom",
            label: "Seguimiento de entornos familiares",
          },
          {
            icon: "volunteer_activism",
            label: "Detección de necesidades socioemocionales",
          },
        ];
      case UserRole.MEDICO_ESCOLAR:
        return [
          { icon: "medical_services", label: "Monitoreo de alertas de salud" },
          {
            icon: "inventory",
            label: "Control de insumos de primeros auxilios",
          },
        ];
      case UserRole.PROMOTORA_LECTURA:
        return [
          { icon: "menu_book", label: "Analizando indices de lectura" },
          { icon: "event_note", label: "Planeación de círculos de lectura" },
        ];
      case UserRole.DEVELOPER:
        return [
          {
            icon: "bug_report",
            label: "Escaneo de vulnerabilidades en código",
          },
          { icon: "speed", label: "Monitoreo de latencia de API" },
          { icon: "history", label: "Limpieza de historial Git (Seguridad)" },
        ];
      default:
        return [
          { icon: "monitoring", label: "Monitoreo de integridad del sistema" },
          {
            icon: "settings_suggest",
            label: "Optimizando experiencia de usuario",
          },
        ];
    }
  };

  const getPendingActions = () => {
    const actions: any[] = [];
    const patternAlerts = students.filter(
      (s: any) => s.incidents.length >= 3,
    ).length;

    if (patternAlerts > 0) {
      actions.push({
        id: "pattern-alert",
        title: `${patternAlerts} Alertas Críticas`,
        description: "Alumnos con patrón detectado",
        module: AppModule.REPORTES,
        priority: "urgent",
        icon: "priority_high",
      });
    }

    const unread = notifications.filter((n: any) => !n.read).length;
    if (unread > 0) {
      actions.push({
        id: "unread-notif",
        title: `${unread} Avisos`,
        description: "Notificaciones sin leer",
        module: AppModule.DASHBOARD,
        priority: "info",
        icon: "notifications",
      });
    }

    // Role-specific alerts
    if (currentUserRole === UserRole.SECRETARIA) {
      actions.push({
        id: "inscripciones",
        title: "Período Activo",
        description: "Documentación pendiente",
        module: AppModule.INSCRIPCIONES,
        priority: "info",
        icon: "app_registration",
      });
    } else if (currentUserRole === UserRole.DIRECTIVO) {
      actions.push({
        id: "aprobaciones",
        title: "Personal Pendiente",
        description: "Validación de nuevos registros",
        module: AppModule.APROBACIONES_PERSONAL,
        priority: "urgent",
        icon: "admin_panel_settings",
      });
    }

    return actions;
  };

  const pendingActions = getPendingActions();
  const iaActivities = getIAActivities();

  const orbVariants: Variants = {
    idle: {
      scale: [1, 1.05, 1],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    },
    listening: {
      scale: [1, 1.15, 0.95, 1.15, 1],
      transition: { duration: 0.6, repeat: Infinity, ease: "easeOut" },
    },
    thinking: {
      scale: [1, 1.05, 1],
      rotate: [0, 360],
      transition: {
        scale: { duration: 1, repeat: Infinity, ease: "easeInOut" },
        rotate: { duration: 3, repeat: Infinity, ease: "linear" },
      },
    },
  };

  const getRoleActions = () => {
    const baseActions = [];
    switch (currentUserRole) {
      case UserRole.DOCENTE:
      case UserRole.DOCENTE_TUTOR:
        baseActions.push(
          {
            icon: "ads_click",
            label: "Acción Rápida",
            action: () => setQuickRegisterOpen(true),
          },
          {
            icon: "calendar_month",
            label: "Mi Agenda",
            action: () => openModule(AppModule.AGENDA),
          },
        );
        break;
      case UserRole.PREFECTURA:
        baseActions.push(
          {
            icon: "fact_check",
            label: "Pase de Lista",
            action: () => setCurrentModule(AppModule.DASHBOARD),
          },
          {
            icon: "warning",
            label: "Reporte Disciplina",
            action: () => setQuickRegisterOpen(true),
          },
        );
        break;
      case UserRole.DIRECTIVO:
      case UserRole.SUBDIRECCION:
        baseActions.push(
          {
            icon: "analytics",
            label: "Indicadores",
            action: () => openModule(AppModule.REPORTES),
          },
          {
            icon: "history_edu",
            label: "Auditoría",
            action: () => openModule(AppModule.BITACORA),
          },
          {
            icon: "admin_panel_settings",
            label: "Control Personal",
            action: () => openModule(AppModule.APROBACIONES_PERSONAL),
          },
        );
        break;
      case UserRole.SECRETARIA:
        baseActions.push(
          {
            icon: "app_registration",
            label: "Inscripciones",
            action: () => setCurrentModule(AppModule.INSCRIPCIONES),
          },
          {
            icon: "folder_shared",
            label: "Expedientes",
            action: () => setCurrentModule(AppModule.REPORTES),
          },
        );
        break;
      case UserRole.TRABAJO_SOCIAL:
      case UserRole.ORIENTACION:
        baseActions.push(
          {
            icon: "psychology",
            label: "Seguimiento Caso",
            action: () => setCurrentModule(AppModule.REPORTES),
          },
          {
            icon: "home_health",
            label: "Visita Domicilio",
            action: () => setQuickRegisterOpen(true),
          },
        );
        break;
      case UserRole.MEDICO_ESCOLAR:
        baseActions.push(
          {
            icon: "medical_services",
            label: "Atención Médica",
            action: () => setQuickRegisterOpen(true),
          },
          {
            icon: "inventory",
            label: "Stock Médico",
            action: () => toast("Módulo de inventivo en desarrollo"),
          },
        );
        break;
      case UserRole.UDEII:
        baseActions.push(
          {
            icon: "inclusive",
            label: "Ajuste Razonable",
            action: () => setQuickRegisterOpen(true),
          },
          {
            icon: "diversity_3",
            label: "Alumnos BAP",
            action: () => setCurrentModule(AppModule.REPORTES),
          },
        );
        break;
      case UserRole.PROMOTORA_LECTURA:
        baseActions.push(
          {
            icon: "book",
            label: "Círculo Lectura",
            action: () => setCurrentModule(AppModule.AGENDA),
          },
          {
            icon: "auto_stories",
            label: "Bitácora Libros",
            action: () => setQuickRegisterOpen(true),
          },
        );
        break;
      case UserRole.DEVELOPER:
        baseActions.push(
          {
            icon: "terminal",
            label: "Consola Raiz",
            action: () => setCurrentModule(AppModule.DASHBOARD),
          },
          {
            icon: "database",
            label: "Explorador SQL",
            action: () => toast("Acceso a Supabase Dashboard"),
          },
        );
        break;
      default:
        baseActions.push({
          icon: "search",
          label: "Buscar Alumno",
          action: () => setCurrentModule(AppModule.REPORTES),
        });
    }
    return baseActions;
  };

  const handleOpen = () => {
    setIsAssistantOpen(true);
    onActivate?.();
  };

  const handleClose = () => {
    setIsAssistantOpen(false);
    onDeactivate?.();
  };

  const roleModules = useMemo(() => {
    const allModules = Object.values(AppModule) as AppModule[];
    return {
      [UserRole.DOCENTE]: [
        AppModule.DASHBOARD,
        AppModule.EXPEDIENTES,
        AppModule.AGENDA,
        AppModule.REPORTES,
        AppModule.PROTOCOLOS,
        AppModule.ARCHIVO,
        AppModule.MIS_GRUPOS,
      ],
      [UserRole.DOCENTE_TUTOR]: [
        AppModule.DASHBOARD,
        AppModule.EXPEDIENTES,
        AppModule.AGENDA,
        AppModule.REPORTES,
        AppModule.PROTOCOLOS,
        AppModule.ARCHIVO,
        AppModule.MIS_GRUPOS,
      ],
      [UserRole.PREFECTURA]: [
        AppModule.DASHBOARD,
        AppModule.ASISTENCIA,
        AppModule.PROTOCOLOS,
        AppModule.REPORTES,
        AppModule.AGENDA,
      ],
      [UserRole.ORIENTACION]: [
        AppModule.DASHBOARD,
        AppModule.EXPEDIENTES,
        AppModule.AGENDA,
        AppModule.REPORTES,
        AppModule.REPORTES_DOCENTES,
      ],
      [UserRole.TRABAJO_SOCIAL]: [
        AppModule.DASHBOARD,
        AppModule.TRABAJO_SOCIAL_TRACKER,
        AppModule.AGENDA,
        AppModule.REPORTES,
      ],
      [UserRole.MEDICO_ESCOLAR]: [
        AppModule.DASHBOARD,
        AppModule.SALUD,
        AppModule.REPORTES,
      ],
      [UserRole.SECRETARIA]: [
        AppModule.DASHBOARD,
        AppModule.INSCRIPCIONES,
        AppModule.EXPEDIENTES,
        AppModule.REPORTES,
      ],
      [UserRole.DIRECTIVO]: [
        AppModule.DASHBOARD,
        AppModule.REPORTES,
        AppModule.BITACORA,
        AppModule.APROBACIONES_PERSONAL,
        AppModule.PROTOCOLOS,
        AppModule.AGENDA,
      ],
      [UserRole.SUBDIRECCION]: [
        AppModule.DASHBOARD,
        AppModule.REPORTES,
        AppModule.BITACORA,
        AppModule.APROBACIONES_PERSONAL,
        AppModule.PROTOCOLOS,
        AppModule.AGENDA,
      ],
      [UserRole.UDEII]: [
        AppModule.DASHBOARD,
        AppModule.UDEII_TRACKER,
        AppModule.PROTOCOLOS,
        AppModule.REPORTES,
      ],
      [UserRole.PROMOTORA_LECTURA]: [
        AppModule.DASHBOARD,
        AppModule.LECTURA_TRACKER,
        AppModule.AGENDA,
        AppModule.REPORTES,
      ],
      [UserRole.DEVELOPER]: allModules,
      [UserRole.SYSTEM_ADMIN]: allModules,
      [UserRole.GUEST]: [AppModule.DASHBOARD],
    } as Record<UserRole, AppModule[]>;
  }, []);

  const canAccessModule = (module: AppModule) =>
    roleModules[currentUserRole]?.includes(module);

  const openModule = (module: AppModule) => {
    if (!canAccessModule(module)) {
      toast.error("No tienes permisos para esa accion");
      return false;
    }
    setCurrentModule(module);
    handleClose();
    return true;
  };

  const processInput = (text: string) => {
    if (!text.trim()) return;
    setChatInput("");
    const normalized = text.toLowerCase();
    toast.success(`Sasito analizando: ${text}`);

    if (
      normalized.includes("sugerencia") ||
      normalized.includes("comentario") ||
      normalized.includes("feedback")
    ) {
      setIsFeedbackOpen(true);
      return;
    }

    if (normalized.includes("manual") || normalized.includes("ayuda")) {
      window.open("/docs/SASE_Manual_Integral.html", "_blank");
      return;
    }

    if (
      normalized.includes("incidencia") ||
      normalized.includes("reporte rapido") ||
      normalized.includes("reporte rápido")
    ) {
      setQuickRegisterOpen(true);
      handleClose();
      return;
    }

    const moduleIntents: Array<{ keywords: string[]; module: AppModule }> = [
      { keywords: ["agenda", "calendario"], module: AppModule.AGENDA },
      { keywords: ["asistencia", "pase de lista"], module: AppModule.ASISTENCIA },
      { keywords: ["expediente", "expedientes"], module: AppModule.EXPEDIENTES },
      { keywords: ["reporte", "reportes"], module: AppModule.REPORTES },
      { keywords: ["bitacora", "bitácora", "auditoria", "auditoría"], module: AppModule.BITACORA },
      { keywords: ["protocolos", "protocolo"], module: AppModule.PROTOCOLOS },
      { keywords: ["inscripciones", "admisiones"], module: AppModule.INSCRIPCIONES },
      { keywords: ["aprobaciones", "personal"], module: AppModule.APROBACIONES_PERSONAL },
      { keywords: ["mis grupos", "grupos"], module: AppModule.MIS_GRUPOS },
      { keywords: ["planeacion", "planeacion nem"], module: AppModule.PLANEACION_NEM },
      { keywords: ["objetos retenidos"], module: AppModule.OBJETOS_RETENIDOS },
      { keywords: ["archivo"], module: AppModule.ARCHIVO },
      { keywords: ["salud", "clinica", "clínica"], module: AppModule.SALUD },
      { keywords: ["udeii", "inclusion", "inclusión"], module: AppModule.UDEII_TRACKER },
      { keywords: ["trabajo social", "ts"], module: AppModule.TRABAJO_SOCIAL_TRACKER },
      { keywords: ["lectura", "promotora"], module: AppModule.LECTURA_TRACKER },
      { keywords: ["tablero", "dashboard", "inicio"], module: AppModule.DASHBOARD },
    ];

    for (const intent of moduleIntents) {
      if (intent.keywords.some((keyword) => normalized.includes(keyword))) {
        openModule(intent.module);
        return;
      }
    }

    toast("Dime un modulo o accion especifica, y te ayudo a ejecutarla.");
  };

  return (
    <>
      {/* ── Botón de Sugerencias & Feedback — SIEMPRE VISIBLE en todas las pantallas ── */}
      {!isAssistantOpen && (
        <div className="fixed bottom-24 left-4 sm:left-8 z-[2000] scale-75 sm:scale-100 origin-bottom-left">
          <motion.button
            className="cursor-pointer group flex flex-col items-center gap-1.5 bg-transparent border-none appearance-none outline-none"
            initial={{ x: -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 120 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => setIsFeedbackOpen(true)}
            title="Sugerencias, comentarios y reporte de errores SASE"
            aria-label="Sugerencias y feedback del sistema"
          >
            {/* Cuerpo del botón */}
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(139,92,246,0.25)] border border-violet-500/30 bg-slate-900/60 backdrop-blur-2xl group-hover:shadow-[0_4px_36px_rgba(139,92,246,0.45)] transition-shadow duration-400">
              {/* Fondo de energía suave */}
              <motion.div
                className="absolute inset-0"
                animate={{ opacity: [0.08, 0.18, 0.08] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  background:
                    "radial-gradient(circle at 60% 40%, #8b5cf6, transparent 70%)",
                }}
              />
              {/* Ícono */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-icons text-violet-300 text-[22px] group-hover:scale-110 group-hover:text-violet-200 transition-all duration-300">
                  feedback
                </span>
              </div>
              <div className="absolute inset-0 border border-white/5 rounded-2xl" />
            </div>
            {/* Label SIEMPRE visible */}
            <div className="flex flex-col items-center">
              <span className="px-2.5 py-1 bg-slate-900/70 border border-violet-500/25 rounded-2xl text-[8px] font-black text-violet-300/90 uppercase tracking-widest backdrop-blur-xl">
                SUGERENCIAS
              </span>
            </div>
          </motion.button>
        </div>
      )}

      {/* ── Orbe Flotante IA SASE — SIEMPRE VISIBLE ── */}
      {!isAssistantOpen && (
        <div className="fixed bottom-8 right-8 z-[3000] scale-[0.65] sm:scale-75 origin-bottom-right">
          
          {/* Burbuja de Mensaje Aleatorio */}
          <AnimatePresence>
            {idleMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="absolute bottom-full right-0 mb-6 w-64 p-4 bg-slate-900/90 backdrop-blur-xl border border-blue-500/30 rounded-2xl shadow-2xl text-[11px] font-medium text-blue-100 leading-relaxed pointer-events-none"
              >
                <div className="absolute -bottom-2 right-8 w-4 h-4 bg-slate-900 border-r border-b border-blue-500/30 rotate-45" />
                {idleMessage}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            className="cursor-pointer group flex flex-col items-end bg-transparent border-none appearance-none outline-none"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpen}
            title="Activar Asistente de IA SASE"
            aria-label="Abrir núcleo operativo de IA"
          >
            <div className="relative w-24 h-24 rounded-full overflow-hidden shadow-[0_0_60px_rgba(59,130,246,0.5)] border border-blue-500/30 bg-[#05070a]">
              {/* Immersive Plasma Fluid */}
              <motion.div
                className="absolute inset-0 opacity-90 blur-xl"
                animate={{
                  rotate: [0, 180, 360],
                  scale: [1, 1.4, 0.8, 1.2, 1],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  background:
                    "radial-gradient(circle at 30% 30%, #3b82f6 0%, #00f2ff 40%, #8b5cf6 70%, #05070a 100%)",
                }}
              />
              {/* Center Content - Live Neural Face */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none rounded-full overflow-hidden">
                <SaseSplineOrb 
                  state={aiSystemState === 'alert' ? 'alert' : aiSystemState === 'warning' ? 'warning' : 'normal'} 
                  className="w-full h-full scale-[1.8]"
                />
              </div>
            </div>
            <div className="mt-2 flex flex-col items-end gap-0.5 px-3 py-1.5 bg-blue-600/10 border border-blue-500/20 rounded-xl backdrop-blur-md shadow-[0_0_15px_rgba(59,130,246,0.1)] group-hover:bg-blue-600/20 transition-colors">
              <span className="text-[7px] font-black text-blue-400 uppercase tracking-[0.3em]">
                IA ACTIVA
              </span>
              <span className="text-[9px] font-black text-white uppercase tracking-[0.2em] italic">
                NÚCLEO SASE
              </span>
            </div>
          </motion.button>
        </div>
      )}

      {/* Vista Expandida - Tactical Center */}
      <AnimatePresence>
        {isAssistantOpen && (
          <motion.div
            className="fixed inset-0 bg-[#05070a]/98 backdrop-blur-[50px] flex items-center justify-center z-[2100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          >
            <div
              className="flex flex-col lg:flex-row items-center justify-center gap-12 p-8 max-w-7xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Orbe Central Maestro — NÚCLEO SASE PREMIUM */}
              <div className="relative group">
                <SaseSplineOrb 
                  state={
                    status === 'thinking' || status === 'listening' 
                      ? 'thinking' 
                      : aiSystemState === 'alert' 
                        ? 'alert' 
                        : aiSystemState === 'warning' 
                          ? 'warning' 
                          : 'normal'
                  }
                  isInteracting={true}
                  className="w-80 h-80 drop-shadow-[0_0_100px_rgba(59,130,246,0.3)]"
                />

                {/* SASE Identity - MOVED BELOW ORB */}
                <div className="mt-8 flex flex-col items-center gap-2">
                  <motion.span
                    className="text-6xl font-black text-white tracking-[0.4em] drop-shadow-[0_0_40px_rgba(59,130,246,1)]"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    SASE
                  </motion.span>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.8em]">
                      NUCLEO v3.0
                    </span>
                    <div className="h-0.5 w-16 bg-blue-500/30 mt-2 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-blue-400"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Floating Orbitals */}
                {[0, 120, 240].map((rot) => (
                  <motion.div
                    key={rot}
                    className="absolute inset-0 pointer-events-none"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 15,
                      repeat: Infinity,
                      ease: "linear",
                      delay: rot / 10,
                    }}
                  >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 size-4 bg-blue-500/30 border border-blue-400 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)]"></div>
                  </motion.div>
                ))}
              </div>

              {/* Tactical Control Panel */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-full lg:w-1/2 space-y-6"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="size-1 w-24 bg-blue-500/30"></div>
                  <h2 className="title-sase text-blue-400 text-xs tracking-[0.5em] font-black uppercase">Centro_de_Comando_IA</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {getRoleActions().map((action, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.02, backgroundColor: "rgba(59, 130, 246, 0.15)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={action.action}
                      className="flex flex-col items-center justify-center p-6 rounded-3xl bg-white/5 border border-white/10 group transition-all"
                    >
                      <span className="material-icons text-3xl text-blue-400 mb-3 group-hover:scale-110 group-hover:text-cyan-400 transition-all">{action.icon}</span>
                      <span className="text-[10px] font-black text-white group-hover:text-cyan-100 uppercase tracking-widest text-center transition-colors">{action.label}</span>
                    </motion.button>
                  ))}
                </div>

                {/* Input Neural */}
                <div className="relative mt-8 group">
                   <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-1000"></div>
                   <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && processInput(chatInput)}
                    placeholder="Escribe una instrucción al Núcleo SASE..."
                    className="relative w-full bg-black/60 border border-white/20 rounded-2xl px-6 py-5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500/50 backdrop-blur-xl"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                     <VoiceInput onTranscript={processInput} />
                  </div>
                </div>

                {/* Activities log */}
                <div className="mt-8 pt-8 border-t border-white/10">
                   <div className="space-y-3">
                      {iaActivities.map((act, i) => (
                        <div key={i} className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
                           <span className="material-icons text-xs text-blue-400 animate-pulse">{act.icon}</span>
                           <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">{act.label}</span>
                        </div>
                      ))}
                   </div>
                </div>
              </motion.div>
            </div>

            {/* Close Button UI */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleClose}
              className="absolute top-10 right-10 size-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"
            >
              <span className="material-icons">close</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIOrbAssistant;
