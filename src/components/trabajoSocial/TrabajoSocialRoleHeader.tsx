import React from "react";
import { SOSButton } from "../core/SOSButton";

interface TrabajoSocialRoleHeaderProps {
  searchValue: string;
  activeCasesCount: number;
  criticalAlertsCount: number;
  onSearchChange: (value: string) => void;
  onOpenSasito: () => void;
  onSOS: () => Promise<void> | void;
}

export const TrabajoSocialRoleHeader: React.FC<TrabajoSocialRoleHeaderProps> = ({
  searchValue,
  activeCasesCount,
  criticalAlertsCount,
  onSearchChange,
  onOpenSasito,
  onSOS,
}) => (
  <header className="sticky top-0 z-30 -mx-4 border-b border-orange-200/10 bg-slate-950/90 px-4 py-4 backdrop-blur-2xl md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-orange-300/50 bg-orange-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-orange-100">
            TRABAJO SOCIAL
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-300">
            Seguimiento familiar
          </span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">Intervención en campo</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
          Citatorios, llamadas, visitas y acuerdos verificables. Si no hay seguimiento, el caso no existe en la vida real.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:min-w-[560px]">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Casos</p>
            <p className="text-2xl font-black text-white">{activeCasesCount}</p>
          </div>
          <div className="rounded-2xl border border-red-300/30 bg-red-500/10 px-4 py-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-red-200">Alertas</p>
            <p className="text-2xl font-black text-red-100">{criticalAlertsCount}</p>
          </div>
          <button type="button" onClick={onOpenSasito} className="min-h-[56px] rounded-2xl bg-orange-500/20 px-4 text-xs font-black uppercase tracking-widest text-orange-100 ring-1 ring-orange-300/30">
            Sasito operativo
          </button>
          <SOSButton
            compact
            onActivate={onSOS}
            confirmationMessage="Alerta crítica registrada en modo local. La notificación automática institucional está en preparación."
          />
        </div>

        <label className="relative block">
          <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-lg text-orange-200">search</span>
          <input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar alumno, grupo o responsable previo"
            className="min-h-[52px] w-full rounded-2xl border border-white/10 bg-white/[0.06] py-3 pl-12 pr-4 text-sm font-bold text-white outline-none transition placeholder:text-slate-500 focus:border-orange-300/50"
          />
        </label>
      </div>
    </div>
  </header>
);
