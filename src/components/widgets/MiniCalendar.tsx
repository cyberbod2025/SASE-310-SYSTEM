import React, { useState } from "react";
import { motion } from "framer-motion";

export const MiniCalendar: React.FC<{
  onSelectDate?: (date: string) => void;
}> = ({ onSelectDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = new Date().toISOString().split("T")[0];

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= lastDate; i++) days.push(new Date(year, month, i));

  const monthName = currentMonth.toLocaleDateString("es-MX", { month: "long" });

  const handlePrev = () => setCurrentMonth(new Date(year, month - 1, 1));
  const handleNext = () => setCurrentMonth(new Date(year, month + 1, 1));

  return (
    <div className="bg-[#0a0c10]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] italic">
          {monthName} {year}
        </h4>
        <div className="flex gap-1">
          <button
            onClick={handlePrev}
            className="p-1 hover:bg-white/5 rounded text-slate-400"
          >
            <span className="material-symbols-outlined text-sm">
              chevron_left
            </span>
          </button>
          <button
            onClick={handleNext}
            className="p-1 hover:bg-white/5 rounded text-slate-400"
          >
            <span className="material-symbols-outlined text-sm">
              chevron_right
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {["D", "L", "M", "M", "J", "V", "S"].map((d, i) => (
          <span key={i} className="text-[8px] font-black text-slate-600">
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (!day) return <div key={i} className="aspect-square" />;
          const dateStr = day.toISOString().split("T")[0];
          const isToday = dateStr === today;

          return (
            <motion.button
              key={i}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSelectDate?.(dateStr)}
              className={`aspect-square flex items-center justify-center text-[10px] font-bold rounded-lg transition-colors ${
                isToday
                  ? "bg-blue-600 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {day.getDate()}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
