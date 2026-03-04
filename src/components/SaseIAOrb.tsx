import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OrbState } from "../hooks/useSaseSystemState";

interface SaseIAOrbProps {
  state: OrbState;
  className?: string;
}

const colorMap = {
  green: {
    base: "rgba(0, 200, 83, 1)",
    glow: "rgba(0, 200, 83, 0.4)",
    gradient:
      "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.85) 0%, rgba(0, 200, 83, 1) 40%, rgba(0, 20, 10, 1) 100%)",
  },
  orange: {
    base: "rgba(255, 152, 0, 1)",
    glow: "rgba(255, 152, 0, 0.4)",
    gradient:
      "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.85) 0%, rgba(255, 152, 0, 1) 40%, rgba(30, 15, 0, 1) 100%)",
  },
  red: {
    base: "rgba(211, 47, 47, 1)",
    glow: "rgba(211, 47, 47, 0.4)",
    gradient:
      "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.85) 0%, rgba(211, 47, 47, 1) 40%, rgba(20, 0, 0, 1) 100%)",
  },
  blue: {
    base: "rgba(59, 130, 246, 1)",
    glow: "rgba(59, 130, 246, 0.4)",
    gradient:
      "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.85) 0%, rgba(59, 130, 246, 1) 40%, rgba(0, 10, 30, 1) 100%)",
  },
  gold: {
    base: "rgba(255, 215, 0, 1)",
    glow: "rgba(255, 215, 0, 0.4)",
    gradient:
      "radial-gradient(circle at 35% 35%, #FFFBEB 0%, #F59E0B 45%, #78350F 100%)",
  },
  thinking: {
    base: "rgba(168, 85, 247, 1)",
    glow: "rgba(168, 85, 247, 0.4)",
    gradient:
      "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.85) 0%, rgba(168, 85, 247, 1) 40%, rgba(20, 0, 30, 1) 100%)",
  },
  alert: {
    base: "rgba(244, 63, 94, 1)",
    glow: "rgba(244, 63, 94, 0.4)",
    gradient:
      "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.85) 0%, rgba(244, 63, 94, 1) 40%, rgba(30, 0, 10, 1) 100%)",
  },
};

export const SaseIAOrb: React.FC<SaseIAOrbProps> = ({ state, className }) => {
  const [isChanging, setIsChanging] = useState(false);
  // Default to green if state not found
  const activeColor =
    colorMap[state as keyof typeof colorMap] || colorMap.green;

  useEffect(() => {
    setIsChanging(true);
    const timeout = setTimeout(() => {
      setIsChanging(false);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [state]);

  return (
    <div
      className={`relative flex items-center justify-center ${className || "w-32 h-32"}`}
    >
      {/* GLOW LAYERS */}
      <motion.div
        animate={{
          boxShadow: [
            `0 0 20px 5px ${activeColor.glow.replace("0.4)", "0.15)")}`,
            `0 0 40px 10px ${activeColor.glow.replace("0.4)", "0.3)")}`,
            `0 0 20px 5px ${activeColor.glow.replace("0.4)", "0.15)")}`,
          ],
          scale: [1, 1.05, 1],
        }}
        transition={{ repeat: Infinity, duration: 4 }}
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: activeColor.base.replace("1)", "0.05)") }}
      />

      {/* CORE SPHERE */}
      <motion.div
        animate={{
          background: activeColor.gradient,
        }}
        transition={{ duration: 0.8 }}
        className="relative w-[85%] h-[85%] rounded-full flex items-center justify-center shadow-[inset_-5px_-5px_10px_rgba(0,0,0,0.6),inset_5px_5px_10px_rgba(255,255,255,0.2)] border border-white/10"
      >
        {/* RINGS */}
        <div className="absolute inset-[-4px] rounded-full border-[1px] border-white/5 border-t-white/20 animate-[spin_4s_linear_infinite]" />
        <div className="absolute inset-[-8px] rounded-full border-[1.5px] border-white/5 border-r-white/10 animate-[spin_6s_linear_infinite_reverse]" />

        {/* EYES */}
        <div className="flex gap-4">
          <motion.div
            animate={{
              scaleY: isChanging ? [1, 0.1, 1] : [1, 1, 0.1, 1, 1],
            }}
            transition={{
              repeat: isChanging ? 0 : Infinity,
              duration: 4,
              times: [0, 0.9, 0.92, 0.94, 1],
            }}
            className="w-1 h-3 bg-white rounded-full shadow-[0_0_8px_#fff]"
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
            className="w-1 h-3 bg-white rounded-full shadow-[0_0_8px_#fff]"
          />
        </div>
      </motion.div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
