import React from "react";
import { useApp } from "../../store";
import { CaseState } from "../../types";
import { printContent } from "../PrintButtons";

export const DashboardDireccion = () => {
  const { students } = useApp();
  const studentsAtRisk = students.filter(
    (s) => s.caseState === CaseState.PATRON_DETECTADO
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="flex items-center gap-6">
          <img
            src="/branding/direccion.png"
            alt="Dirección Logo"
            className="w-24 h-24 object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
          />
          <div className="flex flex-col gap-1">
            <h1
              className="text-white text-3xl md:text-5xl font-black tracking-tight"
              style={{ textShadow: "0 0 20px rgba(59,130,246,0.6)" }}
            >
              Dirección Escolar
            </h1>
            <p className="text-blue-200 text-lg font-medium tracking-wide">
              Tablero de Mando e Indicadores Estratégicos
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() =>
              printContent(
                "Resumen Dirección",
                `
              <h1>Resumen Ejecutivo - Dirección</h1>
              <p>Fecha: ${new Date().toLocaleDateString()}</p>
              <h2>Indicadores Clave</h2>
              <ul>
                <li>Asistencia Global: 92%</li>
                <li>Casos en Riesgo: ${studentsAtRisk.length}</li>
                <li>Total Incidencias: ${students.reduce(
                  (acc, s) => acc + s.incidents.length,
                  0
                )}</li>
              </ul>
            `
              )
            }
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20 border border-white/10"
          >
            <span className="material-symbols-outlined text-[20px]">
              download
            </span>
            Exportar Informe
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-black/20 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg group hover:bg-white/5 transition-all">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Asistencia Global
          </h4>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-black text-white group-hover:scale-105 transition-transform">
              92%
            </span>
            <span className="text-sm font-bold text-green-400 mb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">
                trending_up
              </span>
              2% vs mes anterior
            </span>
          </div>
        </div>
        <div className="bg-black/20 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg group hover:bg-white/5 transition-all">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Casos en Riesgo
          </h4>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-black text-red-500 group-hover:scale-105 transition-transform">
              {studentsAtRisk.length}
            </span>
            <span className="text-sm font-bold text-gray-400 mb-1">
              Estudiantes detectados
            </span>
          </div>
        </div>
        <div className="bg-black/20 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg group hover:bg-white/5 transition-all">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Incidencias del Mes
          </h4>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-black text-white group-hover:scale-105 transition-transform">
              {students.reduce((acc, s) => acc + s.incidents.length, 0)}
            </span>
            <span className="text-sm font-bold text-gray-400 mb-1">
              Total Global
            </span>
          </div>
        </div>
      </div>

      {/* Strategic Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg p-6">
          <h3 className="font-bold text-lg mb-4 text-white">
            Grupos con Mayor Índice de Riesgo
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <div>
                <p className="font-bold text-gray-200">3º B - Turno Matutino</p>
                <p className="text-xs text-gray-400">Tutor: Prof. Rodríguez</p>
              </div>
              <span className="px-2 py-1 bg-red-900/30 text-red-200 border border-red-500/20 text-xs font-bold rounded-full">
                Alta Prioridad
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <div>
                <p className="font-bold text-gray-200">2º A - Turno Matutino</p>
                <p className="text-xs text-gray-400">Tutor: Prof. Gómez</p>
              </div>
              <span className="px-2 py-1 bg-yellow-900/30 text-yellow-200 border border-yellow-500/20 text-xs font-bold rounded-full">
                Seguimiento
              </span>
            </div>
          </div>
        </div>

        <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg p-6">
          <h3 className="font-bold text-lg mb-4 text-white">
            Acciones Institucionales Pendientes
          </h3>
          <ul className="space-y-3">
            <li className="flex gap-3 items-start">
              <input
                type="checkbox"
                className="mt-1 rounded text-blue-500 focus:ring-blue-500 bg-gray-800 border-gray-600"
              />
              <div>
                <p className="text-sm font-bold text-gray-200">
                  Firmar actas de consejo técnico
                </p>
                <p className="text-xs text-gray-400">Vence: Viernes 12</p>
              </div>
            </li>
            <li className="flex gap-3 items-start">
              <input
                type="checkbox"
                className="mt-1 rounded text-blue-500 focus:ring-blue-500 bg-gray-800 border-gray-600"
              />
              <div>
                <p className="text-sm font-bold text-gray-200">
                  Autorizar compra de insumos (Enfermería)
                </p>
                <p className="text-xs text-gray-400">Solicitud #4492</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
