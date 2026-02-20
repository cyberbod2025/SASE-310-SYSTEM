import React, { useState, useMemo, useEffect } from "react";
import toast from "react-hot-toast";
import { useApp } from "../../store";
import { CaseState, AppModule } from "../../types";
import { supabase } from "../../supabase/client";
import { printContent } from "../PrintButtons";
// SASE Styles
import "./DashboardDireccion.css";

// --- MICRO-COMPONENTS (ATOMIC UI) ---

/**
 * KPI "Spark" Card - Small, metric-focused, alive.
 */
const KPISpark = ({
  icon,
  label,
  value,
  trend,
  colorClass,
  delay = 0,
}: {
  icon: string;
  label: string;
  value: string | number;
  trend?: string;
  colorClass: string;
  delay?: number;
}) => (
  <div
    className={`bg-white border border-slate-100 rounded-xl p-5 flex flex-col justify-between h-full animate-fade-in hover:shadow-md transition-all group cursor-default shadow-sm`}
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex justify-between items-start mb-2">
      <div
        className={`p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 group-hover:bg-white group-hover:border-slate-200 group-hover:shadow-sm transition-all ${colorClass.replace("text-white/80", "text-slate-600")}`}
      >
        <span className="material-symbols-outlined text-xl">{icon}</span>
      </div>
      {trend && (
        <span
          className={`text-xxs font-black uppercase px-2 py-0.5 rounded-full border border-slate-100 bg-slate-50 text-slate-400`}
        >
          {trend}
        </span>
      )}
    </div>
    <div>
      <h4 className="text-3xl font-black text-slate-800 tracking-tighter group-hover:scale-105 transition-transform origin-left">
        {value}
      </h4>
      <p className="text-xxs font-bold text-slate-400 uppercase tracking-widest mt-1">
        {label}
      </p>
    </div>
  </div>
);

/**
 * Status Radar - The big visual indicator of system health.
 */
const StatusRadar = ({
  status, // 'nominal' | 'warning' | 'critical'
  count,
  date,
}: {
  status: "nominal" | "warning" | "critical";
  count: number;
  date: string;
}) => {
  const config = {
    nominal: {
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      icon: "verified_user",
      msg: "SISTEMA NOMINAL",
      glow: "shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]",
    },
    warning: {
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      icon: "warning",
      msg: "ALERTA PREVENTIVA",
      glow: "shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)]",
    },
    critical: {
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      icon: "gpp_maybe",
      msg: "INTERVENCIÓN REQUERIDA",
      glow: "shadow-[0_0_40px_-10px_rgba(244,63,94,0.5)]",
    },
  };

  const current = config[status];

  return (
    <div
      className={`bg-white border border-slate-100 rounded-xl p-6 relative overflow-hidden group shadow-sm hover:shadow-md transition-all ${current.border.replace("border-", "border-l-4 border-l-")}`}
    >
      {/* Background Pulse Effect - Subtle on white */}
      <div
        className={`absolute -right-10 -top-10 w-64 h-64 bg-gradient-to-br ${current.bg} to-transparent rounded-full blur-3xl opacity-40 animate-pulse`}
      ></div>

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span
              className={`material-symbols-outlined text-2xl ${current.color} animate-pulse-ring`}
            >
              {current.icon}
            </span>
            <span
              className={`text-xs font-black uppercase tracking-widest-xl ${current.color}`}
            >
              {current.msg}
            </span>
          </div>
          <span className="text-xxs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
            {date}
          </span>
        </div>

        <div className="mt-6">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-slate-800">{count}</span>
            <span className="text-sm font-bold text-slate-400 uppercase">
              Casos Activos
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 max-w-[90%] leading-relaxed font-medium">
            {status === "critical"
              ? "Se requiere su autorización inmediata para proceder con protocolos de nivel 3."
              : status === "warning"
                ? "Monitoreo de patrones conductuales en curso. Sin desbordamientos."
                : "Operación escolar dentro de parámetros normales. Sin incidencias graves."}
          </p>
        </div>
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD COMPONENT ---

export const DashboardDireccion = () => {
  const { students, notifications, setCurrentModule } = useApp();
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [dbEvents, setDbEvents] = useState<any[]>([]);
  const [dbComunicados, setDbComunicados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH REAL DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch Events
        const { data: events, error: eventsError } = await supabase
          .from("eventos")
          .select("*")
          .gte("fecha", new Date().toISOString().split("T")[0])
          .order("fecha", { ascending: true })
          .limit(5);

        if (eventsError) throw eventsError;
        setDbEvents(events || []);

        // Fetch Comunicados (Staff Feed)
        const { data: comunicados, error: comsError } = await supabase
          .from("comunicados" as any)
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);

        if (comsError) throw comsError;
        setDbComunicados(comunicados || []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- LOGIC ---
  const criticalCases = useMemo(
    () =>
      students.filter(
        (s) =>
          s.caseState === CaseState.PATRON_DETECTADO ||
          s.caseState === CaseState.INTERVENCION,
      ),
    [students],
  );

  const status: "nominal" | "warning" | "critical" =
    criticalCases.length >= 3
      ? "critical"
      : criticalCases.length > 0
        ? "warning"
        : "nominal";

  const todayStr = new Date()
    .toLocaleDateString("es-MX", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    })
    .toUpperCase()
    .replace(".", "");

  const handleCreateReport = () => {
    printContent(
      "Reporte Ejecutivo SASE",
      `<h1>Reporte Diario</h1><p>Generado: ${new Date().toLocaleString()}</p>`,
    );
  };

  return (
    <div className="w-full h-full p-4 overflow-y-auto custom-scrollbar">
      {/* HEADER MINI - Integrated into Grid */}
      <div className="flex justify-between items-center mb-6 pl-2">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-blue-600">
              grid_view
            </span>
            Command Center
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-11">
            Dirección Escolar • SASE-310 v3.2
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCreateReport}
            className="bg-white border border-slate-200 px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-xs font-bold text-slate-600 uppercase transition-all shadow-sm hover:shadow-md rounded-lg"
          >
            <span className="material-symbols-outlined text-sm">print</span>
            Reporte
          </button>
          <button
            onClick={() => setCurrentModule(AppModule.APROBACIONES_PERSONAL)}
            className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 flex items-center gap-2 text-xs font-bold uppercase transition-all shadow-md shadow-blue-200 rounded-lg"
          >
            <span className="material-symbols-outlined text-sm">
              verified_user
            </span>
            Aprobaciones
          </button>
        </div>
      </div>

      {/* BENTO GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:grid-rows-[220px_180px_1fr] min-h-[600px]">
        {/* AREA: STATUS (Top Left - Big) */}
        <div className="lg:col-span-2 lg:row-span-1">
          <StatusRadar
            status={status}
            count={criticalCases.length}
            date={todayStr}
          />
        </div>

        {/* AREA: AGENDA (Top Right - Vertical List) */}
        <div className="lg:col-span-2 lg:row-span-2 bg-white border border-slate-100 rounded-xl p-6 flex flex-col shadow-sm">
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">event</span>
              Agenda Ejecutiva
            </h3>
            <span className="text-xxs font-bold bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded">
              HOY
            </span>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
            {dbEvents.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-30">
                <span className="material-symbols-outlined text-3xl mb-1">
                  calendar_today
                </span>
                <p className="text-[10px] uppercase font-black">
                  Sin Eventos Próximos
                </p>
              </div>
            ) : (
              dbEvents.map((ev, idx) => (
                <div
                  key={ev.id || idx}
                  className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer border border-transparent hover:border-slate-100"
                >
                  <div className="text-center min-w-[50px]">
                    <p className="text-sm font-black text-slate-700">
                      {ev.hora?.substring(0, 5) || "00:00"}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">
                      {new Date(ev.fecha).toLocaleDateString("es-MX", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                  <div className="w-0.5 bg-slate-100 group-hover:bg-blue-500/50 transition-colors"></div>
                  <div>
                    <p className="text-sm font-bold text-slate-600 group-hover:text-blue-700 transition-colors">
                      {ev.titulo}
                    </p>
                    <p className="text-xs text-slate-400 capitalize">
                      {ev.tipo}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center hover:bg-slate-50 cursor-pointer transition-colors mt-4">
              <span className="material-symbols-outlined text-slate-400">
                add
              </span>
              <p className="text-xxs font-bold text-slate-400 uppercase mt-1">
                Agendar Evento
              </p>
            </div>
          </div>
        </div>

        {/* AREA: KPIs (Middle Row - 2 Blocks because of col-span logic) */}
        <div className="lg:col-span-1 lg:row-span-1">
          <KPISpark
            icon="group"
            label="Inscritos"
            value={students.length}
            colorClass="text-blue-400"
            delay={100}
          />
        </div>
        <div className="lg:col-span-1 lg:row-span-1">
          <KPISpark
            icon="trending_up"
            label="Asistencia"
            value="98.5%"
            trend="+0.2%"
            colorClass="text-emerald-400"
            delay={200}
          />
        </div>

        {/* AREA: FEED (Bottom Left - Wide) */}
        <div className="lg:col-span-2 lg:row-span-1 bg-white border border-slate-100 rounded-xl p-4 flex flex-col shadow-sm">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 pl-2">
            Feed del Plantel
          </h3>
          <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar max-h-[300px]">
            {dbComunicados.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full opacity-30">
                <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">
                  inbox
                </span>
                <p className="text-xs font-bold uppercase text-slate-400">
                  Sin Novedades
                </p>
              </div>
            ) : (
              dbComunicados.map((n) => (
                <div
                  key={n.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 hover:bg-white hover:shadow-sm transition-all border border-slate-100"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 ${n.tipo === "urgente" ? "bg-rose-500 shadow-sm" : "bg-blue-500"}`}
                  ></div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">
                      {n.titulo}
                    </p>
                    <p className="text-[10px] text-slate-500 line-clamp-2">
                      {n.descripcion}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono ml-auto">
                    {new Date(n.created_at).toLocaleTimeString("es-MX", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AREA: DECISION / CONTEXT (Bottom Right - Action) */}
        <div className="lg:col-span-2 lg:row-span-1 bg-white border border-slate-100 rounded-xl p-6 relative overflow-hidden shadow-sm hover:shadow-md transition-all">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none"></div>

          {selectedAlertId ? (
            <div className="relative z-10 h-full flex flex-col justify-center animate-fade-in-up">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-rose-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-rose-500/30">
                  {criticalCases
                    .find((c) => c.id === selectedAlertId)
                    ?.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">
                    {criticalCases.find((c) => c.id === selectedAlertId)?.name}
                  </h3>
                  <p className="text-xs font-bold text-rose-500 uppercase tracking-widest">
                    Expediente Crítico Abierto
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => toast.success("Protocolo Iniciado")}
                  className="p-3 bg-slate-800 text-white rounded-xl font-bold text-xs uppercase hover:bg-slate-900 transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">
                    campaign
                  </span>
                  Citar Tutores
                </button>
                <button
                  onClick={() => setSelectedAlertId(null)}
                  className="p-3 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold text-xs uppercase hover:bg-slate-50 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Archivar Caso
                </button>
              </div>
            </div>
          ) : (
            <div className="relative z-10 h-full flex flex-col justify-center items-center text-center opacity-50 hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-5xl mb-2 text-slate-300">
                touch_app
              </span>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Seleccione un caso activo <br /> para desplegar controles
              </p>
            </div>
          )}

          {/* Critical Cases Horizontal Scroll - Always visible at bottom if cases exist */}
          {criticalCases.length > 0 && !selectedAlertId && (
            <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto pb-2 z-50 pointer-events-auto custom-scrollbar">
              {criticalCases.map((c) => (
                <button
                  key={c.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Selecionando caso:", c.id);
                    setSelectedAlertId(c.id);
                  }}
                  className="flex-shrink-0 px-4 py-2 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold uppercase rounded-lg hover:bg-rose-100 hover:scale-105 transition-all whitespace-nowrap cursor-pointer z-50 relative shadow-sm"
                >
                  {c.name.split(" ")[0]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardDireccion;
