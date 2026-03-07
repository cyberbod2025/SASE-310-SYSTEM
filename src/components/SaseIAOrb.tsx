import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OrbState } from "../utils/estadoSistema";

interface SaseIAOrbProps {
  state: OrbState;
  className?: string;
  isIntro?: boolean;
}

const colorMap = {
  green: {
    base: "rgba(16, 185, 129, 1)", // Emerald 500
    glow: "rgba(16, 185, 129, 0.4)",
    glowHex: "#10B981",
    gradient:
      "radial-gradient(circle at 35% 35%, rgba(209, 250, 229, 0.9) 0%, rgba(16, 185, 129, 1) 45%, rgba(6, 78, 59, 1) 100%)",
    mouth: "M 5 2 Q 10 5 15 2",
    eyeScale: 2.5,
  },
  yellow: {
    base: "rgba(245, 158, 11, 1)", // Amber 500
    glow: "rgba(245, 158, 11, 0.4)",
    glowHex: "#F59E0B",
    gradient:
      "radial-gradient(circle at 35% 35%, rgba(254, 243, 199, 0.9) 0%, rgba(245, 158, 11, 1) 45%, rgba(120, 53, 15, 1) 100%)",
    mouth: "M 5 3 L 15 3",
    eyeScale: 2.8,
  },
  red: {
    base: "rgba(220, 38, 38, 1)", // Red 600
    glow: "rgba(220, 38, 38, 0.4)",
    glowHex: "#DC2626",
    gradient:
      "radial-gradient(circle at 35% 35%, rgba(254, 226, 226, 0.9) 0%, rgba(220, 38, 38, 1) 45%, rgba(127, 29, 29, 1) 100%)",
    mouth: "M 5 5 Q 10 2 15 5",
    eyeScale: 3.0,
  },
  blue: {
    base: "rgba(37, 99, 235, 1)", // Blue 600
    glow: "rgba(37, 99, 235, 0.4)",
    glowHex: "#2563EB",
    gradient:
      "radial-gradient(circle at 35% 35%, rgba(219, 234, 254, 0.9) 0%, rgba(37, 99, 235, 1) 45%, rgba(30, 58, 138, 1) 100%)",
    mouth: "M 6 3 L 14 3",
    eyeScale: 2.5,
  },
  gold: {
    base: "rgba(217, 119, 6, 1)", // Amber 600 (Gold)
    glow: "rgba(217, 119, 6, 0.4)",
    glowHex: "#D97706",
    gradient:
      "radial-gradient(circle at 35% 35%, #FFFBEB 0%, #F59E0B 45%, #78350F 100%)",
    mouth: "M 4 2 Q 10 8 16 2",
    eyeScale: 2.8,
  },
  thinking: {
    base: "rgba(124, 58, 237, 1)", // Violet 600
    glow: "rgba(124, 58, 237, 0.4)",
    glowHex: "#7C3AED",
    gradient:
      "radial-gradient(circle at 35% 35%, rgba(237, 233, 254, 0.9) 0%, rgba(124, 58, 237, 1) 45%, rgba(76, 29, 149, 1) 100%)",
    mouth: "M 8 3 A 2 2 0 1 0 12 3 A 2 2 0 1 0 8 3",
    eyeScale: 2.5,
  },
  alert: {
    base: "rgba(225, 29, 72, 1)", // Rose 600
    glow: "rgba(225, 29, 72, 0.4)",
    glowHex: "#E11D48",
    gradient:
      "radial-gradient(circle at 35% 35%, #FFF1F2 0%, #E11D48 45%, #881337 100%)",
    mouth: "M 5 5 L 15 5",
    eyeScale: 3.0,
  },
};

export const SaseIAOrb: React.FC<SaseIAOrbProps> = ({
  state,
  className,
  isIntro,
}) => {
  const [isChanging, setIsChanging] = useState(false);
  const [eyePos, setEyePos] = useState({ x: 0, y: 0 });

  const activeColor =
    colorMap[state as keyof typeof colorMap] || colorMap.green;

  useEffect(() => {
    setIsChanging(true);
    const timeout = setTimeout(() => setIsChanging(false), 1000);
    return () => clearTimeout(timeout);
  }, [state]);

  // Eye movement simulation for intro or idle
  useEffect(() => {
    const moveEyes = () => {
      if (Math.random() > 0.7) {
        setEyePos({
          x: (Math.random() - 0.5) * 8,
          y: (Math.random() - 0.5) * 4,
        });
      }
    };
    const interval = setInterval(moveEyes, 2000);
    return () => clearInterval(interval);
  }, []);

  const isInvincible = state === "gold";

  return (
    <div
      className={`relative flex items-center justify-center ${className || "w-32 h-32"}`}
    >


      {/* GLOW LAYERS */}
      <motion.div
        animate={{
          boxShadow: [
            `0 0 20px 5px ${activeColor.glowHex}22`,
            `0 0 50px 15px ${activeColor.glowHex}66`,
            `0 0 20px 5px ${activeColor.glowHex}22`,
          ],
          scale: [1, 1.05, 1],
        }}
        transition={{ repeat: Infinity, duration: 4 }}
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: `${activeColor.glowHex}11` }}
      />

      {/* CORE SPHERE */}
      <motion.div
        animate={{ background: activeColor.gradient }}
        transition={{ duration: 0.8 }}
        className="relative w-[85%] h-[85%] rounded-full flex flex-col items-center justify-center shadow-[inset_-5px_-5px_10px_rgba(0,0,0,0.6),inset_5px_5px_10px_rgba(255,255,255,0.2)] border border-white/10 overflow-hidden"
      >
        {/* RINGS */}
        <div className="absolute inset-[-4px] rounded-full border-[1px] border-white/5 border-t-white/20 animate-[spin_4s_linear_infinite]" />

        {/* FACE CONTAINER */}
        <motion.div
          animate={{ x: eyePos.x, y: eyePos.y }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="flex flex-col items-center gap-3"
        >
          {/* EYES */}
          <div className="flex gap-12">
            <motion.div
              animate={{
                scaleY: isChanging ? [1, 0.1, 1] : [1, 1, 0.1, 1, 1],
              }}
              transition={{
                repeat: isChanging ? 0 : Infinity,
                duration: 4,
                times: [0, 0.9, 0.92, 0.94, 1],
              }}
              className="w-2 h-7 bg-white rounded-sm shadow-[0_0_20px_rgba(255,255,255,0.9)]"
            />
            <motion.div
              animate={{
                scaleY: isChanging ? [1, 0.1, 1] : [1, 1, 0.1, 1, 1],
              }}
              transition={{
                repeat: isChanging ? 0 : Infinity,
                duration: 4,
                delay: 0.1,
                times: [0, 0.88, 0.9, 0.92, 1],
              }}
              className="w-2 h-7 bg-white rounded-sm shadow-[0_0_20px_rgba(255,255,255,0.9)]"
            />
          </div>


        </motion.div>
      </motion.div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
