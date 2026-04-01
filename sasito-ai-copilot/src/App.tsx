import React, { useState, useEffect, useRef } from 'react';
import { motion, useSpring, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { Send, Mic, MicOff, X } from 'lucide-react';

type SasitoState = 'calm' | 'attention' | 'alert' | 'processing' | 'rebooting';

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
  actionType?: 'agenda' | 'notifications' | 'history' | 'grades' | 'enrollment' | 'calendar' | 'help';
}

const SUGGESTIONS: Suggestion[] = [
  { text: "¡Hola! ¿Cómo estás hoy?", state: null, infoLabel: "Ver más" },
  { 
    text: "Recuerda revisar tu agenda para la reunión de las 3:00 PM.", 
    state: 'attention', 
    actionLabel: "Ver Agenda", 
    actionType: 'agenda' 
  },
  { 
    text: "Tienes una nueva notificación de Dirección de Orientación.", 
    state: 'alert', 
    actionLabel: "Ver Notificación", 
    actionType: 'notifications' 
  },
  { 
    text: "Se ha recibido una solicitud de historial académico.", 
    state: 'processing', 
    actionLabel: "Gestionar", 
    actionType: 'history' 
  },
  { 
    text: "¿Sabías que puedes pedirme que analice tus calificaciones?", 
    state: 'calm', 
    actionLabel: "Analizar", 
    actionType: 'grades' 
  },
  { 
    text: "¡Estoy listo para ayudarte con tus trámites!", 
    state: 'processing', 
    infoLabel: "Ver Trámites" 
  },
  { 
    text: "¿Necesitas ayuda con tu inscripción?", 
    state: 'attention', 
    actionLabel: "Inscribirme", 
    actionType: 'enrollment' 
  },
  { 
    text: "Hay una nueva actualización en el calendario académico.", 
    state: 'attention', 
    actionLabel: "Ver Calendario", 
    actionType: 'calendar' 
  },
  { text: "Verde significa que todo está en calma y bajo control.", state: 'calm', infoLabel: "Saber más" },
  { text: "Azul cielo indica que me estoy reiniciando para servirte mejor.", state: 'rebooting' },
  { text: "Rojo es una alerta crítica que requiere tu atención inmediata.", state: 'alert', actionLabel: "Resolver", actionType: 'help' },
  { text: "Dorado significa que estoy procesando tus solicitudes con toda mi energía.", state: 'processing' },
  { text: "Amarillo indica que hay algo que deberías revisar pronto.", state: 'attention', actionLabel: "Revisar", actionType: 'help' }
];

export default function App() {
  const [state, setState] = useState<SasitoState>('calm');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Particle[]>([]);
  const [currentSuggestion, setCurrentSuggestion] = useState<Suggestion | null>(null);
  const [isBubbleExpanded, setIsBubbleExpanded] = useState(false);
  const [isZapping, setIsZapping] = useState(false);
  const [zapPos, setZapPos] = useState({ x: 0, y: 0 });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isWidgetMode, setIsWidgetMode] = useState(false);
  const particleIdRef = useRef(0);
  const sphereRef = useRef<HTMLDivElement>(null);

  // Eye tracking values
  const eyeX = useSpring(0, { stiffness: 250, damping: 20 });
  const eyeY = useSpring(0, { stiffness: 250, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });

      // Eye tracking logic
      if (sphereRef.current) {
        const rect = sphereRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Red state: Vigilant tracker (faster, more sensitive)
        const sensitivity = state === 'alert' ? 6 : 10;
        const maxMove = state === 'alert' ? 20 : 15;
        
        const moveX = (deltaX / (distance || 1)) * Math.min(distance / sensitivity, maxMove);
        const moveY = (deltaY / (distance || 1)) * Math.min(distance / sensitivity, maxMove);
        
        eyeX.set(moveX);
        eyeY.set(moveY);
      }

      // Add particles (diamantina) - More like the video
      if (Math.random() > 0.7) {
        const id = particleIdRef.current++;
        const newParticle: Particle = {
          id,
          x: e.clientX,
          y: e.clientY,
          color: getStateColor(state)
        };
        setParticles(prev => [...prev.slice(-30), newParticle]);
        setTimeout(() => {
          setParticles(prev => prev.filter(p => p.id !== id));
        }, 1500);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [state]);

  // Random speech bubbles with state synchronization
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.5 && !isBubbleExpanded) {
        const suggestion = SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)];
        setCurrentSuggestion(suggestion);
        setIsBubbleExpanded(false);
        if (suggestion.state) {
          setState(suggestion.state);
        }
        setTimeout(() => {
          if (!isBubbleExpanded) setCurrentSuggestion(null);
        }, 8000);
      }
    }, 12000);
    return () => clearInterval(interval);
  }, [isBubbleExpanded]);

  const handleAction = (type?: string) => {
    console.log(`Performing action: ${type}`);
    setCurrentSuggestion({
      text: `¡Excelente! Iniciando proceso de ${type || 'gestión'}...`,
      state: 'processing'
    });
    setState('processing');
    setIsBubbleExpanded(false);
    setTimeout(() => setCurrentSuggestion(null), 3000);
  };

  const handleInfo = () => {
    setCurrentSuggestion({
      text: "Estoy aquí para optimizar tu experiencia académica. ¿En qué más puedo ayudarte?",
      state: 'calm'
    });
    setState('calm');
    setIsBubbleExpanded(false);
    setTimeout(() => setCurrentSuggestion(null), 4000);
  };

  const getStateColor = (s: SasitoState) => {
    switch (s) {
      case 'calm': return '#00ff00'; // Pure Neon Green
      case 'attention': return '#ffff00'; // Pure Neon Yellow
      case 'alert': return '#ff0000'; // Pure Neon Red
      case 'processing': return '#ff8800'; // Pure Neon Gold/Orange
      case 'rebooting': return '#00ffff'; // Pure Neon Cyan
      default: return '#00ff00';
    }
  };

  const get3DGradient = (s: SasitoState) => {
    const color = getStateColor(s);
    
    if (s === 'processing') {
      // Multicolor Fractal-like Gradient for Processing
      return `radial-gradient(circle at 30% 30%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.4) 10%, transparent 40%),
              repeating-conic-gradient(from 0deg at 50% 50%, #ff0000 0deg, #ff8800 10deg, #ffff00 20deg, #00ff00 30deg, #00ffff 40deg, #0000ff 50deg, #ff00ff 60deg, #ff0000 70deg),
              radial-gradient(circle at 70% 70%, rgba(0,0,0,0.8) 0%, transparent 100%),
              ${color}33`;
    }

    // Ultra-vibrant 8K-style volumetric gradient
    return `radial-gradient(circle at 30% 30%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.4) 10%, transparent 40%),
            radial-gradient(circle at 50% 50%, ${color} 0%, ${color}CC 40%, transparent 85%),
            radial-gradient(circle at 70% 70%, rgba(0,0,0,0.8) 0%, transparent 100%),
            linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.2) 100%),
            ${color}33`;
  };

  const handleZap = (e: React.MouseEvent) => {
    setIsZapping(true);
    setZapPos({ x: e.clientX, y: e.clientY });
    // Trigger a small screen shake effect via state
    setTimeout(() => setIsZapping(false), 200);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    // Simulate processing
    setState('processing');
    setChatInput('');
    setTimeout(() => {
      setState('calm');
      setCurrentSuggestion({
        text: `He procesado tu solicitud: "${chatInput}". ¿Hay algo más en lo que pueda ayudarte?`,
        state: 'calm'
      });
    }, 2000);
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setState('attention');
    } else {
      setState('calm');
    }
  };

  return (
    <div className={`min-h-screen bg-[#020202] text-white overflow-hidden font-sans selection:bg-white/20 transition-all duration-75 ${isZapping ? 'brightness-150' : ''}`}>
      {/* SVG Filters for Fractal Effects */}
      <svg className="hidden">
        <filter id="fractalNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" result="noise" />
          <feColorMatrix type="saturate" values="2" />
          <feComposite operator="in" in2="SourceGraphic" />
        </filter>
      </svg>

      {/* Background Particles (Diamantina) - Video Style */}
      <AnimatePresence>
        {!isWidgetMode && (
          <>
            {isZapping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.3, 0] }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-white z-[90] pointer-events-none"
              />
            )}
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0.5, 0], scale: [0, 1.2, 0.8, 0], y: p.y + 40, x: p.x + (Math.random() * 20 - 10) }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'fixed',
                  left: p.x,
                  top: p.y,
                  width: '3px',
                  height: '3px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                  zIndex: 40,
                  boxShadow: `0 0 8px white, 0 0 16px ${p.color}, 0 0 24px ${p.color}`,
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <AnimatePresence>
        {!isWidgetMode && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-10 p-8 max-w-4xl mx-auto"
          >
            <header className="mb-16">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 mb-4"
              >
                <div className="h-px w-12 bg-white/20" />
                <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-white/40">SISTEMA SASE v9.2</span>
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  skewX: isZapping ? [0, 20, -20, 0] : 0,
                  x: isZapping ? [0, 5, -5, 0] : 0
                }}
                className="text-8xl font-bold tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/20"
              >
                SASITO
              </motion.h1>
              <p className="text-gray-500 max-w-lg text-lg leading-relaxed font-light">
                Copiloto inteligente con renderizado volumétrico y descarga eléctrica dinámica.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Protocolos de Estado</h2>
                <div className="grid grid-cols-2 gap-3">
                  {(['calm', 'attention', 'alert', 'processing', 'rebooting'] as SasitoState[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setState(s)}
                      className={`group relative px-6 py-4 rounded-2xl text-[10px] font-bold tracking-widest transition-all duration-500 overflow-hidden border ${
                        state === s 
                          ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.2)]' 
                          : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <span className="relative z-10">{s.toUpperCase()}</span>
                      {state === s && (
                        <motion.div 
                          layoutId="active-bg"
                          className="absolute inset-0 bg-white"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-8 rounded-[2rem] bg-white/[0.05] border border-white/20 backdrop-blur-3xl relative overflow-hidden group shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/50 mb-6">Métricas de Copiloto</h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] text-white/60 uppercase">Descarga Eléctrica</span>
                    <span className={`text-xl font-bold ${state === 'processing' || state === 'alert' ? 'text-white drop-shadow-[0_0_10px_white]' : 'text-white/40'}`}>
                      {state === 'processing' || state === 'alert' ? 'ACTIVA' : 'IDLE'}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] text-white/60 uppercase">Renderizado</span>
                    <span className="text-xl font-bold text-white drop-shadow-[0_0_10px_white]">Volumétrico 8K</span>
                  </div>
                  <div className="pt-4">
                    <div className="h-[2px] w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="h-full w-1/2 bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_15px_white]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Widget Mode Toggle */}
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsWidgetMode(!isWidgetMode)}
        className="fixed top-8 right-8 z-[100] flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all backdrop-blur-md"
      >
        <span className="text-[10px] font-mono uppercase tracking-widest">
          {isWidgetMode ? "Salir de Modo Widget" : "Modo Widget"}
        </span>
        {isWidgetMode ? <X size={16} /> : <div className="w-3 h-3 border border-current rounded-sm" />}
      </motion.button>

      {/* SASITO - The AI Copilot (Fixed Position) */}
      <motion.div 
        layout
        className={`fixed z-50 flex flex-col items-center gap-6 transition-all duration-1000 ${
          isWidgetMode 
            ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' 
            : 'bottom-12 right-12 items-end'
        }`}
      >
        {/* Chat Interface */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: 'bottom right' }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="w-[350px] bg-black/80 border border-white/20 backdrop-blur-2xl rounded-[2.5rem] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden relative"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse bg-[${getStateColor(state)}] shadow-[0_0_10px_${getStateColor(state)}]`} />
                  <span className="text-[10px] font-mono tracking-widest text-white/50 uppercase">Sasito Chat v1.0</span>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-white/30 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4 mb-6 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none">
                  <p className="text-xs text-white/80 leading-relaxed">
                    Hola, soy Sasito. ¿En qué puedo ayudarte hoy? Puedes escribirme o usar el micrófono.
                  </p>
                </div>
              </div>

              <div className="relative flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Escribe tu petición..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/40 transition-all"
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white/40 hover:text-white transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </div>
                <button 
                  onClick={toggleListening}
                  className={`p-3 rounded-2xl transition-all duration-300 ${isListening ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
                >
                  {isListening ? <Mic size={20} className="animate-pulse" /> : <MicOff size={20} />}
                </button>
              </div>

              {isListening && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 flex justify-center gap-1"
                >
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [4, 16, 4] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                      className="w-1 bg-white/40 rounded-full"
                    />
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Speech Bubble (only when chat is closed) */}
        <AnimatePresence>
          {currentSuggestion && !isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                width: isBubbleExpanded ? 320 : 280 
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setIsBubbleExpanded(true)}
              className={`relative bg-white text-black p-6 rounded-[2rem] rounded-br-none shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-pointer transition-all duration-300 ${isBubbleExpanded ? 'ring-4 ring-white/20' : 'hover:scale-105'}`}
            >
              <p className="text-sm font-medium leading-relaxed mb-4">
                {currentSuggestion.text}
              </p>

              {isBubbleExpanded && (currentSuggestion.actionLabel || currentSuggestion.infoLabel) && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2"
                >
                  {currentSuggestion.actionLabel && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction(currentSuggestion.actionType);
                      }}
                      className="flex-1 bg-black text-white text-[10px] font-bold py-2 px-4 rounded-xl hover:bg-gray-800 transition-colors uppercase tracking-widest"
                    >
                      {currentSuggestion.actionLabel}
                    </button>
                  )}
                  {currentSuggestion.infoLabel && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInfo();
                      }}
                      className="flex-1 border border-black/10 text-black text-[10px] font-bold py-2 px-4 rounded-xl hover:bg-black/5 transition-colors uppercase tracking-widest"
                    >
                      {currentSuggestion.infoLabel}
                    </button>
                  )}
                </motion.div>
              )}

              {!isBubbleExpanded && (currentSuggestion.actionLabel || currentSuggestion.infoLabel) && (
                <div className="text-[9px] font-bold text-black/30 uppercase tracking-widest mt-2">
                  Haz clic para interactuar
                </div>
              )}

              <div className="absolute -bottom-2 right-0 w-4 h-4 bg-white transform rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

          <motion.div
            ref={sphereRef}
            onClick={() => setIsChatOpen(!isChatOpen)}
            animate={{
              y: [0, -15, 0],
              x: isZapping ? [0, -10, 10, -10, 10, 0] : 0,
              rotate: state === 'processing' ? 360 : 0,
              filter: state === 'processing' 
                ? ['saturate(1.5) hue-rotate(0deg) contrast(1.2)', 'saturate(1.5) hue-rotate(360deg) contrast(1.2)'] 
                : 'saturate(1.5) hue-rotate(0deg) contrast(1)',
              scale: state === 'attention' ? 1.1 : (state === 'processing' ? 1.05 : 1),
              background: get3DGradient(state),
              boxShadow: `inset -20px -20px 60px rgba(0,0,0,0.7), 
                          inset 20px 20px 60px rgba(255,255,255,0.2),
                          0 0 120px ${state === 'processing' ? 'rgba(255,255,255,0.5)' : getStateColor(state) + '77'},
                          0 0 40px ${state === 'processing' ? 'rgba(255,255,255,0.8)' : getStateColor(state) + '99'}`,
            }}
            transition={{
              y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
              x: { duration: 0.2 },
              rotate: { duration: state === 'processing' ? 10 : 0, repeat: Infinity, ease: "linear" },
              filter: { duration: state === 'processing' ? 5 : 0, repeat: Infinity, ease: "linear" },
              scale: { duration: 0.3 },
              background: { duration: 0.8 },
              boxShadow: { duration: 0.8 }
            }}
            className="w-[180px] h-[180px] rounded-full flex items-center justify-center relative overflow-hidden backdrop-blur-md z-10 ring-1 ring-white/20 cursor-pointer"
            style={{
              filter: state === 'processing' ? 'url(#fractalNoise)' : 'none'
            }}
          >
            {/* ... (rest of the internal sphere content remains the same) */}
            {/* Internal Glow (Mario Bros Power-up Effect) */}
            <AnimatePresence>
              {state === 'processing' && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 2], opacity: [0, 0.6, 0] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full bg-white/40 blur-xl"
                />
              )}
            </AnimatePresence>

            {/* Internal Circuits */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <svg width="100%" height="100%" viewBox="0 0 100 100">
                <motion.path
                  d="M 20,50 L 40,50 L 50,40 L 60,50 L 80,50"
                  stroke="white"
                  strokeWidth="0.5"
                  fill="none"
                  animate={{ opacity: [0.1, 0.5, 0.1], pathLength: [0, 1, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <motion.circle
                  cx="50" cy="50" r="45"
                  stroke="white"
                  strokeWidth="0.2"
                  fill="none"
                  strokeDasharray="5,5"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
              </svg>
            </div>

            {/* Energy Sparks / Electrical Discharge (Processing & Alert) */}
            {(state === 'processing' || state === 'alert') && (
              <div className="absolute inset-0 z-20">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: [0, 1, 0],
                      scaleX: isZapping ? [0, 6, 0] : [0, 1.5, 0],
                      scaleY: isZapping ? [1, 3, 1] : 1,
                      rotate: Math.random() * 360,
                      x: Math.random() * 60 - 30,
                      y: Math.random() * 60 - 30
                    }}
                    transition={{ 
                      duration: 0.1, 
                      repeat: Infinity, 
                      repeatDelay: Math.random() * 0.3,
                      delay: i * 0.05
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleZap(e);
                    }}
                    className="absolute top-1/2 left-1/2 w-24 h-[2px] bg-white shadow-[0_0_20px_white,0_0_10px_cyan] cursor-pointer pointer-events-auto"
                  />
                ))}
              </div>
            )}

            {/* Visual Zap Feedback */}
            <AnimatePresence>
              {isZapping && (
                <>
                  <motion.div
                    initial={{ opacity: 0.8, scale: 0 }}
                    animate={{ opacity: 0, scale: 4 }}
                    exit={{ opacity: 0 }}
                    className="fixed z-[95] pointer-events-none rounded-full border-2 border-white"
                    style={{ left: zapPos.x, top: zapPos.y, width: 50, height: 50, transform: 'translate(-50%, -50%)' }}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 0 }}
                    animate={{ opacity: 1, scale: 2, y: -40 }}
                    exit={{ opacity: 0, scale: 3 }}
                    className="fixed z-[100] pointer-events-none text-xs font-black text-white uppercase tracking-[0.2em] drop-shadow-[0_0_15px_white] italic"
                    style={{ left: zapPos.x, top: zapPos.y, transform: 'translate(-50%, -50%)' }}
                  >
                    ⚡ ZAP! ⚡
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Eyes Container (Following Mouse - Positioned Higher) */}
            <motion.div 
              style={{ x: eyeX, y: eyeY }}
              className="flex gap-8 -mt-10"
            >
              {[0, 1].map((i) => (
                <div key={i} className="relative">
                  <motion.div
                    animate={{
                      height: state === 'rebooting' ? 2 : (state === 'attention' ? 48 : 36),
                      scaleY: [1, 1, 0, 1, 1], // Natural blink
                    }}
                    transition={{
                      scaleY: { 
                        duration: state === 'attention' ? 1.2 : (state === 'calm' ? 6 : 3), // Subtler and slower when calm
                        repeat: Infinity, 
                        times: [0, 0.85, 0.88, 0.91, 1], // Quick blink at the end of the cycle
                        delay: i * 0.1 
                      },
                      height: { duration: 0.3 }
                    }}
                    className="w-6 bg-white rounded-full shadow-[0_0_30px_rgba(255,255,255,1),0_0_60px_rgba(255,255,255,0.5)]"
                  />
                  
                  {(state === 'processing' || state === 'attention') && (
                    <motion.div
                      animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.4, repeat: Infinity }}
                      className="absolute inset-0 bg-white blur-lg"
                    />
                  )}
                </div>
              ))}
            </motion.div>

            {/* Surface Reflection */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-40" />
          </motion.div>

          {/* INNOVATION PUNCH: Holographic Aura & Geometric Energy Field */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Outer Aura Layers */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`aura-${i}`}
                animate={{
                  scale: [1, 1.2 + i * 0.1, 1],
                  opacity: [0.15, 0.4 - i * 0.05, 0.15],
                  rotate: i % 2 === 0 ? 360 : -360,
                  boxShadow: `0 0 60px ${state === 'processing' ? 'rgba(255,255,255,0.5)' : getStateColor(state) + '44'}`,
                  background: state === 'processing' 
                    ? `conic-gradient(from ${i * 90}deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)`
                    : `radial-gradient(circle, ${getStateColor(state)}22 0%, transparent 70%)`
                }}
                transition={{
                  scale: { duration: 8 + i * 2, repeat: Infinity, ease: "linear" },
                  opacity: { duration: 8 + i * 2, repeat: Infinity, ease: "linear" },
                  rotate: { duration: 8 + i * 2, repeat: Infinity, ease: "linear" },
                  boxShadow: { duration: 0.8 },
                  background: { duration: 0.8 }
                }}
                className="absolute w-[240px] h-[240px] rounded-full border border-white/20 blur-md"
              />
            ))}

            {/* Geometric Glow (Rotating Hexagon/Grid) */}
            <motion.div
              animate={{
                rotate: 360,
                scale: [0.9, 1.1, 0.9],
                opacity: [0.1, 0.4, 0.1]
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute w-[280px] h-[280px] opacity-20"
            >
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  <motion.linearGradient id="geoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <motion.stop offset="0%" animate={{ stopColor: getStateColor(state) }} transition={{ duration: 0.8 }} stopOpacity="0" />
                    <motion.stop offset="50%" stopColor="white" stopOpacity="0.5" />
                    <motion.stop offset="100%" animate={{ stopColor: getStateColor(state) }} transition={{ duration: 0.8 }} stopOpacity="0" />
                  </motion.linearGradient>
                </defs>
                <motion.path
                  d="M 50,5 L 90,25 L 90,75 L 50,95 L 10,75 L 10,25 Z"
                  fill="none"
                  stroke="url(#geoGradient)"
                  strokeWidth="0.5"
                  strokeDasharray="2,2"
                />
                <motion.path
                  d="M 50,5 L 50,95 M 10,25 L 90,75 M 90,25 L 10,75"
                  fill="none"
                  stroke="url(#geoGradient)"
                  strokeWidth="0.2"
                  opacity="0.5"
                />
              </svg>
            </motion.div>

            {/* Light Energy Aura (Fluid Glow) */}
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.6, 0.3],
                background: `radial-gradient(circle, ${getStateColor(state)}66 0%, transparent 70%)`
              }}
              transition={{
                scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                background: { duration: 0.8 }
              }}
              className="absolute w-[200px] h-[200px] rounded-full blur-3xl"
            />
          </div>
      </motion.div>

      {/* Instructions Overlay */}
      <div className="fixed bottom-8 left-8 text-[10px] font-mono text-white/10 uppercase tracking-[0.5em]">
        Sasito Volumetric Sphere Active
      </div>
    </div>
  );
}
