import React, { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { useApp } from "../../store";
import { CaseState, AppModule, UserRole } from "../../types";
import { printContent } from "../PrintButtons";

export const DashboardDireccion = () => {
  const { students, notifications, setCurrentModule } = useApp();
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);

  // --- IDENTITY & UTILS ---
  const todayDisplay = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // --- DATA PROCESSING ---
  // 1. Critical Alerts (Semaphore)
  const criticalCases = useMemo(
    () =>
      students.filter(
        (s) =>
          s.caseState === CaseState.PATRON_DETECTADO ||
          s.caseState === CaseState.INTERVENCION,
      ),
    [students],
  );

  const highRiskCount = criticalCases.length;
  const semaphoreStatus =
    highRiskCount === 0 ? "green" : highRiskCount < 3 ? "yellow" : "red";

  // 2. Requests (Solicitudes) - Derived from Notifications for now, split by 'urgency' (mocked logic)
  const [urgentRequests, scheduledRequests] = useMemo(() => {
    const urgent: any[] = [];
    const scheduled: any[] = [];
    notifications.forEach((n) => {
      if (n.type === "error" || n.type === "warning") urgent.push(n);
      else scheduled.push(n);
    });
    return [urgent, scheduled];
  }, [notifications]);

  // --- MOCK CALENDAR EVENTS ---
  const calendarEvents = [
    {
      id: 1,
      title: "Consejo Técnico Escolar",
      time: "09:00 AM",
      type: "institutional",
    },
    {
      id: 2,
      title: "Revisión 2º Grado (Prefectura)",
      time: "11:30 AM",
      type: "operational",
    },
    { id: 3, title: "Cierre de Actas", time: "14:00 PM", type: "admin" },
  ];

  // --- ACTIONS ---
  const handleSendCircular = () => {
    toast.success("Circular enviada a todo el personal (Simulación)");
  };

  const handleCloseCase = () => {
    toast.success("Caso cerrado y archivado con evidencia.");
    setSelectedAlertId(null);
  };

  return (
    <div className="flex-1 w-full space-y-6 animate-fade-in pb-12">
      {/* HEADER: Institutional Identity */}
      <header
        id="dashboard-header"
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-red-200 pb-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-red-900 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/20 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)]"></div>
            <span className="material-symbols-outlined text-3xl">
              account_balance
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              Dirección
            </h1>
            <p className="text-xs font-bold text-red-800 uppercase tracking-widest flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full animate-pulse ${semaphoreStatus === "red" ? "bg-red-600" : semaphoreStatus === "yellow" ? "bg-amber-500" : "bg-emerald-500"}`}
              ></span>
              Gestión Estratégica • {todayDisplay}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            id="export-btn"
            onClick={() =>
              printContent("Informe Ejecutivo", "<h1>Informe de Dirección</h1>")
            }
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold uppercase hover:bg-slate-50 text-slate-600 shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">print</span>{" "}
            Informe
          </button>
          <button
            onClick={handleSendCircular}
            className="px-4 py-2 bg-red-900 text-white rounded-lg text-xs font-bold uppercase hover:bg-red-800 shadow-lg shadow-red-900/20 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">add_alert</span>{" "}
            Nuevo Aviso
          </button>
        </div>
      </header>

      {/* KPI GRID: TOP STATS FROM IMAGE (Director View) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KPICard
          id="kpi-risk"
          icon="crisis_alert"
          value={criticalCases.length.toString()}
          label="Casos Críticos"
          color="bg-red-900"
          trend="Semáforo Rojo"
        />
        <KPICard
          id="kpi-assist"
          icon="rocket_launch"
          value="98%"
          label="Eficiencia"
          color="bg-slate-800"
        />
        <KPICard
          icon="badge"
          value="42"
          label="Personal Activo"
          color="bg-blue-900"
        />
        <KPICard
          icon="query_stats"
          value="SASE"
          label="Estado Sistema"
          color="bg-emerald-800"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CENTRAL ZONE (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. CRITICAL ALERTS BANNER */}
          <section
            className={`rounded-2xl border-l-4 shadow-sm p-6 flex items-start gap-4 relative overflow-hidden ${
              semaphoreStatus === "red"
                ? "bg-red-50 border-red-600"
                : semaphoreStatus === "yellow"
                  ? "bg-amber-50 border-amber-500"
                  : "bg-emerald-50 border-emerald-500"
            }`}
          >
            <div
              className={`p-3 rounded-full ${semaphoreStatus === "red" ? "bg-red-100 text-red-700" : semaphoreStatus === "yellow" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}
            >
              <span className="material-symbols-outlined text-2xl">
                {semaphoreStatus === "red"
                  ? "gpp_bad"
                  : semaphoreStatus === "yellow"
                    ? "warning"
                    : "verified"}
              </span>
            </div>
            <div className="flex-1 relative z-10">
              <h3
                className={`text-lg font-black uppercase tracking-tight ${semaphoreStatus === "red" ? "text-red-800" : "text-slate-800"}`}
              >
                {semaphoreStatus === "red"
                  ? "Atención Prioritaria Requerida"
                  : semaphoreStatus === "yellow"
                    ? "Riesgos Detectados"
                    : "Operación Nominal"}
              </h3>
              <p className="text-sm font-medium text-slate-600 mt-1">
                {criticalCases.length} casos críticos requieren decisión
                directiva hoy.
              </p>
              {criticalCases.length > 0 && (
                <div
                  id="panel-risk-groups"
                  className="flex gap-2 mt-4 overflow-x-auto"
                >
                  {criticalCases.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => setSelectedAlertId(s.id)}
                      className="flex-shrink-0 bg-white border border-slate-200 px-3 py-2 rounded-lg cursor-pointer hover:border-red-300 transition-colors shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        <span className="text-xs font-bold text-slate-700 uppercase">
                          {s.name.split(" ")[0]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 2. REQUESTS (Solicitudes) */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">
                    inbox
                  </span>{" "}
                  Solicitudes
                </h3>
                <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {notifications.length}
                </span>
              </div>
              <div className="flex-1 p-2 space-y-2">
                {urgentRequests.length > 0 && (
                  <div className="mb-2">
                    <p className="text-[10px] uppercase font-bold text-red-400 pl-2 mb-1">
                      Urgente (Hoy)
                    </p>
                    {urgentRequests.map((n) => (
                      <div
                        key={n.id}
                        className="p-3 bg-red-50/50 border-l-2 border-red-500 rounded-r-lg hover:bg-red-50 transition-colors"
                      >
                        <p className="text-xs font-bold text-red-900">
                          {n.title}
                        </p>
                        <p className="text-[10px] text-red-700/80">
                          {n.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 pl-2 mb-1">
                    Agendado / Revisión
                  </p>
                  {scheduledRequests.length === 0 ? (
                    <p className="text-xs text-slate-300 italic p-4 text-center">
                      Bandeja al día
                    </p>
                  ) : (
                    scheduledRequests.map((n) => (
                      <div
                        key={n.id}
                        className="p-3 bg-slate-50 border border-slate-100 rounded-lg hover:bg-white hover:shadow-sm transition-all"
                      >
                        <p className="text-xs font-bold text-slate-700">
                          {n.title}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            {/* 3. INSTITUTIONAL COMMUNICATION */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full">
              <div className="p-5 border-b border-slate-100">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">
                    campaign
                  </span>{" "}
                  Comunicación Oficial
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleSendCircular}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors flex flex-col items-center gap-2 text-center group"
                  >
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-blue-600 transition-colors">
                      forward_to_inbox
                    </span>
                    <span className="text-[10px] font-bold text-slate-600 uppercase">
                      Circular General
                    </span>
                  </button>
                  <button className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors flex flex-col items-center gap-2 text-center group">
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-amber-600 transition-colors">
                      event_note
                    </span>
                    <span className="text-[10px] font-bold text-slate-600 uppercase">
                      Recordatorio CTE
                    </span>
                  </button>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">
                    Solicitar Acción a Rol:
                  </p>
                  <div className="flex gap-2 text-[10px] font-bold text-slate-500">
                    <button className="px-3 py-1.5 bg-slate-100 rounded-full hover:bg-slate-200">
                      Prefectura
                    </button>
                    <button className="px-3 py-1.5 bg-slate-100 rounded-full hover:bg-slate-200">
                      Trabajo Social
                    </button>
                    <button className="px-3 py-1.5 bg-slate-100 rounded-full hover:bg-slate-200">
                      Docentes
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Admin Shortcuts/Audit */}
          <div className="p-4 bg-slate-800 rounded-2xl text-white/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white mb-1">
                Auditoría y Supervisión
              </p>
              <p className="text-[10px] opacity-60">
                Última sincronización: {new Date().toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={() => setCurrentModule(AppModule.APROBACIONES_PERSONAL)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold uppercase backdrop-blur-sm transition-colors border border-white/10"
            >
              Aprobaciones de Personal
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: AGENDA & DECISION */}
        <div className="space-y-6">
          {/* AGENDA / CALENDAR */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                Agenda del Día
              </h3>
              <span className="material-symbols-outlined text-slate-300">
                calendar_month
              </span>
            </div>
            <div className="space-y-4 relative">
              {/* Time Line Line */}
              <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-100"></div>

              {calendarEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="relative flex items-start gap-4 z-10"
                >
                  <div className="w-10 text-[10px] font-black text-slate-400 text-right pt-1">
                    {ev.time.split(" ")[0]}
                  </div>
                  <div
                    className={`w-2.5 h-2.5 rounded-full mt-1.5 border-2 border-white shadow-sm ${ev.type === "institutional" ? "bg-red-500" : ev.type === "admin" ? "bg-blue-500" : "bg-amber-500"}`}
                  ></div>
                  <div className="flex-1 pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                    <p className="text-xs font-bold text-slate-700">
                      {ev.title}
                    </p>
                    <p className="text-[10px] text-slate-400 capitalize">
                      {ev.type}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* DECISION PANEL (Context Sensitive) */}
          <section
            className={`bg-white border border-slate-200 rounded-2xl p-6 shadow-sm transition-all ${selectedAlertId ? "ring-4 ring-red-500/10 border-red-200" : ""}`}
          >
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
              {selectedAlertId ? "Panel de Decisión" : "Seleccione una alerta"}
            </h3>

            {selectedAlertId ? (
              <div className="animate-fade-in space-y-4">
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-[10px] font-black text-red-400 uppercase mb-1">
                    Caso Seleccionado
                  </p>
                  <p className="text-sm font-bold text-red-900">
                    {students.find((s) => s.id === selectedAlertId)?.name}
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    Patrón de conducta reincidente (Nivel 3).
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Acciones Directivas
                  </p>
                  <button
                    onClick={() =>
                      toast.success("Protocolo de Citatorio Urgente activado.")
                    }
                    className="w-full py-3 bg-slate-800 text-white rounded-lg text-xs font-bold uppercase hover:bg-slate-900 transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">
                      gavel
                    </span>
                    Citar Tutores (Urgente)
                  </button>
                  <button
                    onClick={handleCloseCase}
                    className="w-full py-3 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold uppercase hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">
                      check_circle
                    </span>
                    Cerrar con Evidencia
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 opacity-40">
                <span className="material-symbols-outlined text-5xl text-slate-300">
                  policy
                </span>
                <p className="text-xs font-bold text-slate-400 mt-3">
                  Sin caso seleccionado
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

const KPICard = ({
  id,
  icon,
  value,
  label,
  color,
  trend,
}: {
  id?: string;
  icon: string;
  value: string;
  label: string;
  color: string;
  trend?: string;
}) => (
  <div
    id={id}
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

export default DashboardDireccion;
