import React, { useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "../store";
import { CaseState, IncidentType, UserRole, AppModule } from "../types";
import { printContent } from "./PrintButtons";
import { anonymizeName } from "../utils/saseUtils";

type ReportType = "incidencias" | "asistencia" | "estudiantes" | "bitacora";

// --- MICRO-COMPONENT: IntelligenceKPI ---
const IntelligenceKPI = ({
  icon,
  label,
  value,
  color = "cyan",
  delay = 0,
}: {
  icon: string;
  label: string;
  value: string | number;
  color?: "cyan" | "indigo" | "rose" | "amber" | "emerald";
  delay?: number;
}) => {
  const colors = {
    cyan: "text-cyan-400 border-cyan-500/20 bg-cyan-500/5 shadow-cyan-500/10",
    indigo:
      "text-indigo-400 border-indigo-500/20 bg-indigo-500/5 shadow-indigo-500/10",
    rose: "text-rose-400 border-rose-500/20 bg-rose-500/5 shadow-rose-500/10",
    amber:
      "text-amber-400 border-amber-500/20 bg-amber-500/5 shadow-amber-500/10",
    emerald:
      "text-emerald-400 border-emerald-500/20 bg-emerald-500/5 shadow-emerald-500/10",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: delay * 0.1 }}
      className={`card-sase p-6 border ${colors[color]} relative overflow-hidden group hover:bg-white/[0.03] transition-all`}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-current opacity-[0.03] rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:opacity-[0.06] transition-opacity"></div>
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`p-2 rounded-xl border ${colors[color]} bg-transparent`}
        >
          <span className="material-symbols-outlined text-lg">{icon}</span>
        </div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">
          {label}
        </p>
      </div>
      <h4 className="text-4xl font-black text-white tracking-tighter italic font-mono tabular-nums">
        {value}
      </h4>
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-current to-transparent opacity-20"></div>
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
      <div className="flex flex-col items-center justify-center h-full p-20 text-center animate-fade-in">
        <div className="size-24 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center text-rose-500 mb-8 shadow-2xl shadow-rose-500/10">
          <span className="material-symbols-outlined text-5xl">lock</span>
        </div>
        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">
          Acceso Restringido
        </h2>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest max-w-md leading-relaxed">
          Su rol ({roleName}) no tiene autorizada la generación de reportes de
          asistencia o incidencias por protocolos de privacidad institucional.
        </p>
        <button
          onClick={() => setCurrentModule(AppModule.DASHBOARD)}
          className="mt-10 px-8 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

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
    let htmlContent = "";
    let title = "";

    switch (selectedReport) {
      case "incidencias":
        title = "Reporte de Incidencias Institucional";
        htmlContent = `
          <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 800px; margin: 0 auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px;">
              <div style="display: flex; align-items: center; gap: 20px;">
                <img src="/assets/branding/SASE.png" style="height: 60px;" />
                <div style="border-left: 2px solid #cbd5e1; padding-left: 20px; height: 50px; display: flex; flex-direction: column; justify-content: center;">
                  <h1 style="margin: 0; font-size: 20px; color: #1e293b; text-transform: uppercase;">${
                    title
                  }</h1>
                  <p style="margin: 5px 0 0; font-size: 10px; color: #64748b; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">Sistema de Asistencia y Seguimiento Escolar</p>
                </div>
              </div>
              <img src="/assets/branding/PILOTO.png" style="height: 60px;" />
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
                <tr>
                  <td style="padding: 12px; border: 1px solid #e2e8f0;">Faltas de Uniforme</td>
                  <td style="padding: 12px; border: 1px solid #e2e8f0;">${incidentsByType.uniformes}</td>
                  <td style="padding: 12px; border: 1px solid #e2e8f0;">${
                    filteredIncidents.length > 0
                      ? (
                          (incidentsByType.uniformes /
                            filteredIncidents.length) *
                          100
                        ).toFixed(1)
                      : 0
                  }%</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border: 1px solid #e2e8f0;">Reportes de Conducta</td>
                  <td style="padding: 12px; border: 1px solid #e2e8f0;">${incidentsByType.conducta}</td>
                  <td style="padding: 12px; border: 1px solid #e2e8f0;">${
                    filteredIncidents.length > 0
                      ? (
                          (incidentsByType.conducta /
                            filteredIncidents.length) *
                          100
                        ).toFixed(1)
                      : 0
                  }%</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border: 1px solid #e2e8f0;">Inasistencias Injustificadas</td>
                  <td style="padding: 12px; border: 1px solid #e2e8f0;">${incidentsByType.faltas}</td>
                  <td style="padding: 12px; border: 1px solid #e2e8f0;">${
                    filteredIncidents.length > 0
                      ? (
                          (incidentsByType.faltas / filteredIncidents.length) *
                          100
                        ).toFixed(1)
                      : 0
                  }%</td>
                </tr>
                <tr style="font-weight: bold; background: #e2e8f0;">
                  <td style="padding: 12px; border: 1px solid #cbd5e1;">TOTAL GENERAL</td>
                  <td style="padding: 12px; border: 1px solid #cbd5e1;">${filteredIncidents.length}</td>
                  <td style="padding: 12px; border: 1px solid #cbd5e1;">100%</td>
                </tr>
              </tbody>
            </table>

            <h3 style="font-size: 16px; border-left: 4px solid #1d4ed8; padding-left: 10px; margin-bottom: 20px; text-transform: uppercase;">Desglose Detallado</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <thead>
                <tr style="background: #f1f5f9; text-align: left;">
                  <th style="padding: 10px; border: 1px solid #e2e8f0;">Fecha</th>
                  <th style="padding: 10px; border: 1px solid #e2e8f0;">Estudiante</th>
                  <th style="padding: 10px; border: 1px solid #e2e8f0;">Grupo</th>
                  <th style="padding: 10px; border: 1px solid #e2e8f0;">Categoría</th>
                  <th style="padding: 10px; border: 1px solid #e2e8f0;">Observaciones</th>
                </tr>
              </thead>
              <tbody>
                ${filteredIncidents
                  .slice(0, 50)
                  .map(
                    (i) => `
                  <tr>
                    <td style="padding: 10px; border: 1px solid #e2e8f0;">${new Date(i.date).toLocaleDateString("es-MX")}</td>
                    <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">${anonymizeName(i.studentName)}</td>
                    <td style="padding: 10px; border: 1px solid #e2e8f0;">${i.group}</td>
                    <td style="padding: 10px; border: 1px solid #e2e8f0;">
                      <span style="padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 10px; background: ${
                        i.type === IncidentType.RETARDO
                          ? "#fef3c7"
                          : i.type === IncidentType.CONDUCTA
                            ? "#fee2e2"
                            : "#dbeafe"
                      }; color: ${
                        i.type === IncidentType.RETARDO
                          ? "#92400e"
                          : i.type === IncidentType.CONDUCTA
                            ? "#991b1b"
                            : "#1e40af"
                      }; text-transform: uppercase;">${i.type}</span>
                    </td>
                    <td style="padding: 10px; border: 1px solid #e2e8f0; color: #64748b;">${i.description}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
            ${
              filteredIncidents.length > 50
                ? `<p style="color:#64748b; font-size:12px; margin-top: 20px; font-style: italic;">Mostrando los primeros 50 registros de un total de ${filteredIncidents.length}. Para el listado completo, consulte el sistema digital.</p>`
                : ""
            }
            <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px;">
              Documento generado automáticamente por el Sistema SASE el ${new Date().toLocaleString("es-MX")}
            </div>
          </div>
        `;
        break;

      case "estudiantes":
        title = "Directorio de Estudiantes";
        htmlContent = `
          <h2>Total de Estudiantes: ${students.length}</h2>
          <h3>Distribución por Estado</h3>
          <table>
            <thead>
              <tr><th>Estado</th><th>Cantidad</th><th>Porcentaje</th></tr>
            </thead>
            <tbody>
              <tr><td><span class="badge badge-green">Cerrado</span></td><td>${
                studentsByState.cerrados
              }</td><td>${
                students.length > 0
                  ? (
                      (studentsByState.cerrados / students.length) *
                      100
                    ).toFixed(1)
                  : 0
              }%</td></tr>
              <tr><td><span class="badge badge-blue">Observado</span></td><td>${
                studentsByState.observados
              }</td><td>${
                students.length > 0
                  ? (
                      (studentsByState.observados / students.length) *
                      100
                    ).toFixed(1)
                  : 0
              }%</td></tr>
              <tr><td><span class="badge badge-red">Patrón Detectado</span></td><td>${
                studentsByState.patron
              }</td><td>${
                students.length > 0
                  ? ((studentsByState.patron / students.length) * 100).toFixed(
                      1,
                    )
                  : 0
              }%</td></tr>
            </tbody>
          </table>
          <h3>Listado Completo</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Matrícula</th>
                <th>Grupo</th>
                <th>Estado</th>
                <th>Incidencias</th>
              </tr>
            </thead>
            <tbody>
              ${students
                .map(
                  (s, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${anonymizeName(s.name)}</td>
                  <td>${s.matricula}</td>
                  <td>${s.group}</td>
                  <td><span class="badge badge-${
                    s.caseState === CaseState.CERRADO
                      ? "green"
                      : s.caseState === CaseState.OBSERVADO
                        ? "blue"
                        : "red"
                  }">${s.caseState}</span></td>
                  <td>${s.incidents.length}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        `;
        break;

      case "asistencia":
        title = "Reporte de Asistencia";
        // Use memoized values instead of re-filtering
        const faltasCount = incidentsByType.faltas;
        const retardosCount = incidentsByType.retardos;

        htmlContent = `
          <h2>Período: ${dateRange.start} al ${dateRange.end}</h2>
          <h3>Indicadores de Asistencia</h3>
          <table>
            <thead>
              <tr><th>Indicador</th><th>Valor</th></tr>
            </thead>
            <tbody>
              <tr><td>Total de Alumnos</td><td>${students.length}</td></tr>
              <tr><td>Faltas Registradas</td><td>${faltasCount}</td></tr>
              <tr><td>Retardos Registrados</td><td>${retardosCount}</td></tr>
              <tr><td>Tasa de Asistencia Estimada</td><td>${
                students.length > 0
                  ? (100 - (faltasCount / (students.length * 5)) * 100).toFixed(
                      1,
                    )
                  : 100
              }%</td></tr>
            </tbody>
          </table>
          <h3>Alumnos con Más Inasistencias</h3>
          <table>
            <thead>
              <tr><th>Alumno</th><th>Grupo</th><th>Faltas</th><th>Retardos</th></tr>
            </thead>
            <tbody>
              ${students
                .map((s) => {
                  // Optimization: Single pass reduction instead of multiple filters
                  const counts = s.incidents.reduce(
                    (acc, i) => {
                      if (i.type === IncidentType.ASISTENCIA) acc.faltas++;
                      if (i.type === IncidentType.RETARDO) acc.retardos++;
                      return acc;
                    },
                    { faltas: 0, retardos: 0 },
                  );
                  return { ...s, ...counts };
                })
                .filter((s) => s.faltas > 0 || s.retardos > 0)
                .sort((a, b) => b.faltas + b.retardos - (a.faltas + a.retardos))
                .slice(0, 20)
                .map(
                  (s) => `
                  <tr>
                    <td>${anonymizeName(s.name)}</td>
                    <td>${s.group}</td>
                    <td>${s.faltas}</td>
                    <td>${s.retardos}</td>
                  </tr>
                `,
                )
                .join("")}
            </tbody>
          </table>
        `;
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
      color: "indigo" as const,
    },
  ];

  const reportColors: Record<string, string> = {
    amber: "text-amber-400 border-amber-500/20 bg-amber-500/5",
    emerald: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
    indigo: "text-indigo-400 border-indigo-500/20 bg-indigo-500/5",
  };

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar p-4 lg:p-8 animate-fade-in font-sans">
      <div className="max-w-[1600px] mx-auto space-y-8 pb-32">
        {/* COMMAND HEADER */}
        <div className="card-sase p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px] -mr-40 -mt-40 group-hover:bg-cyan-500/10 transition-colors duration-1000"></div>

          <div className="flex items-center gap-6 relative z-10">
            <div className="size-20 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center justify-center text-cyan-500 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-cyan-500/10 animate-pulse"></div>
              <span className="material-symbols-outlined text-4xl font-black relative z-10">
                analytics
              </span>
            </div>
            <div>
              <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">
                TERMINAL DE <span className="text-cyan-400">INTELIGENCIA</span>
              </h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-3 italic">
                DATA_ANALYTICS_MODULE // SASE-310
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 relative z-10">
            <div className="flex items-center gap-2 px-3 py-1 bg-cyan-500/10 text-cyan-500 text-[9px] font-black rounded border border-cyan-500/20 tabular-nums uppercase tracking-widest overflow-hidden relative">
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="size-1.5 bg-cyan-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]"
              />
              <span className="relative z-10">PIPELINE_ACTIVE</span>
            </div>
            <button
              onClick={handlePrintReport}
              className="px-8 py-4 bg-cyan-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-cyan-600/20 hover:bg-cyan-500 transition-all flex items-center gap-3 active:scale-95"
            >
              <span className="material-symbols-outlined text-xl">print</span>
              GENERAR_INFORME
            </button>
          </div>
        </div>

        {/* REPORT TYPE SELECTOR — TACTICAL CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reportOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedReport(opt.id as ReportType)}
              className={`card-sase p-6 text-left transition-all relative overflow-hidden group/card ${
                selectedReport === opt.id
                  ? `border ${reportColors[opt.color]} scale-[1.02] shadow-xl`
                  : "border-white/5 hover:border-white/10 hover:bg-white/[0.02]"
              }`}
            >
              <div className="flex items-start gap-4 relative z-10">
                <div
                  className={`size-12 rounded-2xl flex items-center justify-center border transition-all ${
                    selectedReport === opt.id
                      ? reportColors[opt.color]
                      : "bg-white/[0.03] border-white/10 text-slate-500"
                  }`}
                >
                  <span className="material-symbols-outlined">{opt.icon}</span>
                </div>
                <div>
                  <p
                    className={`font-black text-sm uppercase italic tracking-tight ${
                      selectedReport === opt.id
                        ? "text-white"
                        : "text-slate-400"
                    }`}
                  >
                    {opt.label}
                  </p>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">
                    {opt.description}
                  </p>
                </div>
              </div>
              {selectedReport === opt.id && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-current to-transparent opacity-30"></div>
              )}
            </button>
          ))}
        </div>

        {/* FILTER BAR — TACTICAL */}
        <div className="card-sase p-6 border-white/5">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="size-8 bg-white/[0.03] border border-white/10 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px] text-cyan-500">
                  date_range
                </span>
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                VENTANA_TEMPORAL
              </span>
            </div>

            <div className="flex items-center gap-4 bg-white/[0.02] p-2 rounded-2xl border border-white/5">
              <input
                type="date"
                title="Fecha de inicio del reporte"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                className="bg-transparent border-none text-xs font-black text-slate-300 outline-none p-2 cursor-pointer font-mono"
              />
              <span className="text-slate-600 font-black text-[9px] uppercase tracking-widest">
                →
              </span>
              <input
                type="date"
                title="Fecha de fin del reporte"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                className="bg-transparent border-none text-xs font-black text-slate-300 outline-none p-2 cursor-pointer font-mono"
              />
            </div>

            <div className="flex gap-2">
              {["7D", "30D", "1Y"].map((lbl) => (
                <button
                  key={lbl}
                  className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/5 rounded-xl border border-transparent hover:border-cyan-500/20 transition-all"
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* DATA PREVIEW — INTELLIGENCE VIEW */}
        <div className="card-sase border-white/5 overflow-hidden">
          <div className="px-8 py-6 border-b border-white/5 bg-white/[0.01] flex justify-between items-center relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
            <div className="flex items-center gap-4 pl-4">
              <div className="size-10 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-500">
                <span className="material-symbols-outlined text-xl">
                  query_stats
                </span>
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">
                  VISTA PREVIA{" "}
                  <span className="text-cyan-400">INTELIGENTE</span>
                </h3>
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">
                  PROCESADOR DE DATOS INSTITUCIONALES
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-mono text-slate-500 uppercase tracking-widest">
              {filteredIncidents.length} REG_ACTIVOS
            </span>
          </div>

          <div className="p-8">
            {selectedReport === "incidencias" && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <IntelligenceKPI
                  label="Retardos"
                  value={incidentsByType.retardos}
                  color="amber"
                  icon="timer"
                  delay={0}
                />
                <IntelligenceKPI
                  label="Uniforme"
                  value={incidentsByType.uniformes}
                  color="indigo"
                  icon="checkroom"
                  delay={1}
                />
                <IntelligenceKPI
                  label="Conducta"
                  value={incidentsByType.conducta}
                  color="rose"
                  icon="gavel"
                  delay={2}
                />
                <IntelligenceKPI
                  label="Faltas"
                  value={incidentsByType.faltas}
                  color="cyan"
                  icon="event_busy"
                  delay={3}
                />
              </div>
            )}

            {selectedReport === "estudiantes" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <IntelligenceKPI
                  label="Caso Cerrado"
                  value={studentsByState.cerrados}
                  color="emerald"
                  icon="task_alt"
                  delay={0}
                />
                <IntelligenceKPI
                  label="Bajo Observación"
                  value={studentsByState.observados}
                  color="indigo"
                  icon="visibility"
                  delay={1}
                />
                <IntelligenceKPI
                  label="Patrón Detectado"
                  value={studentsByState.patron}
                  color="rose"
                  icon="warning"
                  delay={2}
                />
              </div>
            )}

            {selectedReport === "asistencia" && (
              <div className="card-sase p-10 border-white/5 flex flex-col items-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] to-transparent pointer-events-none"></div>
                <motion.p
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-7xl font-black text-white italic tracking-tighter mb-4 font-mono tabular-nums relative z-10 drop-shadow-[0_0_40px_rgba(6,182,212,0.3)]"
                >
                  {students.length > 0
                    ? (
                        100 -
                        (incidentsByType.faltas / (students.length * 5)) * 100
                      ).toFixed(1)
                    : 100}
                  %
                </motion.p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic relative z-10">
                  EFICIENCIA_ASISTENCIA_GLOBAL
                </p>
                <div className="flex gap-8 mt-8 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="size-2 bg-rose-400 rounded-full shadow-[0_0_6px_rgba(251,113,133,0.6)]"></span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
                      {incidentsByType.faltas} FALTAS
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-2 bg-amber-400 rounded-full shadow-[0_0_6px_rgba(251,191,36,0.6)]"></span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
                      {incidentsByType.retardos} RETARDOS
                    </span>
                  </div>
                </div>
                {/* Decorative scan line */}
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
