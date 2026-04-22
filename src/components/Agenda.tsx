import React, { useState, useEffect } from "react";
import { useApp } from "../store";
import { useAuth } from "./AuthProvider";
import toast from "react-hot-toast";
import { UserRole } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import { CICLO_ESCOLAR } from "../config/sase.config";
import { supabase } from "../supabase/client";
import { GlassCard } from "./ui/GlassCard";
import { GlassButton } from "./ui/GlassButton";
import { GlassInput } from "./ui/GlassInput";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: "reunion" | "entrega" | "evento" | "evaluacion" | "festivo" | "cita_padres" | "jct" | "institucional" | "otro";
  description?: string;
  alumno_id?: string;
  alumno_nombre?: string;
  para_todos_maestros?: boolean;
}

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: string }> = {
  institucional: { label: "Evento Institucional", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", icon: "account_balance" },
  cita_padres: { label: "Cita con Padres", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100", icon: "family_restroom" },
  jct: { label: "Consejo Técnico (JCT)", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", icon: "groups" },
  reunion: { label: "Reunión de Plantilla", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", icon: "school" },
  entrega: { label: "Entrega de Boletas", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100", icon: "description" },
  evento: { label: "Actividad Cultural", color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-100", icon: "celebration" },
  evaluacion: { label: "Periodo Evaluación", color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100", icon: "fact_check" },
  festivo: { label: "Suspensión Labores", color: "text-red-600", bg: "bg-red-50", border: "border-red-100", icon: "flag" },
  otro: { label: "Otros", color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-100", icon: "event" },
};

const AUTO_TITLED_TYPES = new Set(Object.keys(TYPE_CONFIG).filter((key) => key !== "otro"));

const getDefaultTitleForType = (type?: string) => {
  if (!type || type === "otro") {
    return "";
  }

  return TYPE_CONFIG[type]?.label || "";
};

export const Agenda: React.FC = () => {
  const { user } = useAuth();
  const { students, addNotification, setIsAssistantOpen, setAssistantSuggestion } = useApp() as {
    students: any[];
    addNotification?: (payload: any, options?: any) => Promise<boolean> | boolean | void;
    setIsAssistantOpen?: (open: boolean) => void;
    setAssistantSuggestion?: (payload: any) => void;
  };
  const [isSendingNotif, setIsSendingNotif] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(new Date().toISOString().split("T")[0]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    date: new Date().toISOString().split("T")[0],
    type: "reunion",
    title: getDefaultTitleForType("reunion"),
    para_todos_maestros: false,
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchEvents();
    
    // Proactive Sasito help
    if (typeof setIsAssistantOpen === "function") {
      setIsAssistantOpen(true);
    }

    if (typeof setAssistantSuggestion === "function") {
      setAssistantSuggestion({
        text: "¡Hola! Esta es la Agenda Institucional. ¿Sabías que al agendar un citatorio desde el Registro Rápido, aparecerá automáticamente aquí?",
        state: "attention"
      });
    }
  }, [setIsAssistantOpen, setAssistantSuggestion]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("eventos").select("*, alumnos(nombre_completo)").order("fecha", { ascending: true });
      if (!error && data) {
        setEvents(data.map((e: any) => ({
          id: e.id, title: e.titulo, date: e.fecha, time: e.hora?.slice(0, 5), type: e.tipo as any,
          description: e.descripcion, alumno_id: e.alumno_id, alumno_nombre: e.alumnos?.nombre_completo, para_todos_maestros: e.para_todos_maestros,
        })));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTypeSelect = (type: CalendarEvent["type"]) => {
    setNewEvent((prev) => ({
      ...prev,
      type,
      title: type === "otro" ? "" : getDefaultTitleForType(type),
    }));
  };

  const sendAgendaNotification = async (event: Pick<CalendarEvent, "title" | "date" | "time">) => {
    if (typeof addNotification !== "function") {
      return { successCount: 0, attempted: 0 };
    }

    const teacherRoles = [UserRole.DOCENTE, UserRole.DOCENTE_TUTOR];
    const formattedDate = new Date(event.date).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    const timeLabel = event.time ? ` a las ${event.time}` : "";

    const results = await Promise.all(
      teacherRoles.map((role) =>
        addNotification(
          {
            title: `Agenda: ${event.title}`,
            message: `${event.title} programado para el ${formattedDate}${timeLabel}.`,
            type: "SYSTEM",
            targetRole: role,
          },
          { silent: true },
        ),
      ),
    );

    const successCount = results.filter(Boolean).length;
    return { successCount, attempted: teacherRoles.length };
  };

  const handleSaveEvent = async () => {
    const finalTitle = AUTO_TITLED_TYPES.has(newEvent.type || "")
      ? getDefaultTitleForType(newEvent.type)
      : (newEvent.title || "").trim();

    if (!finalTitle || !newEvent.date || !newEvent.type) return toast.error("Complete los datos requeridos");

    try {
      const { error } = await supabase.from("eventos").insert([{
        titulo: finalTitle, fecha: newEvent.date, hora: newEvent.time || null, tipo: newEvent.type,
        descripcion: newEvent.description || null, creado_por: user?.id, alumno_id: newEvent.alumno_id || null, para_todos_maestros: newEvent.para_todos_maestros || false,
      }]);
      if (error) throw error;

      if (newEvent.para_todos_maestros) {
        const { successCount, attempted } = await sendAgendaNotification({
          title: finalTitle,
          date: newEvent.date,
          time: newEvent.time,
        });

        if (successCount === attempted && attempted > 0) {
          toast.success("Actividad registrada y circular enviada");
        } else if (successCount > 0) {
          toast.success("Actividad registrada; la circular se envió parcialmente");
        } else {
          toast.success("Actividad registrada oficialmente");
          toast.error("No se pudo crear la notificación para la plantilla docente");
        }
      } else {
        toast.success("Actividad registrada oficialmente");
      }

      setShowModal(false);
      setNewEvent({
        date: new Date().toISOString().split("T")[0],
        type: "reunion",
        title: getDefaultTitleForType("reunion"),
        para_todos_maestros: false,
        time: "",
        description: "",
      });
      fetchEvents();
    } catch (err) {
      toast.error("Error al registrar actividad");
    }
  };

  const handleBroadcastNotification = async (event: CalendarEvent) => {
    setIsSendingNotif(event.id);
    try {
      const { successCount, attempted } = await sendAgendaNotification(event);
      if (successCount === attempted && attempted > 0) {
        toast.success("Circular enviada a la plantilla");
      } else if (successCount > 0) {
        toast.success("Circular enviada parcialmente");
      } else {
        toast.error("No se pudo crear la notificación");
      }
    } finally {
      setIsSendingNotif(null);
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

  const monthLabel = currentMonth.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
  const selectedDateEvents = events.filter((e) => e.date === selectedDate);

  const getDayStyle = (day: Date | null) => {
    if (!day) return "";
    const dateStr = day.toISOString().split("T")[0];
    const isToday = dateStr === new Date().toISOString().split("T")[0];
    const isSelected = dateStr === selectedDate;
    const hasEvents = events.some((e) => e.date === dateStr);

    if (isSelected) return "bg-blue-600 text-white shadow-lg z-10 scale-110 ring-4 ring-blue-100";
    if (isToday) return "bg-blue-500/15 text-blue-200 font-extrabold border border-blue-400/20 shadow-inner";
    if (hasEvents) return "bg-white/5 text-slate-100 font-bold border border-white/10 hover:border-blue-400/20 hover:bg-blue-500/10";
    return "text-slate-400 hover:bg-white/5";
  };

  const filteredStudents = students.filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 min-h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight flex items-center gap-3">
             <span className="material-icons text-blue-300 text-3xl">calendar_month</span>
             Agenda Institucional
          </h1>
          <p className="text-slate-300 font-medium tracking-tight">Planificación estratégica de actividades y compromisos del ciclo escolar.</p>
        </div>
        <GlassButton variant="primary" onClick={() => setShowModal(true)}>Agendar Nueva Actividad</GlassButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
         <GlassCard className="lg:col-span-8 p-0 border-white/10 overflow-hidden !bg-white/5">
            <div className="p-6 border-b border-white/10 bg-white/5 flex justify-between items-center">
               <div className="flex items-center gap-4">
                  <GlassButton variant="outline" className="p-2 h-10 w-10 min-w-0" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
                     <span className="material-icons">chevron_left</span>
                  </GlassButton>
                  <h3 className="text-xl font-black text-slate-100 capitalize w-48 text-center">{monthLabel}</h3>
                  <GlassButton variant="outline" className="p-2 h-10 w-10 min-w-0" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
                     <span className="material-icons">chevron_right</span>
                  </GlassButton>
               </div>
               <div className="hidden xl:flex gap-3">
                  {Object.entries(TYPE_CONFIG).slice(0, 3).map(([key, cfg]) => (
                     <div key={key} className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${cfg.bg.replace('bg-', 'bg-')}`}></span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{cfg.label}</span>
                     </div>
                  ))}
               </div>
            </div>
            <div className="p-8">
               <div className="grid grid-cols-7 gap-4 mb-6">
                  {["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"].map(d => <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{d}</div>)}
               </div>
               <div className="grid grid-cols-7 gap-4">
                  {days.map((day, i) => (
                    <button
                      key={i}
                      disabled={!day}
                      onClick={() => day && setSelectedDate(day.toISOString().split("T")[0])}
                      className={`aspect-square rounded-2xl flex flex-col items-center justify-center text-sm font-bold transition-all relative ${getDayStyle(day)}`}
                    >
                      {day?.getDate()}
                      {day && events.some(e => e.date === day.toISOString().split("T")[0]) && (
                        <div className="absolute bottom-2 flex gap-1">
                           {events.filter(e => e.date === day.toISOString().split("T")[0]).slice(0, 3).map((e, idx) => (
                             <span key={idx} className={`w-1 h-1 rounded-full ${TYPE_CONFIG[e.type]?.bg.replace('bg-', 'bg-') || "bg-slate-400"}`}></span>
                           ))}
                        </div>
                      )}
                    </button>
                  ))}
               </div>
            </div>
         </GlassCard>

         <div className="lg:col-span-4 space-y-6">
             <GlassCard className="p-8 border-white/10 !bg-white/5 min-h-[400px]">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                  <span className="material-icons text-blue-600 text-sm">event</span>
                  Compromisos del Día
               </h3>
               <div className="space-y-4">
                  {selectedDateEvents.length === 0 ? (
                     <div className="py-20 text-center opacity-40">
                        <span className="material-icons text-5xl mb-4">event_busy</span>
                        <p className="text-[10px] font-black uppercase tracking-widest">Agenda Libre</p>
                     </div>
                  ) : (
                     selectedDateEvents.map(event => {
                        const cfg = TYPE_CONFIG[event.type] || TYPE_CONFIG.otro;
                        return (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={event.id} className={`p-5 rounded-3xl border ${cfg.border} ${cfg.bg} flex flex-col gap-3 shadow-sm backdrop-blur-xl`}>
                              <div className="flex justify-between items-start">
                                 <div className={`flex items-center gap-2 ${cfg.color}`}>
                                    <span className="material-icons text-sm">{cfg.icon}</span>
                                    <span className="text-[9px] font-black uppercase tracking-widest">{cfg.label}</span>
                                 </div>
                                 {event.time && <span className="text-[9px] font-black text-slate-300 bg-white/5 px-2 py-0.5 rounded-lg border border-white/10">{event.time}</span>}
                              </div>
                               <h4 className="text-sm font-black text-slate-100 uppercase italic tracking-tight">{event.title}</h4>
                              {event.alumno_nombre && <p className="text-[9px] font-black text-blue-600 bg-blue-100/30 px-2 py-1 rounded-lg w-fit">Alumno: {event.alumno_nombre}</p>}
                               {event.description && <p className="text-[10px] text-slate-300 font-medium leading-relaxed border-t border-white/10 pt-2 italic">{event.description}</p>}
                              
                              {event.para_todos_maestros && (
                                 <GlassButton onClick={() => handleBroadcastNotification(event)} loading={isSendingNotif === event.id} variant="outline" className="mt-2 h-9 text-[9px] font-black uppercase tracking-widest border-blue-400/20 text-blue-200 bg-white/5">
                                   <span className="material-icons text-xs mr-2">send</span>
                                   Circular Maestra
                                </GlassButton>
                              )}
                           </motion.div>
                        );
                     })
                  )}
               </div>
            </GlassCard>
            
            <GlassCard className="p-6 border-amber-400/20 !bg-amber-500/10">
               <div className="flex gap-4">
                  <span className="material-icons text-amber-600">info</span>
                  <p className="text-[10px] font-bold text-amber-800 uppercase tracking-tight leading-relaxed">
                     Planifique sus evaluaciones y reuniones con anticipación para optimizar la coordinación del plantel.
                  </p>
               </div>
            </GlassCard>
         </div>
      </div>

      {/* Modal Nueva Actividad */}
      <AnimatePresence>
         {showModal && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
                <GlassCard className="w-full max-w-lg p-0 !bg-[#0B1120]/90 border-white/10 shadow-2xl overflow-hidden">
                   <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
                      <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Nueva Actividad</h3>
                     <button onClick={() => setShowModal(false)}><span className="material-icons text-slate-400">close</span></button>
                  </div>
                  <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                      <GlassInput label={newEvent.type === "otro" ? "Nombre de Actividad" : "Nombre de Actividad (Automático)"} placeholder={newEvent.type === "otro" ? "Ej. Reunión de academia..." : "Se toma de la categoría seleccionada"} value={newEvent.title ?? ""} readOnly={newEvent.type !== "otro"} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
                     <div className="grid grid-cols-2 gap-4">
                        <GlassInput label="Fecha" type="date" value={newEvent.date ?? ""} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                        <GlassInput label="Hora" type="time" value={newEvent.time ?? ""} onChange={e => setNewEvent({...newEvent, time: e.target.value})} />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Estatus / Categoría</label>
                        <div className="grid grid-cols-2 gap-2">
                           {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                              <button key={key} onClick={() => handleTypeSelect(key as CalendarEvent["type"])} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${newEvent.type === key ? `${cfg.bg} ${cfg.border} ${cfg.color} ring-2 ring-current` : "bg-white/5 border-white/10 text-slate-300"}`}>
                                <span className="material-icons text-sm">{cfg.icon}</span>
                                <span className="text-[9px] font-black uppercase">{cfg.label}</span>
                             </button>
                           ))}
                        </div>
                     </div>
                      <div className="flex items-center gap-4 p-4 bg-blue-500/10 border border-blue-400/20 rounded-2xl cursor-pointer" onClick={() => setNewEvent({...newEvent, para_todos_maestros: !newEvent.para_todos_maestros})}>
                        <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${newEvent.para_todos_maestros ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'}`}>
                           {newEvent.para_todos_maestros && <span className="material-icons text-[14px]">check</span>}
                        </div>
                         <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest">Notificar a toda la plantilla docente</p>
                     </div>
                     <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Notas Institucionales</label>
                         <textarea title="Notas Institucionales" aria-label="Notas Institucionales" className="w-full h-24 bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold text-slate-100 outline-none focus:border-blue-500 transition-all resize-none" value={newEvent.description ?? ""} onChange={e => setNewEvent({...newEvent, description: e.target.value})} />
                     </div>
                     <GlassButton variant="primary" className="w-full h-14" onClick={handleSaveEvent}>Agendar Actividad</GlassButton>
                  </div>
               </GlassCard>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
};
