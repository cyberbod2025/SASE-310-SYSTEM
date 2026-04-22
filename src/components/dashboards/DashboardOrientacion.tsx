import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../../store";
import { CaseState, AppModule, Protocol, CaseLabels } from "../../types";
import { supabase } from "../../supabase/client";
import { ProtocolDetailModal } from "../Protocols/ProtocolDetailModal";
import { GenericActionModal } from "../GenericActionModal";
import { useAuth } from "../AuthProvider";
import { StudentAdvancedPanel } from "../StudentAdvancedPanel";
import { PrintPreviewModal } from "../PrintPreviewModal";
import toast from "react-hot-toast";
import { GlassCard } from "../ui/GlassCard";
import { NeoButton } from "../ui/NeoButton";
import { getStatusColors } from "../../utils/statusUtils";

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

  const highRiskStudents = students.filter(
    (s) => s.caseState === CaseState.PATRON_DETECTADO || s.caseState === CaseState.INTERVENCION,
  );
  
  const attentionRequired = students.filter(
    (s) => s.caseState === CaseState.INTERVENCION,
  ).length;
  
  const onObservation = students.filter(
    (s) => s.caseState === CaseState.OBSERVADO,
  ).length;

  const handlePrepareBitacora = () => {
    const html = `
      <h2>Bitácora Semanal de Orientación</h2>
      <p><strong>Corte de Caja:</strong> ${new Date().toLocaleDateString()}</p>
      
      <h3>Estadísticas de Riesgo</h3>
      <table>
        <tr><th>Categoría</th><th>Cantidad</th></tr>
        <tr><td>Casos en Intervención</td><td>${attentionRequired}</td></tr>
        <tr><td>Alumnos Observados</td><td>${onObservation}</td></tr>
        <tr><td>Patrones de Riesgo IA</td><td>${highRiskStudents.length}</td></tr>
      </table>

      <h3>Resumen de Casos Críticos</h3>
      <ul>
        ${highRiskStudents
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 p-6 lg:p-8 relative z-10 w-full max-w-7xl mx-auto h-full flex flex-col"
    >
      <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">
            Modulo padre
          </p>
          <p className="text-slate-200 text-sm font-semibold">
            Atencion Integral del Estudiante
          </p>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">
            Orientacion Educativa
          </h1>
          <p className="text-slate-600 text-sm">
            Acompañamiento socioemocional, contencion y seguimiento del estudiante.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <NeoButton
            icon="print"
            onClick={handlePrepareBitacora}
            className="px-4 py-3"
          >
            Generar bitácora institucional
          </NeoButton>
          <NeoButton
            icon="add_chart"
            onClick={() => setCurrentModule(AppModule.REPORTES_DOCENTES)}
            className="px-4 py-3 text-sase-warning"
          >
            Solicitar actualización de seguimiento
          </NeoButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        <GlassCard icon="psychology" title="Casos en intervencion activa" className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mt-4 space-y-3">
            <AnimatePresence>
              {highRiskStudents.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-10 text-center text-slate-700"
                >
                  Sin alertas de riesgo registradas en el sistema.
                </motion.div>
              ) : (
                highRiskStudents.map((s, idx) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 rounded-xl border border-slate-100 bg-white/[0.02] hover:bg-white/[0.05] transition-colors group"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="text-white font-medium text-sm">{s.name}</h3>
                        <p className="text-slate-600 text-xs mt-1">
                          {s.caseState === CaseState.INTERVENCION ? "Acompañamiento Intensivo" : "Patron de riesgo socioemocional detectado"}
                        </p>
                        <p className="text-slate-700 text-xs mt-1">
                          {s.group} · {s.matricula}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColors(s.caseState)} shadow-lg`}>
                        {CaseLabels[s.caseState]}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <NeoButton
                        onClick={() => {
                          setSelectedStudent(s);
                          setShowAdvancedPanel(true);
                        }}
                        className="px-4 py-2"
                      >
                        Iniciar intervención
                      </NeoButton>
                      <NeoButton
                        onClick={() => handleNotifyAcademicRisk(s.id, "patron detectado")}
                        className="px-4 py-2"
                      >
                        Notificar al equipo académico
                      </NeoButton>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </GlassCard>

        <GlassCard icon="family_restroom" title="Agenda de atencion" className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mt-4">
            <div className="p-8 rounded-xl border border-slate-100 bg-white/[0.02] text-center text-slate-700">
              Sin citas programadas para el dia de hoy.
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 gap-3">
            <NeoButton
              icon="add_alert"
              onClick={() => setModalOpen("APPOINTMENT")}
              className="w-full justify-center py-3"
            >
              Generar citatorio
            </NeoButton>
            <NeoButton
              icon="history_edu"
              onClick={() => setModalOpen("INTERVIEW")}
              className="w-full justify-center py-3"
            >
              Registrar entrevista
            </NeoButton>
            {supportProtocol && (
              <NeoButton
                icon="menu_book"
                onClick={() => setShowProtocol(true)}
                className="w-full justify-center py-3 text-sase-danger"
              >
                Activar protocolo crítico
              </NeoButton>
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
