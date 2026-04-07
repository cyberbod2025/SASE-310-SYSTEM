import React, { useState, useEffect, useRef } from 'react';
import { motion, useSpring, AnimatePresence } from 'motion/react';
import { Send, Mic, MicOff, X } from 'lucide-react';

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

const SUGGESTIONS: Suggestion[] = [
  { text: "¡Hola! Soy Sasito, tu asistente de SASE 310.", state: 'calm' },
  { text: "Recuerda revisar tus notificaciones pendientes.", state: 'attention', actionLabel: "Ver ahora" },
  { text: "Estoy procesando los datos de la red...", state: 'processing' },
  { text: "¡Alerta! Se detectó una anomalía en el sistema.", state: 'alert', actionLabel: "Investigar" },
];

interface SasitoProps {
  minimal?: boolean; // If true, no chat, no mic, no suggestions (for Login)
  isWidgetMode?: boolean;
}

export const Sasito: React.FC<SasitoProps> = ({ minimal = false, isWidgetMode = false }) => {
  const [state, setState] = useState<SasitoState>('calm');
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

  const getStateColor = (s: SasitoState) => {
    switch (s) {
      case 'calm': return '#00ff00';
      case 'attention': return '#ffff00';
      case 'alert': return '#ff0000';
      case 'processing': return '#ffffff'; // Base white for multicolor
      case 'rebooting': return '#00ffff';
      default: return '#00ff00';
    }
  };

  const get3DGradient = (s: SasitoState) => {
    const color = getStateColor(s);
    if (s === 'processing') {
      return `radial-gradient(circle at 30% 30%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.4) 10%, transparent 40%),
              repeating-conic-gradient(from 0deg at 50% 50%, #ff0000 0deg, #ff8800 10deg, #ffff00 20deg, #00ff00 30deg, #00ffff 40deg, #0000ff 50deg, #ff00ff 60deg, #ff0000 70deg),
              radial-gradient(circle at 70% 70%, rgba(0,0,0,0.8) 0%, transparent 100%),
              rgba(255,255,255,0.2)`;
    }
    return `radial-gradient(circle at 30% 30%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.4) 10%, transparent 40%),
            radial-gradient(circle at 50% 50%, ${color} 0%, ${color}CC 40%, transparent 85%),
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
        const sensitivity = state === 'alert' ? 6 : 10;
        const maxMove = state === 'alert' ? 20 : 15;
        eyeX.set((deltaX / (distance || 1)) * Math.min(distance / sensitivity, maxMove));
        eyeY.set((deltaY / (distance || 1)) * Math.min(distance / sensitivity, maxMove));
      }

      if (Math.random() > 0.8 && !minimal) {
        const id = particleIdRef.current++;
        const newParticle: Particle = { id, x: e.clientX, y: e.clientY, color: getStateColor(state) };
        setParticles(prev => [...prev.slice(-20), newParticle]);
        setTimeout(() => setParticles(prev => prev.filter(p => p.id !== id)), 1000);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [state, minimal]);

  useEffect(() => {
    if (minimal) return;
    const interval = setInterval(() => {
      if (Math.random() > 0.6 && !isBubbleExpanded && !isChatOpen) {
        const suggestion = SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)];
        setCurrentSuggestion(suggestion);
        if (suggestion.state) setState(suggestion.state);
        setTimeout(() => setCurrentSuggestion(null), 6000);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [minimal, isBubbleExpanded, isChatOpen]);

  const handleZap = (e: React.MouseEvent) => {
    if (minimal) return;
    setIsZapping(true);
    setZapPos({ x: e.clientX, y: e.clientY });
    setTimeout(() => setIsZapping(false), 200);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    setState('processing');
    setChatInput('');
    setTimeout(() => {
      setState('calm');
      setCurrentSuggestion({ text: "Entendido. He procesado tu solicitud para SASE 310.", state: 'calm' });
    }, 2500);
  };

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
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Escribe aquí..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                />
                <button onClick={() => setIsListening(!isListening)} className={`p-2 rounded-xl ${isListening ? 'bg-red-500' : 'bg-white/10'}`}>
                  {isListening ? <Mic size={16} /> : <MicOff size={16} />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {currentSuggestion && !isChatOpen && !minimal && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white text-black p-4 rounded-2xl rounded-br-none shadow-xl max-w-[240px] text-xs font-medium cursor-pointer"
              onClick={() => setIsChatOpen(true)}
            >
              {currentSuggestion.text}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative flex items-center justify-center">
          <motion.div
            ref={sphereRef}
            onClick={() => !minimal && setIsChatOpen(!isChatOpen)}
            animate={{
              y: [0, -10, 0],
              rotate: state === 'processing' ? 360 : 0,
              filter: state === 'processing' 
                ? ['saturate(1.5) hue-rotate(0deg)', 'saturate(1.5) hue-rotate(360deg)'] 
                : 'saturate(1.5) hue-rotate(0deg)',
              scale: state === 'attention' ? 1.1 : 1,
              background: get3DGradient(state),
              boxShadow: `inset -10px -10px 40px rgba(0,0,0,0.5), 
                          0 0 80px ${state === 'processing' ? 'rgba(255,255,255,0.3)' : getStateColor(state) + '55'}`,
            }}
            transition={{
              y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 8, repeat: Infinity, ease: "linear" },
              filter: { duration: 4, repeat: Infinity, ease: "linear" },
              background: { duration: 0.5 }
            }}
            className={`w-[150px] h-[150px] rounded-full flex items-center justify-center relative overflow-hidden backdrop-blur-sm z-10 ring-1 ring-white/10 ${!minimal ? 'cursor-pointer' : ''}`}
            style={{ filter: state === 'processing' ? 'url(#fractalNoise)' : 'none' }}
          >
            <motion.div style={{ x: eyeX, y: eyeY }} className="flex gap-6 -mt-4">
              {[0, 1].map((i) => (
                <motion.div
                  key={i}
                  animate={{ height: state === 'rebooting' ? 2 : 30, scaleY: [1, 1, 0, 1, 1] }}
                  transition={{ scaleY: { duration: 4, repeat: Infinity, times: [0, 0.8, 0.85, 0.9, 1] } }}
                  className="w-5 bg-white rounded-full shadow-[0_0_20px_white]"
                />
              ))}
            </motion.div>
          </motion.div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[...Array(2)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.1, 0.3, 0.1],
                  rotate: i === 0 ? 360 : -360,
                  background: state === 'processing' 
                    ? `conic-gradient(from ${i * 180}deg, #ff0000, #00ff00, #0000ff, #ff0000)`
                    : `radial-gradient(circle, ${getStateColor(state)}22 0%, transparent 70%)`
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute w-[200px] h-[200px] rounded-full border border-white/5 blur-sm"
              />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  </>
);
};
