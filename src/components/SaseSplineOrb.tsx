import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SystemState } from "../types/systemState";

interface SaseSplineOrbProps {
  state: SystemState;
  className?: string;
  isInteracting?: boolean;
}

// SASE Official Color Palette (Semaforo Logic)
const stateColors: Record<SystemState, string> = {
  normal: "#3b82f6",    // Blue (Neural Link / Calm) - Switched from yellow to follow new institutional blue
  warning: "#f59e0b",   // Amber (Observado / Patron Detectado)
  alert: "#ef4444",     // Red (En Análisis / Intervención)
  thinking: "#8b5cf6",  // Purple/Blue (Processing)
};

/**
 * SaseSplineOrb (v4.5 - CSS/Motion Standard)
 * REFACTOR: Removed Spline dependency for performance and stability.
 * Uses pure CSS gradients and Framer Motion for the neural effect.
 */
export const SaseSplineOrb: React.FC<SaseSplineOrbProps> = ({ state, className, isInteracting }) => {
  const color = stateColors[state] || stateColors.normal;
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);
  const blinkTimeout = useRef<number | undefined>(undefined);
  const blinkResetTimeout = useRef<number | undefined>(undefined);

  // Animación de parpadeo aleatoria
  useEffect(() => {
    const scheduleBlink = () => {
      const delay = 3000 + Math.random() * 5000;
      blinkTimeout.current = window.setTimeout(() => {
        setBlink(true);
        blinkResetTimeout.current = window.setTimeout(() => {
          setBlink(false);
          scheduleBlink();
        }, 150);
      }, delay);
    };
    scheduleBlink();
    return () => {
      if (blinkTimeout.current) clearTimeout(blinkTimeout.current);
      if (blinkResetTimeout.current) clearTimeout(blinkResetTimeout.current);
    };
  }, []);

  // Seguimiento del Mouse para los Ojos de IA-SASE
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  const eyeOffsetX = Math.max(-8, Math.min(8, mousePos.x * 12));
  const eyeOffsetY = Math.max(-4, Math.min(4, mousePos.y * 8));

  return (
    <div className={`relative flex items-center justify-center overflow-hidden rounded-full transition-all duration-700 ${className || "w-64 h-64"}`}>
      
      {/* 1. Nucleus Background (CSS Alternative to Spline) */}
      <motion.div
        animate={{
          backgroundColor: `${color}11`,
          boxShadow: `inset 0 0 100px ${color}33, 0 0 30px ${state === 'thinking' ? '#8b5cf6' : color}44`,
        }}
        className="absolute inset-0 rounded-full"
      />

      {/* 2. Fractal Energy / Plasma (Motion) */}
      <motion.div
        animate={{
          scale: [1, 1.2, 0.9, 1.1, 1],
          rotate: [0, 90, 180, 270, 360],
          opacity: state === 'thinking' ? [0.4, 0.7, 0.4] : [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[-20%] blur-[40px] rounded-full opacity-30"
        style={{
          background: `conic-gradient(from 0deg, ${color}, transparent, ${color}cc, transparent)`
        }}
      />

      {/* 3. Detailed Sasin Neural Face Layers */}
      <div className="relative w-full h-full z-20 flex items-center justify-center">
        <div className="relative w-1/2 h-1/2 flex items-center justify-center">
          <div className="flex gap-[25%] items-center w-full justify-center">
            
            {/* Left Eye */}
            <div className="relative flex items-center justify-center" style={{ width: "22%", aspectRatio: "1" }}>
              <div className="absolute inset-0 rounded-full bg-slate-900 border border-white/10" 
                style={{ background: `radial-gradient(circle, ${color}99 0%, #0f172a 100%)` }} />
              <motion.div
                animate={{ 
                  x: eyeOffsetX * 0.4, 
                  y: blink ? 0 : eyeOffsetY * 0.4, 
                  scaleY: blink ? 0.05 : 1 
                }}
                transition={{ type: "spring", stiffness: 250, damping: 25 }}
                className="absolute rounded-full bg-white shadow-[0_0_10px_white]"
                style={{ width: "40%", height: "40%" }}
              />
            </div>

            {/* Right Eye */}
            <div className="relative flex items-center justify-center" style={{ width: "22%", aspectRatio: "1" }}>
              <div className="absolute inset-0 rounded-full bg-slate-900 border border-white/10" 
                style={{ background: `radial-gradient(circle, ${color}99 0%, #0f172a 100%)` }} />
              <motion.div
                animate={{ 
                  x: eyeOffsetX * 0.4, 
                  y: blink ? 0 : eyeOffsetY * 0.4, 
                  scaleY: blink ? 0.05 : 1 
                }}
                transition={{ type: "spring", stiffness: 250, damping: 25 }}
                className="absolute rounded-full bg-white shadow-[0_0_10px_white]"
                style={{ width: "40%", height: "40%" }}
              />
            </div>
          </div>

          {/* Mouth / Pulse Line */}
          <motion.div
            animate={{
              width: state === 'thinking' ? ["10%", "30%", "10%"] : "20%",
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute h-[1px] rounded-full"
            style={{
              bottom: "35%",
              background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
              boxShadow: `0 0 8px ${color}aa`,
            }}
          />
        </div>
      </div>

      {/* 4. HUD / Tactical Overlay */}
      <svg className="absolute inset-0 z-30 pointer-events-none opacity-30" viewBox="0 0 200 200">
        <motion.circle 
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          style={{ originX: "100px", originY: "100px" }}
          cx="100" cy="100" r="95" 
          fill="none" stroke={color} strokeWidth="0.3" strokeDasharray="2 10" 
        />
        <circle cx="100" cy="100" r="88" fill="none" stroke={color} strokeWidth="0.5" strokeDasharray="30 170" opacity="0.4" />
      </svg>
    </div>
  );
};
