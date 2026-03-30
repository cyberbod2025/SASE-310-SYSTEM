import React from "react";
import { Advertencia } from "./detectarAdvertencias";

interface PanelAdvertenciasProps {
  advertencias: Advertencia[];
  incidenciasPrevias?: { cantidad: number; resumen: string[] };
}

/**
 * Panel lateral que muestra advertencias de calidad documental:
 * - Lenguaje subjetivo detectado
 * - Campos incompletos
 * - Incidencias previas del alumno
 */
export const PanelAdvertencias: React.FC<PanelAdvertenciasProps> = ({
  advertencias,
  incidenciasPrevias,
}) => {
  const criticas = advertencias.filter((a) => a.severidad === "critical");
  const warnings = advertencias.filter((a) => a.severidad === "warning");
  const infos = advertencias.filter((a) => a.severidad === "info");

  if (
    advertencias.length === 0 &&
    (!incidenciasPrevias || incidenciasPrevias.cantidad === 0)
  ) {
    return (
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
        <span className="material-symbols-outlined text-emerald-500 text-xl">
          verified
        </span>
        <div>
          <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wide">
            Sin advertencias
          </p>
          <p className="text-[10px] text-emerald-600 font-medium">
            El texto cumple con los criterios de redacción institucional.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Incidencias previas */}
      {incidenciasPrevias && incidenciasPrevias.cantidad > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-blue-500 text-lg">
              history
            </span>
            <p className="text-[10px] font-black text-blue-700 uppercase tracking-wide">
              {incidenciasPrevias.cantidad} Incidencias Previas Detectadas
            </p>
          </div>
          <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar">
            {incidenciasPrevias.resumen.map((r, i) => (
              <p
                key={i}
                className="text-[10px] text-blue-600 font-medium bg-white/50 px-3 py-1.5 rounded-lg border border-blue-100"
              >
                {r}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Advertencias críticas */}
      {criticas.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-rose-500 text-lg">
              error
            </span>
            <p className="text-[10px] font-black text-rose-700 uppercase tracking-wide">
              {criticas.length} Problema{criticas.length > 1 ? "s" : ""} Crítico
              {criticas.length > 1 ? "s" : ""}
            </p>
          </div>
          <div className="space-y-2">
            {criticas.map((a, i) => (
              <div
                key={i}
                className="bg-white/80 border border-rose-100 rounded-lg p-3"
              >
                <p className="text-[10px] font-bold text-rose-800">{a.texto}</p>
                <p className="text-[10px] text-rose-600 mt-1 italic">
                  💡 {a.sugerencia}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advertencias de precaución */}
      {warnings.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-amber-500 text-lg">
              warning
            </span>
            <p className="text-[10px] font-black text-amber-700 uppercase tracking-wide">
              {warnings.length} Advertencia{warnings.length > 1 ? "s" : ""}
            </p>
          </div>
          <div className="space-y-2">
            {warnings.map((a, i) => (
              <div
                key={i}
                className="bg-white/80 border border-amber-100 rounded-lg p-3"
              >
                <p className="text-[10px] font-bold text-amber-800">
                  {a.texto}
                </p>
                <p className="text-[10px] text-amber-600 mt-1 italic">
                  💡 {a.sugerencia}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      {infos.length > 0 && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="space-y-2">
            {infos.map((a, i) => (
              <p key={i} className="text-[10px] text-slate-500 font-medium">
                ℹ️ {a.sugerencia}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
