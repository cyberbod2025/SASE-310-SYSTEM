import { GlassCard } from "../ui/GlassCard";
import type { OrientacionHistoryItem } from "./orientacionTypes";

interface Props {
  studentLabel: string;
  summary: any | null;
  incidents: OrientacionHistoryItem[];
  citations: OrientacionHistoryItem[];
  contacts: OrientacionHistoryItem[];
  interventions: OrientacionHistoryItem[];
  teacherReports: OrientacionHistoryItem[];
}

export function StudentInstitutionalHistory({ studentLabel, summary, incidents, citations, contacts, interventions, teacherReports }: Props) {
  const counts = [
    { label: "Incidencias", value: summary?.total_incidencias ?? incidents.length },
    { label: "Reportes docentes", value: teacherReports.length },
    { label: "Citas", value: summary?.total_justificantes ?? citations.length },
    { label: "Contactos", value: contacts.length },
    { label: "Intervenciones", value: interventions.length },
  ];

  return (
    <GlassCard className="border border-white/5 bg-slate-950/55">
      <h2 className="text-lg font-bold text-white">Historial institucional</h2>
      <p className="mt-1 text-sm text-slate-400">{studentLabel}</p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {counts.map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/5 bg-black/20 p-3">
            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{item.label}</div>
            <div className="mt-1 text-2xl font-black text-white">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <HistoryColumn title="Incidencias" items={incidents} />
        <HistoryColumn title="Reportes y contactos" items={[...teacherReports, ...citations, ...contacts, ...interventions]} />
      </div>
    </GlassCard>
  );
}

function HistoryColumn({ title, items }: { title: string; items: OrientacionHistoryItem[] }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-black/15 p-3">
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="mt-3 space-y-2">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 p-3 text-sm text-slate-400">Sin registros recientes.</div>
        ) : (
          items.slice(0, 4).map((item) => (
            <div key={item.id} className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
              <div className="text-xs uppercase tracking-[0.16em] text-violet-200">{item.titulo}</div>
              <div className="mt-1 text-sm text-slate-200">{item.detalle}</div>
              <div className="mt-2 text-[11px] text-slate-500">{item.fuente}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
