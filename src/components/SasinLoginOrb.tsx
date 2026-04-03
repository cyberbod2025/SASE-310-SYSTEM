// SasinLoginOrb.tsx — Cara de SASIN para el Login (CSS puro, sin WebGL)
// Usamos esto en vez de SaseSplineOrb en el Login para evitar el fallo
// de renderizado de Spline en tamaños pequeños.
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SasinLoginOrbProps {
  className?: string;
  mouseX?: number;
  mouseY?: number;
}

export const SasinLoginOrb: React.FC<SasinLoginOrbProps> = ({ className, mouseX = 0, mouseY = 0 }) => {
  const [blink, setBlink] = useState(false);

  // Animación de parpadeo aleatoria
  useEffect(() => {
    const scheduleBlink = () => {
      const delay = 2000 + Math.random() * 4000;
      setTimeout(() => {
        setBlink(true);
        setTimeout(() => {
          setBlink(false);
          scheduleBlink();
        }, 120);
      }, delay);
    };
    scheduleBlink();
  }, []);

  // Mover las pupilas con el mouse (limitado a ±4px)
  const pupilX = Math.max(-4, Math.min(4, mouseX * 8));
  const pupilY = Math.max(-4, Math.min(4, mouseY * 8));

  return (
    <div className={`relative flex items-center justify-center ${className || "w-32 h-32"}`}>
      {/* Resplandor exterior - Energía SASE */}
      <motion.div
        animate={{
          boxShadow: [
            "0 0 40px 15px rgba(59,130,246,0.25)",
            "0 0 60px 20px rgba(139,92,246,0.25)",
            "0 0 40px 15px rgba(59,130,246,0.25)",
          ],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full"
      />

      {/* Cuerpo principal de la esfera: Cristal Líquido */}
      <motion.div
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{
          background:
            "radial-gradient(circle at 40% 30%, #ecf9ff 0%, #3b82f6 40%, #1e3a8a 85%, #050b1a 100%)",
          border: "2px solid rgba(255,255,255,0.15)",
        }}
      >
        {/* Capas de Profundidad (Nebulosa Interna) */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,#3b82f6,#8b5cf6,#00f2ff,#3b82f6)] opacity-20 blur-3xl"
        />

        {/* Reflejo de luz superior (Capa de cristal) */}
        <div
          className="absolute top-[8%] left-[20%] w-[45%] h-[25%] rounded-full bg-white/40 blur-[8px]"
        />

        {/* CARA: NÚCLEO COGNITIVO */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="flex flex-col items-center gap-2 mt-[-5%]">
            
            {/* Cejas/Expresión Neural */}
            <div className="flex gap-10 opacity-60">
              <motion.div 
                animate={{ rotate: [-5, 5, -5], y: [0, -1, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-10 h-1 bg-white/40 rounded-full blur-[1px]"
              />
              <motion.div 
                animate={{ rotate: [5, -5, 5], y: [0, -1, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-10 h-1 bg-white/40 rounded-full blur-[1px]"
              />
            </div>

            <div className="flex gap-[30%] items-center">
              {/* Ojo Izquierdo */}
              <div className="relative w-6 h-6 rounded-full bg-slate-900 border border-white/20 overflow-hidden shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                 <motion.div
                    animate={{ 
                      x: pupilX * 1.5, 
                      y: blink ? 15 : pupilY * 1.5,
                      scaleY: blink ? 0.1 : 1
                    }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="absolute inset-0 flex items-center justify-center"
                 >
                    <div className="w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_12px_#fff,0_0_20px_#3b82f6] flex items-center justify-center">
                       <div className="w-1 h-1 bg-blue-600 rounded-full" />
                    </div>
                 </motion.div>
              </div>

              {/* Ojo Derecho */}
              <div className="relative w-6 h-6 rounded-full bg-slate-900 border border-white/20 overflow-hidden shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                 <motion.div
                    animate={{ 
                      x: pupilX * 1.5, 
                      y: blink ? 15 : pupilY * 1.5,
                      scaleY: blink ? 0.1 : 1
                    }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="absolute inset-0 flex items-center justify-center"
                 >
                    <div className="w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_12px_#fff,0_0_20px_#3b82f6] flex items-center justify-center">
                       <div className="w-1 h-1 bg-blue-600 rounded-full" />
                    </div>
                 </motion.div>
              </div>
            </div>

            {/* Neural Heartbeat Pulse */}
            <motion.div 
               animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="w-1.5 h-1.5 bg-cyan-400 rounded-full blur-[2px] mt-2"
            />
          </div>
        </div>

        {/* Reflejo inferior */}
        <div className="absolute bottom-[10%] left-[25%] w-[50%] h-[15%] bg-blue-400/20 rounded-full blur-[12px]" />
      </motion.div>

      {/* Orbitals */}
      <svg className="absolute inset-[-10%] w-[120%] h-[120%] pointer-events-none" viewBox="0 0 100 100">
        <motion.circle
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ originX: "50px", originY: "50px" }}
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="rgba(147,197,253,0.3)"
          strokeWidth="0.5"
          strokeDasharray="6 14"
        />
      </svg>
    </div>
  );
};
