import React, { Suspense } from "react";
import Spline from "@splinetool/react-spline";
import { motion, AnimatePresence } from "framer-motion";
import type { SystemState } from "../types/systemState";

interface SaseSplineOrbProps {
  state: SystemState;
  className?: string;
}

// SASE Official Color Palette (Semaforo Logic)
const stateColors: Record<SystemState, string> = {
  normal: "#10b981",    // Green (Acompañamiento concluido / Zen)
  warning: "#f59e0b",   // Amber (Observado / Patron Detectado)
  alert: "#ef4444",     // Red (En Análisis / Intervención)
  thinking: "#3b82f6",  // Blue (Processing / Neural Link)
};

export const SaseSplineOrb: React.FC<SaseSplineOrbProps> = ({ state, className }) => {
  const color = stateColors[state];

  return (
    <div className={`relative flex items-center justify-center overflow-hidden rounded-full ${className || "w-64 h-64"}`}>
      {/* Tactical HUD Overlay - Institutional Tech Layer */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <svg className="w-full h-full opacity-40" viewBox="0 0 200 200">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Outer Ring Sectors */}
          <circle cx="100" cy="100" r="98" fill="none" stroke={color} strokeWidth="0.5" strokeDasharray="2 12" />
          <circle cx="100" cy="100" r="92" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="40 160" opacity="0.3" />
          
          {/* Compass Marks */}
          <path d="M100 2 L100 12 M198 100 L188 100 M100 198 L100 188 M2 100 L12 100" stroke={color} strokeWidth="1" filter="url(#glow)" />
          
          {/* Spinning Tech Ring */}
          <motion.path 
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            style={{ originX: "100px", originY: "100px" }}
            d="M50 20 A90 90 0 0 1 150 20" 
            fill="none" 
            stroke={color} 
            strokeWidth="0.8" 
            opacity="0.6" 
          />
        </svg>
      </div>


      {/* Atmospheric Glow */}
      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 1.2, ease: "circOut" }}
          className="absolute inset-0 rounded-full blur-[80px]"
          style={{ 
            background: `radial-gradient(circle, ${color}33 0%, transparent 70%)` 
          }}
        />
      </AnimatePresence>

      {/* 3D Neural Face Container */}
      <div className="relative w-[95%] h-[95%] z-10 group bg-transparent">
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 border-2 border-white/5 border-t-blue-500/60 rounded-full" 
            />
          </div>
        }>
          <Spline 
            // Carga el archivo local que copiamos a public/
            scene="/sase-orb.splinecode"
            className="w-full h-full transform scale-125"
          />
        </Suspense>

        {/* Neural Overlay / Scanning effect */}
        <motion.div
          animate={{ 
            backgroundColor: `${color}33`,
            boxShadow: `inset 0 0 60px ${color}33, 0 0 40px ${color}22`
          }}
          transition={{ duration: 1.2 }}
          style={{ mixBlendMode: "screen" }}
          className="absolute inset-0 pointer-events-none rounded-full border border-white/[0.03]"
        />

        <motion.div
          animate={{ backgroundColor: `${color}22` }}
          transition={{ duration: 1.2 }}
          style={{ mixBlendMode: "color" }}
          className="absolute inset-0 pointer-events-none rounded-full"
        />
        
        {/* Horizontal Pulse Line */}
        <motion.div 
          animate={{ top: ["10%", "90%", "10%"], opacity: [0, 0.3, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[15%] right-[15%] h-[1px] bg-white z-30 blur-[1px]"
        />
      </div>


      <style>{`
        .spline-watermark { display: none !important; }
      `}</style>
    </div>
  );
};
