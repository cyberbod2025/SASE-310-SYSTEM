import React from "react";
import { SOSButton } from "./SOSButton";

interface RoleHeaderProps {
  searchValue: string;
  notificationsCount: number;
  onSearchChange: (value: string) => void;
  onOpenSasito: () => void;
  onOpenFeedback: () => void;
  onSOS: () => Promise<void> | void;
}

export const RoleHeader: React.FC<RoleHeaderProps> = ({
  searchValue,
  notificationsCount,
  onSearchChange,
  onOpenSasito,
  onOpenFeedback,
  onSOS,
}) => {
  return (
    <header className="sticky top-0 z-30 -mx-4 mb-4 border-b border-blue-200/10 bg-slate-950/95 px-4 py-3 shadow-xl shadow-slate-950/30 md:-mx-0 md:rounded-[2rem] md:border md:bg-blue-950/70 md:px-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="inline-flex rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-amber-100">
              Dirección
            </span>
            <h1 className="mt-2 text-xl font-black text-white md:text-2xl">Panorama institucional verificable</h1>
          </div>
          <SOSButton compact onActivate={onSOS} />
        </div>

        <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 md:min-w-[560px]">
          <label className="relative block">
            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-base text-blue-100/60">search</span>
            <input
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Buscar alumno, grupo o caso"
              className="h-11 w-full rounded-2xl border border-white/10 bg-white/10 pl-10 pr-3 text-sm text-white outline-none placeholder:text-blue-100/40 focus:border-amber-200/60"
            />
          </label>
          <button type="button" className="relative flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white">
            <span className="material-icons text-lg">notifications</span>
            {notificationsCount > 0 && (
              <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white">
                {notificationsCount > 9 ? "9+" : notificationsCount}
              </span>
            )}
          </button>
          <button type="button" onClick={onOpenSasito} className="flex size-11 items-center justify-center rounded-2xl border border-blue-200/20 bg-blue-400/10 text-blue-100">
            <span className="material-icons text-lg">auto_awesome</span>
          </button>
          <button type="button" onClick={onOpenFeedback} className="flex size-11 items-center justify-center rounded-2xl border border-amber-200/20 bg-amber-400/10 text-amber-100">
            <span className="material-icons text-lg">feedback</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default RoleHeader;
