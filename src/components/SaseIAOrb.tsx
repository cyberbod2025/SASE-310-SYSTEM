import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OrbState } from "../hooks/useSaseSystemState";

interface SaseIAOrbProps {
  state: OrbState;
  className?: string;
  isIntro?: boolean;
}

const colorMap = {
  green: {
    base: "rgba(0, 200, 83, 1)",
    glow: "rgba(0, 200, 83, 0.4)",
    glowHex: "#00C853",
    gradient:
      "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.85) 0%, rgba(0, 200, 83, 1) 40%, rgba(0, 20, 10, 1) 100%)",
    mouth: "M 5 2 Q 10 5 15 2", // Zen smile
    eyeScale: 2.5,
  },
  yellow: {
    base: "rgba(255, 235, 59, 1)", // Bright yellow
    glow: "rgba(255, 235, 59, 0.4)",
    glowHex: "#FFEB3B",
    gradient:
      "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.85) 0%, rgba(255, 235, 59, 1) 40%, rgba(30, 25, 0, 1) 100%)",
    mouth: "M 5 3 L 15 3", // Flat / Warning
    eyeScale: 2.8,
  },
  red: {
    base: "rgba(211, 47, 47, 1)",
    glow: "rgba(211, 47, 47, 0.4)",
    glowHex: "#D32F2F",
    gradient:
      "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.85) 0%, rgba(211, 47, 47, 1) 40%, rgba(20, 0, 0, 1) 100%)",
    mouth: "M 5 5 Q 10 2 15 5", // Worried inverted
    eyeScale: 3.0,
  },
  blue: {
    base: "rgba(59, 130, 246, 1)",
    glow: "rgba(59, 130, 246, 0.4)",
    glowHex: "#3B82F6",
    gradient:
      "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.85) 0%, rgba(59, 130, 246, 1) 40%, rgba(0, 10, 30, 1) 100%)",
    mouth: "M 6 3 L 14 3", // Small flat
    eyeScale: 2.5,
  },
  gold: {
    base: "rgba(255, 215, 0, 1)",
    glow: "rgba(255, 215, 0, 0.4)",
    glowHex: "#FFD700",
    gradient:
      "radial-gradient(circle at 35% 35%, #FFFBEB 0%, #F59E0B 45%, #78350F 100%)",
    mouth: "M 4 2 Q 10 8 16 2", // Big happy
    eyeScale: 2.8,
  },
  thinking: {
    base: "rgba(168, 85, 247, 1)",
    glow: "rgba(168, 85, 247, 0.4)",
    glowHex: "#A855F7",
    gradient:
      "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.85) 0%, rgba(168, 85, 247, 1) 40%, rgba(20, 0, 30, 1) 100%)",
    mouth: "M 8 3 A 2 2 0 1 0 12 3 A 2 2 0 1 0 8 3", // Small O
    eyeScale: 2.5,
  },
  alert: {
    base: "rgba(244, 63, 94, 1)",
    glow: "rgba(244, 63, 94, 0.4)",
    glowHex: "#F43F5E",
    gradient:
      "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.85) 0%, rgba(244, 63, 94, 1) 40%, rgba(30, 0, 10, 1) 100%)",
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
      style={
        isInvincible
          ? { animation: "saseRainbowGlow 0.25s linear infinite" }
          : undefined
      }
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
          <div className="flex gap-8">
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
        @keyframes saseRainbowGlow {
          0% { filter: hue-rotate(0deg) brightness(110%); }
          50% { filter: hue-rotate(180deg) brightness(130%); }
          100% { filter: hue-rotate(360deg) brightness(110%); }
        }
      `}</style>
    </div>
  );
};
