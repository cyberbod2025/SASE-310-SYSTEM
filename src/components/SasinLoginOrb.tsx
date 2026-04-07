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
    <div className={`relative flex items-center justify-center ${className || "w-24 h-24"}`}>
      {/* Resplandor exterior */}
      <motion.div
        animate={{
          boxShadow: [
            "0 0 40px 12px rgba(59,130,246,0.25)",
            "0 0 60px 20px rgba(59,130,246,0.40)",
            "0 0 40px 12px rgba(59,130,246,0.25)",
          ],
          scale: [1, 1.04, 1],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full"
      />

      {/* Cuerpo principal de la esfera */}
      <motion.div
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{
          background: "radial-gradient(circle at 40% 35%, #1e3a6e 0%, #0a1628 50%, #050d1a 100%)",
          border: "1.5px solid rgba(59,130,246,0.35)",
        }}
      >
        {/* Reflejo de luz superior */}
        <div
          className="absolute top-[8%] left-[20%] w-[40%] h-[18%] rounded-full opacity-30"
          style={{
            background: "radial-gradient(ellipse, rgba(255,255,255,0.7) 0%, transparent 100%)",
            filter: "blur(4px)",
          }}
        />

        {/* CARA: Ojos de SASIN */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex gap-[22%] items-center" style={{ marginTop: "-5%" }}>
            {/* Ojo Izquierdo */}
            <div className="relative flex items-center justify-center"
              style={{ width: "22%", aspectRatio: "1" }}>
              {/* Iris */}
              <div className="absolute inset-0 rounded-full"
                style={{ background: "radial-gradient(circle, #60a5fa 0%, #1d4ed8 60%, #0f172a 100%)" }} />
              {/* Pupila */}
              <motion.div
                animate={{ x: pupilX, y: blink ? 0 : pupilY, scaleY: blink ? 0.05 : 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="absolute rounded-full bg-[#020817]"
                style={{ width: "45%", height: "45%" }}
              />
              {/* Brillo */}
              <div className="absolute rounded-full bg-white opacity-70"
                style={{ width: "18%", height: "18%", top: "20%", left: "55%" }} />
            </div>

            {/* Ojo Derecho */}
            <div className="relative flex items-center justify-center"
              style={{ width: "22%", aspectRatio: "1" }}>
              <div className="absolute inset-0 rounded-full"
                style={{ background: "radial-gradient(circle, #60a5fa 0%, #1d4ed8 60%, #0f172a 100%)" }} />
              <motion.div
                animate={{ x: pupilX, y: blink ? 0 : pupilY, scaleY: blink ? 0.05 : 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="absolute rounded-full bg-[#020817]"
                style={{ width: "45%", height: "45%" }}
              />
              <div className="absolute rounded-full bg-white opacity-70"
                style={{ width: "18%", height: "18%", top: "20%", left: "55%" }} />
            </div>
          </div>
        </div>

        {/* Línea de escaneo */}
        <motion.div
          animate={{ top: ["15%", "85%", "15%"], opacity: [0, 0.3, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-0 right-0 h-[1px] bg-blue-400 blur-[1px] pointer-events-none"
        />
      </motion.div>

      {/* Anillo giratorio externo */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
        <motion.circle
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          style={{ originX: "50px", originY: "50px" }}
          cx="50" cy="50" r="47"
          fill="none"
          stroke="rgba(59,130,246,0.4)"
          strokeWidth="0.6"
          strokeDasharray="2 10"
        />
        <motion.circle
          animate={{ rotate: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          style={{ originX: "50px", originY: "50px" }}
          cx="50" cy="50" r="43"
          fill="none"
          stroke="rgba(59,130,246,0.15)"
          strokeWidth="0.4"
          strokeDasharray="15 50"
        />
      </svg>
    </div>
  );
};
