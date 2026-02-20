import React, { useEffect, useState } from "react";
import { Protocol, ProtocolStep } from "../../types";
import { supabase } from "../../supabase/client";
import { toast } from "react-hot-toast";
import { getProtocolLabel } from "../../utils/protocolTranslations";

import { useAuth } from "../AuthProvider";

interface ProtocolDetailModalProps {
  protocol: Protocol;
  onClose: () => void;
}

export const ProtocolDetailModal: React.FC<ProtocolDetailModalProps> = ({
  protocol,
  onClose,
}) => {
  const [steps, setSteps] = useState<ProtocolStep[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Log access for audit/evidence
    const logAccess = async () => {
      if (!user) return;
      try {
        await supabase.from("activaciones_protocolo" as any).insert({
          protocolo_id: protocol.id,
          usuario_id: user.id,
          fecha_inicio: new Date().toISOString(),
          estado: "lectura_difusion",
          notas: "Consultado como Material de Apoyo Contextual",
        });
      } catch (e) {
        console.error("Error logging protocol access", e);
      }
    };
    logAccess();

    const fetchSteps = async () => {
      try {
        const { data, error } = await supabase
          .from("pasos_protocolo" as any)
          .select("*")
          .eq("protocolo_id", protocol.id)
          .order("orden", { ascending: true });

        if (error) throw error;

        if (!data || data.length === 0) {
          // Fallback for Demo if DB is empty
          setSteps([
            {
              id: "mock1",
              accion: "Identificación Inicial",
              descripcion_detalle: "Detectar signos de alerta.",
              es_advertencia: false,
              orden: 1,
            },
            {
              id: "mock2",
              accion: "Contención Inmediata",
              descripcion_detalle:
                "Separar a los involucrados y asegurar integridad.",
              es_advertencia: false,
              orden: 2,
            },
            {
              id: "mock3",
              accion: "NO Revictimizar",
              descripcion_detalle:
                "Evitar interrogar a la víctima frente al agresor.",
              es_advertencia: true,
              orden: 3,
            },
            {
              id: "mock4",
              accion: "Notificación",
              descripcion_detalle: "Informar a directivos y padres de familia.",
              es_advertencia: false,
              orden: 4,
            },
          ] as any);
        } else {
          setSteps(data as any[]);
        }
      } catch (err) {
        console.error("Error fetching steps:", err);
        // Fallback on error too
        setSteps([
          {
            id: "mock1",
            accion: "Identificación Inicial",
            descripcion_detalle: "Detectar signos de alerta.",
            es_advertencia: false,
            orden: 1,
          },
          {
            id: "mock2",
            accion: "Contención Inmediata",
            descripcion_detalle:
              "Separar a los involucrados y asegurar integridad.",
            es_advertencia: false,
            orden: 2,
          },
          {
            id: "mock3",
            accion: "NO Revictimizar",
            descripcion_detalle:
              "Evitar interrogar a la víctima frente al agresor.",
            es_advertencia: true,
            orden: 3,
          },
          {
            id: "mock4",
            accion: "Notificación",
            descripcion_detalle: "Informar a directivos y padres de familia.",
            es_advertencia: false,
            orden: 4,
          },
        ] as any);
      } finally {
        setLoading(false);
      }
    };

    fetchSteps();
  }, [protocol.id, user]);

  const colorClass =
    protocol.tipo === "seguridad"
      ? "bg-rose-700"
      : protocol.tipo === "legal"
        ? "bg-indigo-700"
        : protocol.tipo === "convivencia"
          ? "bg-red-500"
          : protocol.tipo === "salud"
            ? "bg-orange-500"
            : "bg-blue-600";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden">
        {/* Header */}
        <div
          className={`${colorClass} p-6 text-white flex justify-between items-start shrink-0`}
        >
          <div className="flex gap-4">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md min-w-[100px] flex items-center justify-center">
              <span className="text-xs font-black uppercase tracking-widest text-center leading-tight">
                {getProtocolLabel(protocol.icono)}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-black/20 rounded text-xs font-bold uppercase tracking-wider">
                  Protocolo Activo
                </span>
                <span className="text-xs opacity-80 border-l border-white/30 pl-2">
                  {protocol.fuente}
                </span>
              </div>
              <h2 className="text-2xl font-bold leading-none mb-2">
                {protocol.titulo}
              </h2>
              <p className="opacity-90 max-w-2xl text-sm leading-relaxed">
                {protocol.objetivo}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-900/50">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <span className="material-symbols-outlined animate-spin text-4xl text-blue-500">
                sync
              </span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Alert Mode Banner if warnings exist */}
              {steps.some((s) => s.es_advertencia) && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex gap-3 items-center text-red-200 text-sm mb-6">
                  <span className="material-symbols-outlined text-red-500">
                    warning
                  </span>
                  <p>
                    Este protocolo contiene advertencias críticas sobre lo que{" "}
                    <strong>NO</strong> se debe hacer.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {steps.map((step, idx) => (
                  <div
                    key={step.id}
                    className={`relative pl-4 md:pl-0 transition-all duration-500 ${
                      step.es_advertencia
                        ? "border-2 border-red-500/50 bg-red-900/10"
                        : "border border-white/5 bg-white/5 hover:bg-white/10"
                    } rounded-xl p-6 flex flex-col md:flex-row gap-6 group`}
                  >
                    {/* Step Number */}
                    <div className="hidden md:flex flex-col items-center gap-2 min-w-[60px] border-r border-white/10 pr-6">
                      <span
                        className={`text-4xl font-bold ${
                          step.es_advertencia ? "text-red-500" : "text-blue-400"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="h-full w-0.5 bg-white/5 rounded-full"></div>
                    </div>

                    {/* Mobile Step Number */}
                    <span className="absolute top-4 right-4 md:hidden text-2xl font-bold text-white/10">
                      #{idx + 1}
                    </span>

                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        {step.es_advertencia && (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                            Precaución / Evitar
                          </span>
                        )}
                        {step.rol_responsable && (
                          <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-blue-500/20">
                            Responsable: {step.rol_responsable}
                          </span>
                        )}
                      </div>

                      <h3
                        className={`text-xl font-medium ${
                          step.es_advertencia ? "text-red-100" : "text-white"
                        } mb-2`}
                      >
                        {step.accion}
                      </h3>

                      {step.descripcion_detalle && (
                        <p className="text-gray-400 text-sm leading-relaxed">
                          {step.descripcion_detalle}
                        </p>
                      )}
                    </div>

                    {step.es_advertencia && (
                      <div className="flex items-center justify-center pr-4 text-red-500 animate-pulse">
                        <span className="material-symbols-outlined text-4xl">
                          block
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-900 flex justify-between items-center shrink-0">
          <div className="text-xs text-gray-500">
            * El registro de esta consulta quedará grabado en bitácora para
            fines de auditoría.
          </div>
          <button
            onClick={onClose}
            className="bg-white text-slate-900 px-6 py-2 rounded-lg font-bold hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined">check</span>
            Entendido / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
