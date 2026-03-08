import React, { useState, useEffect } from "react";
import { useApp } from "../store";
import { useAuth } from "./AuthProvider";
import toast from "react-hot-toast";
import { CICLO_ESCOLAR } from "../config/sase.config";
import { supabase } from "../supabase/client";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type:
    | "reunion"
    | "entrega"
    | "evento"
    | "evaluacion"
    | "festivo"
    | "cita_padres"
    | "jct"
    | "institucional"
    | "otro";
  description?: string;
  alumno_id?: string;
  alumno_nombre?: string;
  para_todos_maestros?: boolean;
}

const TYPE_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string; icon: string }
> = {
  institucional: {
    label: "Evento Institucional",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
    icon: "account_balance",
  },
  cita_padres: {
    label: "Cita con Padres",
    color: "text-pink-600",
    bg: "bg-pink-50",
    border: "border-pink-100",
    icon: "family_restroom",
  },
  jct: {
    label: "Consejo Técnico (JCT)",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
    icon: "groups",
  },
  reunion: {
    label: "Reunión de Plantilla",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    icon: "school",
  },
  entrega: {
    label: "Entrega de Boletas",
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-100",
    icon: "description",
  },
  evento: {
    label: "Actividad Cultural",
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    border: "border-cyan-100",
    icon: "celebration",
  },
  evaluacion: {
    label: "Periodo Evaluación",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
    icon: "fact_check",
  },
  festivo: {
    label: "Suspensión Labores",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-100",
    icon: "flag",
  },
  otro: {
    label: "Otros",
    color: "text-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-100",
    icon: "event",
  },
};

export const Agenda: React.FC = () => {
  const { user } = useAuth();
  const { students } = useApp();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(
    new Date().toISOString().split("T")[0],
  );
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    date: new Date().toISOString().split("T")[0],
    type: "reunion",
    para_todos_maestros: false,
  });

  const [searchTerm, setSearchTerm] = useState("");

  // Fetch events from Supabase
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("eventos")
          .select("*, alumnos(nombre_completo)")
          .order("fecha", { ascending: true });

        if (error) {
          console.error("Error fetching events:", error);
          toast.error("Error al cargar la agenda.");
          return;
        }

        if (data) {
          const mappedEvents: CalendarEvent[] = data.map((e: any) => ({
            id: e.id,
            title: e.titulo,
            date: e.fecha,
            time: e.hora ? e.hora.slice(0, 5) : undefined,
            type: e.tipo as any,
            description: e.descripcion,
            alumno_id: e.alumno_id,
            alumno_nombre: e.alumnos?.nombre_completo,
            para_todos_maestros: e.para_todos_maestros,
          }));
          setEvents(mappedEvents);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleSaveEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.type) {
      toast.error("Complete los datos requeridos.");
      return;
    }

    if (newEvent.type === "cita_padres" && !newEvent.alumno_id) {
      toast.error("Debe seleccionar un alumno para la cita con padres.");
      return;
    }

    const eventToSave = {
      titulo: newEvent.title,
      fecha: newEvent.date,
      hora: newEvent.time || null,
      tipo: newEvent.type,
      descripcion: newEvent.description || null,
      creado_por: user?.id,
      alumno_id: newEvent.alumno_id || null,
      para_todos_maestros: newEvent.para_todos_maestros || false,
    };

    try {
      const { data, error } = await supabase
        .from("eventos")
        .insert([eventToSave])
        .select("*, alumnos(nombre_completo)")
        .single();

      if (error) {
        console.error("Error saving event:", error);
        toast.error("Error al guardar: " + error.message);
        return;
      }

      const savedEvent: CalendarEvent = {
        id: (data as any).id,
        title: (data as any).titulo,
        date: (data as any).fecha,
        time: (data as any).hora ? (data as any).hora.slice(0, 5) : undefined,
        type: (data as any).tipo as any,
        description: (data as any).descripcion,
        alumno_id: (data as any).alumno_id,
        alumno_nombre: (data as any).alumnos?.nombre_completo,
        para_todos_maestros: (data as any).para_todos_maestros,
      };

      setEvents((prev) => [...prev, savedEvent]);
      toast.success("Actividad registrada institucionalmente.");
      setShowModal(false);
      setNewEvent({
        date: new Date().toISOString().split("T")[0],
        type: "reunion",
        para_todos_maestros: false,
      });
      setSearchTerm("");
    } catch (err) {
      console.error("Unexpected error saving event:", err);
      toast.error("Error inesperado al guardar actividad.");
    }
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

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
            <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase italic tracking-tighter">
              Agenda Escolar
            </h2>
            <div className="flex items-center gap-3 mt-1 text-[11px] font-black uppercase tracking-widest text-slate-500">
              <span>Planificación Estratégica</span>
              <span className="text-slate-200">|</span>
              <span className="text-blue-600">
                Ciclo {CICLO_ESCOLAR.labelCorto}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setShowModal(true);
          }}
          className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center gap-3 active:scale-95 relative z-20 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">
            add_circle
          </span>
          Agendar Actividad
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Calendar Card */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm flex flex-col">
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() - 1,
                    ),
                  )
                }
                className="size-10 rounded-full hover:bg-white text-slate-400 hover:text-blue-700 transition-all border border-transparent hover:border-slate-200 flex items-center justify-center"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <h3 className="text-lg font-black text-slate-800 uppercase italic tracking-tighter w-48 text-center capitalize">
                {monthLabel}
              </h3>
              <button
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() + 1,
                    ),
                  )
                }
                className="size-10 rounded-full hover:bg-white text-slate-400 hover:text-blue-700 transition-all border border-transparent hover:border-slate-200 flex items-center justify-center"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
            <div className="hidden md:flex items-center gap-4">
              {Object.entries(TYPE_CONFIG)
                .slice(0, 4)
                .map(([key, cfg]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className={`size-2 ${cfg.bg} ${cfg.border} border rounded-full`}></span>
                    <span className="text-[10px] font-black text-slate-500 uppercase">
                      {cfg.label}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-7 gap-4 mb-4">
              {["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"].map((d) => (
                <div
                  key={d}
                  className="text-center text-xs font-black text-slate-500 tracking-widest"
                >
                  {d}
                </div>
              ))}
            </div>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-4">
                {days.map((day, i) => (
                  <button
                    key={i}
                    disabled={!day}
                    onClick={() =>
                      day && setSelectedDate(day.toISOString().split("T")[0])
                    }
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center text-sm transition-all relative ${getDayStyle(
                      day,
                    )}`}
                  >
                    {day?.getDate()}
                    {day &&
                      events.some(
                        (e) => e.date === day.toISOString().split("T")[0],
                      ) && (
                        <div className="absolute bottom-2 flex gap-0.5">
                          {events
                            .filter(
                              (e) => e.date === day.toISOString().split("T")[0],
                            )
                            .slice(0, 3)
                            .map((e, idx) => (
                              <span
                                key={idx}
                                className={`size-1 rounded-full ${TYPE_CONFIG[e.type]?.color.replace('text-', 'bg-') || "bg-slate-400"}`}
                              ></span>
                            ))}
                        </div>
                      )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected Activity Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm p-8 pb-10 min-h-[500px]">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-blue-700">
                event
              </span>
              Actividades del Día
            </h3>

            <div className="space-y-4">
              {loading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-16 bg-slate-100 rounded-2xl"></div>
                  <div className="h-16 bg-slate-100 rounded-2xl"></div>
                </div>
              ) : selectedDateEvents.length === 0 ? (
                <div className="py-20 text-center">
                  <span className="material-symbols-outlined text-slate-100 text-6xl mb-4">
                    event_busy
                  </span>
                  <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest italic">
                    Agenda libre de compromisos
                  </p>
                </div>
              ) : (
                selectedDateEvents.map((event) => {
                  const cfg = TYPE_CONFIG[event.type] || TYPE_CONFIG.reunion;
                  return (
                    <div
                      key={event.id}
                      className={`p-5 rounded-[1.5rem] border ${cfg.border} ${cfg.bg} group hover:scale-[1.02] transition-all cursor-pointer shadow-sm shadow-black/5`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className={`flex items-center gap-2 ${cfg.color}`}>
                          <span className="material-symbols-outlined text-[16px]">
                            {cfg.icon}
                          </span>
                          <span className="text-[9px] font-black uppercase tracking-wider">
                            {cfg.label}
                          </span>
                        </div>
                        {event.time && (
                          <span className="text-[10px] font-black text-slate-400 bg-white/50 px-2 py-0.5 rounded-full border border-white/80">
                            {event.time}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-black text-slate-800 uppercase italic tracking-tight mb-2">
                        {event.title}
                      </p>
                      {event.alumno_nombre && (
                        <div className="flex items-center gap-2 mb-2 bg-white/40 p-2 rounded-xl border border-white/60">
                          <span className="material-symbols-outlined text-emerald-600 text-xs">
                            person
                          </span>
                          <span className="text-[10px] font-bold text-emerald-800">
                            Alumno: {event.alumno_nombre}
                          </span>
                        </div>
                      )}
                      {event.para_todos_maestros && (
                        <div className="flex items-center gap-2 mb-2 bg-indigo-500/10 p-2 rounded-xl border border-indigo-500/20">
                          <span className="material-symbols-outlined text-indigo-600 text-xs">
                            notifications_active
                          </span>
                          <span className="text-[9px] font-black text-indigo-700 uppercase">
                            Notificar a plantilla docente
                          </span>
                        </div>
                      )}
                      {event.description && (
                        <p className="text-[10px] text-slate-600 mt-2 font-medium leading-relaxed italic border-t border-black/5 pt-3">
                          {event.description}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Premium e Institucional */}
      {showModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20 animate-scale-up">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="bg-blue-700 p-2 rounded-xl text-white">
                  <span className="material-symbols-outlined text-lg">
                    edit_calendar
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">
                  Nueva Actividad Institucional
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="size-10 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-100 transition-all flex items-center justify-center shadow-sm"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-8 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                  Nombre de la Actividad
                </label>
                <input
                  type="text"
                  autoFocus
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:italic placeholder:font-normal"
                  placeholder="Ej. Reunión de Consejo Técnico..."
                  value={newEvent.title || ""}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    value={newEvent.date}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                    Horario
                  </label>
                  <input
                    type="time"
                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    value={newEvent.time || ""}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, time: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                  Categoría de Actividad
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        setNewEvent({
                          ...newEvent,
                          type: key as any,
                          para_todos_maestros:
                            key === "institucional" || key === "jct"
                              ? true
                              : newEvent.para_todos_maestros,
                        })
                      }
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                        newEvent.type === key
                          ? `${cfg.bg} ${cfg.border} ${cfg.color} ring-2 ring-current ring-offset-2 scale-95`
                          : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">
                        {cfg.icon}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-tight">
                        {cfg.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {newEvent.type === "cita_padres" && (
                <div className="space-y-2 animate-fade-in opacity-100">
                  <label className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] ml-1">
                    Vincular Alumno (Cita con Padres)
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-3.5 text-slate-400 text-lg">
                      search
                    </span>
                    <input
                      type="text"
                      className="w-full h-12 bg-emerald-50/30 border border-emerald-200 rounded-xl pl-12 pr-4 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                      placeholder="Buscar alumno..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  {searchTerm && (
                    <div className="bg-white border border-slate-200 rounded-xl mt-1 max-h-40 overflow-y-auto shadow-xl relative z-[120]">
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              setNewEvent({
                                ...newEvent,
                                alumno_id: s.id,
                                alumno_nombre: s.name,
                              });
                              setSearchTerm("");
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 transition-colors border-b border-slate-50 last:border-0"
                          >
                            <img
                              src={s.avatar}
                              className="size-8 rounded-lg object-cover"
                              alt=""
                            />
                            <div>
                              <p className="text-xs font-black text-slate-800 uppercase italic">
                                {s.name}
                              </p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">
                                {s.group} • {s.matricula}
                              </p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase italic">
                          No se encontraron alumnos
                        </div>
                      )}
                    </div>
                  )}
                  {newEvent.alumno_nombre && (
                    <div className="mt-2 flex items-center justify-between bg-emerald-50 p-3 rounded-xl border border-emerald-100 italic">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-600 text-sm">
                          person_check
                        </span>
                        <span className="text-xs font-black text-emerald-800 uppercase">
                          {newEvent.alumno_nombre}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setNewEvent({
                            ...newEvent,
                            alumno_id: undefined,
                            alumno_nombre: undefined,
                          })
                        }
                        className="text-emerald-400 hover:text-emerald-600 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">
                          cancel
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div 
                className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors cursor-pointer" 
                onClick={() => setNewEvent({ ...newEvent, para_todos_maestros: !newEvent.para_todos_maestros })}
              >
                <div className={`size-6 rounded-lg flex items-center justify-center border-2 transition-all ${newEvent.para_todos_maestros ? 'bg-blue-600 border-blue-600 scale-110 shadow-lg shadow-blue-600/20' : 'bg-white border-slate-200'}`}>
                  {newEvent.para_todos_maestros && <span className="material-symbols-outlined text-white text-[16px]">check</span>}
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none">Notificar a toda la plantilla docente</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Este evento se registrará en la agenda de todos los maestros.</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                  Notas de Referencia
                </label>
                <textarea
                  className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl p-5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:italic resize-none"
                  placeholder="Instrucciones o detalles clave..."
                  value={newEvent.description || ""}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-14 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveEvent}
                  className="flex-[2] h-14 bg-blue-700 hover:bg-blue-800 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    check_circle
                  </span>
                  Agendar Actividad
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
