import React from "react";

interface TeacherGroupDiagnosisOverviewProps {
  grupo?: string;
}

/**
 * Componente temporal para restaurar el flujo de construcción.
 * Proporciona un estado visual seguro para el resumen de diagnósticos.
 */
export const TeacherGroupDiagnosisOverview: React.FC<TeacherGroupDiagnosisOverviewProps> = ({ grupo }) => {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-slate-950/20">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-100">
          <span className="material-icons text-xl">analytics</span>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-slate-300">
          {grupo || "General"}
        </span>
      </div>
      <h2 className="text-xl font-black text-white">Resumen de Diagnóstico</h2>
      <p className="mt-2 text-xs leading-5 text-slate-400">
        Módulo de diagnóstico en preparación. Los datos de tendencias y progreso de aplicación aparecerán aquí próximamente.
      </p>
      <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-white/5">
        <div className="h-full w-1/3 bg-indigo-500/40" />
      </div>
      <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-indigo-200/60">
        Estado: Inicializando datos...
      </p>
    </div>
  );
};
