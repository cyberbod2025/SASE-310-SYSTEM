import React from "react";
import {
  DIRECTION_CASE_STEPS,
  DirectionCaseStep,
  TimelineNodeStatus,
} from "./direccionTypes";

interface CaseTimelineProps {
  currentStep: DirectionCaseStep;
  completedSteps: DirectionCaseStep[];
  blockedSteps: DirectionCaseStep[];
  overdueSteps: DirectionCaseStep[];
}

const STEP_LABELS: Record<DirectionCaseStep, string> = {
  incidencia: "Incidencia",
  prefectura: "Prefectura",
  citatorio1: "Citatorio 1",
  citatorio2: "Citatorio 2",
  citatorio3: "Citatorio 3",
  orientacion: "Orientación",
  diagnostico: "Diagnóstico",
  direccion: "Dirección",
  acuerdo: "Acuerdo",
  seguimiento1: "Seguimiento 1",
  seguimiento2: "Seguimiento 2",
  seguimiento3: "Seguimiento 3",
  seguimiento4: "Seguimiento 4",
  cierre: "Cierre",
};

const statusClasses: Record<TimelineNodeStatus, string> = {
  complete: "border-emerald-400 bg-emerald-500/20 text-emerald-100",
  current: "border-blue-300 bg-blue-500/25 text-blue-50 ring-2 ring-blue-300/30",
  pending: "border-amber-300 bg-amber-500/20 text-amber-50",
  blocked: "border-slate-500 bg-slate-500/15 text-slate-300",
  overdue: "border-rose-300 bg-rose-500/25 text-rose-50 ring-2 ring-rose-300/30",
};

const getNodeStatus = (
  step: DirectionCaseStep,
  currentStep: DirectionCaseStep,
  completedSteps: DirectionCaseStep[],
  blockedSteps: DirectionCaseStep[],
  overdueSteps: DirectionCaseStep[],
): TimelineNodeStatus => {
  if (overdueSteps.includes(step)) return "overdue";
  if (blockedSteps.includes(step)) return "blocked";
  if (completedSteps.includes(step)) return "complete";
  if (step === currentStep) return "current";
  return "pending";
};

export const CaseTimeline: React.FC<CaseTimelineProps> = ({
  currentStep,
  completedSteps,
  blockedSteps,
  overdueSteps,
}) => {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 md:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-200">
            Timeline institucional
          </p>
          <h3 className="mt-1 text-lg font-black text-white">Ruta visible del caso</h3>
        </div>
        <span className="rounded-full border border-amber-300/40 bg-amber-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-100">
          Seguimiento obligatorio
        </span>
      </div>

      <div className="flex flex-col gap-3 md:grid md:grid-cols-7">
        {DIRECTION_CASE_STEPS.map((step, index) => {
          const status = getNodeStatus(step, currentStep, completedSteps, blockedSteps, overdueSteps);
          return (
            <div key={step} className="relative flex items-center gap-3 md:flex-col md:items-start">
              <div className={`flex size-10 shrink-0 items-center justify-center rounded-2xl border text-xs font-black ${statusClasses[status]}`}>
                {index + 1}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-wide text-white md:text-[10px]">
                  {STEP_LABELS[step]}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-slate-400">{status}</p>
              </div>
              {index < DIRECTION_CASE_STEPS.length - 1 && (
                <div className="absolute left-5 top-10 h-3 w-px bg-white/10 md:left-10 md:top-5 md:h-px md:w-[calc(100%-2.5rem)]" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CaseTimeline;
