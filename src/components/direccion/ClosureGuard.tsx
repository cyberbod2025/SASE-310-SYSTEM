import React from "react";
import type { ClosureChecks } from "./direccionTypes";

interface ClosureGuardProps {
  checks: ClosureChecks;
  canCloseCase: boolean;
  onCloseCase: () => void;
}

const missingLabels: Record<keyof ClosureChecks, string> = {
  followUpsComplete: "seguimiento",
  evidence: "evidencia",
  teacherDiagnosis: "diagnóstico docente",
};

export const ClosureGuard: React.FC<ClosureGuardProps> = ({ checks, canCloseCase, onCloseCase }) => {
  const missing = (Object.keys(checks) as Array<keyof ClosureChecks>).filter((key) => !checks[key]);

  if (!canCloseCase) return null;

  if (missing.length > 0) {
    return (
      <div className="rounded-[2rem] border border-rose-300/30 bg-rose-500/10 p-4 text-rose-50">
        <p className="text-sm font-black">No puedes cerrar este caso.</p>
        <p className="mt-1 text-xs text-rose-100/80">
          Faltan: {missing.map((key) => missingLabels[key]).join(" / ")}
        </p>
        <p className="mt-3 text-[10px] font-black uppercase tracking-[0.22em] text-rose-100/70">
          Si no hay seguimiento, no hay cierre.
        </p>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onCloseCase}
      className="min-h-[48px] rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-black uppercase tracking-widest text-emerald-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
    >
      Cerrar caso con seguimiento completo
    </button>
  );
};

export default ClosureGuard;
