import React from "react";
import { AdminAlert } from "./secretariaTypes";

interface AdminAlertsCardProps {
  alerts: AdminAlert[];
  onSelectAlert: (alert: AdminAlert) => void;
}

const toneClass: Record<AdminAlert["tone"], string> = {
  danger: "border-rose-300/30 bg-rose-500/10 text-rose-100",
  warning: "border-amber-300/30 bg-amber-500/10 text-amber-100",
  info: "border-violet-300/30 bg-violet-500/10 text-violet-100",
};

export const AdminAlertsCard: React.FC<AdminAlertsCardProps> = ({ alerts, onSelectAlert }) => (
  <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
    <div className="mb-5">
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-100">Alertas administrativas</p>
      <h2 className="mt-1 text-xl font-black text-white">Qué falta por corregir</h2>
    </div>
    <div className="space-y-3">
      {alerts.map((alert) => (
        <button
          key={alert.id}
          type="button"
          onClick={() => onSelectAlert(alert)}
          className={`w-full rounded-[1.3rem] border p-4 text-left transition hover:scale-[1.01] ${toneClass[alert.tone]}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-black text-white">{alert.label}</p>
              <p className="mt-1 text-xs leading-5 text-slate-300">{alert.detail}</p>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-black text-white">{alert.count}</span>
          </div>
        </button>
      ))}
    </div>
  </section>
);
