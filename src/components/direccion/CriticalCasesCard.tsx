import React from "react";
import type { DirectionCase } from "./direccionTypes";

interface CriticalCasesCardProps {
  cases: DirectionCase[];
  onViewCase: (caseId: string) => void;
  onReopen: (caseId: string) => void;
  onEscalate: (caseId: string) => void;
  onReschedule: (caseId: string) => void;
}

export const CriticalCasesCard: React.FC<CriticalCasesCardProps> = ({
  cases,
  onViewCase,
  onReopen,
  onEscalate,
  onReschedule,
}) => {
  return (
    <section className="rounded-[2rem] border border-rose-300/20 bg-rose-500/10 p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-rose-200">Decisión requerida</p>
          <h2 className="mt-1 text-xl font-black text-white">Casos críticos</h2>
        </div>
        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
          {cases.length} activos
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {cases.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 text-center text-sm text-slate-300">
            Sin casos vencidos o críticos para decisión inmediata.
          </div>
        ) : (
          cases.map((caseItem) => (
            <article key={caseItem.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-base font-black text-white">
                    {caseItem.alumno} — {caseItem.grupo}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-rose-100">{caseItem.motivoCritico}</p>
                  <p className="mt-1 text-xs text-slate-400">Riesgo institucional: {caseItem.riesgo}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onViewCase(caseItem.id)}
                  className="min-h-[44px] rounded-2xl bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-950 transition hover:bg-blue-50"
                >
                  Ver caso
                </button>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <button type="button" onClick={() => onReopen(caseItem.id)} className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/15">
                  Reabrir
                </button>
                <button type="button" onClick={() => onEscalate(caseItem.id)} className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/15">
                  Escalar
                </button>
                <button type="button" onClick={() => onReschedule(caseItem.id)} className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/15">
                  Reagendar
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
};

export default CriticalCasesCard;
