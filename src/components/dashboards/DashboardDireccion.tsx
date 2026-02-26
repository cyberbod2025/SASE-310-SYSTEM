import React, { useState, useMemo, useEffect } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../../store";
import { CaseState, AppModule } from "../../types";
import { supabase } from "../../supabase/client";
import { printContent } from "../PrintButtons";
import { PrintPreviewModal } from "../PrintPreviewModal";

// --- MICRO-COMPONENTS (TACTICAL UI) ---

/**
 * Holographic KPI Card
 */
const HolographicKPI = ({
  icon,
  label,
  value,
  trend,
  color = "indigo",
  delay = 0,
}: {
  icon: string;
  label: string;
  value: string | number;
  trend?: string;
  color?: "indigo" | "amber" | "emerald" | "rose";
  delay?: number;
}) => {
  const colors = {
    indigo:
      "text-indigo-400 border-indigo-500/20 bg-indigo-500/5 shadow-indigo-500/10",
    amber:
      "text-amber-400 border-amber-500/20 bg-amber-500/5 shadow-amber-500/10",
    emerald:
      "text-emerald-400 border-emerald-500/20 bg-emerald-500/5 shadow-emerald-500/10",
    rose: "text-rose-400 border-rose-500/20 bg-rose-500/5 shadow-rose-500/10",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1 }}
      className={`card-sase p-6 border ${colors[color]} relative overflow-hidden group hover:bg-white/[0.03] transition-all`}
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
      <div className="absolute top-0 right-0 w-24 h-24 bg-current opacity-[0.03] rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div
          className={`p-2.5 rounded-xl border ${colors[color]} bg-transparent group-hover:scale-110 transition-transform duration-500`}
        >
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
        {trend && (
          <span
            className={`text-[10px] font-black px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-slate-400 uppercase tracking-tighter`}
          >
            {trend}
          </span>
        )}
      </div>
      <div className="relative z-10">
        <h4 className="text-3xl font-black text-white tracking-tighter italic mb-1 drop-shadow-lg">
          {value}
        </h4>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] group-hover:text-slate-400 transition-colors">
          {label}
        </p>
      </div>
      {/* Decorative pulse line */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-current to-transparent opacity-20"></div>
      {/* Corner accent */}
      <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-white/10 opacity-20 group-hover:opacity-100 transition-opacity"></div>
    </motion.div>
  );
};

/**
 * Tactical System Radar (Stability Indicator)
 */
const SystemStabilityRadar = ({
  status,
  activeCases,
}: {
  status: string;
  activeCases: number;
}) => {
  const config: any = {
    nominal: {
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      label: "SISTEMA NOMINAL",
      glow: "shadow-emerald-500/20",
    },
    warning: {
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      label: "ALERTA PREVENTIVA",
      glow: "shadow-amber-500/20",
    },
    critical: {
      color: "text-rose-400",
      bg: "bg-rose-400/10",
      label: "INTERVENCIÓN REQUERIDA",
      glow: "shadow-rose-500/20",
    },
  };

  const current = config[status] || config.nominal;

  return (
    <div className="card-sase p-8 border-white/5 bg-white/[0.01] relative overflow-hidden group min-h-[220px] flex flex-col justify-between">
      {/* Scanning Line */}
      <motion.div
        animate={{ top: ["-10%", "110%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent pointer-events-none z-0"
      />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/[0.02] to-transparent pointer-events-none"></div>
      {/* Corner accent */}
      <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-white/10 opacity-20 group-hover:opacity-100 transition-opacity"></div>

      <div className="flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div
            className={`size-2.5 rounded-full ${current.bg.replace("/10", "")} animate-pulse ${current.glow}`}
          ></div>
          <span
            className={`text-[11px] font-black uppercase tracking-[0.4em] ${current.color}`}
          >
            {current.label}
          </span>
        </div>
        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded border border-white/5">
          OP_STABILITY_V3
        </span>
      </div>

      <div className="mt-8 flex items-baseline gap-4 relative z-10">
        <h3 className="text-6xl font-black text-white italic tracking-tighter drop-shadow-2xl">
          {activeCases.toString().padStart(2, "0")}
        </h3>
        <div className="flex flex-col">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Casos Críticos
          </span>
          <span className="text-[10px] text-slate-600 font-bold uppercase mt-1">
            Requieren Atención
          </span>
        </div>
      </div>

      <div className="mt-6 h-1 w-full bg-white/5 rounded-full overflow-hidden relative">
        <motion.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className={`absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-transparent via-${current.color.split("-")[1]}-500/50 to-transparent`}
        />
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD COMPONENT ---

export const DashboardDireccion = () => {
  const { students, setCurrentModule } = useApp();
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [dbEvents, setDbEvents] = useState<any[]>([]);
  const [dbComunicados, setDbComunicados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState("");

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

  const handleCreateReport = () => {
    toast.success("Preparando Reporte Ejecutivo...");
    const html = `
      <div style="font-family: 'Inter', sans-serif; color: #1e293b;">
        <h2 style="color: #1e3a8a; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-bottom: 20px;">Estatus de Estabilidad del Plantel</h2>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
          <div style="padding: 15px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
            <p style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 5px;">Total de Matrícula</p>
            <p style="font-size: 24px; font-weight: 900; color: #1e293b; margin: 0;">${students.length}</p>
          </div>
          <div style="padding: 15px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
            <p style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 5px;">Casos Críticos</p>
            <p style="font-size: 24px; font-weight: 900; color: #ef4444; margin: 0;">${criticalCases.length}</p>
          </div>
        </div>

        <h3 style="color: #1e3a8a; font-size: 14px; text-transform: uppercase; margin-bottom: 15px;">Protocolos en Implementación</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <tr style="background: #f1f5f9;">
            <th style="padding: 12px; text-align: left; border: 1px solid #e2e8f0; font-size: 12px;">Protocolo</th>
            <th style="padding: 12px; text-align: left; border: 1px solid #e2e8f0; font-size: 12px;">Estatus</th>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e2e8f0; font-size: 12px;">Prevención de Deserción</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0; font-size: 12px; color: #10b981; font-weight: 700;">ACTIVO</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e2e8f0; font-size: 12px;">Seguridad Escolar</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0; font-size: 12px; color: #10b981; font-weight: 700;">ACTIVO</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e2e8f0; font-size: 12px;">Monitoreo de Salud Crónica</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0; font-size: 12px; color: #10b981; font-weight: 700;">ACTIVO</td>
          </tr>
        </table>

        <div style="margin-top: 40px; border: 1px dashed #3b82f6; padding: 20px; border-radius: 12px; background: #eff6ff;">
          <h3 style="margin-top: 0; font-size: 14px; color: #1e3a8a;">Observaciones de Dirección</h3>
          <p style="color: #1e40af; font-style: italic; font-size: 12px;">[Escriba aquí sus observaciones estratégicas para el reporte ejecutivo...]</p>
        </div>

        <div class="signature-line" style="margin-top: 60px; display: flex; justify-content: center;">
          <div class="signature-box" style="text-align: center; width: 300px;">
            <div class="line" style="border-top: 1px solid #000; margin-bottom: 10px;"></div>
            <div class="label" style="font-size: 10px; font-weight: 900; text-transform: uppercase;">FIRMA DE DIRECCIÓN</div>
            <div class="label" style="font-size: 9px; color: #64748b;">SASE IA - NÚCLEO OPERATIVO</div>
          </div>
        </div>
      </div>
    `;
    setPreviewContent(html);
    setShowPrintPreview(true);
  };

  return (
    <div className="flex-1 min-h-full p-4 lg:p-8 bg-transparent relative overflow-hidden custom-scrollbar pb-32">
      {/* Background SASE Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none opacity-[0.02] z-0">
        <h1 className="text-[25vw] font-black italic tracking-tighter text-white">
          SASE
        </h1>
      </div>

      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/[0.05] blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-600/[0.03] blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

      <div className="relative z-10 max-w-[1600px] mx-auto space-y-8">
        {/* TACTICAL HEADER - REFINED */}
        <div className="relative min-h-[300px] flex flex-col md:flex-row items-center justify-between gap-12 py-4 overflow-hidden">
          {/* Left: Strategic Title */}
          <div className="relative z-10 space-y-3 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <span className="h-[1px] w-8 bg-indigo-500/50"></span>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] italic">
                ESTACIÓN DIRECCIÓN // UNIT_00
              </p>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-tight">
              COMMAND{" "}
              <span className="text-indigo-500 drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                CENTER
              </span>
            </h1>
            <div className="flex items-center gap-2 px-2 py-1 bg-emerald-500/5 text-emerald-400 text-[8px] font-black rounded border border-emerald-500/10 tabular-nums uppercase tracking-widest w-fit mx-auto md:mx-0">
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="size-1 bg-emerald-500 rounded-full shadow-[0_0_5px_rgba(16,185,129,0.5)]"
              />
              <span>SISTEMA_NOMINAL</span>
            </div>
          </div>

          {/* Right: Orbital Action Nucleus */}
          <div className="relative flex items-center justify-center w-full md:w-[450px] h-[300px]">
            {/* IA Nucleus for Direction */}
            <div className="relative z-20 size-20 md:size-28 flex items-center justify-center">
              <div className="absolute inset-0 bg-indigo-500/5 rounded-full blur-2xl animate-pulse"></div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="size-full flex items-center justify-center relative overflow-hidden group cursor-pointer"
              >
                {/* Central Identity Text */}
                <div className="relative z-20 flex flex-col items-center justify-center">
                  <span className="text-[6px] font-black text-indigo-400 tracking-[0.2em] leading-none mb-0.5 opacity-50 uppercase">
                    AI_UNIT
                  </span>
                  <span className="text-xl font-black text-white italic tracking-tighter leading-none pulse-glow">
                    SASE-310
                  </span>
                </div>

                <div className="absolute inset-2 border border-indigo-500/10 rounded-full animate-spin-slow opacity-20"></div>
              </motion.div>
            </div>

            {/* Rotating Orbital Actions Container */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
              className="absolute size-[350px] flex items-center justify-center pointer-events-none"
            >
              {[
                {
                  id: "PRINT",
                  label: "Exportar Log",
                  icon: "print",
                  action: handleCreateReport,
                  color: "text-slate-400",
                  bg: "bg-white/[0.03]",
                },
                {
                  id: "APPROVE",
                  label: "Aprobaciones",
                  icon: "verified_user",
                  action: () =>
                    setCurrentModule(AppModule.APROBACIONES_PERSONAL),
                  color: "text-white",
                  bg: "bg-indigo-600",
                },
                {
                  id: "METRICS",
                  label: "Protocolos",
                  icon: "policy",
                  action: () => {},
                  color: "text-amber-400",
                  bg: "bg-white/[0.03]",
                },
              ].map((act, index, arr) => {
                const angle =
                  (index * (360 / arr.length) - 90) * (Math.PI / 180);
                const radius = 130;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                  <motion.div
                    key={act.id}
                    className="absolute pointer-events-auto"
                    style={{
                      left: "50%",
                      top: "50%",
                      marginLeft: -32,
                      marginTop: -32,
                      x,
                      y,
                    }}
                  >
                    <motion.button
                      animate={{ rotate: -360 }}
                      transition={{
                        duration: 50,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      whileHover={{ scale: 1.5, zIndex: 50 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={act.action}
                      className="group flex flex-col items-center"
                    >
                      <div
                        className={`
                        size-14 md:size-16 rounded-xl flex flex-col items-center justify-center transition-all duration-500 bg-transparent
                        ${act.id === "APPROVE" ? "text-white" : "text-white/20 group-hover:text-white/70"}
                      `}
                      >
                        <span
                          className={`material-symbols-outlined text-xl md:text-2xl transition-transform duration-300 group-hover:scale-110`}
                        >
                          {act.icon}
                        </span>
                        <span className="text-[7px] md:text-[8px] font-black uppercase tracking-tight text-center px-1 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                          {act.label}
                        </span>

                        {act.id === "APPROVE" && (
                          <div className="absolute inset-0 bg-indigo-500/5 blur-xl rounded-full -z-10" />
                        )}
                      </div>
                    </motion.button>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Tactical Rings */}
            <div className="absolute size-[220px] border border-indigo-500/10 rounded-full animate-spin-slow opacity-20"></div>
            <div className="absolute size-[300px] border border-white/[0.03] rounded-full animate-spin-reverse-slow opacity-10"></div>
          </div>
        </div>

        {/* MAIN BENTO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* AREA: STABILITY & KPIs (Left) */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <SystemStabilityRadar
                status={status}
                activeCases={criticalCases.length}
              />
            </div>

            <HolographicKPI
              icon="groups"
              label="POBLACIÓN TOTAL"
              value={students.length}
              trend="+0.4%"
              color="indigo"
              delay={1}
            />
            <HolographicKPI
              icon="monitoring"
              label="ASISTENCIA GLOBAL"
              value="98.2%"
              trend="STABLE"
              color="emerald"
              delay={2}
            />
            <HolographicKPI
              icon="security"
              label="ALERTA DE SEGURIDAD"
              value={status.toUpperCase()}
              color={
                status === "nominal"
                  ? "emerald"
                  : status === "warning"
                    ? "amber"
                    : "rose"
              }
              delay={3}
            />
            <HolographicKPI
              icon="verified"
              label="PROTOCOLOS ACTIVOS"
              value={criticalCases.length}
              color="amber"
              delay={4}
            />
          </div>

          {/* AREA: EXECUTIVE AGENDA (Right) */}
          <div className="lg:col-span-4 card-sase p-8 border-white/5 bg-white/[0.01] flex flex-col group min-h-[500px] relative overflow-hidden">
            {/* Scanning Line */}
            <motion.div
              animate={{ top: ["-10%", "110%"] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent pointer-events-none z-0"
            />
            <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-white/10 opacity-20 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center justify-between mb-10 pb-4 border-b border-white/5 relative z-10">
              <h3 className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.4em] italic">
                EXECUTIVE_AGENDA
              </h3>
              <span className="text-[9px] font-black text-slate-500 uppercase px-2 py-0.5 border border-white/5 rounded">
                SIG: DAILY_OP
              </span>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
              {dbEvents.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20">
                  <span className="material-symbols-outlined text-5xl mb-4">
                    calendar_today
                  </span>
                  <p className="text-[10px] uppercase font-black tracking-widest">
                    No hay eventos para hoy
                  </p>
                </div>
              ) : (
                dbEvents.map((ev, i) => (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={ev.id || i}
                    className="flex gap-6 p-4 rounded-2xl bg-white/[0.02] border border-transparent hover:border-indigo-500/20 hover:bg-white/[0.04] transition-all group/item cursor-pointer"
                  >
                    <div className="flex flex-col items-center min-w-[50px] border-r border-white/5 pr-4">
                      <span className="text-lg font-black text-white italic tracking-tighter tabular-nums drop-shadow-lg">
                        {ev.hora?.substring(0, 5) || "00:00"}
                      </span>
                      <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mt-1">
                        AM/PM
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white uppercase italic tracking-tight group-hover/item:text-indigo-400 transition-colors">
                        {ev.titulo}
                      </h4>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-2 py-0.5 bg-white/5 rounded">
                          {ev.tipo}
                        </span>
                        <div className="size-1 bg-slate-800 rounded-full"></div>
                        <span className="text-[9px] font-black text-slate-500 uppercase">
                          Location_Central
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <button
              onClick={() => setCurrentModule(AppModule.AGENDA)}
              title="Consultar la agenda completa de actividades y eventos escolares"
              className="mt-10 w-full py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.3em] hover:bg-white/[0.08] hover:border-white/20 transition-all active:scale-95 shadow-xl"
            >
              ABRIR CALENDARIO MAESTRO
            </button>
          </div>

          {/* AREA: DATA STREAM (Bottom Left) */}
          <div className="lg:col-span-7 card-sase p-8 border-white/5 bg-white/[0.01] flex flex-col min-h-[400px] relative overflow-hidden">
            {/* Scanning Line */}
            <motion.div
              animate={{ top: ["-10%", "110%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent pointer-events-none z-0"
            />
            <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-white/10 opacity-20"></div>
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5 relative z-10">
              <h3 className="text-[11px] font-black text-amber-500 uppercase tracking-[0.4em] italic">
                PLANTEL_COMMUNICATIONS_LOG
              </h3>
              <div className="flex items-center gap-3">
                <span className="size-2 bg-amber-500 rounded-full animate-ping"></span>
                <span className="text-[9px] font-black text-slate-500 uppercase">
                  Live Stream
                </span>
              </div>
            </div>

            <div className="space-y-3 overflow-y-auto custom-scrollbar max-h-[300px] pr-2">
              {dbComunicados.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 opacity-20">
                  <span className="material-symbols-outlined text-4xl mb-3 font-light">
                    terminal
                  </span>
                  <p className="text-[10px] uppercase font-black">
                    Waiting for feed data...
                  </p>
                </div>
              ) : (
                dbComunicados.map((n, i) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={n.id}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group/msg"
                  >
                    <div
                      className={`mt-2 size-2 rounded-full ${n.tipo === "urgente" ? "bg-rose-500 shadow-[0_0_10px_#f43f5e]" : "bg-indigo-500/50"}`}
                    ></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h5 className="text-[11px] font-black text-white uppercase tracking-tight italic group-hover/msg:text-amber-400 transition-colors">
                          {n.titulo}
                        </h5>
                        <span className="text-[9px] font-mono text-slate-600">
                          {new Date(n.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tight line-clamp-1 group-hover/msg:text-slate-300">
                        {n.descripcion}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* AREA: DECISION MATRIX (Bottom Right) */}
          <div className="lg:col-span-5 card-sase p-8 border-indigo-500/20 bg-indigo-500/[0.02] relative overflow-hidden group">
            {/* Scanning Line */}
            <motion.div
              animate={{ top: ["-10%", "110%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent pointer-events-none z-0"
            />
            <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-indigo-500/20 opacity-20 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/[0.05] rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-10">
                <div className="size-12 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                  <span className="material-symbols-outlined text-2xl font-black">
                    psychology
                  </span>
                </div>
                <div>
                  <h3 className="text-[12px] font-black text-white uppercase tracking-[0.3em] italic">
                    DECISION_MATRIX{" "}
                    <span className="text-indigo-500">v1.2</span>
                  </h3>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">
                    Análisis Táctico de Casos Críticos
                  </p>
                </div>
              </div>

              {selectedAlertId ? (
                <div className="flex-1 flex flex-col justify-between animate-fade-in">
                  <div className="p-6 bg-white/[0.03] border border-white/10 rounded-3xl mb-8 relative group/card">
                    <div className="flex items-center gap-5">
                      <div className="size-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-black text-3xl italic tracking-tighter shadow-2xl overflow-hidden relative">
                        {criticalCases
                          .find((c) => c.id === selectedAlertId)
                          ?.name.charAt(0)}
                        <div className="absolute inset-0 bg-white/10 animate-shimmer"></div>
                      </div>
                      <div>
                        <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">
                          {
                            criticalCases.find((c) => c.id === selectedAlertId)
                              ?.name
                          }
                        </h4>
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                          <span className="size-1.5 bg-rose-500 rounded-full animate-ping"></span>
                          Casuística Crítica Detectada
                        </p>
                      </div>
                    </div>
                    <div className="mt-8 grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-2xl">
                        <p className="text-[8px] font-black text-slate-500 uppercase mb-1">
                          Impacto Operativo
                        </p>
                        <p className="text-sm font-black text-white italic tracking-widest">
                          NIVEL 4
                        </p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl">
                        <p className="text-[8px] font-black text-slate-500 uppercase mb-1">
                          Riesgo Institucional
                        </p>
                        <p className="text-sm font-black text-amber-500 italic tracking-widest">
                          CRÍTICO
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setCurrentModule(AppModule.PROTOCOLOS)}
                      title="Abrir la guía de protocolos institucionales para este caso"
                      className="py-4 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-700 transition-all shadow-[0_0_30px_rgba(99,102,241,0.2)] active:scale-95 flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">
                        assignment_ind
                      </span>
                      Ver Protocolo
                    </button>
                    <button
                      onClick={() => setSelectedAlertId(null)}
                      title="Cerrar el análisis del caso actual"
                      className="py-4 bg-white/[0.03] border border-white/10 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-white/[0.08] hover:text-white transition-all active:scale-95"
                    >
                      Cerrar Vista
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 hover:opacity-100 transition-opacity duration-700">
                  <div className="size-24 rounded-full border-2 border-dashed border-indigo-500/30 flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-5xl text-indigo-500/50">
                      touch_app
                    </span>
                  </div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] leading-relaxed">
                    SELECCIONE UN CASO PARA <br />{" "}
                    <span className="text-indigo-400">
                      DESPLEGAR PROTOCOLOS
                    </span>
                  </p>
                </div>
              )}

              {/* Patient Selector Strip */}
              <div className="mt-10 pt-6 border-t border-white/5 flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {criticalCases.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedAlertId(c.id)}
                    title={`Ver análisis táctico de ${c.name}`}
                    className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedAlertId === c.id ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20" : "bg-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-300 border border-white/5"}`}
                  >
                    {c.name.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <PrintPreviewModal
        isOpen={showPrintPreview}
        onClose={() => setShowPrintPreview(false)}
        title="RESUMEN EJECUTIVO DE OPERACIÓN INSTITUCIONAL"
        initialHtml={previewContent}
      />
    </div>
  );
};

export default DashboardDireccion;
