import { GlassCard } from "../ui/GlassCard";
import { NeoButton } from "../ui/NeoButton";
import { TeacherDiagnosisOverview } from "./TeacherDiagnosisOverview";
import { ORIENTACION_CASE_LABELS, ORIENTACION_PRIORITY_LABELS, ORIENTACION_PRIORITY_STYLES, ORIENTACION_STATE_STYLES, type OrientacionCaseSummary, type OrientacionDiagnosisRequest, type OrientacionPlan, type OrientacionFollowUp } from "./orientacionTypes";

interface Props {
  selectedCase: OrientacionCaseSummary | null;
  requests: OrientacionDiagnosisRequest[];
  plans: OrientacionPlan[];
  followUps: OrientacionFollowUp[];
  onRequestDiagnosis: () => void;
  onDeriveSocialWork: () => void;
  onEscalateDirection: () => void;
}

export function OrientacionCaseDetail({ selectedCase, requests, plans, followUps, onRequestDiagnosis, onDeriveSocialWork, onEscalateDirection }: Props) {
  if (!selectedCase) {
    return (
      <GlassCard className="border border-white/5 bg-slate-950/55">
        <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-slate-400">Selecciona un caso para ver el detalle institucional.</div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="border border-white/5 bg-slate-950/55">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white">{selectedCase.alumnoNombre}</h2>
            <div className="mt-1 text-sm text-slate-400">{selectedCase.grupo ?? "Sin grupo"} · {selectedCase.matricula ?? "Sin matrícula"}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge text={ORIENTACION_CASE_LABELS[selectedCase.estado]} className={ORIENTACION_STATE_STYLES[selectedCase.estado]} />
            <Badge text={ORIENTACION_PRIORITY_LABELS[selectedCase.prioridad]} className={ORIENTACION_PRIORITY_STYLES[selectedCase.prioridad]} />
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-black/20 p-4 text-sm text-slate-300">
          <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Motivo</div>
          <div className="mt-1">{selectedCase.motivo}</div>
          {selectedCase.resumen ? <div className="mt-3 text-slate-200">{selectedCase.resumen}</div> : null}
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <NeoButton onClick={onRequestDiagnosis} className="bg-violet-500/20 text-white">Pedir diagnóstico</NeoButton>
          <NeoButton onClick={onDeriveSocialWork} className="bg-amber-500/15 text-amber-100">Derivar</NeoButton>
          <NeoButton onClick={onEscalateDirection} className="bg-rose-500/15 text-rose-100">Escalar</NeoButton>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          <MetaCard title="Diagnósticos" value={requests.length} />
          <MetaCard title="Planes" value={plans.length} />
          <MetaCard title="Seguimientos" value={followUps.length} />
        </div>

        {selectedCase && (
          <TeacherDiagnosisOverview
            alumnoId={selectedCase.alumnoId}
            canViewSensitive={true}
          />
        )}
      </div>
    </GlassCard>
  );
}

function Badge({ text, className }: { text: string; className: string }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${className}`}>{text}</span>;
}

function MetaCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-black/20 p-3">
      <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{title}</div>
      <div className="mt-1 text-2xl font-black text-white">{value}</div>
    </div>
  );
}
