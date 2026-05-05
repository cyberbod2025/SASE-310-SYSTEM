import React from "react";

interface QuickReportButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const QuickReportButton: React.FC<QuickReportButtonProps> = ({ onClick, disabled = false }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="group sticky top-[96px] z-20 min-h-[76px] w-full rounded-[2rem] border border-emerald-300/30 bg-gradient-to-r from-emerald-300 via-emerald-400 to-lime-300 px-5 py-4 text-left text-slate-950 shadow-2xl shadow-emerald-900/25 transition active:scale-[0.99] disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400 md:top-[112px]"
  >
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.28em] opacity-70">Acción principal</p>
        <p className="mt-1 text-2xl font-black uppercase tracking-tight md:text-3xl">+ Reportar incidencia</p>
      </div>
      <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-emerald-200 transition group-hover:scale-105">
        <span className="material-icons text-3xl">add_alert</span>
      </div>
    </div>
  </button>
);
