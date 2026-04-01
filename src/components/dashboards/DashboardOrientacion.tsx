import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../../store";
import { CaseState, AppModule, Protocol } from "../../types";
import { supabase } from "../../supabase/client";
import { ProtocolDetailModal } from "../Protocols/ProtocolDetailModal";
import { GenericActionModal } from "../GenericActionModal";
import { useAuth } from "../AuthProvider";
import { StudentAdvancedPanel } from "../StudentAdvancedPanel";
import { PrintPreviewModal } from "../PrintPreviewModal";
import toast from "react-hot-toast";
import { GlassCard } from "../ui/GlassCard";

// --- MICRO-COMPONENTS ---

const HolographicKPI = ({
  icon,
  label,
  value,
  trend,
  color = "amber",
  delay = 0,
}: {
  icon: string;
  label: string;
  value: string | number;
  trend?: string;
  color?: "indigo" | "amber" | "emerald" | "rose";
  delay?: number;
}) => {
  const colors = {
    indigo:
      "text-indigo-400 border-indigo-500/20 bg-indigo-500/5 shadow-indigo-500/10",
    amber:
      "text-amber-400 border-amber-500/20 bg-amber-500/5 shadow-amber-500/10",
    emerald:
      "text-emerald-400 border-emerald-500/20 bg-emerald-500/5 shadow-emerald-500/10",
    rose: "text-rose-400 border-rose-500/20 bg-rose-500/5 shadow-rose-500/10",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: delay * 0.1 }}
      className={`card-sase p-4 border ${colors[color]} relative overflow-hidden group hover:bg-white/[0.03] transition-all`}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-current opacity-[0.03] rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:opacity-[0.06] transition-opacity"></div>
      <div className="flex justify-between items-start mb-4">
        <div
          className={`p-2.5 rounded-xl border ${colors[color]} bg-transparent`}
        >
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
        {trend && (
          <span className="text-[10px] font-black px-2 py-0.5 rounded-2xl border border-white/10 bg-white/5 text-slate-400 uppercase tracking-tighter">
            {trend}
          </span>
        )}
      </div>
      <div>
        <h4 className="text-3xl font-black text-white tracking-tighter italic mb-1">
          {value}
        </h4>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">
          {label}
        </p>
      </div>
    </motion.div>
  );
};

export const DashboardOrientacion = () => {
  const { students, setCurrentModule, addIncident } = useApp();
  const { user } = useAuth();
  const [supportProtocol, setSupportProtocol] = useState<Protocol | null>(null);
  const [showProtocol, setShowProtocol] = useState(false);

  const [modalOpen, setModalOpen] = useState<
    "APPOINTMENT" | "INTERVIEW" | "CONTACT" | null
  >(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showAdvancedPanel, setShowAdvancedPanel] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState("");

  const handlePrepareBitacora = () => {
    const html = `
      <h2>Bitácora Semanal de Orientación</h2>
      <p><strong>Corte de Caja:</strong> ${new Date().toLocaleDateString()}</p>
      
      <h3>Estadísticas de Riesgo</h3>
      <table>
        <tr><th>Categoría</th><th>Cantidad</th></tr>
        <tr><td>Casos en Intervención</td><td>${attentionRequired}</td></tr>
        <tr><td>Alumnos Observados</td><td>${onObservation}</td></tr>
        <tr><td>Patrones de Riesgo IA</td><td>${patternAlerts.length}</td></tr>
      </table>

      <h3>Resumen de Casos Críticos</h3>
      <ul>
        ${patternAlerts
          .map(
            (s) => `
          <li>
            <strong>${s.name} (${s.group}):</strong> 
            Patrón de comportamiento detectado. Requiere seguimiento psicopedagógico inmediato.
          </li>
        `,
          )
          .join("")}
      </ul>

      <div style="margin-top: 30px; padding: 15px; border: 1px dashed #ccc; background: #f9f9f9;">
        <h4>Observaciones de Campo</h4>
        <p>[Escriba aquí sus observaciones adicionales para el reporte del día...]</p>
      </div>

      <div class="signature-line">
        <div class="signature-box">
          <div class="line"></div>
          <div class="label">FIRMA DE ORIENTACIÓN / TRABAJO SOCIAL</div>
        </div>
      </div>
    `;
    setPreviewContent(html);
    setShowPrintPreview(true);
  };

  const handleSaveAppointment = async (data: any) => {
    if (!user) return;
    const { error } = await supabase.from("citas_padres" as any).insert({
      creado_por: user.id,
      alumno_id: data.student,
      fecha_cita: data.date,
      motivo: data.reason,
      estado: "PENDIENTE",
      observaciones: "Agendado por Orientación",
    });
    if (error) {
      toast.error("Error al agendar cita");
      throw error;
    }
    toast.success("Cita sincronizada con el calendario");
  };

  const handleSaveInterview = async (data: any) => {
    if (!user) return;
    const { error } = await supabase.from("interventions_log" as any).insert({
      user_id: user.id,
      student_id: data.student,
      reason: data.reason,
      notes: data.notes,
      result: data.result || "Pendiente",
    });
    if (error) {
      toast.error("Error al registrar entrevista");
      throw error;
    }
    toast.success("Bitácora de entrevista guardada");
  };

  const handleSaveContact = async (data: any) => {
    if (!user) return;
    const { error } = await supabase.from("contacts_log" as any).insert({
      user_id: user.id,
      student_id: data.student,
      method: data.method,
      notes: data.notes,
      outcome: data.outcome,
    });
    if (error) {
      toast.error("Error al registrar contacto");
      throw error;
    }
    toast.success("Registro de contacto actualizado");
  };

  const handleNotifyAcademicRisk = async (studentId: string, info: string) => {
    try {
      await addIncident(
        studentId,
        "ACADEMICO" as any,
        `⚠️ REPORTE ORIENTACIÓN: Se requiere seguimiento especial por ${info}.`,
      );
      toast.success("Notificación enviada a la academia", { icon: "📝" });
    } catch (err) {
      toast.error("Fallo de comunicación interna");
    }
  };

  useEffect(() => {
    const fetchProtocol = async () => {
      const { data } = await supabase
        .from("protocolos" as any)
        .select("*")
        .ilike("titulo", "%Violencia Escolar%")
        .single();
      if (data) setSupportProtocol(data as any);
    };
    fetchProtocol();
  }, []);

  const patternAlerts = students.filter(
    (s) => s.caseState === CaseState.PATRON_DETECTADO,
  );
  const attentionRequired = students.filter(
    (s) => s.caseState === CaseState.INTERVENCION,
  ).length;
  const onObservation = students.filter(
    (s) => s.caseState === CaseState.OBSERVADO,
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 p-6 lg:p-8 relative z-10 w-full max-w-7xl mx-auto h-full flex flex-col"
    >
      <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Modulo padre
          </p>
          <p className="text-slate-200 text-sm font-semibold">
            Atencion Integral del Estudiante
          </p>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">
            Orientacion Educativa
          </h1>
          <p className="text-slate-400 text-sm">
            Acompañamiento socioemocional, contencion y seguimiento del estudiante.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handlePrepareBitacora}
            className="min-h-[48px] min-w-[48px] px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <span className="material-icons text-sm">print</span>
            Generar bitacora institucional
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentModule(AppModule.REPORTES_DOCENTES)}
            className="min-h-[48px] min-w-[48px] px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <span className="material-icons text-sm">add_chart</span>
            Solicitar actualizacion de seguimiento
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        <GlassCard icon="psychology" title="Casos en intervencion activa" className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mt-4 space-y-3">
            <AnimatePresence>
              {patternAlerts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-10 text-center text-slate-500"
                >
                  Sin alertas de riesgo registradas en el sistema.
                </motion.div>
              ) : (
                patternAlerts.map((s, idx) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors group"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="text-white font-medium text-sm">{s.name}</h3>
                        <p className="text-slate-400 text-xs mt-1">
                          Patron de riesgo socioemocional detectado
                        </p>
                        <p className="text-slate-500 text-xs mt-1">
                          {s.group} · {s.matricula}
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 shadow-[0_0_10px_rgba(251,191,36,0.2)]">
                        Caso en seguimiento activo
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedStudent(s);
                          setShowAdvancedPanel(true);
                        }}
                        className="min-h-[48px] min-w-[48px] px-4 rounded-2xl bg-amber-600/20 text-amber-300 text-sm font-medium hover:bg-amber-600/30 transition-colors flex items-center justify-center"
                      >
                        Iniciar intervencion
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleNotifyAcademicRisk(s.id, "patron detectado")}
                        className="min-h-[48px] min-w-[48px] px-4 rounded-2xl bg-white/5 text-slate-300 text-sm font-medium hover:bg-white/10 transition-colors flex items-center justify-center"
                      >
                        Notificar al equipo academico
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </GlassCard>

        <GlassCard icon="family_restroom" title="Agenda de atencion" className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mt-4">
            <div className="p-8 rounded-xl border border-white/5 bg-white/[0.02] text-center text-slate-500">
              Sin citas programadas para el dia de hoy.
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setModalOpen("APPOINTMENT")}
              className="w-full min-h-[48px] rounded-xl bg-emerald-500/20 text-emerald-300 text-sm font-bold hover:bg-emerald-500/30 transition-colors border border-emerald-500/30 flex items-center justify-center gap-2"
            >
              <span className="material-icons text-sm">add_alert</span>
              Generar citatorio
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setModalOpen("INTERVIEW")}
              className="w-full min-h-[48px] rounded-xl bg-white/5 text-slate-300 text-sm font-bold hover:bg-white/10 transition-colors border border-white/10 flex items-center justify-center gap-2"
            >
              <span className="material-icons text-sm">history_edu</span>
              Registrar entrevista
            </motion.button>
            {supportProtocol && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowProtocol(true)}
                className="w-full min-h-[48px] rounded-xl bg-rose-500/20 text-rose-300 text-sm font-bold hover:bg-rose-500/30 transition-colors border border-rose-500/30 flex items-center justify-center gap-2"
              >
                <span className="material-icons text-sm">menu_book</span>
                Activar protocolo critico
              </motion.button>
            )}
          </div>
        </GlassCard>
      </div>

      {/* MODALS */}
      {showProtocol && supportProtocol && (
        <ProtocolDetailModal
          protocol={supportProtocol}
          onClose={() => setShowProtocol(false)}
        />
      )}

      {selectedStudent && showAdvancedPanel && (
        <StudentAdvancedPanel
          student={selectedStudent}
          onClose={() => setShowAdvancedPanel(false)}
        />
      )}

      <GenericActionModal
        isOpen={modalOpen === "APPOINTMENT"}
        onClose={() => setModalOpen(null)}
        title="Gestion de citatorios institucionales"
        description="Gestion de reuniones con tutores legales"
        fields={[
          {
            name: "student",
            label: "Matricula del alumno",
            type: "text",
            required: true,
          },
          {
            name: "reason",
            label: "Motivo del citatorio (descripcion breve)",
            type: "select",
            options: [
              "ALERTA_CONDUCTA",
              "BAJO_DESEMPEÑO",
              "FALLA_SISTEMÁTICA",
              "SEGUIMIENTO_PSIC",
            ],
            required: true,
          },
          {
            name: "date",
            label: "Fecha y hora",
            type: "date",
            required: true,
          },
        ]}
        onSubmit={handleSaveAppointment}
      />

      <GenericActionModal
        isOpen={modalOpen === "INTERVIEW"}
        onClose={() => setModalOpen(null)}
        title="Registro de entrevistas institucionales"
        description="Registro de intervencion directa"
        fields={[
          {
            name: "student",
            label: "Matricula del alumno",
            type: "text",
            required: true,
          },
          {
            name: "reason",
            label: "Motivo de atencion",
            type: "text",
            required: true,
          },
          {
            name: "notes",
            label: "Notas de intervencion",
            type: "textarea",
            required: true,
          },
          {
            name: "result",
            label: "Resultado de la intervencion",
            type: "select",
            options: [
              "PROTOCOLO_ACTIVADO",
              "EN_OBSERVACIÓN",
              "CASO_CERRADO",
              "CANALIZACIÓN_EXTERNA",
            ],
            required: true,
          },
        ]}
        onSubmit={handleSaveInterview}
      />

      <PrintPreviewModal
        isOpen={showPrintPreview}
        onClose={() => setShowPrintPreview(false)}
        title="BITÁCORA DE INTERVENCIÓN PSICOPEDAGÓGICA"
        initialHtml={previewContent}
      />
    </motion.div>
  );
};
