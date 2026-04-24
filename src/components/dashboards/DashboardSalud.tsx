import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "../../store";
import { IncidentType } from "../../types";
import { GlassCard } from "../ui/GlassCard";
import toast from "react-hot-toast";
import { NeoButton } from "../ui/NeoButton";

export const DashboardSalud = () => {
  const { students, addIncident } = useApp();
  const [notifying, setNotifying] = useState(false);

  const healthIncidents = useMemo(
    () =>
      students
        .flatMap((s) =>
          s.incidents.map((i) => ({
            ...i,
            studentId: s.id,
            studentName: s.name,
            group: s.group,
          })),
        )
        .filter((i) => i.type === IncidentType.SALUD),
    [students],
  );

  const activeAlerts = useMemo(
    () => students.filter((s) => s.medicalAlerts && s.medicalAlerts.length > 0),
    [students],
  );

  const handleNotifyTeachers = async () => {
    if (activeAlerts.length === 0) {
      toast.error("No hay alumnos con alertas medicas registradas");
      return;
    }

    setNotifying(true);
    try {
      for (const s of activeAlerts) {
        await addIncident(
          s.id,
          IncidentType.SALUD,
          `AVISO MEDICO: El alumno cuenta con historial de salud (${s.medicalAlerts.join(", ")}). Favor de observar protocolos de atencion indicados en su expediente.`,
        );
      }
      toast.success(
        `Se notifico a docentes sobre ${activeAlerts.length} casos medicos`,
        { duration: 5000 },
      );
    } catch (err) {
      toast.error("Error al difundir alertas medicas");
    } finally {
      setNotifying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 p-6 lg:p-8 relative z-10 w-full max-w-7xl mx-auto h-full flex flex-col"
    >
      <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">
            Salud Escolar
          </h1>
          <p className="text-slate-600 text-sm">
            Monitoreo de atenciones médicas, alertas de salud y comunicación preventiva. {" "}
            <strong className="text-sase-warning">Acceso confidencial.</strong>
          </p>
        </div>
        <NeoButton
          icon="campaign"
          onClick={handleNotifyTeachers}
          disabled={notifying}
          className="px-4 py-3"
        >
          {notifying ? "Enviando notificación..." : "Emitir alerta institucional"}
        </NeoButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <GlassCard icon="medical_services" title="Atención primaria" className="lg:col-span-2 flex flex-col">
          <div className="mb-4 relative">
            <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-700">search</span>
            <input
              type="text"
              placeholder="Buscar expediente medico..."
              className="w-full bg-white/5 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-sase-info focus:shadow-glow-info transition-all min-h-[48px]"
            />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
            {healthIncidents.length === 0 ? (
              <div className="p-10 text-center text-slate-700">
                No se registran atenciones médicas.
              </div>
            ) : (
              healthIncidents.map((inc) => (
                <div key={inc.id} className="p-4 rounded-xl border border-slate-100 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                  <p className="text-white text-sm font-medium">{inc.studentName}</p>
                  <p className="text-slate-700 text-xs mt-1">{inc.group}</p>
                  <p className="text-slate-600 text-xs mt-2">{inc.description}</p>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        <GlassCard icon="health_and_safety" title="Alertas médicas activas" className="flex flex-col">
          <div className="flex-1 overflow-y-auto custom-scrollbar mt-4 space-y-4">
            {activeAlerts.length === 0 ? (
              <div className="p-6 text-center text-slate-700">
                No hay alertas médicas activas.
              </div>
            ) : (
              activeAlerts.map((s) => (
                <div key={s.id} className="p-4 rounded-xl border border-slate-100 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                  <p className="text-white text-sm font-medium">{s.name}</p>
                  <p className="text-slate-700 text-xs mt-1">{s.group}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {s.medicalAlerts?.map((alert) => (
                      <span key={alert} className="px-2 py-1 rounded-lg bg-red-500/10 border border-red-400/20 text-[10px] font-black uppercase tracking-widest text-red-300">
                        {alert}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

    </motion.div>
  );
};

export default DashboardSalud;
