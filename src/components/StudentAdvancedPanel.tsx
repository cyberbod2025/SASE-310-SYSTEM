import React, { useState, useEffect, lazy, Suspense } from "react";
import { useAuditoriaAccesos } from "../hooks/useAuditoriaAccesos";
import { AvisoUsoResponsable } from "./AvisoUsoResponsable";
import {
  Student,
  Incident,
  DocumentoInstitucional,
  UserRole,
  CaseState, CaseLabels,
  IncidentType,
} from "../types";
import { useApp } from "../store";
import { printContent } from "./PrintButtons";
// Lazy Loading para Módulos Pesados (IA y Generación PDF)
const GeneradorDocumentos = lazy(() =>
  import("../modules/documentos").then((m) => ({
    default: m.GeneradorDocumentos,
  })),
);
const ExpedienteInstitucional = lazy(() =>
  import("../modules/expedientes").then((m) => ({
    default: m.ExpedienteInstitucional,
  })),
);
import "./StudentProfile.css"; // Usa el nuevo CSS "Institutional Light"
import toast from "react-hot-toast";

import { PrintPreviewModal } from "./PrintPreviewModal";
import { sendWhatsAppNotification } from "../utils/notifications";

interface StudentAdvancedPanelProps {
  student: Student;
  onClose: () => void;
}

export const StudentAdvancedPanel: React.FC<StudentAdvancedPanelProps> = ({
  student,
  onClose,
}) => {
  const {
    currentUserRole,
    updateGrades,
    toggleDistanceState,
    logAudit,
    addIncident,
    markIncidentAsNotified,
  } = useApp();
  const [activeTab, setActiveTab] = useState<"CLINICAL" | "ACADEMIC" | "LEGAL">(
    "ACADEMIC",
  );
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  // --- AUDITORÍA DE ACCESOS SENSIBLES ---
  const { registrarAcceso } = useAuditoriaAccesos();
  const [avisoAceptado, setAvisoAceptado] = useState(() => {
    return sessionStorage.getItem("sase_aviso_sensible_aceptado") === "true";
  });

  const handleAceptarAviso = () => {
    sessionStorage.setItem("sase_aviso_sensible_aceptado", "true");
    setAvisoAceptado(true);
  };

  // --- MODULO EXPEDIENTES ---
  const [showExpediente, setShowExpediente] = useState(false);

  // Registrar apertura del panel cuando el usuario acepta
  useEffect(() => {
    if (avisoAceptado) {
      registrarAcceso({
        accion: "abrir_panel_avanzado",
        alumno_id: student.id,
        pantalla: "StudentAdvancedPanel",
      });
      // Registrar consulta de expediente automáticamente
      registrarAcceso({
        accion: "consultar_expediente",
        alumno_id: student.id,
        pantalla: "StudentAdvancedPanel",
      });
    }
  }, [avisoAceptado]); // eslint-disable-line react-hooks/exhaustive-deps

  // Registrar acceso por pestaña
  useEffect(() => {
    if (!avisoAceptado) return;
    if (activeTab === "CLINICAL") {
      registrarAcceso({
        accion: "consultar_alerta_medica",
        alumno_id: student.id,
        pantalla: "StudentAdvancedPanel:CLINICAL",
      });
      registrarAcceso({
        accion: "consultar_historial_disciplina",
        alumno_id: student.id,
        pantalla: "StudentAdvancedPanel:CLINICAL",
      });
    }
    if (activeTab === "LEGAL") {
      registrarAcceso({
        accion: "consultar_trabajo_social",
        alumno_id: student.id,
        pantalla: "StudentAdvancedPanel:LEGAL",
      });
    }
  }, [activeTab, avisoAceptado]); // eslint-disable-line react-hooks/exhaustive-deps

  // Incident Form State
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [newIncident, setNewIncident] = useState({
    type: IncidentType.CONDUCTA,
    description: "",
    photo: null as string | null,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewIncident((prev) => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveIncident = async () => {
    if (!newIncident.description) {
      toast.error("Por favor describa la incidencia");
      return;
    }

    setIsSaving(true);
    try {
      await addIncident(
        student.id,
        newIncident.type,
        newIncident.description,
        newIncident.photo ? [newIncident.photo] : [],
      );

      setShowIncidentForm(false);
      setNewIncident({
        type: IncidentType.CONDUCTA,
        description: "",
        photo: null,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // --- PERMISOS ---
  const canEditGrades =
    currentUserRole === UserRole.SECRETARIA ||
    currentUserRole === UserRole.DEVELOPER;

  const canViewClinical =
    currentUserRole !== UserRole.SECRETARIA &&
    currentUserRole !== UserRole.PROMOTORA_LECTURA;

  const canPrintSensitive =
    currentUserRole !== UserRole.SECRETARIA &&
    currentUserRole !== UserRole.DOCENTE; // Solo directivos y áreas especializadas imprimen lo sensible

  // --- CÁLCULO DE PROMEDIO ---
  const gpa = student.calificaciones?.length
    ? (
        student.calificaciones.reduce(
          (acc, c) =>
            acc +
            (c.promedioFinal ||
              ((c.trimestre1 || 0) +
                (c.trimestre2 || 0) +
                (c.trimestre3 || 0)) /
                3),
          0,
        ) / student.calificaciones.length
      ).toFixed(1)
    : "N/A";

  // --- COLORES DE ESTADO (Visible en fondo claro) ---
  const statusColor =
    {
      [CaseState.CERRADO]: "text-emerald-700 bg-emerald-50 border-emerald-200",
      [CaseState.OBSERVADO]: "text-blue-700 bg-blue-50 border-blue-200",
      [CaseState.PATRON_DETECTADO]:
        "text-amber-700 bg-amber-50 border-amber-200",
      [CaseState.INTERVENCION]: "text-rose-700 bg-rose-50 border-rose-200",
      [CaseState.EN_ANALISIS]:
        "text-fuchsia-700 bg-fuchsia-50 border-fuchsia-200",
      [CaseState.SEGUIMIENTO]: "text-indigo-700 bg-indigo-50 border-indigo-200",
    }[student.caseState] || "text-slate-600 bg-slate-50 border-slate-200";

  // --- HANDLERS ---
  const handleUpdateGrades = (
    materia: string,
    field: string,
    value: string,
  ) => {
    if (!canEditGrades) return;
    const currentGrades = student.calificaciones || [];
    const updatedGrades = currentGrades.map((g) => {
      if (g.materia === materia) {
        return { ...g, [field]: Number(value) };
      }
      return g;
    });
    updateGrades(student.id, updatedGrades);
    toast.success("Calificación actualizada");
  };

  const handleWhatsAppIncident = async (incident: Incident) => {
    if (incident.notificado_whatsapp) {
      toast.error("Esta incidencia ya ha sido notificada.");
      return;
    }

    if (!student.guardianInfo?.phonePrimary) {
      toast.error("No hay teléfono del tutor registrado.");
      return;
    }

    const loadingToast = toast.loading("Enviando notificación SASE...");
    
    try {
      const res = await sendWhatsAppNotification({
        to: student.guardianInfo.phonePrimary,
        message: `SASE ALERTA: Reporte de ${incident.type} para ${student.name}. Detalle: ${incident.description}`,
        studentName: student.name,
        incidentType: incident.type
      });

      if (res.success) {
        toast.success("Notificación enviada con éxito", { id: loadingToast });
        await markIncidentAsNotified(student.id, incident.id);
      } else {
        toast.error(`Error: ${res.error}`, { id: loadingToast });
      }
    } catch (err) {
      toast.error("Error al conectar con el servicio de mensajería", { id: loadingToast });
    }
  };

  const handlePrintDoc = (doc: DocumentoInstitucional) => {
    printContent(
      doc.titulo,
      `<div style="white-space: pre-wrap; font-family: sans-serif;">${doc.contenido}</div>`,
    );
    toast.success("Documento enviado a impresión");
  };

  const handleContactTutor = (method: "call" | "email") => {
    if (!student.guardianInfo) {
      toast.error("Sin información de contacto registrada");
      return;
    }
    toast.success(
      `Iniciando contacto vía ${method === "call" ? "Teléfono" : "Correo"}...`,
    );
    // Aquí iría la lógica real de integración con VoIP o Mailto
  };

  // --- MODAL DE AVISO DE USO RESPONSABLE (Bloquea acceso hasta aceptar) ---
  if (!avisoAceptado) {
    return (
      <AvisoUsoResponsable
        studentName={student.name}
        onAccept={handleAceptarAviso}
        onReject={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-0 md:p-4 overflow-hidden animate-fade-in font-['Inter']">
      {/* --- CONTENEDOR PRINCIPAL: Adaptativo --- */}
      <div className="relative w-full h-full md:w-full md:max-w-6xl md:h-[90vh] bg-[#F8FAFC] rounded-none md:rounded-[2rem] shadow-2xl border-none md:border md:border-slate-200 overflow-y-auto md:overflow-hidden flex flex-col md:flex-row">
        {/* BOTÓN CERRAR (Visible y Claro) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[70] p-3 md:p-2 bg-white/80 backdrop-blur-md text-slate-500 rounded-full hover:bg-rose-500 hover:text-white transition-all shadow-xl shadow-black/5 border border-slate-200 group active:scale-95"
          title="Cerrar Expediente"
        >
          <span className="material-symbols-outlined text-2xl md:text-xl group-hover:rotate-90 duration-300">
            close
          </span>
        </button>

        {/* --- COLUMNA IZQUIERDA: IDENTIDAD (Apilable) --- */}
        <div className="w-full md:w-80 flex flex-col items-center text-center gap-4 md:gap-6 md:h-full border-b md:border-b-0 md:border-r border-slate-200 p-6 bg-white/50">
          {/* Avatar Scanner */}
          <div className="relative group cursor-pointer mt-4 md:mt-8">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-white shadow-xl relative bg-slate-100 ring-1 ring-slate-100">
              <img
                src={student.avatar}
                alt={student.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
            {/* Badge de Estado */}
            <div
              className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm whitespace-nowrap ${statusColor}`}
            >
              {CaseLabels[student.caseState]}
            </div>
          </div>

          {/* Datos Clave (Texto Grande) */}
          <div className="w-full space-y-4 mt-2">
            <div className="text-center px-2">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
                {student.name}
              </h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                Matrícula: {student.matricula}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full px-2">
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center hover:border-slate-300 transition-colors">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                  Grupo
                </p>
                <p className="text-lg font-black text-slate-700">
                  {student.group}
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center hover:border-slate-300 transition-colors">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                  Promedio
                </p>
                <p className="text-lg font-black text-emerald-600">{gpa}</p>
              </div>
            </div>
          </div>

          {/* Badges / Etiquetas */}
          <div className="w-full mt-auto mb-6 px-2">
            <p className="text-[9px] text-slate-400 uppercase font-black mb-3 text-left pl-2 tracking-widest">
              Etiquetas Activas
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {student.isDistancia && (
                <span className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold rounded-2xl uppercase flex items-center gap-1.5 shadow-sm">
                  <span className="material-symbols-outlined text-[14px]">
                    wifi
                  </span>
                  Distancia
                </span>
              )}
              {student.bapInfo?.hasBAP && (
                <span className="px-3 py-1.5 bg-purple-50 border border-purple-200 text-purple-700 text-[10px] font-bold rounded-2xl uppercase flex items-center gap-1.5 shadow-sm">
                  <span className="material-symbols-outlined text-[14px]">
                    psychology
                  </span>
                  BAP
                </span>
              )}
              <span className="px-3 py-1.5 bg-white border border-slate-200 text-slate-500 text-[10px] font-bold rounded-2xl uppercase shadow-sm">
                Activo 2026
              </span>
            </div>
          </div>

          {/* ACCESO A EXPEDIENTE INSTITUCIONAL */}
          <div className="w-full px-2 mb-4">
            <button
              onClick={() => setShowExpediente(true)}
              className="w-full py-3 bg-gradient-to-br from-slate-800 to-indigo-900 border-2 border-slate-900 text-white rounded-xl shadow-[0_4px_15px_-3px_rgba(30,58,138,0.4)] hover:shadow-[0_8px_25px_-5px_rgba(30,58,138,0.5)] transition-all flex flex-col items-center justify-center gap-1 group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <div className="flex items-center gap-2 z-10">
                <span className="material-symbols-outlined text-xl">
                  folder_shared
                </span>
                <span className="text-[11px] font-black uppercase tracking-widest">
                  Expediente Institucional
                </span>
              </div>
              <p className="text-[9px] text-blue-100 font-medium z-10">
                Consultar e Imprimir PDF
              </p>
            </button>
          </div>
        </div>

        {/* --- COLUMNA CENTRAL: INTERFAZ DINÁMICA --- */}
        <div className="flex flex-col gap-4 h-full overflow-hidden bg-white/30 rounded-2xl p-2 border border-slate-100">
          {/* Header: Tabs de Navegación (Estilo iOS Segmented Control) */}
          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex gap-1">
            {(
              [
                { id: "ACADEMIC", icon: "school", label: "Académico" },
                {
                  id: "CLINICAL",
                  icon: "ecg_heart",
                  label: "Clínico / Conductual",
                },
                { id: "LEGAL", icon: "gavel", label: "Legal y Protocolos" },
              ] as const
            )
              .filter((tab) => tab.id !== "CLINICAL" || canViewClinical)
              .map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  title={`Ver información ${tab.label}`}
                  className={`flex-1 py-2 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wide transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-white text-slate-800 shadow-sm border border-slate-200"
                      : "text-slate-400 hover:bg-white/50 hover:text-slate-600"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {tab.icon}
                  </span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
          </div>

          {/* ÁREA DE CONTENIDO (Scrollable) */}
          <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden flex flex-col relative w-full">
            {/* ACADÉMICO */}
            {activeTab === "ACADEMIC" && (
              <div className="overflow-y-auto custom-scrollbar h-full pr-2 space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400">
                      score
                    </span>
                    Kardex de Calificaciones
                  </h3>
                  {!canEditGrades && (
                    <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 uppercase tracking-wide">
                      Vista de Lectura
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {(student.calificaciones || []).map((cal) => {
                    const avg =
                      ((cal.trimestre1 || 0) +
                        (cal.trimestre2 || 0) +
                        (cal.trimestre3 || 0)) /
                      3;
                    const isFailing = avg < 6;
                    return (
                      <div
                        key={cal.materia}
                        className="bg-slate-50 border border-slate-200 p-4 rounded-xl hover:border-slate-300 transition-all group"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span
                            className="text-[11px] font-black text-slate-600 uppercase truncate pr-2"
                            title={cal.materia}
                          >
                            {cal.materia}
                          </span>
                          <span
                            className={`text-lg font-black ${isFailing ? "text-rose-600" : "text-emerald-600"}`}
                          >
                            {avg.toFixed(1)}
                          </span>
                        </div>
                        {/* Barras de Progreso */}
                        <div className="space-y-3">
                          {[cal.trimestre1, cal.trimestre2, cal.trimestre3].map(
                            (score, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-3"
                              >
                                <span className="text-[9px] font-bold text-slate-400 w-4">
                                  T{idx + 1}
                                </span>
                                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-700 ${!score ? "bg-transparent w-0" : score < 6 ? "bg-rose-500" : "bg-cyan-500"} ${
                                      !score
                                        ? "w-0"
                                        : score <= 1
                                          ? "w-[10%]"
                                          : score <= 2
                                            ? "w-[20%]"
                                            : score <= 3
                                              ? "w-[30%]"
                                              : score <= 4
                                                ? "w-[40%]"
                                                : score <= 5
                                                  ? "w-[50%]"
                                                  : score <= 6
                                                    ? "w-[60%]"
                                                    : score <= 7
                                                      ? "w-[70%]"
                                                      : score <= 8
                                                        ? "w-[80%]"
                                                        : score <= 9
                                                          ? "w-[90%]"
                                                          : "w-full"
                                    }`}
                                  ></div>
                                </div>
                                {canEditGrades ? (
                                  <input
                                    type="number"
                                    value={score || ""}
                                    title={`Calificación Trimestre ${idx + 1} para ${cal.materia}`}
                                    onChange={(e) =>
                                      handleUpdateGrades(
                                        cal.materia,
                                        `trimestre${idx + 1}`,
                                        e.target.value,
                                      )
                                    }
                                    className="w-10 text-center text-xs font-bold text-slate-700 border border-slate-200 rounded focus:border-cyan-500 outline-none bg-white p-1"
                                    placeholder="-"
                                  />
                                ) : (
                                  <span className="text-xs font-black text-slate-500 w-6 text-right">
                                    {score || "-"}
                                  </span>
                                )}
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ISLAS DEL SABER (GAMIFICACIÓN) */}
                {student.gamificacion && (
                  <div className="mt-8 p-6 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 rounded-3xl shadow-xl border border-indigo-400/30 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-12 translate-x-12 group-hover:bg-white/20 transition-all duration-700 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl translate-y-8 -translate-x-8 animate-pulse delay-500"></div>

                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                          <div className="size-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 text-white shadow-xl shadow-black/5 shadow-indigo-500/20">
                            <span className="material-symbols-outlined text-3xl">
                              sports_esports
                            </span>
                          </div>
                          <div>
                            <h4 className="text-white font-black text-sm uppercase tracking-tighter leading-none italic">
                              Islas del Saber
                            </h4>
                            <p className="text-blue-100 text-[10px] font-black uppercase tracking-[0.2em] mt-1 opacity-80">
                              Módulo de Gamificación
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-white/40 text-[9px] font-black uppercase tracking-widest leading-tight block mb-1">
                            PLAYER_ID
                          </span>
                          <span className="text-white font-mono font-black text-xs bg-black/20 px-3 py-1 rounded-full border border-white/10">
                            {student.gamificacion.nickname ||
                              student.name.split(" ")[0]}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex flex-col items-center group-hover:bg-white/15 transition-all">
                          <span className="text-[9px] font-black text-blue-200 uppercase tracking-widest mb-2 opacity-70">
                            Total Puntos
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-300 text-xl drop-shadow-[0_0_8px_rgba(252,211,77,0.5)]">
                              stars
                            </span>
                            <span className="text-3xl font-black text-white italic tracking-tighter tabular-nums drop-shadow-xl shadow-black/5">
                              {student.gamificacion.total_puntos}
                            </span>
                          </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex flex-col items-center group-hover:bg-white/15 transition-all">
                          <span className="text-[9px] font-black text-cyan-200 uppercase tracking-widest mb-2 opacity-70">
                            Escaneos
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-cyan-300 text-xl drop-shadow-[0_0_8px_rgba(103,232,249,0.5)]">
                              qr_code_scanner
                            </span>
                            <span className="text-3xl font-black text-white italic tracking-tighter tabular-nums drop-shadow-xl shadow-black/5">
                              {student.gamificacion.escaneos_realizados}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center gap-3">
                        <div className="flex-1 h-3 bg-black/30 rounded-full border border-white/10 p-0.5 overflow-hidden shadow-inner">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                            style={{
                              width: `${Math.min((student.gamificacion.total_puntos / 500) * 100, 100)}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-[10px] font-black text-white italic tracking-tighter opacity-80 whitespace-nowrap">
                          NIVEL{" "}
                          {Math.floor(student.gamificacion.total_puntos / 100) +
                            1}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CLÍNICO / CONDUCTUAL */}
            {activeTab === "CLINICAL" && canViewClinical && (
              <div className="overflow-y-auto custom-scrollbar h-full pr-2">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400">
                      history_edu
                    </span>
                    Información Clínica e Incidencias
                  </h3>
                  <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full border border-slate-200 uppercase tracking-widest">
                    Expediente Digital
                  </span>
                </div>

                {/* RESUMEN MÉDICO PRIORITARIO */}
                <div className="mb-8 p-5 bg-rose-50 border border-rose-100 rounded-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-outlined text-rose-500 text-2xl">
                      clinical_notes
                    </span>
                    <div>
                      <h4 className="text-rose-900 font-black text-[10px] uppercase tracking-widest">
                        Resumen Médico Institucional
                      </h4>
                      <p className="text-rose-700/60 text-[9px] font-bold uppercase tracking-tight">
                        Información Crítica para el Plantel
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-[9px] font-black text-rose-300 uppercase mb-1 tracking-widest">
                        Alertas y Reacciones
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {student.medicalAlerts &&
                        student.medicalAlerts.length > 0 ? (
                          student.medicalAlerts.map((alert, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-white border border-rose-200 text-rose-600 text-[10px] font-black rounded uppercase shadow-sm"
                            >
                              {alert}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] font-bold text-rose-400 italic">
                            Sin alertas reportadas
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-[9px] font-black text-rose-300 uppercase mb-1 tracking-widest">
                        Historia Clínica Detallada
                      </p>
                      <p className="text-xs text-rose-800 leading-relaxed font-medium bg-white/50 p-4 rounded-xl border border-rose-100">
                        {student.medicalHistory ||
                          "No se ha capturado historial médico profundo para este alumno. Se recomienda solicitar actualización en la próxima junta."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">
                      timeline
                    </span>
                    Bitácora Cronológica
                  </h4>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowIncidentForm(true)}
                      className="px-4 py-1.5 bg-rose-600 text-white text-[10px] font-black rounded-2xl uppercase shadow-sm hover:bg-rose-700 transition-all flex items-center gap-2"
                      title="Registrar nueva incidencia o reporte clínico/conductual"
                    >
                      <span className="material-symbols-outlined text-sm">
                        add_photo_alternate
                      </span>
                      Nuevo Reporte
                    </button>
                    <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full border border-slate-200">
                      {student.incidents.length} Registros
                    </span>
                  </div>
                </div>

                {student.incidents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                    <span className="material-symbols-outlined text-slate-300 text-5xl mb-3">
                      history_edu
                    </span>
                    <p className="text-slate-500 text-xs font-bold">
                      Sin incidencias registradas
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6 relative ml-2 pr-2">
                    {/* Línea de Tiempo */}
                    <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-200"></div>

                    {student.incidents.map((inc, i) => (
                      <div
                        key={inc.id}
                        className="relative pl-8 animate-fade-in-up"
                      >
                        {/* Punto de Tiempo */}
                        <div
                          className={`absolute left-[7px] top-4 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm z-10 ${
                            inc.type === IncidentType.CONDUCTA
                              ? "bg-amber-400"
                              : inc.type === IncidentType.SALUD
                                ? "bg-rose-400"
                                : "bg-blue-400"
                          }`}
                        ></div>

                        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-xl shadow-black/5 transition-shadow group">
                          <div className="flex justify-between items-start mb-2">
                            <span
                              className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wide border ${
                                inc.type === IncidentType.CONDUCTA
                                  ? "bg-amber-50 text-amber-700 border-amber-100"
                                  : inc.type === IncidentType.SALUD
                                    ? "bg-rose-50 text-rose-700 border-rose-100"
                                    : "bg-blue-50 text-blue-700 border-blue-100"
                              }`}
                            >
                              {inc.type}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleWhatsAppIncident(inc)}
                                className={`p-1.5 rounded-2xl transition-all flex items-center gap-1.5 border ${
                                  inc.notificado_whatsapp 
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
                                    : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-emerald-500 hover:text-white hover:border-emerald-400"
                                }`}
                                title={inc.notificado_whatsapp ? "Notificado por WhatsApp" : "Notificar al Tutor por WhatsApp"}
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  {inc.notificado_whatsapp ? 'done_all' : 'send_to_mobile'}
                                </span>
                                <span className="text-[9px] font-black uppercase tracking-tighter">WhatsApp</span>
                              </button>
                              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">
                                  calendar_today
                                </span>
                                {new Date(inc.date).toLocaleDateString("es-MX", {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "short",
                                })}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed font-medium bg-slate-50 p-3 rounded-2xl border border-slate-100">
                            {inc.description}
                          </p>

                          {/* EVIDENCE PREVIEW */}
                          {inc.evidence && inc.evidence.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 gap-2">
                              {inc.evidence.map((ev, idx) => (
                                <div
                                  key={idx}
                                  className="relative group/ev overflow-hidden rounded-xl border border-slate-200 shadow-sm cursor-zoom-in"
                                >
                                  <img
                                    src={ev}
                                    alt="Evidencia"
                                    className="w-full h-24 object-cover group-hover/ev:scale-110 transition-transform duration-500"
                                  />
                                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/ev:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white">
                                      fullscreen
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="mt-3 flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-500 font-bold border border-slate-300">
                              {inc.reportedBy.charAt(0)}
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">
                              Registrado por:{" "}
                              <span className="text-slate-600">
                                {inc.reportedBy}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* LEGAL / PROTOCOLOS */}
            {activeTab === "LEGAL" && (
              <div className="h-full flex flex-col overflow-hidden">
                <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl flex justify-between items-center shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded-2xl border border-blue-200 text-blue-600 shadow-sm">
                      <span className="material-symbols-outlined text-2xl">
                        smart_toy
                      </span>
                    </div>
                    <div>
                      <h3 className="text-blue-900 font-black text-xs uppercase mb-1">
                        Asistente Legal IA
                      </h3>
                      <p className="text-blue-700/70 text-[10px] font-medium leading-tight">
                        Generación automática de actas
                      </p>
                    </div>
                  </div>
                  {canPrintSensitive && (
                    <button
                      onClick={() => setShowAIGenerator(true)}
                      className="bg-white text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white hover:shadow-xl shadow-black/5 transition-all px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-sm"
                      title="Abrir asistente de IA para redactar documentos institucionales"
                    >
                      Generar Nuevo
                      <span className="material-symbols-outlined text-sm">
                        arrow_forward
                      </span>
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 grid grid-cols-1 gap-3">
                  {student.documentos?.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:border-blue-400 transition-colors group cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className="bg-slate-50 p-2 rounded border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                            <span className="material-symbols-outlined text-slate-400 group-hover:text-blue-500">
                              description
                            </span>
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-700 uppercase group-hover:text-blue-700 transition-colors">
                              {doc.titulo}
                            </h4>
                            <div className="flex gap-2 mt-1">
                              <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-1.5 rounded border border-slate-100">
                                {doc.folio}
                              </span>
                              <span className="text-[9px] font-bold text-blue-500 bg-blue-50 px-1.5 rounded border border-blue-100">
                                {doc.tipo}
                              </span>
                            </div>
                          </div>
                        </div>
                        {canPrintSensitive && (
                          <button
                            onClick={() => handlePrintDoc(doc)}
                            className="text-slate-300 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-2xl transition-all"
                            title="Imprimir"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              print
                            </span>
                          </button>
                        )}
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 mt-2">
                        <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed font-mono">
                          {doc.contenido}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- COLUMNA DERECHA: CONTEXTO Y ACCIONES --- */}
        <div className="flex flex-col gap-4 h-full border-l border-slate-200 pl-6 bg-white/50 rounded-r-[1.5rem]">
          {/* Núcleo Familiar */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="material-symbols-outlined text-[16px]">
                family_restroom
              </span>
              Núcleo Familiar
            </h3>

            <div className="mb-4">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Tutor Principal
              </p>
              <p className="text-sm font-black text-slate-800 uppercase">
                {student.guardianInfo?.name || "Sin registrar"}
              </p>
              <p className="text-xs text-slate-500 font-medium">
                {student.guardianInfo?.relationship || "N/A"}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleContactTutor("call")}
                className="flex-1 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 hover:border-slate-300 rounded-2xl py-2.5 flex items-center justify-center gap-2 transition-all shadow-sm active:translate-y-0.5"
              >
                <span className="material-symbols-outlined text-[16px]">
                  call
                </span>
                <span className="text-[10px] font-black uppercase">Llamar</span>
              </button>
              <button
                onClick={() => {
                  handleContactTutor("email");
                  logAudit(
                    "CONSULTA",
                    "Acceso a Email de Tutor",
                    "alumnos",
                    student.id,
                  );
                }}
                className="flex-1 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 hover:border-slate-300 rounded-2xl py-2.5 flex items-center justify-center gap-2 transition-all shadow-sm active:translate-y-0.5"
              >
                <span className="material-symbols-outlined text-[16px]">
                  mail
                </span>
                <span className="text-[10px] font-black uppercase">Email</span>
              </button>
            </div>
          </div>

          {/* Barreras para el Aprendizaje (BAP/UDEII) */}
          {canViewClinical && (
            <div className="bg-indigo-50/50 rounded-xl p-5 border border-indigo-100 shadow-sm">
              <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-indigo-200 pb-2">
                <span className="material-symbols-outlined text-[16px]">
                  psychology_alt
                </span>
                UDEII / Perfil de Inclusión (BAP)
              </h3>
              {student.bapInfo ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">
                      Diagnóstico (Docente)
                    </p>
                    <p className="text-xs font-bold text-indigo-900">
                      {student.bapInfo.diagnosisPrivate}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">
                      Ajustes Razonables
                    </p>
                    <p className="text-[10px] text-indigo-700 leading-tight italic">
                      "{student.bapInfo.accommodations.join(", ")}"
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 font-bold italic text-center py-2">
                  Sin registros de apoyo UDEII
                </p>
              )}
            </div>
          )}

          {/* Contexto Social (Estudio Socioeconómico) */}
          {canViewClinical && (
            <div className="bg-orange-50/50 rounded-xl p-5 border border-orange-100 shadow-sm">
              <h3 className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-orange-200 pb-2">
                <span className="material-symbols-outlined text-[16px]">
                  communities
                </span>
                Estudio Socioeconómico
              </h3>
              {student.socioeconomicData ? (
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-white/60 rounded border border-orange-100">
                    <p className="text-[8px] font-black text-orange-300 uppercase">
                      Familia
                    </p>
                    <p className="text-[10px] font-bold text-orange-900">
                      {student.socioeconomicData.familyType}
                    </p>
                  </div>
                  <div className="p-2 bg-white/60 rounded border border-orange-100">
                    <p className="text-[8px] font-black text-orange-300 uppercase">
                      Ingresos
                    </p>
                    <p className="text-[10px] font-bold text-orange-900">
                      {student.socioeconomicData.incomeLevel}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 font-bold italic text-center py-2">
                  Sin registros socioeconómicos
                </p>
              )}
            </div>
          )}

          {/* Acciones Rápidas (Panel de Control) */}
          <div className="flex-1 bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="material-symbols-outlined text-[16px]">
                bolt
              </span>
              Gestión Integral
            </h3>

            <div className="space-y-3">
              {/* Toggle Distancia */}
              <button
                onClick={() =>
                  toggleDistanceState(student.id, !student.isDistancia)
                }
                className={`w-full p-3 rounded-xl border transition-all flex items-center gap-3 group text-left ${
                  student.isDistancia
                    ? "bg-amber-50 border-amber-200 text-amber-700 shadow-inner"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 shadow-sm hover:shadow-xl shadow-black/5"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center border ${
                    student.isDistancia
                      ? "bg-amber-100 border-amber-200"
                      : "bg-slate-50 border-slate-100 text-slate-400 group-hover:bg-slate-100"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {student.isDistancia ? "wifi_off" : "wifi"}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider leading-tight">
                    {student.isDistancia ? "Desactivar" : "Activar"}
                  </p>
                  <p className="text-[9px] opacity-60 font-medium">
                    Modalidad Distancia
                  </p>
                </div>
              </button>

              {/* Imprimir Expediente Integrado */}
              {canPrintSensitive && (
                <button
                  onClick={() => setShowExpediente(true)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all flex items-center gap-3 shadow-sm hover:shadow-xl shadow-black/5 group text-left"
                >
                  <div className="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:border-indigo-200 group-hover:text-indigo-600 flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-[18px]">
                      folder_shared
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider leading-tight">
                      Expediente Institucional
                    </p>
                    <p className="text-[9px] opacity-60 font-medium">
                      Ver e Imprimir completo
                    </p>
                  </div>
                </button>
              )}

              {/* Generar Reporte */}
              {canPrintSensitive && (
                <button
                  onClick={() => toast("Abrir modal de citatorio")} // Placeholder funcional
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 transition-all flex items-center gap-3 shadow-sm hover:shadow-xl shadow-black/5 group text-left"
                >
                  <div className="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 text-slate-400 group-hover:bg-rose-100 group-hover:border-rose-200 group-hover:text-rose-600 flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-[18px]">
                      notifications_active
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider leading-tight">
                      Citar Tutor
                    </p>
                    <p className="text-[9px] opacity-60 font-medium">
                      Generar citatorio
                    </p>
                  </div>
                </button>
              )}

              {/* Imprimir Kardex */}
              <button
                onClick={() => toast("Imprimiendo Kardex...")}
                className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-cyan-50 hover:border-cyan-200 hover:text-cyan-700 transition-all flex items-center gap-3 shadow-sm hover:shadow-xl shadow-black/5 group text-left"
              >
                <div className="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 text-slate-400 group-hover:bg-cyan-100 group-hover:border-cyan-200 group-hover:text-cyan-600 flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined text-[18px]">
                    print
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider leading-tight">
                    Kardex
                  </p>
                  <p className="text-[9px] opacity-60 font-medium">
                    Historial académico
                  </p>
                </div>
              </button>

              {/* Solicitar Actualización de Datos */}
              <button
                onClick={() => {
                  toast.success(
                    "Solicitud de actualización enviada a Secretaría",
                    { icon: "📈" },
                  );
                  logAudit(
                    "CREACION",
                    "Solicitud de Actualización de Datos",
                    "avisos",
                    student.id,
                  );
                }}
                className="w-full p-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-all flex items-center gap-3 group text-left"
              >
                <div className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-400 group-hover:border-indigo-200 group-hover:text-indigo-600 flex items-center justify-center transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">
                    contact_page
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider leading-tight">
                    Actualizar Datos
                  </p>
                  <p className="text-[9px] opacity-60 font-medium whitespace-nowrap">
                    Solicitar tel/email nuevo
                  </p>
                </div>
              </button>
            </div>

            {/* Footer del Panel */}
            <div className="mt-auto pt-4 border-t border-slate-100 text-center">
              <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                SASE v3.1 • {currentUserRole}
              </p>
            </div>
          </div>
        </div>
      </div>

      {showIncidentForm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                  Nueva Incidencia con Evidencia
                </h3>
                <button
                  onClick={() => setShowIncidentForm(false)}
                  className="size-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">
                    Tipo de Reporte
                  </label>
                  <select
                    value={newIncident.type}
                    title="Seleccionar tipo de reporte de incidencia"
                    onChange={(e) =>
                      setNewIncident((prev) => ({
                        ...prev,
                        type: e.target.value as IncidentType,
                      }))
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-500/5 transition-all"
                  >
                    {Object.values(IncidentType).map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0) + type.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">
                    Descripción Operativa
                  </label>
                  <textarea
                    value={newIncident.description}
                    onChange={(e) =>
                      setNewIncident((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Detalle los hechos de forma objetiva..."
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-700 outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-500/5 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">
                    Evidencia Fotográfica
                  </label>
                  <div className="relative group">
                    <input
                      type="file"
                      accept="image/*"
                      title="Subir evidencia fotográfica"
                      onChange={handlePhotoUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center group-hover:border-rose-300 group-hover:bg-rose-50/30 transition-all">
                      {newIncident.photo ? (
                        <div className="relative">
                          <img
                            src={newIncident.photo}
                            alt="Preview"
                            className="w-full h-32 object-cover rounded-xl shadow-sm"
                          />
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setNewIncident((prev) => ({
                                ...prev,
                                photo: null,
                              }));
                            }}
                            className="absolute top-2 right-2 size-6 bg-rose-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-black/5"
                          >
                            <span className="material-symbols-outlined text-xs">
                              close
                            </span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <span className="material-symbols-outlined text-3xl text-slate-300">
                            add_a_photo
                          </span>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">
                            Haz clic para subir o arrastra una imagen
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setShowIncidentForm(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveIncident}
                  disabled={isSaving}
                  className="flex-[2] py-3 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-rose-700 transition-all shadow-xl shadow-black/5 shadow-rose-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-sm">
                      save
                    </span>
                  )}
                  Guardar Reporte
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAIGenerator && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
              <div className="bg-white p-6 rounded-2xl flex flex-col items-center gap-4 shadow-2xl">
                <span className="material-symbols-outlined text-indigo-500 animate-spin text-4xl">
                  progress_activity
                </span>
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
                  Cargando IA-SASE...
                </p>
              </div>
            </div>
          }
        >
          <GeneradorDocumentos
            studentId={student.id}
            studentName={student.name}
            studentGroup={student.group}
            onClose={() => setShowAIGenerator(false)}
          />
        </Suspense>
      )}

      {showExpediente && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
              <div className="bg-white p-6 rounded-2xl flex flex-col items-center gap-4 shadow-2xl">
                <span className="material-symbols-outlined text-blue-500 animate-spin text-4xl">
                  progress_activity
                </span>
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
                  Cargando Expediente...
                </p>
              </div>
            </div>
          }
        >
          <ExpedienteInstitucional
            alumno={{
              id: student.id,
              nombre: student.name,
              grado: (student as any).grado || "1",
              grupo: student.group || "A",
              turno: (student as any).turno || "MATUTINO",
            }}
            onClose={() => setShowExpediente(false)}
          />
        </Suspense>
      )}
    </div>
  );
};
