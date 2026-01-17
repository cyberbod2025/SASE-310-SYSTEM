import React, { useState } from "react";
import { useApp } from "../store";
import { IncidentType, UserRole } from "../types";
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
    students,
    addIncident,
    currentUserRole,
  } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [type, setType] = useState<IncidentType>(IncidentType.CONDUCTA);
  const [description, setDescription] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [detectedProtocol, setDetectedProtocol] = useState<Protocol | null>(
    null
  );
  const [showProtocolModal, setShowProtocolModal] = useState(false);
  const [supportProtocols, setSupportProtocols] = useState<Protocol[]>([]);

  // Load support protocols on mount
  React.useEffect(() => {
    const loadSupport = async () => {
      const titles = [
        "Primeros Auxilios en el Aula",
        "Violencia Escolar: prevención e intervención docente",
      ];
      const { data } = await supabase
        .from("protocolos" as any)
        .select("*")
        .in("titulo", titles);
      if (data) setSupportProtocols(data as any);
    };
    loadSupport();
  }, []);

  const currentSupportProtocol = supportProtocols.find((p) => {
    if (type === IncidentType.SALUD && p.titulo.includes("Primeros Auxilios"))
      return true;
    if (
      type === IncidentType.CONDUCTA &&
      p.titulo.includes("Violencia Escolar")
    )
      return true;
    return false;
  });

  // React on open to check for tour
  React.useEffect(() => {
    if (quickRegisterOpen) {
      // Check if we are in demo mode
      const isTourActive = localStorage.getItem("sase_tour_active");

      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        if (isTourActive === "true") {
          startRegisterModalTour();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [quickRegisterOpen]);

  if (!quickRegisterOpen) return null;

  const filteredStudents =
    searchTerm.length > 1
      ? students.filter(
          (s) =>
            (s.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.matricula || "").toString().includes(searchTerm)
        )
      : [];

  const handleRegister = async () => {
    if (!selectedStudentId) {
      toast.error("Debes seleccionar un alumno de la lista", {
        icon: "👆",
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
      return;
    }

    // 1. Add Incident
    addIncident(
      selectedStudentId,
      type,
      description || "Reporte rápido sin descripción"
    );

    // 2. Check for Protocol Triggers (Simple keyword matching for demo)
    const lowerDesc = description.toLowerCase();
    let protocolTitleToFind = "";

    if (
      lowerDesc.includes("convuls") ||
      lowerDesc.includes("desmay") ||
      type === IncidentType.SALUD
    ) {
      protocolTitleToFind = "Crisis Convulsiva";
    } else if (lowerDesc.includes("sismo") || lowerDesc.includes("temblor")) {
      protocolTitleToFind = "Sismo";
    } else if (
      lowerDesc.includes("acoso") ||
      lowerDesc.includes("bullying") ||
      lowerDesc.includes("golpe")
    ) {
      protocolTitleToFind = "Acoso Escolar (Bullying)"; // Matches DB title
    }

    if (protocolTitleToFind) {
      try {
        const { data } = await supabase
          .from("protocolos" as any)
          .select("*")
          .ilike("titulo", `%${protocolTitleToFind}%`)
          .limit(1)
          .single();

        if (data) {
          setDetectedProtocol(data as any);
        }
      } catch (e) {
        console.error("Error finding protocol", e);
      }
    }

    setIsSuccess(true);

    // Clean up tour if it was active
    if (localStorage.getItem("sase_tour_active")) {
      localStorage.removeItem("sase_tour_active");
    }

    // Auto-close logic only if no protocol detected, otherwise keep open to show button
    if (!protocolTitleToFind) {
      setTimeout(() => {
        setIsSuccess(false);
        setQuickRegisterOpen(false);
        setSearchTerm("");
        setSelectedStudentId("");
        setDescription("");
        setDetectedProtocol(null);
      }, 2500);
    }
  };

  const isDemoMode = localStorage.getItem("sase_tour_active") === "true";

  const handleVoiceInput = (text: string) => {
    setDescription((prev) => (prev ? `${prev} ${text}` : text));
  };

  // Filter types based on role boundaries
  const availableTypes = Object.values(IncidentType).filter((t) => {
    if (currentUserRole === UserRole.ENFERMERIA)
      return t === IncidentType.SALUD;
    if (currentUserRole === UserRole.DOCENTE)
      return [
        IncidentType.CONDUCTA,
        IncidentType.ACADEMICO,
        IncidentType.ASISTENCIA,
      ].includes(t);
    if (currentUserRole === UserRole.PREFECTURA)
      return [
        IncidentType.RETARDO,
        IncidentType.UNIFORME,
        IncidentType.CONDUCTA,
        IncidentType.ASISTENCIA,
      ].includes(t);
    if (currentUserRole === UserRole.DIRECTIVO) return true;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="bg-slate-900/90 border border-white/10 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in text-white">
        {/* Header */}
        <div className="bg-primary p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined">bolt</span>
            <h3 className="font-bold text-lg">Registro Rápido Universal</h3>
          </div>
          <button
            onClick={() => setQuickRegisterOpen(false)}
            className="hover:bg-white/20 rounded-full p-1"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {isSuccess ? (
          description.toLowerCase().includes("acoso") ? (
            <div className="p-8 bg-red-900/20">
              <div className="flex items-center gap-4 mb-6 border-b border-red-500/30 pb-4">
                <div className="p-3 bg-red-500/20 rounded-lg animate-pulse">
                  <span className="material-symbols-outlined text-red-500 text-4xl">
                    warning
                  </span>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white">
                    Protocolo Activado
                  </h4>
                  <p className="text-red-300 font-bold">
                    Nivel 3: Probable Acoso Escolar
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="p-4 bg-black/40 rounded-lg border-l-4 border-red-500">
                  <p className="text-sm text-gray-400 mb-1">
                    Paso 1 (Inmediato)
                  </p>
                  <p className="text-white font-medium">
                    Resguardar al alumno en sitio seguro y evitar
                    revictimización.
                  </p>
                </div>
                <div className="p-4 bg-black/40 rounded-lg border-l-4 border-orange-500">
                  <p className="text-sm text-gray-400 mb-1">
                    Paso 2 (Notificación)
                  </p>
                  <p className="text-white font-medium">
                    El sistema ha notificado a: Dirección, Orientación y Trabajo
                    Social.
                  </p>
                </div>
                <div className="p-4 bg-black/40 rounded-lg border-l-4 border-yellow-500">
                  <p className="text-sm text-gray-400 mb-1">
                    Paso 3 (Documentación)
                  </p>
                  <p className="text-white font-medium">
                    Levantar acta de hechos "Anexo 2" (Formato precargado
                    disponible).
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setQuickRegisterOpen(false)}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg shadow-red-900/50 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">description</span>
                  Ir a Actas
                </button>
                <button
                  onClick={() => setQuickRegisterOpen(false)}
                  className="px-4 py-3 border border-white/10 hover:bg-white/5 rounded-lg text-gray-300 font-medium"
                >
                  Cerrar Alerta
                </button>
              </div>
              <p className="mt-4 text-xs text-center text-gray-500">
                Folio de Protocolo: {new Date().getTime().toString().slice(-6)}{" "}
                | Referencia Normativa: Marco Local de Convivencia
              </p>
            </div>
          ) : (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-gradient-to-tr from-green-400 to-emerald-600 rounded-full flex items-center justify-center mb-6 animate-bounce shadow-lg shadow-green-500/30">
                <span className="material-symbols-outlined text-white text-5xl">
                  {isDemoMode ? "military_tech" : "check"}
                </span>
              </div>
              <h4 className="text-2xl font-bold text-white mb-2">
                {isDemoMode
                  ? "¡Misión Completada! 🚀"
                  : "Registrado Correctamente"}
              </h4>
              <p className="text-gray-300 mb-6">
                {isDemoMode
                  ? "Has dominado el registro rápido. ¡Tu campus está bajo control!"
                  : "La incidencia se ha guardado en el expediente."}
              </p>

              {/* Protocol Detected Action */}
              {detectedProtocol && (
                <div className="w-full bg-red-500/20 border border-red-500/50 rounded-xl p-4 animate-fade-in-up">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="p-2 bg-red-500 rounded-lg animate-pulse">
                      <span className="material-symbols-outlined text-white">
                        warning
                      </span>
                    </span>
                    <div className="text-left">
                      <p className="text-xs text-red-300 font-bold uppercase tracking-wider">
                        Protocolo Sugerido
                      </p>
                      <p className="font-bold text-white text-lg leading-none">
                        {detectedProtocol.titulo}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 text-left mb-4 line-clamp-2">
                    {detectedProtocol.objetivo}
                  </p>
                  <button
                    onClick={() => setShowProtocolModal(true)}
                    className="w-full py-3 bg-white text-red-600 font-bold rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">menu_book</span>
                    Activar Protocolo Ahora
                  </button>
                </div>
              )}

              {isDemoMode && (
                <div className="mt-6 flex gap-2 justify-center">
                  <span className="text-2xl animate-pulse">🎉</span>
                  <span className="text-2xl animate-pulse delay-100">⭐</span>
                  <span className="text-2xl animate-pulse delay-200">🎉</span>
                </div>
              )}
            </div>
          )
        ) : (
          <div className="p-6 space-y-4">
            {/* Student Search */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Buscar Alumno (Nombre o Matrícula)
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400">
                  search
                </span>
                <input
                  id="qr-search"
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-white/20 rounded-lg bg-black/40 text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none placeholder:text-gray-500"
                  placeholder="Ej. Carlos o 2023..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSelectedStudentId("");
                  }}
                  autoFocus
                />
              </div>

              {/* Autocomplete Results */}
              {searchTerm.length > 1 && !selectedStudentId && (
                <div className="absolute bg-slate-800 border border-white/10 shadow-lg rounded-lg mt-1 w-full max-w-[464px] z-10 max-h-48 overflow-y-auto">
                  {filteredStudents.length === 0 ? (
                    <div className="p-3 text-sm text-gray-400">
                      No se encontraron alumnos.
                    </div>
                  ) : (
                    filteredStudents.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setSelectedStudentId(s.id);
                          setSearchTerm(s.name);
                        }}
                        className="w-full text-left p-3 hover:bg-white/5 flex items-center gap-3 border-b border-white/5 last:border-0"
                      >
                        <img
                          src={s.avatar}
                          alt=""
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="text-sm font-bold text-white">
                            {s.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {s.group} • {s.matricula}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Incident Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Tipo de Evento
                </label>
                <select
                  value={type}
                  id="qr-type"
                  onChange={(e) => setType(e.target.value as IncidentType)}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg bg-black/40 text-white focus:ring-2 focus:ring-primary outline-none"
                >
                  {availableTypes.map((t) => (
                    <option key={t} value={t} className="text-black">
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Prioridad (Visual)
                </label>
                <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg text-sm text-gray-300 border border-white/10">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      [IncidentType.SALUD, IncidentType.CONDUCTA].includes(type)
                        ? "bg-alert-red"
                        : "bg-alert-yellow"
                    }`}
                  ></span>
                  {[IncidentType.SALUD, IncidentType.CONDUCTA].includes(type)
                    ? "Atención Requerida"
                    : "Registro Estándar"}
                </div>
              </div>
            </div>

            {/* Contextual Protocol Support */}
            {currentSupportProtocol && (
              <div className="col-span-1 md:col-span-2 mt-[-10px] mb-2">
                <button
                  onClick={() => {
                    setDetectedProtocol(currentSupportProtocol);
                    setShowProtocolModal(true);
                  }}
                  className="flex items-center gap-2 text-xs text-blue-300 hover:text-blue-100 transition-colors bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20 w-fit"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    menu_book
                  </span>
                  <span className="font-bold">Material de Apoyo:</span>
                  <span className="underline decoration-dotted">
                    {currentSupportProtocol.titulo}
                  </span>
                </button>
              </div>
            )}

            {/* Description */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-300">
                  Descripción Breve
                </label>
                <VoiceInput
                  onTranscript={handleVoiceInput}
                  className="text-gray-400 hover:text-white"
                />
              </div>
              <textarea
                id="qr-desc"
                className="w-full px-3 py-2 border border-white/20 rounded-lg bg-black/40 text-white focus:ring-2 focus:ring-primary outline-none h-24 resize-none placeholder:text-gray-500"
                placeholder="Describa el hecho de forma objetiva..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setQuickRegisterOpen(false)}
                  className="px-4 py-2 text-gray-300 font-medium hover:bg-white/10 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  id="qr-save"
                  onClick={handleRegister}
                  className={`px-6 py-2 font-bold rounded-lg shadow-md transition-all flex items-center gap-2 ${
                    !selectedStudentId
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed opacity-50"
                      : "bg-primary text-white hover:bg-primary-hover active:scale-95"
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">
                    save
                  </span>
                  Registrar
                </button>
              </div>
              {!selectedStudentId && searchTerm.length > 0 && (
                <p className="text-xs text-right text-orange-400 font-medium animate-pulse">
                  ⚠ Por favor seleccione un alumno de la lista desplegable
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {showProtocolModal && detectedProtocol && (
        <ProtocolDetailModal
          protocol={detectedProtocol}
          onClose={() => {
            setShowProtocolModal(false);
            // Only close the main modal if we were in the success flow
            if (isSuccess) {
              setQuickRegisterOpen(false);
              setIsSuccess(false);
              setSearchTerm("");
              setSelectedStudentId("");
              setDescription("");
              setDetectedProtocol(null);
            } else {
              // Just clear the viewed protocol so we return to form
              setDetectedProtocol(null);
            }
          }}
        />
      )}
    </div>
  );
};
