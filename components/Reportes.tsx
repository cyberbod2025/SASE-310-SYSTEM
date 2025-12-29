import React, { useState } from "react";
import { useApp } from "../store";
import { CaseState, IncidentType } from "../types";
import { printContent } from "./PrintButtons";

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

  // Aggregate data for reports
  const allIncidents = students.flatMap((s) =>
    s.incidents.map((i) => ({
      ...i,
      studentName: s.name,
      group: s.group,
    }))
  );

  const filteredIncidents = allIncidents.filter(
    (i) => i.date >= dateRange.start && i.date <= dateRange.end + "T23:59:59"
  );

  const incidentsByType = {
    retardos: filteredIncidents.filter((i) => i.type === IncidentType.RETARDO)
      .length,
    uniformes: filteredIncidents.filter((i) => i.type === IncidentType.UNIFORME)
      .length,
    conducta: filteredIncidents.filter((i) => i.type === IncidentType.CONDUCTA)
      .length,
    faltas: filteredIncidents.filter((i) => i.type === IncidentType.ASISTENCIA)
      .length,
  };

  const studentsByState = {
    cerrados: students.filter((s) => s.caseState === CaseState.CERRADO).length,
    observados: students.filter((s) => s.caseState === CaseState.OBSERVADO)
      .length,
    patron: students.filter((s) => s.caseState === CaseState.PATRON_DETECTADO)
      .length,
  };

  const handlePrintReport = () => {
    let htmlContent = "";
    let title = "";

    switch (selectedReport) {
      case "incidencias":
        title = "Reporte de Incidencias";
        htmlContent = `
          <h2>Período: ${dateRange.start} al ${dateRange.end}</h2>
          <h3>Resumen por Tipo</h3>
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Porcentaje</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Retardos</td><td>${incidentsByType.retardos}</td><td>${
          filteredIncidents.length > 0
            ? (
                (incidentsByType.retardos / filteredIncidents.length) *
                100
              ).toFixed(1)
            : 0
        }%</td></tr>
              <tr><td>Uniforme</td><td>${incidentsByType.uniformes}</td><td>${
          filteredIncidents.length > 0
            ? (
                (incidentsByType.uniformes / filteredIncidents.length) *
                100
              ).toFixed(1)
            : 0
        }%</td></tr>
              <tr><td>Conducta</td><td>${incidentsByType.conducta}</td><td>${
          filteredIncidents.length > 0
            ? (
                (incidentsByType.conducta / filteredIncidents.length) *
                100
              ).toFixed(1)
            : 0
        }%</td></tr>
              <tr><td>Faltas</td><td>${incidentsByType.faltas}</td><td>${
          filteredIncidents.length > 0
            ? (
                (incidentsByType.faltas / filteredIncidents.length) *
                100
              ).toFixed(1)
            : 0
        }%</td></tr>
              <tr style="font-weight:bold;background:#f5f5f5"><td>TOTAL</td><td>${
                filteredIncidents.length
              }</td><td>100%</td></tr>
            </tbody>
          </table>
          <h3>Detalle de Incidencias</h3>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Alumno</th>
                <th>Grupo</th>
                <th>Tipo</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              ${filteredIncidents
                .slice(0, 50)
                .map(
                  (i) => `
                <tr>
                  <td>${new Date(i.date).toLocaleDateString("es-MX")}</td>
                  <td>${i.studentName}</td>
                  <td>${i.group}</td>
                  <td><span class="badge badge-${
                    i.type === IncidentType.RETARDO
                      ? "yellow"
                      : i.type === IncidentType.CONDUCTA
                      ? "red"
                      : "blue"
                  }">${i.type}</span></td>
                  <td>${i.description}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          ${
            filteredIncidents.length > 50
              ? `<p style="color:#888;font-size:11px">Mostrando primeros 50 de ${filteredIncidents.length} registros.</p>`
              : ""
          }
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
            ? ((studentsByState.cerrados / students.length) * 100).toFixed(1)
            : 0
        }%</td></tr>
              <tr><td><span class="badge badge-blue">Observado</span></td><td>${
                studentsByState.observados
              }</td><td>${
          students.length > 0
            ? ((studentsByState.observados / students.length) * 100).toFixed(1)
            : 0
        }%</td></tr>
              <tr><td><span class="badge badge-red">Patrón Detectado</span></td><td>${
                studentsByState.patron
              }</td><td>${
          students.length > 0
            ? ((studentsByState.patron / students.length) * 100).toFixed(1)
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
                  <td>${s.name}</td>
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
              `
                )
                .join("")}
            </tbody>
          </table>
        `;
        break;

      case "asistencia":
        title = "Reporte de Asistencia";
        const faltasCount = filteredIncidents.filter(
          (i) => i.type === IncidentType.ASISTENCIA
        ).length;
        const retardosCount = filteredIncidents.filter(
          (i) => i.type === IncidentType.RETARDO
        ).length;
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
                      1
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
                .map((s) => ({
                  ...s,
                  faltas: s.incidents.filter(
                    (i) => i.type === IncidentType.ASISTENCIA
                  ).length,
                  retardos: s.incidents.filter(
                    (i) => i.type === IncidentType.RETARDO
                  ).length,
                }))
                .filter((s) => s.faltas > 0 || s.retardos > 0)
                .sort((a, b) => b.faltas + b.retardos - (a.faltas + a.retardos))
                .slice(0, 20)
                .map(
                  (s) => `
                  <tr>
                    <td>${s.name}</td>
                    <td>${s.group}</td>
                    <td>${s.faltas}</td>
                    <td>${s.retardos}</td>
                  </tr>
                `
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
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              analytics
            </span>
            Reportes y Estadísticas
          </h1>
          <p className="text-text-secondary">
            Generación de reportes institucionales
          </p>
        </div>
        <button
          onClick={handlePrintReport}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-hover transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined">print</span>
          Imprimir Reporte
        </button>
      </div>

      {/* Report Type Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reportOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelectedReport(opt.id as ReportType)}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              selectedReport === opt.id
                ? "border-primary bg-primary/5"
                : "border-border-color bg-white hover:border-primary/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`size-10 rounded-lg flex items-center justify-center ${
                  selectedReport === opt.id
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <span className="material-symbols-outlined">{opt.icon}</span>
              </div>
              <div>
                <p className="font-bold text-text-main">{opt.label}</p>
                <p className="text-xs text-text-secondary">{opt.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Date Range Filter */}
      <div className="bg-white p-4 rounded-xl border border-border-color shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-text-secondary">
              date_range
            </span>
            <span className="text-sm font-medium text-text-secondary">
              Período:
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
              className="px-3 py-2 border border-border-color rounded-lg text-sm"
            />
            <span className="text-text-secondary">al</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
              className="px-3 py-2 border border-border-color rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Report Preview */}
      <div className="bg-white rounded-xl border border-border-color shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border-color bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-lg text-text-main">
            Vista Previa:{" "}
            {reportOptions.find((r) => r.id === selectedReport)?.label}
          </h3>
          <span className="text-xs text-text-secondary">
            {filteredIncidents.length} registros en período
          </span>
        </div>

        <div className="p-6">
          {selectedReport === "incidencias" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-xs font-bold text-yellow-700 uppercase">
                    Retardos
                  </p>
                  <p className="text-2xl font-bold text-yellow-800">
                    {incidentsByType.retardos}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs font-bold text-blue-700 uppercase">
                    Uniforme
                  </p>
                  <p className="text-2xl font-bold text-blue-800">
                    {incidentsByType.uniformes}
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-xs font-bold text-red-700 uppercase">
                    Conducta
                  </p>
                  <p className="text-2xl font-bold text-red-800">
                    {incidentsByType.conducta}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-bold text-gray-700 uppercase">
                    Faltas
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    {incidentsByType.faltas}
                  </p>
                </div>
              </div>
              <p className="text-sm text-text-secondary text-center">
                Total: <strong>{filteredIncidents.length}</strong> incidencias
                en el período seleccionado
              </p>
            </div>
          )}

          {selectedReport === "estudiantes" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
                  <p className="text-xs font-bold text-green-700 uppercase">
                    Cerrado
                  </p>
                  <p className="text-2xl font-bold text-green-800">
                    {studentsByState.cerrados}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
                  <p className="text-xs font-bold text-blue-700 uppercase">
                    Observado
                  </p>
                  <p className="text-2xl font-bold text-blue-800">
                    {studentsByState.observados}
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-center">
                  <p className="text-xs font-bold text-red-700 uppercase">
                    Patrón Detectado
                  </p>
                  <p className="text-2xl font-bold text-red-800">
                    {studentsByState.patron}
                  </p>
                </div>
              </div>
              <p className="text-sm text-text-secondary text-center">
                Total: <strong>{students.length}</strong> estudiantes
                registrados
              </p>
            </div>
          )}

          {selectedReport === "asistencia" && (
            <div className="text-center py-4">
              <p className="text-4xl font-bold text-primary mb-2">
                {students.length > 0
                  ? (
                      100 -
                      (incidentsByType.faltas / (students.length * 5)) * 100
                    ).toFixed(1)
                  : 100}
                %
              </p>
              <p className="text-sm text-text-secondary">
                Tasa de Asistencia Estimada
              </p>
              <p className="text-xs text-text-secondary mt-2">
                {incidentsByType.faltas} faltas • {incidentsByType.retardos}{" "}
                retardos
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
