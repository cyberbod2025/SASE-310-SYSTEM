import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../../store";
import { IncidentType, AppModule, Protocol } from "../../types";
import { supabase } from "../../supabase/client";
import { ProtocolDetailModal } from "../Protocols/ProtocolDetailModal";

export const DashboardEnfermeria = () => {
  const {
    students,
    setQuickRegisterOpen,
    setCurrentModule,
    addIncident,
    suministros,
    updateSuministroStock,
  } = useApp();
  const [supportProtocol, setSupportProtocol] = useState<Protocol | null>(null);
  const [showProtocol, setShowProtocol] = useState(false);
  const [notifying, setNotifying] = useState(false);

  const handleNotifyTeachers = async () => {
    const criticalStudents = students.filter(
      (s) => s.medicalAlerts && s.medicalAlerts.length > 0,
    );

    if (criticalStudents.length === 0) {
      toast.error("No hay alumnos con alertas médicas registradas");
      return;
    }

    setNotifying(true);
    try {
      for (const s of criticalStudents) {
        await addIncident(
          s.id,
          "SALUD" as any,
          `🚑 AVISO MÉDICO: El alumno cuenta con historial de enfermedad crónica (${s.medicalAlerts.join(", ")}). Favor de observar protocolos de atención indicados en su expediente.`,
        );
      }
      toast.success(
        `Se notificó a docentes sobre ${criticalStudents.length} casos crónicos`,
        {
          duration: 5000,
          icon: "📢",
        },
      );
    } catch (err) {
      toast.error("Error al difundir alertas");
    } finally {
      setNotifying(false);
    }
  };

  useEffect(() => {
    const fetchProtocol = async () => {
      const { data } = await supabase
        .from("protocolos" as any)
        .select("*")
        .ilike("titulo", "%Primeros Auxilios%")
        .single();
      if (data) setSupportProtocol(data as any);
    };
    fetchProtocol();
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];

  const healthIncidents = students
    .flatMap((s) =>
      s.incidents.map((i) => ({
        ...i,
        studentId: s.id,
        studentName: s.name,
        group: s.group,
      })),
    )
    .filter((i) => i.type === IncidentType.SALUD);

  const visitsToday = healthIncidents.filter((i) =>
    i.date.startsWith(todayStr),
  ).length;

  const lowStockMeds = suministros.filter(
    (s) => s.cantidad / s.cantidadMaxima < 0.3,
  ).length;

  const activeAlertsCount = students.filter(
    (s) => s.medicalAlerts && s.medicalAlerts.length > 0,
  ).length;

  const recentVisits = [...healthIncidents]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <div className="flex-1 w-full space-y-8 animate-fade-in pb-32">
      {/* TACTICAL COMMAND CENTER HEADER */}
      <div className="card-sase p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 border-emerald-500/10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/10 transition-colors duration-1000"></div>
        <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px]"></div>

        <div className="flex items-center gap-8 relative z-10">
          <div className="relative group/icon">
            <div className="absolute -inset-4 bg-emerald-500/20 rounded-3xl blur-xl opacity-0 group-hover/icon:opacity-100 transition-all duration-700"></div>
            <div className="size-20 bg-[#0a0f18]/80 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400 relative shadow-[0_0_30px_rgba(16,185,129,0.2)] overflow-hidden backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-transparent"></div>
              <span className="material-symbols-outlined text-5xl group-hover/icon:scale-110 transition-transform duration-500">
                medical_services
              </span>
              {/* Animated Bio-Scanner line */}
              <motion.div
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 w-full h-[1px] bg-emerald-500/50 shadow-[0_0_10px_#10b981]"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 size-6 bg-[#020408] border border-emerald-500/30 rounded-full flex items-center justify-center">
              <div className="size-2 bg-emerald-500 rounded-full animate-ping"></div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em]">
                UNIT_01 // NURSING_CORE
              </span>
              <span className="size-1 bg-slate-700 rounded-full"></span>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                V_4.2.0_STITCH
              </span>
            </div>
            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4">
              COMMAND{" "}
              <span className="text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                CENTER
              </span>
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2 italic flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px]">
                shield_health
              </span>
              SISTEMA TÁCTICO DE SALUD INSTITUCIONAL
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 relative z-10">
          <div className="text-right border-r border-white/5 pr-6">
            <p className="text-lg font-black text-white uppercase tracking-tighter italic tabular-nums">
              {new Date().toLocaleTimeString("es-MX", { hour12: false })}
            </p>
            <div className="flex items-center justify-end gap-2 mt-1">
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="size-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"
              />
              <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-[0.3em]">
                CORE_SYNC_ACTIVE
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-1.5 h-6 bg-emerald-500/20 rounded-full overflow-hidden"
              >
                <motion.div
                  animate={{ height: ["20%", "80%", "40%", "90%", "20%"] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  className="w-full bg-emerald-500/60"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* VITAL SIGNS MONITOR (NEW) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <VitalMonitor
              label="PULSO PROMEDIO"
              value="78"
              unit="BPM"
              icon="favorite"
              color="emerald"
              points={[40, 60, 45, 90, 30, 70, 50]}
            />
            <VitalMonitor
              label="ALERTA_TERMICA"
              value="36.5"
              unit="°C"
              icon="thermostat"
              color="emerald"
              points={[30, 35, 32, 38, 35, 36, 37]}
            />
          </div>

          {/* CLINICAL DATA TERMINAL */}
          <div className="card-sase border-emerald-500/10 overflow-hidden flex flex-col group bg-[#0a0f18]/40 backdrop-blur-xl">
            <div className="p-6 border-b border-white/5 bg-white/[0.01] flex items-center justify-between relative">
              <div className="flex items-center gap-5">
                <div className="size-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  <span className="material-symbols-outlined text-2xl font-black">
                    terminal
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] italic">
                    DATA_STREAM:{" "}
                    <span className="text-emerald-500">CLINICAL_LOGS</span>
                  </h3>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">
                    FLUJO CONTINUO DE REGISTROS DE ATENCIÓN
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-emerald-500/5 border border-emerald-500/20 rounded text-[9px] font-black text-emerald-500/60 transition-all cursor-default">
                  REC: ONLINE
                </div>
                <button
                  onClick={() => setCurrentModule(AppModule.REPORTES)}
                  className="px-5 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30 transition-all active:scale-95 shadow-xl"
                >
                  EXPEDIENTE MAESTRO
                </button>
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] text-slate-500 text-[9px] uppercase font-black border-b border-white/5">
                    <th className="px-8 py-5 tracking-[0.2em] italic">
                      TS_STAMP
                    </th>
                    <th className="px-8 py-5 tracking-[0.2em] italic">
                      SUBJECT_NAME
                    </th>
                    <th className="px-8 py-5 tracking-[0.2em] italic text-center">
                      ZONE
                    </th>
                    <th className="px-8 py-5 tracking-[0.2em] italic">
                      LOG_TYPE
                    </th>
                    <th className="px-8 py-5 text-right tracking-[0.2em] italic">
                      OPS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  <AnimatePresence mode="popLayout">
                    {recentVisits.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-20 text-center">
                          <div className="flex flex-col items-center gap-6 opacity-40">
                            <span className="material-symbols-outlined text-6xl text-slate-800 animate-pulse">
                              query_stats
                            </span>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] italic">
                              NO_DATA_CURRENTLY_REGISTERED
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      recentVisits.map((visit, idx) => (
                        <motion.tr
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          key={visit.id}
                          className="hover:bg-emerald-500/[0.02] transition-colors group/row border-l-2 border-transparent hover:border-emerald-500/40"
                        >
                          <td className="px-8 py-6">
                            <span className="text-emerald-500 font-mono text-xs tabular-nums tracking-tighter bg-emerald-500/5 px-3 py-1.5 rounded-lg border border-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.05)]">
                              {new Date(visit.date).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className="font-black text-white text-sm italic uppercase tracking-tighter group-hover/row:text-emerald-400 transition-all duration-300">
                                {visit.studentName}
                              </span>
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                <span className="size-1 bg-emerald-500/30 rounded-full"></span>
                                SIG:{" "}
                                {visit.studentId.substring(0, 8).toUpperCase()}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <span className="px-3 py-1 bg-[#0a0f18] border border-white/10 rounded-lg text-[9px] font-black text-slate-400 uppercase group-hover/row:border-emerald-500/30 transition-colors tracking-widest">
                              {visit.group}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="size-2 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]"></div>
                              <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">
                                {visit.type}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button className="size-10 rounded-2xl bg-white/[0.03] border border-white/10 text-slate-500 flex items-center justify-center hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/40 transition-all active:scale-90 shadow-2xl">
                              <span className="material-symbols-outlined text-[20px]">
                                arrow_right_alt
                              </span>
                            </button>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* SIDEBAR TACTICAL STACK */}
        <div className="space-y-8">
          {/* URGENT MONITOR CARD */}
          <div className="card-sase p-8 border-rose-500/20 bg-rose-500/[0.03] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-rose-500/20 transition-colors"></div>

            <div className="flex items-center gap-5 mb-8 relative z-10">
              <div className="size-14 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                <span className="material-symbols-outlined text-3xl animate-pulse">
                  emergency_home
                </span>
              </div>
              <div>
                <h4 className="text-[11px] font-black text-rose-500 uppercase tracking-[0.4em] mb-1 italic">
                  URGENT_MONITOR
                </h4>
                <div className="flex items-center gap-2">
                  <span className="size-1.5 bg-rose-500 rounded-full animate-ping"></span>
                  <p className="text-xl font-black text-white uppercase italic tracking-tighter">
                    {activeAlertsCount} ALERTAS{" "}
                    <span className="text-rose-500 italic">ACTUALES</span>
                  </p>
                </div>
              </div>
            </div>

            <p className="text-[11px] font-medium text-slate-400 leading-relaxed mb-8 uppercase tracking-tight">
              SISTEMA DETECTÓ{" "}
              <span className="text-white font-black">
                {activeAlertsCount} CASOS
              </span>{" "}
              CON CONDICIONES MÉDICAS CRÍTICAS PARA ESTE SEGMENTO HORARIO.
            </p>

            <div className="space-y-3 relative z-10">
              <button
                onClick={handleNotifyTeachers}
                disabled={notifying}
                className="w-full py-4 bg-rose-500 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:bg-rose-600 transition-all shadow-[0_0_30px_rgba(244,63,94,0.3)] flex items-center justify-center gap-4 disabled:opacity-50 active:scale-95 group/btn"
              >
                {notifying ? (
                  <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-lg group-hover/btn:rotate-12 transition-transform">
                    priority_high
                  </span>
                )}
                DIFUNDIR ALERTA DOCENTE
              </button>
              <button
                onClick={() => setQuickRegisterOpen(true)}
                className="w-full py-4 bg-white/[0.03] border border-white/10 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:bg-white/[0.08] transition-all hover:border-white/20 active:scale-95"
              >
                REGISTRAR TRIAGE
              </button>
            </div>
          </div>

          {/* INVENTORY TRACKER */}
          <div className="card-sase p-8 border-emerald-500/10 flex flex-col group bg-[#0a0f18]/40 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-10 pb-5 border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="size-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-500">
                  <span className="material-symbols-outlined text-xl">
                    package_2
                  </span>
                </div>
                <div>
                  <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] italic">
                    SUPPLY_CHAIN
                  </h3>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">
                    CONTROL DE STOCK CLÍNICO
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 bg-amber-500/50 rounded-full animate-pulse"></div>
              </div>
            </div>

            <InventoryList
              items={suministros}
              onUpdate={updateSuministroStock}
            />

            <div className="mt-10 pt-8 border-t border-white/5">
              <button
                onClick={() =>
                  toast("Solicitud de reabastecimiento enviada", { icon: "📦" })
                }
                className="w-full py-4 bg-[#10b981]/5 hover:bg-[#10b981]/10 border border-emerald-500/20 rounded-2xl text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 group/btn shadow-[0_0_20px_rgba(16,185,129,0.05)] active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px] group-hover/btn:translate-y-[-2px] transition-transform">
                  local_shipping
                </span>
                PETICIÓN DE INSUMOS
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI HOLOGRAPHIC FOOTER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
        <HealthMetricCard
          label="CONSULTAS_TODAY"
          value={visitsToday}
          trend="+12%"
          color="emerald"
          icon="show_chart"
        />
        <HealthMetricCard
          label="CRITICAL_CASES"
          value={activeAlertsCount}
          trend="STABLE"
          color="rose"
          icon="monitoring"
        />
        <HealthMetricCard
          label="LOW_SUPPLIES"
          value={lowStockMeds}
          trend="-05"
          color="amber"
          icon="warning"
        />
      </div>

      {showProtocol && supportProtocol && (
        <ProtocolDetailModal
          protocol={supportProtocol}
          onClose={() => setShowProtocol(false)}
        />
      )}
    </div>
  );
};

/* --- SUB-COMPONENTS (TACTICAL SYSTEMS) --- */

const VitalMonitor = ({ label, value, unit, icon, color, points }: any) => {
  return (
    <div className="card-sase p-6 border-emerald-500/10 bg-[#0a0f18]/40 backdrop-blur-xl relative overflow-hidden group cursor-default">
      {/* Scanning Line */}
      <motion.div
        animate={{ top: ["-10%", "110%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent pointer-events-none z-0"
      />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <span
            className={`material-symbols-outlined text-xl text-${color}-500 group-hover:scale-110 transition-transform duration-500`}
          >
            {icon}
          </span>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] italic">
            {label}
          </span>
        </div>
        <div className="size-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
      </div>

      <div className="flex items-end gap-3 mb-6 relative z-10">
        <span className="text-5xl font-black text-white italic tracking-tighter tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] scale-95 group-hover:scale-100 transition-transform duration-500 origin-left">
          {value}
        </span>
        <span className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-2 italic opacity-80 group-hover:opacity-100 transition-opacity">
          {unit}
        </span>
      </div>

      {/* Mini-Graph Visualization */}
      <div className="h-12 w-full flex items-end gap-1 px-1 opacity-60 group-hover:opacity-100 transition-opacity duration-500">
        {points.map((h: number, i: number) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            transition={{
              duration: 1,
              delay: i * 0.1,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className={`flex-1 rounded-t-sm bg-gradient-to-t from-${color}-500/5 to-${color}-500/40`}
          />
        ))}
      </div>

      {/* Decorative corner accent */}
      <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-white/10 opacity-20 group-hover:opacity-100 transition-opacity"></div>
    </div>
  );
};

const HealthMetricCard = ({ label, value, trend, color, icon }: any) => {
  const colors: any = {
    emerald:
      "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5",
    rose: "text-rose-500 bg-rose-500/10 border-rose-500/20 shadow-rose-500/5",
    amber:
      "text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-amber-500/5",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card-sase p-6 border-white/5 bg-[#0a0f18]/30 flex items-center justify-between group hover:border-white/10 hover:bg-white/[0.03] transition-all cursor-default relative overflow-hidden"
    >
      {/* Scanning Line */}
      <motion.div
        animate={{ top: ["-10%", "110%"] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none z-0"
      />

      <div className="flex items-center gap-5 relative z-10">
        <div
          className={`size-12 rounded-2xl flex items-center justify-center ${colors[color]} border shadow-lg group-hover:scale-110 transition-transform duration-500 backdrop-blur-sm`}
        >
          <span className="material-symbols-outlined text-2xl font-black">
            {icon}
          </span>
        </div>
        <div>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] italic mb-1 opacity-80 group-hover:opacity-100 transition-opacity">
            {label}
          </p>
          <p className="text-4xl font-black text-white tabular-nums italic tracking-tighter drop-shadow-lg scale-95 group-hover:scale-100 transition-transform duration-500 origin-left">
            {value.toString().padStart(2, "0")}
          </p>
        </div>
      </div>
      <div className="text-right relative z-10">
        <div className="text-[9px] font-black px-2 py-0.5 rounded-md border bg-black/40 border-white/10 text-slate-400 group-hover:text-white transition-colors tabular-nums drop-shadow-sm">
          {trend}
        </div>
      </div>

      {/* Decorative corner accent */}
      <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-white/10 opacity-20 group-hover:opacity-100 transition-opacity"></div>
    </motion.div>
  );
};

const InventoryList = ({
  items,
  onUpdate,
}: {
  items: any[];
  onUpdate: (id: string, delta: number) => void;
}) => {
  return (
    <div className="space-y-8">
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-12 opacity-30">
          <span className="material-symbols-outlined text-4xl animate-spin text-emerald-500">
            progress_activity
          </span>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">
            SYNCING_INVENTORY_STREAM...
          </p>
        </div>
      ) : (
        items.map((item) => {
          const percentage = (item.cantidad / item.cantidadMaxima) * 100;
          const isLow = percentage < 30;
          return (
            <div key={item.id} className="group/item">
              <div className="flex justify-between items-center mb-4">
                <div className="flex flex-col">
                  <span className="text-[11px] font-black text-slate-400 group-hover/item:text-white transition-colors uppercase tracking-widest italic">
                    {item.nombre}
                  </span>
                  <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-0.5">
                    REF_{item.id.substring(0, 6)}
                  </span>
                </div>
                <div className="flex items-center gap-3 bg-[#0a0f18] border border-white/10 rounded-xl p-1.5 shadow-xl group-hover/item:border-emerald-500/30 transition-all">
                  <button
                    onClick={() => onUpdate(item.id, -1)}
                    className="size-7 flex items-center justify-center hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all active:scale-90"
                  >
                    <span className="material-symbols-outlined text-sm">
                      remove
                    </span>
                  </button>
                  <span
                    className={`text-[10px] font-black min-w-[70px] text-center px-3 py-1.5 rounded-lg border tabular-nums italic ${
                      isLow
                        ? "text-rose-500 bg-rose-500/10 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]"
                        : "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                    }`}
                  >
                    {item.cantidad} / {item.cantidadMaxima}
                  </span>
                  <button
                    onClick={() => onUpdate(item.id, 1)}
                    className="size-7 flex items-center justify-center hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all active:scale-90"
                  >
                    <span className="material-symbols-outlined text-sm">
                      add
                    </span>
                  </button>
                </div>
              </div>
              <div className="w-full bg-[#0a0f18] rounded-full h-1.5 p-[2px] border border-white/5 relative overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, percentage)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full relative ${
                    isLow
                      ? "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]"
                      : "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]"
                  }`}
                >
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                </motion.div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
