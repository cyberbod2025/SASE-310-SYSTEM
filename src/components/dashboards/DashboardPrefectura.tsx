import React, { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useApp } from "../../store";
import {
  IncidentType,
  AppModule,
  CaseState,
} from "../../types";
import { printContent } from "../PrintButtons";

// --- MICRO-COMPONENTS (TACTICAL UI) ---

const HolographicKPI = ({
  icon,
  value,
  label,
  color = "amber",
  trend,
  delay = 0,
}: {
  icon: string;
  value: string;
  label: string;
  color?: "amber" | "rose" | "indigo" | "emerald";
  trend?: string;
  delay?: number;
}) => {
  const colors = {
    amber:
      "text-amber-400 border-amber-500/20 bg-amber-500/5 shadow-amber-500/10",
    rose: "text-rose-400 border-rose-500/20 bg-rose-500/5 shadow-rose-500/10",
    indigo:
      "text-indigo-400 border-indigo-500/20 bg-indigo-500/5 shadow-indigo-500/10",
    emerald:
      "text-emerald-400 border-emerald-500/20 bg-emerald-500/5 shadow-emerald-500/10",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.5 }}
      className={`card-sase p-5 border ${colors[color]} relative overflow-hidden group hover:bg-white/[0.03] transition-all`}
    >
      {/* Scanning Line */}
      <motion.div
        animate={{ top: ["-10%", "110%"] }}
        transition={{
          duration: 3 + delay * 0.5,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-current to-transparent opacity-20 pointer-events-none z-0"
      />
      <div className="absolute top-0 right-0 w-20 h-20 bg-current opacity-[0.03] rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="flex justify-between items-start mb-3 relative z-10">
        <div
          className={`p-2 rounded-xl border ${colors[color]} bg-transparent group-hover:scale-110 transition-transform duration-500`}
        >
          <span className="material-symbols-outlined text-lg">{icon}</span>
        </div>
        {trend && (
          <span className="text-[9px] font-black px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-slate-400 uppercase tracking-tighter">
            {trend}
          </span>
        )}
      </div>
      <div className="relative z-10">
        <h4 className="text-2xl font-black text-white tracking-tighter italic mb-0.5 drop-shadow-lg">
          {value}
        </h4>
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] group-hover:text-slate-400 transition-colors">
          {label}
        </p>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-current to-transparent opacity-20"></div>
      <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-white/10 opacity-20 group-hover:opacity-100 transition-opacity"></div>
    </motion.div>
  );
};

const TacticalActionButton = ({
  label,
  icon,
  color,
  onClick,
}: {
  label: string;
  icon: string;
  color: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all active:scale-95 h-28 w-full relative overflow-hidden group ${color}`}
  >
    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors"></div>
    {/* Corner accent */}
    <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    <span className="material-symbols-outlined text-3xl mb-2 relative z-10 group-hover:scale-110 transition-transform">
      {icon}
    </span>
    <span className="text-[10px] font-black uppercase leading-tight text-center relative z-10 tracking-widest">
      {label}
    </span>
  </button>
);

const TacticalBarChart = ({
  data,
  color,
}: {
  data: { label: string; value: number }[];
  color: string;
}) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-3">
      {data.length === 0 && (
        <p className="text-[10px] text-slate-600 font-black italic uppercase tracking-widest">
          Sin suficientes datos
        </p>
      )}
      {data.map((d, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className="flex items-center gap-3"
        >
          <span className="text-[10px] font-black text-slate-500 w-10 text-right uppercase tracking-tight">
            {d.label}
          </span>
          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(d.value / max) * 100}%` }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className={`h-full rounded-full ${color}`}
            ></motion.div>
          </div>
          <span className="text-[10px] font-black text-white w-4 tabular-nums">
            {d.value}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

// --- MAIN DASHBOARD COMPONENT ---

export const DashboardPrefectura = () => {
  const {
    students,
    addIncident,
    logAudit,
    setCurrentModule,
    openQuickRegister,
    dailyStats,
    registerAttendance,
    printDocument,
  } = useApp();
  const [matriculaInput, setMatriculaInput] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );

  // --- HELPERS ---
  const todayStr = new Date().toISOString().split("T")[0];
  const todayDisplay = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // --- DATA PROCESSING ---
  const allIncidents = useMemo(
    () =>
      students.flatMap((s) =>
        s.incidents.map((i) => ({
          ...i,
          studentId: s.id,
          studentName: s.name,
          group: s.group,
          avatar: s.avatar,
        })),
      ),
    [students],
  );

  const dailyIncidents = allIncidents.filter((i) =>
    i.date.startsWith(todayStr),
  );

  // Sort by most recent
  const recentActivity = [...dailyIncidents]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const activeAlerts = useMemo(() => {
    return students
      .filter((s) => s.caseState === CaseState.INTERVENCION || s.caseState === CaseState.EN_ANALISIS)
      .slice(0, 5);
  }, [students]);

  // Pattern Data: Top Groups with Retardos
  // Pattern Data: Top Groups by Risk
  const groupsWithDelays = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach((s) => {
      counts[s.group] = (counts[s.group] || 0) + (s.puntajeRiesgo || 0);
    });
    return Object.entries(counts)
      .map(([label, value]) => ({ label, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);
  }, [students]);

  // Pattern Data: Top Students by Risk Score
  const studentsWithIncidents = useMemo(() => {
    return [...students]
      .map((s) => ({ label: s.name.split(" ")[0], value: Math.round(s.puntajeRiesgo || 0) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);
  }, [students]);

  // --- ACTIONS ---
  const handleAction = async (
    label: string,
    type: IncidentType,
    desc: string,
  ) => {
    let student = null;

    // Prioridad 1: Input directo (Escáner o Teclado)
    if (matriculaInput.trim()) {
      student = students.find(
        (s) => s.matricula.toLowerCase() === matriculaInput.toLowerCase(),
      );
    }
    // Prioridad 2: Alumno seleccionado en contexto
    else if (selectedStudentId) {
      student = students.find((s) => s.id === selectedStudentId);
    }

    if (!student) {
      // FLOW IMPROVEMENT: Si no hay alumno, abrir búsqueda inteligente
      openQuickRegister(type);
      return;
    }

    // Execute Registration
    if (type === IncidentType.RETARDO) {
      await registerAttendance(student.id, "retardo");
    } else if (type === IncidentType.ASISTENCIA) {
      await registerAttendance(student.id, "falta");
    }

    addIncident(student.id, type, desc);
    await logAudit(
      "CREACION",
      `Prefectura: ${desc}`,
      "incidencias",
      student.id,
      student.name,
      null,
      { type, desc },
    );

    toast.success(`${label} registrado a ${student.name.split(" ")[0]}`);
    setMatriculaInput(""); // Clear for mobility
    setSelectedStudentId(student.id); // Keep context
  };

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  return (
    <div className="flex-1 min-h-full p-4 lg:p-8 bg-transparent relative overflow-hidden custom-scrollbar pb-32">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-600/[0.04] blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-rose-600/[0.03] blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

      <div className="relative z-10 max-w-[1600px] mx-auto space-y-8">
        {/* TACTICAL HEADER */}
        <div
          id="pref-header"
          className="flex flex-col md:flex-row md:items-end justify-between gap-8 animate-fade-in-up"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="h-[2px] w-12 bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]"></span>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic">
                CONTROL OPERATIVO // PREFECTURA_UNIT
              </p>
            </div>
            <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase italic leading-none">
              FIELD{" "}
              <span className="text-amber-500 drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                COMMAND
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-black rounded-lg border border-emerald-500/20 tabular-nums uppercase tracking-widest">
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="size-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"
              />
              <span>CORE_SYNC_ACTIVE</span>
            </div>
            <button
              onClick={() =>
                printContent(
                  "Reporte Diario",
                  `<h1>Reporte Prefectura ${todayDisplay}</h1>`,
                )
              }
              className="px-4 md:px-6 py-2 md:py-3 bg-white/[0.03] border border-white/10 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-white/[0.08] hover:text-white hover:border-white/20 transition-all flex items-center gap-2 md:gap-3"
            >
              <span className="material-symbols-outlined text-base md:text-lg">
                print
              </span>
              Exportar
            </button>
          </div>
        </div>

        {/* MATRICULA SCANNER */}
        <div className="card-sase p-4 border-amber-500/20 bg-amber-500/[0.02] relative overflow-hidden">
          <motion.div
            animate={{ top: ["-10%", "110%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent pointer-events-none z-0"
          />
          <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-amber-500/10 opacity-20"></div>
          <div className="flex flex-col md:flex-row items-center gap-4 relative z-10">
            <div className="flex items-center gap-3 flex-1 w-full">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <span className="material-symbols-outlined text-xl">
                  qr_code_scanner
                </span>
              </div>
              <input
                value={matriculaInput}
                onChange={(e) => {
                  setMatriculaInput(e.target.value);
                  if (selectedStudentId) setSelectedStudentId(null);
                }}
                placeholder="MATRÍCULA..."
                className="flex-1 h-10 md:h-12 rounded-xl border border-white/10 bg-white/[0.03] px-3 md:px-4 font-mono text-sm md:text-lg font-black text-white focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 outline-none transition-all placeholder:text-slate-600 uppercase tracking-widest"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const s = students.find(
                      (st) =>
                        st.matricula.toLowerCase() ===
                        matriculaInput.toLowerCase(),
                    );
                    if (s) {
                      setSelectedStudentId(s.id);
                      toast(`Alumno identificado: ${s.name}`, { icon: "🎓" });
                    } else {
                      toast.error("Matrícula no encontrada");
                    }
                  }
                }}
              />
            </div>
            {selectedStudent && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl"
              >
                <div className="size-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                  LOCK: {selectedStudent.name.split(" ")[0]}
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* KPI GRID */}
        <div
          id="pref-kpi-grid"
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <HolographicKPI
            icon="group"
            value={dailyStats.attendanceCount.toString()}
            label="ASISTENCIA"
            color="emerald"
            trend={todayDisplay.split(",")[0]}
            delay={1}
          />
          <HolographicKPI
            icon="schedule"
            value={`+${dailyStats.lateCount}`}
            label="RETARDOS"
            color="amber"
            delay={2}
          />
          <HolographicKPI
            icon="chat"
            value={dailyIncidents.length.toString()}
            label="INCIDENCIAS HOY"
            color="rose"
            delay={3}
          />
          <HolographicKPI
            icon="verified_user"
            value={students.length.toString()}
            label="MATRÍCULA TOTAL"
            color="indigo"
            delay={4}
          />
        </div>

        {/* MAIN BENTO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: ACTIONS + DATA (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* QUICK ACTION CARD */}
            <div
              id="pref-quick-register"
              className="card-sase p-6 border-amber-500/20 bg-amber-500/[0.02] relative overflow-hidden"
            >
              <motion.div
                animate={{ top: ["-10%", "110%"] }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent pointer-events-none z-0"
              />
              <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-amber-500/10 opacity-20"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/5">
                  <h3 className="text-[11px] font-black text-amber-500 uppercase tracking-[0.4em] italic">
                    ACOMPAÑAMIENTO_INMEDIATO
                  </h3>
                  <span className="text-[9px] font-black text-slate-500 uppercase px-2 py-0.5 border border-white/5 rounded">
                    ONE_TOUCH
                  </span>
                </div>

                {/* Instruction prompt when no student */}
                {!selectedStudent && !matriculaInput && (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="mb-4 p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-center gap-3"
                  >
                    <span className="material-symbols-outlined text-amber-500 text-lg">
                      info
                    </span>
                    <p className="text-[10px] text-amber-400/80 font-black uppercase tracking-widest">
                      Ingrese matrícula o seleccione alumno →
                    </p>
                  </motion.div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <TacticalActionButton
                    label="Retardo"
                    icon="schedule"
                    color="bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/40"
                    onClick={() =>
                      handleAction(
                        "Retardo",
                        IncidentType.RETARDO,
                        "Retardo (Entrada)",
                      )
                    }
                  />
                  <TacticalActionButton
                    label="Uniforme"
                    icon="checkroom"
                    color="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20 hover:border-indigo-500/40"
                    onClick={() =>
                      handleAction(
                        "Uniforme",
                        IncidentType.UNIFORME,
                        "Falta de Uniforme",
                      )
                    }
                  />
                  <TacticalActionButton
                    label="Falta"
                    icon="person_off"
                    color="bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/40"
                    onClick={() =>
                      handleAction(
                        "Falta",
                        IncidentType.ASISTENCIA,
                        "Inasistencia",
                      )
                    }
                  />
                  <TacticalActionButton
                    label="Fuera Aula"
                    icon="outbox_alt"
                    color="bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20 hover:border-orange-500/40"
                    onClick={() =>
                      handleAction(
                        "Fuera Aula",
                        IncidentType.CONDUCTA,
                        "Alumno fuera de clase sin pase",
                      )
                    }
                  />
                  <TacticalActionButton
                    label="Receso"
                    icon="timer_off"
                    color="bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/40"
                    onClick={() =>
                      handleAction(
                        "Receso Tarde",
                        IncidentType.RETARDO,
                        "Retardo post-receso",
                      )
                    }
                  />
                  <TacticalActionButton
                    label="Objetos Ret"
                    icon="inventory_2"
                    color="bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/40"
                    onClick={() => setCurrentModule(AppModule.OBJETOS_RETENIDOS)}
                  />
                  <TacticalActionButton
                    label="Observación"
                    icon="visibility"
                    color="bg-slate-500/10 text-slate-400 border-slate-500/20 hover:bg-slate-500/20 hover:border-slate-500/40"
                    onClick={() =>
                      handleAction(
                        "Observación",
                        IncidentType.CONDUCTA,
                        "Observación General",
                      )
                    }
                  />
                </div>
              </div>
            </div>

            {/* PATTERN CHARTS (2 cols) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card-sase p-6 border-white/5 bg-white/[0.01] relative overflow-hidden group">
                <motion.div
                  animate={{ top: ["-10%", "110%"] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent pointer-events-none z-0"
                />
                <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-white/10 opacity-20 group-hover:opacity-100 transition-opacity"></div>
                <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] italic mb-4 relative z-10">
                  PATTERN // RIESGO_POR_GRUPO
                </h3>
                <div className="relative z-10">
                  <TacticalBarChart
                    data={groupsWithDelays}
                    color="bg-amber-500"
                  />
                </div>
              </div>

              <div className="card-sase p-6 border-white/5 bg-white/[0.01] relative overflow-hidden group">
                <motion.div
                  animate={{ top: ["-10%", "110%"] }}
                  transition={{
                    duration: 4.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-rose-500/20 to-transparent pointer-events-none z-0"
                />
                <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-white/10 opacity-20 group-hover:opacity-100 transition-opacity"></div>
                <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] italic mb-4 relative z-10">
                  PATTERN // TOP_RIESGOS_ACTIVOS
                </h3>
                <div className="relative z-10">
                  <TacticalBarChart
                    data={studentsWithIncidents}
                    color="bg-rose-500"
                  />
                </div>
              </div>
            </div>

            {/* RECENT ACTIVITY STREAM */}
            <div
              id="pref-recent-activity"
              className="card-sase p-6 border-white/5 bg-white/[0.01] relative overflow-hidden min-h-[300px] flex flex-col"
            >
              <motion.div
                animate={{ top: ["-10%", "110%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent pointer-events-none z-0"
              />
              <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-white/10 opacity-20"></div>

              <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/5 relative z-10">
                <h3 className="text-[11px] font-black text-amber-500 uppercase tracking-[0.4em] italic flex items-center gap-3">
                  <span className="size-2 bg-amber-500 rounded-full animate-ping"></span>
                  ACTIVITY_STREAM
                </h3>
                <button
                  onClick={() => setCurrentModule(AppModule.REPORTES)}
                  className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors"
                >
                  Ver Bitácora →
                </button>
              </div>

              <div className="space-y-2 overflow-y-auto custom-scrollbar max-h-[300px] pr-2 flex-1 relative z-10">
                {recentActivity.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 opacity-20">
                    <span className="material-symbols-outlined text-4xl mb-3 font-light">
                      terminal
                    </span>
                    <p className="text-[10px] uppercase font-black tracking-widest">
                      Awaiting activity data...
                    </p>
                  </div>
                ) : (
                  recentActivity.map((item, idx) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group/item"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] font-black text-slate-600 tabular-nums">
                          {new Date(item.date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <div>
                          <p className="text-xs font-black text-white uppercase tracking-tight group-hover/item:text-amber-400 transition-colors">
                            {item.studentName}
                          </p>
                          <p className="text-[10px] text-slate-500 font-bold">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black px-2 py-1 bg-white/5 border border-white/5 rounded-lg text-slate-500 uppercase">
                          {item.group}
                        </span>
                        <button
                          onClick={() =>
                            printDocument({
                              type: "REPORTE_INCIDENCIA",
                              studentId: item.studentId,
                              data: item,
                            })
                          }
                          className="size-8 bg-white/5 hover:bg-amber-600 hover:text-white rounded-lg flex items-center justify-center transition-all opacity-0 group-hover/item:opacity-100"
                        >
                          <span className="material-symbols-outlined text-sm">
                            print
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: CONTEXT + ALERTS (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* CRITICAL ALERTS */}
            <div
              id="pref-daily-alerts"
              className="card-sase p-6 border-rose-500/20 bg-rose-500/[0.02] relative overflow-hidden"
            >
              <motion.div
                animate={{ top: ["-10%", "110%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-rose-500/30 to-transparent pointer-events-none z-0"
              />
              <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-rose-500/10 opacity-20"></div>
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <span className="material-symbols-outlined text-[60px] text-rose-500">
                  warning
                </span>
              </div>

              <h3 className="text-[11px] font-black text-rose-500 uppercase tracking-[0.4em] italic mb-5 relative z-10">
                CRITICAL_ALERTS
              </h3>

              {activeAlerts.length === 0 ? (
                <div className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl relative z-10">
                  <div className="size-2 bg-emerald-500 rounded-full"></div>
                  <p className="text-[10px] font-black text-emerald-400 italic uppercase tracking-widest">
                    SISTEMA ESTABLE
                  </p>
                </div>
              ) : (
                <div className="space-y-2 relative z-10">
                  {activeAlerts.map((s) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => {
                        setSelectedStudentId(s.id);
                        setMatriculaInput("");
                      }}
                      className="p-3 bg-white/[0.03] border border-rose-500/10 rounded-xl cursor-pointer hover:bg-white/[0.06] hover:border-rose-500/30 transition-all group/alert"
                    >
                      <p className="text-xs font-black text-white uppercase tracking-tight italic group-hover/alert:text-rose-400 transition-colors">
                        {s.name}
                      </p>
                      <p className="text-[9px] font-black text-rose-500/60 mt-1 uppercase tracking-widest">
                        {s.incidents.length} Seguimientos en curso
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* STUDENT CONTEXT PANEL */}
            <div
              className={`card-sase p-6 border-white/5 bg-white/[0.01] relative overflow-hidden h-fit sticky top-6 ${selectedStudent ? "border-amber-500/20 ring-1 ring-amber-500/10" : ""}`}
            >
              <motion.div
                animate={{ top: ["-10%", "110%"] }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent pointer-events-none z-0"
              />
              <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-white/10 opacity-20"></div>

              <h3 className="text-[11px] font-black text-amber-500 uppercase tracking-[0.4em] italic mb-5 relative z-10">
                CONTEXTO_ACTIVO
              </h3>

              {selectedStudent ? (
                <div className="space-y-4 relative z-10 animate-fade-in">
                  <div className="flex items-center gap-4 pb-4 border-b border-white/5">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-amber-500/20 rounded-xl overflow-hidden flex items-center justify-center text-amber-400 font-black text-xl italic">
                      {selectedStudent.avatar ? (
                        <img
                          src={selectedStudent.avatar}
                          className="w-full h-full object-cover"
                          alt="avatar"
                        />
                      ) : (
                        selectedStudent.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-black text-white uppercase italic tracking-tight">
                        {selectedStudent.name}
                      </p>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        {selectedStudent.group} • {selectedStudent.matricula}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/[0.03] border border-white/5 p-3 rounded-xl text-center">
                      <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">
                        Incidencias
                      </p>
                      <p className="text-xl font-black text-white italic tabular-nums mt-1">
                        {selectedStudent.incidents.length}
                      </p>
                    </div>
                    <div className="bg-white/[0.03] border border-white/5 p-3 rounded-xl text-center">
                      <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">
                        Estado
                      </p>
                      <p className="text-[10px] font-black text-amber-400 uppercase mt-2">
                        {selectedStudent.caseState || CaseState.CERRADO}
                      </p>
                    </div>
                  </div>

                  {/* Short History */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">
                      HISTORIAL_BREVE
                    </p>
                    <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                      {selectedStudent.incidents.length === 0 ? (
                        <p className="text-[10px] text-slate-600 italic">
                          Sin antecedentes
                        </p>
                      ) : (
                        selectedStudent.incidents.slice(0, 3).map((i) => (
                          <div
                            key={i.id}
                            className="text-[10px] border-l-2 border-amber-500/30 pl-2"
                          >
                            <span className="font-black text-white uppercase">
                              {i.type}
                            </span>{" "}
                            <span className="text-slate-500">
                              - {new Date(i.date).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button className="w-full py-3 bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-amber-700 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] active:scale-95">
                      Notificar Tutor
                    </button>
                    <button className="w-full py-3 bg-white/[0.03] border border-white/10 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/[0.08] hover:text-white transition-all active:scale-95">
                      Escalar a Orientación
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 opacity-30 hover:opacity-60 transition-opacity relative z-10">
                  <div className="size-16 rounded-full border-2 border-dashed border-amber-500/30 flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-3xl text-amber-500/50">
                      person_search
                    </span>
                  </div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] leading-relaxed">
                    SELECCIONE ALUMNO
                    <br />
                    <span className="text-amber-500/50">
                      O INGRESE MATRÍCULA
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Ensure clean export
export default DashboardPrefectura;
