import React, { useEffect, useState } from "react";
import { getResumenGrupo, ResumenGrupo } from "../services/diagnosticosService";

interface TeacherGroupDiagnosisOverviewProps {
  grupo?: string;
  canViewNames?: boolean;
}

export const TeacherGroupDiagnosisOverview: React.FC<TeacherGroupDiagnosisOverviewProps> = ({ grupo, canViewNames = false }) => {
  const [resumen, setResumen] = useState<ResumenGrupo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!grupo) {
      setResumen(null);
      return;
    }

    const fetchResumen = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getResumenGrupo(grupo);
        setResumen(data);
      } catch (err: any) {
        console.error("Error al cargar resumen de diagnóstico:", err);
        setError("Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };

    fetchResumen();
  }, [grupo]);

  if (!grupo) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-slate-950/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-100">
            <span className="material-icons text-xl">analytics</span>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-slate-300">
            Diagnóstico Colectivo
          </span>
        </div>
        <h2 className="text-xl font-black text-white">Análisis de Tendencias</h2>
        <p className="mt-2 text-xs leading-5 text-slate-400">
          Selecciona un grupo en la lista lateral para visualizar el resumen del diagnóstico colectivo vigente y detectar alumnos en riesgo.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 animate-pulse">
        <div className="h-4 w-1/3 bg-white/5 rounded mb-4" />
        <div className="h-8 w-2/3 bg-white/5 rounded mb-6" />
        <div className="space-y-3">
          <div className="h-12 w-full bg-white/5 rounded-2xl" />
          <div className="h-12 w-full bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !resumen) {
    return (
      <div className="rounded-[2rem] border border-red-500/20 bg-red-500/5 p-5">
        <p className="text-xs text-red-400">Error al cargar el diagnóstico colectivo.</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 text-[10px] font-bold uppercase tracking-widest text-red-400/60 hover:text-red-400"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-slate-950/20">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-100">
          <span className="material-icons text-xl">analytics</span>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-indigo-300 bg-indigo-500/10">
          {resumen.grupo}
        </span>
      </div>

      <h2 className="text-xl font-black text-white">Resumen Colectivo</h2>
      
      {resumen.totalDiagnosticos === 0 ? (
        <p className="mt-2 text-xs leading-5 text-slate-400 italic">
          No hay diagnósticos registrados para este grupo en el periodo actual.
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          {/* Indicadores Clave */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white/5 p-3 text-center border border-white/5">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">Diagnósticos</p>
              <p className="text-lg font-black text-white">{resumen.totalDiagnosticos}</p>
            </div>
            <div className="rounded-2xl bg-rose-500/10 p-3 text-center border border-rose-500/10">
              <p className="text-[9px] font-bold uppercase tracking-widest text-rose-400 mb-1">Focos Rojos</p>
              <p className="text-lg font-black text-rose-400">{resumen.alumnosFocoRojo}</p>
            </div>
            <div className="rounded-2xl bg-amber-500/10 p-3 text-center border border-amber-500/10">
              <p className="text-[9px] font-bold uppercase tracking-widest text-amber-400 mb-1">Riesgo Acad.</p>
              <p className="text-lg font-black text-amber-400">{resumen.pctAprovechamientoBajo}%</p>
            </div>
          </div>

          {/* Alumnos Críticos */}
          {resumen.alumnosCriticos.length > 0 && (
            <div className="mt-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Atención Prioritaria</p>
              <div className="space-y-2">
                {resumen.alumnosCriticos.slice(0, 3).map((alumno) => (
                  <div key={alumno.alumnoId} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[11px] font-medium text-slate-200 truncate pr-2">{canViewNames ? alumno.nombre : "Estudiante Protegido"}</span>
                    <span className="flex items-center gap-1.5 rounded-md bg-rose-500/20 px-2 py-0.5 text-[9px] font-bold text-rose-400 border border-rose-500/20">
                      {alumno.indicadoresAlto} obs.
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-white/5">
             <div className="flex items-center justify-between mb-2">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estado de Convivencia</span>
               <span className={`text-[10px] font-black uppercase tracking-widest ${resumen.pctConductaAlta > 20 ? 'text-rose-400' : 'text-emerald-400'}`}>
                 {resumen.pctConductaAlta}% Alerta
               </span>
             </div>
             <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
               <div 
                 className={`h-full transition-all duration-1000 ${resumen.pctConductaAlta > 20 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                 style={{ width: `${resumen.pctConductaAlta}%` }} 
               />
             </div>
          </div>
        </div>
      )}

      <p className="mt-4 text-[9px] font-medium text-slate-500 italic text-center">
        Fuente: Módulo de Diagnóstico Colectivo SIRDE-310
      </p>
    </div>
  );
};
