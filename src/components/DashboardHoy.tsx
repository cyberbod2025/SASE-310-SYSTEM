import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "./ui/GlassCard";
import { useApp } from "../store";
import { AppModule, CaseState, IncidentType, UserRole } from "../types";
import { GlassEffectContainer } from "./ui/GlassEffectContainer";

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
      label: "Alertas Activas",
      value: `${activeCases.length}`,
      status: "warning",
      icon: "notifications_active",
    },
    {
      label: "Incidencias Hoy",
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
      focus: "Detección Pedagógica",
      action: "Registrar Observación",
      icon: "school",
      color: "blue"
    },
    [UserRole.PREFECTURA]: {
      focus: "Gestión de Patio y Operativa",
      action: "Bitácora de Incidencias",
      icon: "security",
      color: "rose"
    },
    [UserRole.ORIENTACION]: {
      focus: "Análisis Socioemocional",
      action: "Entrevista de Caso",
      icon: "psychology",
      color: "purple"
    },
    [UserRole.TRABAJO_SOCIAL]: {
      focus: "Vinculación Familiar",
      action: "Citatorio / Visita",
      icon: "contacts",
      color: "emerald"
    },
    default: {
      focus: "Operativa Institucional",
      action: "Ir al Tablero",
      icon: "admin_panel_settings",
      color: "indigo"
    }
  };

  const config = roleConfigs[currentUserRole as string] || roleConfigs.default;

  return (
    <GlassEffectContainer variant="nebula" withRefraction className="flex flex-col">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex-1 p-6 lg:p-10 relative z-10 w-full max-w-7xl mx-auto h-full overflow-y-auto no-scrollbar"
    >
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter title-sase text-glow-blue">
            {getGreeting()}, <span className="text-blue-400 capitalize">{currentUserProfile?.full_name?.split(" ")[0] || "Compañero"}</span>
          </h1>
          <p className="text-slate-400 text-lg font-medium">
            Módulo de <span className="text-slate-200">{config.focus}</span> activado. Estabilidad del sistema: <span className="text-emerald-400">98.2%</span>
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handlePrimaryAction}
            className="btn-sase-primary px-6 py-4 flex items-center gap-3"
          >
            <span className="material-icons text-xl">{config.icon}</span>
            <span className="font-black uppercase tracking-widest text-[11px]">{config.action}</span>
          </button>
        </div>
      </div>

      {/* 🏛️ LA REGLA DE ORO SASE (Callout Institucional) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-12"
      >
        <div className="glass-card-quantum border-amber-500/30 bg-amber-500/5 p-6 rounded-3xl flex flex-col md:flex-row items-center gap-6 relative overflow-hidden group">
          {/* Background Decorative Icon */}
          <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:rotate-12 transition-transform duration-500">
            <span className="material-icons text-[160px] text-amber-500">verified_user</span>
          </div>

          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <span className="material-icons text-4xl">auto_awesome</span>
          </div>

          <div className="flex-1 relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-icons text-amber-500 text-sm">security</span>
              <h4 className="title-sase text-amber-400 text-[10px] font-black uppercase tracking-[0.3em]">Regla de Oro Institucional</h4>
            </div>
            <p className="text-slate-200 text-xl md:text-2xl font-black tracking-tight italic leading-tight">
              "SASE acompaña procesos, no persigue errores. Lo que no se documenta, se olvida."
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <GlassCard
          title="Estabilidad del Sistema"
          icon="insights"
          className="lg:col-span-2 min-h-[350px] flex flex-col"
        >
          <div className="flex-1 flex items-center justify-center relative mt-4">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent rounded-xl border border-white/5"></div>
            <div className="text-center z-10">
              <span className="material-icons animate-pulse text-blue-400 text-6xl mb-4">
                graphic_eq
              </span>
              <p className="text-slate-400 font-medium">
                Gráfico de Radar Institucional en vivo...
              </p>
            </div>
          </div>
        </GlassCard>

        <div className="flex flex-col gap-4">
          {todayStats.map((stat, index) => (
            <GlassCard key={index} className="flex-1 flex items-center justify-center p-0">
              <div className="flex items-center gap-5 w-full">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 ${
                    stat.status === "good"
                      ? "text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.2)]"
                      : stat.status === "warning"
                        ? "text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)]"
                        : "text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                  }`}
                >
                  <span className="material-icons text-2xl">{stat.icon}</span>
                </div>
                <div>
                  <p className="text-slate-400 text-sm font-medium">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-white tracking-wide">
                    {stat.value}
                  </p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      <GlassCard title="Próximos Eventos y Tareas" icon="schedule" className="w-full">
        <div className="space-y-3 mt-4">
          {[
            "Junta de Consejo Técnico",
            "Revisión de Protocolo BAP",
            "Pase de lista general",
          ].map((task, index) => (
            <motion.div
              key={index}
              whileHover={{ x: 8, backgroundColor: "rgba(255,255,255,0.06)" }}
              whileTap={{ scale: 0.99 }}
              className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] cursor-pointer transition-colors duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.8)]"></div>
                <p className="text-slate-200 font-medium">{task}</p>
              </div>
              <span className="text-sm font-medium text-slate-500 bg-white/5 px-3 py-1 rounded-2xl border border-white/10">
                {10 + index}:00 h
              </span>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </motion.div>
    </GlassEffectContainer>
  );
};
