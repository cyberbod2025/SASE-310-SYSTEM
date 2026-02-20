import React, { useState, useMemo, useEffect } from "react";
import toast from "react-hot-toast";
import { useApp } from "../../store";
import { CaseState, AppModule, IncidentType } from "../../types";
import { supabase } from "../../supabase/client";
import { printContent } from "../PrintButtons";

// --- MICRO-COMPONENTS (ATOMIC UI) ---

const CoordinationCard = ({
  title,
  icon,
  color,
  children,
}: {
  title: string;
  icon: string;
  color: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white border border-slate-100 rounded-2xl flex flex-col shadow-sm overflow-hidden group hover:shadow-md transition-all">
    <div
      className={`p-4 border-b border-slate-50 flex items-center justify-between ${color}`}
    >
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-xl text-white">
          {icon}
        </span>
        <h3 className="text-xs font-black text-white uppercase tracking-widest">
          {title}
        </h3>
      </div>
      <button className="text-white/60 hover:text-white transition-colors">
        <span className="material-symbols-outlined text-lg">more_vert</span>
      </button>
    </div>
    <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
      {children}
    </div>
  </div>
);

const MetricItem = ({
  label,
  value,
  subtext,
  level = "normal",
}: {
  label: string;
  value: string | number;
  subtext?: string;
  level?: "normal" | "warning" | "critical";
}) => {
  const colors = {
    normal: "text-slate-800",
    warning: "text-amber-600",
    critical: "text-rose-600",
  };

  return (
    <div className="py-3 border-b border-slate-50 last:border-0 flex justify-between items-center group/item hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
      <div>
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {label}
        </h4>
        {subtext && (
          <p className="text-[10px] text-slate-400 font-medium">{subtext}</p>
        )}
      </div>
      <div className="text-right">
        <span
          className={`text-lg font-black ${colors[level]} group-hover/item:scale-110 transition-transform inline-block`}
        >
          {value}
        </span>
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD COMPONENT ---

export const DashboardSubdireccion = () => {
  const { students, setCurrentModule } = useApp();
  const [activeTab, setActiveTab] = useState<
    "academico" | "disciplina" | "operacion"
  >("academico");
  const [loading, setLoading] = useState(false);

  // Logic: Calculate Academic Risk (Grades < 6.0 in more than 2 subjects)
  const academicRiskCount = useMemo(() => {
    return students.filter((s) => {
      const failingCount = (s.calificaciones || []).filter(
        (c) => (c.promedioFinal || 0) < 6,
      ).length;
      return failingCount >= 2;
    }).length;
  }, [students]);

  // Logic: Behavioral Alerts
  const behavioralAlerts = useMemo(() => {
    return students.filter(
      (s) =>
        s.caseState === CaseState.PATRON_DETECTADO ||
        s.caseState === CaseState.INTERVENCION,
    ).length;
  }, [students]);

  // Handle Export
  const handleExportStatus = () => {
    printContent(
      "Reporte de Subdirección",
      `<h1>Estado de Coordinación Académica y Disciplinaria</h1>
       <p>Alumnos en Riesgo Académico: ${academicRiskCount}</p>
       <p>Casos de Intervención Conductual: ${behavioralAlerts}</p>`,
    );
    toast.success("Generando reporte ejecutivo...");
  };

  return (
    <div className="w-full h-full p-4 md:p-6 overflow-y-auto custom-scrollbar bg-slate-50/30">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 px-2">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-600/20">
              <span className="material-symbols-outlined text-white">
                account_balance_wallet
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                Coordinación Integral
              </h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Subdirección de Gestión Escolar • SASE v3.10
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={handleExportStatus}
            className="flex-1 md:flex-none px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase transition-all hover:bg-slate-50 flex items-center justify-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Corte Diario
          </button>
          <button
            onClick={() => setCurrentModule(AppModule.PROTOCOLOS)}
            className="flex-1 md:flex-none px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold uppercase transition-all hover:bg-orange-700 shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">policy</span>
            Protocolos
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Academic Coordination */}
        <CoordinationCard
          title="Gestión Académica"
          icon="school"
          color="bg-indigo-600"
        >
          <MetricItem
            label="Riesgo de Deserción"
            subtext="Alumnos con +2 materias reprobadas"
            value={academicRiskCount}
            level={academicRiskCount > 5 ? "critical" : "normal"}
          />
          <MetricItem
            label="Cobertura de Planeación"
            subtext="Docentes con NEM al corriente"
            value="92%"
          />
          <MetricItem
            label="Promedio General"
            subtext="Ciclo Escolar 2024-2025"
            value="8.4"
          />
          <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <h4 className="text-[10px] font-black text-indigo-700 uppercase mb-2 tracking-widest">
              Acción Sugerida IA
            </h4>
            <p className="text-xs text-indigo-900 leading-relaxed font-medium">
              Detectado descenso en matemáticas en 2º grado. Se sugiere reunión
              con academia técnica.
            </p>
          </div>
        </CoordinationCard>

        {/* Disciplinary Coordination */}
        <CoordinationCard
          title="Convivencia y Disciplina"
          icon="gavel"
          color="bg-orange-600"
        >
          <MetricItem
            label="Casos de Intervención"
            subtext="Protocolos de convivencia activos"
            value={behavioralAlerts}
            level={behavioralAlerts > 3 ? "warning" : "normal"}
          />
          <MetricItem
            label="Reportes de Prefectura"
            subtext="Incidencias menores hoy"
            value="12"
          />
          <MetricItem
            label="Faltas de Uniforme"
            subtext="Detección escalonada"
            value="4"
          />
          <div className="mt-6">
            <button
              onClick={() => setCurrentModule(AppModule.MIS_GRUPOS)}
              className="w-full py-3 bg-white border border-orange-200 text-orange-600 rounded-xl text-[10px] font-black uppercase hover:bg-orange-50 transition-all text-center tracking-widest"
            >
              Ver Bitácora de Convivencia
            </button>
          </div>
        </CoordinationCard>

        {/* Operational Excellence */}
        <CoordinationCard
          title="Operación del Plantel"
          icon="settings_suggest"
          color="bg-slate-800"
        >
          <MetricItem
            label="Asistencia Docente"
            subtext="Personal frente a grupo"
            value="100%"
          />
          <MetricItem
            label="Salones con Guardia"
            subtext="Grupos sin docente titular"
            value="0"
          />
          <MetricItem
            label="Acuerdos de Consejo"
            subtext="Avance de cumplimiento"
            value="75%"
          />

          <div className="mt-6 space-y-2">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="material-symbols-outlined text-slate-400 text-sm">
                schedule
              </span>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-600 uppercase">
                  Próximo CTE
                </p>
                <p className="text-xs text-slate-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                  Faltan 12 días para la sesión ordinaria.
                </p>
              </div>
            </div>
          </div>
        </CoordinationCard>

        {/* Alerts & Critical Feed (Wide) */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm overflow-hidden relative">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">
                notification_important
              </span>
              Centro de Alertas Críticas
            </h3>
            <span className="text-[10px] bg-slate-100 px-2 py-1 rounded-full font-bold text-slate-500">
              REAL-TIME
            </span>
          </div>

          <div className="space-y-4">
            {students
              .filter((s) => s.caseState === CaseState.INTERVENCION)
              .map((student) => (
                <div
                  key={student.id}
                  className="p-4 rounded-xl border-l-4 border-l-rose-500 bg-rose-50/30 flex items-center justify-between group hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-black">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">
                        {student.name}
                      </h4>
                      <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">
                        Intervención de Nivel 3 • Protocolo SEP
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      toast.success(`Abriendo expediente de ${student.name}`)
                    }
                    className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-[10px] font-black uppercase shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Atender
                  </button>
                </div>
              ))}

            {students.filter((s) => s.caseState === CaseState.INTERVENCION)
              .length === 0 && (
              <div className="py-10 text-center opacity-30">
                <span className="material-symbols-outlined text-4xl mb-2">
                  check_circle
                </span>
                <p className="text-xs font-bold uppercase tracking-widest">
                  Sin intervenciones urgentes
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>

          <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-6 relative z-10">
            Acciones de Mando
          </h3>

          <div className="space-y-3 relative z-10">
            <button className="w-full p-4 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3 hover:bg-white/10 transition-all text-left">
              <span className="material-symbols-outlined text-blue-400">
                add_moderator
              </span>
              <span className="text-xs font-bold uppercase tracking-tight">
                Autorizar Protocolo
              </span>
            </button>
            <button className="w-full p-4 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3 hover:bg-white/10 transition-all text-left">
              <span className="material-symbols-outlined text-emerald-400">
                group_add
              </span>
              <span className="text-xs font-bold uppercase tracking-tight">
                Asignar Suplencia
              </span>
            </button>
            <button className="w-full p-4 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3 hover:bg-white/10 transition-all text-left">
              <span className="material-symbols-outlined text-amber-400">
                assignment_turned_in
              </span>
              <span className="text-xs font-bold uppercase tracking-tight">
                Validar Planeaciones
              </span>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest text-center">
              Estado de Sincronización
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-mono text-emerald-400">
                BASE DE DATOS EN VIVO
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSubdireccion;
