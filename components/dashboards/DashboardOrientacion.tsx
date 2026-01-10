import React from "react";
import toast from "react-hot-toast";
import { useApp } from "../../store";
import { CaseState, AppModule } from "../../types";
import { printContent } from "../PrintButtons";

export const DashboardOrientacion = () => {
  const { students, setQuickRegisterOpen, setCurrentModule } = useApp();

  // Logic
  const studentsInTrouble = students.filter(
    (s) =>
      s.caseState !== CaseState.CERRADO && s.caseState !== CaseState.OBSERVADO
  );

  const patternAlerts = students.filter(
    (s) => s.caseState === CaseState.PATRON_DETECTADO
  );

  // Mock next appointment
  const nextAppointment = {
    family: "Familia Hernández",
    student: "Carlos H. (2°B)",
    time: "Hoy, 10:00 AM",
  };

  // Print weekly report
  const handlePrintReport = () => {
    const reportData = `
      <h1>Reporte Semanal - Orientación</h1>
      <p><strong>Fecha:</strong> ${new Date().toLocaleDateString("es-MX")}</p>
      <h2>Resumen</h2>
      <ul>
        <li><strong>Casos activos:</strong> ${studentsInTrouble.length}</li>
        <li><strong>Patrones detectados:</strong> ${patternAlerts.length}</li>
        <li><strong>Total estudiantes:</strong> ${students.length}</li>
      </ul>
      <h2>Alertas de Patrón</h2>
      <table style="width:100%; border-collapse: collapse;">
        <thead>
          <tr style="background:#f0f0f0;">
            <th style="border:1px solid #ddd; padding:8px;">Alumno</th>
            <th style="border:1px solid #ddd; padding:8px;">Grupo</th>
            <th style="border:1px solid #ddd; padding:8px;">Incidencias</th>
          </tr>
        </thead>
        <tbody>
          ${patternAlerts
            .map(
              (s) => `
            <tr>
              <td style="border:1px solid #ddd; padding:8px;">${s.name}</td>
              <td style="border:1px solid #ddd; padding:8px;">${s.group}</td>
              <td style="border:1px solid #ddd; padding:8px;">${s.incidents.length}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
    printContent("Reporte Semanal - Orientación", reportData);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 scroll-smooth text-white">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-8">
        {/* Page Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="relative group p-2">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-yellow-400/50 animate-spin-pause pointer-events-none"></div>
              <div className="absolute inset-0 rounded-full border border-white/10 pointer-events-none"></div>
              <div className="relative rounded-full overflow-hidden">
                <img
                  src="/assets/branding/ORIENTACION.png"
                  alt="Orientación Logo"
                  className="w-24 h-24 object-contain drop-shadow-2xl z-10 relative animate-float"
                  style={{
                    filter: "drop-shadow(0 0 15px rgba(234, 179, 8, 0.6))",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent -translate-x-full animate-shine-sweep pointer-events-none z-20"></div>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <h1
                className="text-white text-3xl md:text-5xl font-black tracking-tight"
                style={{ textShadow: "0 0 20px rgba(234,179,8,0.6)" }}
              >
                Orientación
              </h1>
              <p className="text-yellow-200 text-lg font-medium tracking-wide">
                Bienestar Estudiantil y Psicoeducación
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePrintReport}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white hover:bg-white/10 text-sm font-bold rounded-xl transition-all shadow-lg"
            >
              <span className="material-symbols-outlined text-[20px]">
                print
              </span>
              Reporte Semanal
            </button>
            <button
              onClick={() => setCurrentModule(AppModule.REPORTES_DOCENTES)}
              className="flex items-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-yellow-900/20 border border-white/10"
            >
              <span className="material-symbols-outlined text-[20px]">
                psychology
              </span>
              Solicitar Reporte
            </button>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column (Main Data) */}
          <div className="xl:col-span-2 flex flex-col gap-8">
            {/* Alerts Section */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-500">
                    warning
                  </span>
                  Alertas de Patrón (Detectadas)
                </h3>
                <button
                  onClick={() => setCurrentModule(AppModule.REPORTES)}
                  className="text-sm font-semibold text-yellow-400 hover:text-yellow-300"
                >
                  Ver todas
                </button>
              </div>
              <div className="bg-black/20 backdrop-blur-xl rounded-xl shadow-sm border border-white/10 overflow-hidden">
                {patternAlerts.length === 0 ? (
                  <div className="p-6 text-center text-gray-400">
                    No hay patrones críticos detectados hoy.
                  </div>
                ) : (
                  patternAlerts.map((s) => (
                    <div
                      key={s.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border-b border-white/10 hover:bg-white/5 transition-colors group"
                    >
                      <div className="size-12 rounded-full bg-red-900/30 text-red-400 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined">
                          person_alert
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-base font-bold text-white truncate">
                            {s.name}
                          </h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-gray-300 uppercase tracking-wide">
                            {s.group}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-1">
                          ALERTA CRÍTICA: Patrón de conducta recurrente
                          detectado.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() =>
                            toast.loading(`Abriendo expediente de: ${s.name}`, {
                              duration: 2000,
                            })
                          }
                          className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-xs font-bold text-gray-200 shadow-sm hover:bg-white/20"
                        >
                          Expediente
                        </button>
                        <button
                          onClick={() =>
                            toast.success(
                              `Notificación enviada al tutor de: ${s.name}`,
                              { icon: "📨" }
                            )
                          }
                          className="px-3 py-1.5 rounded-lg bg-red-900/20 border border-red-500/30 text-xs font-bold text-red-400 shadow-sm hover:bg-red-900/30"
                        >
                          Contactar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Charts Section (Mocked for now) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black/20 backdrop-blur-xl p-6 rounded-xl shadow-sm border border-white/10 flex flex-col h-80">
                <h3 className="text-base font-bold text-white mb-6">
                  Incidencias por Grado
                </h3>
                <div className="flex-1 flex items-end justify-between gap-4 px-2">
                  <div className="w-full bg-blue-500/20 rounded-t h-[40%] relative group">
                    <div className="absolute bottom-0 w-full bg-blue-500 h-full rounded-t opacity-60"></div>
                  </div>
                  <div className="w-full bg-blue-500/20 rounded-t h-[70%] relative group">
                    <div className="absolute bottom-0 w-full bg-blue-500 h-full rounded-t opacity-60"></div>
                  </div>
                  <div className="w-full bg-blue-500/20 rounded-t h-[50%] relative group">
                    <div className="absolute bottom-0 w-full bg-blue-500 h-full rounded-t opacity-60"></div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-2 px-2">
                  <span>1°</span>
                  <span>2°</span>
                  <span>3°</span>
                </div>
              </div>
              <div className="bg-black/20 backdrop-blur-xl p-6 rounded-xl shadow-sm border border-white/10 flex flex-col h-80">
                <h3 className="text-base font-bold text-white mb-4">
                  Reportes por Docente
                </h3>
                <div className="space-y-3 overflow-y-auto">
                  <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                    <span className="text-sm font-bold text-gray-300">
                      Prof. Ramírez
                    </span>
                    <span className="text-xs bg-red-900/40 text-red-400 px-2 py-1 rounded font-bold">
                      12
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 hover:bg-white/5 rounded transition-colors">
                    <span className="text-sm font-bold text-gray-300">
                      Prof. Dávila
                    </span>
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded font-bold">
                      5
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-8">
            {/* Requests & Follow-up Module */}
            <section className="bg-black/20 backdrop-blur-xl rounded-xl shadow-sm border border-white/10 p-5 flex-1 flex flex-col">
              <h3 className="text-base font-bold text-white mb-4 flex items-center justify-between">
                Solicitudes a Docentes
                <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full border border-yellow-500/30">
                  2 Pendientes
                </span>
              </h3>

              <div className="flex-1 space-y-4 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                {/* Request Item 1 */}
                <div className="bg-white/5 border-l-4 border-orange-500 pl-4 py-3 rounded-r-lg hover:bg-white/10 transition-colors group cursor-pointer relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-white mb-1">
                        Reporte Conductual
                      </p>
                      <p className="text-xs text-gray-400">
                        Para:{" "}
                        <span className="text-gray-300">
                          Prof. Ramírez (Matemáticas)
                        </span>
                      </p>
                      <p className="text-xs text-orange-300 mt-1">
                        Alumno: Carlos H. - 2º B
                      </p>
                    </div>
                    <span className="text-[10px] text-gray-500">Hace 2h</span>
                  </div>
                  <div className="mt-3 flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <button className="text-[10px] bg-orange-500/20 text-orange-300 px-2 py-1 rounded hover:bg-orange-500/40 font-bold uppercase">
                      Recordar
                    </button>
                    <button className="text-[10px] bg-white/10 text-gray-300 px-2 py-1 rounded hover:bg-white/20 font-bold uppercase">
                      Ver Detalle
                    </button>
                  </div>
                </div>

                {/* Request Item 2 */}
                <div className="bg-white/5 border-l-4 border-blue-500 pl-4 py-3 rounded-r-lg hover:bg-white/10 transition-colors group cursor-pointer relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-white mb-1">
                        Ficha Canalización UDEII
                      </p>
                      <p className="text-xs text-gray-400">
                        Para:{" "}
                        <span className="text-gray-300">Psic. Ana (UDEII)</span>
                      </p>
                      <p className="text-xs text-blue-300 mt-1">
                        Alumno: Sofia G. - 3º A
                      </p>
                    </div>
                    <span className="text-[10px] text-gray-500">Ayer</span>
                  </div>
                </div>

                {/* New Request Button */}
                <button
                  onClick={() => setCurrentModule(AppModule.REPORTES_DOCENTES)}
                  className="w-full py-3 border-2 border-dashed border-white/10 rounded-lg text-gray-400 text-xs font-bold hover:border-yellow-500/50 hover:text-yellow-200 hover:bg-yellow-500/5 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">
                    add_circle
                  </span>
                  Nueva Solicitud Interna
                </button>
              </div>
            </section>

            {/* Intervention & Citatorios */}
            <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-5 shadow-lg">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-yellow-400">
                  event_available
                </span>
                Gestión de Citatorios
              </h3>

              <div className="space-y-4">
                {/* Next Appointment Card */}
                <div className="bg-gradient-to-br from-yellow-900/30 to-black/30 border border-yellow-500/20 rounded-lg p-4 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-30 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-yellow-400">
                      edit
                    </span>
                  </div>
                  <p className="text-xs text-yellow-400/80 uppercase font-bold mb-1">
                    Próxima Cita
                  </p>
                  <p className="font-bold text-white text-lg">
                    {nextAppointment.family}
                  </p>
                  <p className="text-sm text-gray-300 mb-3">
                    {nextAppointment.student}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-bold bg-yellow-400/10 text-yellow-200 w-fit px-3 py-1.5 rounded-full border border-yellow-500/20">
                    <span className="material-symbols-outlined text-[16px]">
                      schedule
                    </span>
                    {nextAppointment.time}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() =>
                      toast("Módulo de Agenda en desarrollo", { icon: "📅" })
                    }
                    className="bg-white/10 hover:bg-white/20 border border-white/10 text-white py-3 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition-all"
                  >
                    <span className="material-symbols-outlined text-xl">
                      calendar_add_on
                    </span>
                    Agendar Cita
                  </button>
                  <button
                    onClick={() =>
                      toast("Formato de entrevista generado", { icon: "📝" })
                    }
                    className="bg-white/10 hover:bg-white/20 border border-white/10 text-white py-3 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition-all"
                  >
                    <span className="material-symbols-outlined text-xl">
                      history_edu
                    </span>
                    Entrevista
                  </button>
                </div>

                {/* Quick Stats */}
                <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-black text-white">8</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                      Citas esta semana
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-green-400">92%</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                      Asistencia Padres
                    </p>
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
