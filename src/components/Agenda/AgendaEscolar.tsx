import React, { useState, useMemo } from "react";
import { useApp } from "../../store";
import { AppModule } from "../../types";
import toast from "react-hot-toast";

type EventType = "INSTITUCIONAL" | "CITA_PADRES" | "JCT" | "TODOS_MAESTROS";

interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  type: EventType;
  studentId?: string;
  time?: string;
  location?: string;
}

const mockInitialEvents: CalendarEvent[] = [
  {
    id: "1",
    date: "2026-02-19",
    title: "Entrega de Planeaciones",
    type: "INSTITUCIONAL",
    time: "14:00",
  },
  {
    id: "2",
    date: "2026-02-19",
    title: "Junta de Consejo Técnico",
    type: "JCT",
    location: "Sala de Maestros",
  },
  {
    id: "3",
    date: "2026-02-24",
    title: "Día de la Bandera - Ceremonia",
    type: "TODOS_MAESTROS",
    time: "08:00",
    location: "Patio Central",
  }
];

export const AgendaEscolar = () => {
  const { setCurrentModule, students } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date("2026-02-19"));
  const [events, setEvents] = useState<CalendarEvent[]>(mockInitialEvents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("2026-02-19");

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<EventType>("INSTITUCIONAL");
  const [newStudentId, setNewStudentId] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newLocation, setNewLocation] = useState("");

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const monthName = currentDate.toLocaleString('es-MX', { month: 'long', year: 'numeric' });
  
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getDayFormat = (day: number) => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    // Check local ISO formatting issues
    const mMatch = d.getMonth() + 1;
    const paddingMo = mMatch < 10 ? '0' + mMatch : mMatch;
    const paddingDa = day < 10 ? '0' + day : day;
    
    return `${d.getFullYear()}-${paddingMo}-${paddingDa}`;
  };

  const handleDayClick = (dayStr: string) => {
    setSelectedDate(dayStr);
    setIsModalOpen(true);
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    if (newType === "CITA_PADRES" && !newStudentId) {
      toast.error("Selecciona a un alumno para la cita con padres.");
      return;
    }

    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      date: selectedDate,
      title: newTitle,
      type: newType,
      studentId: newType === "CITA_PADRES" ? newStudentId : undefined,
      time: newTime,
      location: newLocation
    };

    setEvents(prev => [...prev, newEvent]);
    toast.success("Evento agendado exitosamente.");
    
    // Reset Form
    setIsModalOpen(false);
    setNewTitle("");
    setNewType("INSTITUCIONAL");
    setNewStudentId("");
    setNewTime("");
    setNewLocation("");
  };

  // Get active events for the current selected or viewed context
  const upcomingEvents = useMemo(() => {
    return [...events]
      .filter(e => new Date(e.date) >= new Date("2026-02-01"))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events]);

  const getEventColor = (type: EventType) => {
    switch (type) {
      case "INSTITUCIONAL": return "bg-indigo-500 text-indigo-50 border-indigo-500";
      case "JCT": return "bg-rose-500 text-rose-50 border-rose-500";
      case "CITA_PADRES": return "bg-amber-500 text-amber-50 border-amber-500";
      case "TODOS_MAESTROS": return "bg-emerald-500 text-emerald-50 border-emerald-500";
      default: return "bg-blue-500 text-blue-50 border-blue-500";
    }
  };

  const getEventDotColor = (type: EventType) => {
    switch (type) {
      case "INSTITUCIONAL": return "bg-indigo-500";
      case "JCT": return "bg-rose-500";
      case "CITA_PADRES": return "bg-amber-500";
      case "TODOS_MAESTROS": return "bg-emerald-500";
      default: return "bg-blue-500";
    }
  };

  const getTypeLabel = (type: EventType) => {
    switch (type) {
      case "INSTITUCIONAL": return "Institucional";
      case "JCT": return "Junta C.T.";
      case "CITA_PADRES": return "Cita Padres";
      case "TODOS_MAESTROS": return "Magisterial";
      default: return "Evento";
    }
  };

  return (
    <div className="flex-1 w-full space-y-6 animate-fade-in relative z-10 font-['Inter']">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-white/10 gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
            <span className="material-icons text-3xl">calendar_month</span>
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Agenda Escolar Digital</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Planificación Estratégica</span>
              <span className="text-slate-600">|</span>
              <span className="text-xs font-bold text-slate-400 uppercase">Ciclo 2025-2026</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setCurrentModule(AppModule.DASHBOARD)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-xs font-bold uppercase text-slate-300 hover:bg-white/5 hover:text-white transition-colors backdrop-blur-md"
        >
          <span className="material-icons">arrow_back</span>
          Regresar
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Calendario Mensual */}
        <div className="xl:col-span-8 card-sase bg-[#0F111A]/80 border-white/5 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-600/[0.03] blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <div className="flex justify-between items-center mb-8 relative z-10">
            <button onClick={handlePrevMonth} className="p-2 border border-white/10 hover:bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-all">
              <span className="material-icons">chevron_left</span>
            </button>
            <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-widest italic drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              {monthName}
            </h3>
            <button onClick={handleNextMonth} className="p-2 border border-white/10 hover:bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-all">
              <span className="material-icons">chevron_right</span>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 md:gap-4 text-center relative z-10">
            {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d) => (
              <div key={d} className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                {d}
              </div>
            ))}
            
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = getDayFormat(day);
              const dayEvents = events.filter(e => e.date === dateStr);
              // Calculate real today for matching
              const realToday = new Date();
              const mMatch = realToday.getMonth() + 1;
              const paddingMo = mMatch < 10 ? '0' + mMatch : mMatch;
              const paddingDa = realToday.getDate() < 10 ? '0' + realToday.getDate() : realToday.getDate();
              const realTodayStr = `${realToday.getFullYear()}-${paddingMo}-${paddingDa}`;

              const isToday = dateStr === realTodayStr; // True today equivalent
              
              return (
                <div
                  key={i}
                  onClick={() => handleDayClick(dateStr)}
                  className={`
                      aspect-square rounded-2xl flex flex-col items-center justify-start pt-2 md:pt-4 relative cursor-pointer group transition-all border
                      ${isToday 
                        ? "bg-amber-500/10 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.1)]" 
                        : "bg-white/[0.02] border-white/5 hover:border-amber-500/30 hover:bg-amber-500/5"}
                  `}
                >
                  <span className={`text-sm md:text-lg font-black ${isToday ? "text-amber-400" : "text-slate-300"}`}>
                    {day}
                  </span>
                  
                  {/* Event Dots */}
                  <div className="flex gap-1 mt-2">
                    {dayEvents.slice(0,3).map(ev => (
                      <span key={ev.id} className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${getEventDotColor(ev.type)} shadow-[0_0_5px_currentColor]`}></span>
                    ))}
                    {dayEvents.length > 3 && <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-slate-500 text-[8px] flex items-center justify-center text-white">+</span>}
                  </div>

                  <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-2xl transition-opacity">
                    <span className="material-icons text-amber-400 text-2xl drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">add</span>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-8 flex flex-wrap gap-4 items-center justify-center p-4 rounded-xl border border-white/5 bg-white/[0.02] relative z-10">
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_5px_currentColor]"></span><span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Institucional</span></div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_5px_currentColor]"></span><span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Junta C.T.</span></div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_5px_currentColor]"></span><span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Citas</span></div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_currentColor]"></span><span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Magisterial</span></div>
          </div>
        </div>

        {/* Panel Lateral */}
        <div className="xl:col-span-4 space-y-6">
          <div className="card-sase border-amber-500/20 bg-amber-500/[0.02] p-6 relative overflow-hidden h-full flex flex-col">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <span className="material-icons text-[100px] text-amber-500">event_note</span>
            </div>
            
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] mb-6 relative z-10 flex items-center gap-3 text-amber-500 italic">
              <span className="size-2 bg-amber-500 rounded-full animate-ping"></span>
              Próximos Eventos
            </h3>

            <div className="space-y-4 relative z-10 flex-1 overflow-y-auto custom-scrollbar pr-2">
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-slate-500 font-bold italic text-center mt-10">No hay eventos próximos.</p>
              ) : (
                upcomingEvents.map(ev => {
                  const evDateParts = ev.date.split('-');
                  const evDateObj = new Date(parseInt(evDateParts[0]), parseInt(evDateParts[1])-1, parseInt(evDateParts[2]));
                  const month = evDateObj.toLocaleString('es-MX', { month: 'short' }).toUpperCase();
                  const day = evDateParts[2];
                  
                  return (
                    <div key={ev.id} className="p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] transition-colors flex gap-4 group cursor-default">
                      <div className={`flex flex-col items-center justify-center rounded-xl w-14 h-14 shrink-0 border ${getEventColor(ev.type)} shadow-inner`}>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{month}</span>
                        <span className="text-xl font-black">{day}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-black text-sm text-white truncate group-hover:text-amber-400 transition-colors uppercase tracking-tight">{ev.title}</h4>
                        </div>
                        <p className="text-[10px] font-black text-slate-500 uppercase mt-1">
                          {getTypeLabel(ev.type)} {ev.time && ` | ${ev.time}`}
                        </p>
                        {ev.studentId && (
                           <p className="text-xs text-slate-400 font-medium truncate mt-1">
                             Alumno: {students.find((s:any) => s.id === ev.studentId)?.name || 'Desconocido'}
                           </p>
                        )}
                        {ev.location && (
                           <p className="text-[10px] text-slate-500 uppercase mt-1 flex items-center gap-1">
                             <span className="material-icons text-[12px]">location_on</span>
                             {ev.location}
                           </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <button 
              onClick={() => {
                const today = new Date();
                const mMatch = today.getMonth() + 1;
                const paddingMo = mMatch < 10 ? '0' + mMatch : mMatch;
                const paddingDa = today.getDate() < 10 ? '0' + today.getDate() : today.getDate();
                handleDayClick(`${today.getFullYear()}-${paddingMo}-${paddingDa}`);
              }}
              className="mt-6 w-full py-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] flex items-center justify-center gap-3 relative z-10"
            >
              <span className="material-icons text-sm md:text-lg">event_available</span>
              Agendar Nuevo Evento
            </button>
          </div>
        </div>
      </div>

      {/* Modal para Crear Evento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative z-10 w-full max-w-lg card-sase p-6 md:p-8 animate-fade-in-up border-amber-500/30 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-white/5 rounded-full hover:bg-white/10 transition-colors"
            >
              <span className="material-icons">close</span>
            </button>
            
            <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-1 mt-2">Registrar Evento</h3>
            <p className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-4">
              Fecha Seleccionada: {selectedDate}
            </p>

            <form onSubmit={handleAddEvent} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">SINTAXIS DEL EVENTO</label>
                <input 
                  type="text" 
                  autoFocus
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Ej. Análisis de Trayectorias"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">CLASIFICACIÓN</label>
                  <select 
                    value={newType}
                    onChange={e => setNewType(e.target.value as EventType)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all font-bold appearance-none cursor-pointer"
                  >
                    <option value="INSTITUCIONAL" className="bg-slate-900">Institucional</option>
                    <option value="CITA_PADRES" className="bg-slate-900">Cita con Padres</option>
                    <option value="JCT" className="bg-slate-900">Junta Consejo Técnico</option>
                    <option value="TODOS_MAESTROS" className="bg-slate-900">Magisterial (Todos)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">HORA (OPCIONAL)</label>
                  <input 
                    type="time" 
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all font-bold"
                  />
                </div>
              </div>

              {newType === "CITA_PADRES" && (
                <div className="animate-fade-in">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ALUMNO / MATRÍCULA</label>
                  <select
                    value={newStudentId}
                    onChange={e => setNewStudentId(e.target.value)}
                    required
                    className="w-full bg-slate-900/50 border border-amber-500/30 rounded-xl px-4 py-3 text-amber-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-bold appearance-none cursor-pointer ring-1 ring-amber-500/10"
                  >
                    <option value="" disabled>-- SELECCIONA AL ALUMNO --</option>
                    {students.map((s:any) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.matricula})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">LOCACIÓN (OPCIONAL)</label>
                <input 
                  type="text" 
                  value={newLocation}
                  onChange={e => setNewLocation(e.target.value)}
                  placeholder="Ej. Oficina de Dirección, Patio Central"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all font-bold cursor-text"
                />
              </div>

              <div className="pt-4 border-t border-white/5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                >
                  Confirmar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
