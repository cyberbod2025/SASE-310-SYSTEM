import React from "react";
import toast from "react-hot-toast";
import { useApp } from "../../store";

export const DashboardUDEII = () => {
  const { students } = useApp();
  const studentsWithBAP = students.filter((s) => s.bapInfo?.hasBAP);

  return (
    <div className="flex-1 w-full space-y-8 animate-fade-in relative z-10 transition-all">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1 h-full bg-purple-500"></div>
            <img
              src="/assets/branding/UDEII.png"
              alt="UDEII"
              className="w-14 h-14 object-contain"
            />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              Educación Inclusiva (UDEII)
            </h1>
            <div className="flex items-center gap-3 mt-1 text-xs font-bold uppercase tracking-widest text-slate-500">
              <span className="flex items-center gap-1.5 text-purple-700">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                Inclusión y Equidad
              </span>
              <span className="text-slate-300">|</span>
              <span>Gestión de Barreras (BAP)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
            <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
            Alumnos en Seguimiento de Inclusión
          </h3>
          <button className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-md transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Nuevo Expediente
          </button>
        </div>

        {studentsWithBAP.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 border border-slate-200 border-dashed rounded-3xl bg-slate-50 gap-4">
            <div className="size-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 border border-slate-200">
              <span className="material-symbols-outlined text-4xl">
                accessibility
              </span>
            </div>
            <p className="text-slate-400 font-black uppercase text-xs tracking-widest">
              Sin expedientes de inclusión activos
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {studentsWithBAP.map((s) => (
              <div
                key={s.id}
                className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all border-l-4 border-l-purple-500 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-8 text-slate-50 group-hover:text-purple-50 transition-colors pointer-events-none">
                  <span className="material-symbols-outlined text-7xl font-light">
                    accessibility_new
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
                  <div className="flex items-center gap-5">
                    <img
                      src={s.avatar}
                      alt=""
                      className="size-16 rounded-2xl object-cover border-2 border-slate-100 shadow-sm"
                    />
                    <div>
                      <h4 className="font-black text-slate-800 text-2xl uppercase italic tracking-tighter">
                        {s.name}
                      </h4>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                          GRUPO: {s.group}
                        </span>
                        <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                          EXP: {s.id.substring(0, 8)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                  {/* Diagnóstico */}
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 group/box hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-purple-600 text-[20px]">
                        lock_person
                      </span>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Diagnóstico Especializado
                      </p>
                    </div>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed italic border-l-2 border-purple-200 pl-4 py-1">
                      {s.bapInfo?.diagnosisPrivate}
                    </p>
                  </div>

                  {/* Ajustes Razonables */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-emerald-600 text-[20px]">
                        task_alt
                      </span>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Ajustes Razonables Sugeridos
                      </p>
                    </div>
                    <ul className="space-y-2.5">
                      {s.bapInfo?.accommodations.map((acc, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 text-xs font-bold text-slate-600 bg-white border border-slate-100 p-3 rounded-xl shadow-sm"
                        >
                          <span className="size-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0"></span>
                          {acc}
                        </li>
                      ))}
                      <button
                        className="w-full flex items-center justify-center p-3 rounded-xl border-2 border-dashed border-slate-100 text-[10px] font-black text-slate-400 hover:text-purple-600 hover:border-purple-200 hover:bg-purple-50 transition-all uppercase gap-2"
                        onClick={() => {
                          const newAdj = prompt("Nuevo ajuste razonable:");
                          if (newAdj)
                            toast.success(
                              "Ajuste añadido al protocolo institucional."
                            );
                        }}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          add_circle
                        </span>
                        Añadir Ajuste
                      </button>
                    </ul>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end relative z-10">
                  <button className="px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black text-purple-700 uppercase tracking-widest shadow-sm transition-all flex items-center gap-2">
                    Consultar Bitácora de Inclusión
                    <span className="material-symbols-outlined text-[18px]">
                      arrow_right_alt
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
