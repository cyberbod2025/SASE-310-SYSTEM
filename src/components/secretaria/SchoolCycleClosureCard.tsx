import React from "react";

interface SchoolCycleClosureCardProps {
  totalStudents: number;
  incompleteCount: number;
  unassignedCount: number;
  onOpenClosure: () => void;
  onSimulatePromotion: () => void;
}

export const SchoolCycleClosureCard: React.FC<SchoolCycleClosureCardProps> = ({
  totalStudents,
  incompleteCount,
  unassignedCount,
  onOpenClosure,
  onSimulatePromotion,
}) => (
  <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-violet-950/60 via-slate-950 to-slate-950 p-5 shadow-2xl shadow-slate-950/30">
    <div className="mb-5">
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-violet-100">Cierre de ciclo</p>
      <h2 className="mt-1 text-xl font-black text-white">Promoción, reprobación y egreso</h2>
      <p className="mt-2 text-xs leading-5 text-slate-300">
        Preparado para integrar RPC: <span className="font-mono text-violet-100">simular_promocion</span> y <span className="font-mono text-violet-100">ejecutar_promocion</span>.
      </p>
    </div>

    <div className="grid grid-cols-3 gap-2 text-center">
      <div className="rounded-2xl bg-white/[0.05] p-3">
        <p className="text-2xl font-black text-white">{totalStudents}</p>
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Base</p>
      </div>
      <div className="rounded-2xl bg-white/[0.05] p-3">
        <p className="text-2xl font-black text-amber-100">{incompleteCount}</p>
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Revisar</p>
      </div>
      <div className="rounded-2xl bg-white/[0.05] p-3">
        <p className="text-2xl font-black text-rose-100">{unassignedCount}</p>
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Bloqueos</p>
      </div>
    </div>

    <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
      <button type="button" onClick={onSimulatePromotion} className="min-h-[44px] rounded-2xl border border-violet-300/30 bg-violet-500/10 px-4 text-xs font-black uppercase tracking-widest text-violet-100">
        Simular promoción
      </button>
      <button type="button" onClick={onOpenClosure} className="min-h-[44px] rounded-2xl bg-violet-300 px-4 text-xs font-black uppercase tracking-widest text-slate-950">
        Preparar cierre
      </button>
    </div>
  </section>
);
