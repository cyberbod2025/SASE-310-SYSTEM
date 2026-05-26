import React, { useState, useEffect, useCallback } from "react";
import { useApp } from "../store";
import { IncidentType, UserRole, DocumentType as SaseDocumentType } from "../types";
import { VoiceInput } from "./VoiceInput";
import { startRegisterModalTour } from "./TourGuide";
import { supabase } from "../supabase/client";
import { Protocol } from "../types";
import { ProtocolDetailModal } from "./Protocols/ProtocolDetailModal";
import { toast } from "react-hot-toast";
import { NeoButton } from "./ui/NeoButton";

const STUDENT_DROPDOWN_LIMIT = 50;

const getProtocolKeywords = (protocol: any): string[] => {
  if (!Array.isArray(protocol?.palabras_clave)) return [];
  return protocol.palabras_clave.filter(
    (keyword: unknown): keyword is string =>
      typeof keyword === "string" && keyword.trim().length > 0,
  );
};

export const QuickRegisterModal: React.FC = () => {
  const {
    quickRegisterOpen,
    setQuickRegisterOpen,
    quickRegisterType,
    students,
    groups,
    addIncident,
    currentUserRole,
    addDocumentoInstitucional,
    setIsAssistantOpen,
    setAssistantSuggestion,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedStudentName, setSelectedStudentName] = useState<string>("");
  const [type, setType] = useState<IncidentType>(quickRegisterType);
  const [description, setDescription] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [detectedProtocol, setDetectedProtocol] = useState<Protocol | null>(null);
  const [showProtocolModal, setShowProtocolModal] = useState(false);
  const [supportProtocols, setSupportProtocols] = useState<Protocol[]>([]);
  // Si el modal abre con un tipo específico (retardo, uniforme...) lo colapsamos
  const [showTypePicker, setShowTypePicker] = useState(false);

  // Filtros inteligentes
  const [selectedGrado, setSelectedGrado] = useState<string>("");
  const [selectedGrupo, setSelectedGrupo] = useState<string>("");
  const [studentNotFound, setStudentNotFound] = useState(false);
  const [pendingStudentName, setPendingStudentName] = useState("");

  // Documentos
  const [generarCitatorio, setGenerarCitatorio] = useState(false);
  const [fechaCitatorio, setFechaCitatorio] = useState("");
  const [horaCitatorio, setHoraCitatorio] = useState("");
  const [generarActa, setGenerarActa] = useState(false);
  const [tipoActa, setTipoActa] = useState<"hechos" | "acuerdos">("hechos");

  // Sync type and set initial template when modal opens
  useEffect(() => {
    if (quickRegisterOpen) {
      setType(quickRegisterType);
      // Si viene con tipo predefinido, ocultamos el picker (registro rápido = ya saben el tipo)
      setShowTypePicker(quickRegisterType === IncidentType.CONDUCTA);
      const templates: Record<string, string> = {
        [IncidentType.CONDUCTA]: "[PROTOCOLO CONVIVENCIA] - ",
        [IncidentType.RETARDO]: "[SERVICIO PREFECTURA] - Ingreso tardío: ",
        [IncidentType.UNIFORME]: "[REVISIÓN UNIFORME] - Se observa: ",
        [IncidentType.SALUD]: "[ATENCIÓN ENFERMERÍA] - Motivo: ",
        [IncidentType.ACADEMICO]: "[SEGUIMIENTO ACADÉMICO] - ",
        [IncidentType.ASISTENCIA]: "[LISTA DE ASISTENCIA] - ",
      };
      if (!description) {
        setDescription(templates[quickRegisterType] || "");
      }

      // Proactive Sasito help
      setIsAssistantOpen(true);
      setAssistantSuggestion({
        text: "¡Hola! He activado el modo de registro rápido. ¿Sabías que también puedes usar tu voz para describir lo sucedido pulsando el micrófono?",
        state: "attention"
      });
    }
  }, [quickRegisterOpen, quickRegisterType, setIsAssistantOpen, setAssistantSuggestion]);

  // Load support protocols
  useEffect(() => {
    const loadSupport = async () => {
      const titles = [
        "Primeros Auxilios en el Aula",
        "Violencia Escolar: prevención e intervención docente",
      ];
      const { data } = await (supabase as any)
        .from("protocolos")
        .select("*")
        .in("titulo", titles);
      if (data) setSupportProtocols(data);
    };
    loadSupport();
  }, []);

  const getQuickGuides = (currentType: IncidentType) => {
    const guides: Record<string, string[]> = {
      [IncidentType.CONDUCTA]: ["Pelea física", "Acoso verbal", "Falta de respeto", "Uso de celular"],
      [IncidentType.RETARDO]: ["15 min tarde", "Sin justificante", "Reincidente", "Segunda hora"],
      [IncidentType.UNIFORME]: ["Falta pants", "Playera no oficial", "Tenis de color", "Sin sudadera"],
      [IncidentType.SALUD]: ["Dolor de cabeza", "Nauseas", "Caída", "Alergia"],
      [IncidentType.ACADEMICO]: ["No entrega tarea", "Falta material", "Distracción total", "Bajo promedio"],
      [IncidentType.ASISTENCIA]: ["Se retiró del aula", "No llegó a clase", "Cuidado de hermanos"],
    };
    return guides[currentType] || [];
  };

  const handleQuickGuide = (guide: string) => {
    if (guide === "Distracción total") {
      setDescription((prev) => prev + "SE REGISTRA QUE LA/EL ALUMNO ESTA distraído/a durante la sesión de clase, omitiendo indicaciones y perdiendo el enfoque en las actividades académicas.");
    } else {
      setDescription((prev) => prev + guide + ". ");
    }
  };

  // Tour integration
  useEffect(() => {
    if (quickRegisterOpen) {
      const isTourActive = localStorage.getItem("sase_tour_active");
      const timer = setTimeout(() => {
        if (isTourActive === "true") startRegisterModalTour();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [quickRegisterOpen]);

  if (!quickRegisterOpen) return null;

  const allGroups = (groups || []).map((g) => g.nombre || g.name);
  const grados = [...new Set(allGroups.map((g) => (g && g.length > 0 ? g.charAt(0) : "")))].filter(Boolean) as string[];
  const gruposForGrado = selectedGrado ? allGroups.filter((g) => g.startsWith(selectedGrado)) : [];

  const filteredStudents = students.filter((s) => {
    if (selectedGrado && !s.group.startsWith(selectedGrado)) return false;
    if (selectedGrupo && s.group !== selectedGrupo) return false;
    if (searchTerm.length > 1) {
      const term = searchTerm.toLowerCase();
      return (s.name || "").toLowerCase().includes(term) || (s.matricula || "").toString().includes(searchTerm);
    }
    return selectedGrupo ? true : false;
  });
  const visibleFilteredStudents = filteredStudents.slice(0, STUDENT_DROPDOWN_LIMIT);

  const handleRegister = async () => {
    if (!selectedStudentId && !studentNotFound) {
      toast.error("Seleccione un alumno o márquelo como no encontrado.");
      return;
    }

    const student = students.find((s) => s.id === selectedStudentId);

    if (!selectedStudentId || !student) {
      toast.error("Seleccione un alumno registrado para guardar la incidencia.");
      return;
    }

    const incidentSaved = await addIncident(selectedStudentId, type, description);
    if (!incidentSaved) return;

    // Check Protocols
    const content = String(description ?? "").toLowerCase();
    const { data: protocols } = await (supabase as any).from("protocolos").select("*");
    if (Array.isArray(protocols)) {
      const matched = protocols.find((p: any) =>
        getProtocolKeywords(p).some((keyword) => content.includes(keyword.toLowerCase())),
      );
      if (matched) setDetectedProtocol(matched);
    }

    // Persist Citatorio in Agenda (eventos)
    if (generarCitatorio && fechaCitatorio && selectedStudentId && student) {
      const { error: eventError } = await (supabase as any)
        .from("eventos")
        .insert([{
          titulo: `CITATORIO: ${student.name}`,
          fecha: fechaCitatorio,
          hora: horaCitatorio || null,
          tipo: "cita_padres",
          descripcion: `Cita agendada via registro rápido. Motivo: ${type}. Descripción: ${description}`,
          alumno_id: selectedStudentId,
          creado_por: "SYSTEM", // Should ideally be user id, but using SYSTEM for now
          para_todos_maestros: false
        }]);
      
      if (eventError) {
        console.error("Error saving citatorio event:", eventError);
        toast.error("Error al agendar cita en agenda.");
      } else {
        toast.success("Cita agendada en la agenda escolar.");
      }
    }

    // Persist Acta/Acuerdo (documentos_institucionales)
    if (generarActa && selectedStudentId && student) {
      const docType: SaseDocumentType = tipoActa === "hechos" ? "HECHOS" : "ACUERDO";
      const folio = `DOC-${Date.now().toString().slice(-6)}`;
      
      await addDocumentoInstitucional({
        studentId: selectedStudentId,
        tipo: docType,
        folio: folio,
        fecha: new Date().toISOString().split('T')[0],
        titulo: `${tipoActa === "hechos" ? "Acta de Hechos" : "Hoja de Acuerdos"} - ${type}`,
        contenido: description,
        creado_por: currentUserRole,
        firmas: [currentUserRole, "Padre de Familia"]
      });
      toast.success(`${tipoActa === "hechos" ? "Acta" : "Hoja de acuerdos"} generada y guardada.`);
    }

    setIsSuccess(true);
  };

  const handleClose = () => {
    setQuickRegisterOpen(false);
    setIsSuccess(false);
    setSearchTerm("");
    setShowDropdown(false);
    setSelectedStudentId("");
    setSelectedStudentName("");
    setDescription("");
    setStudentNotFound(false);
    setPendingStudentName("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0B1120]/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white">
              <span className="material-icons text-lg">bolt</span>
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">
                Registro Rápido SASE
              </h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Optimización de Seguimiento Institucional
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="size-10 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-red-300 transition-all flex items-center justify-center">
            <span className="material-icons">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {!isSuccess ? (
            <>
              {/* Filtros de Alumno */}
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Grado</label>
                    <select 
                      value={selectedGrado} 
                      onChange={(e) => { setSelectedGrado(e.target.value); setSelectedGrupo(""); }}
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-xs font-bold text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="">TODOS</option>
                      {grados.map(g => <option key={g} value={g}>{g}°</option>)}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Grupo</label>
                    <select 
                      value={selectedGrupo} 
                      onChange={(e) => setSelectedGrupo(e.target.value)}
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-xs font-bold text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      disabled={!selectedGrado}
                    >
                      <option value="">TODOS</option>
                      {gruposForGrado.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>

                <div className="relative">
                  {selectedStudentId ? (
                    // Ficha del alumno seleccionado
                    <div className="flex items-center gap-3 h-12 bg-blue-500/10 border border-blue-400/20 rounded-xl px-4">
                      <span className="material-icons text-blue-300 text-lg">person_check</span>
                      <div className="flex-1">
                          <p className="text-xs font-black text-blue-100 uppercase italic">{selectedStudentName}</p>
                      </div>
                      <button
                        onClick={() => { setSelectedStudentId(""); setSelectedStudentName(""); setSearchTerm(""); setShowDropdown(false); }}
                        className="text-blue-400 hover:text-red-500 transition-colors"
                      >
                        <span className="material-icons text-lg">close</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="material-icons absolute left-4 top-3.5 text-slate-400 text-lg">search</span>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setShowDropdown(e.target.value.length > 1); }}
                        onFocus={() => { if (searchTerm.length > 1) setShowDropdown(true); }}
                        placeholder="Escribe nombre o matrícula..."
                         className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm font-bold text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      {showDropdown && filteredStudents.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0B1120] border border-white/10 rounded-2xl shadow-xl z-20 max-h-48 overflow-y-auto">
                          {visibleFilteredStudents.map(s => (
                            <button
                              key={s.id}
                              onClick={() => {
                                setSelectedStudentId(s.id);
                                setSelectedStudentName(s.name);
                                setSearchTerm("");
                                setShowDropdown(false);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-blue-500/10 flex items-center gap-3 transition-colors"
                            >
                              <img src={s.avatar || "/SASE_ICON.png"} className="size-8 rounded-2xl object-cover" alt="" />
                              <div>
                                <p className="text-xs font-black text-slate-100 uppercase italic">{s.name}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">{s.group} • {s.matricula}</p>
                              </div>
                            </button>
                          ))}
                          {filteredStudents.length > STUDENT_DROPDOWN_LIMIT && (
                            <div className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                              Mostrando primeros {STUDENT_DROPDOWN_LIMIT}; escribe más para filtrar.
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Tipo e Incidencia */}
              {showTypePicker ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.values(IncidentType).map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-tight transition-all ${
                        type === t ? 'bg-blue-500/10 border-blue-400/20 text-blue-200' : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              ) : (
                // Tipo ya pre-seleccionado — mostrar etiqueta con opción de cambiar
                <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="material-icons text-blue-600 text-sm">label</span>
                    <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Tipo: {type}</span>
                  </div>
                  <button
                    onClick={() => setShowTypePicker(true)}
                    className="text-[9px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors"
                  >
                    Cambiar
                  </button>
                </div>
              )}

              {/* Guías Rápidas */}
                <div className="flex flex-wrap gap-2">
                {getQuickGuides(type).map((guide) => (
                  <button
                    key={guide}
                    onClick={() => handleQuickGuide(guide)}
                    className="px-3 py-1.5 bg-white/5 hover:bg-blue-500/10 text-slate-300 hover:text-blue-200 rounded-full border border-white/10 text-[9px] font-bold uppercase tracking-wider transition-colors"
                  >
                    + {guide}
                  </button>
                ))}
              </div>

              {/* Descripción */}
              <div className="relative">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                  placeholder="Describe la situación..."
                />
                <div className="absolute right-4 bottom-4">
                  <VoiceInput onTranscript={(t) => setDescription(prev => prev + t)} />
                </div>
              </div>

              {/* Opciones de Documentación */}
              <div className="space-y-4 p-4 bg-blue-500/10 rounded-2xl border border-blue-400/20 text-xs text-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-icons text-sm">description</span>
                  <p className="font-black uppercase tracking-widest">Apoyo Institucional Automático</p>
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={generarCitatorio} 
                      onChange={(e) => setGenerarCitatorio(e.target.checked)} 
                    />
                    <div className={`size-5 rounded-2xl border-2 transition-all flex items-center justify-center ${generarCitatorio ? 'bg-blue-600 border-blue-600' : 'bg-white border-blue-200'}`}>
                      {generarCitatorio && <span className="material-icons text-[14px] text-white">check</span>}
                    </div>
                    <span className="font-bold">Agendar Citatorio en Agenda Escolar</span>
                  </label>
                  
                  {generarCitatorio && (
                    <div className="ml-8 grid grid-cols-2 gap-4 animate-fade-in">
                      <input type="date" value={fechaCitatorio} onChange={(e) => setFechaCitatorio(e.target.value)} className="h-10 bg-white/5 border border-blue-400/20 rounded-2xl px-3 outline-none text-slate-100" />
                      <input type="time" value={horaCitatorio} onChange={(e) => setHoraCitatorio(e.target.value)} className="h-10 bg-white/5 border border-blue-400/20 rounded-2xl px-3 outline-none text-slate-100" />
                    </div>
                  )}

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={generarActa} 
                      onChange={(e) => setGenerarActa(e.target.checked)} 
                    />
                    <div className={`size-5 rounded-2xl border-2 transition-all flex items-center justify-center ${generarActa ? 'bg-blue-600 border-blue-600' : 'bg-white border-blue-200'}`}>
                      {generarActa && <span className="material-icons text-[14px] text-white">check</span>}
                    </div>
                    <span className="font-bold">Generar Acta / Hoja de Acuerdos</span>
                  </label>

                  {generarActa && (
                    <div className="ml-8 flex gap-4 animate-fade-in">
                       <button onClick={() => setTipoActa("hechos")} className={`px-4 py-2 rounded-2xl border text-[10px] font-black uppercase ${tipoActa === "hechos" ? 'bg-blue-600 text-white' : 'bg-white/5 border-blue-400/20 text-slate-200'}`}>Acta de Hechos</button>
                       <button onClick={() => setTipoActa("acuerdos")} className={`px-4 py-2 rounded-2xl border text-[10px] font-black uppercase ${tipoActa === "acuerdos" ? 'bg-blue-600 text-white' : 'bg-white/5 border-blue-400/20 text-slate-200'}`}>Hoja de Acuerdos</button>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
              <div className="py-12 flex flex-col items-center text-center space-y-4">
               <div className="size-20 bg-emerald-500/10 border border-emerald-400/20 rounded-full flex items-center justify-center text-emerald-300">
                <span className="material-icons text-4xl">check_circle</span>
              </div>
               <h4 className="text-xl font-black text-white uppercase italic">Registro Exitoso</h4>
               <p className="text-sm text-slate-300 max-w-xs font-bold">La incidencia ha sido registrada institucionalmente y las notificaciones han sido enviadas.</p>
              {detectedProtocol && (
                <NeoButton
                  onClick={() => setShowProtocolModal(true)}
                  className="mt-4 px-6 py-3 bg-amber-500 text-white"
                >
                  <span className="material-icons">security</span>
                  Activar protocolo: {detectedProtocol.titulo}
                </NeoButton>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-white/5 sticky bottom-0 z-10">
          {!isSuccess ? (
            <div className="flex gap-4">
              <NeoButton
                onClick={handleClose}
                className="flex-1 h-14 justify-center"
              >
                Cancelar
              </NeoButton>
              <NeoButton
                onClick={handleRegister}
                disabled={!selectedStudentId && !studentNotFound}
                className="flex-[2] h-14 justify-center bg-blue-600 text-white"
              >
                <span className="material-icons">save</span>
                Registrar
              </NeoButton>
            </div>
          ) : (
            <NeoButton
              onClick={handleClose}
              className="w-full h-14 justify-center bg-[#131B2C] text-slate-100"
            >
              <span className="material-icons">reply</span>
              Volver al sistema
            </NeoButton>
          )}
        </div>
      </div>

      {showProtocolModal && detectedProtocol && (
        <ProtocolDetailModal
          protocol={detectedProtocol}
          onClose={() => {
            setShowProtocolModal(false);
            handleClose();
          }}
        />
      )}
    </div>
  );
};
