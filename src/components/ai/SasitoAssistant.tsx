import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, X, MessageSquare, Info, AlertTriangle, Zap } from 'lucide-react';
import { useApp } from "../../store";
import { UserRole, AppModule } from "../../types";
import { SaseSplineOrb } from "../SaseSplineOrb";
import toast from "react-hot-toast";

export type SasitoState = 'calm' | 'attention' | 'alert' | 'processing' | 'rebooting';

interface Suggestion {
  text: string;
  state: SasitoState | null;
  actionLabel?: string;
  infoLabel?: string;
  actionType?: string;
}

interface SasitoProps {
  minimal?: boolean; // If true, no chat, no mic, no suggestions (for Login)
  isWidgetMode?: boolean;
}

/**
 * SasitoAssistant: Copiloto Institucional Único
 * Actúa como Wrapper de Lógica y UI de Chat, delegando el render visual a SaseSplineOrb.
 */
export const SasitoAssistant: React.FC<SasitoProps> = ({ minimal = false, isWidgetMode = false }) => {
  const {
    currentUserRole,
    setCurrentModule,
    setQuickRegisterOpen,
    setIsAssistantOpen,
    aiSystemState,
    students,
    notifications,
    currentUserProfile,
    isTourActive,
    setIsTourActive,
    tourStep,
    setTourStep,
    assistantSuggestion,
    setAssistantSuggestion,
  } = useApp();

  const [localState, setLocalState] = useState<SasitoState>('calm');
  const [currentSuggestion, setCurrentSuggestion] = useState<Suggestion | null>(null);
  const [isBubbleExpanded, setIsBubbleExpanded] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  const constraintsRef = useRef(null);

  // -- ONBOARDING LOGIC --
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('sase_onboarding_v2_completed');
    if (!hasSeenWelcome && !minimal) {
      setTimeout(() => {
        setLocalState('attention');
        setCurrentSuggestion({
          text: `¡Hola ${currentUserProfile?.full_name?.split(' ')[0] || ''}! Soy Sasito, tu Copiloto IA. Veo que es tu primera vez aquí. ¿Te gustaría que te dé un tour rápido por el núcleo SASE-310?`,
          state: 'attention',
          actionLabel: "SÍ, DAME EL TOUR ➔",
          actionType: "start-tour"
        });
      }, 3000);
    }
  }, [currentUserProfile, minimal]);

  // Sync visuals with Tour Steps
  useEffect(() => {
    if (!isTourActive) return;
    
    // tourStep starts at 0
    if (tourStep === 6) { // Radar de Riesgo Crítico
      setLocalState('alert');
    } else if (tourStep === 5 || tourStep === 7) { // Métricas o Focalización
      setLocalState('attention');
    } else if (tourStep === 10) { // Finalizada
      setLocalState('calm');
    } else {
      setLocalState('calm');
    }
  }, [isTourActive, tourStep]);

  // Sync with global suggestions (Proactive Help)
  useEffect(() => {
    if (assistantSuggestion) {
      setCurrentSuggestion(assistantSuggestion as Suggestion);
      if (assistantSuggestion.state) setLocalState(assistantSuggestion.state as SasitoState);
      const timer = setTimeout(() => {
        setCurrentSuggestion(null);
        setAssistantSuggestion(null);
      }, 12000);
      return () => clearTimeout(timer);
    }
  }, [assistantSuggestion, setAssistantSuggestion]);

  // Sync with global system state
  useEffect(() => {
    if (aiSystemState === 'alert') setLocalState('alert');
    else if (aiSystemState === 'warning') setLocalState('attention');
    else if (localState === 'processing') return;
    else setLocalState('calm');
  }, [aiSystemState]);

  const saseSuggestions = useMemo(() => {
    const suggestions: Suggestion[] = [
      { text: "¡Hola! Soy Sasito, tu copiloto en SASE 310. ¿Cómo te apoyo hoy?", state: 'calm' },
    ];

    if (currentUserRole === UserRole.PREFECTURA) {
      suggestions.push({ text: "¿Revisamos los alumnos que no han entrado a clase?", state: 'attention', actionLabel: "Ver Asistencias", actionType: "module-asistencia" });
    }

    const unread = notifications.filter(n => !n.read).length;
    if (unread > 0) {
      suggestions.push({ text: `Tienes ${unread} notificaciones pendientes por leer.`, state: 'attention', actionLabel: "Ver Avisos", actionType: "module-dashboard" });
    }

    const highRisk = students.filter(s => s.caseState === 'INTERVENCION').length;
    if (highRisk > 0) {
      suggestions.push({ text: `Hay ${highRisk} alumnos en estado de INTERVENCIÓN crítica.`, state: 'alert', actionLabel: "Ver Alertas", actionType: "module-reportes" });
    }

    return suggestions;
  }, [currentUserRole, notifications, students]);

  useEffect(() => {
    if (minimal) return;
    const interval = setInterval(() => {
      if (Math.random() > 0.6 && !isBubbleExpanded && !isChatOpen) {
        const suggestion = saseSuggestions[Math.floor(Math.random() * saseSuggestions.length)];
        setCurrentSuggestion(suggestion);
        if (suggestion.state) setLocalState(suggestion.state);
        setTimeout(() => setCurrentSuggestion(null), 6000);
      }
    }, 12000);
    return () => clearInterval(interval);
  }, [minimal, isBubbleExpanded, isChatOpen, saseSuggestions]);

  const INTENT_RULES = [
    {
      intent: "Generar Documentos Legales",
      keywords: ["acta de hechos", "hoja de acuerdos", "minuta", "imprimir", "documento", "citatorio"],
      allowedRoles: [UserRole.TRABAJO_SOCIAL, UserRole.DIRECTIVO, UserRole.SUBDIRECCION, UserRole.PREFECTURA, UserRole.ORIENTACION],
      moduleTarget: AppModule.DOCUMENTACION, 
      successText: "Abriendo el Sistema de Documentación Institucional para elaborar el oficio.",
      deniedText: "Protocolo denegado: Solo Trabajo Social, Prefectura, Orientación o Dirección pueden emitir Actas de Hechos y Minutas Oficiales."
    },
    {
      intent: "Solicitar Historial / Expedientes",
      keywords: ["historial academico", "pedir historial", "expediente academico", "archivo", "calificaciones previas"],
      allowedRoles: [UserRole.TRABAJO_SOCIAL, UserRole.DIRECTIVO, UserRole.ORIENTACION, UserRole.SUBDIRECCION],
      moduleTarget: AppModule.EXPEDIENTES,
      successText: "Enrutando al Archivo Central. Desde aquí puedes solicitar el historial a la plantilla docente.",
      deniedText: "Acceso Restringido. Las solicitudes masivas de historial a docentes corresponden al área de Trabajo Social, Subdirección u Orientación."
    },
    {
      intent: "Programar en Agenda y Calendario Escolar",
      keywords: ["agendar evento", "semana de evaluaciones", "calendario", "recordatorio escolar", "programar junta"],
      allowedRoles: [UserRole.DIRECTIVO, UserRole.SUBDIRECCION, UserRole.SECRETARIA],
      moduleTarget: AppModule.AGENDA,
      successText: "Abriendo la Agenda Institucional. Aquí puedes programar el evento escolar y notificar automáticamente a los profesores.",
      deniedText: "Modificación de calendario no autorizada. Agendar eventos globales y evaluaciones requiere validación Directiva o de Secretaría."
    }
  ];

  const processInput = (text: string) => {
    if (!text.trim()) return;
    setLocalState('processing');
    setChatInput('');
    
    const normalized = text.toLowerCase();
    
    setTimeout(() => {
      setLocalState('calm');
      
      // --- SECURITY & INSTITUTIONAL RULES ---
      if (normalized.includes("cambiar rol") || normalized.includes("hazme director") || 
          normalized.includes("quiero ser admin") || normalized.includes("acceso total") || 
          normalized.includes("subir de puesto")) {
        setLocalState('alert');
        setCurrentSuggestion({ 
          text: "Lo siento, como asistente institucional no tengo permitido modificar jerarquías ni roles de usuario. Por favor, contacta a Soporte Técnico.", 
          state: 'alert' 
        });
        toast.error("Acceso denegado: Intento de cambio de rol no autorizado.");
        return;
      }

      if (normalized.includes("borra al alumno") || normalized.includes("eliminar registro") || normalized.includes("borrar expediente")) {
        setLocalState('attention');
        setCurrentSuggestion({ 
          text: "Protocolo de integridad: SASE-310 prohíbe la eliminación de registros institucionales. Los datos solo pueden ser cerrados o archivados.", 
          state: 'attention' 
        });
        return;
      }

      if (normalized.includes("quitar intervencion") || normalized.includes("eliminar sancion")) {
        setLocalState('attention');
        setCurrentSuggestion({ 
          text: "El estado de INTERVENCIÓN es calculado exclusivamente por el Motor de Riesgo en PostgreSQL. No puedo alterarlo manualmente.", 
          state: 'attention' 
        });
        return;
      }

      // --- AUTHORIZED NAVIGATION & ACTIONS ---
      if (normalized.includes("incidencia") || normalized.includes("reporte rápido")) {
        setQuickRegisterOpen(true);
        setCurrentSuggestion({ text: "Entendido. Abriendo módulo de registro rápido de incidencias.", state: 'calm' });
        setIsChatOpen(false);
        return;
      } else if (normalized.includes("tour") || normalized.includes("ayuda") || normalized.includes("instrucciones") || normalized.includes("manual")) {
        setCurrentSuggestion({ text: "Entendido. Iniciando protocolo de inducción personalizada. Sígueme...", state: 'calm' });
        setIsChatOpen(false);
        localStorage.setItem('sase_onboarding_completed', 'true');
        import("../TourGuide").then(m => m.startProductTour(
          currentUserProfile?.full_name || "Docente", 
          currentUserRole as any,
          setIsTourActive,
          setTourStep
        ));
        return;
      }

      // Contextual semantic response
      if (normalized.includes("como esta la escuela") || normalized.includes("estatus")) {
        const highRisk = students.filter(s => s.caseState === 'INTERVENCION').length;
        const unread = notifications.filter(n => !n.read).length;
        if (highRisk > 0) {
          setCurrentSuggestion({ text: `Situación Escolar: CRITICA. Tenemos ${highRisk} caso(s) en Intervención que requieren actuación inmediata.`, state: 'alert' });
        } else if (unread > 0) {
          setCurrentSuggestion({ text: `Situación Escolar: ESTABLE con pendientes. Tienes ${unread} notificaciones nuevas acumuladas.`, state: 'attention' });
        } else {
          setCurrentSuggestion({ text: `Situación Escolar: VERDE. Todo el ambiente institucional se encuentra bajo control en los parámetros operativos.`, state: 'calm' });
        }
        return;
      }

      // --- RBAC INTENT ENGINE ---
      for (const rule of INTENT_RULES) {
        if (rule.keywords.some(keyword => normalized.includes(keyword))) {
          if (rule.allowedRoles.includes(currentUserRole as UserRole)) {
            setCurrentModule(rule.moduleTarget);
            setCurrentSuggestion({ text: rule.successText, state: 'calm' });
            setIsChatOpen(false);
          } else {
            setLocalState('alert');
            setCurrentSuggestion({ text: rule.deniedText, state: 'alert' });
            toast.error(`Acceso denegado por jerarquía (${currentUserRole}).`);
          }
          return;
        }
      }

      setCurrentSuggestion({ text: "Protocolo SASE recibido. Por el momento mi capacidad se limita a estas áreas, utiliza los menús laterales para acciones complejas.", state: 'calm' });

    }, 1500);
  };

  if (isTourActive) return null;

  return (
    <>
      <motion.div 
        ref={constraintsRef}
        className="fixed inset-0 pointer-events-none z-[9999]"
      >
        <motion.div 
          drag
          dragConstraints={constraintsRef}
          dragElastic={0.1}
          layout
          className={`absolute pointer-events-auto flex flex-col items-center gap-6 transition-all duration-1000 ${
            isWidgetMode 
              ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' 
              : 'bottom-12 right-12 items-end'
          }`}
        >
        <AnimatePresence>
          {isChatOpen && !minimal && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: 'bottom right' }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="w-[320px] bg-black/95 border border-white/20 backdrop-blur-3xl rounded-[2.5rem] p-6 shadow-2xl overflow-hidden ring-1 ring-white/10"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                   <div className="size-2 bg-violet-500 rounded-full animate-pulse" />
                   <span className="text-[10px] font-black tracking-widest text-white/40 uppercase">SASITO AI CORE</span>
                </div>
                <button aria-label="Cerrar chat" title="Cerrar chat" onClick={() => setIsChatOpen(false)} className="size-8 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:text-white transition-all"><X size={14} /></button>
              </div>
              <div className="mb-6 text-[11px] text-white/70 leading-relaxed font-medium">Hola {currentUserProfile?.full_name?.split(' ')[0] || ''}, ¿En qué puedo asistirte con el sistema SASE-310 hoy?</div>
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && processInput(chatInput)}
                  placeholder="Escribe tu consulta..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-violet-500/50 transition-all placeholder:text-white/20"
                />
                <button aria-label="Microfono" title="Activar/Desactivar Micrófono" onClick={() => setIsListening(!isListening)} className={`size-10 rounded-2xl flex items-center justify-center transition-all ${isListening ? 'bg-red-500 shadow-lg shadow-red-500/20' : 'bg-white/10 hover:bg-white/20'}`}>
                  {isListening ? <Mic size={18} /> : <MicOff size={18} />}
                </button>
              </div>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => {
                    setIsChatOpen(false);
                    import("../TourGuide").then(m => m.startProductTour(
                      currentUserProfile?.full_name || "Docente", 
                      currentUserRole as any,
                      setIsTourActive,
                      setTourStep
                    ));
                  }}
                  className="w-full py-4 bg-violet-600/20 border border-violet-500/30 rounded-2xl text-[10px] font-black text-violet-400 uppercase tracking-widest hover:bg-violet-600 hover:text-white transition-all flex items-center justify-center gap-2 shadow-xl shadow-violet-900/10"
                >
                  <span className="material-icons text-sm">explore</span>
                  REINICIAR TOUR GUIADO
                </button>
                <button 
                  onClick={() => setIsChatOpen(false)}
                  className="w-full py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all"
                >
                  Cerrar Consola
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {currentSuggestion && !isChatOpen && !minimal && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 20 }}
              className="absolute bottom-full right-0 mb-8 w-72"
            >
              <div className="glass-card-quantum p-6 border-violet-500/30 bg-slate-950/90 backdrop-blur-3xl shadow-2xl relative overflow-hidden group rounded-3xl ring-1 ring-white/10">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent opacity-50" />
                
                <div className="flex flex-col gap-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400">
                      <span className="material-icons text-lg">auto_awesome</span>
                    </div>
                    <span className="text-[10px] font-black text-violet-400 uppercase tracking-[0.2em]">Sugerencia IA</span>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-[13px] text-white font-medium leading-relaxed italic">
                      "{currentSuggestion.text}"
                    </p>
                    <div className="flex gap-2 pt-2">
                        <button 
                          onClick={() => {
                            if (currentSuggestion.actionType === "start-tour") {
                               localStorage.setItem('sase_onboarding_completed', 'true');
                               import("../TourGuide").then(m => m.startProductTour(
                                 currentUserProfile?.full_name || "Docente", 
                                 currentUserRole as any,
                                 setIsTourActive,
                                 setTourStep
                               ));
                            } else if (currentSuggestion.actionType?.startsWith("module-")) {
                               const module = currentSuggestion.actionType.replace("module-", "").toUpperCase();
                               setCurrentModule(module as any);
                            }
                            setCurrentSuggestion(null);
                          }}
                          className="px-4 py-2 bg-violet-600 rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-violet-500 transition-all shadow-lg shadow-violet-500/20"
                        >
                          {currentSuggestion.actionLabel || "ENTENDIDO"}
                        </button>
                      <button 
                        onClick={() => setCurrentSuggestion(null)}
                        className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-white/10 transition-all"
                      >
                        Luego
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative flex items-center justify-center">
          <motion.div
            onClick={() => !minimal && setIsChatOpen(!isChatOpen)}
            className="cursor-pointer pointer-events-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <SaseSplineOrb 
              state={
                localState === 'processing' ? 'thinking' : 
                localState === 'alert' ? 'alert' : 
                localState === 'attention' ? 'warning' : 'normal'
              } 
              className={minimal ? "w-24 h-24" : "w-32 h-32"}
            />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  </>
);
};
