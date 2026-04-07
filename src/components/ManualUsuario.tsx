import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "./ui/GlassCard";

export const ManualUsuario = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      id: 1,
      title: "¿Como registrar una incidencia en clase?",
      content:
        "Dirigete al modulo de Deteccion Pedagogica, selecciona al alumno y haz clic en \"Reportar Incidencia\". SASE guardara la hora y fecha automaticamente.",
    },
    {
      id: 2,
      title: "¿Como funciona la Caja Negra de privacidad?",
      content:
        "La informacion sensible de UDEII y Enfermeria esta protegida. Solo el personal con el rol autorizado puede acceder a estos expedientes, dejando un rastro de auditoria.",
    },
    {
      id: 3,
      title: "¿Como realizar un pase de lista?",
      content:
        "En el modulo de Asistencia veras la lista de tu grupo. Toca los botones de Presente (P), Retardo (R) o Falta (F) y luego \"Guardar Asistencia\".",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 p-6 lg:p-8 relative z-10 w-full max-w-4xl mx-auto h-full flex flex-col"
    >
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">
          Manual y Centro de Ayuda
        </h1>
        <p className="text-slate-400 text-sm">
          Resuelve tus dudas operativas o consultale directamente a Sasito.
        </p>
      </div>

      <GlassCard className="mb-8 p-4">
        <div className="relative">
          <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">search</span>
          <input
            type="text"
            placeholder="Buscar en el manual (ej. como reportar retardo)..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-blue-400 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all min-h-[48px]"
          />
        </div>
      </GlassCard>

      <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
        <h2 className="text-lg font-semibold text-slate-200 mb-4 px-2">
          Temas principales
        </h2>

        {faqs.map((faq) => (
          <GlassCard key={faq.id} className="p-0 overflow-hidden">
            <button
              onClick={() => setActiveFaq(activeFaq === faq.id ? null : faq.id)}
              className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none min-h-[48px]"
            >
              <span className="text-white font-medium text-sm">{faq.title}</span>
              <span
                className="material-icons text-slate-400 transition-transform duration-300"
                style={{
                  transform: activeFaq === faq.id ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                expand_more
              </span>
            </button>

            <AnimatePresence>
              {activeFaq === faq.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 pb-4 text-slate-400 text-sm leading-relaxed"
                >
                  <div className="pt-2 border-t border-white/10">
                    {faq.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        ))}
      </div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-between cursor-pointer group"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-purple-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <span className="material-icons text-purple-300">smart_toy</span>
          </div>
          <div>
            <h3 className="text-white font-medium text-sm">¿No encuentras lo que buscas?</h3>
            <p className="text-slate-400 text-xs mt-1">
              Preguntale a Sasito, tu asistente institucional.
            </p>
          </div>
        </div>
        <span className="material-icons text-purple-400 group-hover:translate-x-1 transition-transform">
          arrow_forward
        </span>
      </motion.div>
    </motion.div>
  );
};

export default ManualUsuario;
