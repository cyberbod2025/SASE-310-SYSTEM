import React, { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useApp } from "../../store";
import { UserRole, AppModule } from "../../types";
import { VoiceInput } from "../VoiceInput";
import toast from "react-hot-toast";

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
  } = useApp();

  const [chatInput, setChatInput] = useState("");

  // Logic from AssistantBanner - Unified in AI Orb
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

    if (currentUserRole === UserRole.SECRETARIA) {
      actions.push({
        id: "inscripciones",
        title: "Período Activo",
        description: "Documentación pendiente",
        module: AppModule.INSCRIPCIONES,
        priority: "info",
        icon: "app_registration",
      });
    }

    return actions;
  };

  const pendingActions = getPendingActions();

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
        baseActions.push(
          {
            icon: "add",
            label: "Nueva Incidencia",
            action: () => setQuickRegisterOpen(true),
          },
          {
            icon: "calendar_month",
            label: "Mi Agenda",
            action: () => setCurrentModule(AppModule.AGENDA),
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
        baseActions.push(
          {
            icon: "analytics",
            label: "Indicadores",
            action: () => setCurrentModule(AppModule.REPORTES),
          },
          {
            icon: "history_edu",
            label: "Auditoría",
            action: () => setCurrentModule(AppModule.BITACORA),
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

  const processInput = (text: string) => {
    if (!text.trim()) return;
    setChatInput("");
    toast.success("SASE analizando: " + text);
    setTimeout(() => {
      if (text.toLowerCase().includes("agenda")) {
        setCurrentModule(AppModule.AGENDA);
        handleClose();
      } else if (text.toLowerCase().includes("reporte")) {
        setQuickRegisterOpen(true);
        handleClose();
      }
    }, 1000);
  };

  return (
    <>
      {/* ── Botón de Sugerencias & Feedback — SIEMPRE VISIBLE en todas las pantallas ── */}
      {!isAssistantOpen && (
        <div className="fixed bottom-24 left-8 z-[2000]">
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
                <span className="material-symbols-outlined text-violet-300 text-[22px] group-hover:scale-110 group-hover:text-violet-200 transition-all duration-300">
                  feedback
                </span>
              </div>
              <div className="absolute inset-0 border border-white/5 rounded-2xl" />
            </div>
            {/* Label SIEMPRE visible */}
            <div className="flex flex-col items-center">
              <span className="px-2.5 py-1 bg-slate-900/70 border border-violet-500/25 rounded-lg text-[8px] font-black text-violet-300/90 uppercase tracking-widest backdrop-blur-xl">
                FEEDBACK
              </span>
            </div>
          </motion.button>
        </div>
      )}

      {/* ── Orbe Flotante IA SASE — se oculta solo en OrbNavigation (ya está en el centro) ── */}
      {!isAssistantOpen && !hideFloating && (
        <div className="fixed bottom-8 right-8 z-[2000]">
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
            <div className="relative w-28 h-28 rounded-full overflow-hidden shadow-[0_0_80px_rgba(59,130,246,0.5)] border border-blue-500/30 bg-[#05070a]">
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
              {/* Glass reflections */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20" />
              {/* Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <span className="text-[14px] font-black text-white tracking-[0.4em] drop-shadow-[0_0_20px_rgba(59,130,246,1)]">
                    SASE
                  </span>
                </motion.div>
                <span className="text-[7px] font-black text-cyan-400 uppercase tracking-widest mt-1 opacity-70">
                  CORE IA
                </span>
              </div>
              {/* Neural Pulse */}
              <motion.div
                className="absolute inset-2 border-t-2 border-blue-400/20 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
              {/* Internal Scanline */}
              <div className="absolute inset-0 opacity-10 overflow-hidden">
                <div className="w-full h-1 bg-white animate-scan" />
              </div>
            </div>
            <div className="mt-3 flex flex-col items-end gap-1 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-xl backdrop-blur-md shadow-[0_0_20px_rgba(59,130,246,0.1)]">
              <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em]">
                STATUS: ACTIVE
              </span>
              <span className="text-[11px] font-black text-white uppercase tracking-[0.2em] italic">
                SASE IA NUCLEUS
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
              {/* Orbe Central Maestro */}
              <div className="relative group">
                <motion.div
                  className="relative w-80 h-80 rounded-full shadow-[0_0_150px_rgba(59,130,246,0.4)] border border-white/10 overflow-hidden"
                  animate={status}
                  variants={orbVariants}
                >
                  <div className="absolute inset-0 bg-[#020406]"></div>

                  {/* Neural Web Effect (Simulated with rotating gradients) */}
                  <motion.div
                    className="absolute inset-[-50%] opacity-40 blur-[80px]"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 25,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{
                      background:
                        "conic-gradient(from 0deg, #3b82f6, #00f2ff, #8b5cf6, #3b82f6)",
                    }}
                  />

                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <motion.span
                      className="text-6xl font-black text-white tracking-[0.5em] ml-6 drop-shadow-[0_0_40px_rgba(59,130,246,1)]"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      SASE
                    </motion.span>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.8em] ml-4">
                        NUCLEUS v3.0
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
                </motion.div>

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
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full max-w-md bg-white/[0.03] border border-white/10 rounded-[40px] p-8 backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative overflow-hidden"
              >
                {/* Decorative scanning line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent animate-scan text-[0px]">
                  .
                </div>

                <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <span className="material-symbols-outlined text-2xl">
                        terminal
                      </span>
                    </div>
                    <div>
                      <h4 className="text-white font-black text-sm uppercase tracking-[0.2em]">
                        Panel Táctico
                      </h4>
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                        Operador: {currentUserRole}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="size-10 rounded-xl bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 transition-all flex items-center justify-center border border-white/10 group"
                    title="Cerrar panel táctico"
                    aria-label="Cerrar asistente"
                  >
                    <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">
                      close
                    </span>
                  </button>
                </div>

                {/* PENDING TASKS / ALERTS SECTION (Replaces Helper Banner) */}
                {pendingActions.length > 0 && (
                  <div className="mb-8 animate-fade-in">
                    <h5 className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4 flex items-center gap-2 italic">
                      <span className="size-1.5 bg-amber-500 rounded-full animate-ping"></span>
                      Acciones Pendientes Reconocidas
                    </h5>
                    <div className="space-y-3">
                      {pendingActions.map((action) => (
                        <button
                          key={action.id}
                          onClick={() => {
                            setCurrentModule(action.module);
                            handleClose();
                          }}
                          title={`Ir a: ${action.title}`}
                          aria-label={`${action.title}: ${action.description}`}
                          className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group ${
                            action.priority === "urgent"
                              ? "bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20"
                              : "bg-white/5 border-white/5 hover:bg-white/10"
                          }`}
                        >
                          <div
                            className={`p-2 rounded-xl border ${
                              action.priority === "urgent"
                                ? "bg-rose-500/20 border-rose-500/40 text-rose-400"
                                : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                            }`}
                          >
                            <span className="material-symbols-outlined text-sm">
                              {action.icon}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-black text-white uppercase tracking-tight">
                              {action.title}
                            </p>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest truncate">
                              {action.description}
                            </p>
                          </div>
                          <span className="material-symbols-outlined text-slate-600 group-hover:text-white transition-colors">
                            arrow_right_alt
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ROLE QUICK ACTIONS */}
                <div className="mb-8">
                  <h5 className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4 italic">
                    Comandos de Módulo
                  </h5>
                  <div className="grid grid-cols-2 gap-3">
                    {getRoleActions().map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          action.action();
                          handleClose();
                        }}
                        title={`Ejecutar: ${action.label}`}
                        aria-label={`Acción rápida: ${action.label}`}
                        className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-blue-600/10 hover:border-blue-500/30 transition-all group active:scale-95"
                      >
                        <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-blue-500/20 text-blue-400 group-hover:text-blue-300 transition-all">
                          <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">
                            {action.icon}
                          </span>
                        </div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center group-hover:text-white">
                          {action.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* COMMAND INPUT */}
                <div className="relative group/input">
                  <div className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-focus-within/input:opacity-100 transition-opacity"></div>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Escribe un comando o petición..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 px-6 text-xs text-white outline-none focus:border-blue-500/40 focus:bg-black/60 transition-all font-black uppercase tracking-widest placeholder:text-slate-700 placeholder:italic"
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      processInput((e.target as HTMLInputElement).value)
                    }
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <VoiceInput onTranscript={processInput} />
                  </div>
                </div>

                <p className="mt-8 text-center text-[8px] font-black text-slate-700 uppercase tracking-[0.5em] italic">
                  SASE CORE UI • v3.1.0 • ENCRYPTED_CONNECTION
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIOrbAssistant;
