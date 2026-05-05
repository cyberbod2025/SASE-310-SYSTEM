import React from "react";
import { SOSButton } from "../core/SOSButton";

interface DocenteRoleHeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onOpenSasito: () => void;
  onSOS: () => void;
}

export const DocenteRoleHeader: React.FC<DocenteRoleHeaderProps> = ({
  searchValue,
  onSearchChange,
  onOpenSasito,
  onSOS,
}) => (
  <header className="sticky top-0 z-30 -mx-4 border-b border-emerald-200/10 bg-slate-950/85 px-4 py-4 backdrop-blur-2xl md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-emerald-300/40 bg-emerald-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-emerald-100">
            DOCENTE
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-300">
            Reporte rápido
          </span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">Aula en 10 segundos</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
          Registra incidencias sin burocracia: alumno, tipo, guardar. Evidencia opcional.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(220px,1fr)_auto] lg:min-w-[500px]">
        <label className="relative block">
          <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-lg text-emerald-200">search</span>
          <input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar alumno"
            className="min-h-[48px] w-full rounded-2xl border border-white/10 bg-white/[0.06] py-3 pl-12 pr-4 text-sm font-bold text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/50"
          />
        </label>
        <div className="flex items-center gap-2 sm:justify-end">
          <button type="button" onClick={onOpenSasito} className="min-h-[44px] rounded-2xl bg-emerald-500/20 px-4 text-xs font-black uppercase tracking-widest text-emerald-100 ring-1 ring-emerald-300/30">
            Sasito simple
          </button>
          <SOSButton compact onActivate={onSOS} />
        </div>
      </div>
    </div>
  </header>
);
