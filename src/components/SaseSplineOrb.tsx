import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useSpring } from "framer-motion";
import type { SystemState } from "../types/systemState";

interface SaseSplineOrbProps {
  state: SystemState;
  className?: string;
  isInteracting?: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
}

export const SaseSplineOrb: React.FC<SaseSplineOrbProps> = ({ state, className }) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleIdRef = useRef(0);
  const sphereRef = useRef<HTMLDivElement>(null);

  // Map institutional states to official copilot colors
  const getStateColor = (s: string) => {
    switch (s) {
      case 'normal': return '#8b5cf6';    // Violeta Eléctrico
      case 'warning': return '#f59e0b';   // Ámbar Alerta
      case 'alert': return '#f43f5e';     // Magenta Acción
      case 'thinking': return '#d946ef';  // Fucsia Neural
      case 'rebooting': return '#06b6d4'; // Cian Cuántico
      default: return '#8b5cf6';
    }
  };

  const color = getStateColor(state);

  // Eye tracking values (Exact match from source)
  const eyeX = useSpring(0, { stiffness: 250, damping: 20 });
  const eyeY = useSpring(0, { stiffness: 250, damping: 20 });

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
        
        const moveX = (deltaX / (distance || 1)) * Math.min(distance / sensitivity, maxMove);
        const moveY = (deltaY / (distance || 1)) * Math.min(distance / sensitivity, maxMove);
        
        eyeX.set(moveX);
        eyeY.set(moveY);

        // --- NEW: Sasito Particle Sparks Generation ---
        if (Math.random() > 0.85) {
          const id = particleIdRef.current++;
          const newParticle: Particle = { 
            id, 
            x: e.clientX, 
            y: e.clientY, 
            color: getStateColor(state) 
          };
          setParticles(prev => [...prev.slice(-15), newParticle]);
          setTimeout(() => setParticles(prev => prev.filter(p => p.id !== id)), 1000);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [state, eyeX, eyeY]);

  // Exact 3D Gradients from source - ENHANCED for higher fidelity
  const get3DGradient = (s: string) => {
    const c = getStateColor(s);
    if (s === 'thinking') {
      return `radial-gradient(circle at 30% 30%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.5) 15%, transparent 45%),
              repeating-conic-gradient(from 0deg at 50% 50%, #8b5cf6 0deg, #d946ef 10deg, #06b6d4 20deg, #8b5cf6 30deg),
              radial-gradient(circle at 70% 70%, rgba(0,0,0,0.9) 0%, transparent 100%),
              ${c}44`;
    }
    return `radial-gradient(circle at 30% 30%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.8) 15%, transparent 45%),
            radial-gradient(circle at 50% 50%, ${c} 0%, ${c}EE 40%, rgba(10,13,23,0.7) 90%, transparent 100%),
            radial-gradient(circle at 75% 75%, rgba(0,0,0,0.9) 0%, transparent 100%),
            linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 40%, rgba(0,0,0,0.7) 100%),
            ${c}25`;
  };

  return (
    <>
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], y: p.y + 20 }}
            style={{
              position: 'fixed', left: p.x, top: p.y, width: '2px', height: '2px',
              backgroundColor: 'white', borderRadius: '50%', pointerEvents: 'none', zIndex: 9999,
              boxShadow: `0 0 10px ${p.color}`,
            }}
          />
        ))}
      </AnimatePresence>

      <div className={`relative flex items-center justify-center pointer-events-none ${className || "w-[180px] h-[180px]"}`}>
      <svg className="hidden">
        <filter id="fractalNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise" />
          <feColorMatrix type="saturate" values="1.5" />
          <feComposite operator="in" in2="SourceGraphic" />
        </filter>
        <filter id="subtleNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="noise" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.05 0" />
          <feComposite operator="in" in2="SourceGraphic" />
        </filter>
      </svg>

      <motion.div
        ref={sphereRef}
        animate={{
          y: [0, -12, 0],
          rotate: state === 'thinking' ? 360 : 0,
          filter: state === 'thinking' 
            ? ['saturate(1.8) hue-rotate(0deg) contrast(1.3)', 'saturate(1.8) hue-rotate(360deg) contrast(1.3)'] 
            : 'saturate(1.4) hue-rotate(0deg) contrast(1.1)',
          scale: state === 'warning' ? 1.08 : (state === 'thinking' ? 1.04 : 1),
          background: get3DGradient(state),
          boxShadow: `inset -25px -25px 50px rgba(0,0,0,0.85), 
                      inset 25px 25px 50px rgba(255,255,255,0.3),
                      0 0 100px ${state === 'thinking' ? 'rgba(217,70,239,0.4)' : color + '77'},
                      0 0 40px ${state === 'thinking' ? 'rgba(217,70,239,0.7)' : color + 'AA'}`,
        }}
        transition={{
          y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: state === 'thinking' ? 12 : 0, repeat: Infinity, ease: "linear" },
          filter: { duration: state === 'thinking' ? 6 : 0, repeat: Infinity, ease: "linear" },
          scale: { duration: 0.4 },
          background: { duration: 1 },
          boxShadow: { duration: 1 }
        }}
        className="w-full h-full rounded-full flex items-center justify-center relative overflow-hidden backdrop-blur-xl z-10 ring-2 ring-white/10"
        style={{
          filter: state === 'thinking' ? 'url(#fractalNoise)' : 'url(#subtleNoise)'
        }}
      >
        {/* Internal Circuits (Verbatim) */}
        <div className="absolute inset-0 opacity-20">
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

        {/* Energy Sparks (Verbatim) */}
        {(state === 'thinking' || state === 'alert') && (
          <div className="absolute inset-0 z-20">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  opacity: [0, 1, 0],
                  scaleX: [0, 1.5, 0],
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
                className="absolute top-1/2 left-1/2 w-24 h-[2px] bg-white shadow-[0_0_20px_white,0_0_10px_cyan]"
              />
            ))}
          </div>
        )}

        {/* EYES (Verbatim Constants from sasito-ai-copilot) */}
        <motion.div 
          style={{ x: eyeX, y: eyeY }}
          className="flex gap-8 -mt-10"
        >
          {[0, 1].map((i) => (
            <div key={i} className="relative">
              <motion.div
                animate={{
                  height: state === 'rebooting' ? 2 : (state === 'warning' ? 48 : 36),
                  scaleY: [1, 1, 0, 1, 1],
                }}
                transition={{
                  scaleY: { 
                    duration: state === 'warning' ? 1.2 : 4,
                    repeat: Infinity, 
                    times: [0, 0.85, 0.88, 0.91, 1],
                    delay: i * 0.1 
                  },
                  height: { duration: 0.3 }
                }}
                className="w-6 bg-white rounded-full shadow-[0_0_30px_rgba(255,255,255,1),0_0_60px_rgba(255,255,255,0.5)]"
              />
            </div>
          ))}
        </motion.div>

        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-40" />
      </motion.div>

      {/* Aura (Verbatim Layers from Source) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.2 + i * 0.1, 1],
              opacity: [0.15, 0.4 - i * 0.05, 0.15],
              rotate: i % 2 === 0 ? 360 : -360,
              boxShadow: `0 0 60px ${state === 'thinking' ? 'rgba(255,255,255,0.5)' : color + '44'}`,
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute w-[240px] h-[240px] rounded-full border border-white/20 blur-md"
            style={{
              background: state === 'thinking' 
                ? `conic-gradient(from ${i * 90}deg, #8b5cf6, #d946ef, #06b6d4, #8b5cf6)`
                : `radial-gradient(circle, ${color}22 0%, transparent 70%)`
            }}
          />
        ))}

        {/* Geometric Hexagon Grid (Verbatim) */}
        <motion.div
          animate={{
            rotate: 360,
            scale: [0.9, 1.1, 0.9],
            opacity: [0.1, 0.4, 0.1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute w-[280px] h-[280px] opacity-20"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path
              d="M 50,5 L 90,25 L 90,75 L 50,95 L 10,75 L 10,25 Z"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
            <path
              d="M 50,5 L 50,95 M 10,25 L 90,75 M 90,25 L 10,75"
              fill="none"
              stroke="white"
              strokeWidth="0.2"
              opacity="0.5"
            />
          </svg>
        </motion.div>
      </div>
    </div>
  </>
);
};
