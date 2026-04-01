import React from "react";
import { Protocol } from "../../types";
import { getProtocolLabel } from "../../utils/protocolTranslations";

interface ProtocolCardProps {
  protocol: Protocol;
  onClick: () => void;
}

const typeColors: Record<string, string> = {
  convivencia: "bg-red-500",
  salud: "bg-orange-500",
  proteccion_civil: "bg-blue-600",
  apoyo: "bg-purple-600",
};

const typeLabels: Record<string, string> = {
  convivencia: "Convivencia y Disciplina",
  salud: "Bienestar y Salud",
  proteccion_civil: "Protección Civil",
  apoyo: "Apoyo y Capacitación",
};

export const ProtocolCard: React.FC<ProtocolCardProps> = ({
  protocol,
  onClick,
}) => {
  const colorClass = typeColors[protocol.tipo] || "bg-gray-500";

  return (
    <div
      onClick={onClick}
      className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-all cursor-pointer group hover:scale-[1.02] hover:shadow-xl"
    >
      <div className={`${colorClass} p-3 flex items-center justify-between`}>
        <span className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">
            {protocol.tipo === "convivencia"
              ? "shield"
              : protocol.tipo === "salud"
              ? "medical_services"
              : protocol.tipo === "apoyo"
              ? "school"
              : "security"}
          </span>
          {typeLabels[protocol.tipo]}
        </span>
        <span className="material-symbols-outlined text-white/80 group-hover:text-white transition-colors">
          arrow_forward
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-start gap-4 mb-3">
          <div
            className={`p-3 rounded-2xl ${colorClass} bg-opacity-20 text-white min-w-[80px] flex items-center justify-center`}
          >
            <span className="text-[10px] font-black uppercase tracking-widest leading-none text-center">
              {getProtocolLabel(protocol.icono)}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-tight mb-1">
              {protocol.titulo}
            </h3>
            <p className="text-xs text-blue-200">
              {protocol.roles_responsables?.join(", ")}
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-300 line-clamp-2 mb-4">
          {protocol.objetivo}
        </p>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="material-symbols-outlined text-sm">flag</span>
          <span>Activación: {protocol.activacion?.substring(0, 40)}...</span>
        </div>
      </div>
    </div>
  );
};
