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
      {/* Resplandor exterior más suave */}
      <motion.div
        animate={{
          boxShadow: [
            "0 0 26px 10px rgba(59,130,246,0.18)",
            "0 0 36px 12px rgba(124,58,237,0.18)",
            "0 0 26px 10px rgba(59,130,246,0.18)",
          ],
          scale: [1, 1.02, 1],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full"
      />

      {/* Cuerpo principal de la esfera */}
      <motion.div
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{
          background:
            "radial-gradient(circle at 45% 35%, #c7d2fe 0%, #93c5fd 35%, #1d4ed8 75%, #0b1933 100%)",
          border: "1px solid rgba(59,130,246,0.25)",
        }}
      >
        {/* Reflejo de luz superior */}
        <div
          className="absolute top-[9%] left-[22%] w-[38%] h-[18%] rounded-full opacity-35"
          style={{
            background: "radial-gradient(ellipse, rgba(255,255,255,0.8) 0%, transparent 100%)",
            filter: "blur(5px)",
          }}
        />

        {/* CARA: Ojos de SASIN */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex gap-[22%] items-center" style={{ marginTop: "-4%" }}>
            {/* Ojo Izquierdo */}
            <div className="relative flex items-center justify-center" style={{ width: "22%", aspectRatio: "1" }}>
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: "radial-gradient(circle, #bfdbfe 0%, #60a5fa 60%, #1e3a8a 100%)" }}
              />
              <motion.div
                animate={{ x: pupilX, y: blink ? 0 : pupilY, scaleY: blink ? 0.08 : 1 }}
                transition={{ type: "spring", stiffness: 180, damping: 18 }}
                className="absolute rounded-full bg-[#0b1222]"
                style={{ width: "38%", height: "38%" }}
              />
              <div
                className="absolute rounded-full bg-white opacity-80"
                style={{ width: "16%", height: "16%", top: "22%", left: "56%" }}
              />
            </div>

            {/* Ojo Derecho */}
            <div className="relative flex items-center justify-center" style={{ width: "22%", aspectRatio: "1" }}>
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: "radial-gradient(circle, #bfdbfe 0%, #60a5fa 60%, #1e3a8a 100%)" }}
              />
              <motion.div
                animate={{ x: pupilX, y: blink ? 0 : pupilY, scaleY: blink ? 0.08 : 1 }}
                transition={{ type: "spring", stiffness: 180, damping: 18 }}
                className="absolute rounded-full bg-[#0b1222]"
                style={{ width: "38%", height: "38%" }}
              />
              <div
                className="absolute rounded-full bg-white opacity-80"
                style={{ width: "16%", height: "16%", top: "22%", left: "56%" }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Anillo giratorio externo simplificado */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
        <motion.circle
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ originX: "50px", originY: "50px" }}
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="rgba(147,197,253,0.35)"
          strokeWidth="0.8"
          strokeDasharray="6 14"
        />
      </svg>
    </div>
  );
};
