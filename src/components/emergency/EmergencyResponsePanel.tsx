import React from "react";
import { useApp } from "../../store";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, 
  Clock, 
  MapPin, 
  User, 
  ChevronRight,
  Send
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

  // Filtrar solo las alertas del staff (si el usuario es staff autorizado)
  const isStaff = ['directivo', 'subdireccion', 'prefectura', 'medico_escolar', 'system_admin', 'developer'].includes(currentUserProfile?.rol);

  const activeOnly = activeAlerts.filter((alert) => alert.estado === 'activa');

  if (!isStaff || activeAlerts.length === 0) return null;

  const handleResponse = (alertaId: string, respuesta: ResponseStatus) => {
    respondToEmergency(alertaId, respuesta);
    toast.success(`Respuesta "${respuesta.replace('_', ' ')}" enviada`);
  };

  return (
    <div className="fixed top-20 right-6 z-[90] w-full max-w-5xl space-y-3 px-4 md:px-0">
      {currentUserProfile?.rol === 'directivo' || currentUserProfile?.rol === 'subdireccion' ? (
        <EmergencyBoard alerts={activeAlerts} />
      ) : null}
      <AnimatePresence>
        {activeOnly.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className="overflow-hidden rounded-2xl border border-red-500/30 bg-[#1a0b0b]/90 backdrop-blur-xl shadow-2xl shadow-red-900/20"
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
                  className="rounded-lg bg-blue-600/20 border border-blue-500/30 py-2 text-[10px] font-black uppercase tracking-wider text-blue-300 hover:bg-blue-600/40 transition-all"
                >
                  Enterado
                </button>
                <button
                  onClick={() => handleResponse(alert.id, 'voy_en_camino')}
                  className="rounded-lg bg-amber-600/20 border border-amber-500/30 py-2 text-[10px] font-black uppercase tracking-wider text-amber-300 hover:bg-amber-600/40 transition-all"
                >
                  Voy en camino
                </button>
                <button
                  onClick={() => handleResponse(alert.id, 'atendida')}
                  className="rounded-lg bg-emerald-600/20 border border-emerald-500/30 py-2 text-[10px] font-black uppercase tracking-wider text-emerald-300 hover:bg-emerald-600/40 transition-all"
                >
                  Atendida
                </button>
                <button
                  onClick={() => closeEmergencyAlert(alert.id)}
                  className="rounded-lg bg-slate-600/20 border border-slate-500/30 py-2 text-[10px] font-black uppercase tracking-wider text-slate-300 hover:bg-slate-600/40 transition-all"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
