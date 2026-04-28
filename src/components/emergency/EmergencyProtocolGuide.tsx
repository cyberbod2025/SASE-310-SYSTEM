import React from "react";
import type { EmergencyAlert, EmergencyResponse, EmergencyType } from "../../types/emergency";
import { Sparkles, Check } from "lucide-react";

interface EmergencyProtocolGuideProps {
  type: EmergencyType;
  alert?: EmergencyAlert;
  responders?: EmergencyResponse[];
}

function sasitoMessage(alert?: EmergencyAlert, responders: EmergencyResponse[] = []) {
  const enCamino = responders.find((response) => response.respuesta === 'voy_en_camino');
  const atendida = responders.find((response) => response.respuesta === 'atendida');

  if (atendida) return 'La alerta ya fue marcada como atendida. Documenta el cierre cuando sea seguro.';
  if (enCamino) return `${enCamino.usuario_nombre} va en camino. Manten al alumno acompanado.`;
  if (alert?.sync_status === 'pendiente_envio') return 'Sin conexion: la alerta esta guardada y se enviara automaticamente.';
  if ((alert?.escalado_nivel ?? 0) >= 1) return 'Sin respuesta inicial. SASE ya escalo la alerta a Direccion.';
  return 'Notificando a Salud y Prefectura. Mantente cerca del grupo y conserva la calma.';
}

export const EmergencyProtocolGuide: React.FC<EmergencyProtocolGuideProps> = ({ type, alert, responders = [] }) => {
  const getGuideContent = (type: EmergencyType) => {
    switch (type) {
      case 'medica': return [
        "Mantén la calma y pide calma a los presentes.",
        "No muevas al lesionado si sospechas de lesión cervical.",
        "Verifica si respira y tiene pulso.",
        "No dejes solo al alumno."
      ];
      case 'seguridad': return [
        "Cierra puertas y aléjate de las ventanas.",
        "Mantén a los alumnos sentados en el piso.",
        "Silencia teléfonos celulares.",
        "Espera indicaciones del equipo de brigada."
      ];
      case 'violencia': return [
        "Mantén distancia de seguridad.",
        "Solicita apoyo adulto adicional de inmediato.",
        "Usa comandos verbales claros y firmes.",
        "Evita aglomeraciones de otros alumnos."
      ];
      case 'emocional': return [
        "Lleva al alumno a un espacio tranquilo si es posible.",
        "Escucha sin juzgar y mantén contacto visual suave.",
        "Invita a realizar respiraciones profundas.",
        "No minimices sus sentimientos."
      ];
      default: return [
        "Mantén la calma.",
        "Asegura el perímetro.",
        "Espera la llegada del personal responsable.",
        "Mantén comunicación por este medio."
      ];
    }
  };

  const protocols = getGuideContent(type);

  return (
    <div className="flex flex-col h-full rounded-2xl border border-white/5 bg-blue-500/[0.03] p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-blue-400" />
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Guía Sasito: Protocolo</h4>
      </div>

      <div className="mb-4 rounded-xl border border-blue-400/20 bg-blue-500/10 p-3">
        <p className="text-xs font-bold leading-relaxed text-blue-100">{sasitoMessage(alert, responders)}</p>
      </div>

      <div className="space-y-3">
        {protocols.map((step, idx) => (
          <div key={idx} className="flex gap-3">
            <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
              <Check className="h-2.5 w-2.5" />
            </div>
            <p className="text-xs font-medium text-slate-300 leading-snug">{step}</p>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-4 italic">
        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">
          La seguridad es prioridad institucional.
        </p>
      </div>
    </div>
  );
};
