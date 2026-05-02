import { GlassCard } from "../ui/GlassCard";
import type { OrientacionCaseSummary, OrientacionFollowUp, OrientacionHistoryItem, OrientacionPlan } from "./orientacionTypes";

interface Props {
  selectedCase: OrientacionCaseSummary | null;
  history: {
    incidents: OrientacionHistoryItem[];
    citations: OrientacionHistoryItem[];
    contacts: OrientacionHistoryItem[];
    interventions: OrientacionHistoryItem[];
  };
  plans: OrientacionPlan[];
  followUps: OrientacionFollowUp[];
}

export function OrientacionReportPreview({ selectedCase, history, plans, followUps }: Props) {
  if (!selectedCase) return null;

  return (
    <GlassCard className="border border-white/5 bg-slate-950/55">
      <h2 className="text-lg font-bold text-white">Reporte imprimible</h2>
      <p className="mt-1 text-sm text-slate-400">Resumen institucional listo para imprimir o pegar en oficio.</p>

      <div className="mt-4 rounded-2xl border border-white/5 bg-black/20 p-4 text-sm text-slate-300">
        <div className="font-semibold text-white">{selectedCase.alumnoNombre}</div>
        <div className="mt-1 text-slate-400">{selectedCase.grupo ?? "Sin grupo"} · {selectedCase.matricula ?? "Sin matrícula"}</div>
        <div className="mt-3">{selectedCase.motivo}</div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <Mini label="Incidencias" value={history.incidents.length} />
          <Mini label="Planes" value={plans.length} />
          <Mini label="Seguimientos" value={followUps.length} />
        </div>
      </div>
    </GlassCard>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3">
      <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-1 text-xl font-black text-white">{value}</div>
    </div>
  );
}
