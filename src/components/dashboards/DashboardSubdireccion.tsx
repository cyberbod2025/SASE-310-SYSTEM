import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useApp } from "../../store";
import { CaseState, AppModule, IncidentType } from "../../types";

// --- MICRO-COMPONENTS (NEURAL UI) ---

const TacticalKPI = ({ label, value, icon, color, trend }: any) => {
  const colors: any = {
    amber: "text-amber-500 border-amber-500/20 bg-amber-500/5",
    blue: "text-blue-500 border-blue-500/20 bg-blue-500/5",
    emerald: "text-emerald-500 border-emerald-500/20 bg-emerald-500/5",
    rose: "text-rose-500 border-rose-500/20 bg-rose-500/5",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card-sase p-6 border ${colors[color]} group relative overflow-hidden`}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-current opacity-[0.02] rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:opacity-[0.05] transition-opacity"></div>
      <div className="flex justify-between items-start mb-4">
        <div
          className={`p-2 rounded-lg border ${colors[color]} bg-transparent`}
        >
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
        {trend && (
          <span className="text-[9px] font-black px-2 py-0.5 rounded border border-white/10 bg-white/5 text-slate-500 uppercase">
            {trend}
          </span>
        )}
      </div>
      <div>
        <h4 className="text-3xl font-black text-white italic tracking-tighter mb-1 leading-none">
          {value}
        </h4>
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic">
          {label}
        </p>
      </div>
    </motion.div>
  );
};

export const DashboardSubdireccion = () => {
  const { students, setCurrentModule, addIncident } = useApp();
  const [isSyncing, setIsSyncing] = useState(false);

  // Estadísticas calculadas
  const stats = useMemo(() => {
    const total = students.length;
    const interventions = students.filter(
      (s) => s.caseState === CaseState.INTERVENCION,
    ).length;
    const observation = students.filter(
      (s) => s.caseState === CaseState.OBSERVADO,
    ).length;

    return {
      total,
      interventions,
      observation,
      riskLevel: interventions > 5 ? "CRÍTICO" : "ESTABLE",
    };
  }, [students]);

  const handleQuickAction = async (action: string) => {
    setIsSyncing(true);
    toast.loading(`Ejecutando: ${action}...`, { id: "action" });

    await new Promise((r) => setTimeout(r, 1000));

    setIsSyncing(false);
    toast.success(`Acción validada por el sistema`, { id: "action" });

    if (action === "planeaciones") setCurrentModule(AppModule.PLANEACION_NEM);
    if (action === "protocolos") setCurrentModule(AppModule.PROTOCOLOS);
  };

  return (
    <div className="flex-1 h-full min-h-screen p-6 lg:p-10 space-y-10 bg-transparent relative overflow-y-auto custom-scrollbar font-sans selection:bg-orange-500/30">
      {/* Background Grid & FX */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:40px_40px]"></div>
      </div>

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10 border-b border-white/5 pb-10">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="absolute -inset-2 bg-orange-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="size-16 bg-[#0a0f18] border border-orange-500/30 rounded-2xl flex items-center justify-center text-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.15)] relative overflow-hidden backdrop-blur-xl">
              <span className="material-symbols-outlined text-4xl">
                architecture
              </span>
              <motion.div
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 w-full h-[1px] bg-orange-500/50"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 rounded text-[9px] font-black text-orange-400 uppercase tracking-widest">
                UNIT_02 // SUB_DIRECTORATE
              </span>
              <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
            </div>
            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
              Mando{" "}
              <span className="text-orange-500 italic drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                Académico
              </span>
            </h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-3 italic flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">
                terminal
              </span>
              CORE_SYSTEM_STABILITY: {stats.riskLevel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => handleQuickAction("reporte_mensual")}
            className="px-6 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all flex items-center gap-3 active:scale-95"
          >
            <span className="material-symbols-outlined text-xl">ios_share</span>
            EXP_ZONA.PDF
          </button>
          <button
            onClick={() => handleQuickAction("sincronizar")}
            disabled={isSyncing}
            className="px-8 py-3.5 bg-orange-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-orange-600/20 hover:bg-orange-500 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
          >
            {isSyncing ? (
              <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-xl">
                sync_lock
              </span>
            )}
            FORZAR_SYNC
          </button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        <TacticalKPI
          icon="groups"
          label="Sujetos en Monitoreo"
          value={stats.total}
          trend="Global"
          color="blue"
        />
        <TacticalKPI
          icon="warning"
          label="Protocolos Activos"
          value={stats.interventions}
          trend="High_Priority"
          color="rose"
        />
        <TacticalKPI
          icon="visibility"
          label="Casos Observados"
          value={stats.observation}
          trend="Nominal"
          color="amber"
        />
        <TacticalKPI
          icon="school"
          label="Avance Planeación"
          value="84%"
          trend="Academic"
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 relative z-10">
        {/* CRITICAL FEED PANEL */}
        <div className="xl:col-span-2 space-y-8">
          <div className="card-sase border-white/5 overflow-hidden flex flex-col group h-full bg-[#0a0f18]/40 backdrop-blur-xl">
            <div className="p-6 border-b border-white/5 bg-white/[0.01] flex items-center justify-between relative">
              <div className="flex items-center gap-4">
                <div className="size-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500">
                  <span className="material-symbols-outlined text-xl font-black">
                    emergency
                  </span>
                </div>
                <div>
                  <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em] italic">
                    STREAM DE{" "}
                    <span className="text-orange-500">INTERVENCIONES</span>
                  </h3>
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">
                    FLUJO DE INCIDENCIAS NIVEL 2 Y 3
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCurrentModule(AppModule.REPORTES)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all"
              >
                VER_HISTORIAL_COMPLETO
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden p-6 space-y-4">
              <AnimatePresence>
                {students
                  .filter((s) => s.caseState === CaseState.INTERVENCION)
                  .map((s, idx) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between group/row hover:border-orange-500/30 transition-all border-l-4 border-l-orange-600"
                    >
                      <div className="flex items-center gap-5">
                        <div className="size-12 rounded-xl bg-[#05070a] border border-white/10 flex items-center justify-center text-slate-400 font-black italic">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h4 className="text-sm font-black text-white uppercase italic tracking-tighter transition-colors group-hover/row:text-orange-400">
                              {s.name}
                            </h4>
                            <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] font-black text-slate-500 uppercase tracking-widest">
                              {s.group}
                            </span>
                          </div>
                          <p className="text-[9px] font-black text-orange-500/60 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                            <span className="size-1 bg-orange-500 rounded-full animate-pulse"></span>
                            PROTOCOLO DE SEGURIDAD ACTIVADO
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleQuickAction(`revisar_${s.name}`)}
                        className="px-5 py-2.5 bg-orange-600/10 border border-orange-500/20 text-orange-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all active:scale-95 shadow-xl"
                      >
                        AUTORIZAR_PASO
                      </button>
                    </motion.div>
                  ))}
              </AnimatePresence>

              {students.filter((s) => s.caseState === CaseState.INTERVENCION)
                .length === 0 && (
                <div className="h-full flex flex-col items-center justify-center p-20 text-slate-700 opacity-30 gap-6">
                  <span className="material-symbols-outlined text-6xl">
                    verified
                  </span>
                  <p className="text-[10px] font-black text-center uppercase tracking-[0.4em] italic">
                    NO_ACTIVE_INTERVENTIONS_DETECTED
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COMMAND ACTIONS PANEL (FIXED) */}
        <div className="space-y-8">
          <div className="card-sase p-8 border-white/5 bg-[#0a0f18]/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
              <span className="material-symbols-outlined text-8xl text-orange-500">
                bolt
              </span>
            </div>

            <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] mb-8 italic flex items-center gap-3">
              <span className="size-2 bg-orange-500 rounded-full shadow-[0_0_8px_#f97316]"></span>
              COMMAND_ACTIONS
            </h3>

            <div className="space-y-4">
              <button
                onClick={() => handleQuickAction("protocolos")}
                className="w-full p-5 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center gap-5 hover:bg-orange-600 hover:border-orange-500 active:scale-95 transition-all group/btn"
              >
                <div className="size-12 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover/btn:bg-white/20 group-hover/btn:text-white">
                  <span className="material-symbols-outlined text-2xl">
                    add_moderator
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-xs font-black text-white uppercase tracking-widest italic leading-none mb-1">
                    Inyectar Protocolo
                  </p>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter group-hover:text-white/60">
                    AUTORIZACIÓN_SEP_310
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleQuickAction("suplencia")}
                className="w-full p-5 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center gap-5 hover:bg-blue-600 hover:border-blue-500 active:scale-95 transition-all group/btn"
              >
                <div className="size-12 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover/btn:bg-white/20 group-hover/btn:text-white">
                  <span className="material-symbols-outlined text-2xl">
                    group_add
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-xs font-black text-white uppercase tracking-widest italic leading-none mb-1">
                    Gestionar Suplencia
                  </p>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter group-hover:text-white/60">
                    SISTEMA_DE_COBERTURA
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleQuickAction("planeaciones")}
                className="w-full p-5 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center gap-5 hover:bg-emerald-600 hover:border-emerald-500 active:scale-95 transition-all group/btn"
              >
                <div className="size-12 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover/btn:bg-white/20 group-hover/btn:text-white">
                  <span className="material-symbols-outlined text-2xl">
                    assignment_turned_in
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-xs font-black text-white uppercase tracking-widest italic leading-none mb-1">
                    Validar NEEM
                  </p>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter group-hover:text-white/60">
                    AUDITORÍA_ACADÉMICA
                  </p>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-6xl">
                psychology
              </span>
            </div>
            <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-xl">
                auto_awesome
              </span>
              IA_INSIGHT
            </h4>
            <p className="text-xs font-medium text-orange-100 leading-relaxed uppercase italic">
              SE DETECTA ESTABILIDAD EN LOS GRUPOS DE 1ER AÑO. SE RECOMIENDA
              REFORZAR SEGUIMIENTO EN 3ER GRADO POR PRÓXIMO EXAMEN COMIPEMS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSubdireccion;
