import React, { useState, useEffect, useCallback } from "react";
import { useApp } from "../store";
import { IncidentType, UserRole, DocumentType as SaseDocumentType } from "../types";
import { VoiceInput } from "./VoiceInput";
import { startRegisterModalTour } from "./TourGuide";
import { supabase } from "../supabase/client";
import { Protocol } from "../types";
import { ProtocolDetailModal } from "./Protocols/ProtocolDetailModal";
import { toast } from "react-hot-toast";

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
  } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [type, setType] = useState<IncidentType>(quickRegisterType);
  const [description, setDescription] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [detectedProtocol, setDetectedProtocol] = useState<Protocol | null>(null);
  const [showProtocolModal, setShowProtocolModal] = useState(false);
  const [supportProtocols, setSupportProtocols] = useState<Protocol[]>([]);

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
    }
  }, [quickRegisterOpen, quickRegisterType]);

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

  const handleRegister = async () => {
    if (!selectedStudentId && !studentNotFound) {
      toast.error("Seleccione un alumno o márquelo como no encontrado.");
      return;
    }

    const student = students.find((s) => s.id === selectedStudentId);
    
    // Add Incident
    await addIncident(selectedStudentId || "PENDIENTE", {
      type,
      description,
      date: new Date().toISOString(),
      severity: "leve", // Default
      createdBy: currentUserRole,
    });

    // Check Protocols
    const content = description.toLowerCase();
    const { data: protocols } = await (supabase as any).from("protocolos").select("*");
    if (protocols) {
      const matched = protocols.find((p: any) => 
        p.palabras_clave.some((kw: string) => content.includes(kw.toLowerCase()))
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
    setSelectedStudentId("");
    setDescription("");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden border border-white/20 animate-scale-up">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white">
              <span className="material-symbols-outlined text-lg">bolt</span>
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">
                Registro Rápido SASE
              </h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Optimización de Seguimiento Institucional
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="size-10 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-red-600 transition-all flex items-center justify-center">
            <span className="material-symbols-outlined">close</span>
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
                      className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                      className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      disabled={!selectedGrado}
                    >
                      <option value="">TODOS</option>
                      {gruposForGrado.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>

                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-3.5 text-slate-400 text-lg">search</span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Escribe nombre o matrícula..."
                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  {searchTerm.length > 1 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 max-h-48 overflow-y-auto">
                      {filteredStudents.map(s => (
                        <button
                          key={s.id}
                          onClick={() => { setSelectedStudentId(s.id); setSearchTerm(s.name); }}
                          className={`w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-3 transition-colors ${selectedStudentId === s.id ? 'bg-blue-50' : ''}`}
                        >
                          <img src={s.avatar || "/SASE_ICON.png"} className="size-8 rounded-lg object-cover" alt="" />
                          <div>
                            <p className="text-xs font-black text-slate-800 uppercase italic">{s.name}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">{s.group} • {s.matricula}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Tipo e Incidencia */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.values(IncidentType).map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-tight transition-all ${
                      type === t ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Guías Rápidas */}
              <div className="flex flex-wrap gap-2">
                {getQuickGuides(type).map((guide) => (
                  <button
                    key={guide}
                    onClick={() => handleQuickGuide(guide)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 rounded-full text-[9px] font-bold uppercase tracking-wider transition-colors"
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
                  className="w-full h-32 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                  placeholder="Describe la situación..."
                />
                <div className="absolute right-4 bottom-4">
                  <VoiceInput onTranscript={(t) => setDescription(prev => prev + t)} />
                </div>
              </div>

              {/* Opciones de Documentación */}
              <div className="space-y-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-xs text-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-sm">description</span>
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
                    <div className={`size-5 rounded-md border-2 transition-all flex items-center justify-center ${generarCitatorio ? 'bg-blue-600 border-blue-600' : 'bg-white border-blue-200'}`}>
                      {generarCitatorio && <span className="material-symbols-outlined text-[14px] text-white">check</span>}
                    </div>
                    <span className="font-bold">Agendar Citatorio en Agenda Escolar</span>
                  </label>
                  
                  {generarCitatorio && (
                    <div className="ml-8 grid grid-cols-2 gap-4 animate-fade-in">
                      <input type="date" value={fechaCitatorio} onChange={(e) => setFechaCitatorio(e.target.value)} className="h-10 bg-white border border-blue-200 rounded-lg px-3 outline-none" />
                      <input type="time" value={horaCitatorio} onChange={(e) => setHoraCitatorio(e.target.value)} className="h-10 bg-white border border-blue-200 rounded-lg px-3 outline-none" />
                    </div>
                  )}

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={generarActa} 
                      onChange={(e) => setGenerarActa(e.target.checked)} 
                    />
                    <div className={`size-5 rounded-md border-2 transition-all flex items-center justify-center ${generarActa ? 'bg-blue-600 border-blue-600' : 'bg-white border-blue-200'}`}>
                      {generarActa && <span className="material-symbols-outlined text-[14px] text-white">check</span>}
                    </div>
                    <span className="font-bold">Generar Acta / Hoja de Acuerdos</span>
                  </label>

                  {generarActa && (
                    <div className="ml-8 flex gap-4 animate-fade-in">
                      <button onClick={() => setTipoActa("hechos")} className={`px-4 py-2 rounded-lg border text-[10px] font-black uppercase ${tipoActa === "hechos" ? 'bg-blue-600 text-white' : 'bg-white border-blue-200'}`}>Acta de Hechos</button>
                      <button onClick={() => setTipoActa("acuerdos")} className={`px-4 py-2 rounded-lg border text-[10px] font-black uppercase ${tipoActa === "acuerdos" ? 'bg-blue-600 text-white' : 'bg-white border-blue-200'}`}>Hoja de Acuerdos</button>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 flex flex-col items-center text-center space-y-4">
              <div className="size-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                <span className="material-symbols-outlined text-4xl">check_circle</span>
              </div>
              <h4 className="text-xl font-black text-slate-800 uppercase italic">Registro Exitoso</h4>
              <p className="text-sm text-slate-500 max-w-xs font-bold">La incidencia ha sido registrada institucionalmente y las notificaciones han sido enviadas.</p>
              {detectedProtocol && (
                <button 
                  onClick={() => setShowProtocolModal(true)}
                  className="mt-4 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-amber-200 flex items-center gap-3"
                >
                  <span className="material-symbols-outlined">security</span>
                  Activar Protocolo: {detectedProtocol.titulo}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-white sticky bottom-0 z-10">
          {!isSuccess ? (
            <div className="flex gap-4">
              <button 
                onClick={handleClose}
                className="flex-1 h-14 bg-slate-100 hover:bg-slate-200 text-slate-500 font-black text-xs uppercase tracking-widest rounded-2xl transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={handleRegister}
                disabled={!selectedStudentId && !studentNotFound}
                className="flex-[2] h-14 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <span className="material-symbols-outlined">save</span>
                Registrar
              </button>
            </div>
          ) : (
            <button 
              onClick={handleClose}
              className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3"
            >
              <span className="material-symbols-outlined">reply</span>
              Volver al Sistema
            </button>
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
