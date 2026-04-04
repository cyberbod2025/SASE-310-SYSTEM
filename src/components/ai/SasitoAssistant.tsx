import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useSpring, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, X, MessageSquare, Info, AlertTriangle, Zap } from 'lucide-react';
import { useApp } from "../../store";
import { UserRole, AppModule } from "../../types";
import { SaseSplineOrb } from "../SaseSplineOrb";
import toast from "react-hot-toast";

export type SasitoState = 'calm' | 'attention' | 'alert' | 'processing' | 'rebooting';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
}

interface Suggestion {
  text: string;
  state: SasitoState | null;
  actionLabel?: string;
  infoLabel?: string;
  actionType?: string;
}

// Sugerencias estáticas eliminadas en favor de saseSuggestions dinámicas

interface SasitoProps {
  minimal?: boolean; // If true, no chat, no mic, no suggestions (for Login)
  isWidgetMode?: boolean;
}

export const SasitoAssistant: React.FC<SasitoProps> = ({ minimal = false, isWidgetMode = false }) => {
  const {
    currentUserRole,
    setCurrentModule,
    setQuickRegisterOpen,
    isAssistantOpen,
    setIsAssistantOpen,
    aiSystemState,
    students,
    notifications,
    currentUserProfile,
    isTourActive,
  } = useApp();

  const [localState, setLocalState] = useState<SasitoState>('calm');
  const [particles, setParticles] = useState<Particle[]>([]);
  const [currentSuggestion, setCurrentSuggestion] = useState<Suggestion | null>(null);
  const [isBubbleExpanded, setIsBubbleExpanded] = useState(false);
  const [isZapping, setIsZapping] = useState(false);
  const [zapPos, setZapPos] = useState({ x: 0, y: 0 });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  const particleIdRef = useRef(0);
  const sphereRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef(null);

  const eyeX = useSpring(0, { stiffness: 250, damping: 20 });
  const eyeY = useSpring(0, { stiffness: 250, damping: 20 });

  // -- ONBOARDING LOGIC --
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('sase_onboarding_v1_completed');
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

  const getStateColor = (s: SasitoState) => {
    switch (s) {
      case 'calm': return '#8b5cf6';      // Violeta Energía
      case 'attention': return '#f59e0b';  // Ámbar
      case 'alert': return '#f43f5e';      // Magenta Alerta
      case 'processing': return '#d946ef'; // Fucsia Thinking
      case 'rebooting': return '#06b6d4';  // Cian Reboot
      default: return '#8b5cf6';
    }
  };

  const get3DGradient = (s: SasitoState) => {
    const color = getStateColor(s);
    if (s === 'processing') {
      return `radial-gradient(circle at 30% 30%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.4) 10%, transparent 40%),
              repeating-conic-gradient(from 0deg at 50% 50%, #8b5cf6 0deg, #d946ef 10deg, #06b6d4 20deg, #8b5cf6 30deg),
              radial-gradient(circle at 70% 70%, rgba(0,0,0,0.8) 0%, transparent 100%),
              rgba(139,92,246,0.2)`;
    }
    return `radial-gradient(circle at 30% 30%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.5) 10%, transparent 40%),
            radial-gradient(circle at 50% 50%, ${color} 0%, ${color}CC 40%, rgba(10,13,23,0.7) 90%),
            radial-gradient(circle at 70% 70%, rgba(0,0,0,0.8) 0%, transparent 100%),
            linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.2) 100%),
            ${color}33`;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (sphereRef.current) {
        const rect = sphereRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const sensitivity = localState === 'alert' ? 6 : 10;
        const maxMove = localState === 'alert' ? 20 : 15;
        eyeX.set((deltaX / (distance || 1)) * Math.min(distance / sensitivity, maxMove));
        eyeY.set((deltaY / (distance || 1)) * Math.min(distance / sensitivity, maxMove));
      }

      if (Math.random() > 0.8 && !minimal) {
        const id = particleIdRef.current++;
        const newParticle: Particle = { id, x: e.clientX, y: e.clientY, color: getStateColor(localState) };
        setParticles(prev => [...prev.slice(-20), newParticle]);
        setTimeout(() => setParticles(prev => prev.filter(p => p.id !== id)), 1000);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [localState, minimal]);

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

  const processInput = (text: string) => {
    if (!text.trim()) return;
    setLocalState('processing');
    setChatInput('');
    
    const normalized = text.toLowerCase();
    
    setTimeout(() => {
      setLocalState('calm');
      
      // --- SECURITY & INSTITUTIONAL RULES (UNAUTHORIZED REQUESTS) ---
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
      if (normalized.includes("incidencia") || normalized.includes("reporte")) {
        setQuickRegisterOpen(true);
        setCurrentSuggestion({ text: "Entendido. Abriendo módulo de registro rápido de incidencias.", state: 'calm' });
        setIsChatOpen(false);
      } else if (normalized.includes("tour") || normalized.includes("ayuda") || normalized.includes("instrucciones") || normalized.includes("cómo funciona") || normalized.includes("como se hace esto") || normalized.includes("manual")) {
        setCurrentSuggestion({ text: "Entendido. Iniciando protocolo de inducción personalizada. Sígueme...", state: 'calm' });
        setIsChatOpen(false);
        localStorage.setItem('sase_onboarding_v1_completed', 'true');
        import("../TourGuide").then(m => m.startProductTour(currentUserProfile?.full_name || "Docente", currentUserRole as any));
      } else if (normalized.includes("agenda")) {
        setCurrentModule(AppModule.AGENDA);
        setCurrentSuggestion({ text: "Navegando a la Agenda Institucional.", state: 'calm' });
        setIsChatOpen(false);
      } else if (normalized.includes("reporte")) {
        setCurrentModule(AppModule.REPORTES);
        setCurrentSuggestion({ text: "Accediendo al panel de Reportes y Estadísticas.", state: 'calm' });
        setIsChatOpen(false);
      } else {
        setCurrentSuggestion({ text: "Protocolo SASE recibido. He procesado tu solicitud satisfactoriamente.", state: 'calm' });
      }
    }, 1500);
  };

  if (isTourActive) return null;

  return (
    <>
      <svg className="hidden">
        <filter id="fractalNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" result="noise" />
          <feColorMatrix type="saturate" values="2" />
          <feComposite operator="in" in2="SourceGraphic" />
        </filter>
      </svg>

      <AnimatePresence>
        {!minimal && particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], y: p.y + 30 }}
            style={{
              position: 'fixed', left: p.x, top: p.y, width: '2px', height: '2px',
              backgroundColor: 'white', borderRadius: '50%', pointerEvents: 'none', zIndex: 40,
              boxShadow: `0 0 10px ${p.color}`,
            }}
          />
        ))}
      </AnimatePresence>

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
              className="w-[320px] bg-black/90 border border-white/20 backdrop-blur-xl rounded-[2rem] p-6 shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase">SASE 310 AGENT</span>
                <button onClick={() => setIsChatOpen(false)} className="text-white/30 hover:text-white"><X size={14} /></button>
              </div>
              <div className="mb-4 text-xs text-white/70 leading-relaxed">¿Cómo puedo asistirte con SASE 310 hoy?</div>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && processInput(chatInput)}
                  placeholder="Escribe aquí..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                />
                <button onClick={() => setIsListening(!isListening)} className={`p-2 rounded-xl ${isListening ? 'bg-red-500' : 'bg-white/10'}`}>
                  {isListening ? <Mic size={16} /> : <MicOff size={16} />}
                </button>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setIsChatOpen(false);
                    import("../TourGuide").then(m => m.startProductTour(currentUserProfile?.full_name || "Docente", currentUserRole as any));
                  }}
                  className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-violet-400 uppercase tracking-widest hover:bg-violet-500/10 transition-all flex items-center justify-center gap-2"
                >
                  REINICIAR TOUR
                </button>
                <button 
                  onClick={() => setIsChatOpen(false)}
                  className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Cerrar
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
              className="absolute bottom-full right-0 mb-6 w-72"
            >
              <div className="glass-card-quantum p-5 border-violet-500/30 bg-slate-930/90 backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 border border-violet-500/0 group-hover:border-violet-500/40 transition-all duration-700 rounded-[inherit]" />
                
                <div className="flex items-start gap-4 relative z-10">
                  <div className="size-8 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-400 shrink-0">
                    <span className="material-icons text-lg">auto_awesome</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[12px] text-white font-medium leading-relaxed italic">
                      "{currentSuggestion.text}"
                    </p>
                    <div className="mt-4 flex gap-2">
                        <button 
                          onClick={() => {
                            if (currentSuggestion.actionType === "start-tour") {
                               localStorage.setItem('sase_onboarding_v1_completed', 'true');
                               import("../TourGuide").then(m => m.startProductTour(currentUserProfile?.full_name || "Docente", currentUserRole as any));
                            }
                            setCurrentSuggestion(null);
                          }}
                          className="px-3 py-1.5 bg-violet-600 rounded-lg text-[10px] font-black text-white uppercase tracking-widest hover:bg-violet-500 transition-all font-sans"
                        >
                          {currentSuggestion.actionLabel || "ENTENDIDO"}
                        </button>
                      <button 
                        onClick={() => setCurrentSuggestion(null)}
                        className="px-3 py-1.5 bg-white/5 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-white/10 transition-all"
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
            ref={sphereRef}
            onClick={() => !minimal && setIsChatOpen(!isChatOpen)}
            className="z-50"
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

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.1, 0.3, 0.1],
                boxShadow: `0 0 100px ${
                  localState === 'processing' ? '#d946ef' : 
                  localState === 'alert' ? '#f43f5e' : 
                  localState === 'attention' ? '#f59e0b' : '#8b5cf6'
                }44`
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute w-[180px] h-[180px] rounded-full blur-xl"
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  </>
);
};
