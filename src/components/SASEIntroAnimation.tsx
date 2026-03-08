import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SaseIAOrb } from "./SaseIAOrb";
import { OrbState } from "../utils/estadoSistema";

interface SASEIntroAnimationProps {
  onComplete: () => void;
}

/**
 * SASE Intro Animation - "The Awakening of IA-SASE"
 * Dynamic color cycling, facial expressions, and high-impact institutional branding.
 */
export const SASEIntroAnimation: React.FC<SASEIntroAnimationProps> = ({
  onComplete,
}) => {
  const [step, setStep] = useState(0);
  const [orbState, setOrbState] = useState<OrbState>("blue");
  const [isFastPass, setIsFastPass] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("sase_intro_seen");
    if (seen) setIsFastPass(true);
    else sessionStorage.setItem("sase_intro_seen", "true");
  }, []);

  useEffect(() => {
    const sequence = async () => {
      const wait = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));
      const delay = (base: number) =>
        isFastPass ? base * 0.7 : base; // Much slower fastpass

      // STEP 0: LATENT/BLUE - Appearance (Base de Datos)
      setOrbState("blue");
      await wait(delay(6000));

      // STEP 1: ALERT/RED - "Protección"
      setStep(1);
      setOrbState("red");
      await wait(delay(6000));

      // STEP 2: WARNING/YELLOW - "Cuidado"
      setStep(2);
      setOrbState("yellow");
      await wait(delay(6000));

      // STEP 3: ZEN/GREEN - "Calma"
      setStep(3);
      setOrbState("green");
      await wait(delay(6000));

      // STEP 4: POWER/GOLD - "Bienvenida"
      setStep(4);
      setOrbState("gold");
      await wait(delay(6000));

      onComplete();
    };

    sequence();
  }, [isFastPass, onComplete]);

  // Map step to text color
  const getTextColor = () => {
    switch (orbState) {
      case "red":
        return "text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]";
      case "yellow":
        return "text-yellow-400 shadow-[0_0_20px_rgba(253,224,71,0.5)]";
      case "green":
        return "text-green-400 shadow-[0_0_20px_rgba(74,222,128,0.5)]";
      case "gold":
        return "text-amber-400 drop-shadow-[0_0_30px_rgba(251,191,36,0.8)]";
      default:
        return "text-white/80 transition-colors duration-1000";
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
            <SaseIAOrb
              state={orbState}
              className="w-44 h-44 sm:w-64 sm:h-64 transition-all duration-1000"
            />

            {/* POWER SHOCKWAVE (Only on Gold transition) */}
            <AnimatePresence>
              {orbState === "gold" && (
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

            <motion.div
              initial={{ opacity: 0 }}
              animate={step >= 1 ? { opacity: 1 } : {}}
              className="space-y-3 min-h-[60px]"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={orbState}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center"
                >
                  <h3
                    className={`text-[11px] font-black tracking-[0.4em] uppercase transition-colors duration-1000 ${
                      orbState === "red"
                        ? "text-red-400"
                        : orbState === "yellow"
                          ? "text-yellow-400"
                          : orbState === "green"
                            ? "text-green-400"
                            : orbState === "gold"
                              ? "text-amber-400"
                              : "text-blue-500"
                    }`}
                  >
                    {orbState === "red" && "Analizando Riesgos (Nivel Crítico)"}
                    {orbState === "yellow" && "Atención Prioritaria (Seguimiento)"}
                    {orbState === "green" && "Entorno Protegido (Paz Escolar)"}
                    {orbState === "gold" && "Bienvenido al SASE Core (Excelencia)"}
                    {orbState === "blue" && "Iniciando Protocolos (Estructura)"}
                  </h3>

                  <div
                    className={`h-[2px] w-24 mx-auto my-3 transition-colors duration-1000 ${
                      orbState === "red"
                        ? "bg-red-500/30"
                        : orbState === "yellow"
                          ? "bg-yellow-500/30"
                          : orbState === "green"
                            ? "bg-green-500/30"
                            : orbState === "gold"
                              ? "bg-amber-500/30"
                              : "bg-blue-500/30"
                    }`}
                  />

                  <p className="text-[14px] font-bold text-slate-300 tracking-[0.1em] uppercase max-w-[300px] leading-relaxed">
                    {orbState === "red" && "ROJO: ALERTAS CRÍTICAS Y PROTECCIÓN"}
                    {orbState === "yellow" &&
                      "AMARILLO: ATENCIÓN PRIORITARIA Y SEGUIMIENTO"}
                    {orbState === "green" && "VERDE: ENTORNO SEGURO Y PAZ INSTITUCIONAL"}
                    {orbState === "gold" &&
                      "DORADO: EXCELENCIA, PROTOCOLOS Y CONVIVENCIA SASE"}
                    {orbState === "blue" && "AZUL: BASE DE DATOS ESTÁTICA Y PROTOCOLOS"}
                  </p>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* FINAL HOOK */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={step >= 4 ? { opacity: 1, y: 0 } : {}}
            className="w-full flex flex-col items-center"
          >
            <div
              className={`px-8 py-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl transition-all duration-1000 ${
                orbState === "gold"
                  ? "border-amber-400/30 bg-amber-400/5 shadow-amber-400/10"
                  : ""
              }`}
            >
              <span className="text-[12px] font-black text-amber-400 tracking-[0.2em] uppercase">
                ACOMPAÑAMIENTO EN 3 CLICS
              </span>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
