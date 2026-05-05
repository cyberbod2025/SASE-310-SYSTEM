import React from "react";
import type { DirectionFollowUp } from "./direccionTypes";

interface FollowUpCardProps {
  followUp: DirectionFollowUp;
  onRegisterEvidence: () => void;
  onReschedule: () => void;
  onMarkAttendance: () => void;
  onReopenCase: () => void;
}

const statusClass: Record<DirectionFollowUp["estado"], string> = {
  pending: "border-amber-300/30 bg-amber-500/10 text-amber-100",
  completed: "border-emerald-300/30 bg-emerald-500/10 text-emerald-100",
  missed: "border-slate-300/30 bg-slate-500/10 text-slate-100",
  overdue: "border-rose-300/30 bg-rose-500/10 text-rose-100",
};

export const FollowUpCard: React.FC<FollowUpCardProps> = ({
  followUp,
  onRegisterEvidence,
  onReschedule,
  onMarkAttendance,
  onReopenCase,
}) => {
  return (
    <article className={`rounded-[2rem] border p-4 ${statusClass[followUp.estado]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-white">{followUp.alumno}</p>
          <p className="mt-1 text-xs uppercase tracking-widest opacity-80">
            Seguimiento {followUp.step}/{followUp.total} · {followUp.fecha}
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest">
          {followUp.estado}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <button type="button" onClick={onRegisterEvidence} className="rounded-xl bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/15">
          Evidencia
        </button>
        <button type="button" onClick={onReschedule} className="rounded-xl bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/15">
          Reagendar
        </button>
        <button type="button" onClick={onMarkAttendance} className="rounded-xl bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/15">
          Asistencia
        </button>
        <button type="button" onClick={onReopenCase} className="rounded-xl bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/15">
          Reabrir
        </button>
      </div>
    </article>
  );
};

export default FollowUpCard;
