import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../store";
import { SasitoCopilot } from "./SasitoCopilot";
import type { SystemState } from "../types/systemState";
import { UserRole, AppModule, CaseState } from "../types";

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

  // El orbe ya recibe el SystemState directamente desde el store
  const orbState = systemState;

  // Texto descriptivo del estado para accesibilidad/clima
  const stateLabel = React.useMemo(() => {
    switch (systemState) {
      case "alert": return "CRÍTICO";
      case "warning": return "ALERTA";
      case "thinking": return "PROCESANDO";
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
      {/* Panel de Acciones Rápidas (El 'Pensamiento' de la IA) */}
      <AnimatePresence>
        {isAssistantOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 20, scale: 0.9, filter: "blur(10px)" }}
            className="mb-4 w-[320px] bg-slate-950/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden relative"
          >
            {/* Background Glow dinámico según el estado */}
            <div 
              className="absolute top-0 right-0 w-32 h-32 blur-[60px] pointer-events-none transition-colors duration-1000"
              style={{ backgroundColor: `${orbState === 'alert' ? '#ef4444' : orbState === 'warning' ? '#f59e0b' : '#3b82f6'}33` }}
            ></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-white font-black text-[10px] uppercase tracking-[0.4em]">
                    Sase_Neural_Interface
                  </h3>
                  <p className="text-blue-400 text-[8px] font-black uppercase tracking-[0.2em] mt-1 opacity-70">
                    Estableciendo conexión biométrica...
                  </p>
                </div>
                <button 
                  onClick={() => setIsAssistantOpen(false)}
                  className="size-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all hover:rotate-90"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              <div className="space-y-3">
                <ActionButton
                  icon="add_circle"
                  label="Registrar Incidencia"
                  description="Registro inmediato de evento"
                  onClick={() => {
                    openQuickRegister();
                    setIsAssistantOpen(false);
                  }}
                />
                <ActionButton
                  icon="person_search"
                  label="Expediente Digital"
                  description="Análisis de trayectoria"
                  onClick={() => {
                    setCurrentModule(AppModule.REPORTES);
                    setIsAssistantOpen(false);
                  }}
                />
                <ActionButton
                  icon="monitoring"
                  label="Radar Escolar"
                  description="Detección de patrones de riesgo"
                  onClick={() => {
                    setCurrentModule(AppModule.DASHBOARD);
                    setIsAssistantOpen(false);
                  }}
                />
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-2">
                <span className="size-1 bg-blue-500 rounded-full animate-ping"></span>
                <p className="text-[7px] font-black text-slate-500 uppercase tracking-[0.3em]">
                  IA_SASE_NUCLEUS_ACTIVE
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bubble de Frases (La Voz de la Cara) */}
      <AnimatePresence>
        {showPhrase && !isAssistantOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.8 }}
            className="absolute -top-16 right-0 bg-white/5 backdrop-blur-xl text-white px-5 py-2.5 rounded-3xl rounded-tr-none shadow-2xl border border-white/10 whitespace-nowrap z-[5001]"
          >
            <p className="text-[10px] font-black uppercase tracking-tight flex items-center gap-2">
              {currentPhrase}
            </p>
            {/* Arrow */}
            <div className="absolute -bottom-1.5 right-0 border-l-[10px] border-l-transparent border-t-[10px] border-t-white/10" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger: La Cara de IA-SASE (Habitante Neural) */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setIsAssistantOpen(!isAssistantOpen);
          setShowPhrase(false);
        }}
        className="relative cursor-pointer group select-none"
      >
        {/* Etiqueta de Identidad */}
        <AnimatePresence>
          {!isAssistantOpen && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute -left-24 top-1/2 -translate-y-1/2 px-3 py-1 bg-black/40 backdrop-blur-lg border border-white/5 rounded-full pointer-events-none hidden sm:block"
            >
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-black text-white/80 uppercase tracking-[0.2em]">
                  {stateLabel}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* El Núcleo / Cara Neural 3D (New Sasito Copilot) */}
        <SasitoCopilot
          systemState={orbState}
          isWidgetMode={true}
          className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-[0_0_40px_rgba(59,130,246,0.3)]"
        />

        {/* HALO DE REACCIÓN (Cuando se toca la cara) */}
        <AnimatePresence>
          {isAssistantOpen && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 border-2 border-blue-500 rounded-full pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Alerta Visual para Estados Críticos */}
        {(systemState === "alert" || systemState === "warning") && (
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`absolute inset-0 rounded-full border-2 ${
              systemState === "alert" ? "border-red-500" : "border-yellow-500"
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
