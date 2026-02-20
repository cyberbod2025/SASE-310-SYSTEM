import React, { useState } from "react";
import { useApp } from "../../store";
import { AppModule } from "../../types";

export const AgendaEscolar = () => {
  const { setCurrentModule } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date("2026-02-19")); // Febrero 2026

  return (
    <div className="flex-1 w-full space-y-6 animate-fade-in relative z-10 font-['Inter']">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-indigo-600">
            <span className="material-symbols-outlined text-3xl">
              calendar_month
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
              Agenda Escolar Digital
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                Planificación Estratégica
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-xs font-bold text-slate-400 uppercase">
                Ciclo 2025-2026
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setCurrentModule(AppModule.DASHBOARD)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Regresar al Tablero
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendario Mensual */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <h3 className="text-lg font-black text-slate-700 uppercase tracking-widest italic">
              Febrero de 2026
            </h3>
            <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-4 text-center">
            {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d) => (
              <div
                key={d}
                className="text-[10px] font-black text-slate-400 uppercase tracking-wider py-2"
              >
                {d}
              </div>
            ))}
            {/* Mock Days - Starting Feb 2026 roughly */}
            {Array.from({ length: 28 }).map((_, i) => {
              const day = i + 1;
              const isToday = day === 19;
              const hasEvent = day === 20 || day === 24;
              return (
                <div
                  key={i}
                  className={`
                                aspect-square rounded-xl flex flex-col items-center justify-center relative cursor-pointer group transition-all
                                ${isToday ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105" : "hover:bg-slate-50 text-slate-600 border border-transparent hover:border-slate-200"}
                            `}
                >
                  <span
                    className={`text-sm font-bold ${isToday ? "text-white" : "text-slate-700"}`}
                  >
                    {day}
                  </span>
                  {hasEvent && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-1 ${isToday ? "bg-white" : "bg-rose-500"}`}
                    ></span>
                  )}

                  {/* Visual Add Button on Hover */}
                  {!isToday && (
                    <div className="absolute inset-0 bg-indigo-50/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition-opacity">
                      <span className="material-symbols-outlined text-indigo-600 text-lg">
                        add
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel Lateral: Eventos y Alertas */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-800 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="material-symbols-outlined text-9xl">
                notifications_active
              </span>
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest mb-6 relative z-10 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400">
                warning
              </span>
              Actividades del Día
            </h3>

            <div className="space-y-4 relative z-10">
              <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/10 flex gap-4">
                <div className="flex flex-col items-center justify-center bg-white/20 rounded-lg w-12 h-12 shrink-0">
                  <span className="text-xs font-black">FEB</span>
                  <span className="text-lg font-black">19</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm">Entrega de Planeaciones</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Límite: 14:00 hrs
                  </p>
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex gap-4 opacity-70">
                <div className="flex flex-col items-center justify-center bg-white/10 rounded-lg w-12 h-12 shrink-0">
                  <span className="text-xs font-black">FEB</span>
                  <span className="text-lg font-black">19</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm">
                    Junta de Consejo Técnico
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Sala de Maestros
                  </p>
                </div>
              </div>
            </div>

            <button className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">
                add_alert
              </span>
              Crear Nueva Alerta
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
              Tip Institucional
            </h3>
            <div className="flex gap-4">
              <span className="material-symbols-outlined text-emerald-500 text-3xl">
                lightbulb
              </span>
              <p className="text-xs text-slate-600 italic leading-relaxed">
                "Recuerda registrar tus actividades con al menos 48h de
                anticipación para la revisión directiva."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
