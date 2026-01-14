import React, { useState } from "react";
import { useApp } from "../store";
import toast from "react-hot-toast";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: "reunion" | "entrega" | "evento" | "evaluacion" | "festivo";
  description?: string;
}

const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: "1",
    title: "Consejo Técnico Escolar",
    date: "2024-01-26",
    time: "08:00",
    type: "reunion",
    description: "Análisis participativo de resultados.",
  },
  {
    id: "2",
    title: "Entrega de Evaluaciones",
    date: "2024-01-30",
    type: "entrega",
    description: "Periodo trimestral actual.",
  },
  {
    id: "3",
    title: "Ceremonia Cívica",
    date: "2024-01-22",
    time: "07:30",
    type: "evento",
    description: "Homenaje a la bandera.",
  },
  {
    id: "4",
    title: "Examen Recuperación",
    date: "2024-01-25",
    time: "10:30",
    type: "evaluacion",
    description: "Módulo Matemáticas.",
  },
];

export const Agenda: React.FC = () => {
  const { currentUserRole } = useApp();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(
    new Date().toISOString().split("T")[0]
  );
  const [events, setEvents] = useState<CalendarEvent[]>(MOCK_EVENTS);
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    date: new Date().toISOString().split("T")[0],
    type: "reunion",
  });

  const handleSaveEvent = () => {
    if (!newEvent.title || !newEvent.date) {
      toast.error("Complete los datos requeridos.");
      return;
    }
    setEvents([
      ...events,
      { ...newEvent, id: Date.now().toString() } as CalendarEvent,
    ]);
    toast.success("Actividad registrada institucionalmente.");
    setShowModal(false);
  };

  const days = (() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const arr = [];
    for (let i = 0; i < firstDay; i++) arr.push(null);
    for (let i = 1; i <= lastDate; i++) arr.push(new Date(year, month, i));
    return arr;
  })();

  const monthLabel = currentMonth.toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
  });
  const selectedDateEvents = events.filter((e) => e.date === selectedDate);

  const getDayStyle = (day: Date | null) => {
    if (!day) return "";
    const dateStr = day.toISOString().split("T")[0];
    const isToday = dateStr === new Date().toISOString().split("T")[0];
    const isSelected = dateStr === selectedDate;
    const hasEvents = events.some((e) => e.date === dateStr);

    if (isSelected)
      return "bg-blue-700 text-white shadow-lg shadow-blue-200 ring-4 ring-blue-50";
    if (isToday)
      return "bg-blue-50 text-blue-700 font-black border border-blue-100";
    return hasEvents
      ? "bg-slate-50 text-slate-800 font-bold border border-slate-100"
      : "text-slate-600 hover:bg-slate-50";
  };

  return (
    <div className="flex-1 w-full space-y-8 animate-fade-in font-sans">
      {/* Institutional Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="material-symbols-outlined text-blue-700 text-4xl">
              calendar_today
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3 uppercase italic">
              Agenda <span className="text-blue-700">Institucional</span>
            </h1>
            <div className="flex items-center gap-3 mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>Planificación Estratégica</span>
              <span className="text-slate-200">|</span>
              <span className="text-blue-600">Ciclo 2024-2025</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-100 flex items-center gap-3 active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">
            add_circle
          </span>
          Agendar Actividad
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Calendar Card */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() - 1
                    )
                  )
                }
                className="size-10 rounded-full hover:bg-white text-slate-400 hover:text-blue-700 transition-all border border-transparent hover:border-slate-200 flex items-center justify-center"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <h3 className="text-lg font-black text-slate-800 uppercase italic tracking-tighter w-48 text-center">
                {monthLabel}
              </h3>
              <button
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() + 1
                    )
                  )
                }
                className="size-10 rounded-full hover:bg-white text-slate-400 hover:text-blue-700 transition-all border border-transparent hover:border-slate-200 flex items-center justify-center"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="size-2 bg-blue-500 rounded-full"></span>
                <span className="text-[10px] font-black text-slate-400 uppercase">
                  Activo
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2 bg-slate-200 rounded-full"></span>
                <span className="text-[10px] font-black text-slate-400 uppercase">
                  Libre
                </span>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-7 gap-4 mb-4">
              {["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"].map((d) => (
                <div
                  key={d}
                  className="text-center text-[10px] font-black text-slate-400 tracking-widest"
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-4">
              {days.map((day, i) => (
                <button
                  key={i}
                  disabled={!day}
                  onClick={() =>
                    day && setSelectedDate(day.toISOString().split("T")[0])
                  }
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center text-sm transition-all relative ${getDayStyle(
                    day
                  )}`}
                >
                  {day?.getDate()}
                  {day &&
                    events.some(
                      (e) => e.date === day.toISOString().split("T")[0]
                    ) && (
                      <span className="absolute bottom-2 size-1 bg-current opacity-30 rounded-full"></span>
                    )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Activity Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm p-8 pb-10">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">event</span>
              Actividades del Día
            </h3>

            <div className="space-y-4">
              {selectedDateEvents.length === 0 ? (
                <div className="py-12 text-center">
                  <span className="material-symbols-outlined text-slate-200 text-5xl mb-4">
                    event_busy
                  </span>
                  <p className="text-[11px] font-black text-slate-400 uppercase italic">
                    Sin compromisos registrados
                  </p>
                </div>
              ) : (
                selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          event.type === "reunion"
                            ? "bg-blue-100 text-blue-700"
                            : event.type === "evaluacion"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {event.type}
                      </span>
                      {event.time && (
                        <span className="text-[10px] font-bold text-slate-400">
                          {event.time}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-black text-slate-800 uppercase italic group-hover:text-blue-700 transition-colors line-clamp-2">
                      {event.title}
                    </p>
                    {event.description && (
                      <p className="text-[10px] text-slate-500 mt-2 font-medium leading-relaxed italic border-t border-slate-200 pt-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50">
                <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">
                    lightbulb
                  </span>
                  Tip Institucional
                </p>
                <p className="text-[10px] text-blue-600/80 font-bold leading-relaxed italic">
                  Recuerda registrar tus actividades con al menos 48h de
                  anticipación para la revisión directiva.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Minimalista e Institucional */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-scale-up">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-black text-slate-800 uppercase italic tracking-tighter">
                Nueva Actividad
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="size-8 rounded-full border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-100 transition-all flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Título de la Actividad
                </label>
                <input
                  type="text"
                  autoFocus
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:italic placeholder:font-normal"
                  placeholder="Ej. Consejo Técnico Escolar..."
                  value={newEvent.title || ""}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    value={newEvent.date}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Horario
                  </label>
                  <input
                    type="time"
                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    value={newEvent.time || ""}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, time: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Descripción Breve
                </label>
                <textarea
                  className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:italic resize-none"
                  placeholder="Detalles institucionales..."
                  value={newEvent.description || ""}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                />
              </div>

              <button
                onClick={handleSaveEvent}
                className="w-full h-14 bg-blue-700 hover:bg-blue-800 text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-blue-100 transition-all mt-4 flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[20px]">
                  check_circle
                </span>
                Validar y Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
