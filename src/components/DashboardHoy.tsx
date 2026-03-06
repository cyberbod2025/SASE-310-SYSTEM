import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useApp } from "../store";
import { UserRole, AppModule, IncidentType, CaseState } from "../types";

export const DashboardHoy: React.FC = () => {
  const { currentUserRole, setCurrentModule, students, openQuickRegister } =
    useApp();

  // Métrica base: Alumnos con incidencias activas
  const activeCases = useMemo(
    () => students.filter((s) => s.caseState !== CaseState.CERRADO),
    [students],
  );

  // Alertas Médicas
  const medicalAlerts = useMemo(
    () => students.filter((s) => s.medicalAlerts && s.medicalAlerts.length > 0),
    [students],
  );

  // Incidencias del día (Mockup o filtrado por fecha actual)
  const todayStr = new Date().toISOString().split("T")[0];
  const todayIncidents = useMemo(() => {
    return students.reduce((acc, s) => {
      const todayCount = s.incidents.filter((inc) =>
        inc.date.startsWith(todayStr),
      ).length;
      return acc + todayCount;
    }, 0);
  }, [students, todayStr]);

  const getRoleLabel = () => {
    switch (currentUserRole) {
      case UserRole.DOCENTE:
        return "NÚCLEO DOCENTE";
      case UserRole.PREFECTURA:
        return "NÚCLEO PREFECTURA";
      case UserRole.DIRECTIVO:
        return "NÚCLEO DIRECCIÓN";
      case UserRole.ORIENTACION:
        return "NUCLEO ORIENTACIÓN";
      case UserRole.MEDICO_ESCOLAR:
        return "NÚCLEO MÉDICO";
      case UserRole.TRABAJO_SOCIAL:
        return "NÚCLEO TRABAJO SOCIAL";
      default:
        return "MODO OPERATIVO";
    }
  };

  const getRoleTip = () => {
    switch (currentUserRole) {
      case UserRole.DOCENTE:
        return "Revisa las incidencias de tus grupos asignados y registra asistencia.";
      case UserRole.PREFECTURA:
        return "Monitorea la convivencia escolar y reporta novedades en tiempo real.";
      case UserRole.DIRECTIVO:
        return "Visión global del pulso institucional y casos de alta prioridad.";
      case UserRole.ORIENTACION:
        return "Seguimiento de trayectorias y citas de acompañamiento emocional.";
      case UserRole.MEDICO_ESCOLAR:
        return "Atención a alertas de salud y administración del inventario clínico.";
      case UserRole.TRABAJO_SOCIAL:
        return "Gestión de visitas domiciliarias y vinculación con familias.";
      default:
        return "Bienvenido al sistema integral de gestión escolar SASE 310.";
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white p-6 md:p-12 font-sans overflow-x-hidden relative">
      {/* HUD Background Effects */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/4 w-px h-full bg-blue-500/10"></div>
        <div className="absolute top-0 right-1/4 w-px h-full bg-blue-500/10"></div>
        <div className="absolute left-0 top-1/3 w-full h-px bg-blue-500/10"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto relative z-10"
      >
        {/* Header */}
        <header className="mb-12 border-l-4 border-blue-600 pl-6 py-2">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">
                HOY EN LA{" "}
                <span className="text-blue-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                  ESCUELA
                </span>
              </h1>
              <div className="flex items-center gap-4 mt-3">
                <span className="text-[10px] md:text-xs font-black text-blue-400/70 tracking-[0.4em] uppercase">
                  Estado del día — SASE 310
                </span>
                <span className="text-[10px] font-black bg-blue-600/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20 uppercase tracking-widest">
                  {getRoleLabel()}
                </span>
              </div>
              <p className="mt-4 text-slate-400 text-xs font-bold uppercase tracking-widest max-w-lg">
                {getRoleTip()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none">
                {new Date().toLocaleDateString("es-MX", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-2xl font-black text-white/40 italic font-mono tabular-nums">
                {new Date().getHours()}:
                {new Date().getMinutes().toString().padStart(2, "0")}
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 1. ALERTAS */}
          <section className="space-y-6">
            <h2 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.5em] flex items-center gap-3">
              <span className="size-2 bg-rose-500 rounded-full animate-ping"></span>
              1. ALERTAS PRIORITARIAS
            </h2>

            <div className="space-y-4">
              {/* Incidencias Abiertas */}
              <div className="card-sase p-5 border-rose-500/20 bg-rose-500/[0.02] group hover:bg-rose-500/[0.05] transition-all cursor-pointer">
                <div className="flex justify-between items-start">
                  <span className="material-symbols-outlined text-rose-500">
                    warning
                  </span>
                  <span className="text-2xl font-black text-white italic font-mono">
                    {activeCases.length}
                  </span>
                </div>
                <h3 className="text-xs font-black text-white uppercase tracking-tight mt-2">
                  Incidencias Abiertas
                </h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">
                  Requieren seguimiento hoy
                </p>
              </div>

              {/* Alertas Médicas */}
              <div className="card-sase p-5 border-blue-500/20 bg-blue-500/[0.02] group hover:bg-blue-500/[0.05] transition-all cursor-pointer">
                <div className="flex justify-between items-start">
                  <span className="material-symbols-outlined text-blue-500">
                    medical_services
                  </span>
                  <span className="text-2xl font-black text-white italic font-mono">
                    {medicalAlerts.length}
                  </span>
                </div>
                <h3 className="text-xs font-black text-white uppercase tracking-tight mt-2">
                  Alertas Médicas
                </h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">
                  Alumnos con condiciones críticas
                </p>
              </div>

              {/* Alumnos Reincidentes */}
              <div className="card-sase p-5 border-amber-500/20 bg-amber-500/[0.02] group hover:bg-amber-500/[0.05] transition-all cursor-pointer">
                <div className="flex justify-between items-start">
                  <span className="material-symbols-outlined text-amber-500">
                    error
                  </span>
                  <span className="text-2xl font-black text-white italic font-mono">
                    {students.filter((s) => s.incidents.length > 2).length}
                  </span>
                </div>
                <h3 className="text-xs font-black text-white uppercase tracking-tight mt-2">
                  Patrones Detectados
                </h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">
                  Alumnos reincidentes (3+ faltas)
                </p>
              </div>
            </div>
          </section>

          {/* 2. ACTIVIDAD DEL DÍA */}
          <section className="space-y-6">
            <h2 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.5em] flex items-center gap-3">
              <span className="size-2 bg-amber-500 rounded-full animate-pulse"></span>
              2. FLUJO OPERATIVO
            </h2>

            <div className="card-sase p-0 border-white/5 overflow-hidden h-[450px] flex flex-col">
              <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Últimos Registros
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                  <div className="size-10 rounded bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <span className="material-symbols-outlined text-blue-400 text-sm">
                      edit_note
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white uppercase">
                      {todayIncidents} Incidencias
                    </p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">
                      Registradas hoy
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                  <div className="size-10 rounded bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <span className="material-symbols-outlined text-emerald-400 text-sm">
                      task_alt
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white uppercase">
                      0 Reportes
                    </p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">
                      Cerrados institucionalmente
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <span className="material-symbols-outlined text-indigo-400 text-sm">
                      groups
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white uppercase">
                      12 Grupos
                    </p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">
                      Con actividad monitoreada
                    </p>
                  </div>
                </div>

                {/* Visualizer Bar */}
                <div className="mt-8">
                  <div className="flex justify-between mb-2">
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">
                      Nivel de Alerta Plantel
                    </span>
                    <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">
                      Estable
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-[15%] bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SASE PROMISE: Hook for the user */}
          <section className="mt-8 rounded-3xl bg-gradient-to-br from-indigo-900/40 via-blue-900/20 to-transparent border border-blue-500/20 p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-blue-400 rotate-12">
                verified_user
              </span>
            </div>
            <div className="relative z-10 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">
                  Protocolo SASE Activo
                </span>
              </div>
              <h3 className="text-xl font-black text-white italic lowercase leading-tight tracking-tighter">
                reporta en <span className="text-blue-400">3 clics</span> y{" "}
                <br />
                siéntete{" "}
                <span className="text-indigo-400 underline decoration-indigo-500/50">
                  respaldado
                </span>
                .
              </h3>
              <p className="text-[10px] text-slate-400 max-w-[240px] mt-2 font-medium leading-relaxed">
                La IA procesa, notifica a directivos y genera el acta oficial al
                instante. Tu prioridad es el alumno, la nuestra es el proceso.
              </p>
            </div>
          </section>

          {/* 3. ACCIONES INMEDIATAS */}
          <section className="space-y-6">
            <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] flex items-center gap-3">
              <span className="material-symbols-outlined text-sm">
                ads_click
              </span>
              3. ACCIONES INMEDIATAS
            </h2>

            <div className="space-y-4">
              <button
                onClick={() => openQuickRegister()}
                className="w-full card-sase p-6 bg-blue-600/10 border-blue-500/30 hover:bg-blue-600 hover:border-blue-500 transition-all group relative overflow-hidden text-left"
              >
                <div className="absolute top-0 right-0 p-3">
                  <span className="text-[7px] font-black bg-blue-500 text-white px-2 py-0.5 rounded uppercase tracking-widest">
                    3 Clics
                  </span>
                </div>
                <div className="relative z-10 flex items-center gap-4">
                  <div className="size-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-white group-hover:text-blue-600 transition-all shadow-inner">
                    <span className="material-symbols-outlined text-3xl">
                      bolt
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase italic tracking-tighter">
                      Reporte Inmediato
                    </h3>
                    <p className="text-[9px] text-blue-400 group-hover:text-white/60 font-black uppercase tracking-widest">
                      Activa protocolos en segundos
                    </p>
                  </div>
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                  <span className="material-symbols-outlined">
                    arrow_forward
                  </span>
                </div>
              </button>

              <button
                onClick={() => setCurrentModule(AppModule.DASHBOARD)}
                className="w-full card-sase p-6 bg-white/[0.02] border-white/10 hover:border-white/30 transition-all group relative overflow-hidden text-left"
              >
                <div className="relative z-10 flex items-center gap-4">
                  <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">
                    person_search
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase italic tracking-tighter">
                      Buscar Alumno
                    </h3>
                    <p className="text-[9px] text-slate-500 group-hover:text-white/60 font-black uppercase tracking-widest">
                      Consulta de expedientes
                    </p>
                  </div>
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                  <span className="material-symbols-outlined">
                    chevron_right
                  </span>
                </div>
              </button>

              <button
                onClick={() => setCurrentModule(AppModule.REPORTES)}
                className="w-full card-sase p-6 bg-white/[0.02] border-white/10 hover:border-white/30 transition-all group relative overflow-hidden text-left"
              >
                <div className="relative z-10 flex items-center gap-4">
                  <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">
                    visibility
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase italic tracking-tighter">
                      Ver Alertas
                    </h3>
                    <p className="text-[9px] text-slate-500 group-hover:text-white/60 font-black uppercase tracking-widest">
                      Monitor de riesgos
                    </p>
                  </div>
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                  <span className="material-symbols-outlined">
                    chevron_right
                  </span>
                </div>
              </button>
            </div>

            {/* Main CTA */}
            <div className="pt-8">
              <button
                onClick={() => setCurrentModule(AppModule.HOME)}
                className="w-full py-4 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <span>ENTRAR AL SASE CORE</span>
                <span className="material-symbols-outlined text-sm">login</span>
              </button>
              <p className="text-[8px] text-center text-slate-600 font-black uppercase tracking-[0.5em] mt-4">
                Sistema de Acompañamiento Socioemocional
              </p>
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
};
