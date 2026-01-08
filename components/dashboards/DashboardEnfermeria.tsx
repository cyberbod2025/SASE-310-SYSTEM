import React from "react";
import toast from "react-hot-toast";
import { useApp } from "../../store";
import { IncidentType, AppModule } from "../../types";

export const DashboardEnfermeria = () => {
  const { students, setQuickRegisterOpen, setCurrentModule } = useApp();
  const todayStr = new Date().toISOString().split("T")[0];

  // Logic
  const healthIncidents = students
    .flatMap((s) =>
      s.incidents.map((i) => ({
        ...i,
        studentId: s.id,
        studentName: s.name,
        group: s.group,
      }))
    )
    .filter((i) => i.type === IncidentType.SALUD);

  // In a real app we might have a specific Visits table, but for now we use 'incidents' of type SALUD
  const visitsToday = healthIncidents.filter((i) =>
    i.date.startsWith(todayStr)
  ).length;
  // Mock 'Medicamentos Pendientes'
  const pendingMeds = 5;

  const activeAlertsCount = students.filter(
    (s) => s.medicalAlerts && s.medicalAlerts.length > 0
  ).length;

  const recentVisits = [...healthIncidents]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-10 text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome & Date */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-center gap-6">
            <img
              src="/assets/branding/ENFERMERIA.png"
              alt="Enfermeria Logo"
              className="size-24 object-contain drop-shadow-2xl animate-float"
              style={{
                clipPath: "circle(48%)",
                filter:
                  "brightness(1.1) contrast(1.2) drop-shadow(0 0 15px rgba(239, 68, 68, 0.4))",
              }}
            />
            <div>
              <h2
                className="text-3xl md:text-5xl font-black text-white tracking-tight"
                style={{ textShadow: "0 0 20px rgba(239,68,68,0.6)" }}
              >
                Enfermería
              </h2>
              <p className="text-red-200 text-lg mt-1 font-medium">
                Gestión de Salud y Primeros Auxilios
              </p>
            </div>
          </div>
          <div className="text-right hidden md:block bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 shadow-lg">
            <p className="text-2xl font-bold text-white capitalize">
              {new Date().toLocaleDateString("es-MX", {
                weekday: "long",
                day: "numeric",
                month: "short",
              })}
            </p>
            <p className="text-sm text-gray-400">Ciclo Escolar 2024-2025</p>
          </div>
        </div>

        {/* Urgent Alerts Ticker */}
        <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-4 flex items-start sm:items-center gap-4 shadow-[0_0_20px_-5px_rgba(239,68,68,0.3)] backdrop-blur-md">
          <div className="bg-alert-red/10 p-2 rounded-full shrink-0">
            <span className="material-symbols-outlined text-alert-red">
              campaign
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-red-400 font-bold text-sm uppercase tracking-wider mb-1">
              Alertas Activas
            </h3>
            <p className="text-white text-sm font-medium">
              <span className="font-bold">Urgente:</span> {activeAlertsCount}{" "}
              estudiantes con alertas médicas registradas.
              <span className="mx-2 text-gray-300">|</span>
              <span className="font-bold">Stock:</span> Paracetamol suspensión
              pediátrica en nivel crítico (2 unidades).
            </p>
          </div>
          <button
            onClick={() => setCurrentModule(AppModule.REPORTES)}
            className="text-sm font-semibold text-alert-red hover:underline shrink-0"
          >
            Ver Detalles
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Stat Card 1 */}
          <div className="bg-black/20 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg flex flex-col justify-between h-36 group hover:bg-white/5 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 font-bold text-sm uppercase tracking-wider">
                  Visitas de Hoy
                </p>
                <h3 className="text-3xl font-black text-white mt-2 group-hover:scale-105 transition-transform">
                  {visitsToday}
                </h3>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                <span className="material-symbols-outlined text-primary">
                  clinical_notes
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-success-green font-medium">
              <span className="material-symbols-outlined text-sm">
                trending_up
              </span>
              <span>+2 vs ayer</span>
            </div>
          </div>
          {/* Stat Card 2 */}
          <div className="bg-black/20 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg flex flex-col justify-between h-36 group hover:bg-white/5 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 font-bold text-sm uppercase tracking-wider">
                  Medicamentos Pendientes
                </p>
                <h3 className="text-3xl font-black text-white mt-2 group-hover:scale-105 transition-transform">
                  {pendingMeds}
                </h3>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg">
                <span className="material-symbols-outlined text-alert-yellow">
                  medication
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-400">Próxima dosis: 10:45 AM</div>
          </div>
          {/* Stat Card 3 */}
          <div className="bg-black/20 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg flex flex-col justify-between h-36 group hover:bg-white/5 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 font-bold text-sm uppercase tracking-wider">
                  Alertas Médicas
                </p>
                <h3 className="text-3xl font-black text-white mt-2 group-hover:scale-105 transition-transform">
                  {activeAlertsCount}
                </h3>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                <span className="material-symbols-outlined text-alert-red">
                  warning
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-400">
              Requieren seguimiento inmediato
            </div>
          </div>
          {/* Stat Card 4 */}
          <div
            onClick={() => setQuickRegisterOpen(true)}
            className="bg-black/20 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg flex flex-col justify-between h-36 relative overflow-hidden group cursor-pointer hover:border-blue-500/50 transition-all"
          >
            <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
            <div className="relative z-10 flex flex-col items-center justify-center h-full gap-2 text-primary">
              <span className="material-symbols-outlined text-4xl">
                add_circle
              </span>
              <span className="font-bold">Nueva Consulta</span>
            </div>
          </div>
        </div>

        {/* Main Section: Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Activity Table */}
          <div className="xl:col-span-2 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-bold text-lg text-white">
                Registro de Atención Reciente
              </h3>
              <button
                onClick={() => setCurrentModule(AppModule.REPORTES)}
                className="text-sm font-medium text-primary hover:text-primary-hover flex items-center gap-1"
              >
                Ver todo{" "}
                <span className="material-symbols-outlined text-lg">
                  arrow_forward
                </span>
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
                    <th className="px-6 py-4">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color dark:divide-gray-700">
                  {recentVisits.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-gray-500">
                        No hay visitas registradas hoy.
                      </td>
                    </tr>
                  ) : (
                    recentVisits.map((visit) => (
                      <tr
                        key={visit.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4 text-gray-400">
                          {new Date(visit.date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-4 font-medium text-white">
                          {visit.studentName}
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {visit.group}
                        </td>
                        <td className="px-6 py-4 text-white capitalize">
                          {visit.type}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-300 border border-green-500/20">
                            Atendido
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() =>
                              toast(
                                `Detalles de visita: ${visit.studentName}\nDiagnóstico: ${visit.description}\nTratamiento: Reposo`,
                                { icon: "🩺", duration: 4000 }
                              )
                            }
                            className="text-gray-400 hover:text-white"
                          >
                            <span className="material-symbols-outlined">
                              visibility
                            </span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Quick Actions & Inventory */}
          <div className="flex flex-col gap-6">
            {/* Quick Search Card */}
            <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden border border-white/10">
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2">Búsqueda Rápida</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Accede al expediente médico del alumno.
                </p>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1 flex items-center border border-white/30">
                  <input
                    className="bg-transparent border-none text-white placeholder-blue-100 w-full focus:ring-0 text-sm px-3"
                    placeholder="Matrícula o Nombre"
                    type="text"
                  />
                  <button className="bg-white text-primary p-2 rounded-md hover:bg-blue-50 transition-colors">
                    <span className="material-symbols-outlined text-lg">
                      search
                    </span>
                  </button>
                </div>
              </div>
              <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-9xl text-white/10 pointer-events-none">
                id_card
              </span>
            </div>

            {/* Inventory Widget */}
            <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg p-6 flex-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white">Inventario Crítico</h3>
                <button
                  onClick={() =>
                    toast(
                      "Módulo de Gestión de Inventario en desarrollo. (Funcionalidad pendiente)",
                      { icon: "🚧" }
                    )
                  }
                  className="text-xs text-primary font-medium hover:underline"
                >
                  Gestionar
                </button>
              </div>
              <div className="space-y-4">
                {/* Item 1 */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-white">
                      Paracetamol 500mg
                    </span>
                    <span className="text-xs font-bold text-alert-red">
                      2 unid.
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-alert-red h-2 rounded-full"
                      style={{ width: "10%" }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Reabastecer urgente
                  </p>
                </div>
                {/* Item 2 */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-white">
                      Vendas elásticas #5
                    </span>
                    <span className="text-xs font-bold text-alert-yellow">
                      5 unid.
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-alert-yellow h-2 rounded-full"
                      style={{ width: "25%" }}
                    ></div>
                  </div>
                </div>
                {/* Item 3 */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-white">
                      Alcohol Antiséptico
                    </span>
                    <span className="text-xs font-bold text-success-green">
                      Ok
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-success-green h-2 rounded-full"
                      style={{ width: "75%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
