import React, { useState } from "react";
import { useApp } from "../../store";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, 
  Clock, 
  MapPin, 
  User, 
  ChevronRight,
  Send,
  ChevronDown,
  ChevronUp,
  Maximize2
} from "lucide-react";
import type { ResponseStatus } from "../../types/emergency";
import toast from "react-hot-toast";
import { EmergencyBoard } from "./EmergencyBoard";

export const EmergencyResponsePanel: React.FC = () => {
  const { 
    activeAlerts, 
    respondToEmergency, 
    currentUserProfile,
    closeEmergencyAlert
  } = useApp();

  const [isExpanded, setIsExpanded] = useState(false);

  // Filtrar solo las alertas del staff (si el usuario es staff autorizado)
  const isStaff = ['directivo', 'subdireccion', 'prefectura', 'medico_escolar', 'system_admin', 'developer'].includes(currentUserProfile?.rol);

  const activeOnly = activeAlerts.filter((alert) => alert.estado === 'activa');

  if (!isStaff || activeAlerts.length === 0) return null;

  const handleResponse = (alertaId: string, respuesta: ResponseStatus) => {
    respondToEmergency(alertaId, respuesta);
    toast.success(`Respuesta "${respuesta.replace('_', ' ')}" enviada`);
  };

  const showBoard = currentUserProfile?.rol === 'directivo' || currentUserProfile?.rol === 'subdireccion';

  return (
    <div className="fixed inset-x-4 top-20 z-40 pointer-events-none xl:left-auto xl:right-6 xl:top-24 xl:w-[26rem]">
      {/* Indicador Compacto para Móvil */}
      <div className="flex justify-end xl:hidden">
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="pointer-events-auto flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-red-900/40 border border-white/20"
        >
          <AlertTriangle className="h-4 w-4 animate-pulse" />
          {activeOnly.length} Alertas Activas
          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </motion.button>
      </div>

      {/* Panel Contenido (Board + Alertas) */}
      <div className={`min-w-0 space-y-3 pointer-events-auto transition-all duration-300 ${!isExpanded ? 'hidden xl:block' : 'block'}`}>
        {showBoard && (
          <div className="max-h-[min(60vh,32rem)] min-w-0 overflow-y-auto overflow-x-hidden rounded-2xl">
            <EmergencyBoard alerts={activeAlerts} />
          </div>
        )}
        
        <div className="space-y-3 max-h-[calc(100vh-12rem)] overflow-y-auto pb-4">
          <AnimatePresence>
            {activeOnly.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                className="overflow-hidden rounded-2xl border border-red-500/30 bg-[#1a0b0b]/95 backdrop-blur-xl shadow-2xl shadow-red-900/30"
              >
                <div className="bg-red-600 px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-white animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Emergencia: {alert.tipo_alerta}</span>
                  </div>
                  <span className="text-[9px] font-bold text-red-100">{new Date(alert.created_at).toLocaleTimeString()}</span>
                </div>

                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-300">
                      <User className="h-3.5 w-3.5" />
                      <span className="text-xs font-bold uppercase tracking-tight">{alert.docente_nombre}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium uppercase">Aula: {alert.aula} | Grupo: {alert.grupo}</span>
                    </div>
                  </div>

                  {/* Botones de Respuesta */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleResponse(alert.id, 'enterado')}
                      className="rounded-lg bg-blue-600/20 border border-blue-500/30 py-2.5 text-[10px] font-black uppercase tracking-wider text-blue-300 hover:bg-blue-600/40 transition-all"
                    >
                      Enterado
                    </button>
                    <button
                      onClick={() => handleResponse(alert.id, 'voy_en_camino')}
                      className="rounded-lg bg-amber-600/20 border border-amber-500/30 py-2.5 text-[10px] font-black uppercase tracking-wider text-amber-300 hover:bg-amber-600/40 transition-all"
                    >
                      En camino
                    </button>
                    <button
                      onClick={() => handleResponse(alert.id, 'atendida')}
                      className="rounded-lg bg-emerald-600/20 border border-emerald-500/30 py-2.5 text-[10px] font-black uppercase tracking-wider text-emerald-300 hover:bg-emerald-600/40 transition-all"
                    >
                      Atendida
                    </button>
                    <button
                      onClick={() => closeEmergencyAlert(alert.id)}
                      className="rounded-lg bg-slate-600/20 border border-slate-500/30 py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-300 hover:bg-slate-600/40 transition-all"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
