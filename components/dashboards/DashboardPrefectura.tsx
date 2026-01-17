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

    addIncident(student.id, typeEnum, quickType);

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
    <div className="flex-1 w-full space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1 h-full bg-blue-600"></div>
            <img
              src="/assets/branding/PREFECVTURA.png"
              alt="Prefectura"
              className="w-14 h-14 object-contain"
            />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              Control de Prefectura
            </h1>
            <div className="flex items-center gap-3 mt-1 text-xs font-bold uppercase tracking-widest text-slate-500">
              <span className="flex items-center gap-1.5 text-blue-700">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Vigilancia Escolar Activa
              </span>
              <span className="text-slate-300">|</span>
              <span>Gestión de Asistencia y Disciplina</span>
            </div>
          </div>
        </div>

        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-right">
          <p className="text-sm font-bold text-slate-800 capitalize">
            {todayDisplay}
          </p>
          <p className="text-xs text-slate-500 font-black uppercase tracking-widest mt-1">
            Servicio de Guardia
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <PrefStat
          label="Asistencia Global"
          value={`${attendanceRate}%`}
          desc="Tasa de presencia hoy"
          icon="group"
          color="blue"
        />
        <PrefStat
          label="Retardos Hoy"
          value={retardosToday}
          desc="Ingresos extemporáneos"
          icon="schedule"
          color="amber"
        />
        <PrefStat
          label="Justificados"
          value={justifiedToday}
          desc="Faltas con permiso"
          icon="verified"
          color="emerald"
        />
        <PrefStat
          label="Incidencias"
          value={uniformesToday}
          desc="Uniforme y conducta"
          icon="checkroom"
          color="indigo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Register Form */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full pointer-events-none -mr-8 -mt-8"></div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-3 relative z-10">
              <span className="material-symbols-outlined text-blue-600">
                bolt
              </span>
              Registro Instantáneo de Incidencia
            </h2>

            <div className="flex flex-col md:flex-row items-end gap-5 relative z-10">
              <div className="flex-1 w-full space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                  Matrícula / ID Alumno
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-[20px]">
                    badge
                  </span>
                  <input
                    value={quickMatricula}
                    onChange={(e) => setQuickMatricula(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl h-11 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-mono"
                    placeholder="Ej. SS-2024-001"
                  />
                </div>
              </div>

              <div className="flex-1 w-full space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                  Tipo de Incidencia
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-[20px]">
                    category
                  </span>
                  <select
                    value={quickType}
                    onChange={(e) => setQuickType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl h-11 pl-10 pr-10 text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none italic font-bold text-slate-700"
                  >
                    <option>Retardo (Entrada)</option>
                    <option>Falta de Uniforme</option>
                    <option>Sin Credencial</option>
                    <option>Uso de Celular</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              <button
                onClick={handleRegister}
                className="w-full md:w-auto h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
              >
                <span className="material-symbols-outlined text-[18px]">
                  save
                </span>
                Registrar
              </button>
            </div>
          </div>

          {/* Activity Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                Registro Reciente de Acciones
              </h3>
              <button
                onClick={() => setCurrentModule(AppModule.REPORTES)}
                className="text-xs font-bold text-blue-600 hover:underline uppercase tracking-widest"
              >
                Bitácora Completa
              </button>
            </div>

            <div className="overflow-x-auto font-sans">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 text-xs uppercase font-black border-b border-slate-200">
                    <th className="px-6 py-4 tracking-widest">Horario</th>
                    <th className="px-6 py-4 tracking-widest">Estudiante</th>
                    <th className="px-6 py-4 tracking-widest">Grupo</th>
                    <th className="px-6 py-4 tracking-widest">Descripción</th>
                    <th className="px-6 py-4 tracking-widest">Estatus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentActivity.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center">
                        <p className="text-slate-400 font-bold text-sm uppercase italic">
                          No se han registrado acciones recientes
                        </p>
                      </td>
                    </tr>
                  ) : (
                    recentActivity.map((inc) => (
                      <tr
                        key={inc.id}
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="px-6 py-5 text-xs font-mono font-black text-slate-600 tracking-tighter">
                          {new Date(inc.date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-5">
                          <p className="font-bold text-slate-800 text-sm group-hover:text-blue-700 transition-colors uppercase italic">
                            {inc.studentName}
                          </p>
                        </td>
                        <td className="px-6 py-5">
                          <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-600 uppercase shadow-sm">
                            {inc.group}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-tighter">
                          {inc.type}
                        </td>
                        <td className="px-6 py-5">
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-black px-3 py-1 rounded-lg uppercase tracking-widest shadow-sm">
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

        {/* Right Sidebar */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                Alertas del Sistema
              </h3>
              <span className="bg-red-50 text-red-600 border border-red-100 text-xs font-black px-3 py-1 rounded-full animate-pulse">
                EN VIVO
              </span>
            </div>

            <div className="space-y-4">
              <AlertItem
                title="Retardos Acumulados"
                desc="3 alumnos superan límite de retardos."
                icon="warning"
                type="red"
              />
              <AlertItem
                title="Supervisión Uniforme"
                desc="Programada para 3º Grado - 11:00 AM"
                icon="info"
                type="blue"
              />
            </div>

            <button
              onClick={() =>
                printContent(
                  "Reporte Diario Prefectura",
                  `<h1>Reporte de Prefectura</h1><p>Fecha: ${todayDisplay}</p>`
                )
              }
              className="mt-8 w-full py-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 uppercase tracking-widest transition-all flex items-center justify-center gap-2 group"
            >
              <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">
                print
              </span>
              Generar Parte Informativo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PrefStat = ({ label, value, desc, icon, color }: any) => {
  const colors: any = {
    blue: "text-blue-700 bg-blue-50 border-blue-100",
    amber: "text-amber-700 bg-amber-50 border-amber-100",
    emerald: "text-emerald-700 bg-emerald-50 border-emerald-100",
    indigo: "text-indigo-700 bg-indigo-50 border-indigo-100",
  };
  return (
    <div
      className={`p-6 rounded-2xl border-2 ${colors[color]} shadow-sm group hover:scale-[1.02] transition-transform`}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="material-symbols-outlined text-2xl opacity-60 group-hover:scale-110 transition-transform">
          {icon}
        </span>
        <span className="text-xs font-black uppercase tracking-widest text-slate-500">
          {label}
        </span>
      </div>
      <div>
        <p className="text-4xl font-black text-slate-800 mb-1">{value}</p>
        <p className="text-xs font-black uppercase tracking-widest text-slate-500 mt-1 flex items-center gap-1.5">
          <span className="size-1.5 bg-slate-400 rounded-full"></span>
          {desc}
        </p>
      </div>
    </div>
  );
};

const AlertItem = ({ title, desc, icon, type }: any) => {
  const styles: any = {
    red: "bg-red-50 border-red-100 text-red-700",
    blue: "bg-blue-50 border-blue-100 text-blue-700",
  };
  return (
    <div
      className={`p-4 rounded-xl border ${styles[type]} flex gap-3 items-start cursor-pointer hover:scale-[1.02] transition-transform`}
    >
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
      <div>
        <p className="text-xs font-black uppercase tracking-tight leading-none mb-1">
          {title}
        </p>
        <p className="text-xs font-black opacity-80 leading-tight mt-1">
          {desc}
        </p>
      </div>
    </div>
  );
};
