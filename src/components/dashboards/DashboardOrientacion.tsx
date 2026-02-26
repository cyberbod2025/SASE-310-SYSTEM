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
          <span className="text-[10px] font-black px-2 py-0.5 rounded-lg border border-white/10 bg-white/5 text-slate-400 uppercase tracking-tighter">
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
    <div className="p-4 lg:p-8 space-y-8 animate-fade-in max-w-[1600px] mx-auto pb-32">
      {/* COMMAND CENTER HEADER */}
      <div className="card-sase p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px] -mr-40 -mt-40 group-hover:bg-amber-500/10 transition-colors duration-1000"></div>

        <div className="flex items-center gap-6 relative z-10">
          <div className="size-20 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center justify-center text-amber-500 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-amber-500/10 animate-pulse"></div>
            <span className="material-symbols-outlined text-4xl font-black relative z-10">
              psychology
            </span>
          </div>
          <div>
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">
              NÚCLEO DE <span className="text-amber-500">ORIENTACIÓN</span>
            </h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-3 italic">
              CENTRO DE APOYO PSICOEDUCATIVO // SASE-310
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 relative z-10">
          <button
            onClick={handlePrepareBitacora}
            className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-white hover:bg-white/10 transition-all flex items-center gap-3 active:scale-95"
          >
            <span className="material-symbols-outlined text-xl">print</span>
            BITÁCORA_PDF
          </button>
          <button
            onClick={() => setCurrentModule(AppModule.REPORTES_DOCENTES)}
            className="px-8 py-4 bg-amber-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-amber-600/20 hover:bg-amber-500 transition-all flex items-center gap-3 active:scale-95"
          >
            <span className="material-symbols-outlined text-xl">add_chart</span>
            SOLICITAR_ESTATUS
          </button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <HolographicKPI
          icon="group"
          label="Población Bajo Monitoreo"
          value={students.length}
          trend="+0.2% Global"
          color="indigo"
          delay={0}
        />
        <HolographicKPI
          icon="warning"
          label="Casos en Intervención"
          value={attentionRequired}
          trend="Prioridad_01"
          color="amber"
          delay={1}
        />
        <HolographicKPI
          icon="visibility"
          label="En Seguimiento Profundo"
          value={onObservation}
          trend="Nominal"
          color="emerald"
          delay={2}
        />
        <HolographicKPI
          icon="radar"
          label="Patrones Críticos"
          value={patternAlerts.length}
          trend="IA_Detection"
          color="rose"
          delay={3}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* CENTER COLUMN: PATTERN MONITOR */}
        <div className="xl:col-span-2 space-y-8">
          <div className="card-sase border-white/5 overflow-hidden flex flex-col group h-full">
            <div className="p-6 border-b border-white/5 bg-white/[0.01] flex items-center justify-between relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
              <div className="flex items-center gap-4">
                <div className="size-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 shadow-lg">
                  <span className="material-symbols-outlined text-xl animate-pulse">
                    radar
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">
                    MONITOR DE PATRONES{" "}
                    <span className="text-amber-500">IA_CORE</span>
                  </h3>
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">
                    ANÁLISIS DE RECURRENCIA CONDUCTUAL
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                STREAM_ACTIVE
              </span>
            </div>

            <div className="divide-y divide-white/[0.02]">
              <AnimatePresence>
                {patternAlerts.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-20 text-center flex flex-col items-center gap-4 opacity-30"
                  >
                    <span className="material-symbols-outlined text-6xl text-slate-600">
                      shield_with_heart
                    </span>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">
                      Sin alertas de riesgo detectadas
                    </p>
                  </motion.div>
                ) : (
                  patternAlerts.map((s, idx) => (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      key={s.id}
                      className="p-6 hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row md:items-center gap-6 group/row"
                    >
                      <div className="flex items-center gap-6 flex-1">
                        <div className="size-14 rounded-2xl bg-white/[0.03] border border-white/10 text-slate-500 flex items-center justify-center relative overflow-hidden group-hover/row:border-amber-500/30 transition-all">
                          <span className="material-symbols-outlined text-2xl group-hover/row:scale-110 transition-transform">
                            person_search
                          </span>
                          <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover/row:opacity-100 transition-opacity"></div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <p className="font-black text-white text-base italic uppercase tracking-tighter group-hover/row:text-amber-400 transition-colors">
                              {s.name}
                            </p>
                            <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-black rounded uppercase">
                              {s.group}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                              <span className="size-1.5 bg-rose-500 rounded-full animate-ping"></span>
                              ESTADO_ALERTA: PATRÓN DETECTADO
                            </span>
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                              ID: {s.matricula}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 relative z-10 mt-4 md:mt-0">
                        <button
                          onClick={() => {
                            setSelectedStudent(s);
                            setShowAdvancedPanel(true);
                          }}
                          className="px-5 py-2.5 bg-amber-600/10 border border-amber-500/20 text-amber-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-600 hover:text-white transition-all active:scale-95 flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-sm">
                            psychology_alt
                          </span>
                          INTERVENIR
                        </button>
                        <button
                          onClick={() =>
                            handleNotifyAcademicRisk(s.id, "patrón detectado")
                          }
                          className="px-5 py-2.5 bg-white/5 border border-white/10 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all active:scale-95"
                        >
                          NOTIFICAR
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AGENDA & PROTOCOLS */}
        <div className="space-y-8">
          {/* PROTOCOL WIDGET */}
          {supportProtocol && (
            <div className="card-sase p-8 bg-rose-500/[0.02] border-rose-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-all">
                <span className="material-symbols-outlined text-8xl rotate-12 text-rose-500">
                  description
                </span>
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded text-[9px] font-black text-rose-500 uppercase tracking-widest">
                    PROTOCOLO_CRÍTICO
                  </span>
                </div>
                <h3 className="text-xl font-black text-white italic tracking-tighter uppercase mb-2">
                  {supportProtocol.titulo}
                </h3>
                <p className="text-slate-400 text-[10px] font-medium leading-relaxed mb-6 uppercase tracking-tight line-clamp-2">
                  {supportProtocol.objetivo}
                </p>
                <button
                  onClick={() => setShowProtocol(true)}
                  className="w-full py-4 bg-rose-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-rose-500 transition-all shadow-xl shadow-rose-600/20 active:scale-95 flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined text-lg">
                    menu_book
                  </span>
                  EJECUTAR PROTOCOLO
                </button>
              </div>
            </div>
          )}

          {/* AGENDA INTERFACE */}
          <div className="card-sase p-8 border-white/5 relative overflow-hidden group min-h-[400px]">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                <span className="material-symbols-outlined text-amber-500 text-xl">
                  calendar_today
                </span>
                AGENDA_INTERVENCIÓN
              </h3>
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-500 text-[9px] font-black rounded border border-amber-500/20 tabular-nums uppercase tracking-widest overflow-hidden relative">
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="size-1.5 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                />
                <span className="relative z-10">CORE_SYNC_ACTIVE</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white/[0.02] border border-white/5 border-dashed rounded-3xl p-10 text-center flex flex-col items-center gap-4 opacity-40">
                <span className="material-symbols-outlined text-5xl text-slate-700">
                  event_busy
                </span>
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] italic">
                  Sin citas registradas hoy
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-4">
                <button
                  onClick={() => setModalOpen("APPOINTMENT")}
                  className="p-5 bg-white/5 hover:bg-amber-600 hover:text-white rounded-2xl border border-white/5 transition-all text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-4 active:scale-95 group/btn"
                >
                  <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center group-hover/btn:bg-white/20">
                    <span className="material-symbols-outlined">
                      event_note
                    </span>
                  </div>
                  AGENDAR CITATORIO
                </button>
                <button
                  onClick={() => setModalOpen("INTERVIEW")}
                  className="p-5 bg-white/5 hover:bg-indigo-600 hover:text-white rounded-2xl border border-white/5 transition-all text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-4 active:scale-95 group/btn"
                >
                  <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center group-hover/btn:bg-white/20">
                    <span className="material-symbols-outlined">
                      history_edu
                    </span>
                  </div>
                  INICIAR ENTREVISTA
                </button>
              </div>

              <div className="pt-8 border-t border-white/5 grid grid-cols-2 gap-8">
                <div className="text-center">
                  <p className="text-3xl font-black text-white italic tracking-tighter">
                    14
                  </p>
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1 italic">
                    Logros_Mes
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-black text-emerald-500 italic tracking-tighter">
                    98%
                  </p>
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1 italic">
                    Tasa_Exito
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
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
        title="Bóveda de Citatorios"
        description="Gestión de reuniones con tutores legales"
        fields={[
          {
            name: "student",
            label: "IDENTIFICADOR_UNIDAD (MATRÍCULA)",
            type: "text",
            required: true,
          },
          {
            name: "reason",
            label: "NATURALEZA_DEL_LLAMADO",
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
            label: "VENTANA_TEMPORAL (FECHA/HORA)",
            type: "date",
            required: true,
          },
        ]}
        onSubmit={handleSaveAppointment}
      />

      <GenericActionModal
        isOpen={modalOpen === "INTERVIEW"}
        onClose={() => setModalOpen(null)}
        title="Gestor de Entrevistas"
        description="Registro táctico de intervenciones directas"
        fields={[
          {
            name: "student",
            label: "TARGET_ID (MATRÍCULA)",
            type: "text",
            required: true,
          },
          {
            name: "reason",
            label: "EJE_DE_INTERVENCIÓN",
            type: "text",
            required: true,
          },
          {
            name: "notes",
            label: "NOTAS_DE_CAMPO (CRÍTICO)",
            type: "textarea",
            required: true,
          },
          {
            name: "result",
            label: "DICTAMEN_ESTRATÉGICO",
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
    </div>
  );
};
