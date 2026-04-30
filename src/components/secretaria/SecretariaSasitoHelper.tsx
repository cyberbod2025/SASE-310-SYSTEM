import React from "react";

interface SecretariaSasitoHelperProps {
  insights: string[];
  onGoToIncomplete: () => void;
}

export const SecretariaSasitoHelper: React.FC<SecretariaSasitoHelperProps> = ({ insights, onGoToIncomplete }) => (
  <section className="rounded-[2rem] border border-violet-200/10 bg-gradient-to-br from-violet-950/70 via-slate-950 to-fuchsia-950/40 p-5 shadow-2xl shadow-slate-950/30">
    <div className="mb-5 flex items-center justify-between gap-3">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-violet-100">Sasito administrativo</p>
        <h2 className="mt-1 text-xl font-black text-white">Ayuda documental</h2>
      </div>
      <span className="material-icons text-violet-100">support_agent</span>
    </div>
    <div className="space-y-3">
      {insights.map((insight) => (
        <div key={insight} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm leading-6 text-slate-200">
          {insight}
        </div>
      ))}
    </div>
    <button type="button" onClick={onGoToIncomplete} className="mt-5 min-h-[44px] w-full rounded-2xl bg-violet-300 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-950">
      Ir a expedientes incompletos
    </button>
  </section>
);
