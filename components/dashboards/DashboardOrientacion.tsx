import React, { useState, useEffect } from "react";

import { useApp } from "../../store";
import { CaseState, AppModule, Protocol } from "../../types";
import { printContent } from "../PrintButtons";
import { supabase } from "../../supabase/client";
import { ProtocolDetailModal } from "../Protocols/ProtocolDetailModal";
import { GenericActionModal } from "../GenericActionModal";
import { useAuth } from "../AuthProvider";
import { StudentAdvancedPanel } from "../StudentAdvancedPanel";
import { AIDocumentGenerator } from "../ai/AIDocumentGenerator";
import toast from "react-hot-toast";

export const DashboardOrientacion = () => {
  const { students, setCurrentModule, addIncident } = useApp();
  const { user } = useAuth();
  const [supportProtocol, setSupportProtocol] = useState<Protocol | null>(null);
  const [showProtocol, setShowProtocol] = useState(false);

  const [modalOpen, setModalOpen] = useState<
    "APPOINTMENT" | "INTERVIEW" | "CONTACT" | null
  >(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [targetStudent, setTargetStudent] = useState<string>("");
  const [showAdvancedPanel, setShowAdvancedPanel] = useState(false);

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
    if (error) throw error;
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
    if (error) throw error;
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
    if (error) throw error;
  };

  const handleNotifyAcademicRisk = async (studentId: string, info: string) => {
    try {
      await addIncident(
        studentId,
        "ACADEMICO" as any,
        `⚠️ REPORTE ORIENTACIÓN: Se requiere seguimiento especial por ${info}. Favor de reportar incidencias adicionales vía SASE.`,
      );
      toast.success("Seguimiento solicitado a docentes", { icon: "📝" });
    } catch (err) {
      toast.error("Error al enviar reporte");
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

  // Logic
  const studentsInTrouble = students.filter(
    (s) =>
      s.caseState !== CaseState.CERRADO && s.caseState !== CaseState.OBSERVADO,
  );

  const patternAlerts = students.filter(
    (s) => s.caseState === CaseState.PATRON_DETECTADO,
  );

  const nextAppointment = null; // Removed hardcoded Carlos H. placeholder

  const handlePrintReport = () => {
    // Intentar imprimir directamente el reporte actual
    window.print();
    // toast.success("Enviando a impresora...");
  };

  return (
    <div className="flex-1 w-full space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1 h-full bg-amber-500"></div>
            <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
              <span className="material-symbols-outlined text-3xl">
                psychology
              </span>
            </div>
          </div>
          <div>
            <h1
              id="orientacion-title"
              className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3"
            >
              Orientación Educativa
            </h1>
            <div className="flex items-center gap-3 mt-1 text-xs font-bold uppercase tracking-widest text-slate-500">
              <span className="flex items-center gap-1.5 text-amber-700">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                Acompañamiento Psicoeducativo
              </span>
              <span className="text-slate-300">|</span>
              <span>Prevención y Bienestar Estudiantil</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handlePrintReport}
            className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 uppercase tracking-widest shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            Imprimir Vista
          </button>
          <button
            onClick={() => setCurrentModule(AppModule.REPORTES_DOCENTES)}
            className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white border border-amber-500 rounded-xl text-xs font-bold uppercase tracking-widest shadow-md transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">
              psychology
            </span>
            Solicitar Reporte
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          {/* Patrones de Riesgo */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600 text-[20px]">
                  warning
                </span>
                Patrones de Riesgo Detectados (IA)
              </h3>
              <button
                onClick={() => setCurrentModule(AppModule.REPORTES)}
                className="text-xs font-black text-amber-700 hover:text-amber-800 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-lg transition-colors shadow-sm"
              >
                Ver Análisis Predictivo
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {patternAlerts.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <p className="font-bold uppercase text-sm italic tracking-widest">
                    Sin alertas de patrón activas
                  </p>
                </div>
              ) : (
                patternAlerts.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 hover:bg-slate-50/50 transition-colors flex items-center gap-4 group"
                  >
                    <div className="size-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                      <span className="material-symbols-outlined">
                        person_alert
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-black text-slate-800 uppercase italic">
                          {s.name}
                        </p>
                        <span className="text-xs font-black px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg uppercase shadow-sm">
                          {s.group}
                        </span>
                      </div>
                      <p className="text-xs font-black text-red-700 uppercase flex items-center gap-2 mt-1">
                        <span className="size-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                        Comportamiento Recurrente: {s.incidents.length}{" "}
                        Incidentes
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="px-3.5 py-2 bg-blue-600 border border-blue-500 rounded-xl text-xs font-black text-white uppercase hover:bg-blue-700 shadow-md shadow-blue-900/10 transition-all active:scale-95 flex items-center gap-2"
                        onClick={() => {
                          setSelectedStudent(s);
                          setShowAdvancedPanel(true);
                        }}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          settings_suggest
                        </span>
                        Gestión
                      </button>
                      <button
                        className="px-3.5 py-2 bg-amber-600 border border-amber-500 rounded-xl text-xs font-black text-white uppercase hover:bg-amber-700 shadow-md shadow-amber-900/10 transition-all active:scale-95"
                        onClick={() =>
                          handleNotifyAcademicRisk(
                            s.id,
                            "conducta/riesgo detectado",
                          )
                        }
                      >
                        Reportar a Docentes
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Estadísticas de Seguimiento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center justify-between">
                Incidencias por Nivel Académico
                <span className="material-symbols-outlined text-slate-400">
                  bar_chart
                </span>
              </h3>
              <div className="h-48 flex items-end gap-6 px-4 pb-2 border-b border-slate-100">
                <Bar
                  height="40%"
                  color="bg-blue-400"
                  label="1º Grado"
                  value="28"
                />
                <Bar
                  height="70%"
                  color="bg-amber-400"
                  label="2º Grado"
                  value="45"
                />
                <Bar
                  height="50%"
                  color="bg-indigo-400"
                  label="3º Grado"
                  value="32"
                />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center justify-between">
                Reportes Recientes por Docente
                <span className="material-symbols-outlined text-slate-400">
                  group
                </span>
              </h3>
              <div className="space-y-3">
                <TeacherStat
                  name="Academia 1º"
                  count={0}
                  color="bg-slate-50 text-slate-500"
                />
                <TeacherStat
                  name="Academia 2º"
                  count={0}
                  color="bg-slate-50 text-slate-500"
                />
                <TeacherStat
                  name="Academia 3º"
                  count={0}
                  color="bg-slate-50 text-slate-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Protocol Widget */}
          {supportProtocol && (
            <div className="bg-gradient-to-br from-red-600 to-rose-700 rounded-2xl p-6 shadow-lg text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-8xl">
                  shield
                </span>
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 bg-white/20 rounded text-[10px] font-bold uppercase tracking-widest">
                    Material de Apoyo
                  </span>
                </div>
                <h3 className="text-xl font-bold leading-tight mb-2">
                  {supportProtocol.titulo}
                </h3>
                <p className="text-red-100 text-xs mb-4 line-clamp-2">
                  {supportProtocol.objetivo}
                </p>
                <button
                  onClick={() => setShowProtocol(true)}
                  className="w-full py-2.5 bg-white text-red-700 font-bold text-sm rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    menu_book
                  </span>
                  Consultar Protocolo
                </button>
              </div>
            </div>
          )}

          {/* Solicitudes Internas */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                Solicitudes Internas
              </h3>
              <span className="bg-blue-100 text-blue-800 text-xs font-black px-2.5 py-1 rounded-full shadow-sm">
                2 NUEVAS
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-8 border border-slate-100 border-dashed rounded-xl flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">
                  inbox
                </span>
                <p className="text-[10px] font-black uppercase tracking-widest">
                  Sin solicitudes pendientes
                </p>
              </div>

              <button
                onClick={() => setCurrentModule(AppModule.REPORTES_DOCENTES)}
                className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-xs font-black text-slate-500 uppercase hover:border-amber-500 hover:text-amber-600 hover:bg-amber-50/30 transition-all flex items-center justify-center gap-2 group"
              >
                <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">
                  add_circle
                </span>
                Nueva Solicitud de Reporte
              </button>
            </div>
          </div>

          {/* Agenda & Citas */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-bl-full -mr-4 -mt-4 pointer-events-none"></div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
              <span className="material-symbols-outlined text-amber-600 text-[20px]">
                calendar_month
              </span>
              Agenda de Seguimiento
            </h3>

            <div id="citation-manager" className="space-y-5 relative z-10">
              {nextAppointment ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 group hover:border-amber-500 transition-all cursor-pointer">
                  <p className="text-xs font-black text-amber-800 uppercase mb-2 flex items-center gap-2">
                    <span className="size-2 bg-amber-600 rounded-full shadow-[0_0_5px_rgba(217,119,6,0.5)]"></span>
                    PRÓXIMA SESIÓN
                  </p>
                  <p className="text-lg font-black text-slate-800 mb-1">
                    {nextAppointment.family}
                  </p>
                  <p className="text-xs font-bold text-slate-400 uppercase italic mb-3">
                    {nextAppointment.student}
                  </p>
                  <div className="flex items-center gap-2 bg-white border border-slate-100 px-3.5 py-2 rounded-xl w-fit text-xs font-black text-slate-700 shadow-sm">
                    <span className="material-symbols-outlined text-lg text-amber-600">
                      schedule
                    </span>
                    {nextAppointment.time}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50/50 border border-slate-200 border-dashed rounded-2xl p-8 text-center">
                  <span className="material-symbols-outlined text-slate-300 text-4xl mb-2">
                    event_busy
                  </span>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Sin citas programadas
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 transition-all flex flex-col items-center gap-2"
                  onClick={() => setModalOpen("APPOINTMENT")}
                >
                  <span className="material-symbols-outlined text-slate-400">
                    calendar_add_on
                  </span>
                  <span className="text-xs font-black text-slate-700 uppercase tracking-widest">
                    Agendar Cita
                  </span>
                </button>
                <button
                  className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 transition-all flex flex-col items-center gap-2"
                  onClick={() => setModalOpen("INTERVIEW")}
                >
                  <span className="material-symbols-outlined text-slate-400">
                    history_edu
                  </span>
                  <span className="text-xs font-black text-slate-700 uppercase tracking-widest">
                    Entrevista
                  </span>
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-xl font-black text-slate-800">8</p>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest mt-1">
                    Citatorios
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-black text-emerald-600">92%</p>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest mt-1">
                    Efectividad
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showProtocol && supportProtocol && (
        <ProtocolDetailModal
          protocol={supportProtocol}
          onClose={() => setShowProtocol(false)}
        />
      )}
      <GenericActionModal
        isOpen={modalOpen === "APPOINTMENT"}
        onClose={() => setModalOpen(null)}
        title="Agendar Cita"
        description="Sistema de Citas con Tutores"
        fields={[
          {
            name: "student",
            label: "Alumno / Tutor",
            type: "text",
            required: true,
          },
          {
            name: "reason",
            label: "Motivo",
            type: "select",
            options: [
              "Seguimiento Conductual",
              "Bajo Rendimiento",
              "Situación Familiar",
              "Otro",
            ],
            required: true,
          },
          { name: "date", label: "Fecha y Hora", type: "date", required: true },
        ]}
        onSubmit={handleSaveAppointment}
      />
      <GenericActionModal
        isOpen={modalOpen === "INTERVIEW"}
        onClose={() => setModalOpen(null)}
        title="Entrevista con Alumno"
        description="Registro de Intervención"
        fields={[
          { name: "student", label: "Alumno", type: "text", required: true },
          { name: "reason", label: "Motivo", type: "text", required: true },
          {
            name: "notes",
            label: "Notas / Acuerdos",
            type: "textarea",
            required: true,
          },
          {
            name: "result",
            label: "Resultado Inicial",
            type: "select",
            options: ["Acuerdo Firmado", "Canalización", "Pendiente"],
            required: true,
          },
        ]}
        onSubmit={handleSaveInterview}
      />
      <GenericActionModal
        isOpen={modalOpen === "CONTACT"}
        onClose={() => setModalOpen(null)}
        title="Bitácora de Contacto"
        description={`Contactando a familia de: ${targetStudent}`}
        fields={[
          { name: "student", label: "Alumno", type: "text", required: true },
          {
            name: "method",
            label: "Medio de Contacto",
            type: "select",
            options: [
              "Llamada Telefónica",
              "WhatsApp",
              "Correo Electrónico",
              "Citatorio Físico",
            ],
            required: true,
          },
          {
            name: "notes",
            label: "Resumen de la Conversación",
            type: "textarea",
            required: true,
          },
          {
            name: "outcome",
            label: "Resultado",
            type: "select",
            options: [
              "Contactado / Confirmado",
              "Sin Respuesta / Buzón",
              "Número Equivocado",
              "Recado Dejado",
            ],
            required: true,
          },
        ]}
        onSubmit={handleSaveContact}
      />

      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-50 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full text-slate-500 transition-all z-10"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="relative h-32 bg-gradient-to-r from-amber-600 to-orange-700">
              <div className="absolute -bottom-10 left-8 size-24 rounded-full border-4 border-slate-50 overflow-hidden bg-white shadow-lg">
                <img
                  src={selectedStudent.avatar}
                  alt={selectedStudent.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="pt-12 px-8 pb-8">
              <h2 className="text-2xl font-black text-slate-800 uppercase italic">
                {selectedStudent.name}
              </h2>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">
                {selectedStudent.matricula}
              </p>

              <div className="mt-6 space-y-4">
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                  <h4 className="text-xs font-black text-red-700 uppercase tracking-widest mb-2">
                    Incidencias Recientes
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedStudent.incidents &&
                      selectedStudent.incidents.map((inc: any) => (
                        <div
                          key={inc.id}
                          className="text-xs bg-white p-2 rounded border border-red-100"
                        >
                          <span className="font-bold block">{inc.type}</span>
                          <span className="text-slate-500">
                            {inc.description}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showAdvancedPanel && selectedStudent && (
        <StudentAdvancedPanel
          student={selectedStudent}
          onClose={() => setShowAdvancedPanel(false)}
        />
      )}
    </div>
  );
};

const Bar = ({ height, color, label, value }: any) => (
  <div className="flex-1 flex flex-col items-center gap-2 h-full">
    <div className="flex-1 w-full flex items-end">
      <div
        className={`w-full ${color} rounded-t-lg transition-all hover:brightness-110 relative group/bar`}
        style={{ height }}
      >
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-800 opacity-0 group-hover/bar:opacity-100 transition-opacity">
          {value}
        </div>
      </div>
    </div>
    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-2 whitespace-nowrap">
      {label}
    </span>
  </div>
);

const TeacherStat = ({ name, count, color }: any) => (
  <div
    className={`flex justify-between items-center p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors group cursor-pointer`}
  >
    <span className="text-xs font-bold text-slate-600 uppercase">{name}</span>
    <span
      className={`text-xs font-black px-3 py-1 rounded-lg border border-transparent group-hover:border-amber-200 shadow-sm ${color}`}
    >
      {count} CAPS
    </span>
  </div>
);
