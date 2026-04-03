import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, useSpring } from "motion/react";
import type { SystemState } from "../types/systemState";

interface SaseSplineOrbProps {
  state: SystemState;
  className?: string;
  isInteracting?: boolean;
}

/**
 * 🤖 SaseSplineOrb (v5.0 - Institutional Source Core)
 * RECOVERED FROM: sasito-ai-copilot/src/App.tsx
 * Pure CSS/Motion implementation of the official Sasito mascot.
 */

const stateColors: Record<string, string> = {
  normal: '#00ff00',      // Pure Neon Green (Calm)
  warning: '#ffff00',     // Pure Neon Yellow (Attention)
  alert: '#ff0000',       // Pure Neon Red (Alert)
  thinking: '#ff8800',    // Pure Neon Gold/Orange (Processing)
  rebooting: '#00ffff',   // Pure Neon Cyan
};

export const SaseSplineOrb: React.FC<SaseSplineOrbProps> = ({ state, className, isInteracting }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isZapping, setIsZapping] = useState(false);
  const sphereRef = useRef<HTMLDivElement>(null);

  // Map institutional SystemState to SasitoState
  const sasitoState = state === 'thinking' ? 'processing' : state;
  const color = stateColors[state] || stateColors.normal;

  // Eye tracking values (Standardized stiffness/damping from source)
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
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [state, eyeX, eyeY]);

  // Combined 3D Gradient (Replicated from source)
  const get3DGradient = (s: string) => {
    const color = stateColors[s] || stateColors.normal;
    if (s === 'thinking' || s === 'processing') {
      return `radial-gradient(circle at 30% 30%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.4) 10%, transparent 40%),
              repeating-conic-gradient(from 0deg at 50% 50%, #ff0000 0deg, #ff8800 10deg, #ffff00 20deg, #00ff00 30deg, #00ffff 40deg, #0000ff 50deg, #ff00ff 60deg, #ff0000 70deg),
              radial-gradient(circle at 70% 70%, rgba(0,0,0,0.8) 0%, transparent 100%),
              ${color}33`;
    }
    return `radial-gradient(circle at 30% 30%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.4) 10%, transparent 40%),
            radial-gradient(circle at 50% 50%, ${color} 0%, ${color}CC 40%, transparent 85%),
            radial-gradient(circle at 70% 70%, rgba(0,0,0,0.8) 0%, transparent 100%),
            linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.2) 100%),
            ${color}33`;
  };

  return (
    <div className={`relative flex items-center justify-center pointer-events-none select-none ${className || "w-64 h-64"}`}>
      {/* SVG Filters for Fractal Effects */}
      <svg className="hidden">
        <filter id="fractalNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" result="noise" />
          <feColorMatrix type="saturate" values="2" />
          <feComposite operator="in" in2="SourceGraphic" />
        </filter>
      </svg>

      {/* Main Container */}
      <motion.div
        ref={sphereRef}
        animate={{
          y: [0, -15, 0],
          rotate: state === 'thinking' ? 360 : 0,
          scale: state === 'warning' ? 1.1 : (state === 'thinking' ? 1.05 : 1),
          boxShadow: [
            `0 0 40px ${color}55`,
            `0 0 80px ${color}33`,
            `0 0 40px ${color}55`
          ]
        }}
        transition={{
          y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: state === 'thinking' ? 10 : 0, repeat: Infinity, ease: "linear" },
          duration: 3, repeat: Infinity
        }}
        className="relative w-full h-full rounded-full flex items-center justify-center overflow-hidden backdrop-blur-md z-10 ring-1 ring-white/20"
        style={{
          background: get3DGradient(state),
          filter: state === 'thinking' ? 'url(#fractalNoise)' : 'none'
        }}
      >
        {/* Internal Circuits (Subtle) */}
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
          </svg>
        </div>

        {/* Energy Sparks (Processing & Alert) */}
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
                className="absolute top-1/2 left-1/2 w-24 h-[1px] bg-white shadow-[0_0_12px_white,0_0_6px_cyan]"
              />
            ))}
          </div>
        )}

        {/* OFFICIAL EYES (CSS Bars from Source) */}
        <motion.div 
          style={{ x: eyeX, y: eyeY }}
          className="flex gap-8 -mt-6"
        >
          {[0, 1].map((i) => (
            <div key={i} className="relative">
              <motion.div
                animate={{
                  height: state === 'rebooting' ? 2 : (state === 'warning' ? 48 : 36),
                  scaleY: [1, 1, 0, 1, 1], // Natural blink
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
                className="w-5 bg-white rounded-full shadow-[0_0_25px_rgba(255,255,255,1),0_0_40px_rgba(255,255,255,0.4)]"
              />
            </div>
          ))}
        </motion.div>

        {/* Surface Reflection */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-40" />
      </motion.div>

      {/* Holographic Aura & Geometric Energy Field (Aura from Source) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.25 + i * 0.1, 1],
              opacity: [0.1, 0.3 - i * 0.05, 0.1],
              rotate: i % 2 === 0 ? 360 : -360
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute w-[140%] h-[140%] rounded-full border border-white/10 blur-md"
            style={{ 
              background: state === 'thinking' 
                ? `conic-gradient(from ${i * 90}deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)`
                : `radial-gradient(circle, ${color}22 0%, transparent 70%)`
            }}
          />
        ))}

        {/* Geometric Hexagon Grid */}
        <motion.div
          animate={{ rotate: 360, opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute w-[180%] h-[180%] opacity-10"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path
              d="M 50,5 L 90,25 L 90,75 L 50,95 L 10,75 L 10,25 Z"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
          </svg>
        </motion.div>
      </div>
    </div>
  );
};
