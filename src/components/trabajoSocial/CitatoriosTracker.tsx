import React from "react";
import {
  CitatorioRecord,
  hasThreeUnansweredCitatorios,
  TrabajoSocialCase,
  unansweredCitatoriosFor,
} from "./trabajoSocialTypes";

interface CitatoriosTrackerProps {
  selectedCase: TrabajoSocialCase | null;
  citatorios: CitatorioRecord[];
  canEdit: boolean;
  onRegisterCitatorio: (caseId: string) => void;
  onMarkAttendance: (citatorioId: string) => void;
}

const responseLabel: Record<CitatorioRecord["respuesta"], string> = {
  sin_respuesta: "Sin respuesta",
  asistio: "Asistio",
  reprogramado: "Reprogramado",
};

export const CitatoriosTracker: React.FC<CitatoriosTrackerProps> = ({
  selectedCase,
  citatorios,
  canEdit,
  onRegisterCitatorio,
  onMarkAttendance,
}) => {
  const caseCitatorios = selectedCase ? citatorios.filter((item) => item.caseId === selectedCase.id) : [];
  const unanswered = selectedCase ? unansweredCitatoriosFor(selectedCase.id, citatorios) : 0;
  const critical = selectedCase ? hasThreeUnansweredCitatorios(selectedCase.id, citatorios) : false;

  return (
    <section className={`rounded-[2rem] border p-4 md:p-5 ${critical ? "border-red-300/50 bg-red-500/10 shadow-2xl shadow-red-950/20" : "border-white/10 bg-white/[0.04]"}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.26em] text-orange-200">Control de citatorios</p>
          <h2 className="text-xl font-black text-white">Tres intentos documentados</h2>
        </div>
        <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${critical ? "bg-red-500 text-white" : "bg-white/[0.06] text-slate-300"}`}>
          {unanswered} sin respuesta
        </span>
      </div>

      {critical && (
        <div role="alert" className="mb-4 rounded-3xl border border-red-300/50 bg-red-500/20 p-4 text-sm font-black uppercase tracking-wide text-red-50">
          Padres no han respondido a 3 citatorios. Escalar seguimiento familiar.
        </div>
      )}

      {!selectedCase && <p className="text-sm font-semibold text-slate-400">Selecciona un caso para revisar citatorios.</p>}

      <div className="space-y-3">
        {caseCitatorios.map((citatorio) => (
          <div key={citatorio.id} className="rounded-3xl border border-white/10 bg-slate-950/45 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black text-white">Citatorio {citatorio.numero}</p>
                <p className="text-xs font-semibold text-slate-400">{citatorio.fecha}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${citatorio.respuesta === "sin_respuesta" ? "bg-red-500/20 text-red-100" : "bg-emerald-500/15 text-emerald-100"}`}>
                {responseLabel[citatorio.respuesta]}
              </span>
            </div>
            {citatorio.respuesta === "sin_respuesta" && (
              <button type="button" disabled={!canEdit} onClick={() => onMarkAttendance(citatorio.id)} className="mt-3 min-h-[42px] w-full rounded-2xl border border-emerald-300/30 bg-emerald-500/10 px-4 text-xs font-black uppercase tracking-widest text-emerald-100 disabled:cursor-not-allowed disabled:border-slate-700 disabled:text-slate-500">
                Marcar asistencia
              </button>
            )}
          </div>
        ))}
      </div>

      <button type="button" disabled={!selectedCase || !canEdit} onClick={() => selectedCase && onRegisterCitatorio(selectedCase.id)} className="mt-4 min-h-[52px] w-full rounded-2xl bg-orange-500 px-4 text-xs font-black uppercase tracking-widest text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400">
        Registrar citatorio
      </button>
    </section>
  );
};
