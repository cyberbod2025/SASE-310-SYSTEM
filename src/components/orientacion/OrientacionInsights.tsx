import { GlassCard } from "../ui/GlassCard";

interface Props {
  urgent: number;
  openRequests: number;
  plans: number;
  followUps: number;
}

export function OrientacionInsights({ urgent, openRequests, plans, followUps }: Props) {
  const items = [
    { label: "Urgentes", value: urgent },
    { label: "Pendientes", value: openRequests },
    { label: "Planes", value: plans },
    { label: "Seguimientos", value: followUps },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <GlassCard key={item.label} className="border border-white/5 bg-slate-950/60">
          <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{item.label}</div>
          <div className="mt-2 text-3xl font-black text-white">{item.value}</div>
        </GlassCard>
      ))}
    </div>
  );
}
