import React, { useState } from "react";
import { motion } from "framer-motion";

// Panel de prueba con estética cristal líquido + Neo-Tactile
export const PanelAvanzado: React.FC = () => {
  const [alertasActivas, setAlertasActivas] = useState(true);
  const [modoSilencioso, setModoSilencioso] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 p-6 lg:p-10 relative z-10 w-full max-w-4xl mx-auto h-full flex flex-col gpu-accelerated"
      style={{ transform: "translateZ(0)" }}
    >
      {/* FONDOS AMBIENTALES PARA REFRACCIÓN (Blobs de luz) */}
      <div className="absolute top-0 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* ENCABEZADO */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-wide flex items-center gap-3">
          <span className="material-icons text-blue-400">tune</span>
          Configuración Avanzada
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Ajustes de detección de Sasito y preferencias de notificaciones (Exclusivo Fase 3).
        </p>
      </div>

      {/* TARJETA PRINCIPAL LIQUID GLASS CON "LIGHT CATCHER" BORDER */}
      <div className="relative p-8 rounded-3xl bg-white/[0.02] backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
        <div className="absolute inset-0 opacity-[0.01] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
          {/* SECCIÓN 1: INTERRUPTORES NEO-TACTILE (Profundidad 3D) */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-200 border-b border-white/10 pb-2 mb-4">
              Automatización de Alertas
            </h2>

            {/* Toggle 1: Alertas Automáticas */}
            <div className="flex items-center justify-between group">
              <div>
                <p className="text-white font-medium text-sm">Detección Automática</p>
                <p className="text-slate-400 text-xs">Sasito analiza patrones de riesgo.</p>
              </div>

              <div
                onClick={() => setAlertasActivas(!alertasActivas)}
                className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6),0_1px_2px_rgba(255,255,255,0.05)] ${alertasActivas ? "bg-blue-600/40 border border-blue-500/50" : "bg-[#0B1120] border border-white/5"}`}
              >
                <motion.div
                  layout
                  className="w-6 h-6 rounded-full bg-slate-200 shadow-[0_2px_5px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.8)]"
                  animate={{ x: alertasActivas ? 24 : 0, backgroundColor: alertasActivas ? "#ffffff" : "#94a3b8" }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </div>
            </div>

            {/* Toggle 2: Modo Silencioso */}
            <div className="flex items-center justify-between group">
              <div>
                <p className="text-white font-medium text-sm">Modo Contención</p>
                <p className="text-slate-400 text-xs">Pausar alertas visuales en clase.</p>
              </div>
              <div
                onClick={() => setModoSilencioso(!modoSilencioso)}
                className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6),0_1px_2px_rgba(255,255,255,0.05)] ${modoSilencioso ? "bg-amber-600/40 border border-amber-500/50" : "bg-[#0B1120] border border-white/5"}`}
              >
                <motion.div
                  layout
                  className="w-6 h-6 rounded-full bg-slate-200 shadow-[0_2px_5px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.8)]"
                  animate={{ x: modoSilencioso ? 24 : 0, backgroundColor: modoSilencioso ? "#fcd34d" : "#94a3b8" }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: BOTONES DE ACCIÓN (Neón y 3D) */}
          <div className="space-y-6 flex flex-col justify-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95, boxShadow: "0 0 10px rgba(59,130,246,0.3)" }}
              // onClick={/* tuFuncionGuardar */}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold tracking-wide shadow-[0_0_20px_rgba(34,211,238,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-cyan-400/50 flex items-center justify-center gap-2 transition-all"
            >
              <span className="material-icons">save</span>
              Guardar Configuración
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{
                scale: 0.98,
                boxShadow:
                  "inset 4px 4px 10px rgba(0,0,0,0.5), inset -4px -4px 10px rgba(255,255,255,0.02)",
              }}
              // onClick={/* tuFuncionAuditoria */}
              className="w-full py-4 rounded-2xl bg-[#131B2C] text-slate-300 font-medium shadow-[4px_4px_10px_rgba(0,0,0,0.4),-2px_-2px_8px_rgba(255,255,255,0.03)] border border-white/5 flex items-center justify-center gap-2 transition-all"
            >
              <span className="material-icons text-slate-500">history</span>
              Ver Auditoría (Caja Negra)
            </motion.button>
          </div>
        </div>

        {/* INDICADOR INFERIOR DE SASITO (Zero UI / Glow) */}
        <div className="mt-10 pt-4 border-t border-white/10 flex items-center justify-center gap-3">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-8 h-8 bg-blue-500 rounded-full blur-md animate-pulse opacity-50" />
            <div className="w-4 h-4 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,1)] relative z-10" />
          </div>
          <p className="text-xs text-blue-300 font-medium tracking-wider uppercase">
            Sasito en línea y monitoreando
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default PanelAvanzado;
