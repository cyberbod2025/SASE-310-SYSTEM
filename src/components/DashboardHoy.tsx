import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "./ui/GlassCard";
import { GlassButton } from "./ui/GlassButton";
import { useApp } from "../store";
import { AppModule, CaseState, IncidentType, UserRole } from "../types";

export const DashboardHoy = () => {
  const {
    students,
    setCurrentModule,
    currentUserRole,
    currentUserProfile,
    openQuickRegister,
  } = useApp();

  const activeCases = useMemo(
    () => students.filter((s) => s.caseState !== CaseState.CERRADO),
    [students],
  );

  const todayStr = new Date().toISOString().split("T")[0];
  const todayIncidents = useMemo(() => {
    return students.reduce((acc, s) => {
      const todayCount = s.incidents.filter((inc) =>
        (inc.date || "").startsWith(todayStr),
      ).length;
      return acc + todayCount;
    }, 0);
  }, [students, todayStr]);

  const attendanceEstimate = useMemo(() => {
    if (!students.length) return "—";
    const pct = Math.max(
      0,
      Math.min(100, Math.round(((students.length - activeCases.length) / students.length) * 100)),
    );
    return `${pct}%`;
  }, [students.length, activeCases.length]);

  const todayStats = [
    {
      label: "Asistencia General",
      value: attendanceEstimate,
      status: "good",
      icon: "check_circle",
    },
    {
      label: "Casos en Seguimiento",
      value: `${activeCases.length}`,
      status: "warning",
      icon: "notifications_active",
    },
    {
      label: "Incidencias Reportadas Hoy",
      value: `${todayIncidents}`,
      status: "info",
      icon: "event",
    },
  ];

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Buenos días";
    if (hours < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const displayName =
    currentUserProfile?.nombre_completo ||
    currentUserProfile?.full_name ||
    currentUserProfile?.nombre ||
    String(currentUserRole);

  const displayNameFirst = String(displayName).split(" ")[0] || String(currentUserRole);

  const handlePrimaryAction = () => {
    switch (currentUserRole) {
      case UserRole.DOCENTE:
      case UserRole.DOCENTE_TUTOR:
        openQuickRegister(IncidentType.CONDUCTA);
        return;
      case UserRole.PREFECTURA:
        setCurrentModule(AppModule.BITACORA);
        return;
      case UserRole.ORIENTACION:
      case UserRole.TRABAJO_SOCIAL:
        setCurrentModule(AppModule.REPORTES);
        return;
      default:
        setCurrentModule(AppModule.DASHBOARD);
    }
  };

  const roleConfigs: Record<string, any> = {
    [UserRole.DOCENTE]: {
      focus: "Planeación y Seguimiento",
      action: "Registrar Incidencia",
      icon: "add_circle",
      color: "blue"
    },
    [UserRole.PREFECTURA]: {
      focus: "Operativa de Convivencia",
      action: "Ver Bitácora",
      icon: "inventory",
      color: "orange"
    },
    [UserRole.ORIENTACION]: {
      focus: "Análisis Institucional",
      action: "Generar Reporte",
      icon: "analytics",
      color: "purple"
    },
    default: {
      focus: "Gestión Administrativa",
      action: "Ver Tablero",
      icon: "dashboard",
      color: "blue"
    }
  };

  const config = roleConfigs[currentUserRole as string] || roleConfigs.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex-1 p-6 lg:p-8 relative w-full max-w-7xl mx-auto h-full overflow-y-auto no-scrollbar"
    >
      <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="min-w-0">
          <h1 id="dashboard-header" className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
            {getGreeting()}, <span className="text-sase-primary capitalize">{displayNameFirst}</span>
          </h1>
          <p className="text-slate-300 font-medium flex items-start sm:items-center gap-2">
            <span className="mt-2 sm:mt-0 w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></span>
            <span>Sistema SASE-310 operativo • {config.focus}</span>
          </p>
        </div>

        <GlassButton
          id="export-btn"
          onClick={handlePrimaryAction}
          className="w-full sm:w-auto lg:flex-shrink-0 px-6 sm:px-8 self-stretch sm:self-start lg:self-auto"
          size="lg"
        >
          <span className="material-icons mr-2 text-xl">{config.icon}</span>
          <span className="uppercase tracking-widest text-[11px] font-black">{config.action}</span>
        </GlassButton>
      </div>

      {/* 🏛️ CALLOUT INSTITUCIONAL */}
      <GlassCard className="mb-8 !bg-blue-500/10 !border !border-blue-400/20 p-6 flex flex-col md:flex-row items-center gap-6 shadow-[0_20px_50px_rgba(37,99,235,0.08)]">
        <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-400/20 flex items-center justify-center text-blue-300 flex-shrink-0">
          <span className="material-icons text-3xl">info</span>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="text-blue-300 text-[10px] font-black uppercase tracking-[0.3em] mb-1">RECORDATORIO ADMINISTRATIVO</h4>
          <p className="text-slate-100 text-lg font-bold italic">
            "SASE acompaña procesos, no persigue errores. Lo que no se documenta, se olvida."
          </p>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div id="panel-risk-groups" className="flex-1">
            <GlassCard
              title="Actividad Reciente del Grupo"
              icon="event_note"
              className="h-full"
            >
            <div className="h-64 flex flex-col items-center justify-center text-center p-8 bg-white/5 rounded-xl mt-4 border border-white/10">
              <span className="material-icons text-slate-500 text-5xl mb-4">analytics</span>
              <p className="text-slate-200 font-medium">
                Resumen estadístico de las últimas 24 horas.
              </p>
              <p className="text-slate-400 text-xs mt-1">
                Los datos se actualizan en tiempo real conforme a los registros.
              </p>
            </div>
          </GlassCard>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-1">Estadísticas de Hoy</h3>
          {todayStats.map((stat, index) => (
            <div 
              key={index} 
              id={index === 0 ? "kpi-assist" : (index === 1 ? "kpi-risk" : undefined)}
              className="flex-1"
            >
              <GlassCard className="h-full p-6">
                <div className="flex items-center gap-4">
                  <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white/8 border border-white/10 ${
                        stat.status === "good" ? "text-emerald-500" : 
                        stat.status === "warning" ? "text-orange-500" : "text-blue-500"
                      }`}
                  >
                    <span className="material-icons text-2xl">{stat.icon}</span>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[11px] font-black uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-black text-white tracking-tight">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>
          ))}
        </div>
      </div>

      <GlassCard title="Tareas Pendientes y Calendario" icon="calendar_today">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {[
            { task: "Junta de Consejo Técnico", time: "18:00", type: "Reunión", target: AppModule.AGENDA },
            { task: "Revisión de Expedientes", time: "11:00", type: "Administración", target: AppModule.EXPEDIENTES },
            { task: "Seguimiento de Acuerdos", time: "12:30", type: "Pedagógico", target: AppModule.REPORTES },
          ].map((item, index) => (
            <motion.button
              key={index}
              whileHover={{ 
                scale: 1.03, 
                backgroundColor: "rgba(255, 255, 255, 0.12)",
                boxShadow: "0 15px 35px rgba(34, 197, 94, 0.15)"
              }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setCurrentModule(item.target)}
              className="p-5 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-xl transition-all cursor-pointer group text-left relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-center justify-between mb-3 relative z-10">
                <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest bg-blue-500/10 border border-blue-400/20 px-3 py-1 rounded-full">
                  {item.type}
                </span>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                  <span className="material-icons text-sm">schedule</span>
                  {item.time} h
                </div>
              </div>
              
              <div className="flex items-center justify-between gap-3 relative z-10">
                <p className="text-slate-100 font-bold text-sm leading-tight group-hover:text-blue-200 transition-colors">{item.task}</p>
                <div className="size-8 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-all">
                  <span className="material-icons text-blue-400 text-lg group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  );
};
