import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "../../store";
import { IncidentType } from "../../types";
import { GlassCard } from "../ui/GlassCard";
import { GenericActionModal } from "../GenericActionModal";
import toast from "react-hot-toast";

export const DashboardSalud = () => {
  const { students, addIncident, updateBapInfo, printDocument } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [notifying, setNotifying] = useState(false);

  const studentsWithBAP = useMemo(
    () => students.filter((s) => s.bapInfo?.hasBAP),
    [students],
  );

  const healthIncidents = students
    .flatMap((s) =>
      s.incidents.map((i) => ({
        ...i,
        studentId: s.id,
        studentName: s.name,
        group: s.group,
      })),
    )
    .filter((i) => i.type === IncidentType.SALUD);

  const activeAlerts = students.filter(
    (s) => s.medicalAlerts && s.medicalAlerts.length > 0,
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

  const handleUpdateAdjustment = async (data: any) => {
    if (!selectedStudent) return;
    await updateBapInfo(selectedStudent.id, {
      ...selectedStudent.bapInfo,
      accommodations: [data.adjustment],
    });
    toast.success(`Ajuste razonable actualizado para ${selectedStudent.name}`);
    setModalOpen(false);
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
            Salud e Inclusion Educativa (UDEII)
          </h1>
          <p className="text-slate-600 text-sm">
            Monitoreo de bienestar y atencion a barreras para el aprendizaje (BAP).{" "}
            <strong className="text-amber-400">Acceso confidencial.</strong>
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleNotifyTeachers}
          className="min-h-[48px] min-w-[48px] px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30 transition-colors text-sm font-medium flex items-center gap-2"
          disabled={notifying}
        >
          <span className="material-icons text-sm">campaign</span>
          {notifying ? "Enviando notificacion..." : "Emitir alerta institucional"}
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <GlassCard icon="medical_services" title="Atencion primaria" className="lg:col-span-2 flex flex-col">
          <div className="mb-4 relative">
            <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-700">search</span>
            <input
              type="text"
              placeholder="Buscar expediente medico..."
              className="w-full bg-white/5 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-blue-400 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all min-h-[48px]"
            />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
            {healthIncidents.length === 0 ? (
              <div className="p-10 text-center text-slate-700">
                No se registran atenciones medicas.
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

        <GlassCard icon="diversity_3" title="Seguimiento de BAP" className="flex flex-col">
          <div className="flex-1 overflow-y-auto custom-scrollbar mt-4 space-y-4">
            {studentsWithBAP.length === 0 ? (
              <div className="p-6 text-center text-slate-700">
                No se registran casos con BAP.
              </div>
            ) : (
              studentsWithBAP.map((s) => (
                <div key={s.id} className="p-4 rounded-xl border border-slate-100 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                  <p className="text-white text-sm font-medium">{s.name}</p>
                  <p className="text-slate-700 text-xs mt-1">{s.group}</p>
                  <p className="text-slate-600 text-xs mt-2">
                    {s.bapInfo?.diagnosisPrivate || "Inclusión generica"}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedStudent(s);
                        setModalOpen(true);
                      }}
                      className="min-h-[48px] min-w-[48px] px-3 rounded-2xl bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium"
                    >
                      Ajustes razonables
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        printDocument({
                          type: "BITACORA",
                          studentId: s.id,
                          data: {
                            ...s.bapInfo,
                            accommodations: s.bapInfo.accommodations || [],
                            details: "Estrategias de intervencion para barreras identificadas.",
                          },
                        })
                      }
                      className="min-h-[48px] min-w-[48px] px-3 rounded-2xl bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 transition-colors text-sm font-medium"
                    >
                      Generar reporte
                    </motion.button>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      <GenericActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Actualizar ajustes razonables"
        description={`Sincronizacion de estrategias para ${selectedStudent?.name}`}
        fields={[
          {
            name: "adjustment",
            label: "Descripcion del ajuste",
            type: "textarea",
            required: true,
          },
        ]}
        onSubmit={handleUpdateAdjustment}
      />
    </motion.div>
  );
};

export default DashboardSalud;
