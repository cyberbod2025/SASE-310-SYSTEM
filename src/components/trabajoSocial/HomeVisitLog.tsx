import React, { useState } from "react";
import { HomeVisitRecord, TrabajoSocialCase } from "./trabajoSocialTypes";

interface HomeVisitLogProps {
  selectedCase: TrabajoSocialCase | null;
  visits: HomeVisitRecord[];
  canEdit: boolean;
  onRegisterVisit: (caseId: string, observaciones: string) => void;
}

export const HomeVisitLog: React.FC<HomeVisitLogProps> = ({ selectedCase, visits, canEdit, onRegisterVisit }) => {
  const [observations, setObservations] = useState("");
  const caseVisits = selectedCase ? visits.filter((visit) => visit.caseId === selectedCase.id) : [];

  const registerVisit = () => {
    if (!selectedCase || !canEdit) return;
    onRegisterVisit(selectedCase.id, observations);
    setObservations("");
  };

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 md:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.26em] text-orange-200">Visitas domiciliarias</p>
          <h2 className="text-xl font-black text-white flex flex-wrap items-center gap-2">
            <span>Evidencia de campo</span>
            <span className="rounded bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-amber-500">
              ⚠️ BORRADOR LOCAL
            </span>
          </h2>
        </div>
      </div>

      <textarea
        value={observations}
        onChange={(event) => setObservations(event.target.value)}
        placeholder="Observaciones de visita y contexto familiar"
        className="min-h-[92px] w-full rounded-3xl border border-white/10 bg-slate-950/60 p-4 text-sm font-semibold text-white outline-none placeholder:text-slate-500 focus:border-orange-300/50"
      />

      <button type="button" disabled={!selectedCase || !canEdit} onClick={registerVisit} className="mt-3 min-h-[52px] w-full rounded-2xl bg-orange-500 px-4 text-xs font-black uppercase tracking-widest text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400">
        Registrar visita realizada
      </button>

      <div className="mt-4 space-y-3">
        {caseVisits.length === 0 && <p className="rounded-3xl border border-dashed border-white/10 p-5 text-center text-sm font-semibold text-slate-400">Sin visitas registradas para este caso.</p>}
        {caseVisits.map((visit) => (
          <article key={visit.id} className="rounded-3xl border border-white/10 bg-slate-950/45 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-black text-white">Visita realizada</p>
              <span className="text-xs font-bold text-slate-500">{visit.fecha}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-300">{visit.observaciones}</p>
            <p className="mt-2 rounded-2xl bg-white/[0.04] p-3 text-xs font-semibold text-slate-400">{visit.contextoFamiliar}</p>
          </article>
        ))}
      </div>
    </section>
  );
};
