import React from "react";
import { TeacherIncidentSummary } from "./docenteTypes";

interface MyRecentIncidentsProps {
  incidents: TeacherIncidentSummary[];
  canViewNames?: boolean;
}

const statusClass: Record<TeacherIncidentSummary["status"], string> = {
  abierta: "border-emerald-300/30 bg-emerald-500/15 text-emerald-100",
  escalada: "border-amber-300/30 bg-amber-500/15 text-amber-100",
};

export const MyRecentIncidents: React.FC<MyRecentIncidentsProps> = ({ incidents, canViewNames = false }) => (
  <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
    <div className="mb-5 flex items-center justify-between gap-3">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-emerald-200">Mis incidencias</p>
        <h2 className="mt-1 text-xl font-black text-white">Recientes</h2>
      </div>
      <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[10px] font-black text-emerald-100">{incidents.length}</span>
    </div>
    <div className="space-y-3">
      {incidents.map((incident) => (
        <article key={incident.id} className="rounded-[1.3rem] border border-white/10 bg-slate-950/35 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-white">{canViewNames ? incident.studentName : "Estudiante Protegido"}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">{incident.group} · {incident.type}</p>
            </div>
            <span className={`shrink-0 rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-widest ${statusClass[incident.status]}`}>{incident.status}</span>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-300">{incident.description}</p>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">{incident.hasEvidence ? "Con evidencia" : "Sin evidencia"}</p>
        </article>
      ))}
      {incidents.length === 0 && <p className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-xs font-bold uppercase tracking-widest text-slate-500">Aún no tienes incidencias recientes</p>}
    </div>
  </section>
);
