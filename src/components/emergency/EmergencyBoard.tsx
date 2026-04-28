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
  <div className="rounded-xl border border-white/8 bg-white/[0.04] p-3 text-slate-200">
    <div className="flex items-center justify-between gap-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-white">{alert.tipo_alerta}</p>
      <span className="rounded-full bg-red-500/15 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-red-200">
        N{alert.escalado_nivel ?? 0}
      </span>
    </div>
    <div className="mt-3 space-y-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">
      <p className="flex items-center gap-2"><User className="h-3 w-3" />{alert.docente_nombre}</p>
      <p className="flex items-center gap-2"><MapPin className="h-3 w-3" />{alert.metadata?.ubicacion || alert.aula || 'N/A'}</p>
      <p className="flex items-center gap-2"><Clock className="h-3 w-3" />{minutesOpen(alert)} min</p>
    </div>
  </div>
);

const Column: React.FC<ColumnConfig> = ({ title, items, accent }) => (
  <div className="min-h-48 rounded-2xl border border-white/8 bg-[#0f1117]/92 p-3">
    <div className={`mb-3 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest ${accent}`}>
      {title} ({items.length})
    </div>
    <div className="space-y-2">
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
    { title: "En atencion", items: alerts.filter((alert) => alert.estado === "atendida"), accent: "bg-amber-500/15 text-amber-200" },
    { title: "Cerradas", items: alerts.filter((alert) => alert.estado === "cancelada"), accent: "bg-emerald-500/15 text-emerald-200" },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {columns.map((column) => <Column key={column.title} {...column} />)}
    </div>
  );
};
