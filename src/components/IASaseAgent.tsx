import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../store";
import { SaseSplineOrb } from "./SaseSplineOrb";
import type { SystemState } from "../types/systemState";
import { UserRole, AppModule, CaseState } from "../types";
import { routeAI } from "./ai/aiRouter";
import { VoiceInput } from "./VoiceInput";
import toast from "react-hot-toast";

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
      case "alert": return "alert";
      case "warning": return "warning";
      default: return "normal";
    }
  }, [systemState]);

  // Texto descriptivo del estado para accesibilidad/clima
  const stateLabel = React.useMemo(() => {
    switch (systemState) {
      case "alert": return "CRÍTICO";
      case "warning": return "ALERTA";
      case "thinking": return "PROCESANDO";
      case "normal": return "NORMAL";
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
    "¿Consultamos la agenda institucional?",
    "¡Hola! Soy IA SASE, ¿en qué te ayudo?",
    "Análisis de grupo completado",
    "Sugerencia: Revisar citatorios de hoy",
    "¿Buscamos a algún alumno?"
  ];

  const [phraseCount, setPhraseCount] = React.useState(0);
  const [lastInteraction, setLastInteraction] = React.useState(Date.now());

  React.useEffect(() => {
    const interval = setInterval(() => {
      // Solo mostrar frase si:
      // 1. El asistente está cerrado
      // 2. Han pasado menos de 3 frases sin interacción
      if (!isAssistantOpen && phraseCount < 3) {
        const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
        setCurrentPhrase(randomPhrase);
        setShowPhrase(true);
        setPhraseCount(prev => prev + 1);
        setTimeout(() => setShowPhrase(false), 5000);
      }
    }, 60000); // Cada 60 segundos
    return () => clearInterval(interval);
  }, [isAssistantOpen, phraseCount]);

  // Resetear contador al interactuar
  React.useEffect(() => {
    if (isAssistantOpen) {
      setPhraseCount(0);
    }
  }, [isAssistantOpen]);

  // --- INTERACCIÓN IA (Q&A) ---
  const [userQuestion, setUserQuestion] = React.useState("");
  const [iaResponse, setIaResponse] = React.useState("");
  const [isThinking, setIsThinking] = React.useState(false);

  const handleAskIA = async (overrideQuestion?: string) => {
    const question = overrideQuestion || userQuestion;
    if (!question.trim()) return;

    setIsThinking(true);
    setIaResponse("");
    
    // Cambiar visualmente al estado 'thinking' vía systemState (o localmente si se prefiere)
    // Pero systemState viene del store, así que lo manejamos localmente para el visualizador
    const originalSystemState = systemState;
    
    try {
      const responseObj = await routeAI(question);
      const response = responseObj.text;
      setIaResponse(response);
      setUserQuestion("");
    } catch (err) {
      toast.error("Error en la conexión neuronal");
    } finally {
      setIsThinking(false);
    }
  };

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

              {/* Chat / IA Interaction Area */}
              <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-blue-400 text-sm">forum</span>
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">IA-SASE Neural Dialog</span>
                </div>
                
                {/* Answer Display */}
                <AnimatePresence>
                  {iaResponse && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="bg-blue-600/10 border border-blue-500/20 p-4 rounded-[1.5rem] mb-4 relative group"
                    >
                      <button 
                        onClick={() => setIaResponse('')}
                        className="absolute top-2 right-2 p-1 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Limpiar respuesta"
                      >
                        <span className="material-symbols-outlined text-[10px] text-blue-400">close</span>
                      </button>
                      <p className="text-[11px] text-blue-100 leading-relaxed font-medium italic">
                        {iaResponse}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative">
                  <input 
                    type="text"
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAskIA();
                    }}
                    placeholder={isThinking ? "Analizando..." : "Escribe o usa el micrófono..."}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-4 pr-20 text-[11px] text-white placeholder:text-white/20 outline-none focus:border-blue-500/50 transition-all focus:bg-white/[0.08]"
                    disabled={isThinking}
                  />
                  <div className="absolute right-1 top-1 flex items-center gap-1">
                    <VoiceInput 
                      onTranscript={(transcript) => {
                        setUserQuestion(transcript);
                        // Delay pequeño para que el usuario vea el texto antes de procesar
                        setTimeout(() => handleAskIA(transcript), 500);
                      }}
                      className="!bg-transparent !text-white/30 hover:!text-blue-400 hover:!bg-white/5"
                    />
                    <button 
                      onClick={() => handleAskIA()}
                      disabled={isThinking || !userQuestion.trim()}
                      className="size-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center hover:bg-blue-600/30 disabled:opacity-20 transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">
                        {isThinking ? "hourglass_top" : "send"}
                      </span>
                    </button>
                  </div>
                </div>
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

        {/* El Núcleo / Cara Neural 3D */}
        <SaseSplineOrb
          state={isThinking ? "thinking" : orbState}
          isInteracting={isAssistantOpen || isThinking}
          className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-[0_0_40px_rgba(59,130,246,0.3)] transition-all duration-700"
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
