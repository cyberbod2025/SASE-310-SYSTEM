import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  HeartPulse, 
  ShieldAlert, 
  Zap, 
  MessageCircleWarning, 
  X,
  CheckCircle2,
  Clock,
  ArrowRight
} from "lucide-react";
import { useApp } from "../../store";
import type { EmergencyLocation, EmergencyType } from "../../types/emergency";
import { IncidentType } from "../../types";
import { EmergencyStatusPanel } from "./EmergencyStatusPanel";
import { EmergencyProtocolGuide } from "./EmergencyProtocolGuide";

interface EmergencyAlertModalProps {
  onClose: () => void;
}

export const EmergencyAlertModal: React.FC<EmergencyAlertModalProps> = ({ onClose }) => {
  const app = useApp();
  const { createEmergencyAlert, myActiveAlert, currentUserProfile, openQuickRegister, emergencyResponses } = app;
  const [step, setStep] = useState<'selection' | 'success'>(myActiveAlert ? 'success' : 'selection');
  const [ubicacion, setUbicacion] = useState<EmergencyLocation>('Aula');
  const [silent, setSilent] = useState(false);
  const [sendingType, setSendingType] = useState<EmergencyType | null>(null);

  const locations: EmergencyLocation[] = ['Aula', 'Patio', 'Bano', 'Pasillo', 'Otro'];

  const emergencyOptions: { id: EmergencyType; label: string; icon: any; color: string; desc: string }[] = [
    { 
      id: 'medica', 
      label: 'Alerta Médica', 
      icon: HeartPulse, 
      color: 'bg-rose-500', 
      desc: 'Accidente, desmayo o crisis de salud.' 
    },
    { 
      id: 'seguridad', 
      label: 'Seguridad', 
      icon: ShieldAlert, 
      color: 'bg-orange-500', 
      desc: 'Intrusos, robo o peligro físico.' 
    },
    { 
      id: 'violencia', 
      label: 'Violencia', 
      icon: Zap, 
      color: 'bg-red-600', 
      desc: 'Pelea activa o agresión física.' 
    },
    { 
      id: 'emocional', 
      label: 'Crisis Emocional', 
      icon: MessageCircleWarning, 
      color: 'bg-purple-500', 
      desc: 'Ataque de pánico o crisis nerviosa.' 
    },
  ];

  const handleSendAlert = async (type: EmergencyType) => {
    if (sendingType) return;

    setSendingType(type);
    try {
      await createEmergencyAlert(type, {
        ubicacion,
        aula: ubicacion,
        grupo: currentUserProfile?.grupo_tutor || undefined,
        silent,
      });
      setStep('success');
    } catch (error) {
      console.error("No se pudo activar la alerta", error);
    } finally {
      setSendingType(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/60">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-[#0f1117] border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.5)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.4)]">
              <ShieldAlert className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-wider text-white">Modo Emergencia</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocolo de Ayuda Inmediata SASE</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-8">
          {step === 'selection' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Ubicacion rapida</p>
                <div className="flex flex-wrap gap-2">
                  {locations.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => setUbicacion(loc)}
                      className={`rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                        ubicacion === loc
                          ? 'border-red-400 bg-red-500/20 text-red-100'
                          : 'border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.07]'
                      }`}
                    >
                      {loc === 'Bano' ? 'Bano' : loc}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
                <span>
                  <span className="block text-xs font-black uppercase tracking-widest text-white">Modo discreto</span>
                  <span className="block text-[10px] font-medium text-slate-500">Sin sonido en esta pantalla docente; staff conserva aviso visual.</span>
                </span>
                <input
                  type="checkbox"
                  checked={silent}
                  onChange={(event) => setSilent(event.target.checked)}
                  className="h-5 w-5 accent-red-600"
                />
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {emergencyOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSendAlert(opt.id)}
                    disabled={Boolean(sendingType)}
                    className="group relative flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-5 text-left transition-all hover:border-white/20 hover:bg-white/[0.07] disabled:cursor-wait disabled:opacity-60"
                  >
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${opt.color} shadow-lg transition-transform group-hover:scale-110`}>
                      <opt.icon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-black text-white text-lg leading-tight uppercase tracking-wide">{sendingType === opt.id ? "Enviando..." : opt.label}</h3>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed mt-1">{opt.desc}</p>
                    </div>
                    <ArrowRight className="absolute right-5 h-5 w-5 text-slate-600 group-hover:text-white transition-colors" />
                  </button>
                ))}
              </div>
              
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
                <p className="text-xs text-amber-200 font-bold leading-relaxed flex items-start gap-3">
                  <Clock className="h-4 w-4 shrink-0 mt-0.5" />
                  Al activar una alerta, SASE la guarda primero en este dispositivo y luego la envia al personal responsable.
                </p>
              </div>
            </div>
          )}

          {step === 'success' && myActiveAlert && (
            <div className="space-y-8">
              <div className="flex flex-col items-center text-center py-4">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">¡Alerta Enviada!</h3>
                <p className="mt-2 text-slate-300 font-medium">Personal responsable notificado. Mantén la calma.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Panel de Estado en Tiempo Real */}
                <EmergencyStatusPanel alert={myActiveAlert} />
                
                {/* Guía de Sasito */}
                <EmergencyProtocolGuide
                  type={myActiveAlert.tipo_alerta}
                  alert={myActiveAlert}
                  responders={emergencyResponses[myActiveAlert.id] || []}
                />
              </div>

              <div className="pt-4 border-t border-white/5 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-xl bg-white/5 py-4 text-xs font-black uppercase tracking-widest text-slate-300 hover:bg-white/10 hover:text-white transition-all"
                >
                  Supervisar
                </button>
                <button
                  onClick={() => {
                    onClose();
                    openQuickRegister(IncidentType.CONDUCTA);
                  }}
                  className="flex-1 rounded-xl bg-blue-600 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all"
                >
                  Reporte Formal
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
