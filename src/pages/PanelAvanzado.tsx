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
      <div className="absolute top-0 left-10 w-72 h-72 bg-blue-500/25 rounded-full blur-[110px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-400/15 rounded-full blur-[120px] pointer-events-none -z-10" />
      {/* Aurora horizontal */}
      <div className="absolute inset-x-4 top-24 h-36 bg-gradient-to-r from-cyan-500/10 via-blue-500/6 to-purple-500/10 blur-3xl rounded-full pointer-events-none -z-10" />
      {/* Trama sutil tipo HUD */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.08] bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:26px_26px] -z-10" />

      {/* ENCABEZADO */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-wide flex items-center gap-3">
          <span className="material-icons text-blue-400">tune</span>
          Configuración Avanzada
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Ajustes de detección de Sasito y preferencias institucionales.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.25em]">
          <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-200 border border-blue-500/30">Cristal Líquido</span>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-200 border border-emerald-500/30">Neo-Tactile</span>
          <span className="px-3 py-1 rounded-full bg-slate-800/60 text-slate-200 border border-white/10">Contraste 4.5:1</span>
        </div>
      </div>

      {/* TARJETA PRINCIPAL LIQUID GLASS CON "LIGHT CATCHER" BORDER */}
      <div className="relative p-[1px] rounded-3xl bg-gradient-to-r from-cyan-400/30 via-blue-500/20 to-purple-500/25 shadow-[0_14px_60px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="relative p-8 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.45)] overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-70" />
          <div className="absolute inset-0 rounded-3xl border border-blue-300/12 pointer-events-none" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
            {/* SECCIÓN 1: INTERRUPTORES */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-200 border-b border-white/10 pb-2 mb-4">
                Automatización Sasin
              </h2>

              {/* Toggle 1: Alertas Automáticas */}
              <div className="flex items-center justify-between group">
                <div>
                  <p className="text-white font-medium text-sm">Detección Automática</p>
                  <p className="text-slate-400 text-xs">Análisis de patrones de riesgo.</p>
                </div>
                <div
                  onClick={() => setAlertasActivas(!alertasActivas)}
                  className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] ${alertasActivas ? "bg-blue-600/40 border border-blue-500/50" : "bg-[#0B1120] border border-white/5"}`}
                >
                  <motion.div
                    layout
                    className="w-6 h-6 rounded-full bg-slate-200"
                    animate={{ x: alertasActivas ? 24 : 0 }}
                  />
                </div>
              </div>

              {/* Toggle 2: Modo Silencioso */}
              <div className="flex items-center justify-between group">
                <div>
                  <p className="text-white font-medium text-sm">Modo Contención</p>
                  <p className="text-slate-400 text-xs">Pausar alertas visuales.</p>
                </div>
                <div
                  onClick={() => setModoSilencioso(!modoSilencioso)}
                  className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] ${modoSilencioso ? "bg-amber-600/40 border border-amber-500/50" : "bg-[#0B1120] border border-white/5"}`}
                >
                  <motion.div
                    layout
                    className="w-6 h-6 rounded-full bg-slate-200"
                    animate={{ x: modoSilencioso ? 24 : 0 }}
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: ACCIÓN */}
            <div className="space-y-6 flex flex-col justify-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold tracking-wide shadow-[0_0_26px_rgba(34,211,238,0.45)] border border-cyan-300/60 flex items-center justify-center gap-2"
              >
                <span className="material-icons">save</span>
                Guardar Cambios
              </motion.button>
            </div>
          </div>

          {/* INDICADOR INFERIOR DE SASITO (Zero UI / Glow) */}
          <div className="mt-10 pt-4 border-t border-white/10 flex items-center justify-center gap-3">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-9 h-9 bg-blue-500 rounded-full blur-md animate-pulse opacity-60" />
              <div className="w-4 h-4 bg-blue-300 rounded-full shadow-[0_0_12px_rgba(96,165,250,0.9)] relative z-10" />
            </div>
            <p className="text-xs text-blue-200 font-semibold tracking-wider uppercase">
              Sasin en línea y monitoreando
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PanelAvanzado;
