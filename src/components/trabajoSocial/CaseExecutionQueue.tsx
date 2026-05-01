import React from "react";
import {
  CitatorioRecord,
  hasThreeUnansweredCitatorios,
  priorityLabels,
  statusLabels,
  TrabajoSocialCase,
} from "./trabajoSocialTypes";

interface CaseExecutionQueueProps {
  cases: TrabajoSocialCase[];
  citatorios: CitatorioRecord[];
  selectedCaseId?: string;
  canEdit: boolean;
  onSelectCase: (caseId: string) => void;
  onStartFollowUp: (caseId: string) => void;
  onRegisterContact: (caseId: string) => void;
}

const priorityClass = (priority: TrabajoSocialCase["prioridad"]) => {
  if (priority === "critica") return "border-red-300/40 bg-red-500/15 text-red-100";
  if (priority === "alta") return "border-orange-300/40 bg-orange-500/15 text-orange-100";
  return "border-amber-200/30 bg-amber-500/10 text-amber-100";
};

export const CaseExecutionQueue: React.FC<CaseExecutionQueueProps> = ({
  cases,
  citatorios,
  selectedCaseId,
  canEdit,
  onSelectCase,
  onStartFollowUp,
  onRegisterContact,
}) => (
  <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/20 md:p-5">
    <div className="mb-4 flex items-center justify-between gap-3">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.26em] text-orange-200">Cola de ejecución</p>
        <h2 className="text-xl font-black text-white">Casos asignados</h2>
      </div>
      <span className="rounded-full bg-orange-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-orange-100">
        {cases.length} activos
      </span>
    </div>

    <div className="space-y-3">
      {cases.length === 0 && (
        <div className="rounded-3xl border border-dashed border-white/10 p-8 text-center text-sm font-semibold text-slate-400">
          Sin casos asignados a Trabajo Social por ahora.
        </div>
      )}

      {cases.map((caseItem) => {
        const unansweredAlert = hasThreeUnansweredCitatorios(caseItem.id, citatorios);
        const selected = selectedCaseId === caseItem.id;

        return (
          <article key={caseItem.id} className={`rounded-3xl border p-4 transition ${selected ? "border-orange-300/60 bg-orange-500/10" : "border-white/10 bg-slate-950/40"}`}>
            <button type="button" onClick={() => onSelectCase(caseItem.id)} className="block w-full text-left">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-black text-white">{caseItem.alumno}</h3>
                  <p className="mt-1 text-xs font-bold text-slate-400">{caseItem.grupo} · viene de {caseItem.responsablePrevio}</p>
                </div>
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase ${priorityClass(caseItem.prioridad)}`}>
                  {priorityLabels[caseItem.prioridad]}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300">{caseItem.motivo}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-300">
                  {statusLabels[caseItem.estadoIntervencion]}
                </span>
                {unansweredAlert && (
                  <span className="rounded-full border border-red-300/50 bg-red-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-100">
                    3 citatorios sin respuesta
                  </span>
                )}
              </div>
            </button>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button type="button" disabled={!canEdit} onClick={() => onStartFollowUp(caseItem.id)} className="min-h-[46px] rounded-2xl bg-orange-500 px-4 text-xs font-black uppercase tracking-widest text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400">
                Iniciar seguimiento
              </button>
              <button type="button" disabled={!canEdit} onClick={() => onRegisterContact(caseItem.id)} className="min-h-[46px] rounded-2xl border border-orange-300/30 bg-orange-500/10 px-4 text-xs font-black uppercase tracking-widest text-orange-100 disabled:cursor-not-allowed disabled:border-slate-700 disabled:text-slate-500">
                Registrar contacto
              </button>
            </div>
          </article>
        );
      })}
    </div>
  </section>
);
