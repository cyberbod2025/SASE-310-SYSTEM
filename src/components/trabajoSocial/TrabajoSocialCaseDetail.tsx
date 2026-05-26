import React from "react";
import {
  CitatorioRecord,
  ComplianceAgreement,
  ContactType,
  FamilyContactRecord,
  HomeVisitRecord,
  statusLabels,
  TrabajoSocialCase,
} from "./trabajoSocialTypes";

interface TrabajoSocialCaseDetailProps {
  selectedCase: TrabajoSocialCase | null;
  citatorios: CitatorioRecord[];
  contacts: FamilyContactRecord[];
  visits: HomeVisitRecord[];
  agreements: ComplianceAgreement[];
  canEdit: boolean;
  canEscalate: boolean;
  canViewSensitive: boolean;
  lastAction: string | null;
  onRegisterContact: (caseId: string, tipo: ContactType, resultado: string) => void;
  onRegisterVisit: (caseId: string, observaciones: string) => void;
  onEscalate: (caseId: string) => void;
  onReturnToOrientacion: (caseId: string) => void;
}

export const TrabajoSocialCaseDetail: React.FC<TrabajoSocialCaseDetailProps> = ({
  selectedCase,
  citatorios,
  contacts,
  visits,
  agreements,
  canEdit,
  canEscalate,
  canViewSensitive,
  lastAction,
  onRegisterContact,
  onRegisterVisit,
  onEscalate,
  onReturnToOrientacion,
}) => {
  if (!selectedCase) {
    return (
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center text-sm font-semibold text-slate-400">
        Selecciona un caso para ver detalle operativo.
      </section>
    );
  }

  const caseCitatorios = citatorios.filter((citatorio) => citatorio.caseId === selectedCase.id);
  const caseContacts = contacts.filter((contact) => contact.caseId === selectedCase.id);
  const caseVisits = visits.filter((visit) => visit.caseId === selectedCase.id);
  const caseAgreements = agreements.filter((agreement) => agreement.caseId === selectedCase.id);

  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-4 shadow-2xl shadow-black/30 md:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.26em] text-orange-200 flex items-center gap-1.5">
            <span>Detalle de caso</span>
            <span className="rounded bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-amber-500">
              ⚠️ BORRADOR LOCAL
            </span>
          </p>
          <h2 className="text-2xl font-black text-white">{selectedCase.alumno}</h2>
          <p className="mt-1 text-sm font-semibold text-slate-400">{selectedCase.grupo} · responsable previo: {selectedCase.responsablePrevio}</p>
        </div>
        <span className="rounded-full border border-orange-300/30 bg-orange-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-orange-100">
          {statusLabels[selectedCase.estadoIntervencion]}
        </span>
      </div>

      {lastAction && (
        <div className="mt-4 rounded-3xl border border-amber-300/30 bg-amber-500/10 p-3 text-sm font-bold text-amber-100 flex items-center gap-2">
          <span className="material-icons text-xs text-amber-300">warning</span>
          <span>{lastAction}</span>
        </div>
      )}

      <div className="mt-5 space-y-4">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Resumen del caso</p>
          <p className="mt-2 text-sm leading-6 text-slate-200">{selectedCase.motivo}</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">Riesgo operativo: {selectedCase.riesgo}/100</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Intervencion definida</p>
          <p className="mt-2 text-sm leading-6 text-slate-200">{selectedCase.interventionPlan}</p>
          <p className="mt-3 rounded-2xl bg-slate-950/50 p-3 text-xs font-black uppercase tracking-widest text-slate-400">Solo lectura: Trabajo Social ejecuta, no diagnostica.</p>
        </div>

        {canViewSensitive && (
          <div className="rounded-3xl border border-orange-300/20 bg-orange-500/10 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-orange-100">Datos familiares sensibles</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">Visible por permiso institucional. Registrar solo evidencia necesaria y verificable.</p>
          </div>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-center">
          <p className="text-2xl font-black text-white">{caseCitatorios.length}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Citatorios</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-center">
          <p className="text-2xl font-black text-white">{caseContacts.length}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Contactos</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-center">
          <p className="text-2xl font-black text-white">{caseVisits.length}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Visitas</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-center">
          <p className="text-2xl font-black text-white">{caseAgreements.length}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Acuerdos</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button type="button" disabled={!canEdit} onClick={() => onRegisterContact(selectedCase.id, "llamada", "Contacto rapido desde detalle.")} className="min-h-[48px] rounded-2xl bg-orange-500 px-4 text-xs font-black uppercase tracking-widest text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 hover:bg-orange-400">
          Registrar contacto (registro local)
        </button>
        <button type="button" disabled={!canEdit} onClick={() => onRegisterVisit(selectedCase.id, "Visita rapida desde detalle.")} className="min-h-[48px] rounded-2xl border border-orange-300/30 bg-orange-500/10 px-4 text-xs font-black uppercase tracking-widest text-orange-100 disabled:cursor-not-allowed disabled:border-slate-700 disabled:text-slate-500 hover:bg-orange-500/20">
          Registrar visita (borrador local)
        </button>
        <button type="button" disabled={!canEscalate} onClick={() => onEscalate(selectedCase.id)} className="min-h-[48px] rounded-2xl border border-red-300/40 bg-red-500/15 px-4 text-xs font-black uppercase tracking-widest text-red-100 disabled:cursor-not-allowed disabled:border-slate-700 disabled:text-slate-500 hover:bg-red-500/35">
          Escalar a Dirección (en preparación)
        </button>
        <button type="button" disabled={!canEdit} onClick={() => onReturnToOrientacion(selectedCase.id)} className="min-h-[48px] rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-xs font-black uppercase tracking-widest text-white disabled:cursor-not-allowed disabled:text-slate-500 hover:bg-white/[0.12]">
          Devolver a Orientación (en preparación)
        </button>
      </div>

      <div className="mt-4 rounded-3xl border border-slate-500/20 bg-slate-900/60 p-4 text-sm font-bold text-slate-300">
        Cierre final bloqueado: solo Direccion puede cerrar el caso.
      </div>
    </section>
  );
};
