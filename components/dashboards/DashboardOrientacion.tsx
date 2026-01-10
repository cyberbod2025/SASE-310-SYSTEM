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
            {/* Requests Module */}
            <section className="bg-black/20 backdrop-blur-xl rounded-xl shadow-sm border border-white/10 p-5">
              <h3 className="text-base font-bold text-white mb-4 flex items-center justify-between">
                Solicitudes a Docentes
                <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full">
                  2 Pendientes
                </span>
              </h3>
              <div className="flex flex-col gap-4">
                <div className="border-l-2 border-orange-400 pl-3 py-1">
                  <p className="text-sm font-medium text-gray-300">
                    Reporte de Conducta
                  </p>
                  <p className="text-xs text-gray-500">Para: Prof. Ramírez</p>
                </div>
              </div>
            </section>

            {/* Intervention */}
            <section className="bg-primary text-white rounded-xl shadow-lg p-6 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-1">
                  Seguimiento con Padres
                </h3>
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 mb-6 border border-white/10 mt-4">
                  <p className="font-bold text-sm">{nextAppointment.family}</p>
                  <div className="flex items-center gap-2 text-xs font-medium bg-black/20 w-fit px-2 py-1 rounded mt-2">
                    <span className="material-symbols-outlined text-[16px]">
                      schedule
                    </span>
                    {nextAppointment.time}
                  </div>
                </div>
                <button
                  onClick={() =>
                    toast("Agenda Google Calendar próximamente...", {
                      icon: "📅",
                    })
                  }
                  className="w-full bg-white text-primary font-bold py-2.5 rounded-lg shadow-md hover:bg-blue-50 transition-colors text-sm"
                >
                  Registrar Nueva Cita
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
