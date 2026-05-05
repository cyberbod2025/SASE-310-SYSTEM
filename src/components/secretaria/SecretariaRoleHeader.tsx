import React from "react";
import { SOSButton } from "../core/SOSButton";

interface SecretariaRoleHeaderProps {
  searchValue: string;
  notificationsCount: number;
  onSearchChange: (value: string) => void;
  onOpenSasito: () => void;
  onOpenFeedback: () => void;
  onSOS: () => void;
}

export const SecretariaRoleHeader: React.FC<SecretariaRoleHeaderProps> = ({
  searchValue,
  notificationsCount,
  onSearchChange,
  onOpenSasito,
  onOpenFeedback,
  onSOS,
}) => (
  <header className="sticky top-0 z-20 -mx-4 border-b border-violet-200/10 bg-slate-950/85 px-4 py-4 backdrop-blur-2xl md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-violet-300/40 bg-violet-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-violet-100">
            SECRETARÍA
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-300">
            Control escolar
          </span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">Gestión administrativa</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
          Expedientes, documentos, matrícula, agenda institucional y cierre de ciclo en una vista clara.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(220px,1fr)_auto] xl:min-w-[520px]">
        <label className="relative block">
          <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-lg text-violet-200">search</span>
          <input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar alumno, matrícula o CURP"
            className="min-h-[48px] w-full rounded-2xl border border-white/10 bg-white/[0.06] py-3 pl-12 pr-4 text-sm font-bold text-white outline-none transition placeholder:text-slate-500 focus:border-violet-300/50"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <button type="button" className="relative min-h-[44px] rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-xs font-black uppercase tracking-widest text-white">
            <span className="material-icons align-middle text-base">notifications</span>
            {notificationsCount > 0 && (
              <span className="absolute -right-1 -top-1 rounded-full bg-violet-300 px-1.5 py-0.5 text-[9px] text-slate-950">{notificationsCount}</span>
            )}
          </button>
          <button type="button" onClick={onOpenSasito} className="min-h-[44px] rounded-2xl bg-violet-500/20 px-4 text-xs font-black uppercase tracking-widest text-violet-100 ring-1 ring-violet-300/30">
            Sasito admin
          </button>
          <button type="button" onClick={onOpenFeedback} className="min-h-[44px] rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-xs font-black uppercase tracking-widest text-white">
            Feedback
          </button>
          <SOSButton compact onActivate={onSOS} />
        </div>
      </div>
    </div>
  </header>
);
