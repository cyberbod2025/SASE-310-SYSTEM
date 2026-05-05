import { useState } from "react";
import { GlassCard } from "../ui/GlassCard";
import { NeoButton } from "../ui/NeoButton";
import type { OrientacionFollowUp } from "./orientacionTypes";

interface Props {
  followUps: OrientacionFollowUp[];
  onAddFollowUp: (payload: { tipo: string; descripcion: string; evidenciaUrl: string }) => void;
}

export function OrientacionFollowUpPanel({ followUps, onAddFollowUp }: Props) {
  const [tipo, setTipo] = useState("nota");
  const [descripcion, setDescripcion] = useState("");
  const [evidenciaUrl, setEvidenciaUrl] = useState("");

  return (
    <GlassCard className="border border-white/5 bg-slate-950/55">
      <h2 className="text-lg font-bold text-white">Seguimiento y evidencia</h2>
      <div className="mt-4 grid gap-3">
        <select className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white" value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="nota">Nota</option>
          <option value="entrevista">Entrevista</option>
          <option value="diagnostico">Diagnóstico</option>
          <option value="plan">Plan</option>
          <option value="derivacion">Derivación</option>
          <option value="escalamiento">Escalamiento</option>
          <option value="evidencia">Evidencia</option>
        </select>
        <textarea className="min-h-24 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Describe el seguimiento, el acuerdo o la evidencia." />
        <input className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white" value={evidenciaUrl} onChange={(e) => setEvidenciaUrl(e.target.value)} placeholder="URL de evidencia (opcional)" />
        <NeoButton onClick={() => onAddFollowUp({ tipo, descripcion, evidenciaUrl })} className="w-full bg-violet-500/20 text-white">
          Registrar seguimiento
        </NeoButton>
      </div>

      <div className="mt-5 space-y-2">
        {followUps.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 p-3 text-sm text-slate-400">Sin seguimientos recientes.</div>
        ) : (
          followUps.slice(0, 5).map((item) => (
            <div key={item.id} className="rounded-xl border border-white/5 bg-black/20 p-3">
              <div className="text-xs uppercase tracking-[0.16em] text-violet-200">{item.tipo}</div>
              <div className="mt-1 text-sm text-slate-200">{item.descripcion}</div>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
}
