import React from "react";
import { useApp } from "../../store";
import { EmergencyAlert, EmergencyResponse } from "../../types/emergency";
import { User, MapPin, Check, Info } from "lucide-react";

interface EmergencyStatusPanelProps {
  alert: EmergencyAlert;
}

export const EmergencyStatusPanel: React.FC<EmergencyStatusPanelProps> = ({ alert }) => {
  const { emergencyResponses } = useApp();
  const responses = emergencyResponses[alert.id] || [];

  const getStatusConfig = (respuesta: EmergencyResponse['respuesta']) => {
    switch (respuesta) {
      case 'enterado': return { label: 'Enterado', color: 'text-blue-400', bg: 'bg-blue-400/10' };
      case 'voy_en_camino': return { label: 'Voy en camino', color: 'text-amber-400', bg: 'bg-amber-400/10' };
      case 'atendida': return { label: 'Atendido', color: 'text-emerald-400', bg: 'bg-emerald-400/10' };
      case 'no_disponible': return { label: 'No disponible', color: 'text-slate-400', bg: 'bg-slate-400/10' };
      default: return { label: 'Pendiente', color: 'text-slate-500', bg: 'bg-slate-500/10' };
    }
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-white/5 bg-white/[0.02] p-5">
      <div className="flex items-center gap-2 mb-4">
        <Info className="h-4 w-4 text-blue-400" />
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Estado en tiempo real</h4>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto max-h-48 pr-2 custom-scrollbar">
        {responses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-24 text-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-500 mb-2"></div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Esperando respuesta del staff...</p>
          </div>
        ) : (
          responses.map((resp) => {
            const config = getStatusConfig(resp.respuesta);
            return (
              <div key={resp.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                    <User className="h-4 w-4 text-slate-300" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-none">{resp.usuario_nombre}</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">{resp.rol}</p>
                  </div>
                </div>
                <div className={`px-2.5 py-1 rounded-full ${config.bg} ${config.color} text-[9px] font-black uppercase tracking-wider border border-current/20`}>
                  {config.label}
                </div>
              </div>
            );
          })
        )}
      </div>

      {responses.some(r => r.respuesta === 'voy_en_camino') && (
        <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 animate-pulse">
          <MapPin className="h-5 w-5 text-amber-500" />
          <p className="text-[10px] font-black text-amber-200 uppercase tracking-wider">Ayuda en trayecto</p>
        </div>
      )}
    </div>
  );
};
