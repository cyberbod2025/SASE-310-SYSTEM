import React, { useState } from "react";
import { useApp } from "../store";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: "reunion" | "entrega" | "evento" | "evaluacion" | "festivo";
  description?: string;
}

// Mock events - In production, these would come from a database
const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: "1",
    title: "Consejo Técnico Escolar",
    date: "2025-01-10",
    time: "08:00",
    type: "reunion",
    description: "Sesión ordinaria mensual",
  },
  {
    id: "2",
    title: "Entrega de Calificaciones",
    date: "2025-01-15",
    type: "entrega",
    description: "Primer bimestre",
  },
  {
    id: "3",
    title: "Día del Estudiante",
    date: "2025-01-25",
    type: "evento",
    description: "Actividades especiales",
  },
  {
    id: "4",
    title: "Evaluación Diagnóstica",
    date: "2025-01-20",
    time: "09:00",
    type: "evaluacion",
    description: "Matemáticas y Español",
  },
  {
    id: "5",
    title: "Día de la Constitución",
    date: "2025-02-03",
    type: "festivo",
    description: "Suspensión de labores",
  },
  {
    id: "6",
    title: "Junta de Padres",
    date: "2025-01-28",
    time: "17:00",
    type: "reunion",
    description: "Informe de avances",
  },
];

export const Agenda: React.FC = () => {
  const { currentUserRole } = useApp();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [events] = useState<CalendarEvent[]>(MOCK_EVENTS);

  const getEventTypeStyle = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "reunion":
        return "bg-blue-900/30 text-blue-200 border-blue-500/20 shadow-sm";
      case "entrega":
        return "bg-yellow-900/30 text-yellow-200 border-yellow-500/20 shadow-sm";
      case "evento":
        return "bg-purple-900/30 text-purple-200 border-purple-500/20 shadow-sm";
      case "evaluacion":
        return "bg-orange-900/30 text-orange-200 border-orange-500/20 shadow-sm";
      case "festivo":
        return "bg-green-900/30 text-green-200 border-green-500/20 shadow-sm";
      default:
        return "bg-white/5 text-gray-300 border-white/10 shadow-sm";
    }
  };

  const getEventTypeIcon = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "reunion":
        return "groups";
      case "entrega":
        return "assignment";
      case "evento":
        return "celebration";
      case "evaluacion":
        return "quiz";
      case "festivo":
        return "beach_access";
      default:
        return "event";
    }
  };

  // Calendar generation
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    // Add empty slots for days before the first day of month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
  });

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return events.filter((e) => e.date === dateStr);
  };

  const upcomingEvents = events
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  const selectedDateEvents = selectedDate
    ? events.filter((e) => e.date === selectedDate)
    : [];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">
              calendar_month
            </span>
            Agenda Institucional
          </h1>
          <p className="text-gray-400 mt-1">
            Calendario de eventos y actividades escolares
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-all shadow-lg shadow-blue-500/20 border border-white/10">
          <span className="material-symbols-outlined">add</span>
          Nuevo Evento
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg overflow-hidden">
          {/* Month Navigation */}
          <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
            <button
              onClick={() =>
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() - 1
                  )
                )
              }
              className="p-2 hover:bg-white/10 text-white rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <h3 className="font-bold text-lg text-white capitalize tracking-wide">
              {monthName}
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
              className="p-2 hover:bg-white/10 text-white rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-bold text-gray-400 uppercase py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, idx) => {
                if (!day) {
                  return <div key={`empty-${idx}`} className="aspect-square" />;
                }

                const dateStr = day.toISOString().split("T")[0];
                const dayEvents = getEventsForDate(day);
                const isToday =
                  dateStr === new Date().toISOString().split("T")[0];
                const isSelected = dateStr === selectedDate;

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`aspect-square p-1 rounded-lg text-sm transition-all relative font-medium ${
                      isSelected
                        ? "bg-primary text-white shadow-md shadow-blue-500/30"
                        : isToday
                        ? "bg-primary/20 text-blue-300 font-bold border border-primary/30"
                        : "text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <span>{day.getDate()}</span>
                    {dayEvents.length > 0 && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {dayEvents.slice(0, 3).map((e, i) => (
                          <span
                            key={i}
                            className={`size-1.5 rounded-full ${
                              isSelected
                                ? "bg-white"
                                : e.type === "festivo"
                                ? "bg-green-500"
                                : e.type === "reunion"
                                ? "bg-blue-500"
                                : e.type === "evaluacion"
                                ? "bg-orange-500"
                                : "bg-purple-500"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Events */}
          {selectedDate && (
            <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-md">
              <h4 className="font-bold text-sm text-gray-400 uppercase mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">event</span>
                {new Date(selectedDate + "T12:00:00").toLocaleDateString(
                  "es-MX",
                  {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  }
                )}
              </h4>
              {selectedDateEvents.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  No hay eventos programados.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedDateEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`p-3 rounded-lg border ${getEventTypeStyle(
                        event.type
                      )}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">
                          {getEventTypeIcon(event.type)}
                        </span>
                        <div>
                          <p className="font-bold text-sm">{event.title}</p>
                          {event.time && (
                            <p className="text-xs opacity-70">
                              {event.time} hrs
                            </p>
                          )}
                        </div>
                      </div>
                      {event.description && (
                        <p className="text-xs mt-1 opacity-70 border-t border-white/10 pt-1">
                          {event.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar - Upcoming Events */}
        <div className="space-y-4">
          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 bg-white/5">
              <h3 className="font-bold text-white">Próximos Eventos</h3>
            </div>
            <div className="divide-y divide-white/10">
              {upcomingEvents.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No hay eventos próximos.
                </div>
              ) : (
                upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 hover:bg-white/5 transition-colors cursor-pointer group"
                    onClick={() => setSelectedDate(event.date)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg ${getEventTypeStyle(
                          event.type
                        )}`}
                      >
                        <span className="material-symbols-outlined text-lg">
                          {getEventTypeIcon(event.type)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-200 group-hover:text-white transition-colors truncate">
                          {event.title}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(
                            event.date + "T12:00:00"
                          ).toLocaleDateString("es-MX", {
                            day: "numeric",
                            month: "short",
                          })}
                          {event.time && ` • ${event.time}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg p-4">
            <h4 className="font-bold text-sm text-white mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-gray-400">
                info
              </span>
              Tipos de Evento
            </h4>
            <div className="space-y-2">
              {[
                { type: "reunion", label: "Reuniones" },
                { type: "entrega", label: "Entregas" },
                { type: "evento", label: "Eventos" },
                { type: "evaluacion", label: "Evaluaciones" },
                { type: "festivo", label: "Días Festivos" },
              ].map((item) => (
                <div key={item.type} className="flex items-center gap-2">
                  <span
                    className={`size-3 rounded-full ${
                      item.type === "reunion"
                        ? "bg-blue-500"
                        : item.type === "entrega"
                        ? "bg-yellow-500"
                        : item.type === "evento"
                        ? "bg-purple-500"
                        : item.type === "evaluacion"
                        ? "bg-orange-500"
                        : "bg-green-500"
                    }`}
                  />
                  <span className="text-xs text-gray-400">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
