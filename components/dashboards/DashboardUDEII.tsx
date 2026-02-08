import React, { useState } from "react";
import toast from "react-hot-toast";
import { useApp } from "../../store";
import { GenericActionModal } from "../GenericActionModal";
import { printContent } from "../PrintButtons";
import { IncidentType } from "../../types";

export const DashboardUDEII = () => {
  const { students, addIncident } = useApp();
  const studentsWithBAP = students.filter((s) => s.bapInfo?.hasBAP);

  // Modal states
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isBitacoraOpen, setIsBitacoraOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );
  const [selectedStudentName, setSelectedStudentName] = useState<string>("");

  const handleOpenAdjustmentModal = (
    studentId: string,
    studentName: string,
  ) => {
    setSelectedStudentId(studentId);
    setSelectedStudentName(studentName);
    setIsAdjustmentModalOpen(true);
  };

  const handleOpenVisitModal = (studentId: string, studentName: string) => {
    setSelectedStudentId(studentId);
    setSelectedStudentName(studentName);
    setIsVisitModalOpen(true);
  };

  const handleOpenBitacora = (studentId: string, studentName: string) => {
    setSelectedStudentId(studentId);
    setSelectedStudentName(studentName);
    setIsBitacoraOpen(true);
  };

  const handleSaveAdjustment = async (data: any) => {
    // In a real implementation, this would persist to Supabase
    console.log("New adjustment:", data, "for student:", selectedStudentId);
    toast.success("Ajuste añadido al protocolo institucional.");
    setIsAdjustmentModalOpen(false);
    setSelectedStudentId(null);
  };

  const handleScheduleVisit = async (data: any) => {
    console.log("Scheduling visit:", data, "for student:", selectedStudentId);
    try {
      if (selectedStudentId) {
        await addIncident(
          selectedStudentId,
          IncidentType.ACADEMICO,
          `📅 VISITA PROGRAMADA (UDEII): Se ha agendado una visita de acompañamiento y observación para el día ${data.date} a la hora ${data.time}. Objetivo: ${data.objective}.`,
        );
        toast.success(
          `Visita programada para el ${data.date}. Docentes notificados.`,
          { icon: "📅" },
        );
      }
    } catch (err) {
      toast.error("Error al programar la visita.");
    }
    setIsVisitModalOpen(false);
    setSelectedStudentId(null);
  };

  const handleNotifyNewStudent = async (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student || !student.bapInfo) return;

    try {
      await addIncident(
        studentId,
        IncidentType.ACADEMICO,
        `📢 NUEVO INGRESO UDEII: El alumno se incorpora al padrón de atención especializada. Diagnóstico: ${
          student.bapInfo.diagnosisPrivate
        }. Recomendaciones Inmediatas: ${student.bapInfo.accommodations.join(
          ", ",
        )}.`,
      );
      toast.success(
        "Docentes notificados sobre nuevo ingreso BAP y recomendaciones.",
        { icon: "campaign" },
      );
    } catch (err) {
      toast.error("Error al difundir información.");
    }
  };

  const handleGenerateReport = (student: any) => {
    const title = `PLAN DE INTERVENCIÓN - UDEII`;
    const content = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="border-bottom: 2px solid #333; padding-bottom: 10px;">EXPEDIENTE DE SEGUIMIENTO A LA INCLUSIÓN</h2>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">Alumno:</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${student.name}</td>
            <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">Grupo:</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${student.group}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">Matrícula:</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${student.matricula}</td>
            <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">Fecha:</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${new Date().toLocaleDateString()}</td>
          </tr>
        </table>

        <div style="margin-top: 30px;">
          <h3 style="background: #e0e7ff; padding: 10px; border-left: 5px solid #4338ca;">DIAGNÓSTICO ESPECIALIZADO</h3>
          <p style="padding: 15px; background: #fff; border: 1px solid #eee;">${student.bapInfo?.diagnosisPrivate || "Sin diagnóstico registrado"}</p>
        </div>

        <div style="margin-top: 20px;">
          <h3 style="background: #d1fae5; padding: 10px; border-left: 5px solid #059669;">AJUSTES RAZONABLES Y RECOMENDACIONES</h3>
          <ul style="list-style-type: none; padding: 0;">
            ${student.bapInfo?.accommodations.map((acc: string) => `<li style="padding: 10px; border-bottom: 1px solid #eee;">• ${acc}</li>`).join("")}
          </ul>
        </div>

        <div style="margin-top: 40px; border-top: 2px dashed #999; padding-top: 20px;">
          <p style="text-align: center; font-weight: bold;">FIRMA DE ENTERADO (DOCENTE)</p>
          <br><br><br>
          <div style="width: 200px; border-bottom: 1px solid #000; margin: 0 auto;"></div>
        </div>
      </div>
    `;
    printContent(title, content);
  };

  return (
    <div className="flex-1 w-full space-y-8 animate-fade-in relative z-10 transition-all">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1 h-full bg-indigo-600"></div>
            <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-700">
              <span className="material-symbols-outlined text-3xl">school</span>
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
              UDEII
            </h2>
            <div className="flex items-center gap-3 mt-1 text-xs font-bold uppercase tracking-widest text-slate-500">
              <span className="flex items-center gap-1.5 text-indigo-700">
                <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                Educación Especial e Inclusiva
              </span>
              <span className="text-slate-300">|</span>
              <span>Acompañamiento Docente</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
            <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
            Padrón de Alumnos con BAP
          </h3>
          <button
            onClick={() =>
              toast.success("Módulo de Registro de Inclusión iniciado (Demo)")
            }
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Nuevo Ingreso
          </button>
        </div>

        {studentsWithBAP.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 border border-slate-200 border-dashed rounded-3xl bg-slate-50 gap-4">
            <div className="size-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 border border-slate-200">
              <span className="material-symbols-outlined text-4xl">
                accessibility
              </span>
            </div>
            <p className="text-slate-400 font-black uppercase text-xs tracking-widest">
              Sin expedientes de inclusión activos
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {studentsWithBAP.map((s) => (
              <div
                key={s.id}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all border-l-4 border-l-indigo-500 relative overflow-hidden group"
              >
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Student Info */}
                  <div className="flex flex-col sm:flex-row gap-6 lg:w-1/3">
                    <img
                      src={s.avatar}
                      alt=""
                      className="size-20 rounded-2xl object-cover border-2 border-slate-100 shadow-sm"
                    />
                    <div>
                      <h4 className="font-black text-slate-800 text-xl uppercase italic tracking-tighter">
                        {s.name}
                      </h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded border border-slate-100">
                          {s.group}
                        </span>
                        <span className="text-xs font-black text-indigo-700 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded border border-indigo-100">
                          BAP
                        </span>
                      </div>
                      <p className="text-[10px] font-medium text-slate-500 mt-2 leading-relaxed">
                        {s.bapInfo?.diagnosisPrivate}
                      </p>
                    </div>
                  </div>

                  {/* Action Grid */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Notify Teachers Button */}
                    <button
                      onClick={() => handleNotifyNewStudent(s.id)}
                      className="flex flex-col items-center justify-center p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-100 transition-colors group/btn text-center gap-2"
                    >
                      <div className="size-10 rounded-full bg-white flex items-center justify-center shadow-sm text-indigo-600 group-hover/btn:scale-110 transition-transform">
                        <span className="material-symbols-outlined">
                          campaign
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-700 uppercase">
                          Informar a Docentes
                        </p>
                        <p className="text-[9px] text-slate-500 font-medium">
                          Nuevos Ingresos y Recomendaciones
                        </p>
                      </div>
                    </button>

                    {/* Schedule Visit Button */}
                    <button
                      onClick={() => handleOpenVisitModal(s.id, s.name)}
                      className="flex flex-col items-center justify-center p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100 transition-colors group/btn text-center gap-2"
                    >
                      <div className="size-10 rounded-full bg-white flex items-center justify-center shadow-sm text-emerald-600 group-hover/btn:scale-110 transition-transform">
                        <span className="material-symbols-outlined">event</span>
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-700 uppercase">
                          Agendar Visita
                        </p>
                        <p className="text-[9px] text-slate-500 font-medium">
                          Acompañamiento y Observación
                        </p>
                      </div>
                    </button>

                    {/* Generate Report Button */}
                    <button
                      onClick={() => handleGenerateReport(s)}
                      className="flex flex-col items-center justify-center p-4 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-100 transition-colors group/btn text-center gap-2"
                    >
                      <div className="size-10 rounded-full bg-white flex items-center justify-center shadow-sm text-blue-600 group-hover/btn:scale-110 transition-transform">
                        <span className="material-symbols-outlined">
                          description
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-700 uppercase">
                          Generar Documento
                        </p>
                        <p className="text-[9px] text-slate-500 font-medium">
                          Reporte de Seguimiento PDF
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Adjustments Summary */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 text-sm">
                      settings_accessibility
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {s.bapInfo?.accommodations.length} Ajustes Activos
                    </span>
                  </div>
                  <button
                    onClick={() => handleOpenBitacora(s.id, s.name)}
                    className="px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-700 uppercase tracking-widest shadow-sm transition-all flex items-center gap-2"
                  >
                    Consultar Bitácora
                    <span className="material-symbols-outlined text-[18px]">
                      arrow_right_alt
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Bitácora de Seguimiento (Notebook) */}
      {isBitacoraOpen && selectedStudentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                  Bitácora de Seguimiento
                </h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  {selectedStudentName}
                </p>
              </div>
              <button
                onClick={() => setIsBitacoraOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
              {students
                .find((s) => s.id === selectedStudentId)
                ?.incidents.filter(
                  (i) =>
                    i.type === IncidentType.ACADEMICO ||
                    i.description.includes("UDEII") ||
                    i.description.includes("BAP"),
                ).length === 0 ? (
                <div className="text-center py-10 opacity-50">
                  <span className="material-symbols-outlined text-4xl mb-2">
                    history_edu
                  </span>
                  <p className="text-xs font-black uppercase tracking-widest">
                    Sin registros en bitácora
                  </p>
                </div>
              ) : (
                students
                  .find((s) => s.id === selectedStudentId)
                  ?.incidents.filter(
                    (i) =>
                      i.type === IncidentType.ACADEMICO ||
                      i.description.includes("UDEII") ||
                      i.description.includes("BAP"),
                  )
                  .map((incident) => (
                    <div
                      key={incident.id}
                      className="relative pl-6 border-l-2 border-slate-200 pb-2 last:pb-0"
                    >
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-indigo-500"></div>
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                          {new Date(incident.date).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                          {incident.reportedBy}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                        {incident.description}
                      </p>
                    </div>
                  ))
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setIsBitacoraOpen(false)}
                className="px-6 py-2 bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-900 transition-colors"
              >
                Cerrar Bitácora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Ajustes Razonables */}
      <GenericActionModal
        isOpen={isAdjustmentModalOpen}
        onClose={() => {
          setIsAdjustmentModalOpen(false);
          setSelectedStudentId(null);
        }}
        title="Gestión de Ajustes Razonables"
        description={`Expediente: ${selectedStudentName}`}
        fields={[
          {
            name: "adjustment",
            label: "Descripción del Ajuste",
            type: "textarea",
            required: true,
          },
          {
            name: "category",
            label: "Categoría",
            type: "select",
            options: ["Metodológico", "Evaluación", "Acceso", "Curricular"],
            required: true,
          },
        ]}
        onSubmit={handleSaveAdjustment}
        submitLabel="Guardar Ajuste"
      />

      {/* Modal: Programar Visita */}
      <GenericActionModal
        isOpen={isVisitModalOpen}
        onClose={() => {
          setIsVisitModalOpen(false);
          setSelectedStudentId(null);
        }}
        title="Programar Visita de Acompañamiento"
        description={`Agendar observación para: ${selectedStudentName}`}
        fields={[
          {
            name: "date",
            label: "Fecha de Visita",
            type: "date",
            required: true,
          },
          {
            name: "time",
            label: "Hora / Módulo",
            type: "text",
            required: true,
          },
          {
            name: "objective",
            label: "Objetivo de la Observación",
            type: "select",
            options: [
              "Observación de conducta",
              "Seguimiento de ajustes",
              "Asesoría al docente",
              "Evaluación psicopedagógica",
            ],
            required: true,
          },
        ]}
        onSubmit={handleScheduleVisit}
        submitLabel="Notificar Visita"
      />
    </div>
  );
};
