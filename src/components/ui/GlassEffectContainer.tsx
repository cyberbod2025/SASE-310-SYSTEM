import React from "react";
import { motion } from "framer-motion";

interface GlassEffectContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: "nebula" | "plasma" | "deep-space";
  withRefraction?: boolean;
}

/**
 * 🎨 GlassEffectContainer (SASE Premium 2026)
 * Optimizador de capas de desenfoque y profundidad para interfaces Liquid Glass.
 * Utiliza aceleración por hardware (GPU) para mantener 60fps constantes.
 */
export const GlassEffectContainer: React.FC<GlassEffectContainerProps> = ({
  children,
  className = "",
  variant = "nebula",
  withRefraction = false,
}) => {
  const gradientStyles: Record<string, string> = {
    nebula: "from-blue-600/10 via-purple-600/5 to-transparent",
    plasma: "from-emerald-600/10 via-teal-600/5 to-transparent",
    "deep-space": "from-slate-900/40 via-blue-900/10 to-[#05070a]",
  };

  return (
    <div 
      className={`relative w-full h-full min-h-screen overflow-hidden ${className}`}
      style={{ transform: "translateZ(0)" }} // Force GPU Acceleration
    >
      {/* 🚀 Capa de Refracción Líquida (Shader Simulado) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div 
          className={`absolute -inset-[10%] opacity-40 blur-[80px] bg-gradient-to-tr ${gradientStyles[variant]} animate-float-slow`}
        />
        
        {withRefraction && (
          <svg className="hidden">
            <filter id="liquid-refraction">
              <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" result="warp" />
              <feDisplacementMap xChannelSelector="R" yChannelSelector="G" scale="25" in="SourceGraphic" in2="warp" />
            </filter>
          </svg>
        )}
      </div>

      {/* Grid Táctico de fondo */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none hud-grid-bg" />

      {/* Contenido principal */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>

      {/* Resplandor periférico (Vignette) */}
      <div className="absolute inset-0 z-20 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.6)]" />
      
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
          50% { transform: translate(5%, 5%) scale(1.1) rotate(5deg); }
        }
        .animate-float-slow {
          animation: float-slow 20s ease-in-out infinite alternate;
        }
      `}</style>
    </div>
  );
};
