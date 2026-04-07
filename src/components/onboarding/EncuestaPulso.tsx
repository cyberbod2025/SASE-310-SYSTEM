import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "../ui/GlassCard";
import { useApp } from "../../store";

export const EncuestaPulso = () => {
  const { userCreatedAt } = useApp();
  const [mostrarEncuesta, setMostrarEncuesta] = useState(false);

  useEffect(() => {
    if (!userCreatedAt) return;
    const diffTime = Math.abs(
      new Date().getTime() - new Date(userCreatedAt).getTime(),
    );
    const dias = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const encuestaRespondida = localStorage.getItem(
      "encuesta_onboarding_completada",
    );
    if ((dias === 7 || dias === 30) && !encuestaRespondida) {
      setMostrarEncuesta(true);
    }
  }, [userCreatedAt]);

  const handleEnviar = () => {
    localStorage.setItem("encuesta_onboarding_completada", "true");
    setMostrarEncuesta(false);
  };

  return (
    <AnimatePresence>
      {mostrarEncuesta && (
        <div className="fixed inset-0 z-[4] flex items-center justify-center p-4 bg-[#0B1120]/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md"
          >
            <GlassCard className="p-8 border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.15)] relative">
              <button
                onClick={() => setMostrarEncuesta(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white min-h-[48px] min-w-[48px] flex items-center justify-center"
                aria-label="Cerrar encuesta"
              >
                <span className="material-icons text-sm">close</span>
              </button>

              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-4">
                <span className="material-icons text-white">favorite</span>
              </div>

              <h2 className="text-xl font-bold text-white mb-2">
                ¿Como ha sido tu experiencia?
              </h2>
              <p className="text-sm text-slate-300 mb-6">
                Tu opinion es clave para mejorar SASE. ¿Has encontrado todo lo
                que necesitas para el seguimiento de tus alumnos?
              </p>

              <div className="space-y-3 mb-6">
                <button
                  onClick={handleEnviar}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-emerald-500/20 hover:border-emerald-500/50 hover:text-emerald-400 transition-all text-left text-sm text-slate-300 min-h-[48px]"
                >
                  Excelente, el sistema es intuitivo
                </button>
                <button
                  onClick={handleEnviar}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-amber-500/20 hover:border-amber-500/50 hover:text-amber-400 transition-all text-left text-sm text-slate-300 min-h-[48px]"
                >
                  Bien, pero aun tengo dudas
                </button>
                <button
                  onClick={handleEnviar}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 transition-all text-left text-sm text-slate-300 min-h-[48px]"
                >
                  Necesito ayuda de mi mentor
                </button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EncuestaPulso;
