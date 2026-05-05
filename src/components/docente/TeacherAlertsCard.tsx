import React from "react";
import { TeacherAlert } from "./docenteTypes";

interface TeacherAlertsCardProps {
  alerts: TeacherAlert[];
}

const toneClass: Record<TeacherAlert["tone"], string> = {
  warning: "border-amber-300/30 bg-amber-500/10 text-amber-100",
  info: "border-emerald-300/30 bg-emerald-500/10 text-emerald-100",
  danger: "border-rose-300/30 bg-rose-500/10 text-rose-100",
};

export const TeacherAlertsCard: React.FC<TeacherAlertsCardProps> = ({ alerts }) => (
  <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
    <div className="mb-5">
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-100">Alertas docente</p>
      <h2 className="mt-1 text-xl font-black text-white">Calidad de reportes</h2>
    </div>
    <div className="space-y-3">
      {alerts.map((alert) => (
        <article key={alert.id} className={`rounded-[1.3rem] border p-4 ${toneClass[alert.tone]}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-black text-white">{alert.label}</p>
              <p className="mt-1 text-xs leading-5 text-slate-300">{alert.detail}</p>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-black text-white">{alert.count}</span>
          </div>
        </article>
      ))}
    </div>
  </section>
);
