import React, { useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "../store";
import { CaseState, CaseLabels, IncidentType, UserRole, AppModule } from "../types";
import { printContent } from "./PrintButtons";
import { anonymizeName } from "../utils/saseUtils";
import { GlassCard } from "./ui/GlassCard";

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
          <span className="material-icons text-lg">{icon}</span>
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
                    }">${CaseLabels[s.caseState]}</span></td>
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
          const countsByType = filteredIncidents.reduce(
            (acc, i) => {
              if (i.type === IncidentType.ASISTENCIA) acc.faltas++;
              if (i.type === IncidentType.RETARDO) acc.retardos++;
              return acc;
            },
            { faltas: 0, retardos: 0 },
          );

          htmlContent = `
            <h2>Período: ${dateRange.start} al ${dateRange.end}</h2>
            <h3>Indicadores de Asistencia</h3>
            <table>
              <thead>
                <tr><th>Indicador</th><th>Valor</th></tr>
              </thead>
              <tbody>
                <tr><td>Total de Alumnos</td><td>${students.length}</td></tr>
                <tr><td>Faltas Registradas</td><td>${countsByType.faltas}</td></tr>
                <tr><td>Retardos Registrados</td><td>${countsByType.retardos}</td></tr>
                <tr><td>Tasa de Asistencia Estimada</td><td>${
                  students.length > 0
                    ? (100 - (countsByType.faltas / (students.length * 5)) * 100).toFixed(
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
                    const sCounts = s.incidents.reduce(
                      (acc, i) => {
                        if (i.type === IncidentType.ASISTENCIA) acc.faltas++;
                        if (i.type === IncidentType.RETARDO) acc.retardos++;
                        return acc;
                      },
                      { faltas: 0, retardos: 0 },
                    );
                    return { ...s, ...sCounts };
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
      color: "indigo" as const,
    },
  ];

  const reportColors: Record<string, string> = {
    amber: "text-amber-400 border-amber-500/20 bg-amber-500/5",
    emerald: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
    indigo: "text-indigo-400 border-indigo-500/20 bg-indigo-500/5",
  };

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
          <span className="material-icons text-5xl">lock</span>
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 p-4 sm:p-6 lg:p-8 pb-32 sm:pb-8 relative z-10 w-full max-w-7xl mx-auto flex flex-col min-h-full"
    >
      {/* ENCABEZADO */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight uppercase italic">
          Reportes Institucionales
        </h1>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">
          Filtra, consulta e imprime la bitácora e incidencias por periodo.
        </p>
      </div>
 
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        {/* PANEL LATERAL DE FILTROS */}
        <GlassCard className="lg:col-span-1 flex flex-col h-fit md:sticky md:top-0">
          <h2 className="text-sm font-black text-white mb-4 flex items-center gap-2 uppercase tracking-widest italic">
            <span className="material-icons text-blue-400 text-lg">filter_alt</span>
            Filtros
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Tipo de reporte
              </label>
              <div className="mt-2 space-y-2">
                {reportOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedReport(opt.id as ReportType)}
                    className={`w-full text-left px-3 py-2 rounded-xl border transition-all ${
                      selectedReport === opt.id
                        ? `${reportColors[opt.color]} shadow-xl shadow-black/5`
                        : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-icons text-sm">
                        {opt.icon}
                      </span>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider">
                          {opt.label}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {opt.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Rango de fechas
              </label>
              <div className="mt-2 space-y-2">
                <input
                  type="date"
                  title="Fecha de inicio del reporte"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, start: e.target.value })
                  }
                  className="bg-white/5 border border-white/10 rounded-xl p-2 text-white focus:border-blue-400 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] w-full"
                />
                <input
                  type="date"
                  title="Fecha de fin del reporte"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, end: e.target.value })
                  }
                  className="bg-white/5 border border-white/10 rounded-xl p-2 text-white focus:border-blue-400 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] w-full"
                />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* ÁREA PRINCIPAL: TABLA Y ACCIONES */}
        <GlassCard className="lg:col-span-3 flex flex-col h-full overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-white/10">
            <div className="text-xs text-slate-400 font-medium">
              Reporte activo: <span className="text-slate-200">{reportOptions.find((opt) => opt.id === selectedReport)?.label}</span>
            </div>
            <div className="flex justify-end gap-3">
              <motion.button
                whileHover={{ scale: isPrinting ? 1 : 1.05 }}
                whileTap={{ scale: isPrinting ? 1 : 0.95 }}
                disabled={isPrinting}
                onClick={handlePrintReport}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all text-sm ${isPrinting ? 'bg-blue-500/20 border-blue-500/50 text-blue-200' : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'}`}
              >
                {isPrinting ? (
                  <>
                    <span className="material-icons text-sm animate-spin">sync</span>
                    Preparando documento...
                  </>
                ) : (
                  <>
                    <span className="material-icons text-sm">print</span>
                    Generar Reporte
                  </>
                )}
              </motion.button>
            </div>
          </div>

          <div className="mb-6">
            {selectedReport === "incidencias" && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <IntelligenceKPI
                  label="Faltas"
                  value={incidentsByType.faltas}
                  color="rose"
                  icon="event_busy"
                  delay={0}
                />
                <IntelligenceKPI
                  label="Retardos"
                  value={incidentsByType.retardos}
                  color="amber"
                  icon="timer"
                  delay={1}
                />
              </div>
            )}
          </div>

          <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar pr-2">
            {selectedReport === "incidencias" && (
              <table className="w-full text-left text-sm">
                <thead className="text-slate-400">
                  <tr>
                    <th className="py-3 px-3">Fecha</th>
                    <th className="py-3 px-3">Estudiante</th>
                    <th className="py-3 px-3">Grupo</th>
                    <th className="py-3 px-3">Categoria</th>
                    <th className="py-3 px-3">Observaciones</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  {filteredIncidents.length === 0 && (
                    <tr>
                      <td className="py-6 px-3 text-slate-500" colSpan={5}>
                        No hay incidencias en el rango seleccionado.
                      </td>
                    </tr>
                  )}
                  {filteredIncidents.map((i, idx) => (
                    <tr key={`${i.id || "inc"}-${idx}`} className="border-t border-white/5">
                      <td className="py-3 px-3">
                        {new Date(i.date).toLocaleDateString("es-MX")}
                      </td>
                      <td className="py-3 px-3 font-semibold">
                        {anonymizeName(i.studentName)}
                      </td>
                      <td className="py-3 px-3">{i.group}</td>
                      <td className="py-3 px-3">{i.type}</td>
                      <td className="py-3 px-3 text-slate-400">
                        {i.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {selectedReport === "estudiantes" && (
              <table className="w-full text-left text-sm">
                <thead className="text-slate-400">
                  <tr>
                    <th className="py-3 px-3">#</th>
                    <th className="py-3 px-3">Nombre</th>
                    <th className="py-3 px-3">Matricula</th>
                    <th className="py-3 px-3">Grupo</th>
                    <th className="py-3 px-3">Estado</th>
                    <th className="py-3 px-3">Incidencias</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  {students.length === 0 && (
                    <tr>
                      <td className="py-6 px-3 text-slate-500" colSpan={6}>
                        No hay estudiantes cargados.
                      </td>
                    </tr>
                  )}
                  {students.map((s, idx) => (
                    <tr key={s.id || idx} className="border-t border-white/5">
                      <td className="py-3 px-3">{idx + 1}</td>
                      <td className="py-3 px-3 font-semibold">
                        {anonymizeName(s.name)}
                      </td>
                      <td className="py-3 px-3">{s.matricula}</td>
                      <td className="py-3 px-3">{s.group}</td>
                      <td className="py-3 px-3">{CaseLabels[s.caseState]}</td>
                      <td className="py-3 px-3">{s.incidents.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {selectedReport === "asistencia" && (
              <table className="w-full text-left text-sm">
                <thead className="text-slate-400">
                  <tr>
                    <th className="py-3 px-3">Alumno</th>
                    <th className="py-3 px-3">Grupo</th>
                    <th className="py-3 px-3">Faltas</th>
                    <th className="py-3 px-3">Retardos</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  {students
                    .map((s) => {
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
                    .map((s) => (
                      <tr key={s.id} className="border-t border-white/5">
                        <td className="py-3 px-3 font-semibold">
                          {anonymizeName(s.name)}
                        </td>
                        <td className="py-3 px-3">{s.group}</td>
                        <td className="py-3 px-3">{s.faltas}</td>
                        <td className="py-3 px-3">{s.retardos}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
};
