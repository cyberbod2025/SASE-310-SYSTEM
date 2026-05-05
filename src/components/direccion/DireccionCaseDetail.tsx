import React from "react";
import { CaseLabels } from "../../types";
import { CaseTimeline } from "./CaseTimeline";
import { ClosureGuard } from "./ClosureGuard";
import { FollowUpCard } from "./FollowUpCard";
import type { DirectionCase } from "./direccionTypes";

interface DireccionCaseDetailProps {
  caseItem: DirectionCase;
  canCloseCase: boolean;
  canViewSensitive: boolean;
  onBack: () => void;
  onCloseCase: () => void;
  onReopenCase: () => void;
  onEscalateCase: () => void;
  onScheduleFollowUp: () => void;
  onRegisterEvidence: () => void;
}

export const DireccionCaseDetail: React.FC<DireccionCaseDetailProps> = ({
  caseItem,
  canCloseCase,
  canViewSensitive,
  onBack,
  onCloseCase,
  onReopenCase,
  onEscalateCase,
  onScheduleFollowUp,
  onRegisterEvidence,
}) => {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 pb-8 pt-4 md:px-6">
      <button
        type="button"
        onClick={onBack}
        className="min-h-[44px] w-fit rounded-2xl border border-white/10 bg-white/10 px-4 text-xs font-black uppercase tracking-widest text-white hover:bg-white/15"
      >
        Volver a Dirección
      </button>

      <div className="rounded-[2rem] border border-blue-200/20 bg-blue-950/50 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-100">/direccion/caso/{caseItem.id}</p>
            <h1 className="mt-2 text-2xl font-black text-white">{caseItem.alumno}</h1>
            <p className="mt-1 text-sm text-blue-100/80">
              {caseItem.grupo} · {CaseLabels[caseItem.estado]} · Riesgo {caseItem.riesgo}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <button type="button" onClick={onReopenCase} className="rounded-xl bg-white/10 px-3 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/15">
              Reabrir
            </button>
            <button type="button" onClick={onEscalateCase} className="rounded-xl bg-white/10 px-3 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/15">
              Escalar
            </button>
            <button type="button" onClick={onScheduleFollowUp} className="rounded-xl bg-white/10 px-3 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/15">
              Programar
            </button>
          </div>
        </div>
      </div>

      <CaseTimeline
        currentStep={caseItem.currentStep}
        completedSteps={caseItem.completedSteps}
        blockedSteps={caseItem.blockedSteps}
        overdueSteps={caseItem.overdueSteps}
      />

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-lg font-black text-white">Datos del alumno</h2>
            <div className="mt-4 grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
              <p><span className="text-slate-400">Matrícula:</span> {caseItem.student.matricula}</p>
              <p><span className="text-slate-400">Grupo:</span> {caseItem.grupo}</p>
              {canViewSensitive ? (
                <p className="sm:col-span-2"><span className="text-slate-400">Datos sensibles:</span> {caseItem.sensitiveSummary}</p>
              ) : (
                <p className="sm:col-span-2 text-amber-100">Datos sensibles ocultos por permisos.</p>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-lg font-black text-white">Incidencias</h2>
            <div className="mt-4 space-y-3">
              {caseItem.incidents.length === 0 ? (
                <p className="text-sm text-slate-400">Sin incidencias registradas en memoria local.</p>
              ) : (
                caseItem.incidents.map((incident) => (
                  <div key={incident.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-200">
                    <p className="font-bold text-white">{incident.type}</p>
                    <p className="mt-1 text-slate-300">{incident.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InfoBlock title="Citatorios" value="Citatorio 1-3 según trazabilidad del caso." />
            <InfoBlock title="Diagnósticos" value={caseItem.closureChecks.teacherDiagnosis ? "Diagnóstico docente disponible." : "Diagnóstico docente pendiente."} />
            <InfoBlock title="Acuerdos firmados" value={caseItem.closureChecks.evidence ? "Evidencia/acuerdo disponible." : "Acuerdo o evidencia pendiente."} />
            <InfoBlock title="Seguimientos" value={`${caseItem.followUps.filter((item) => item.estado === "completed").length}/4 registrados.`} />
          </div>
        </div>

        <aside className="space-y-4">
          <ClosureGuard checks={caseItem.closureChecks} canCloseCase={canCloseCase} onCloseCase={onCloseCase} />
          {caseItem.followUps.map((followUp) => (
            <FollowUpCard
              key={followUp.id}
              followUp={followUp}
              onRegisterEvidence={onRegisterEvidence}
              onReschedule={onScheduleFollowUp}
              onMarkAttendance={onRegisterEvidence}
              onReopenCase={onReopenCase}
            />
          ))}
        </aside>
      </div>
    </section>
  );
};

const InfoBlock = ({ title, value }: { title: string; value: string }) => (
  <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4">
    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-100/70">{title}</p>
    <p className="mt-2 text-sm text-white">{value}</p>
  </div>
);

export default DireccionCaseDetail;
