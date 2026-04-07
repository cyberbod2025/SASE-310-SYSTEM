import React, { useState, useEffect, useRef } from 'react';
import { motion, useSpring, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, X } from 'lucide-react';
import { SystemState } from '../types/systemState';

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
  { text: "Verde significa que todo está en calma y bajo control.", state: 'calm', infoLabel: "Saber más" },
  { text: "Rojo es una alerta crítica que requiere tu atención inmediata.", state: 'alert', actionLabel: "Resolver", actionType: 'help' },
  { text: "Dorado significa que estoy procesando tus solicitudes.", state: 'processing' }
];

interface SasitoCopilotProps {
  systemState?: SystemState;
  onAction?: (type: string) => void;
  isWidgetMode?: boolean;
  className?: string;
}

export const SasitoCopilot: React.FC<SasitoCopilotProps> = ({ 
  systemState = 'normal', 
  onAction,
  isWidgetMode: initialWidgetMode = false,
  className = ""
}) => {
  // Map institutional state to visual state
  const getVisualState = (s: SystemState): SasitoState => {
    switch(s) {
      case 'alert': return 'alert';
      case 'warning': return 'attention';
      case 'thinking': return 'processing';
      default: return 'calm';
    }
  };

  const [state, setState] = useState<SasitoState>(getVisualState(systemState));
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Particle[]>([]);
  const [currentSuggestion, setCurrentSuggestion] = useState<Suggestion | null>(null);
  const [isBubbleExpanded, setIsBubbleExpanded] = useState(false);
  const [isZapping, setIsZapping] = useState(false);
  const [zapPos, setZapPos] = useState({ x: 0, y: 0 });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isWidgetMode, setIsWidgetMode] = useState(initialWidgetMode);
  
  const particleIdRef = useRef(0);
  const sphereRef = useRef<HTMLDivElement>(null);

  // Sync with prop
  useEffect(() => {
    setState(getVisualState(systemState));
  }, [systemState]);

  // Eye tracking values
  const eyeX = useSpring(0, { stiffness: 250, damping: 20 });
  const eyeY = useSpring(0, { stiffness: 250, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });

      if (sphereRef.current) {
        const rect = sphereRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        const sensitivity = state === 'alert' ? 6 : 10;
        const maxMove = state === 'alert' ? 20 : 15;
        
        const moveX = (deltaX / (distance || 1)) * Math.min(distance / sensitivity, maxMove);
        const moveY = (deltaY / (distance || 1)) * Math.min(distance / sensitivity, maxMove);
        
        eyeX.set(moveX);
        eyeY.set(moveY);
      }

      // Particles effect (Diamantina)
      if (Math.random() > 0.85) {
        const id = particleIdRef.current++;
        const newParticle: Particle = {
          id,
          x: e.clientX,
          y: e.clientY,
          color: getStateColor(state)
        };
        setParticles(prev => [...prev.slice(-20), newParticle]);
        setTimeout(() => {
          setParticles(prev => prev.filter(p => p.id !== id));
        }, 1200);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [state]);

  // Random speech bubbles
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.6 && !isBubbleExpanded && !isChatOpen) {
        const suggestion = SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)];
        setCurrentSuggestion(suggestion);
        setTimeout(() => {
          if (!isBubbleExpanded) setCurrentSuggestion(null);
        }, 6000);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [isBubbleExpanded, isChatOpen]);

  const getStateColor = (s: SasitoState) => {
    switch (s) {
      case 'calm': return '#00ff00';
      case 'attention': return '#ffff00';
      case 'alert': return '#ff0000';
      case 'processing': return '#ffcc00';
      case 'rebooting': return '#00ffff';
      default: return '#00ff00';
    }
  };

  const get3DGradient = (s: SasitoState) => {
    const color = getStateColor(s);
    if (s === 'processing') {
      return `radial-gradient(circle at 30% 30%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.4) 10%, transparent 40%),
              repeating-conic-gradient(from 0deg at 50% 50%, #ff0000 0deg, #ffcc00 20deg, #00ff00 40deg, #00ffff 60deg, #ff0000 80deg),
              radial-gradient(circle at 70% 70%, rgba(0,0,0,0.8) 0%, transparent 100%),
              ${color}33`;
    }
    return `radial-gradient(circle at 30% 30%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.4) 10%, transparent 40%),
            radial-gradient(circle at 50% 50%, ${color} 0%, ${color}CC 40%, transparent 85%),
            radial-gradient(circle at 70% 70%, rgba(0,0,0,0.8) 0%, transparent 100%),
            ${color}33`;
  };

  const handleZap = (e: React.MouseEvent) => {
    setIsZapping(true);
    setZapPos({ x: e.clientX, y: e.clientY });
    setTimeout(() => setIsZapping(false), 200);
  };

  return (
    <div className={`relative ${className} ${isZapping ? 'brightness-125' : ''}`}>
      {/* Fractal Noise Filter */}
      <svg className="hidden">
        <filter id="fractalNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" result="noise" />
          <feColorMatrix type="saturate" values="2" />
          <feComposite operator="in" in2="SourceGraphic" />
        </filter>
      </svg>

      {/* Particles Layer */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0], y: p.y + 30 }}
            style={{
              position: 'fixed',
              left: p.x,
              top: p.y,
              width: '3px',
              height: '3px',
              backgroundColor: 'white',
              borderRadius: '50%',
              pointerEvents: 'none',
              zIndex: 9999,
              boxShadow: `0 0 8px white, 0 0 16px ${p.color}`,
            }}
          />
        ))}
      </AnimatePresence>

      <div className={`flex flex-col items-end gap-4 ${isWidgetMode ? 'scale-75 origin-bottom-right' : ''}`}>
        
        {/* Chat Interface */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="w-[300px] bg-slate-950/90 border border-white/20 backdrop-blur-2xl rounded-[2rem] p-5 shadow-2xl mb-4"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-[9px] font-mono tracking-widest text-white/40 uppercase">Sasin Interface v4.0</span>
                <button onClick={() => setIsChatOpen(false)} className="text-white/30 hover:text-white"><X size={14}/></button>
              </div>
              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl text-xs text-white/80 mb-4">
                ¿En qué puedo ayudarte hoy?
              </div>
              <div className="flex gap-2">
                <input 
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                  placeholder="Mensaje..."
                />
                <button className="p-2 bg-white/10 rounded-xl hover:bg-white/20"><Send size={14}/></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Speech Bubble */}
        <AnimatePresence>
          {currentSuggestion && !isChatOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setIsBubbleExpanded(!isBubbleExpanded)}
              className="bg-white text-slate-900 p-4 rounded-[1.5rem] rounded-br-none shadow-xl cursor-pointer max-w-[240px] mb-2"
            >
              <p className="text-[11px] font-bold leading-tight">{currentSuggestion.text}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Sphere (Sasito Core) */}
        <motion.div
          ref={sphereRef}
          onClick={() => setIsChatOpen(!isChatOpen)}
          animate={{
            y: [0, -10, 0],
            rotate: state === 'processing' ? 360 : 0,
            scale: state === 'attention' ? 1.05 : 1,
            background: get3DGradient(state),
            boxShadow: `inset -15px -15px 40px rgba(0,0,0,0.6), 
                        inset 15px 15px 40px rgba(255,255,255,0.2),
                        0 0 80px ${state === 'processing' ? 'rgba(255,255,255,0.3)' : getStateColor(state) + '55'},
                        0 0 30px ${state === 'processing' ? 'rgba(255,255,255,0.5)' : getStateColor(state) + '77'}`,
          }}
          transition={{
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: state === 'processing' ? 10 : 0, repeat: Infinity, ease: "linear" },
            scale: { duration: 0.4 },
            duration: 0.8
          }}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center relative overflow-hidden backdrop-blur-md ring-1 ring-white/10 cursor-pointer z-50 shadow-2xl"
          style={{ filter: state === 'processing' ? 'url(#fractalNoise)' : 'none' }}
        >
          {/* Eyes */}
          <motion.div style={{ x: eyeX, y: eyeY }} className="flex gap-4 -mt-2">
            {[0, 1].map((i) => (
              <motion.div
                key={i}
                animate={{ 
                  height: state === 'attention' ? 24 : 18,
                  scaleY: [1, 1, 0, 1, 1] 
                }}
                transition={{
                  scaleY: { duration: 4, repeat: Infinity, times: [0, 0.8, 0.85, 0.9, 1] }
                }}
                className="w-3 bg-white rounded-full shadow-[0_0_15px_white]"
              />
            ))}
          </motion.div>

          {/* Glare Reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-30 pointer-events-none" />

          {/* Electric Zaps */}
          {(state === 'processing' || state === 'alert') && (
            <div className="absolute inset-0 z-20 pointer-events-none">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scaleX: [0, 1.5, 0],
                    rotate: Math.random() * 360,
                    x: Math.random() * 40 - 20,
                    y: Math.random() * 40 - 20
                  }}
                  transition={{ duration: 0.15, repeat: Infinity, repeatDelay: Math.random() * 0.5 }}
                  className="absolute top-1/2 left-1/2 w-16 h-[1px] bg-white shadow-[0_0_10px_cyan]"
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Visual Zap Effect */}
      <AnimatePresence>
        {isZapping && (
          <motion.div
            initial={{ opacity: 1, scale: 0.5 }}
            animate={{ opacity: 0, scale: 3 }}
            className="fixed z-[999] pointer-events-none text-[10px] font-black text-white italic tracking-tighter"
            style={{ left: zapPos.x, top: zapPos.y, transform: 'translate(-50%, -50%)' }}
          >
            ⚡ ZAP! ⚡
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SasitoCopilot;
