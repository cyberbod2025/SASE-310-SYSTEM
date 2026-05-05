import React from "react";
import { TeacherGroupSummary } from "./docenteTypes";

interface GroupListCardProps {
  groups: TeacherGroupSummary[];
  selectedGroup: string | null;
  onSelectGroup: (group: string | null) => void;
}

export const GroupListCard: React.FC<GroupListCardProps> = ({ groups, selectedGroup, onSelectGroup }) => (
  <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-slate-950/20">
    <div className="mb-5 flex items-center justify-between gap-3">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-emerald-200">Mis grupos</p>
        <h2 className="mt-1 text-xl font-black text-white">Selecciona grupo</h2>
      </div>
      <button type="button" onClick={() => onSelectGroup(null)} className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-300">
        Todos
      </button>
    </div>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {groups.map((group) => {
        const active = selectedGroup === group.name;
        return (
          <button
            key={group.id}
            type="button"
            onClick={() => onSelectGroup(group.name)}
            className={`rounded-[1.5rem] border p-4 text-left transition ${active ? "border-emerald-300/70 bg-emerald-500/15" : "border-white/10 bg-slate-950/35 hover:border-emerald-300/35"}`}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-lg font-black text-white">{group.name}</p>
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black text-slate-200">{group.total}</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-400">{group.incidentsToday} reportes hoy</p>
          </button>
        );
      })}
      {groups.length === 0 && <p className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-xs font-bold uppercase tracking-widest text-slate-500">Sin grupos asignados</p>}
    </div>
  </section>
);
