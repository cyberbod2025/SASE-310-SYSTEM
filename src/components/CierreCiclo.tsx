import React, { useEffect, useState } from "react";
import { useApp } from "../store";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { DecisionPromocion } from "../types";

export const CierreCiclo: React.FC = () => {
  const { cierre, fetchCiclos, crearCicloNuevo, simularPromocion, setOverride, ejecutarPromocion, resetCierre } = useApp();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");

  useEffect(() => {
    fetchCiclos();
  }, [fetchCiclos]);

  const handleCrearCiclo = () => {
    if (!nuevoNombre) return;
    crearCicloNuevo(nuevoNombre);
    setNuevoNombre("");
  };

  const stats = cierre.resultado || {
    promovidos: cierre.simulacion.filter(s => (cierre.overrides[s.alumnoId] || s.decisionSugerida) === "promover").length,
    egresados: cierre.simulacion.filter(s => (cierre.overrides[s.alumnoId] || s.decisionSugerida) === "egresar").length,
    bajas: cierre.simulacion.filter(s => (cierre.overrides[s.alumnoId] || s.decisionSugerida) === "baja").length,
    retenidos: cierre.simulacion.filter(s => (cierre.overrides[s.alumnoId] || s.decisionSugerida) === "retener").length,
  };

  if (cierre.loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 bg-transparent relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 size-96 bg-rose-50 rounded-full blur-[100px] -z-10 opacity-50" />

      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-800 uppercase tracking-tighter italic">
            Cierre de <span className="text-rose-600">Ciclo Escolar</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1">
            Gestión de Promoción y Egreso <span className="text-rose-600">INSTITUCIONAL</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!cierre.simulado ? (
            <button
              onClick={simularPromocion}
              disabled={!cierre.cicloActivo || !cierre.cicloNuevo}
              className="btn-sase-primary px-8 py-3 text-[10px] font-black bg-slate-800 border-slate-700 shadow-slate-200 disabled:opacity-30"
            >
              <span className="material-icons text-sm">analytics</span>
              INICIAR SIMULACIÓN
            </button>
          ) : (
            <>
              <button
                onClick={resetCierre}
                className="btn-sase-secondary px-6 py-3 text-[10px] font-black"
              >
                REINICIAR
              </button>
              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={cierre.ejecutando}
                className="btn-sase-primary px-10 py-3 text-[10px] font-black bg-rose-600 border-rose-500 shadow-rose-200"
              >
                <span className="material-icons text-sm">check_circle</span>
                {cierre.ejecutando ? "EJECUTANDO..." : "EJECUTAR CIERRE DEFINITIVO"}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 flex-1 overflow-hidden">
        {/* Left Sidebar: Ciclos e Info */}
        <div className="col-span-3 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          {/* Ciclo Activo Card */}
          <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Ciclo Actual</h3>
            {cierre.cicloActivo ? (
              <>
                <p className="text-2xl font-black text-slate-800 italic tracking-tighter mb-1">{cierre.cicloActivo.nombre}</p>
                <p className="text-[10px] font-bold text-emerald-600 uppercase">Estado: ACTIVO / ABIERTO</p>
              </>
            ) : (
              <p className="text-xs font-bold text-slate-400 italic">No hay ciclo activo</p>
            )}
          </div>

          {/* Ciclo Nuevo Card */}
          <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Ciclo de Destino</h3>
            {cierre.cicloNuevo ? (
              <>
                <p className="text-2xl font-black text-slate-800 italic tracking-tighter mb-1">{cierre.cicloNuevo.nombre}</p>
                <p className="text-[10px] font-bold text-blue-600 uppercase">Estado: PREPARADO</p>
              </>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Ej: 2026-2027"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:border-blue-500"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                />
                <button
                  onClick={handleCrearCiclo}
                  className="w-full py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-colors"
                >
                  CREAR CICLO NUEVO
                </button>
              </div>
            )}
          </div>

          {/* Resumen Simulación */}
          {cierre.simulado && (
            <div className="p-6 bg-slate-800 rounded-3xl shadow-2xl relative overflow-hidden">
               <div className="absolute -right-4 -bottom-4 size-24 bg-white/5 rounded-full blur-2xl" />
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Proyección de Resultados</h3>
               <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-[24px] font-black text-emerald-400 italic tabular-nums leading-none">{stats.promovidos}</span>
                    <span className="text-[8px] font-black text-slate-400 uppercase mt-1">PROMOVIDOS</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[24px] font-black text-blue-400 italic tabular-nums leading-none">{stats.egresados}</span>
                    <span className="text-[8px] font-black text-slate-400 uppercase mt-1">EGRESADOS</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[24px] font-black text-rose-400 italic tabular-nums leading-none">{stats.retenidos}</span>
                    <span className="text-[8px] font-black text-slate-400 uppercase mt-1">RETENIDOS</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[24px] font-black text-amber-400 italic tabular-nums leading-none">{stats.bajas}</span>
                    <span className="text-[8px] font-black text-slate-400 uppercase mt-1">BAJAS FALTAS</span>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Right Panel: Tabla de Alumnos */}
        <div className="col-span-9 bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/50 shadow-xl overflow-hidden flex flex-col">
          {!cierre.simulado ? (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
              <div className="size-24 bg-rose-50 rounded-full flex items-center justify-center mb-6">
                <span className="material-icons text-4xl text-rose-200">lock_reset</span>
              </div>
              <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-widest mb-2">Módulo en Espera</h2>
              <p className="text-xs font-bold text-slate-400 max-w-sm leading-relaxed uppercase">
                Configure el ciclo de destino y presione "Iniciar Simulación" para previsualizar los resultados del cierre.
              </p>
            </div>
          ) : (
            <>
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">Previsualización de Alumnos ({cierre.simulacion.length})</h2>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                       <span className="size-2 rounded-full bg-emerald-500" />
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Automático</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="size-2 rounded-full bg-blue-500" />
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Manual</span>
                    </div>
                 </div>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                    <tr className="border-b border-slate-100">
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Alumno</th>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Situación</th>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Promedio</th>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Asistencia</th>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Decisión</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {cierre.simulacion.map((s) => {
                      const decision = cierre.overrides[s.alumnoId] || s.decisionSugerida;
                      const isOverridden = !!cierre.overrides[s.alumnoId];
                      
                      return (
                        <tr key={s.alumnoId} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <p className="text-[11px] font-bold text-slate-800 uppercase">{s.nombre}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase">{s.grado}º {s.grupo}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-1">
                              {s.bap && <span className="text-[8px] font-black bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">BAP</span>}
                              {s.incidencias > 0 && <span className="text-[8px] font-black bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded">INC: {s.incidencias}</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-black italic tabular-nums ${s.promedio < 6 ? "text-rose-600" : "text-slate-800"}`}>
                              {s.promedio.toFixed(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className={`text-[10px] font-black italic ${s.faltas >= 21 ? "text-rose-600" : "text-slate-500"}`}>
                                {s.faltas} Faltas
                              </span>
                              {s.faltasConsecutivas > 3 && (
                                <span className="text-[8px] font-bold text-rose-400 uppercase">ALERTA CONSECUTIVA</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={decision}
                              onChange={(e) => setOverride(s.alumnoId, e.target.value as DecisionPromocion)}
                              className={`text-[10px] font-black uppercase rounded-lg px-3 py-1.5 border transition-all outline-none ${
                                isOverridden ? "border-blue-200 bg-blue-50 text-blue-700 shadow-sm" : 
                                decision === "promover" ? "border-emerald-100 bg-emerald-50 text-emerald-700" :
                                decision === "egresar" ? "border-blue-100 bg-blue-50 text-blue-700" :
                                decision === "retener" ? "border-rose-100 bg-rose-50 text-rose-700" :
                                "border-amber-100 bg-amber-50 text-amber-700"
                              }`}
                            >
                              <option value="promover">PROMOVER</option>
                              <option value="retener">RETENER</option>
                              <option value="egresar">EGRESAR</option>
                              <option value="baja">BAJA</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[40px] p-10 max-w-lg w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-rose-600" />
              <div className="flex items-center gap-4 mb-6">
                <div className="size-14 rounded-2xl bg-rose-50 flex items-center justify-center">
                  <span className="material-icons text-rose-600 text-3xl">warning</span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">Acción Irreversible</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocolo de Cierre de Ciclo</p>
                </div>
              </div>

              <div className="space-y-4 mb-10">
                 <p className="text-sm font-medium text-slate-600 leading-relaxed">
                   Está a punto de cerrar el ciclo <span className="font-black text-slate-800">{cierre.cicloActivo?.nombre}</span> y promover a los alumnos al ciclo <span className="font-black text-slate-800">{cierre.cicloNuevo?.nombre}</span>.
                 </p>
                 <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-[11px] font-bold text-slate-500">
                       <span className="material-icons text-xs text-rose-400">check_circle</span>
                       Se crearán registros históricos para {stats.promovidos + stats.egresados + stats.retenidos} alumnos.
                    </li>
                    <li className="flex items-start gap-2 text-[11px] font-bold text-slate-500">
                       <span className="material-icons text-xs text-rose-400">check_circle</span>
                       El ciclo actual quedará en modo LECTURA DEFINITIVA.
                    </li>
                    <li className="flex items-start gap-2 text-[11px] font-bold text-slate-500">
                       <span className="material-icons text-xs text-rose-400">check_circle</span>
                       Se generará un log de auditoría institucional.
                    </li>
                 </ul>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  CANCELAR
                </button>
                <button
                  onClick={() => {
                    ejecutarPromocion();
                    setShowConfirmModal(false);
                  }}
                  className="flex-1 py-4 bg-rose-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all"
                >
                  SÍ, EJECUTAR CIERRE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
