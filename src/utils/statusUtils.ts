import { CaseState } from "../types";

export const getStatusColors = (state: CaseState) => {
  switch (state) {
    case CaseState.CERRADO:
      return "bg-emerald-500 text-white";
    case CaseState.OBSERVADO:
      return "bg-blue-500 text-white";
    case CaseState.EN_ANALISIS:
      return "bg-amber-500 text-white";
    case CaseState.PATRON_DETECTADO:
      return "bg-rose-500 text-white";
    case CaseState.INTERVENCION:
      return "bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]";
    case CaseState.SEGUIMIENTO:
      return "bg-indigo-500 text-white";
    default:
      return "bg-slate-400 text-white";
  }
};

export const getStatusIcon = (state: CaseState) => {
  switch (state) {
    case CaseState.CERRADO:
      return "check_circle";
    case CaseState.OBSERVADO:
      return "visibility";
    case CaseState.EN_ANALISIS:
      return "analytics";
    case CaseState.PATRON_DETECTADO:
      return "warning";
    case CaseState.INTERVENCION:
      return "priority_high";
    case CaseState.SEGUIMIENTO:
      return "sync";
    default:
      return "help_outline";
  }
};
