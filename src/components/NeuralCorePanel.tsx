import React from "react";
import type { SystemState } from "../types/systemState";

interface NeuralCorePanelProps {
  state: SystemState;
  incidents: number;
  connectedUsers: number;
  lastEvent: string;
  message?: string;
  version?: string;
}

const stateStyles: Record<SystemState, { accent: string; text: string }> = {
  normal: { accent: "bg-emerald-500/20", text: "text-emerald-400" },
  warning: { accent: "bg-amber-500/20", text: "text-amber-400" },
  alert: { accent: "bg-red-500/20", text: "text-red-400" },
  thinking: { accent: "bg-blue-500/20", text: "text-blue-400" },
};

export const NeuralCorePanel: React.FC<NeuralCorePanelProps> = ({
  state,
  incidents,
  connectedUsers,
  lastEvent,
  message,
  version = "SASE-310",
}) => {
  const style = stateStyles[state];

  return (
    <div className="w-72 rounded-2xl border border-white/10 bg-[#0b0f16]/80 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.55)] overflow-hidden">
      <div className={`px-4 py-3 border-b border-white/5 ${style.accent}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`size-2 rounded-full ${style.text} bg-current shadow-[0_0_8px_currentColor]`}></span>
            <span className={`text-[10px] font-black uppercase tracking-[0.35em] ${style.text}`}>
              NEURAL CORE
            </span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
            {version}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {message && (
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Mensaje SASE
            </div>
            <p className="text-[11px] text-slate-200 leading-snug mt-1">
              {message}
            </p>
          </div>
        )}
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em]">
          <span className="text-slate-400">Estado</span>
          <span className={`${style.text}`}>{state}</span>
        </div>
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em]">
          <span className="text-slate-400">Incidencias</span>
          <span className="text-white tabular-nums">{incidents}</span>
        </div>
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em]">
          <span className="text-slate-400">Usuarios</span>
          <span className="text-white tabular-nums">{connectedUsers}</span>
        </div>
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Ultimo evento
          </div>
          <p className="text-[11px] text-slate-300 leading-snug mt-1">
            {lastEvent}
          </p>
        </div>
      </div>
    </div>
  );
};
