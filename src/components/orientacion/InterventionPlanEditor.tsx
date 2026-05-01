import { useState } from "react";
import { GlassCard } from "../ui/GlassCard";
import { NeoButton } from "../ui/NeoButton";
import type { OrientacionPlan } from "./orientacionTypes";

interface Props {
  plans: OrientacionPlan[];
  onCreatePlan: (payload: { objetivo: string; acciones: string; responsable: string; fechaRevision: string }) => void;
}

export function InterventionPlanEditor({ plans, onCreatePlan }: Props) {
  const [objetivo, setObjetivo] = useState("");
  const [acciones, setAcciones] = useState("");
  const [responsable, setResponsable] = useState("");
  const [fechaRevision, setFechaRevision] = useState("");

  return (
    <GlassCard className="border border-white/5 bg-slate-950/55">
      <h2 className="text-lg font-bold text-white">Plan de intervención</h2>
      <p className="mt-1 text-sm text-slate-400">Define objetivos, acciones y revisión para el caso.</p>

      <div className="mt-4 grid gap-3">
        <input className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white" value={objetivo} onChange={(e) => setObjetivo(e.target.value)} placeholder="Objetivo institucional" />
        <textarea className="min-h-24 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white" value={acciones} onChange={(e) => setAcciones(e.target.value)} placeholder="Acciones, responsables, frecuencia, acuerdos." />
        <input className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white" value={responsable} onChange={(e) => setResponsable(e.target.value)} placeholder="Responsable principal" />
        <input type="date" className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white" value={fechaRevision} onChange={(e) => setFechaRevision(e.target.value)} />
        <NeoButton onClick={() => onCreatePlan({ objetivo, acciones, responsable, fechaRevision })} className="w-full bg-violet-500/20 text-white">
          Guardar plan
        </NeoButton>
      </div>

      <div className="mt-5 space-y-2">
        {plans.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 p-3 text-sm text-slate-400">Sin planes registrados.</div>
        ) : (
          plans.slice(0, 3).map((plan) => (
            <div key={plan.id} className="rounded-xl border border-white/5 bg-black/20 p-3">
              <div className="text-sm font-semibold text-white">{plan.objetivo}</div>
              <div className="mt-1 text-sm text-slate-300">{plan.acciones}</div>
              <div className="mt-2 text-[11px] text-slate-500">Responsable: {plan.responsable}</div>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
}
