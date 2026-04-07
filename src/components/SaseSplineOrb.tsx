import React, { Suspense, useState, useEffect } from "react";
import Spline from "@splinetool/react-spline";
import { motion, AnimatePresence } from "framer-motion";
import type { SystemState } from "../types/systemState";

interface SaseSplineOrbProps {
  state: SystemState;
  className?: string;
  isInteracting?: boolean;
}

// SASE Official Color Palette (Semaforo Logic)
const stateColors: Record<SystemState, string> = {
  normal: "#fbbf24",    // Gold (Estable / Dorado Institucional)
  warning: "#f59e0b",   // Amber (Observado / Patron Detectado)
  alert: "#ef4444",     // Red (En Análisis / Intervención)
  thinking: "#3b82f6",  // Blue (Processing / Neural Link)
};

export const SaseSplineOrb: React.FC<SaseSplineOrbProps> = ({ state, className, isInteracting }) => {
  const color = stateColors[state] || stateColors.normal;
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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

  return (
    <div className={`relative flex items-center justify-center overflow-hidden rounded-full transition-all duration-700 ${className || "w-64 h-64"}`}>
      
      {/* 1. Capa de Atmosfera / Resplandor de Conciencia */}
      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            scale: isInteracting ? 1.1 : 1,
            filter: isInteracting ? "blur(100px)" : "blur(80px)"
          }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 1.2, ease: "circOut" }}
          className="absolute inset-0 rounded-full"
          style={{ 
            background: `radial-gradient(circle, ${color}44 0%, transparent 70%)` 
          }}
        />
      </AnimatePresence>

      {/* 2. Tactical HUD Overlay - Interfaz Institucional */}
      <div className="absolute inset-0 z-30 pointer-events-none opacity-50">
        <svg className="w-full h-full" viewBox="0 0 200 200">
          <defs>
            <filter id="glow-sase">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Anillos de Datos Circundantes */}
          <motion.circle 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{ originX: "100px", originY: "100px" }}
            cx="100" cy="100" r="95" 
            fill="none" stroke={color} strokeWidth="0.5" strokeDasharray="1 15" 
          />
          
          <circle cx="100" cy="100" r="90" fill="none" stroke={color} strokeWidth="1" strokeDasharray="30 170" opacity="0.2" filter="url(#glow-sase)" />
        </svg>
      </div>

      {/* 3. Contenedor de la Cara Neural (Spline) */}
      <div className="relative w-[92%] h-[92%] z-10 group bg-transparent">
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center bg-slate-900/20 rounded-full animate-pulse">
            <div className="w-8 h-8 border-2 border-white/5 border-t-white/40 rounded-full animate-spin" />
          </div>
        }>
          <Spline 
            scene="/sase-orb.splinecode"
            className={`w-full h-full transform scale-125 transition-all duration-1000 ${isInteracting ? 'brightness-125' : 'brightness-100'}`}
          />
        </Suspense>

        {/* 4. ELIMINADO: OJOS INTERACTIVOS ESTABAN AQUÍ */}

        {/* 5. Capas de Color Adaptativas (Inundan el modelo 3D) */}
        {/* Capa 1: Tinte Base */}
        <motion.div
          animate={{ 
            backgroundColor: `${color}33`,
            boxShadow: `inset 0 0 100px ${color}44, 0 0 60px ${color}33`
          }}
          transition={{ duration: 1 }}
          style={{ mixBlendMode: "overlay" }}
          className="absolute inset-0 pointer-events-none rounded-full border border-white/[0.08]"
        />
        
        {/* Capa 2: Brillo Central / Saturación */}
        <motion.div
          animate={{ 
            background: `radial-gradient(circle, ${color}66 0%, transparent 60%)`,
          }}
          transition={{ duration: 1 }}
          style={{ mixBlendMode: "screen" }}
          className="absolute inset-0 pointer-events-none rounded-full opacity-60"
        />

        {/* Línea de Escaneo Horizontal (Latido Vital) */}
        <motion.div 
          animate={{ 
            top: ["10%", "90%", "10%"], 
            opacity: [0, 0.4, 0],
            backgroundColor: color
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[20%] right-[20%] h-[1px] z-50 blur-[2px]"
        />
      </div>

      <style>{`
        .spline-watermark { display: none !important; }
      `}</style>
    </div>
  );
};
