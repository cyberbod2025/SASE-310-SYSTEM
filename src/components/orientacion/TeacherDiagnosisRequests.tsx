import { useEffect, useState } from "react";
import { GlassCard } from "../ui/GlassCard";
import { NeoButton } from "../ui/NeoButton";
import type { OrientacionDiagnosisRequest, OrientacionDocenteOption } from "./orientacionTypes";

interface Props {
  requests: OrientacionDiagnosisRequest[];
  docentes: OrientacionDocenteOption[];
  onRequest: (docenteId: string, observaciones: string) => void;
}

export function TeacherDiagnosisRequests({ requests, docentes, onRequest }: Props) {
  const [docenteId, setDocenteId] = useState(docentes[0]?.id ?? "");
  const [observaciones, setObservaciones] = useState("");

  useEffect(() => {
    if (!docenteId && docentes[0]?.id) {
      setDocenteId(docentes[0].id);
    }
  }, [docenteId, docentes]);

  return (
    <GlassCard className="border border-white/5 bg-slate-950/55">
      <h2 className="text-lg font-bold text-white">Solicitudes de diagnóstico</h2>
      <p className="mt-1 text-sm text-slate-400">Envía una solicitud solo a docentes asignados.</p>

      <div className="mt-4 grid gap-3">
        <label className="grid gap-1 text-sm text-slate-300">
          Docente
          <select className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white" value={docenteId} onChange={(e) => setDocenteId(e.target.value)}>
            <option value="">Selecciona un docente</option>
            {docentes.map((docente) => (
              <option key={docente.id} value={docente.id}>{docente.nombreCompleto}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm text-slate-300">
          Observaciones
          <textarea className="min-h-24 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} placeholder="Contexto del caso, puntos a evaluar, fecha límite, etc." />
        </label>
        <NeoButton onClick={() => onRequest(docenteId, observaciones)} className="w-full bg-violet-500/20 text-white">
          Enviar solicitud
        </NeoButton>
      </div>

      <div className="mt-5 space-y-2">
        {requests.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 p-3 text-sm text-slate-400">Sin solicitudes de diagnóstico aún.</div>
        ) : (
          requests.slice(0, 4).map((request) => (
            <div key={request.id} className="rounded-xl border border-white/5 bg-black/20 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-white">Solicitud {request.estado}</div>
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-slate-300">{request.fechaSolicitud}</span>
              </div>
              <div className="mt-2 text-sm text-slate-300">{request.observaciones ?? "Sin observaciones"}</div>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
}
