import React, { useState } from "react";
import toast from "react-hot-toast";
import { useApp } from "../../store";
import { IncidentType, AppModule } from "../../types";
import { printContent } from "../PrintButtons";

export const DashboardPrefectura = () => {
  const { students, addIncident, logAudit, setCurrentModule } = useApp();
  const [quickMatricula, setQuickMatricula] = useState("");
  const [quickType, setQuickType] = useState<string>("Retardo (Entrada)");

  // Helper date
  const todayStr = new Date().toISOString().split("T")[0];
  const todayDisplay = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // KPIs Logic
  const allIncidents = students.flatMap((s) =>
    s.incidents.map((i) => ({
      ...i,
      studentName: s.name,
      group: s.group,
      studentAvatar: s.avatar,
    }))
  );
  const dailyIncidents = allIncidents.filter((i) =>
    i.date.startsWith(todayStr)
  );

  const attendanceRate = 94; // Mock for now
  const retardosToday = dailyIncidents.filter(
    (i) => i.type === IncidentType.RETARDO
  ).length;
  const uniformesToday = dailyIncidents.filter(
    (i) => i.type === IncidentType.UNIFORME
  ).length;

  // Justified: mock count based on active justificantes
  const justifiedToday = students
    .flatMap((s) => s.justificantes)
    .filter((j) => j.startDate <= todayStr && j.endDate >= todayStr).length;

  const recentActivity = [...allIncidents]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const handleRegister = async () => {
    const student = students.find((s) => s.matricula === quickMatricula);
    if (!student) {
      toast.error("Error: Matrícula no encontrada.");
      return;
    }

    let typeEnum = IncidentType.CONDUCTA;
    if (quickType.includes("Retardo")) typeEnum = IncidentType.RETARDO;
    if (quickType.includes("Uniforme")) typeEnum = IncidentType.UNIFORME;
    if (quickType.includes("Celular")) typeEnum = IncidentType.CONDUCTA;

    // Registrar la incidencia
    addIncident(student.id, typeEnum, quickType);

    // Registrar en bitácora de auditoría
    await logAudit(
      "CREACION",
      `Incidencia registrada: ${quickType}`,
      "incidencias",
      student.id,
      student.name,
      null,
      { tipo: typeEnum, descripcion: quickType }
    );

    toast.success(`Incidencia registrada exitosamente a: ${student.name}`);
    setQuickMatricula("");
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8"
        id="pref-header"
      >
        <div className="flex items-center gap-6">
          <img
            src="/branding/prefectura.png"
            alt="Prefectura Logo"
            className="w-24 h-24 object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
          />
          <div className="flex flex-col gap-1">
            <h1
              className="text-white text-3xl md:text-5xl font-black tracking-tight"
              style={{ textShadow: "0 0 20px rgba(59,130,246,0.6)" }}
            >
              Prefectura
            </h1>
            <p className="text-blue-200 text-lg font-medium tracking-wide">
              Control Disciplinario y Asistencia
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 shadow-lg">
          <span className="material-symbols-outlined text-blue-400">
            calendar_today
          </span>
          <span className="text-lg font-bold text-white capitalize">
            {todayDisplay}
          </span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        id="pref-kpi-grid"
      >
        {/* Card 1 */}
        <div className="flex flex-col gap-2 rounded-2xl p-5 bg-black/20 backdrop-blur-xl border border-white/10 shadow-lg hover:bg-white/5 transition-all group">
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">
              Asistencia Total
            </p>
            <span className="material-symbols-outlined text-primary text-2xl">
              groups
            </span>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-text-main dark:text-white text-3xl font-bold leading-none">
              {attendanceRate}%
            </p>
            <p className="text-success-green text-sm font-medium mb-1 flex items-center">
              <span className="material-symbols-outlined text-base">
                trending_up
              </span>{" "}
              1.2%
            </p>
          </div>
        </div>
        {/* Card 2 */}
        <div className="flex flex-col gap-2 rounded-2xl p-5 bg-black/20 backdrop-blur-xl border border-white/10 shadow-lg hover:bg-white/5 transition-all group">
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">
              Retardos Hoy
            </p>
            <span className="material-symbols-outlined text-alert-yellow text-2xl">
              schedule
            </span>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-text-main dark:text-white text-3xl font-bold leading-none">
              {retardosToday}
            </p>
            <p className="text-alert-yellow text-sm font-medium mb-1 flex items-center">
              <span className="material-symbols-outlined text-base">
                arrow_upward
              </span>{" "}
              +2
            </p>
          </div>
        </div>
        {/* Card 3 */}
        <div className="flex flex-col gap-2 rounded-2xl p-5 bg-black/20 backdrop-blur-xl border border-white/10 shadow-lg hover:bg-white/5 transition-all group">
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">
              Faltas Justificadas
            </p>
            <span className="material-symbols-outlined text-blue-400 text-2xl">
              assignment_turned_in
            </span>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-text-main dark:text-white text-3xl font-bold leading-none">
              {justifiedToday}
            </p>
            <p className="text-success-green text-sm font-medium mb-1">
              Normal
            </p>
          </div>
        </div>
        {/* Card 4 */}
        <div className="flex flex-col gap-2 rounded-2xl p-5 bg-black/20 backdrop-blur-xl border border-white/10 shadow-lg hover:bg-white/5 transition-all group">
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">
              Incidencias Uniforme
            </p>
            <span className="material-symbols-outlined text-alert-red text-2xl">
              checkroom
            </span>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-text-main dark:text-white text-3xl font-bold leading-none">
              {uniformesToday}
            </p>
            <p className="text-gray-400 text-sm font-medium mb-1">
              Igual a ayer
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Quick Register Widget */}
          <div
            className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg p-8"
            id="pref-quick-register"
          >
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
              <div className="bg-primary/10 p-2 rounded-lg">
                <span className="material-symbols-outlined text-primary">
                  bolt
                </span>
              </div>
              <h2 className="text-white text-xl font-bold">Registro Rápido</h2>
            </div>
            <div className="flex flex-col md:flex-row items-end gap-4">
              <label className="flex flex-col flex-1 w-full">
                <p className="text-gray-300 text-sm font-medium pb-2">
                  Matrícula del Alumno
                </p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-xl">
                    badge
                  </span>
                  <input
                    value={quickMatricula}
                    onChange={(e) => setQuickMatricula(e.target.value)}
                    className="w-full rounded-lg border border-white/20 bg-black/40 text-white h-12 pl-11 pr-4 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-gray-600"
                    placeholder="Ej. 2023-4492"
                  />
                </div>
              </label>
              <label className="flex flex-col flex-1 w-full">
                <p className="text-gray-300 text-sm font-medium pb-2">
                  Tipo de Incidencia
                </p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-xl">
                    category
                  </span>
                  <select
                    value={quickType}
                    onChange={(e) => setQuickType(e.target.value)}
                    className="w-full rounded-lg border border-white/20 bg-black/40 text-white h-12 pl-11 pr-4 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none"
                  >
                    <option>Retardo (Entrada)</option>
                    <option>Falta de Uniforme Completo</option>
                    <option>Sin Credencial</option>
                    <option>Uso de Celular</option>
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-xl pointer-events-none">
                    expand_more
                  </span>
                </div>
              </label>
              <button
                onClick={handleRegister}
                className="w-full md:w-auto h-12 px-8 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
              >
                <span className="material-symbols-outlined text-xl">save</span>
                Registrar
              </button>
            </div>
          </div>

          {/* Recent Activity Table */}
          <div
            className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg overflow-hidden flex flex-col"
            id="pref-recent-activity"
          >
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="text-white text-lg font-bold">
                Actividad Reciente
              </h3>
              <button
                onClick={() => setCurrentModule(AppModule.REPORTES)}
                className="text-primary text-sm font-medium hover:underline"
              >
                Ver todo
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider font-semibold">
                    <th className="px-6 py-4">Hora</th>
                    <th className="px-6 py-4">Alumno</th>
                    <th className="px-6 py-4">Grupo</th>
                    <th className="px-6 py-4">Incidencia</th>
                    <th className="px-6 py-4">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color dark:divide-gray-700">
                  {recentActivity.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-500">
                        No hay actividad reciente.
                      </td>
                    </tr>
                  ) : (
                    recentActivity.map((inc) => (
                      <tr
                        key={inc.id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                          {new Date(inc.date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-blue-100 flex items-center justify-center text-primary text-xs font-bold">
                              {inc.studentName.substring(0, 2)}
                            </div>
                            <span className="text-gray-200 font-medium text-sm">
                              {inc.studentName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {inc.group}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {inc.type}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/30 text-yellow-200 border border-yellow-700/30">
                            Registrado
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (Alerts & Charts) */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          {/* Daily Alerts */}
          <div
            className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg p-6"
            id="pref-daily-alerts"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-lg font-bold">Alertas del Día</h3>
              <span className="bg-alert-red/10 text-alert-red text-xs font-bold px-2 py-1 rounded-full">
                Automático
              </span>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex gap-3 items-start p-3 bg-red-900/10 rounded-lg border border-red-500/20">
                <span className="material-symbols-outlined text-alert-red mt-0.5">
                  warning
                </span>
                <div>
                  <p className="text-sm font-bold text-gray-200">
                    Retardos Acumulados
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Se detectaron 3 alumnos con {">"}3 retardos.
                  </p>
                </div>
              </div>
              {/* Static alert for now as example */}
              <div className="flex gap-3 items-start p-3 bg-blue-900/10 rounded-lg border border-blue-500/20">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 mt-0.5">
                  notifications
                </span>
                <div>
                  <p className="text-sm font-bold text-gray-200">
                    Revisión de Uniforme
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Programada para 3º Grado a las 11:00 AM.
                  </p>
                </div>
              </div>
            </div>
            {/* Reporte Diario Button */}
            <button
              onClick={() =>
                printContent(
                  "Reporte Diario Prefectura",
                  `
                <h1>Reporte Diario - Prefectura</h1>
                <p>Fecha: ${todayDisplay}</p>
                <ul>
                  <li>Asistencia: ${attendanceRate}%</li>
                  <li>Retardos: ${retardosToday}</li>
                  <li>Faltas Justificadas: ${justifiedToday}</li>
                  <li>Uniforme: ${uniformesToday}</li>
                </ul>
              `
                )
              }
              className="mt-4 w-full py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-bold text-gray-200 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">print</span>
              Imprimir Parte Diario
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
