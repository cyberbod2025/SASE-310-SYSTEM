import React, { useState } from "react";
import { useApp } from "../store";
import { CaseState, IncidentType } from "../types";
import { printContent } from "./PrintButtons";
import { anonymizeName } from "../utils/saseUtils";

type ReportType = "incidencias" | "asistencia" | "estudiantes" | "bitacora";

export const Reportes: React.FC = () => {
  const { students, currentUserRole } = useApp();
  const [selectedReport, setSelectedReport] =
    useState<ReportType>("incidencias");
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

    printContent(title, htmlContent);
  };

  const reportOptions = [
    {
      id: "incidencias",
      label: "Incidencias",
      icon: "warning",
      description: "Retardos, conducta, uniformes",
    },
    {
      id: "asistencia",
      label: "Asistencia",
      icon: "fact_check",
      description: "Faltas y puntualidad",
    },
    {
      id: "estudiantes",
      label: "Estudiantes",
      icon: "groups",
      description: "Directorio y estados",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1 h-full bg-blue-600"></div>
            <span className="material-symbols-outlined text-blue-700 text-4xl">
              analytics
            </span>
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
              Reportes Institucionales
            </h2>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 mt-1">
              Inteligencia de Datos Institucionales
            </p>
          </div>
        </div>
        <button
          onClick={handlePrintReport}
          className="flex items-center gap-3 px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-100"
        >
          <span className="material-symbols-outlined text-[20px]">print</span>
          Generar Informe Oficial
        </button>
      </div>

      {/* Report Type Selector - Premium Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelectedReport(opt.id as ReportType)}
            className={`p-6 rounded-[2rem] border-2 transition-all text-left relative group overflow-hidden ${
              selectedReport === opt.id
                ? "border-blue-700 bg-white shadow-xl shadow-blue-900/5 scale-[1.02]"
                : "border-slate-100 bg-slate-50/50 hover:border-blue-200 hover:bg-white"
            }`}
          >
            <div className="flex items-start gap-4 relative z-10">
              <div
                className={`size-12 rounded-2xl flex items-center justify-center transition-colors ${
                  selectedReport === opt.id
                    ? "bg-blue-700 text-white shadow-lg shadow-blue-700/20"
                    : "bg-white text-slate-400 border border-slate-100"
                }`}
              >
                <span className="material-symbols-outlined">{opt.icon}</span>
              </div>
              <div>
                <p
                  className={`font-black text-sm uppercase italic tracking-tight ${
                    selectedReport === opt.id
                      ? "text-blue-700"
                      : "text-slate-600"
                  }`}
                >
                  {opt.label}
                </p>
                <p className="text-[11px] font-bold text-slate-500 uppercase mt-1 leading-relaxed opacity-80">
                  {opt.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Filter Bar - Modern & Clean */}
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-slate-100 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px] text-slate-500">
                date_range
              </span>
            </div>
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
              Periodo de Análisis
            </span>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
              className="bg-transparent border-none text-xs font-black text-slate-700 outline-none p-2 cursor-pointer"
            />
            <span className="text-slate-300 font-bold text-xs uppercase">
              al
            </span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
              className="bg-transparent border-none text-xs font-black text-slate-700 outline-none p-2 cursor-pointer"
            />
          </div>

          <div className="flex gap-2">
            {["Semana", "Mes", "Año"].map((lbl) => (
              <button
                key={lbl}
                className="px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all"
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Section - Executive High Contrast */}
      <div className="bg-white border border-slate-200 rounded-[3rem] shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-6 bg-blue-700 rounded-full"></div>
            <h3 className="font-black text-lg text-slate-800 uppercase italic tracking-tight">
              Vista Previa Institucional
            </h3>
          </div>
          <span className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-black uppercase tracking-widest border border-blue-100">
            {filteredIncidents.length} Registros Activos
          </span>
        </div>

        <div className="p-10">
          {selectedReport === "incidencias" && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <ReportStat
                label="Retardos"
                value={incidentsByType.retardos}
                color="amber"
                icon="timer"
              />
              <ReportStat
                label="Uniforme"
                value={incidentsByType.uniformes}
                color="blue"
                icon="checkroom"
              />
              <ReportStat
                label="Conducta"
                value={incidentsByType.conducta}
                color="red"
                icon="gavel"
              />
              <ReportStat
                label="Faltas"
                value={incidentsByType.faltas}
                color="slate"
                icon="event_busy"
              />
            </div>
          )}

          {selectedReport === "estudiantes" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ReportStat
                label="Cerrado"
                value={studentsByState.cerrados}
                color="green"
                icon="task_alt"
              />
              <ReportStat
                label="Observación"
                value={studentsByState.observados}
                color="blue"
                icon="visibility"
              />
              <ReportStat
                label="En Riesgo"
                value={studentsByState.patron}
                color="red"
                icon="warning"
              />
            </div>
          )}

          {selectedReport === "asistencia" && (
            <div className="flex flex-col items-center py-12 bg-slate-50/50 rounded-[2rem] border border-slate-100 border-dashed">
              <p className="text-7xl font-black text-blue-700 italic tracking-tighter mb-4">
                {students.length > 0
                  ? (
                      100 -
                      (incidentsByType.faltas / (students.length * 5)) * 100
                    ).toFixed(1)
                  : 100}
                %
              </p>
              <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">
                Eficiencia de Asistencia Global
              </p>
              <div className="flex gap-8 mt-8">
                <div className="flex items-center gap-2">
                  <span className="size-2 bg-slate-300 rounded-full"></span>
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                    {incidentsByType.faltas} Faltas
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-2 bg-blue-400 rounded-full"></span>
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                    {incidentsByType.retardos} Retardos
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ReportStat = ({ label, value, color, icon }: any) => {
  const colors: any = {
    amber: "border-amber-200 text-amber-700 bg-amber-50/50",
    blue: "border-blue-200 text-blue-700 bg-blue-50/50",
    red: "border-red-200 text-red-700 bg-red-50/50",
    green: "border-green-200 text-green-700 bg-green-50/50",
    slate: "border-slate-200 text-slate-700 bg-slate-50/50",
  };
  return (
    <div
      className={`p-8 rounded-[2rem] border shadow-sm flex flex-col items-center text-center group transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 ${colors[color]}`}
    >
      <span className="material-symbols-outlined text-4xl mb-4 opacity-40 group-hover:scale-110 transition-transform">
        {icon}
      </span>
      <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
        {label}
      </p>
      <p className="text-5xl font-black tracking-tight text-slate-800 italic">
        {value}
      </p>
    </div>
  );
};
