import React, { useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "../store";
import { CaseState, CaseLabels, IncidentType, UserRole, AppModule } from "../types";
import { printContent } from "./PrintButtons";
import { anonymizeName } from "../utils/saseUtils";
import { GlassCard } from "./ui/GlassCard";
import { GlassButton } from "./ui/GlassButton";

type ReportType = "incidencias" | "asistencia" | "estudiantes" | "bitacora";

// --- MICRO-COMPONENT: IntelligenceKPI ---
const IntelligenceKPI = ({
  icon,
  label,
  value,
  color = "indigo",
  delay = 0,
}: {
  icon: string;
  label: string;
  value: string | number;
  color?: "indigo" | "rose" | "amber" | "emerald" | "blue";
  delay?: number;
}) => {
  const colors = {
    blue: "text-blue-600 border-blue-100 bg-blue-50/50",
    indigo: "text-indigo-600 border-indigo-100 bg-indigo-50/50",
    rose: "text-rose-600 border-rose-100 bg-rose-50/50",
    amber: "text-amber-600 border-amber-100 bg-amber-50/50",
    emerald: "text-emerald-600 border-emerald-100 bg-emerald-50/50",
  } as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.05 }}
      className={`p-5 rounded-2xl border ${colors[color as keyof typeof colors]} flex flex-col gap-1 hover:shadow-lg hover:shadow-slate-200/50 transition-all group`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-xl bg-white border ${colors[color].split(" ")[1]} shadow-sm group-hover:scale-110 transition-transform`}>
          <span className="material-icons text-xl">{icon}</span>
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
      <h4 className="text-3xl font-black text-slate-800 tracking-tight">
        {value}
      </h4>
    </motion.div>
  );
};

export const Reportes: React.FC = () => {
  const {
    students,
    currentUserRole,
    setCurrentModule,
    setPrintModal,
    printModal,
  } = useApp();
  const [selectedReport, setSelectedReport] =
    useState<ReportType>("incidencias");

  // --- SECURITY ENFORCEMENT ---
  if (
    currentUserRole === UserRole.SECRETARIA ||
    currentUserRole === UserRole.UDEII
  ) {
    const roleName =
      currentUserRole === UserRole.SECRETARIA ? "Secretaría" : "UDEII";
    return (
      <div className="flex flex-col items-center justify-center h-full p-20 text-center">
        <div className="size-24 bg-rose-50 border border-rose-100 rounded-3xl flex items-center justify-center text-rose-500 mb-8 shadow-xl shadow-rose-100">
          <span className="material-icons text-5xl">lock_person</span>
        </div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-4">
          Acceso Administrado
        </h2>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-md leading-relaxed">
          Su rol institucional ({roleName}) no tiene autorizada la generación de reportes masivos por protocolos de privacidad SASE-310.
        </p>
        <GlassButton
          onClick={() => setCurrentModule(AppModule.DASHBOARD)}
          className="mt-10"
        >
          Volver al Inicio
        </GlassButton>
      </div>
    );
  }

  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  const [isPrinting, setIsPrinting] = useState(false);

  // Aggregate data for reports - Memoized ⚡
  const allIncidents = React.useMemo(() => {
    return students.flatMap((s) =>
      s.incidents.map((i) => ({
        ...i,
        studentName: s.name,
        group: s.group,
      })),
    );
  }, [students]);

  const filteredIncidents = React.useMemo(() => {
    return allIncidents.filter(
      (i) => i.date >= dateRange.start && i.date <= dateRange.end + "T23:59:59",
    );
  }, [allIncidents, dateRange]);

  const incidentsByType = React.useMemo(
    () =>
      filteredIncidents.reduce(
        (acc, i) => {
          if (i.type === IncidentType.RETARDO) acc.retardos++;
          if (i.type === IncidentType.UNIFORME) acc.uniformes++;
          if (i.type === IncidentType.CONDUCTA) acc.conducta++;
          if (i.type === IncidentType.ASISTENCIA) acc.faltas++;
          return acc;
        },
        { retardos: 0, uniformes: 0, conducta: 0, faltas: 0 },
      ),
    [filteredIncidents],
  );

  const studentsByState = React.useMemo(
    () =>
      students.reduce(
        (acc, s) => {
          if (s.caseState === CaseState.CERRADO) acc.cerrados++;
          if (s.caseState === CaseState.OBSERVADO) acc.observados++;
          if (s.caseState === CaseState.PATRON_DETECTADO) acc.patron++;
          return acc;
        },
        { cerrados: 0, observados: 0, patron: 0 },
      ),
    [students],
  );

  const handlePrintReport = () => {
    setIsPrinting(true);
    let htmlContent = "";
    let title = "";

    setTimeout(() => {
      switch (selectedReport) {
        case "incidencias":
          title = "Reporte de Incidencias Institucional";
          htmlContent = `
            <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 800px; margin: 0 auto;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px;">
                <div style="display: flex; align-items: center; gap: 20px;">
                  <div style="border-left: 2px solid #cbd5e1; padding-left: 20px; height: 50px; display: flex; flex-direction: column; justify-content: center;">
                    <h1 style="margin: 0; font-size: 20px; color: #1e293b; text-transform: uppercase;">${title}</h1>
                    <p style="margin: 5px 0 0; font-size: 10px; color: #64748b; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">Sistema de Asistencia y Seguimiento Escolar</p>
                  </div>
                </div>
              </div>
              <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #e2e8f0;">
                <p style="margin: 0; font-size: 14px; font-weight: bold; color: #334155; text-transform: uppercase;">Período del Reporte:</p>
                <h2 style="margin: 5px 0 0; font-size: 18px; color: #1e293b;">${dateRange.start} al ${dateRange.end}</h2>
              </div>
              <h3 style="font-size: 16px; border-left: 4px solid #1d4ed8; padding-left: 10px; margin-bottom: 20px; text-transform: uppercase;">Resumen por Categoría</h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px; font-size: 14px;">
                <thead>
                  <tr style="background: #f1f5f9; text-align: left;">
                    <th style="padding: 12px; border: 1px solid #e2e8f0;">Tipo de Incidencia</th>
                    <th style="padding: 12px; border: 1px solid #e2e8f0;">Cantidad Total</th>
                    <th style="padding: 12px; border: 1px solid #e2e8f0;">Impacto (%)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="padding: 12px; border: 1px solid #e2e8f0;">Retardos de Entrada</td>
                    <td style="padding: 12px; border: 1px solid #e2e8f0;">${incidentsByType.retardos}</td>
                    <td style="padding: 12px; border: 1px solid #e2e8f0;">${
                      filteredIncidents.length > 0
                        ? (
                            (incidentsByType.retardos /
                              filteredIncidents.length) *
                            100
                          ).toFixed(1)
                        : 0
                    }%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          `;
          break;
        case "estudiantes":
          title = "Directorio de Estudiantes";
          htmlContent = `<h2>Total de Estudiantes: ${students.length}</h2>`;
          break;
        case "asistencia":
          title = "Reporte de Asistencia";
          htmlContent = `<h2>Período: ${dateRange.start} al ${dateRange.end}</h2>`;
          break;
        default:
          title = "Reporte General";
          htmlContent = "<p>Seleccione un tipo de reporte.</p>";
      }

      setPrintModal({
        isOpen: true,
        title,
        html: htmlContent,
      });
      setIsPrinting(false);
    }, 800);
  };

  const reportOptions = [
    {
      id: "incidencias",
      label: "Incidencias",
      icon: "warning",
      description: "Retardos, conducta, uniformes",
      color: "amber" as const,
    },
    {
      id: "asistencia",
      label: "Asistencia",
      icon: "fact_check",
      description: "Faltas y puntualidad",
      color: "emerald" as const,
    },
    {
      id: "estudiantes",
      label: "Estudiantes",
      icon: "groups",
      description: "Directorio y estados",
      color: "blue" as const,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 p-6 lg:p-8 relative z-10 w-full max-w-7xl mx-auto h-full flex flex-col"
    >
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 mb-1 tracking-tight">Reportes Institucionales</h1>
          <p className="text-slate-500 font-medium tracking-tight">Generación de bitácoras y análisis de trayectoria académica.</p>
        </div>
        
        <GlassButton
          loading={isPrinting}
          onClick={handlePrintReport}
          className="min-w-[200px]"
        >
          <span className="material-icons mr-2 text-sm">{isPrinting ? 'sync' : 'print'}</span>
          {isPrinting ? 'Generando...' : 'Descargar Reporte'}
        </GlassButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-1 flex flex-col gap-4">
          <GlassCard className="p-4" title="Filtros Profesionales" icon="filter_alt">
            <div className="space-y-6 mt-4">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Tipo de Reporte</span>
                <div className="space-y-1">
                  {reportOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedReport(opt.id as ReportType)}
                      className={`w-full text-left p-3 rounded-xl transition-all ${
                        selectedReport === opt.id
                          ? "bg-slate-800 text-white shadow-xl shadow-slate-200"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-icons text-lg">{opt.icon}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-black uppercase tracking-tight truncate">{opt.label}</p>
                          <p className={`text-[9px] font-bold truncate opacity-60`}>{opt.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Rango Temporal</span>
                <div className="space-y-2">
                  <input
                    type="date"
                    title="Fecha Inicial"
                    aria-label="Fecha Inicial"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="w-full h-[46px] bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 transition-all"
                  />
                  <input
                    type="date"
                    title="Fecha Final"
                    aria-label="Fecha Final"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="w-full h-[46px] bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        <GlassCard className="lg:col-span-3 flex flex-col h-full overflow-hidden p-0 border border-slate-200">
          <div className="p-6 border-b border-slate-100 bg-slate-50/20">
            {selectedReport === "incidencias" && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <IntelligenceKPI label="Retardos" value={incidentsByType.retardos} color="amber" icon="timer" delay={0} />
                <IntelligenceKPI label="Uniforme" value={incidentsByType.uniformes} color="indigo" icon="checkroom" delay={1} />
                <IntelligenceKPI label="Conducta" value={incidentsByType.conducta} color="rose" icon="gavel" delay={2} />
                <IntelligenceKPI label="Faltas" value={incidentsByType.faltas} color="blue" icon="event_busy" delay={3} />
              </div>
            )}

            {selectedReport === "estudiantes" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <IntelligenceKPI label="Caso Cerrado" value={studentsByState.cerrados} color="emerald" icon="task_alt" delay={0} />
                <IntelligenceKPI label="Observación" value={studentsByState.observados} color="indigo" icon="visibility" delay={1} />
                <IntelligenceKPI label="Patrón" value={studentsByState.patron} color="rose" icon="warning" delay={2} />
              </div>
            )}

            {selectedReport === "asistencia" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <IntelligenceKPI label="Faltas Totales" value={incidentsByType.faltas} color="rose" icon="event_busy" delay={0} />
                <IntelligenceKPI label="Retardos" value={incidentsByType.retardos} color="amber" icon="timer" delay={1} />
              </div>
            )}
          </div>

          <div className="flex-1 overflow-auto no-scrollbar">
            <table className="w-full text-left">
              <thead className="bg-white sticky top-0 z-10 border-b border-slate-100">
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  {selectedReport === "incidencias" && (
                    <>
                      <th className="px-6 py-4">Fecha</th>
                      <th className="px-6 py-4">Estudiante</th>
                      <th className="px-6 py-4">Tipo</th>
                      <th className="px-6 py-4">Observaciones Institucionales</th>
                    </>
                  )}
                  {selectedReport === "estudiantes" && (
                    <>
                      <th className="px-6 py-4">#</th>
                      <th className="px-6 py-4">Estudiante</th>
                      <th className="px-6 py-4">Matrícula</th>
                      <th className="px-6 py-4">Estado de Seguimiento</th>
                    </>
                  )}
                  {selectedReport === "asistencia" && (
                    <>
                      <th className="px-6 py-4">Estudiante</th>
                      <th className="px-6 py-4">Grupo</th>
                      <th className="px-6 py-4 text-center">Faltas</th>
                      <th className="px-6 py-4 text-center">Retardos</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {selectedReport === "incidencias" && filteredIncidents.map((i, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-bold text-slate-500">{new Date(i.date).toLocaleDateString("es-MX")}</td>
                    <td className="px-6 py-4 font-bold text-slate-800 text-sm tracking-tight">{anonymizeName(i.studentName)}</td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">{i.type}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">{i.description}</td>
                  </tr>
                ))}
                
                {selectedReport === "estudiantes" && students.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-[10px] font-black text-slate-300">#{idx + 1}</td>
                    <td className="px-6 py-4 font-bold text-slate-800 text-sm tracking-tight">{anonymizeName(s.name)}</td>
                    <td className="px-6 py-4 font-mono text-[10px] font-black text-slate-400">{s.matricula}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border ${
                        s.caseState === CaseState.CERRADO ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                      }`}>{CaseLabels[s.caseState]}</span>
                    </td>
                  </tr>
                ))}

                {selectedReport === "asistencia" && students
                  .map(s => {
                    const c = s.incidents.reduce((acc, i) => {
                      if (i.type === IncidentType.ASISTENCIA) acc.f++;
                      if (i.type === IncidentType.RETARDO) acc.r++;
                      return acc;
                    }, { f: 0, r: 0 });
                    return { ...s, ...c };
                  })
                  .filter(s => s.f > 0 || s.r > 0)
                  .map((s, idx) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800 text-sm tracking-tight">{anonymizeName(s.name)}</td>
                      <td className="px-6 py-4 text-xs font-black text-slate-400">GRUPO {s.group}</td>
                      <td className="px-6 py-4 text-center font-black text-rose-600">{s.f}</td>
                      <td className="px-6 py-4 text-center font-black text-amber-600">{s.r}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
};
