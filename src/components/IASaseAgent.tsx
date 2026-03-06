import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../store";
import { SaseIAOrb } from "./SaseIAOrb";
import { UserRole, AppModule, CaseState } from "../types";
import { calcularEstadoSistema } from "../utils/estadoSistema";

/**
 * IA-SASE Agent Component
 * Permanent visual assistant with dynamic institutional traffic light (semáforo).
 * Located: Fixed bottom-right.
 */
export const IASaseAgent: React.FC = () => {
  const {
    students,
    isAssistantOpen,
    setIsAssistantOpen,
    assistantStatus,
    setCurrentModule,
    openQuickRegister,
    currentUserRole,
  } = useApp();

  // Semáforo Institucional Dinámico (Lógica Centralizada)
  const systemState = useMemo(
    () => calcularEstadoSistema(students, isAssistantOpen, assistantStatus),
    [students, isAssistantOpen, assistantStatus],
  );

  // Texto descriptivo del estado para accesibilidad/clima
  const stateLabel = useMemo(() => {
    switch (systemState) {
      case "red":
        return "CRÍTICO";
      case "orange":
        return "ALERTA";
      case "blue":
        return "ACTIVO";
      case "thinking":
        return "PROCESANDO";
      default:
        return "ESTABLE";
    }
  }, [systemState]);

  return (
    <div className="fixed bottom-[20px] right-[20px] z-[5000] flex flex-col items-end">
      {/* Panel de Acciones Rápidas */}
      <AnimatePresence>
        {isAssistantOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 20, scale: 0.9, filter: "blur(10px)" }}
            className="mb-4 w-[280px] bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-white font-black text-xs uppercase tracking-[0.3em]">
                    IA-SASE
                  </h3>
                  <p className="text-blue-400 text-[8px] font-black uppercase tracking-[0.2em] mt-1">
                    Núcleo Operativo
                  </p>
                </div>
                <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10">
                  <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">
                    v1.0
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <ActionButton
                  icon="add_circle"
                  label="Registrar Incidencia"
                  description="Reporte inmediato de conducta o asistencia"
                  onClick={() => {
                    openQuickRegister();
                    setIsAssistantOpen(false);
                  }}
                />
                <ActionButton
                  icon="person_search"
                  label="Buscar Alumno"
                  description="Acceso rápido a expedientes y fotos"
                  onClick={() => {
                    setCurrentModule(AppModule.REPORTES);
                    setIsAssistantOpen(false);
                  }}
                />
                <ActionButton
                  icon="analytics"
                  label="Alumnos en Riesgo"
                  description="Trayectorias con alerta activa"
                  onClick={() => {
                    setCurrentModule(AppModule.REPORTES);
                    setIsAssistantOpen(false);
                  }}
                />
                <ActionButton
                  icon="emergency"
                  label="Consultar Alertas"
                  description="Protocolos y avisos institucionales"
                  onClick={() => {
                    setCurrentModule(AppModule.DASHBOARD);
                    setIsAssistantOpen(false);
                  }}
                />
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 text-center">
                <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest italic">
                  "Conectamos para proteger"
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger: IA-SASE Orb */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsAssistantOpen(!isAssistantOpen)}
        className="relative cursor-pointer group"
      >
        {/* State Badge */}
        <AnimatePresence>
          {!isAssistantOpen && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute -left-20 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-md pointer-events-none hidden sm:block"
            >
              <span className="text-[8px] font-black text-white uppercase tracking-widest opacity-60">
                {stateLabel}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <SaseIAOrb
          state={systemState as any}
          className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]"
        />

        {/* Pulsing Ring for critical states */}
        {(systemState === "red" || systemState === "orange") && (
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`absolute inset-0 rounded-full border-2 ${
              systemState === "red" ? "border-red-500" : "border-amber-500"
            } pointer-events-none`}
          />
        )}
      </motion.div>
    </div>
  );
};

const ActionButton: React.FC<{
  icon: string;
  label: string;
  description: string;
  onClick: () => void;
}> = ({ icon, label, description, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-4 p-4 bg-white/[0.03] hover:bg-white/[0.08] hover:border-blue-500/30 border border-white/5 rounded-2xl transition-all group text-left"
  >
    <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform shadow-inner">
      <span className="material-symbols-outlined text-xl">{icon}</span>
    </div>
    <div className="flex-1 min-w-0">
      <span className="block text-[10px] font-black text-white uppercase tracking-tight">
        {label}
      </span>
      <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest truncate mt-0.5">
        {description}
      </span>
    </div>
    <span className="material-symbols-outlined text-slate-700 group-hover:text-blue-400 text-sm">
      arrow_forward_ios
    </span>
  </button>
);
