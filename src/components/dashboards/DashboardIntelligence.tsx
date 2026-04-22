import React, { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "../ui/GlassCard";

export const DashboardIntelligence = () => {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="flex-1 p-6 lg:p-10 relative z-10 w-full max-w-7xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sase-info to-sase-admin tracking-tight mb-2">
          IA SASE: Terminal de Inteligencia
        </h1>
        <p className="text-slate-600 text-lg font-medium">
          Análisis de riesgo, incidencias y asistente de planeación.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[500px]">
        <GlassCard className="lg:col-span-2 flex flex-col h-full relative p-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sase-info to-sase-admin flex items-center justify-center shadow-glow-info flex-shrink-0">
                <span className="material-icons text-white">smart_toy</span>
              </div>
              <div className="bg-white/5 border border-slate-200 rounded-2xl rounded-tl-none p-4 max-w-[85%] backdrop-blur-sm">
                <p className="text-slate-200 text-sm leading-relaxed">
                  ¡Hola! Soy tu asistente de inteligencia SASE. Puedo ayudarte a
                  analizar la distribución de riesgo en tus grupos, estructurar
                  tu Planeación NEM paso a paso, o encontrar artículos e
                  información relevante para tu labor docente. ¿Qué te gustaría
                  explorar hoy?
                </p>
              </div>
            </motion.div>

            <div className="flex flex-wrap gap-2 ml-14">
              {[
                "Ver alumnos críticos",
                "Iniciar Planeación NEM",
                "Crear material de inducción",
              ].map((tag, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-full border border-sase-info/30 bg-sase-info/10 text-sase-info text-xs font-medium hover:bg-sase-info/20 hover:border-sase-info transition-colors"
                >
                  {tag}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 bg-black/20 flex items-center gap-3 relative z-10">
            <input
              type="text"
              placeholder="Escribe tu consulta o usa el micrófono..."
              className="flex-1 bg-white/5 border border-slate-200 rounded-full py-3 px-5 text-white placeholder-slate-500 focus:outline-none focus:border-sase-info focus:bg-sase-info/5 focus:shadow-glow-info transition-all duration-300"
            />

            <motion.button
              whileHover={{ scale: 1.1, boxShadow: "0 0 25px rgba(168,85,247,0.6)" }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsRecording(!isRecording)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 relative group ${
                isRecording
                  ? "bg-sase-danger shadow-[0_0_30px_rgba(239,68,68,0.8)]"
                  : "bg-gradient-to-br from-sase-info to-sase-admin hover:shadow-glow-info"
              }`}
            >
              {isRecording && (
                <>
                  <div className="absolute inset-0 rounded-full animate-ping bg-sase-danger/40" />
                  <div className="absolute -inset-1 rounded-full animate-pulse border-2 border-sase-danger/50" />
                </>
              )}
              {!isRecording && (
                <div className="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 border border-sase-info/30 blur-sm" />
              )}
              <span className="material-icons text-white text-2xl relative z-10">
                {isRecording ? "mic_off" : "mic_none"}
              </span>
            </motion.button>
          </div>
        </GlassCard>

        <div className="flex flex-col gap-6">
          <GlassCard
            title="Distribución de Riesgo"
            icon="donut_large"
            className="min-h-[220px]"
          >
            <div className="flex items-center justify-center h-32 relative mt-2">
              <div className="absolute inset-0 bg-gradient-to-t from-sase-danger/10 to-transparent rounded-full blur-xl"></div>

              <div className="relative z-10 text-center">
                <div className="text-4xl font-black text-sase-danger drop-shadow-[0_0_10px_rgba(248,113,113,0.8)]">
                  12%
                </div>
                <p className="text-xs text-slate-600 mt-1 uppercase tracking-wider font-semibold">
                  Riesgo Alto
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard title="Top Incidencias" icon="warning" className="flex-1">
            <div className="space-y-3 mt-4">
              {[
                {
                  name: "Ana López (3°A)",
                  type: "Académico",
                  color: "bg-sase-warning",
                },
                {
                  name: "Carlos Gómez (1°B)",
                  type: "Conducta",
                  color: "bg-sase-danger",
                },
                {
                  name: "Sofía Ruiz (2°C)",
                  type: "Asistencia",
                  color: "bg-sase-info",
                },
              ].map((student, index) => (
                <motion.div
                  key={index}
                  whileHover={{ x: 5, backgroundColor: "rgba(255,255,255,0.06)" }}
                  className="p-3 rounded-xl border border-slate-100 bg-white/[0.02] flex items-center justify-between cursor-pointer transition-colors duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${student.color} group-hover:animate-ping`}
                    ></div>
                    <div>
                      <p className="text-slate-200 text-sm font-medium">
                        {student.name}
                      </p>
                      <p className="text-slate-700 text-xs">
                        {student.type}
                      </p>
                    </div>
                  </div>
                  <span className="material-icons text-slate-600 group-hover:text-white transition-colors text-sm">
                    arrow_forward_ios
                  </span>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
