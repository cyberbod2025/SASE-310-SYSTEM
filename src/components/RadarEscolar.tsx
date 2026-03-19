import React, { useMemo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../store";
import { CaseState, AppModule } from "../types";

export const RadarEscolar: React.FC<{ onComplete?: () => void }> = ({
  onComplete,
}) => {
  const { students, setCurrentModule } = useApp();
  const [loading, setLoading] = useState(true);

  // UX: Información visible en menos de 5 segundos.
  // Simulamos un escaneo rápido para dar sensación de procesamiento de IA.
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // 1. Incidencias activas
  const incidenciasActivas = useMemo(
    () => students.filter((s: any) => s.caseState !== CaseState.CERRADO).length,
    [students],
  );

  // 2. Alumnos en riesgo
  const alumnosRiesgo = useMemo(
    () =>
      students.filter(
        (s: any) =>
          s.caseState === CaseState.INTERVENCION ||
          s.caseState === CaseState.PATRON_DETECTADO,
      ).length,
    [students],
  );

  // 3. Alertas médicas
  const alertasMedicas = useMemo(
    () =>
      students.filter((s: any) => s.medicalAlerts && s.medicalAlerts.length > 0)
        .length,
    [students],
  );

  // 4. Actividad del sistema / Reportes hoy
  const todayStr = new Date().toISOString().split("T")[0];
  const reportesHoy = useMemo(() => {
    return students.reduce((acc: number, s: any) => {
      const todayCount = s.incidents.filter((inc: any) =>
        (inc.date || "").startsWith(todayStr),
      ).length;
      return acc + todayCount;
    }, 0);
  }, [students, todayStr]);

  const indicators = [
    {
      id: "incidencias",
      label: "Incidencias Activas",
      value: incidenciasActivas,
      color: incidenciasActivas > 5 ? "rose" : "amber",
      icon: "warning",
      target: AppModule.REPORTES,
    },
    {
      id: "riesgo",
      label: "Alumnos en Riesgo",
      value: alumnosRiesgo,
      color: alumnosRiesgo > 0 ? "rose" : "emerald",
      icon: "person_alert",
      target: AppModule.DASHBOARD,
    },
    {
      id: "medicas",
      label: "Alertas Médicas",
      value: alertasMedicas,
      color: alertasMedicas > 0 ? "blue" : "blue",
      icon: "medical_services",
      target: AppModule.REPORTES, // O dashboard médico si existiera directo
    },
    {
      id: "actividad",
      label: "Actividad del Sistema",
      value: reportesHoy,
      color: "indigo",
      icon: "analytics",
      target: AppModule.BITACORA,
    },
  ];

  return (
    <div className="fixed inset-0 z-[200] bg-[#020408] flex items-center justify-center p-6 font-sans overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03] [background-image:radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.15)_1px,transparent_0)] [background-size:40px_40px]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-5xl"
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-16 text-center">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-3 mb-4"
          >
            <div className="h-[1px] w-12 bg-blue-500/30"></div>
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.6em]">
              Protocolo SASE v3.10
            </span>
            <div className="h-[1px] w-12 bg-blue-500/30"></div>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-none drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">
            RADAR ESCOLAR <span className="text-blue-500">—</span> HOY
          </h1>
        </div>

        {/* Indicators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {indicators.map((ind, idx) => (
              <motion.div
                key={ind.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative group"
              >
                <div className="card-sase p-8 bg-[#0b121a]/80 backdrop-blur-xl border-white/5 group-hover:border-blue-500/30 transition-all duration-500">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                  <div className="flex justify-between items-start mb-6">
                    <div
                      className={`size-12 rounded-xl flex items-center justify-center border transition-colors duration-500
                      ${
                        ind.color === "rose"
                          ? "bg-rose-500/10 border-rose-500/20 text-rose-500"
                          : ind.color === "amber"
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                            : ind.color === "emerald"
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                              : ind.color === "blue"
                                ? "bg-blue-500/10 border-blue-500/20 text-blue-500"
                                : "bg-indigo-500/10 border-indigo-500/20 text-indigo-500"
                      }
                    `}
                    >
                      <span className="material-symbols-outlined text-3xl">
                        {ind.icon}
                      </span>
                    </div>
                    {loading ? (
                      <div className="h-8 w-12 bg-white/5 animate-pulse rounded"></div>
                    ) : (
                      <span className="text-4xl font-black text-white italic font-mono transition-all group-hover:scale-110">
                        {ind.value}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest mb-1 group-hover:text-white transition-colors">
                    {ind.label}
                  </h3>

                  <div className="flex items-center gap-2 mb-8">
                    <div
                      className={`size-1.5 rounded-full animate-pulse
                      ${
                        ind.color === "rose"
                          ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                          : ind.color === "amber"
                            ? "bg-amber-500"
                            : ind.color === "emerald"
                              ? "bg-emerald-500"
                              : ind.color === "blue"
                                ? "bg-blue-500"
                                : "bg-indigo-500"
                      }
                    `}
                    />
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">
                      {ind.color === "rose"
                        ? "Atención Requerida"
                        : "Estado Normal"}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setCurrentModule(ind.target);
                      if (onComplete) onComplete();
                    }}
                    className="w-full flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 group-hover:text-blue-300 transition-colors pt-4 border-t border-white/5"
                  >
                    <span>Acceder Módulo</span>
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-20 flex flex-col items-center gap-6"
        >
          <button
            onClick={() => {
              if (onComplete) onComplete();
            }}
            className="group relative px-12 py-5 overflow-hidden rounded-2xl bg-blue-600/10 border border-blue-500/30 hover:border-blue-500 hover:bg-blue-600/20 transition-all active:scale-95 shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:shadow-[0_0_50px_rgba(59,130,246,0.2)]"
          >
            <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex items-center gap-4">
              <span className="text-[11px] font-black text-white uppercase tracking-[0.5em]">
                ENTRAR AL SISTEMA
              </span>
              <span className="material-symbols-outlined text-blue-400 group-hover:scale-125 transition-transform animate-pulse">
                rocket_launch
              </span>
            </div>
          </button>

          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em] animate-pulse">
            IA-SASE Agent Monitoreando
          </p>
        </motion.div>
      </motion.div>

      {/* Decorative Scanline */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]" />
    </div>
  );
};
