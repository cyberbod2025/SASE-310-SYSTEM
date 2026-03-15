import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../store";
import { SaseSplineOrb } from "./SaseSplineOrb";
import type { SystemState } from "../types/systemState";
import { UserRole, AppModule, CaseState } from "../types";
import { calcularEstadoSistema, OrbState } from "../utils/estadoSistema";

/**
 * IA-SASE Agent Component
 * Permanent visual assistant with dynamic institutional traffic light (semáforo).
 * Located: Fixed bottom-right.
 */
export const IASaseAgent: React.FC = () => {
  const {
    isAssistantOpen,
    setIsAssistantOpen,
    systemState,
    setCurrentModule,
    openQuickRegister,
  } = useApp();

  // Mapeo entre el semáforo institucional (OrbState) y el visualizador de núcleo (SystemState)
  const orbState = React.useMemo((): SystemState => {
    switch (systemState) {
      case "thinking": return "thinking";
      case "red": return "alert";
      case "yellow": return "warning";
      default: return "normal";
    }
  }, [systemState]);

  // Texto descriptivo del estado para accesibilidad/clima
  const stateLabel = React.useMemo(() => {
    switch (systemState) {
      case "red": return "CRÍTICO";
      case "yellow": return "ALERTA";
      case "thinking": return "PROCESANDO";
      case "gold": return "NORMAL";
      default: return "ESTABLE";
    }
  }, [systemState]);

  // Frases periódicas para la IA
  const [currentPhrase, setCurrentPhrase] = React.useState("");
  const [showPhrase, setShowPhrase] = React.useState(false);

  const phrases = [
    "¿Qué necesitas hoy?",
    "¿Te ayudo a hacer un reporte?",
    "¿Necesitas consultar algo?",
    "¿Quieres agendar algo?",
    "¡Hola! Soy IA SASE, ¿en qué te ayudo?",
    "Análisis de grupo completado",
    "Sugerencia: Revisar citatorios de hoy",
    "¿Buscamos a algún alumno?"
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      setCurrentPhrase(randomPhrase);
      setShowPhrase(true);
      setTimeout(() => setShowPhrase(false), 5000);
    }, 15000); // Cada 15 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-[20px] right-[20px] z-[5000] flex flex-col items-end">
      {/* Panel de Acciones Rápidas */}
      <AnimatePresence>
        {isAssistantOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 20, scale: 0.9, filter: "blur(10px)" }}
            className="mb-4 w-[320px] bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-white font-black text-xs uppercase tracking-[0.3em]">
                    IA-SASE
                  </h3>
                  <p className="text-blue-400 text-[8px] font-black uppercase tracking-[0.2em] mt-1">
                    Núcleo de Inteligencia Institucional
                  </p>
                </div>
                <button 
                  onClick={() => setIsAssistantOpen(false)}
                  className="size-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              <div className="space-y-3">
                <ActionButton
                  icon="add_circle"
                  label="Registrar Incidencia"
                  description="Apertura de Registro Rápido"
                  onClick={() => {
                    openQuickRegister();
                    setIsAssistantOpen(false);
                  }}
                />
                <ActionButton
                  icon="person_search"
                  label="Gestión de Alumnos"
                  description="Expedientes y Trayectorias"
                  onClick={() => {
                    setCurrentModule(AppModule.REPORTES);
                    setIsAssistantOpen(false);
                  }}
                />
                <ActionButton
                  icon="calendar_month"
                  label="Agenda Escolar"
                  description="Citas y Eventos Pendientes"
                  onClick={() => {
                    setCurrentModule(AppModule.AGENDA);
                    setIsAssistantOpen(false);
                  }}
                />
                <ActionButton
                  icon="emergency"
                  label="Protocolos SASE"
                  description="Guía de Actuación Inmediata"
                  onClick={() => {
                    setCurrentModule(AppModule.DASHBOARD);
                    setIsAssistantOpen(false);
                  }}
                />
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 text-center">
                <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest italic">
                  "Inteligencia Artificial aplicada a la Seguridad Escolar"
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bubble de Frases Periódicas */}
      <AnimatePresence>
        {showPhrase && !isAssistantOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.8 }}
            className="absolute -top-16 right-0 bg-blue-600 text-white px-4 py-2 rounded-2xl rounded-tr-none shadow-xl border border-blue-400/30 whitespace-nowrap z-[5001]"
          >
            <p className="text-[10px] font-black uppercase tracking-tight">{currentPhrase}</p>
            {/* Arrow */}
            <div className="absolute -bottom-1 right-0 size-3 bg-blue-600 rotate-45 transform origin-top-left" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger: IA-SASE Orb */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsAssistantOpen(!isAssistantOpen)}
        className="relative cursor-pointer group"
      >
        {/* State Badge */}
        <AnimatePresence>
          {!isAssistantOpen && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute -left-20 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-md pointer-events-none hidden sm:block"
            >
              <span className="text-[8px] font-black text-white uppercase tracking-widest opacity-60">
                {stateLabel}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <SaseSplineOrb
          state={orbState}
          className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-[0_0_30px_rgba(59,130,246,0.3)] shadow-blue-500/20"
        />

        {/* Pulsing Ring for critical states */}
        {(systemState === "red" || systemState === "yellow") && (
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`absolute inset-0 rounded-full border-2 ${
              systemState === "red" ? "border-red-500" : "border-yellow-500"
            } pointer-events-none`}
          />
        )}
      </motion.div>
    </div>
  );
};

const ActionButton: React.FC<{
  icon: string;
  label: string;
  description: string;
  onClick: () => void;
}> = ({ icon, label, description, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-4 p-4 bg-white/[0.03] hover:bg-white/[0.08] hover:border-blue-500/30 border border-white/5 rounded-2xl transition-all group text-left"
  >
    <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform shadow-inner">
      <span className="material-symbols-outlined text-xl">{icon}</span>
    </div>
    <div className="flex-1 min-w-0">
      <span className="block text-[10px] font-black text-white uppercase tracking-tight">
        {label}
      </span>
      <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest truncate mt-0.5">
        {description}
      </span>
    </div>
    <span className="material-symbols-outlined text-slate-700 group-hover:text-blue-400 text-sm">
      arrow_forward_ios
    </span>
  </button>
);
