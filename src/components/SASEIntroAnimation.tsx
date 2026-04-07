import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SaseSplineOrb } from "./SaseSplineOrb";
import type { SystemState } from "../types/systemState";

interface SASEIntroAnimationProps {
  onComplete: () => void;
}

/**
 * SASE Intro Animation - "The Awakening of IA-SASE"
 * High-impact institutional branding using the official SaseOrb.
 */
export const SASEIntroAnimation: React.FC<SASEIntroAnimationProps> = ({
  onComplete,
}) => {
  const [step, setStep] = useState(0);
  const [orbState, setOrbState] = useState<SystemState>("thinking");
  const [isFastPass, setIsFastPass] = useState(false);

  useEffect(() => {
    setIsFastPass(false);
    sessionStorage.setItem("sase_intro_seen", "true");
  }, []);

  useEffect(() => {
    let cancelled = false;
    const wait = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    const delay = (base: number) =>
      Math.max(300, isFastPass ? base * 0.5 : base);

    const safetyTimer = setTimeout(() => {
      if (!cancelled) onComplete();
    }, delay(7500));

    const sequence = async () => {
      // STEP 0: LATENT/BLUE - (Base de Datos)
      setOrbState("thinking");
      await wait(delay(1200));
      if (cancelled) return;

      // STEP 1: ALERT/RED - "Protección"
      setStep(1);
      setOrbState("alert");
      await wait(delay(1200));
      if (cancelled) return;

      // STEP 2: WARNING/YELLOW - "Cuidado"
      setStep(2);
      setOrbState("warning");
      await wait(delay(1200));
      if (cancelled) return;

      // STEP 3: ZEN/GREEN - "Calma"
      setStep(3);
      setOrbState("normal");
      await wait(delay(1200));
      if (cancelled) return;

      // STEP 4: POWER/GOLD - "Bienvenida" (mapped to thinking or normal)
      setStep(4);
      setOrbState("normal");
      await wait(delay(1200));

      if (!cancelled) onComplete();
    };

    sequence();

    return () => {
      cancelled = true;
      clearTimeout(safetyTimer);
    };
  }, [isFastPass, onComplete]);

  // Map step to text color
  const getTextColor = () => {
    switch (orbState) {
      case "alert":
        return "text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]";
      case "warning":
        return "text-yellow-400 shadow-[0_0_20px_rgba(253,224,71,0.5)]";
      case "normal":
        return "text-amber-400 drop-shadow-[0_0_30px_rgba(251,191,36,0.8)]";
      case "thinking":
      default:
        return "text-blue-500/80 transition-colors duration-1000";
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-[#020408] flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none opacity-20 [background-image:radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.05)_1px,transparent_0)] [background-size:30px_30px]" onClick={() => onComplete()}></div>
      
      {/* SKIP BUTTON */}
      <button 
        onClick={() => onComplete()}
        className="absolute top-8 right-8 z-50 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black tracking-widest uppercase text-slate-400 hover:text-white hover:bg-white/10 transition-all"
      >
        Omitir Intro →
      </button>

      <AnimatePresence mode="wait">
        <motion.div
          key="intro-container"
          className="relative max-w-sm px-10 flex flex-col items-center text-center gap-10 sm:gap-14"
        >
          {/* THE ORB CORE */}
          <motion.div
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <SaseSplineOrb
              state={orbState}
              className="w-44 h-44 sm:w-64 sm:h-64 transition-all duration-1000"
            />

            {/* POWER SHOCKWAVE (Only on Gold transition) */}
            <AnimatePresence>
              {step >= 4 && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 1 }}
                  animate={{ scale: 3, opacity: 0 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="absolute inset-0 border-4 border-amber-400 rounded-full"
                />
              )}
            </AnimatePresence>
          </motion.div>

          {/* SASE IDENTITY REVEAL */}
          <div className="space-y-6">
            <div className="flex justify-center gap-3 sm:gap-5">
              {["S", "A", "S", "E"].map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.5, y: 30 }}
                  animate={step >= 1 ? { opacity: 1, scale: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.1, duration: 0.8, type: "spring" }}
                  className={`text-6xl sm:text-9xl font-black italic transition-all duration-1000 ${getTextColor()}`}
                >
                  {char}
                </motion.span>
              ))}
            </div>

            {/* Color meanings removed per user request */}
          </div>

          {/* FINAL HOOK */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={step >= 4 ? { opacity: 1, y: 0 } : {}}
            className="w-full flex flex-col items-center"
          >
            <div
              className={`px-8 py-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl transition-all duration-1000 ${
                step >= 4
                  ? "border-amber-400/30 bg-amber-400/5 shadow-amber-400/10"
                  : ""
              }`}
            >
              <span className="text-[12px] font-black text-amber-400 tracking-[0.2em] uppercase">
                SISTEMA SASE-310
              </span>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
