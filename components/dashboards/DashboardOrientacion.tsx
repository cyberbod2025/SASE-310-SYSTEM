import React from "react";
import toast from "react-hot-toast";
import { useApp } from "../../store";
import { CaseState, AppModule } from "../../types";
import { printContent } from "../PrintButtons";

export const DashboardOrientacion = () => {
  const { students, setCurrentModule } = useApp();

  // Logic
  const studentsInTrouble = students.filter(
    (s) =>
      s.caseState !== CaseState.CERRADO && s.caseState !== CaseState.OBSERVADO
  );

  const patternAlerts = students.filter(
    (s) => s.caseState === CaseState.PATRON_DETECTADO
  );

  const nextAppointment = {
    family: "Familia Hernández",
    student: "Carlos H. (2°B)",
    time: "Hoy, 10:00 AM",
  };

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
    `;
    printContent("Reporte Semanal - Orientación", reportData);
  };

  return (
    <div className="flex-1 w-full space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1 h-full bg-amber-500"></div>
            <img
              src="/assets/branding/ORIENTACION.png"
              alt="Orientación"
              className="w-14 h-14 object-contain"
            />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              Orientación Educativa
            </h1>
            <div className="flex items-center gap-3 mt-1 text-xs font-bold uppercase tracking-widest text-slate-500">
              <span className="flex items-center gap-1.5 text-amber-700">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                Acompañamiento Psicoeducativo
              </span>
              <span className="text-slate-300">|</span>
              <span>Prevención y Bienestar Estudiantil</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handlePrintReport}
            className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 uppercase tracking-widest shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            Reporte Semanal
          </button>
          <button
            onClick={() => setCurrentModule(AppModule.REPORTES_DOCENTES)}
            className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white border border-amber-500 rounded-xl text-xs font-bold uppercase tracking-widest shadow-md transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">
              psychology
            </span>
            Solicitar Reporte
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          {/* Patrones de Riesgo */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600 text-[20px]">
                  warning
                </span>
                Patrones de Riesgo Detectados (IA)
              </h3>
              <button
                onClick={() => setCurrentModule(AppModule.REPORTES)}
                className="text-[10px] font-bold text-amber-700 hover:underline uppercase tracking-widest"
              >
                Ver Análisis Predictivo
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {patternAlerts.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <p className="font-bold uppercase text-sm italic tracking-widest">
                    Sin alertas de patrón activas
                  </p>
                </div>
              ) : (
                patternAlerts.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 hover:bg-slate-50/50 transition-colors flex items-center gap-4 group"
                  >
                    <div className="size-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                      <span className="material-symbols-outlined">
                        person_alert
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-black text-slate-800 uppercase italic">
                          {s.name}
                        </p>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded uppercase">
                          {s.group}
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-red-600 uppercase flex items-center gap-1 opacity-80">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                        Comportamiento Recurrente: {s.incidents.length}{" "}
                        Incidentes
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-slate-600 uppercase hover:bg-slate-50">
                        Expediente
                      </button>
                      <button className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-[9px] font-black text-amber-700 uppercase hover:bg-amber-100">
                        Contactar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Estadísticas de Seguimiento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center justify-between">
                Incidencias por Nivel Académico
                <span className="material-symbols-outlined text-slate-300">
                  bar_chart
                </span>
              </h3>
              <div className="h-48 flex items-end gap-6 px-4 pb-2 border-b border-slate-100">
                <Bar
                  height="40%"
                  color="bg-blue-400"
                  label="1º Grado"
                  value="28"
                />
                <Bar
                  height="70%"
                  color="bg-amber-400"
                  label="2º Grado"
                  value="45"
                />
                <Bar
                  height="50%"
                  color="bg-indigo-400"
                  label="3º Grado"
                  value="32"
                />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center justify-between">
                Reportes Recientes por Docente
                <span className="material-symbols-outlined text-slate-300">
                  group
                </span>
              </h3>
              <div className="space-y-3">
                <TeacherStat
                  name="Prof. Ramírez"
                  count={12}
                  color="bg-amber-100 text-amber-700"
                />
                <TeacherStat
                  name="Prof. Dávila"
                  count={5}
                  color="bg-slate-50 text-slate-500"
                />
                <TeacherStat
                  name="Prof. Suarez"
                  count={3}
                  color="bg-slate-50 text-slate-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Solicitudes Internas */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                Solicitudes Internas
              </h3>
              <span className="bg-blue-50 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                2 NUEVAS
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border-l-4 border-amber-500 hover:bg-slate-100 transition-colors cursor-pointer group">
                <p className="text-xs font-black text-slate-800 uppercase mb-1">
                  Reporte Conductual
                </p>
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase">
                  <span>De: Prof. Ramírez</span>
                  <span>Carlos H. (2ºB)</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border-l-4 border-blue-500 hover:bg-slate-100 transition-colors cursor-pointer">
                <p className="text-xs font-black text-slate-800 uppercase mb-1">
                  Canalización UDEII
                </p>
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase">
                  <span>De: Psic. Ana</span>
                  <span>Sofia G. (3ºA)</span>
                </div>
              </div>

              <button
                onClick={() => setCurrentModule(AppModule.REPORTES_DOCENTES)}
                className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-[10px] font-black text-slate-400 uppercase hover:border-amber-500 hover:text-amber-500 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">
                  add_circle
                </span>
                Nueva Solicitud de Reporte
              </button>
            </div>
          </div>

          {/* Agenda & Citas */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-bl-full -mr-4 -mt-4 pointer-events-none"></div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
              <span className="material-symbols-outlined text-amber-600 text-[20px]">
                calendar_month
              </span>
              Agenda de Seguimiento
            </h3>

            <div className="space-y-5 relative z-10">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 group hover:border-amber-500 transition-all cursor-pointer">
                <p className="text-[9px] font-black text-amber-700 uppercase mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-amber-600 rounded-full"></span>
                  PRÓXIMA SESIÓN
                </p>
                <p className="text-lg font-black text-slate-800 mb-1">
                  {nextAppointment.family}
                </p>
                <p className="text-xs font-bold text-slate-400 uppercase italic mb-3">
                  {nextAppointment.student}
                </p>
                <div className="flex items-center gap-2 bg-white border border-slate-100 px-3 py-1.5 rounded-lg w-fit text-[11px] font-black text-slate-600">
                  <span className="material-symbols-outlined text-[16px]">
                    schedule
                  </span>
                  {nextAppointment.time}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 transition-all flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400">
                    calendar_add_on
                  </span>
                  <span className="text-[9px] font-black text-slate-600 uppercase">
                    Agendar Cita
                  </span>
                </button>
                <button className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 transition-all flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400">
                    history_edu
                  </span>
                  <span className="text-[9px] font-black text-slate-600 uppercase">
                    Entrevista
                  </span>
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-xl font-black text-slate-800">8</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    Citatorios
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-black text-emerald-600">92%</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    Efectividad
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Bar = ({ height, color, label, value }: any) => (
  <div className="flex-1 flex flex-col items-center gap-2 h-full">
    <div className="flex-1 w-full flex items-end">
      <div
        className={`w-full ${color} rounded-t-lg transition-all hover:brightness-110 relative group/bar`}
        style={{ height }}
      >
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-800 opacity-0 group-hover/bar:opacity-100 transition-opacity">
          {value}
        </div>
      </div>
    </div>
    <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter whitespace-nowrap">
      {label}
    </span>
  </div>
);

const TeacherStat = ({ name, count, color }: any) => (
  <div
    className={`flex justify-between items-center p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors group cursor-pointer`}
  >
    <span className="text-xs font-bold text-slate-600 uppercase">{name}</span>
    <span
      className={`text-[10px] font-black px-2 py-0.5 rounded-lg border border-transparent group-hover:border-amber-200 ${color}`}
    >
      {count} CAPS
    </span>
  </div>
);
