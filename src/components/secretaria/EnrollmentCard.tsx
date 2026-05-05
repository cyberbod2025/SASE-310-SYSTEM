import React from "react";

interface EnrollmentCardProps {
  totalStudents: number;
  unassignedCount: number;
  groupsCount: number;
  canAssignGroups: boolean;
  onNewStudent: () => void;
  onDropStudent: () => void;
  onAssignGroup: () => void;
  onOpenMatricula: () => void;
}

export const EnrollmentCard: React.FC<EnrollmentCardProps> = ({
  totalStudents,
  unassignedCount,
  groupsCount,
  canAssignGroups,
  onNewStudent,
  onDropStudent,
  onAssignGroup,
  onOpenMatricula,
}) => (
  <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
    <div className="mb-5 flex items-center justify-between gap-3">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-violet-200">Matrícula</p>
        <h2 className="mt-1 text-xl font-black text-white">Control de altas y grupos</h2>
      </div>
      <span className="rounded-full bg-violet-500/15 px-3 py-1 text-[10px] font-black text-violet-100">{totalStudents} alumnos</span>
    </div>

    <div className="grid grid-cols-3 gap-2 text-center">
      <div className="rounded-2xl bg-slate-950/40 p-3">
        <p className="text-2xl font-black text-white">{groupsCount}</p>
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Grupos</p>
      </div>
      <div className="rounded-2xl bg-slate-950/40 p-3">
        <p className="text-2xl font-black text-amber-100">{unassignedCount}</p>
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Sin grupo</p>
      </div>
      <div className="rounded-2xl bg-slate-950/40 p-3">
        <p className="text-2xl font-black text-emerald-100">IA</p>
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Futuro</p>
      </div>
    </div>

    <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
      <button type="button" onClick={onNewStudent} className="min-h-[44px] rounded-2xl bg-violet-300 px-4 text-xs font-black uppercase tracking-widest text-slate-950">
        Alta alumno
      </button>
      <button type="button" onClick={onDropStudent} className="min-h-[44px] rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-xs font-black uppercase tracking-widest text-white">
        Baja alumno
      </button>
      <button type="button" onClick={onAssignGroup} disabled={!canAssignGroups} className="min-h-[44px] rounded-2xl border border-violet-300/30 bg-violet-500/10 px-4 text-xs font-black uppercase tracking-widest text-violet-100 disabled:cursor-not-allowed disabled:opacity-45">
        Asignar grupo
      </button>
      <button type="button" onClick={onOpenMatricula} className="min-h-[44px] rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-xs font-black uppercase tracking-widest text-white">
        Matrícula inteligente
      </button>
    </div>
    {!canAssignGroups && (
      <p className="mt-3 text-xs leading-5 text-amber-100">Asignación directa bloqueada por permisos. Usa matrícula inteligente o solicita autorización.</p>
    )}
  </section>
);
