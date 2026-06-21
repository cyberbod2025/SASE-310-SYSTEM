import React from "react";
import type { EmergencyAlert } from "../../types/emergency";
import { Clock, MapPin, User } from "lucide-react";

type ColumnConfig = {
  title: string;
  items: EmergencyAlert[];
  accent: string;
};

function minutesOpen(alert: EmergencyAlert) {
  return Math.max(0, Math.floor((Date.now() - new Date(alert.created_at).getTime()) / 60000));
}

const EmergencyCard: React.FC<{ alert: EmergencyAlert }> = ({ alert }) => (
  <div className="min-w-0 rounded-xl border border-white/8 bg-white/[0.04] p-3 text-slate-200">
    <div className="flex min-w-0 items-center justify-between gap-3">
      <p className="min-w-0 truncate text-[10px] font-black uppercase tracking-widest text-white">{alert.tipo_alerta}</p>
      <span className="rounded-full bg-red-500/15 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-red-200">
        N{alert.escalado_nivel ?? 0}
      </span>
    </div>
    <div className="mt-3 space-y-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">
      <p className="flex min-w-0 items-center gap-2"><User className="h-3 w-3 shrink-0" /><span className="min-w-0 truncate">{alert.docente_nombre}</span></p>
      <p className="flex min-w-0 items-center gap-2"><MapPin className="h-3 w-3 shrink-0" /><span className="min-w-0 truncate">{alert.metadata?.ubicacion || alert.aula || 'N/A'}</span></p>
      <p className="flex items-center gap-2"><Clock className="h-3 w-3 shrink-0" />{minutesOpen(alert)} min</p>
    </div>
  </div>
);

const Column: React.FC<ColumnConfig> = ({ title, items, accent }) => (
  <div className="flex min-w-0 flex-col rounded-2xl border border-white/8 bg-[#0f1117]/92 p-3">
    <div className={`mb-3 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest ${accent} sticky top-0 z-10 backdrop-blur-md`}>
      {title} ({items.length})
    </div>
    <div className="max-h-[18rem] flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 p-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-600">
          Sin registros
        </p>
      ) : (
        items.map((alert) => <EmergencyCard key={alert.id} alert={alert} />)
      )}
    </div>
  </div>
);

export const EmergencyBoard: React.FC<{ alerts: EmergencyAlert[] }> = ({ alerts }) => {
  const columns: ColumnConfig[] = [
    { title: "Activas", items: alerts.filter((alert) => alert.estado === "activa"), accent: "bg-red-500/15 text-red-200" },
    { title: "En atención", items: alerts.filter((alert) => alert.estado === "atendida"), accent: "bg-amber-500/15 text-amber-200" },
    { title: "Cerradas", items: alerts.filter((alert) => alert.estado === "cancelada"), accent: "bg-emerald-500/15 text-emerald-200" },
  ];

  return (
    <div className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))] gap-3 pb-safe">
      {columns.map((column) => <Column key={column.title} {...column} />)}
    </div>
  );
};
