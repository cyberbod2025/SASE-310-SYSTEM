import React, { useState, useMemo, useEffect } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../../store";
import { CaseState, AppModule } from "../../types";
import { supabase } from "../../supabase/client";
import { startProductTour } from "../TourGuide";
import { printContent } from "../PrintButtons";
import { PrintPreviewModal } from "../PrintPreviewModal";
import { GlassCard } from "../ui/GlassCard";

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
  id,
}: {
  icon: string;
  label: string;
  value: string | number;
  trend?: string;
  color?: "indigo" | "amber" | "emerald" | "rose";
  delay?: number;
  id?: string;
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
      id={id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1 }}
      className={`card-sase p-6 border ${colors[color]} relative overflow-hidden group hover:bg-white/[0.03] transition-all`}
    >
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
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-current to-transparent opacity-20"></div>
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
      label: "INTERVENCION REQUERIDA",
      glow: "shadow-rose-500/20",
    },
  };

  const current = config[status] || config.nominal;

  return (
    <div className="card-sase p-8 border-white/5 bg-white/[0.01] relative overflow-hidden group min-h-[220px] flex flex-col justify-between">
      <motion.div
        animate={{ top: ["-10%", "110%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent pointer-events-none z-0"
      />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/[0.02] to-transparent pointer-events-none"></div>
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
          OP_ESTABILIDAD_V3
        </span>
      </div>

      <div className="mt-8 flex items-baseline gap-4 relative z-10">
        <h3 className="text-6xl font-black text-white italic tracking-tighter drop-shadow-2xl">
          {activeCases.toString().padStart(2, "0")}
        </h3>
        <div className="flex flex-col">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Casos Criticos
          </span>
          <span className="text-[10px] text-slate-600 font-bold uppercase mt-1">
            Requieren atencion
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
  const [riskStudents, setRiskStudents] = useState<any[]>([]);

  // --- FETCH REAL DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: events, error: eventsError } = await supabase
          .from("eventos")
          .select("*")
          .gte("fecha", new Date().toISOString().split("T")[0])
          .order("fecha", { ascending: true })
          .limit(5);

        if (eventsError) throw eventsError;
        setDbEvents(events || []);

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
    () => students.filter((s) => s.caseState === CaseState.INTERVENCION),
    [students],
  );

  const warningCases = useMemo(
    () =>
      students.filter(
        (s) =>
          s.caseState === CaseState.EN_ANALISIS ||
          s.caseState === CaseState.PATRON_DETECTADO,
      ),
    [students],
  );

  const combinedAlerts = useMemo(
    () =>
      [...criticalCases, ...warningCases].sort(
        (a, b) => (b.puntajeRiesgo || 0) - (a.puntajeRiesgo || 0),
      ),
    [criticalCases, warningCases],
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 p-6 lg:p-8 relative z-10 w-full max-w-7xl mx-auto h-full flex flex-col"
    >
      <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">
            Vision sistemica institucional
          </h1>
          <p className="text-slate-400 text-sm">
            Auditoria institucional, toma de decisiones estrategicas y cierre de casos escalados.
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleCreateReport}
          className="min-h-[48px] min-w-[48px] px-4 py-2 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-300 hover:bg-blue-600/30 transition-colors text-sm font-medium flex items-center gap-2"
        >
          <span className="material-icons text-sm">print</span>
          Generar reporte ejecutivo
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <GlassCard className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <span className="material-icons">groups</span>
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Poblacion total atendida</p>
            <p className="text-2xl font-bold text-white mt-1">{students.length}</p>
          </div>
        </GlassCard>
        <GlassCard className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
            <span className="material-icons">report</span>
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Casos criticos activos</p>
            <p className="text-2xl font-bold text-white mt-1">{criticalCases.length}</p>
          </div>
        </GlassCard>
        <GlassCard className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <span className="material-icons">campaign</span>
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Comunicados institucionales activos</p>
            <p className="text-2xl font-bold text-white mt-1">{dbComunicados.length}</p>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        <GlassCard icon="gavel" title="Casos escalados a Direccion" className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto custom-scrollbar mt-4 space-y-3">
            {combinedAlerts.length === 0 ? (
              <div className="p-10 text-center text-slate-500">
                No se registran casos escalados en este momento.
              </div>
            ) : (
              combinedAlerts.map((risk) => (
                <div key={risk.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-white font-medium text-sm">{risk.name}</p>
                      <p className="text-slate-500 text-xs mt-1">{risk.group} · {risk.caseState}</p>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentModule(AppModule.EXPEDIENTES)}
                      className="min-h-[48px] min-w-[48px] px-4 rounded-lg bg-white/5 text-slate-300 text-sm font-medium hover:bg-white/10 transition-colors"
                    >
                      Consultar expediente institucional
                    </motion.button>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        <GlassCard icon="policy" title="Auditoria de protocolos institucionales" className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto custom-scrollbar mt-4 space-y-3">
            {dbComunicados.length === 0 ? (
              <div className="p-10 text-center text-slate-500">
                No hay comunicados institucionales registrados.
              </div>
            ) : (
              dbComunicados.map((com) => (
                <div key={com.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                  <p className="text-white text-sm font-medium">
                    {com.titulo || "Comunicado institucional"}
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    {com.tipo || "Aviso institucional"}
                  </p>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      <PrintPreviewModal
        isOpen={showPrintPreview}
        onClose={() => setShowPrintPreview(false)}
        title="RESUMEN EJECUTIVO DE OPERACION INSTITUCIONAL"
        initialHtml={previewContent}
      />
    </motion.div>
  );
};

export default DashboardDireccion;
