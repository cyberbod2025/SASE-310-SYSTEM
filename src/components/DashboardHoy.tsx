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
        <header id="dashboard-header" className="mb-16 border-l-[6px] border-blue-600 pl-8 py-4 relative">
          <div className="absolute -left-[6px] top-0 h-full w-[6px] bg-blue-400 blur-[8px] opacity-40"></div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="relative">
              <h1 className="text-5xl md:text-8xl font-black title-sase italic leading-none text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                HOY EN LA{" "}
                <span className="text-blue-500 text-glow-blue">
                  ESCUELA
                </span>
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <span className="text-[10px] md:text-xs font-black text-blue-400/80 tracking-[0.4em] uppercase font-mono">
                    SASE 310 // SYSTEM_ACTIVE
                  </span>
                </div>
                <span className="text-[10px] font-black bg-blue-600/20 text-blue-400 px-4 py-1.5 rounded-lg border border-blue-500/30 uppercase tracking-[0.2em] backdrop-blur-md">
                  {getRoleLabel()}
                </span>
              </div>
              <p className="mt-6 text-slate-400 text-[11px] font-bold uppercase tracking-widest max-w-xl leading-relaxed border-l border-white/10 pl-4">
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
              <motion.div 
                id="kpi-risk" 
                whileHover={{ scale: 1.02, translateY: -5 }}
                className="glass-card-quantum p-6 border-rose-500/20 group hover:border-rose-500/40 transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 blur-[20px] rounded-bl-full"></div>
                <div className="glass-shine opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex justify-between items-start relative z-10">
                  <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
                    <span className="material-symbols-outlined text-rose-500 text-2xl drop-shadow-[0_0_10px_rgba(244,63,94,0.4)]">
                      warning
                    </span>
                  </div>
                  <span className="text-4xl font-black text-white italic font-mono title-sase text-glow-blue">
                    {activeCases.length}
                  </span>
                </div>
                <h3 className="text-xs font-black text-white uppercase tracking-[0.1em] mt-4 relative z-10 font-sans">
                  Incidencias Abiertas
                </h3>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black mt-1 relative z-10">
                  CRITICAL_FOLLOW_UP_REQUIRED
                </p>
              </motion.div>

              {/* Alertas Médicas */}
              <motion.div 
                id="kpi-assist" 
                whileHover={{ scale: 1.02, translateY: -5 }}
                className="glass-card-quantum p-6 border-blue-500/20 group hover:border-blue-500/40 transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-[20px] rounded-bl-full"></div>
                <div className="glass-shine opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex justify-between items-start relative z-10">
                  <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <span className="material-symbols-outlined text-blue-500 text-2xl drop-shadow-[0_0_10px_rgba(59,130,246,0.4)]">
                      medical_services
                    </span>
                  </div>
                  <span className="text-4xl font-black text-white italic font-mono title-sase text-glow-blue">
                    {medicalAlerts.length}
                  </span>
                </div>
                <h3 className="text-xs font-black text-white uppercase tracking-[0.1em] mt-4 relative z-10 font-sans">
                  Alertas Médicas
                </h3>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black mt-1 relative z-10">
                  HEALTH_MONITOR_ACTIVE
                </p>
              </motion.div>

              {/* Alumnos Reincidentes */}
              <motion.div 
                whileHover={{ scale: 1.02, translateY: -5 }}
                className="glass-card-quantum p-6 border-amber-500/20 group hover:border-amber-500/40 transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-[20px] rounded-bl-full"></div>
                <div className="glass-shine opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex justify-between items-start relative z-10">
                  <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                    <span className="material-symbols-outlined text-amber-500 text-2xl drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]">
                      error
                    </span>
                  </div>
                  <span className="text-4xl font-black text-white italic font-mono title-sase text-glow-blue">
                    {students.filter((s) => s.incidents.length > 2).length}
                  </span>
                </div>
                <h3 className="text-xs font-black text-white uppercase tracking-[0.1em] mt-4 relative z-10 font-sans">
                  Patrones Detectados
                </h3>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black mt-1 relative z-10">
                  RECURRING_PATTERN_DETECTION
                </p>
              </motion.div>
            </div>
          </section>

          {/* 2. ACTIVIDAD DEL DÍA */}
          <section className="space-y-6">
            <h2 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.5em] flex items-center gap-3">
              <span className="size-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]"></span>
              2. FLUJO OPERATIVO
            </h2>

            <div className="glass-card-quantum p-0 border-white/5 overflow-hidden h-[450px] flex flex-col relative group">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/[0.02] to-transparent pointer-events-none"></div>
              <div className="p-5 border-b border-white/5 bg-white/[0.03] flex justify-between items-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
                  HISTORIAL_REAL_TIME
                </p>
                <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar relative z-10">
                <div className="flex items-center gap-5 border-b border-white/5 pb-5 group/item transition-all hover:pl-2">
                  <div className="size-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[inset_0_0_15px_rgba(59,130,246,0.1)]">
                    <span className="material-symbols-outlined text-blue-400 text-xl group-hover/item:scale-110 transition-transform">
                      edit_note
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-tight">
                      {todayIncidents} Incidencias
                    </p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                      Sincronizadas con SASE Core
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-5 border-b border-white/5 pb-5 group/item transition-all hover:pl-2 text-glow-blue">
                  <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[inset_0_0_15px_rgba(16,185,129,0.1)]">
                    <span className="material-symbols-outlined text-emerald-400 text-xl group-hover/item:scale-110 transition-transform">
                      task_alt
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-tight">
                      Estado Operativo: Óptimo
                    </p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                      Sin bloqueos institucionales
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-5 group/item transition-all hover:pl-2">
                  <div className="size-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-[inset_0_0_15px_rgba(99,102,241,0.1)]">
                    <span className="material-symbols-outlined text-indigo-400 text-xl group-hover/item:scale-110 transition-transform">
                      groups
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-tight">
                      Monitor Grupal
                    </p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                      Seguimiento activo de 12 núcleos
                    </p>
                  </div>
                </div>

                {/* Visualizer Bar */}
                <div className="mt-10 pt-6 border-t border-white/5">
                  <div className="flex justify-between mb-3">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] font-mono">
                      PLANT_SAFETY_LEVEL
                    </span>
                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest animate-pulse">
                      ESTABLE_SECURE
                    </span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/10">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '15%' }}
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                    ></motion.div>
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
              <span className="material-symbols-outlined text-sm animate-bounce">
                ads_click
              </span>
              3. ACCIONES INMEDIATAS
            </h2>

            <div className="space-y-5">
              <button
                id="quick-register-btn"
                onClick={() => openQuickRegister()}
                className="w-full glass-card-quantum p-7 border-blue-500/30 hover:border-blue-400 transition-all group relative overflow-hidden text-left shadow-[0_0_30px_rgba(59,130,246,0.1)]"
              >
                <div className="absolute top-0 right-0 p-4">
                  <span className="text-[8px] font-black bg-blue-600 text-white px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-blue-500/40 border border-blue-400/30">
                    PROTOCOL_FAST
                  </span>
                </div>
                <div className="relative z-10 flex items-center gap-5">
                  <div className="size-16 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] transition-all duration-500 shadow-inner border border-blue-500/30">
                    <span className="material-symbols-outlined text-4xl">
                      bolt
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase italic tracking-tighter title-sase">
                      Reporte Inmediato
                    </h3>
                    <p className="text-[10px] text-blue-400 group-hover:text-white/80 font-black uppercase tracking-[0.2em] mt-1 transition-colors">
                      ACTIVA_PROTOCOLO_ALFA
                    </p>
                  </div>
                </div>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                  <span className="material-symbols-outlined text-blue-400">
                    arrow_forward_ios
                  </span>
                </div>
              </button>

              <button
                onClick={() => setCurrentModule(AppModule.DASHBOARD)}
                className="w-full glass-card-quantum p-7 border-white/5 hover:border-white/20 transition-all group relative overflow-hidden text-left"
              >
                <div className="relative z-10 flex items-center gap-5">
                  <div className="size-14 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-white/10 group-hover:text-white transition-all border border-white/10">
                    <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">
                      person_search
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white uppercase italic tracking-tighter title-sase">
                      Buscar Alumno
                    </h3>
                    <p className="text-[10px] text-slate-600 group-hover:text-slate-400 font-black uppercase tracking-[0.2em] mt-1">
                      DIRECTORY_ACCESS_RESTRICTED
                    </p>
                  </div>
                </div>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                  <span className="material-symbols-outlined text-white/40 font-light">
                    trending_flat
                  </span>
                </div>
              </button>

              <button
                onClick={() => setCurrentModule(AppModule.REPORTES)}
                className="w-full glass-card-quantum p-7 border-white/5 hover:border-white/20 transition-all group relative overflow-hidden text-left"
              >
                <div className="relative z-10 flex items-center gap-5">
                  <div className="size-14 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-white/10 group-hover:text-white transition-all border border-white/10">
                    <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">
                      visibility
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white uppercase italic tracking-tighter title-sase">
                      Ver Alertas
                    </h3>
                    <p className="text-[10px] text-slate-600 group-hover:text-slate-400 font-black uppercase tracking-[0.2em] mt-1">
                      THREAT_MONITOR_CENTRAL
                    </p>
                  </div>
                </div>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                  <span className="material-symbols-outlined text-white/40 font-light">
                    trending_flat
                  </span>
                </div>
              </button>
            </div>

            {/* Main CTA */}
            <div className="pt-10">
              <button
                onClick={() => setCurrentModule(AppModule.HOME)}
                className="w-full py-5 bg-gradient-to-r from-blue-700 via-indigo-800 to-indigo-950 hover:from-blue-600 hover:via-indigo-700 hover:to-indigo-900 text-white font-black uppercase tracking-[0.4em] rounded-2xl shadow-[0_20px_40px_rgba(59,130,246,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-4 border border-white/10 group"
              >
                <span className="title-sase text-xs">ENTRAR AL SASE CORE</span>
                <span className="material-symbols-outlined text-base group-hover:translate-x-2 transition-transform">login</span>
              </button>
              <p className="text-[9px] text-center text-slate-600 font-black uppercase tracking-[0.6em] mt-6 opacity-60">
                SISTEMA_ACOMPAÑAMIENTO_SOCIOEMOCIONAL_V3.1
              </p>
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
};
