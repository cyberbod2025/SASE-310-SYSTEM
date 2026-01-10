import React, { useState } from "react";
import { useApp } from "../../store";
import { AppModule } from "../../types";
import { StudentCard } from "../StudentCard";

export const DashboardDocente = () => {
  const [activeTab, setActiveTab] = useState<
    "PANEL" | "ASISTENCIA" | "CALIFICACIONES"
  >("PANEL");
  const {
    students,
    isTutorMode,
    toggleTutorMode,
    logAccess,
    setCurrentModule,
  } = useApp();

  // Quick Action Handler
  const handleQuickAction = (action: string) => {
    if (action === "incidencia") {
      useApp().setQuickRegisterOpen(true);
    } else if (action === "lista" || action === "imprimir") {
      setCurrentModule(AppModule.REPORTES);
    } else if (action === "planeacion" || action === "calendario") {
      setCurrentModule(AppModule.AGENDA);
    }
  };

  // Logic for Semáforo
  const riskCount = students.filter((s) => s.incidents.length >= 3).length;
  const warningCount = students.filter(
    (s) => s.incidents.length > 0 && s.incidents.length < 3
  ).length;

  // Alerts
  const alerts = students.filter(
    (s) =>
      s.incidents.length > 0 || (s.medicalAlerts && s.medicalAlerts.length > 0)
  );

  const handleToggleTutor = () => {
    toggleTutorMode();
    if (!isTutorMode) logAccess("Activar Vista Tutor", "GLOBAL");
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Heading & Group Context */}
      <div
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8"
        id="docente-dashboard-title"
      >
        <div className="flex items-center gap-6">
          <img
            src="/assets/branding/DOCENTES.png"
            alt="Docentes Logo"
            className="w-24 h-24 object-contain drop-shadow-2xl animate-float"
            style={{
              filter: "drop-shadow(0 0 15px rgba(20, 184, 166, 0.6))",
            }}
          />
          <div className="flex flex-col gap-1">
            <h1
              className="text-white text-3xl md:text-5xl font-black tracking-tight"
              style={{ textShadow: "0 0 20px rgba(20,184,166,0.6)" }}
            >
              Bienvenido, Docente
            </h1>
            <p className="text-teal-200 text-lg font-medium tracking-wide flex items-center gap-2">
              Vista actual:
              <span className="font-bold bg-teal-900/40 border border-teal-500/30 px-3 py-0.5 rounded-full text-sm text-teal-100">
                3º B - Turno Vespertino
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleTutor}
            className={`flex items-center justify-center h-12 px-6 border rounded-xl text-base font-bold transition-all shadow-lg ${
              isTutorMode
                ? "bg-teal-600 text-white border-teal-500 shadow-teal-900/20 hover:bg-teal-500"
                : "bg-black/40 backdrop-blur-md border-white/20 text-gray-300 hover:bg-white/10"
            }`}
          >
            {isTutorMode ? "Vista Tutor Activa" : "Vista Docente"}
          </button>
          <button
            onClick={() => handleQuickAction("incidencia")}
            className="flex items-center justify-center gap-2 h-12 px-6 bg-blue-600 hover:bg-blue-500 rounded-xl text-base font-bold text-white shadow-lg shadow-blue-900/20 transition-all border border-white/10"
          >
            <span className="material-symbols-outlined text-[24px]">add</span>
            <span>Nueva Incidencia</span>
          </button>
        </div>
      </div>

      {/* System Notice */}
      <div className="bg-teal-900/20 border border-teal-500/30 rounded-2xl shadow-[0_0_20px_-5px_rgba(20,184,166,0.3)] backdrop-blur-md p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex gap-4">
          <div className="size-12 rounded-full bg-teal-500/10 flex-shrink-0 flex items-center justify-center text-teal-400 hidden sm:flex border border-teal-500/20">
            <span className="material-symbols-outlined text-2xl">campaign</span>
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">
              Aviso Institucional
            </h3>
            <p className="text-teal-200 mt-1 max-w-2xl font-medium">
              El periodo de captura de calificaciones del 2º Parcial cierra este
              viernes.
            </p>
          </div>
        </div>
        <button
          onClick={() => handleQuickAction("calendario")}
          className="flex-shrink-0 px-4 py-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 font-bold rounded-lg transition-colors border border-teal-500/20"
        >
          Ver Calendario
        </button>
      </div>

      {/* Navigation Tabs */}
      <div
        className="flex gap-4 mb-6 border-b border-white/10 overflow-x-auto"
        id="docente-tabs"
      >
        {["PANEL", "ASISTENCIA", "CALIFICACIONES"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-3 px-4 text-sm font-bold transition-all relative whitespace-nowrap ${
              activeTab === tab
                ? "text-teal-400"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {tab === "PANEL"
              ? "Tablero Principal"
              : tab === "ASISTENCIA"
              ? "Pase de Lista"
              : "Captura de Notas"}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-400 shadow-[0_0_10px_#2dd4bf]"></div>
            )}
          </button>
        ))}
      </div>

      {activeTab === "PANEL" && (
        <div className="animate-fade-in-up">
          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Left Column (Status & Quick Actions) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Semáforo del Grupo */}
              <div
                className="bg-black/20 backdrop-blur-xl rounded-2xl shadow-lg border border-white/10 overflow-hidden"
                id="risk-semaphore"
              >
                <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                  <h2 className="font-bold text-lg text-white">
                    Semáforo del Grupo
                  </h2>
                  <span className="text-xs font-bold text-gray-300 bg-white/10 px-3 py-1 rounded-full border border-white/5">
                    Actualizado: Hoy
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    {/* Visual Indicator */}
                    <div className="flex-shrink-0 flex flex-col items-center gap-3">
                      <div className="relative size-32 flex items-center justify-center">
                        {/* Rings simulation */}
                        <div className="absolute inset-0 rounded-full border-[6px] border-alert-yellow opacity-20"></div>
                        <div className="absolute inset-0 rounded-full border-[6px] border-alert-yellow border-t-transparent border-r-transparent -rotate-45"></div>
                        <div className="flex flex-col items-center">
                          <span className="material-symbols-outlined text-4xl text-alert-yellow">
                            warning
                          </span>
                          <span className="text-xs font-bold text-alert-yellow mt-1 uppercase tracking-wide">
                            Atención
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Status Breakdown */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                      <div className="bg-red-900/10 border border-red-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="size-2 rounded-full bg-red-500 animate-pulse"></span>
                          <span className="text-xs font-bold text-red-300 uppercase">
                            Riesgo Alto
                          </span>
                        </div>
                        <p className="text-3xl font-black text-white">
                          {riskCount}
                        </p>
                        <p className="text-xs text-red-200/70">
                          Alumnos con historial crítico
                        </p>
                      </div>
                      <div className="bg-yellow-900/10 border border-yellow-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="size-2 rounded-full bg-yellow-500"></span>
                          <span className="text-xs font-bold text-yellow-300 uppercase">
                            Seguimiento
                          </span>
                        </div>
                        <p className="text-3xl font-black text-white">
                          {warningCount}
                        </p>
                        <p className="text-xs text-yellow-200/70">
                          Alumnos con reporte conductual
                        </p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-lg p-3 sm:col-span-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="size-2 rounded-full bg-success-green"></span>
                              <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">
                                Asistencia Promedio
                              </span>
                            </div>
                            <p className="text-2xl font-bold text-gray-800 dark:text-white">
                              92%
                            </p>
                          </div>
                          <div className="h-10 w-24 bg-gray-100 dark:bg-gray-700 rounded flex items-end justify-between px-1 pb-1 gap-0.5">
                            <div className="w-1/5 bg-success-green h-[60%] rounded-sm"></div>
                            <div className="w-1/5 bg-success-green h-[80%] rounded-sm"></div>
                            <div className="w-1/5 bg-success-green h-[50%] rounded-sm"></div>
                            <div className="w-1/5 bg-success-green h-[90%] rounded-sm"></div>
                            <div className="w-1/5 bg-success-green h-[75%] rounded-sm"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
                id="quick-actions"
              >
                <button
                  onClick={() => handleQuickAction("incidencia")}
                  className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-gray-800 p-6 rounded-xl border border-border-color dark:border-gray-700 shadow-sm hover:shadow-md hover:border-primary/50 transition-all group"
                >
                  <div className="size-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-2xl">
                      edit_note
                    </span>
                  </div>
                  <span className="font-medium text-sm text-center text-text-main dark:text-white">
                    Registrar
                    <br />
                    Incidencia
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("ASISTENCIA")}
                  className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-gray-800 p-6 rounded-xl border border-border-color dark:border-gray-700 shadow-sm hover:shadow-md hover:border-primary/50 transition-all group"
                >
                  <div className="size-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-2xl">
                      Fact_Check
                    </span>
                  </div>
                  <span className="font-medium text-sm text-center text-text-main dark:text-white">
                    Pase de
                    <br />
                    Asistencia
                  </span>
                </button>
                <button
                  onClick={() => handleQuickAction("imprimir")}
                  className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-gray-800 p-6 rounded-xl border border-border-color dark:border-gray-700 shadow-sm hover:shadow-md hover:border-primary/50 transition-all group"
                >
                  <div className="size-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-2xl">
                      print
                    </span>
                  </div>
                  <span className="font-medium text-sm text-center text-text-main dark:text-white">
                    Imprimir
                    <br />
                    Documentos
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("CALIFICACIONES")}
                  className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-gray-800 p-6 rounded-xl border border-border-color dark:border-gray-700 shadow-sm hover:shadow-md hover:border-primary/50 transition-all group"
                >
                  <div className="size-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-2xl">
                      qr_code_2
                    </span>
                  </div>
                  <span className="font-medium text-sm text-center text-text-main dark:text-white">
                    Capturar
                    <br />
                    Notas
                  </span>
                </button>
              </div>
            </div>

            {/* Right Column (Alerts & Context) */}
            <div className="space-y-6">
              {/* Active Alerts Panel */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-border-color dark:border-gray-700 overflow-hidden">
                <div className="px-5 py-4 border-b border-border-color dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex justify-between items-center">
                  <h3 className="font-bold text-base text-alert-red flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">
                      notifications_active
                    </span>
                    Alertas Activas
                  </h3>
                  <span className="bg-alert-red/10 text-alert-red text-xs font-bold px-2 py-0.5 rounded-full">
                    {alerts.length}
                  </span>
                </div>
                <div className="divide-y divide-border-color dark:divide-gray-700 max-h-[400px] overflow-y-auto">
                  {alerts.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      Sin alertas activas.
                    </div>
                  ) : (
                    alerts.slice(0, 5).map((s) => (
                      <div
                        key={s.id}
                        className="p-4 hover:bg-background-light dark:hover:bg-gray-700/30 transition-colors group cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-bold text-alert-red uppercase tracking-wide">
                            {s.incidents[0]?.type || "Alerta"}
                          </span>
                          <span className="text-[10px] text-text-secondary dark:text-gray-400">
                            Hoy
                          </span>
                        </div>
                        <p className="font-semibold text-sm text-text-main dark:text-gray-200">
                          {s.name}
                        </p>
                        <p className="text-xs text-text-secondary dark:text-gray-400 mt-1 line-clamp-2">
                          {s.incidents[0]?.description ||
                            s.medicalAlerts?.[0] ||
                            "Atención requerida"}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <h3 className="font-bold text-lg mb-4 text-text-main dark:text-white">
            Lista de Alumnos (Vista Rápida)
          </h3>
          {isTutorMode && (
            <div className="bg-blue-50 border border-blue-200 p-3 rounded mb-4 text-sm text-blue-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">
                visibility
              </span>
              Usted está visualizando información de contacto. Este acceso queda
              registrado.
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((s) => (
              <StudentCard key={s.id} student={s} />
            ))}
          </div>
        </div>
      )}

      {activeTab === "ASISTENCIA" && (
        <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-6 animate-fade-in-up">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-teal-400">
                fact_check
              </span>
              Pase de Lista - {new Date().toLocaleDateString()}
            </h2>
            <button className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold text-sm shadow-lg shadow-teal-900/20">
              Guardar Asistencia
            </button>
          </div>
          {/* Attendance Table Mockup */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-white">
              <thead className="bg-white/5 uppercase text-xs text-gray-400">
                <tr>
                  <th className="p-3">Matrícula</th>
                  <th className="p-3">Alumno</th>
                  <th className="p-3 text-center">Asistencia</th>
                  <th className="p-3 text-center">Retardo</th>
                  <th className="p-3 text-center">Falta</th>
                  <th className="p-3 text-center">Justificado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-mono text-gray-400">
                      {s.matricula}
                    </td>
                    <td className="p-3 font-bold">{s.name}</td>
                    <td className="p-3 text-center">
                      <input
                        type="radio"
                        name={`att-${s.id}`}
                        defaultChecked
                        className="accent-teal-500 scale-125"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <input
                        type="radio"
                        name={`att-${s.id}`}
                        className="accent-yellow-500 scale-125"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <input
                        type="radio"
                        name={`att-${s.id}`}
                        className="accent-red-500 scale-125"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <input
                        type="radio"
                        name={`att-${s.id}`}
                        className="accent-blue-500 scale-125"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "CALIFICACIONES" && (
        <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-6 animate-fade-in-up">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-400">
                calculate
              </span>
              Registro de Evidencias - 2º Parcial
            </h2>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-sm shadow-lg shadow-purple-900/20">
              Publicar Notas
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-white">
              <thead className="bg-white/5 uppercase text-xs text-gray-400">
                <tr>
                  <th className="p-3">Alumno</th>
                  <th className="p-3 text-center w-24">Examen (40%)</th>
                  <th className="p-3 text-center w-24">Proyecto (30%)</th>
                  <th className="p-3 text-center w-24">Tareas (30%)</th>
                  <th className="p-3 text-center w-24 font-bold text-white">
                    Promedio
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-bold">{s.name}</td>
                    <td className="p-3">
                      <input
                        type="number"
                        className="w-full bg-black/30 border border-white/10 rounded p-1 text-center focus:border-purple-500 outline-none"
                        placeholder="0-10"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        className="w-full bg-black/30 border border-white/10 rounded p-1 text-center focus:border-purple-500 outline-none"
                        placeholder="0-10"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        className="w-full bg-black/30 border border-white/10 rounded p-1 text-center focus:border-purple-500 outline-none"
                        placeholder="0-10"
                      />
                    </td>
                    <td className="p-3 text-center font-bold text-lg text-purple-400">
                      -
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
