import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SASEIntroAnimationProps {
  onComplete: () => void;
}

export const SASEIntroAnimation: React.FC<SASEIntroAnimationProps> = ({
  onComplete,
}) => {
  const [step, setStep] = useState(0); // 0: Orb, 1: Letters, 2: Gold, 3: Subtitle, 4: Out + Slogan
  const [orbColor, setOrbColor] = useState("rgba(59, 130, 246, 1)"); // Blue SASE Official

  // --- STEP 0: BREATHE (Very fast perception)
  useEffect(() => {
    const timer = setTimeout(() => {
      setStep(1);
    }, 200); // Super fast
    return () => clearTimeout(timer);
  }, []);

  // --- STEP 1: LETTERS (Show S A S E)
  useEffect(() => {
    if (step === 1) {
      const timer = setTimeout(() => {
        setOrbColor("rgba(255, 215, 0, 1)"); // Gold Institutional
        setStep(2);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // --- STEP 2: GOLD (Transform to institution colors)
  useEffect(() => {
    if (step === 2) {
      const timer = setTimeout(() => setStep(3), 400);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // --- STEP 3: SUBTITLE (Show Platform name)
  useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(() => setStep(4), 800);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // --- STEP 4: SLOGAN (Show Final Slogan)
  useEffect(() => {
    if (step === 4) {
      const timer = setTimeout(() => onComplete(), 3500); // Extended for readability
      return () => clearTimeout(timer);
    }
  }, [step, onComplete]);

  const letterVariants: any = {
    hidden: { opacity: 0, y: 30, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.12,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#05070a] overflow-hidden cursor-pointer"
      onClick={() => onComplete()}
    >
      <AnimatePresence mode="wait">
        {step < 4 ? (
          <motion.div
            key="main-intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
            transition={{ duration: 1.2 }}
            className="flex flex-col items-center gap-12"
          >
            {/* The REAL SASE IA Orb */}
            <div className="relative flex items-center justify-center">
              {/* Institutional Glow Pulsing */}
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 50px 10px rgba(59, 130, 246, 0.2)",
                    "0 0 100px 30px rgba(59, 130, 246, 0.5)",
                    "0 0 50px 10px rgba(59, 130, 246, 0.2)",
                  ],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                  ease: "easeInOut",
                }}
                className="absolute inset-8 rounded-full bg-blue-500/10 blur-3xl"
              />

              {/* Official AI SASE Sphere with Volumetric Movement */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  rotate: 0,
                  y: [0, -10, 0], // Subtle floating
                }}
                transition={{
                  duration: 1.2,
                  ease: "easeOut",
                  y: { repeat: Infinity, duration: 4, ease: "easeInOut" },
                }}
                className="relative z-10"
              >
                <img
                  src={
                    step >= 2
                      ? "/assets/branding/SASE_ICON_GOLD.png"
                      : "/assets/branding/SASE_ICON.png"
                  }
                  alt="IA SASE"
                  className="w-64 h-64 object-contain drop-shadow-[0_0_35px_rgba(59,130,246,0.6)]"
                />
              </motion.div>

              {/* Energy Ring Filaments Effect */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                className="absolute inset-[-30px] rounded-full border border-blue-500/10 border-t-blue-500/30 blur-sm"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                className="absolute inset-[-50px] rounded-full border border-amber-500/5 border-b-amber-500/20 blur-[1px]"
              />
            </div>

            {/* SASE Letters with Enhanced Glow */}
            <div className="flex gap-6 mt-4">
              {["S", "A", "S", "E"].map((letter, i) => (
                <motion.span
                  key={i}
                  custom={i}
                  variants={letterVariants}
                  initial="hidden"
                  animate={step >= 1 ? "visible" : "hidden"}
                  className={`text-9xl font-black italic tracking-tighter transition-colors duration-700 ${
                    step >= 2
                      ? "text-amber-400 drop-shadow-[0_0_30px_rgba(251,191,36,0.6)]"
                      : "text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                  }`}
                >
                  {letter}
                </motion.span>
              ))}
            </div>

            {/* Subtitle */}
            <div className="h-8 overflow-hidden">
              <AnimatePresence>
                {step >= 3 && (
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-slate-400 font-bold uppercase tracking-[0.4em] text-xs text-center"
                  >
                    Sistema de Acompañamiento y Seguimiento Escolar
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="slogan"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center"
          >
            <motion.h2
              animate={{
                opacity: [0.7, 1, 0.7],
                textShadow: [
                  "0 0 10px rgba(255,255,255,0.2)",
                  "0 0 30px rgba(59,130,246,0.6)",
                  "0 0 10px rgba(255,255,255,0.2)",
                ],
              }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-6xl font-black italic text-white tracking-[0.2em] text-center px-4"
            >
              CONECTAMOS CONTIGO
            </motion.h2>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
