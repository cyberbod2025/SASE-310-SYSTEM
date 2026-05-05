import React from "react";
import { AgendaItem } from "./secretariaTypes";

interface InstitutionalAgendaCardProps {
  items: AgendaItem[];
  onOpenAgenda: () => void;
  onCreateAppointment: () => void;
}

export const InstitutionalAgendaCard: React.FC<InstitutionalAgendaCardProps> = ({ items, onOpenAgenda, onCreateAppointment }) => (
  <section className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
    <div className="mb-5 flex items-center justify-between gap-3">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-violet-200">Agenda institucional</p>
        <h2 className="mt-1 text-xl font-black text-white">Próximos cortes</h2>
      </div>
      <span className="material-icons text-violet-100">event</span>
    </div>
    <div className="space-y-3">
      {items.map((item) => (
        <article key={item.id} className="rounded-[1.3rem] border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-white">{item.title}</h3>
              <p className="mt-1 text-xs leading-5 text-slate-400">{item.detail}</p>
            </div>
            <span className="rounded-full bg-violet-500/15 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-violet-100">{item.time}</span>
          </div>
        </article>
      ))}
    </div>
    <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
      <button type="button" onClick={onOpenAgenda} className="min-h-[44px] rounded-2xl bg-violet-300 px-4 text-xs font-black uppercase tracking-widest text-slate-950">
        Abrir agenda
      </button>
      <button type="button" onClick={onCreateAppointment} className="min-h-[44px] rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-xs font-black uppercase tracking-widest text-white">
        Cita con padres
      </button>
    </div>
  </section>
);
