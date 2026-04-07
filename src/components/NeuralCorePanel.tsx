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

const stateStyles: Record<SystemState, { accent: string; text: string; glow: string }> = {
  normal: { accent: "bg-emerald-500/20", text: "text-emerald-400", glow: "shadow-[0_0_15px_rgba(16,185,129,0.4)]" },
  warning: { accent: "bg-amber-500/20", text: "text-amber-400", glow: "shadow-[0_0_15px_rgba(245,158,11,0.4)]" },
  alert: { accent: "bg-red-500/20", text: "text-red-400", glow: "shadow-[0_0_15px_rgba(239,68,68,0.4)]" },
  thinking: { accent: "bg-blue-500/20", text: "text-blue-400", glow: "shadow-[0_0_15px_rgba(59,130,246,0.4)]" },
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
    <div className="w-80 glass-card-quantum overflow-hidden border-white/10 animate-[sase-panel-slide_0.4s_cubic-bezier(0.16,1,0.3,1)]">
      <div className={`px-5 py-4 border-b border-white/5 ${style.accent} relative overflow-hidden group`}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <span className={`size-2.5 rounded-full ${style.text} bg-current ${style.glow} animate-pulse`}></span>
            <span className={`text-[11px] font-black uppercase tracking-[0.4em] ${style.text} title-sase`}>
              NEURAL_CORE
            </span>
          </div>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] font-mono">
            v{version.split('-')[1] || version}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-5 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.05),transparent_50%)]"></div>
        
        {message && (
          <div className="relative z-10">
            <div className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2 flex items-center gap-2">
              <span className="w-4 h-[1px] bg-slate-800"></span>
              CORE_MSG
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <p className="text-[11px] text-blue-100/90 leading-relaxed font-medium italic">
                "{message}"
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 relative z-10">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">Status</span>
            <span className={`${style.text} text-[10px] font-black uppercase tracking-tighter title-sase`}>{state}</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">Users</span>
            <span className="text-white text-xs font-black font-mono">{connectedUsers.toString().padStart(3, '0')}</span>
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Incidencias</span>
            <span className="text-white text-xs font-black font-mono glow-text">{incidents}</span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className={`h-full ${style.text} bg-current opacity-50 shadow-[0_0_10px_currentColor] transition-all duration-1000`}
              style={{ width: `${Math.min(incidents * 20, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="pt-2 relative z-10">
          <div className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Event_Log</div>
          <div className="text-[10px] text-slate-300 font-mono bg-black/20 p-2 rounded border border-white/5 leading-tight">
            <span className="text-blue-500/50 mr-2">&gt;</span>
            {lastEvent}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes sase-panel-slide {
          from { opacity: 0; transform: translateY(10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .glow-text {
          text-shadow: 0 0 10px rgba(255,255,255,0.3);
        }
      `}</style>
    </div>
  );
};
