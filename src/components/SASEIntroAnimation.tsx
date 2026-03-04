import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SASEIntroAnimationProps {
  onComplete: () => void;
}

export const SASEIntroAnimation: React.FC<SASEIntroAnimationProps> = ({
  onComplete,
}) => {
  const [step, setStep] = useState(0); // 0: Orb, 1: Letters, 2: Gold, 3: Subtitle, 4: Out + Slogan
  const [orbColor, setOrbColor] = useState("rgba(14, 165, 233, 1)"); // Start with Cyan

  useEffect(() => {
    // 1. Color Cycle and Staggered Steps
    const sequence = async () => {
      // Step 0: Initial Orb Breathe
      await new Promise((r) => setTimeout(r, 1000));
      setOrbColor("rgba(59, 130, 246, 1)"); // Blue

      // Step 1: Start showing letters
      setStep(1);
      await new Promise((r) => setTimeout(r, 2000));

      // Step 2: Transition to Legendary Gold
      setOrbColor("rgba(255, 215, 0, 1)"); // Gold
      setStep(2);
      await new Promise((r) => setTimeout(r, 1000));

      // Step 3: Show Subtitle
      setStep(3);
      await new Promise((r) => setTimeout(r, 2500));

      // Step 4: Final Slogan
      setStep(4);
      await new Promise((r) => setTimeout(r, 3000));

      onComplete();
    };

    sequence();
  }, [onComplete]);

  const letterVariants: any = {
    hidden: { opacity: 0, y: 20, scale: 0.5 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.2,
        duration: 0.8,
        ease: [0.33, 1, 0.68, 1],
      },
    }),
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#05070a] overflow-hidden">
      <AnimatePresence mode="wait">
        {step < 4 ? (
          <motion.div
            key="main-intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
            transition={{ duration: 1.5 }}
            className="flex flex-col items-center gap-12"
          >
            {/* The Legendary Orb */}
            <div className="relative flex items-center justify-center">
              {/* Glow Layers */}
              <motion.div
                animate={{
                  boxShadow: [
                    `0 0 40px 10px ${orbColor.replace("1)", "0.2)")}`,
                    `0 0 80px 20px ${orbColor.replace("1)", "0.4)")}`,
                    `0 0 40px 10px ${orbColor.replace("1)", "0.2)")}`,
                  ],
                  scale: [1, 1.05, 1],
                }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: orbColor.replace("1)", "0.1)") }}
              />

              {/* Main Sphere */}
              <motion.div
                animate={{
                  background:
                    step >= 2
                      ? `radial-gradient(circle at 35% 35%, #FFFBEB 0%, #F59E0B 45%, #78350F 100%)`
                      : `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.85) 0%, ${orbColor} 40%, rgba(15,23,42,1) 100%)`,
                }}
                className="relative w-40 h-40 rounded-full flex items-center justify-center shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.6),inset_10px_10px_20px_rgba(255,255,255,0.3)] border border-white/10"
              >
                {/* Rings */}
                <div className="absolute inset-[-8px] rounded-full border-[2px] border-white/5 border-t-white/30 animate-[spin_4s_linear_infinite]" />
                <div className="absolute inset-[-15px] rounded-full border-[1px] border-white/5 border-r-white/20 animate-[spin_6s_linear_infinite_reverse]" />

                {/* Eyes */}
                <div className="flex gap-6">
                  <motion.div
                    animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                    transition={{
                      repeat: Infinity,
                      duration: 4,
                      times: [0, 0.9, 0.92, 0.94, 1],
                    }}
                    className="w-1.5 h-4 bg-white rounded-full shadow-[0_0_12px_#fff]"
                  />
                  <motion.div
                    animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                    transition={{
                      repeat: Infinity,
                      duration: 4,
                      delay: 0.1,
                      times: [0, 0.88, 0.9, 0.92, 1],
                    }}
                    className="w-1.5 h-4 bg-white rounded-full shadow-[0_0_12px_#fff]"
                  />
                </div>
              </motion.div>
            </div>

            {/* SASE Letters */}
            <div className="flex gap-4">
              {["S", "A", "S", "E"].map((letter, i) => (
                <motion.span
                  key={i}
                  custom={i}
                  variants={letterVariants}
                  initial="hidden"
                  animate={step >= 1 ? "visible" : "hidden"}
                  className={`text-8xl font-black italic tracking-tighter ${step >= 2 ? "text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]" : "text-white"}`}
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
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, filter: "brightness(2)" }}
            className="flex flex-col items-center"
          >
            <motion.h2
              animate={{
                opacity: [0.5, 1, 0.5],
                textShadow: [
                  "0 0 0px #fff",
                  "0 0 30px #3b82f6",
                  "0 0 0px #fff",
                ],
              }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-5xl font-black italic text-white tracking-[0.2em]"
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
