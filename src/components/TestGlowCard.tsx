import React from "react";
import { motion } from "framer-motion";

export const TestGlowCard: React.FC = () => {
  return (
    <div className="bg-[#121212]/90 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl shadow-black/50 p-6 md:p-8">
      <div className="flex flex-col gap-4">
        <p
          className="text-slate-400 text-sm"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Incidencias del Turno
        </p>
        <div className="text-5xl font-black text-[#22d3ee] drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]">
          12
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="w-fit rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-black/5 shadow-cyan-500/30"
        >
          Ver Detalles
        </motion.button>
      </div>
    </div>
  );
};
