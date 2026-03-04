import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface InteractiveBrandOrbProps {
  size?: number; // Tamaño en píxeles (default: 110)
  glowColor?: string; // Color base para el resplandor
  showRings?: boolean; // Mostrar anillos de plasma
}

export const InteractiveBrandOrb: React.FC<InteractiveBrandOrbProps> = ({
  size = 110,
  glowColor = "rgba(14, 165, 233, 1)", // Cyan (Sky-500)
  showRings = true,
}) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [dynamicColor, setDynamicColor] = useState(glowColor);

  // 1. Seguimiento del Mouse (Relativo -1 a 1)
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  // 2. Ciclo de Colores SASE (Solo si el color base es el default)
  useEffect(() => {
    if (glowColor !== "rgba(14, 165, 233, 1)") return;

    const colors = [
      "rgba(14, 165, 233, 1)", // Cyan
      "rgba(0, 200, 83, 1)", // Verde
      "rgba(255, 152, 0, 1)", // Naranja
      "rgba(211, 47, 47, 1)", // Rojo
      "rgba(59, 130, 246, 1)", // Azul
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % colors.length;
      setDynamicColor(colors[i]);
    }, 5000);
    return () => clearInterval(interval);
  }, [glowColor]);

  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{ width: size, height: size }}
    >
      {/* Esfera 3D con Gradiente Procedural */}
      <div
        className="relative w-full h-full rounded-full flex justify-center items-center overflow-hidden transition-all duration-[1500ms]"
        style={{
          background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.85) 0%, ${dynamicColor} 40%, rgba(15,23,42,1) 100%)`,
          boxShadow: `0 0 60px 10px ${dynamicColor.replace("1)", "0.3)")}, inset -15px -15px 30px rgba(0,0,0,0.8), inset 15px 15px 25px rgba(255,255,255,0.4)`,
          animation: "orb-breathe 4s ease-in-out infinite",
        }}
      >
        {/* Anillos de Plasma */}
        {showRings && (
          <>
            <div className="absolute inset-[-5px] rounded-full border-[3px] border-transparent border-t-[3px] border-white/40 animate-spin-fast"></div>
            <div className="absolute inset-[-10px] rounded-full border-[3px] border-transparent border-r-[3px] border-white/20 animate-spin-slow"></div>
            <div className="absolute inset-[-15px] rounded-full border-[2px] border-transparent border-b-[2px] border-white/10 animate-spin-slower"></div>
          </>
        )}

        {/* Ojos Interactivos que siguen al mouse */}
        <div
          className="flex gap-4 sm:gap-6 transition-transform duration-200 ease-out"
          style={{
            transform: `translate(${mousePos.x * 12}px, ${mousePos.y * 12}px)`,
          }}
        >
          <div className="w-1 sm:w-1.5 h-3 sm:h-4.5 bg-white rounded-full shadow-[0_0_12px_white] animate-orb-blink"></div>
          <div className="w-1 sm:w-1.5 h-3 sm:h-4.5 bg-white rounded-full shadow-[0_0_12px_white] animate-orb-blink-delayed"></div>
        </div>
      </div>

      <style>{`
        @keyframes orb-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        @keyframes orb-blink {
          0%, 94%, 100% { transform: scaleY(1); opacity: 1; }
          97% { transform: scaleY(0.1); opacity: 0.5; }
        }
        .animate-orb-blink { animation: orb-blink 4s infinite 1s; }
        .animate-orb-blink-delayed { animation: orb-blink 4s infinite 1.3s; }
        
        .animate-spin-fast { animation: spin 3s linear infinite; }
        .animate-spin-slow { animation: spin 4s linear infinite reverse; }
        .animate-spin-slower { animation: spin 6s linear infinite; }
        
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
