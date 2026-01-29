import React, { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { useApp } from "../../store";
import {
  IncidentType,
  AppModule,
  calculateState,
  CaseState,
} from "../../types";
import { printContent } from "../PrintButtons";

export const DashboardPrefectura = () => {
  const {
    students,
    addIncident,
    logAudit,
    setCurrentModule,
    openQuickRegister,
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
      .filter((s) => calculateState(s.incidents) === CaseState.PATRON_DETECTADO)
      .slice(0, 3);
  }, [students]);

  // Pattern Data: Top Groups with Retardos
  const groupsWithDelays = useMemo(() => {
    const counts: Record<string, number> = {};
    allIncidents
      .filter((i) => i.type === IncidentType.RETARDO)
      .forEach((i) => {
        counts[i.group] = (counts[i.group] || 0) + 1;
      });
    return Object.entries(counts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);
  }, [allIncidents]);

  // Pattern Data: Top Students with Incidents
  const studentsWithIncidents = useMemo(() => {
    return [...students]
      .map((s) => ({ label: s.name.split(" ")[0], value: s.incidents.length }))
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
    <div className="flex-1 w-full space-y-6 animate-fade-in pb-12">
      {/* HEADER: Identity & Turno */}
      <header
        id="pref-header"
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-200 pb-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.4),transparent)]"></div>
            <span className="material-symbols-outlined text-3xl">
              local_police
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Prefectura
            </h1>
            <p className="text-xs font-bold text-amber-700 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              Operativo • {todayDisplay}
            </p>
          </div>
        </div>

        {/* Quick Search / Matricula Focus */}
        <div className="relative w-full md:w-64">
          <input
            value={matriculaInput}
            onChange={(e) => {
              setMatriculaInput(e.target.value);
              if (selectedStudentId) setSelectedStudentId(null); // Clear context if typing new ID
            }}
            placeholder="Matrícula..."
            className="w-full h-12 rounded-xl border-2 border-amber-200 bg-white pl-10 pr-4 font-mono text-lg font-bold text-slate-800 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all placeholder:text-slate-300 uppercase"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const s = students.find(
                  (st) =>
                    st.matricula.toLowerCase() === matriculaInput.toLowerCase(),
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
          <span className="material-symbols-outlined absolute left-3 top-3.5 text-amber-400">
            search
          </span>
        </div>
      </header>

      {/* KPI GRID: TOP STATS FROM IMAGE */}
      <div
        id="pref-kpi-grid"
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        <KPICard
          icon="group"
          value="28"
          label="Asistencia"
          color="bg-orange-600"
          trend="+4 hoy"
        />
        <KPICard
          icon="schedule"
          value="+14"
          label="Retardos"
          color="bg-amber-500"
        />
        <KPICard
          icon="chat"
          value="14"
          label="Comentarios"
          color="bg-purple-600"
        />
        <KPICard
          icon="verified_user"
          value="310"
          label="CCT Activo"
          color="bg-blue-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN (2/3): Action & Lists */}
        <div className="lg:col-span-2 space-y-8">
          {/* CARD 1: ACCIÓN INMEDIATA */}
          <section
            id="pref-quick-register"
            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative"
          >
            <div className="h-1 bg-amber-500 w-full"></div>
            {/* Visual feedback if student is ready */}
            {selectedStudent && !matriculaInput && (
              <div className="absolute top-2 right-2 px-3 py-1 bg-amber-100 text-amber-800 text-[10px] font-black uppercase rounded-full animate-fade-in">
                Listo para: {selectedStudent.name.split(" ")[0]}
              </div>
            )}

            <div className="p-6">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">
                  touch_app
                </span>
                Acciones Rápidas (Un toque)
              </h2>

              {/* Show instruction when no student selected */}
              {!selectedStudent && !matriculaInput && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 animate-pulse">
                  <span className="material-symbols-outlined text-amber-600">
                    info
                  </span>
                  <p className="text-xs text-amber-700 font-medium">
                    <strong>Primero:</strong> Ingrese matrícula arriba o
                    seleccione alumno del panel derecho
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <ActionButton
                  label="Retardo"
                  icon="schedule"
                  color="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200"
                  onClick={() =>
                    handleAction(
                      "Retardo",
                      IncidentType.RETARDO,
                      "Retardo (Entrada)",
                    )
                  }
                />
                <ActionButton
                  label="Uniforme"
                  icon="checkroom"
                  color="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                  onClick={() =>
                    handleAction(
                      "Uniforme",
                      IncidentType.UNIFORME,
                      "Falta de Uniforme",
                    )
                  }
                />
                <ActionButton
                  label="Falta"
                  icon="person_off"
                  color="bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                  onClick={() =>
                    handleAction(
                      "Falta",
                      IncidentType.ASISTENCIA,
                      "Inasistencia",
                    )
                  }
                />
                <ActionButton
                  label="Fuera Aula"
                  icon="outbox_alt"
                  color="bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200"
                  onClick={() =>
                    handleAction(
                      "Fuera Aula",
                      IncidentType.CONDUCTA,
                      "Alumno fuera de clase sin pase",
                    )
                  }
                />
                <ActionButton
                  label="Receso Tarde"
                  icon="timer_off"
                  color="bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200"
                  onClick={() =>
                    handleAction(
                      "Receso Tarde",
                      IncidentType.RETARDO,
                      "Retardo post-receso",
                    )
                  }
                />
                <ActionButton
                  label="Observación"
                  icon="visibility"
                  color="bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
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
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CARD 4: PATRONES */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                Patrones: Retardos por Grupo
              </h3>
              <SimpleBarChart data={groupsWithDelays} color="bg-amber-500" />
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                Top Incidencias (Estudiantes)
              </h3>
              <SimpleBarChart data={studentsWithIncidents} color="bg-red-500" />
            </section>
          </div>

          {/* CARD 2: ALUMNOS RECIENTES */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest">
                Actividad Reciente
              </h3>
              <button
                onClick={() => setCurrentModule(AppModule.REPORTES)}
                className="text-xs font-bold text-blue-600 uppercase"
              >
                Ver Bitácora
              </button>
            </div>
            <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto custom-scrollbar">
              {recentActivity.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm font-bold italic">
                  Sin actividad hoy
                </div>
              ) : (
                recentActivity.map((item, idx) => (
                  <div
                    key={idx}
                    className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-slate-400">
                        {new Date(item.date).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {item.studentName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-black px-2 py-1 bg-slate-100 rounded-lg text-slate-600">
                      {item.group}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Context & Alerts */}
        <div className="space-y-6">
          {/* CARD 3: ALERTAS ACTIVAS */}
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="material-symbols-outlined text-[60px] text-red-500">
                warning
              </span>
            </div>
            <h3 className="text-xs font-black text-red-800 uppercase tracking-widest mb-4 relative z-10">
              Alertas Críticas
            </h3>
            {activeAlerts.length === 0 ? (
              <p className="text-xs font-bold text-red-400 italic">
                Sistema estable.
              </p>
            ) : (
              <div className="space-y-2 relative z-10">
                {activeAlerts.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      setSelectedStudentId(s.id);
                      setMatriculaInput("");
                    }}
                    className="bg-white/80 p-3 rounded-xl border border-red-100 cursor-pointer hover:bg-white transition-colors"
                  >
                    <p className="text-xs font-black text-red-700 uppercase">
                      {s.name}
                    </p>
                    <p className="text-[10px] font-bold text-red-400">
                      {s.incidents.length} Incidencias detectadas
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PANEL DERECHO: CONTEXTO */}
          <div
            className={`bg-white border border-slate-200 rounded-2xl p-5 shadow-sm h-fit sticky top-6 ${selectedStudent ? "border-amber-200 ring-4 ring-amber-500/5" : ""}`}
          >
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
              Contexto Activo
            </h3>
            {selectedStudent ? (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                  <div className="w-12 h-12 bg-slate-200 rounded-full overflow-hidden">
                    {selectedStudent.avatar && (
                      <img
                        src={selectedStudent.avatar}
                        className="w-full h-full object-cover"
                        alt="avatar"
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800">
                      {selectedStudent.name}
                    </p>
                    <p className="text-xs font-bold text-slate-500">
                      {selectedStudent.group} • {selectedStudent.matricula}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 p-2 rounded-lg text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-black">
                      Incidencias
                    </p>
                    <p className="text-xl font-black text-slate-700">
                      {selectedStudent.incidents.length}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-black">
                      Estado
                    </p>
                    <p className="text-xs font-black text-amber-600">
                      {calculateState(selectedStudent.incidents)}
                    </p>
                  </div>
                </div>

                {/* Short History */}
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2">
                    Historial Breve
                  </p>
                  <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                    {selectedStudent.incidents.length === 0 ? (
                      <p className="text-[10px] text-slate-400">
                        Sin antecedentes
                      </p>
                    ) : (
                      selectedStudent.incidents.slice(0, 3).map((i) => (
                        <div
                          key={i.id}
                          className="text-[10px] border-l-2 border-slate-300 pl-2"
                        >
                          <span className="font-bold text-slate-600">
                            {i.type}
                          </span>{" "}
                          <span className="text-slate-400">
                            - {new Date(i.date).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button className="w-full py-2 bg-slate-800 text-white rounded-lg text-xs font-bold uppercase hover:bg-slate-900 transition-colors">
                    Notificar Tutor
                  </button>
                  <button className="w-full py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold uppercase hover:bg-slate-50 transition-colors">
                    Escalar a Orientación
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 opacity-50">
                <span className="material-symbols-outlined text-4xl text-slate-300">
                  person_search
                </span>
                <p className="text-xs font-bold text-slate-400 mt-2">
                  Seleccione un alumno o ingrese matrícula
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() =>
              printContent(
                "Reporte Diario",
                `<h1>Reporte Prefectura ${todayDisplay}</h1>`,
              )
            }
            className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 text-xs font-bold uppercase hover:border-slate-400 hover:text-slate-500 transition-all"
          >
            Imprimir Reporte Diario
          </button>
        </div>
      </div>
    </div>
  );
};

// --- SUBCOMPONENTS ---
const ActionButton = ({
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
    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all active:scale-95 ${color} h-28 w-full shadow-sm relative overflow-hidden group`}
  >
    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 transition-colors"></div>
    <span className="material-symbols-outlined text-3xl mb-2">{icon}</span>
    <span className="text-xs font-black uppercase leading-tight text-center relative z-10">
      {label}
    </span>
  </button>
);

const SimpleBarChart = ({
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
        <p className="text-xs text-slate-300 font-bold italic">
          Sin suficientes datos
        </p>
      )}
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 w-8 text-right uppercase">
            {d.label}
          </span>
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${color}`}
              style={{ width: `${(d.value / max) * 100}%` }}
            ></div>
          </div>
          <span className="text-[10px] font-black text-slate-700 w-4">
            {d.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const KPICard = ({
  icon,
  value,
  label,
  color,
  trend,
}: {
  icon: string;
  value: string;
  label: string;
  color: string;
  trend?: string;
}) => (
  <div
    className={`${color} rounded-2xl p-4 text-white shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-all`}
  >
    <div className="absolute top-2 right-4 opacity-20 group-hover:opacity-40 transition-opacity">
      <span className="material-symbols-outlined text-5xl">{icon}</span>
    </div>
    <div className="relative z-10 flex flex-col justify-between h-full">
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-lg">{icon}</span>
        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-black tracking-tighter">{value}</h3>
        {trend && (
          <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded">
            {trend}
          </span>
        )}
      </div>
    </div>
  </div>
);

// Ensure clean export
export default DashboardPrefectura;
