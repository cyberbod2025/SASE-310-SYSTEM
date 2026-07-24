import React, { useState } from "react";
import { ComplianceAgreement, ComplianceStatus, TrabajoSocialCase } from "./trabajoSocialTypes";

interface ComplianceTrackerProps {
  selectedCase: TrabajoSocialCase | null;
  agreements: ComplianceAgreement[];
  canEdit: boolean;
  onCreateAgreement: (caseId: string, agreement: string, responsible: string) => Promise<boolean>;
  onUpdateCompliance: (agreementId: string, status: ComplianceStatus) => void;
}

const statusLabel: Record<ComplianceStatus, string> = {
  cumplido: "Cumplido",
  en_proceso: "En proceso",
  incumplido: "Incumplido",
};

const statusClass = (status: ComplianceStatus) => {
  if (status === "cumplido") return "bg-emerald-500/15 text-emerald-100";
  if (status === "incumplido") return "bg-red-500/20 text-red-100";
  return "bg-orange-500/15 text-orange-100";
};

export const ComplianceTracker: React.FC<ComplianceTrackerProps> = ({
  selectedCase,
  agreements,
  canEdit,
  onCreateAgreement,
  onUpdateCompliance,
}) => {
  const [agreementText, setAgreementText] = useState("");
  const [responsible, setResponsible] = useState("");
  const caseAgreements = selectedCase ? agreements.filter((agreement) => agreement.caseId === selectedCase.id) : [];

  const createAgreement = async () => {
    if (!selectedCase || !canEdit || !agreementText.trim() || !responsible.trim()) return;
    const saved = await onCreateAgreement(selectedCase.id, agreementText.trim(), responsible.trim());
    if (saved) {
      setAgreementText("");
      setResponsible("");
    }
  };

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 md:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.26em] text-orange-200">Cumplimiento</p>
          <h2 className="text-xl font-black text-white">Acuerdos en la vida real</h2>
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-4">
          <textarea
            value={agreementText}
            onChange={(event) => setAgreementText(event.target.value)}
            placeholder="Acuerdo verificable"
            className="min-h-[76px] w-full rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm text-white outline-none placeholder:text-slate-500"
          />
          <input
            value={responsible}
            onChange={(event) => setResponsible(event.target.value)}
            placeholder="Responsable del acuerdo"
            className="mt-2 min-h-[44px] w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none placeholder:text-slate-500"
          />
          <button
            type="button"
            disabled={!selectedCase || !canEdit || !agreementText.trim() || !responsible.trim()}
            onClick={createAgreement}
            className="mt-3 min-h-[44px] w-full rounded-2xl bg-orange-500 px-3 text-[10px] font-black uppercase tracking-widest text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            Registrar acuerdo
          </button>
        </div>
        {caseAgreements.length === 0 && <p className="rounded-3xl border border-dashed border-white/10 p-5 text-center text-sm font-semibold text-slate-400">Sin acuerdos asignados al caso.</p>}
        {caseAgreements.map((agreement) => (
          <article key={agreement.id} className="rounded-3xl border border-white/10 bg-slate-950/45 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-white">{agreement.acuerdo}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">Responsable: {agreement.responsable}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${statusClass(agreement.estado)}`}>
                {statusLabel[agreement.estado]}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {(["cumplido", "en_proceso", "incumplido"] as ComplianceStatus[]).map((status) => (
                <button key={status} type="button" disabled={!canEdit} onClick={() => onUpdateCompliance(agreement.id, status)} className="min-h-[42px] rounded-2xl border border-white/10 bg-white/[0.05] px-2 text-[9.5px] font-black uppercase tracking-widest text-slate-200 disabled:cursor-not-allowed disabled:text-slate-600 hover:bg-orange-500/15">
                  {statusLabel[status]}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
