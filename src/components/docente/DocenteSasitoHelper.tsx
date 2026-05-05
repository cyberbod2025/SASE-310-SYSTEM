import React from "react";

interface DocenteSasitoHelperProps {
  insights: string[];
  onGoToIncidents: () => void;
}

export const DocenteSasitoHelper: React.FC<DocenteSasitoHelperProps> = ({ insights, onGoToIncidents }) => (
  <section className="rounded-[2rem] border border-emerald-200/10 bg-gradient-to-br from-emerald-950/70 via-slate-950 to-lime-950/30 p-5 shadow-2xl shadow-slate-950/30">
    <div className="mb-5 flex items-center justify-between gap-3">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-emerald-100">Sasito docente</p>
        <h2 className="mt-1 text-xl font-black text-white">Recordatorios simples</h2>
      </div>
      <span className="material-icons text-emerald-100">tips_and_updates</span>
    </div>
    <div className="space-y-3">
      {insights.map((insight) => (
        <div key={insight} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm leading-6 text-slate-200">
          {insight}
        </div>
      ))}
    </div>
    <button type="button" onClick={onGoToIncidents} className="mt-5 min-h-[44px] w-full rounded-2xl bg-emerald-300 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-950">
      Ir a mis incidencias
    </button>
  </section>
);
