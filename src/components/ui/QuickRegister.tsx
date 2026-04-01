import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../../store";
import { AppModule, IncidentType } from "../../types";

export const QuickRegister = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { setCurrentModule, openQuickRegister } = useApp();

  const quickActions = [
    {
      id: "asistencia",
      label: "Asistencia Rápida",
      icon: "fact_check",
      color: "text-emerald-400",
      glow: "hover:shadow-[0_0_15px_rgba(52,211,153,0.4)]",
      border: "hover:border-emerald-500/50",
      action: () => setCurrentModule(AppModule.ASISTENCIA),
    },
    {
      id: "incidencia",
      label: "Reportar Incidencia",
      icon: "warning",
      color: "text-amber-400",
      glow: "hover:shadow-[0_0_15px_rgba(251,191,36,0.4)]",
      border: "hover:border-amber-500/50",
      action: () => openQuickRegister(IncidentType.CONDUCTA),
    },
    {
      id: "objeto",
      label: "Objeto Retenido",
      icon: "inventory_2",
      color: "text-blue-400",
      glow: "hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]",
      border: "hover:border-blue-500/50",
      action: () => setCurrentModule(AppModule.OBJETOS_RETENIDOS),
    },
  ];

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mb-4 w-72 rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-5 shadow-2xl backdrop-blur-2xl"
          >
            <h3 className="text-lg font-bold text-white mb-4 tracking-wide">
              Registro Rápido
            </h3>

            <div className="space-y-3">
              {quickActions.map((action) => (
                <motion.button
                  key={action.id}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    action.action();
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 p-3 rounded-xl border border-white/5 bg-white/[0.02] transition-all duration-300 ${action.glow} ${action.border} group cursor-pointer`}
                >
                  <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center transition-transform group-hover:scale-110">
                    <span className={`material-icons ${action.color}`}>
                      {action.icon}
                    </span>
                  </div>
                  <span className="text-slate-200 font-medium text-sm">
                    {action.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center shadow-[0_0_25px_rgba(37,99,235,0.6)] border border-blue-400/50 hover:bg-blue-500 transition-colors z-10"
      >
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          className="material-icons text-white text-3xl"
        >
          add
        </motion.span>
      </motion.button>
    </div>
  );
};
