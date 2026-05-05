import { GlassCard } from "../ui/GlassCard";
import { NeoButton } from "../ui/NeoButton";

interface Props {
  activeCases: number;
  pendingRequests: number;
  criticalCases: number;
  onNewCase: () => void;
  onPrint: () => void;
}

export function OrientacionRoleHeader({ activeCases, pendingRequests, criticalCases, onNewCase, onPrint }: Props) {
  return (
    <GlassCard className="border border-violet-400/10 bg-violet-950/40">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-200">
            Orientación
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">
            Casos, diagnósticos y evidencia institucional
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Bandeja persistente para abrir casos, pedir diagnóstico docente, definir plan y dejar trazabilidad para Dirección, Subdirección y Trabajo Social.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <NeoButton onClick={onPrint} className="border-violet-400/20 bg-violet-500/10 text-violet-100">
            Reporte
          </NeoButton>
          <NeoButton onClick={onNewCase} className="border-violet-400/20 bg-violet-500/20 text-white">
            Abrir caso
          </NeoButton>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Stat label="Casos activos" value={activeCases} />
        <Stat label="Solicitudes pendientes" value={pendingRequests} />
        <Stat label="Casos críticos" value={criticalCases} />
      </div>
    </GlassCard>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-black/20 px-4 py-3">
      <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-1 text-2xl font-black text-white">{value}</div>
    </div>
  );
}
