import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../../store";
import { IncidentType, AppModule, Protocol, UserRole } from "../../types";
import { supabase } from "../../supabase/client";
import { ProtocolDetailModal } from "../Protocols/ProtocolDetailModal";

export const DashboardMedico = () => {
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
          IncidentType.SALUD,
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
        .from("protocolos")
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
                UNIDAD 04 // AREA DE SALUD
              </span>
              <span className="size-1 bg-slate-700 rounded-full"></span>
              <span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.2em]">
                MÉDICO ESCOLAR
              </span>
            </div>
            <h1 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
              ESTACION{" "}
              <span className="text-rose-500 drop-shadow-[0_0_20px_rgba(244,63,94,0.4)]">
                MEDICA
              </span>
            </h1>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mt-2 italic flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px]">
                shield_health
              </span>
              SISTEMA INTEGRAL DE SALUD INSTITUCIONAL
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 relative z-10">
          <div className="text-right border-r border-slate-100 pr-6">
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
                NUCLEO DE SALUD ACTIVO
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <VitalMonitor
              label="PULSO PROMEDIO"
              value="76"
              unit="BPM"
              icon="favorite"
              color="emerald"
              points={[40, 60, 45, 90, 30, 70, 50]}
            />
            <VitalMonitor
              label="ALERTA_TERMICA"
              value="36.4"
              unit="°C"
              icon="thermostat"
              color="emerald"
              points={[30, 35, 32, 38, 35, 36, 37]}
            />
          </div>

          <div className="card-sase border-emerald-500/10 overflow-hidden flex flex-col group bg-[#0a0f18]/40 backdrop-blur-xl">
            <div className="p-6 border-b border-slate-100 bg-white/[0.01] flex items-center justify-between relative">
              <div className="flex items-center gap-5">
                <div className="size-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  <span className="material-symbols-outlined text-2xl font-black">
                    terminal
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] italic">
                    FLUJO DE DATOS:{" "}
                    <span className="text-emerald-500">REGISTROS CLINICOS</span>
                  </h3>
                  <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest mt-1">
                    FLUJO CONTINUO DE REGISTROS DE ATENCIÓN MÉDICA
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCurrentModule(AppModule.REPORTES)}
                className="px-5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30 transition-all active:scale-95 shadow-xl"
              >
                EXPEDIENTE MÉDICO
              </button>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] text-slate-700 text-[9px] uppercase font-black border-b border-slate-100">
                    <th className="px-8 py-5 tracking-[0.2em] italic">
                      HORA
                    </th>
                    <th className="px-8 py-5 tracking-[0.2em] italic">
                      ALUMNO
                    </th>
                    <th className="px-8 py-5 tracking-[0.2em] italic text-center">
                      GRUPO
                    </th>
                    <th className="px-8 py-5 tracking-[0.2em] italic">
                      TIPO
                    </th>
                    <th className="px-8 py-5 text-right tracking-[0.2em] italic">
                      ACCIONES
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
                              SIN REGISTROS EN ESTE MOMENTO
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
                            <span className="text-emerald-500 font-mono text-xs tabular-nums tracking-tighter bg-emerald-500/5 px-3 py-1.5 rounded-2xl border border-emerald-500/10">
                              {new Date(visit.date).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className="font-black text-white text-sm italic uppercase tracking-tighter group-hover/row:text-emerald-400 transition-all duration-300">
                                {visit.studentName}
                              </span>
                              <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest mt-1.5">
                                SIG:{" "}
                                {visit.studentId.substring(0, 8).toUpperCase()}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <span className="px-3 py-1 bg-[#0a0f18] border border-slate-200 rounded-2xl text-[9px] font-black text-slate-600 uppercase tracking-widest">
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
                            <button className="size-10 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/40 transition-all active:scale-90">
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

        <div className="space-y-8">
          {/* URGENT MONITOR CARD */}
          <div className="card-sase p-8 border-rose-500/20 bg-rose-500/[0.03] relative overflow-hidden group">
            <div className="flex items-center gap-5 mb-8 relative z-10">
              <div className="size-14 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center text-rose-500">
                <span className="material-symbols-outlined text-3xl animate-pulse">
                  emergency_home
                </span>
              </div>
              <div>
                <h4 className="text-[11px] font-black text-rose-500 uppercase tracking-[0.4em] mb-1 italic">
                  MONITOREO URGENTE
                </h4>
                <div className="flex items-center gap-2">
                  <span className="size-1.5 bg-rose-500 rounded-full animate-ping"></span>
                  <p className="text-xl font-black text-white uppercase italic tracking-tighter">
                    {activeAlertsCount} ALERTAS
                  </p>
                </div>
              </div>
            </div>

            <p className="text-[11px] font-medium text-slate-600 leading-relaxed mb-8 uppercase tracking-tight">
              SISTEMA DETECTÓ{" "}
              <span className="text-white font-black">
                {activeAlertsCount} CASOS
              </span>{" "}
              CON CONDICIONES CRÍTICAS.
            </p>

            <div className="space-y-3 relative z-10">
              <button
                onClick={handleNotifyTeachers}
                disabled={notifying}
                className="w-full py-4 bg-rose-500 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:bg-rose-600 transition-all shadow-[0_0_30px_rgba(244,63,94,0.3)] flex items-center justify-center gap-4 disabled:opacity-50"
              >
                {notifying ? (
                  <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-lg">
                    priority_high
                  </span>
                )}
                DIFUNDIR ALERTA DOCENTE
              </button>
              <button
                onClick={() => setQuickRegisterOpen(true)}
                className="w-full py-4 bg-slate-100 border border-slate-200 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:bg-white/[0.08] transition-all"
              >
                REGISTRAR TRIAGE
              </button>
            </div>
          </div>

          <div className="card-sase p-8 border-emerald-500/10 flex flex-col group bg-[#0a0f18]/40 backdrop-blur-xl">
            <div className="flex items-center gap-4 mb-10 pb-5 border-b border-slate-100">
              <div className="size-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-500">
                <span className="material-symbols-outlined text-xl">
                  package_2
                </span>
              </div>
              <div>
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] italic">
                  CADENA DE SUMINISTRO
                </h3>
                <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest mt-0.5">
                  ESTADO DEL BOTIQUÍN
                </p>
              </div>
            </div>
            <InventoryList
              items={suministros}
              onUpdate={updateSuministroStock}
            />
          </div>
        </div>
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

/* --- SUB-COMPONENTS --- */

const VitalMonitor = ({ label, value, unit, icon, color, points }: any) => (
  <div className="card-sase p-6 border-emerald-500/10 bg-[#0a0f18]/40 backdrop-blur-xl relative overflow-hidden group">
    <div className="flex items-center justify-between mb-4 relative z-10">
      <div className="flex items-center gap-3">
        <span
          className={`material-symbols-outlined text-xl text-${color}-500 group-hover:scale-110 transition-transform`}
        >
          {icon}
        </span>
        <span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em] italic">
          {label}
        </span>
      </div>
      <div className="size-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
    </div>
    <div className="flex items-end gap-3 mb-6 relative z-10">
      <span className="text-5xl font-black text-white italic tracking-tighter tabular-nums">
        {value}
      </span>
      <span className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-2 italic">
        {unit}
      </span>
    </div>
    <div className="h-12 w-full flex items-end gap-1 px-1 opacity-60">
      {points.map((h: number, i: number) => (
        <motion.div
          key={i}
          animate={{ height: [`${h}%`, `${h + 10}%`, `${h}%`] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
          className={`flex-1 rounded-t-sm bg-emerald-500/30`}
        />
      ))}
    </div>
  </div>
);

const InventoryList = ({ items, onUpdate }: any) => (
  <div className="space-y-6">
    {items.length === 0 ? (
      <p className="text-[10px] text-slate-700 uppercase text-center py-6">
        Iniciando flujo de inventario...
      </p>
    ) : (
      items.map((item: any) => {
        const pct = (item.cantidad / item.cantidadMaxima) * 100;
        return (
          <div key={item.id} className="group/item">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                {item.nombre}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdate(item.id, -1)}
                  className="size-6 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  -
                </button>
                <span className="text-[10px] font-mono text-white">
                  {item.cantidad}
                </span>
                <button
                  onClick={() => onUpdate(item.id, 1)}
                  className="size-6 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${pct}%` }}
                className={`h-full ${pct < 30 ? "bg-rose-500" : "bg-emerald-500"}`}
              />
            </div>
          </div>
        );
      })
    )}
  </div>
);

export default DashboardMedico;
