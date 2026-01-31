import React, { useState } from "react";
import toast from "react-hot-toast";
import { useApp } from "../../store";
import { AppModule } from "../../types";
import { CICLO_ESCOLAR } from "../../config/sase.config";
import { useAuth } from "../AuthProvider";

export const DashboardDocente = () => {
  const [activeTab, setActiveTab] = useState<
    "PANEL" | "ASISTENCIA" | "CALIFICACIONES"
  >("PANEL");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const {
    students,
    isTutorMode,
    toggleTutorMode,
    setCurrentModule,
    setQuickRegisterOpen,
  } = useApp();
  const { signOut } = useAuth();

  const handleQuickAction = (action: string) => {
    if (action === "incidencia") {
      setQuickRegisterOpen(true);
    } else if (action === "lista" || action === "imprimir") {
      setCurrentModule(AppModule.REPORTES);
    } else if (action === "planeacion" || action === "calendario") {
      setCurrentModule(AppModule.AGENDA);
    }
  };

  const riskCount = students.filter((s) => s.incidents.length >= 3).length;
  const warningCount = students.filter(
    (s) => s.incidents.length > 0 && s.incidents.length < 3,
  ).length;

  const alerts = students.filter(
    (s) =>
      s.incidents.length > 0 || (s.medicalAlerts && s.medicalAlerts.length > 0),
  );

  return (
    <div className="flex-1 w-full space-y-6 animate-fade-in relative z-10 font-sans">
      {/* 1. Page Header (Metro Style) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-slate-300">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 w-2 h-12"></div> {/* Metro Accent Bar */}
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">
              Portal Docente
            </span>
            <h1
              id="docente-dashboard-title"
              className="text-2xl font-black text-slate-800 tracking-tight uppercase leading-none"
            >
              Control de Grupo
            </h1>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="bg-white border border-slate-300 px-4 py-2 flex flex-col items-end shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Período
            </span>
            <span className="text-sm font-bold text-slate-700">
              {CICLO_ESCOLAR.labelCorto} Ciclo
            </span>
          </div>
          <div className="bg-white border border-slate-300 px-4 py-2 flex flex-col items-end shadow-sm border-l-4 border-l-blue-600">
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Grupo
            </span>
            <span className="text-sm font-bold text-slate-700">3º B</span>
          </div>
        </div>
      </div>

      {/* 2. Institutional Alert (Clean) */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-amber-600">
            notification_important
          </span>
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wide block">
              Recordatorio del Sistema
            </span>
            <span className="text-sm text-slate-700 font-medium">
              Cierre de captura de calificaciones:{" "}
              <span className="font-bold">Viernes 14:00 hrs</span>
            </span>
          </div>
        </div>
        <button className="text-xs font-bold text-amber-900 border-b border-amber-900 uppercase hover:text-amber-700 transition-colors">
          Ver Detalles
        </button>
      </div>

      {/* 3. Metro Tabs */}
      <div id="docente-tabs" className="flex border-b border-slate-300">
        {[
          { id: "PANEL", label: "General", icon: "dashboard" },
          { id: "ASISTENCIA", label: "Pase de Lista", icon: "fact_check" },
          { id: "CALIFICACIONES", label: "Evaluación", icon: "grade" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide transition-all ${
              activeTab === tab.id
                ? "bg-white border-x border-t border-slate-300 border-b-white text-blue-700 -mb-px pt-4"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200 border-slate-200"
            }`}
          >
            <span className="material-symbols-outlined text-lg">
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "PANEL" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
          {/* Main Area */}
          <div className="lg:col-span-8 space-y-6">
            {/* Quick Stats Grid - Solid Metro Blocks */}
            <div
              id="risk-semaphore"
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <SolidStatCard
                label="Alumnos en Riesgo"
                value={riskCount}
                color="bg-red-600"
                icon="warning"
              />
              <SolidStatCard
                label="Alertas Leves"
                value={warningCount}
                color="bg-amber-500"
                icon="visibility"
              />
              <SolidStatCard
                label="Promedio Asistencia"
                value="94%"
                color="bg-emerald-500"
                icon="trending_up"
              />
            </div>

            {/* Student List Section */}
            <div className="bg-white border border-slate-200 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400">
                    group
                  </span>
                  Directorio de Grupo
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Buscar alumno..."
                    className="bg-white border border-slate-300 px-3 py-1 text-xs outline-none focus:border-blue-500 w-48"
                  />
                  <button className="bg-slate-200 hover:bg-slate-300 p-1 rounded-sm">
                    <span className="material-symbols-outlined text-slate-600 text-sm">
                      filter_list
                    </span>
                  </button>
                </div>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto">
                {students.map((s) => (
                  <MetroStudentCard
                    key={s.id}
                    student={s}
                    onClick={() => setSelectedStudent(s)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-6">
            {/* Actions Card */}
            <div className="bg-white border border-slate-200 p-6 shadow-sm border-t-4 border-t-blue-600">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">
                Acciones Rápidas
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => handleQuickAction("incidencia")}
                  className="flex items-center gap-3 w-full p-3 bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all active:translate-y-0.5"
                >
                  <span className="material-symbols-outlined">add_circle</span>
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Nueva Incidencia
                  </span>
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setActiveTab("ASISTENCIA")}
                    className="border border-slate-300 hover:bg-slate-50 py-3 text-xs font-bold text-slate-600 uppercase flex flex-col items-center gap-1"
                  >
                    <span className="material-symbols-outlined">
                      fact_check
                    </span>
                    Asistencia
                  </button>
                  <button
                    onClick={() => handleQuickAction("imprimir")}
                    className="border border-slate-300 hover:bg-slate-50 py-3 text-xs font-bold text-slate-600 uppercase flex flex-col items-center gap-1"
                  >
                    <span className="material-symbols-outlined">print</span>
                    Reportes
                  </button>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                  <button
                    onClick={() =>
                      toast.success("Módulo de Configuración (En Desarrollo)")
                    }
                    className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">
                      settings
                    </span>
                    Configuración de Grupo
                  </button>
                  <button
                    onClick={signOut}
                    className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase text-red-400 hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
                  >
                    <span className="material-symbols-outlined text-sm">
                      logout
                    </span>
                    Cerrar Panel
                  </button>
                </div>
              </div>
            </div>

            {/* Alerts Feed */}
            <div className="bg-white border border-slate-200 shadow-sm flex flex-col h-[400px]">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="text-xs font-black text-red-700 uppercase tracking-widest">
                  Bitácora de Alertas
                </h3>
                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">
                  {alerts.length} NUEVOS
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-0 scrollbar-thin">
                {alerts.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group"
                    onClick={() => setSelectedStudent(s)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-1 rounded-sm group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                        {s.matricula}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        Hace 15 min
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 uppercase">
                      {s.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="material-symbols-outlined text-red-500 text-sm">
                        warning
                      </span>
                      <p className="text-xs text-slate-600 truncate font-medium">
                        {s.incidents[0]?.description || "Seguimiento requerido"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE ALUMNO (METRO STYLE) */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-grayscale p-4 animate-fade-in">
          <div className="bg-white w-full max-w-2xl shadow-2xl border-t-8 border-blue-600 relative animate-slide-up-sm">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-2 right-2 p-2 hover:bg-red-50 hover:text-red-600 text-slate-400 transition-all font-bold"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="p-8">
              <div className="flex gap-6 mb-8">
                <div className="w-24 h-24 bg-slate-200 border border-slate-300">
                  <img
                    src={selectedStudent.avatar}
                    alt={selectedStudent.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="inline-block bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded-sm uppercase tracking-wider mb-2">
                    Expediente Activo
                  </span>
                  <h2 className="text-3xl font-black text-slate-800 uppercase leading-none mb-1">
                    {selectedStudent.name}
                  </h2>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                    {selectedStudent.matricula} • 3º "B"
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-6 border border-slate-200 mb-6">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2">
                  Métricas Rápidas
                </h4>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="border-r border-slate-200">
                    <div className="text-2xl font-black text-slate-700">
                      9.2
                    </div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      Promedio
                    </div>
                  </div>
                  <div className="border-r border-slate-200">
                    <div className="text-2xl font-black text-emerald-600">
                      96%
                    </div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      Asistencia
                    </div>
                  </div>
                  <div className="border-r border-slate-200">
                    <div className="text-2xl font-black text-amber-600">
                      {selectedStudent.incidents.length}
                    </div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      Reportes
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-700">0</div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      Justificantes
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400">
                      history
                    </span>
                    Historial de Incidencias
                  </h3>
                  <button
                    onClick={() => handleQuickAction("incidencia")}
                    className="text-xs font-bold text-blue-600 hover:underline uppercase"
                  >
                    + Agregar Nueva
                  </button>
                </div>
                <div className="border border-slate-200">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 font-bold text-slate-500 uppercase">
                      <tr>
                        <th className="p-2">Fecha</th>
                        <th className="p-2">Tipo</th>
                        <th className="p-2">Descripción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedStudent.incidents.length > 0 ? (
                        selectedStudent.incidents.map((inc: any) => (
                          <tr key={inc.id}>
                            <td className="p-2 text-slate-500 font-mono">
                              15/01/2026
                            </td>
                            <td className="p-2 font-bold text-slate-700 uppercase">
                              {inc.type}
                            </td>
                            <td className="p-2 text-slate-600">
                              {inc.description}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={3}
                            className="p-4 text-center text-slate-400 italic"
                          >
                            Sin registros en este periodo.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "ASISTENCIA" && (
        <div className="bg-white border border-slate-200 shadow-sm border-t-4 border-t-emerald-500 p-6">
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-slate-800 uppercase">
                Pase de Lista Diario
              </h2>
              <p className="text-xs text-slate-400 font-bold uppercase mt-1">
                {new Date().toLocaleDateString("es-MX", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            <button
              className="px-6 py-2 bg-emerald-600 text-white font-bold text-sm uppercase tracking-wider hover:bg-emerald-700 transition shadow-sm"
              onClick={() =>
                alert("Asistencia Guardada en Bitácora (attendance_logs)")
              }
            >
              Guardar Cambios
            </button>
          </div>

          <div className="border border-slate-200">
            <table className="w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Alumno
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Nota
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-slate-200 border border-slate-300 overflow-hidden shrink-0">
                          <img
                            src={student.avatar}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-slate-900 uppercase">
                            {student.name}
                          </div>
                          <div className="text-xs text-slate-500 font-mono">
                            {student.matricula}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="inline-flex border border-slate-300 rounded-sm overflow-hidden">
                        <button className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold hover:bg-emerald-200">
                          P
                        </button>
                        <button className="px-3 py-1 bg-white text-slate-500 text-xs font-bold hover:bg-slate-100 border-l border-slate-300">
                          R
                        </button>
                        <button className="px-3 py-1 bg-white text-slate-500 text-xs font-bold hover:bg-red-50 hover:text-red-600 border-l border-slate-300">
                          F
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        className="border-b border-slate-300 focus:border-blue-500 outline-none w-full text-xs py-1"
                        placeholder="Escribir nota..."
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
        <div className="bg-white border border-slate-200 shadow-sm border-t-4 border-t-slate-300 p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
          <span className="material-symbols-outlined text-slate-300 text-6xl mb-4">
            lock_clock
          </span>
          <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase">
            Módulo Cerrado
          </h2>
          <p className="text-sm font-medium text-slate-500 max-w-sm">
            La captura de calificaciones para este periodo aún no está
            habilitada por Dirección.
          </p>
        </div>
      )}
    </div>
  );
};

// --- SUB-COMPONENTS (METRO STYLE) ---

const SolidStatCard = ({ label, value, color, icon, trend }: any) => {
  return (
    <div
      className={`${color} rounded-2xl p-5 text-white shadow-xl relative overflow-hidden group hover:scale-[1.03] transition-all`}
    >
      <div className="absolute top-2 right-4 opacity-20 group-hover:opacity-40 transition-opacity">
        <span className="material-symbols-outlined text-5xl">{icon}</span>
      </div>
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-lg">{icon}</span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
            {label}
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <h3 className="text-4xl font-black tracking-tighter">{value}</h3>
          {trend && (
            <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded uppercase">
              {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const MetroStudentCard = ({ student, onClick }: any) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full p-2 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-left group"
    >
      <div className="w-10 h-10 bg-slate-200 border border-slate-300 shrink-0 overflow-hidden">
        <img
          src={student.avatar}
          alt=""
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-slate-700 uppercase truncate group-hover:text-blue-700">
          {student.name}
        </h4>
        <span className="text-[10px] font-bold text-slate-400">
          {student.matricula}
        </span>
      </div>
      <div className="flex gap-1 items-center">
        {student.isDistancia && (
          <span
            className="text-[10px] font-black bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-sm uppercase tracking-tighter"
            title="Modo a Distancia"
          >
            Distancia
          </span>
        )}
        {student.incidents.length > 0 && (
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
        )}
      </div>
    </button>
  );
};
