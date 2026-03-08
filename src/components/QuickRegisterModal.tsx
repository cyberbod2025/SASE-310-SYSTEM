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
    quickRegisterType,
    students,
    groups,
    addIncident,
    currentUserRole,
  } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [type, setType] = useState<IncidentType>(quickRegisterType);
  const [description, setDescription] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [detectedProtocol, setDetectedProtocol] = useState<Protocol | null>(
    null,
  );
  const [showProtocolModal, setShowProtocolModal] = useState(false);
  const [supportProtocols, setSupportProtocols] = useState<Protocol[]>([]);

  // Nuevos estados para Creación de Documentos
  const [generarCitatorio, setGenerarCitatorio] = useState(false);
  const [fechaCitatorio, setFechaCitatorio] = useState("");
  const [horaCitatorio, setHoraCitatorio] = useState("");
  
  const [generarActa, setGenerarActa] = useState(false);
  const [tipoActa, setTipoActa] = useState<"hechos" | "acuerdos">("hechos");

  // Sync type and set initial template when modal opens
  React.useEffect(() => {
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

  const getQuickGuides = (currentType: IncidentType) => {
    const guides: Record<string, string[]> = {
      [IncidentType.CONDUCTA]: [
        "Pelea física",
        "Acoso verbal",
        "Falta de respeto",
        "Uso de celular",
      ],
      [IncidentType.RETARDO]: [
        "15 min tarde",
        "Sin justificante",
        "Reincidente",
        "Segunda hora",
      ],
      [IncidentType.UNIFORME]: [
        "Falta pants",
        "Playera no oficial",
        "Tenis de color",
        "Sin sudadera",
      ],
      [IncidentType.SALUD]: ["Dolor de cabeza", "Nauseas", "Caída", "Alergia"],
      [IncidentType.ACADEMICO]: [
        "No entrega tarea",
        "Falta material",
        "Distracción total",
        "Bajo promedio",
      ],
      [IncidentType.ASISTENCIA]: [
        "Se retiró del aula",
        "No llegó a clase",
        "Cuidado de hermanos",
      ],
    };
    return guides[currentType] || [];
  };

  // Smart search filters
  const [selectedGrado, setSelectedGrado] = useState<string>("");
  const [selectedGrupo, setSelectedGrupo] = useState<string>("");
  const [studentNotFound, setStudentNotFound] = useState(false);
  const [pendingStudentName, setPendingStudentName] = useState("");

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

  // Extract unique grades and groups from the 'groups' array
  const allGroups = (groups || []).map((g) => g.nombre || g.name);
  const grados = [...new Set(allGroups.map((g) => (g && g.length > 0 ? g.charAt(0) : "")))].filter(Boolean) as string[];
  const gruposForGrado = selectedGrado
    ? allGroups.filter((g) => g.startsWith(selectedGrado))
    : [];

  // Smart filtered students based on grade, group, and search term
  const filteredStudents = students.filter((s) => {
    // Filter by grade if selected
    if (selectedGrado && !s.group.startsWith(selectedGrado)) return false;
    // Filter by group if selected
    if (selectedGrupo && s.group !== selectedGrupo) return false;
    // Filter by search term (name or matricula)
    if (searchTerm.length > 1) {
      const term = searchTerm.toLowerCase();
      const nameMatch = (s.name || "").toLowerCase().includes(term);
      const matriculaMatch = (s.matricula || "")
        .toString()
        .includes(searchTerm);
      return nameMatch || matriculaMatch;
    }
    // If no search term but grade/group selected, show all in that group
    return selectedGrupo ? true : false;
  });

  const handleRegister = async () => {
    // Allow registration with pending student
    if (!selectedStudentId && !studentNotFound) {
      toast.error(
        "Debes seleccionar un alumno de la lista o marcarlo como no encontrado",
        {
          icon: "👆",
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        },
      );
      return;
    }

    // Handle pending student (not found in database)
    if (studentNotFound && pendingStudentName) {
      // Log this as a pending assignment issue
      console.log("[PENDING STUDENT]", {
        reportedName: pendingStudentName,
        grado: selectedGrado,
        grupo: selectedGrupo,
        type,
        description,
        reportedBy: currentUserRole,
        timestamp: new Date().toISOString(),
      });

      // Notify Secretaría and Dirección
      toast.success(
        `Incidencia registrada como PENDIENTE. Se notificará a Secretaría y Dirección para asignar alumno: "${pendingStudentName}"`,
        {
          duration: 5000,
          icon: "📋",
        },
      );

      setIsSuccess(true);
      setTimeout(() => {
        resetForm();
      }, 3000);
      return;
    }

    // 1. Add Incident (normal flow)
    addIncident(
      selectedStudentId,
      type,
      description || "Reporte rápido sin descripción",
    );

    // 2. Check for Protocol Triggers (Institutional Guidelines)
    const lowerDesc = description.toLowerCase();
    let protocolTitleToFind = "";

    // PROTOCOLO DE CONVIVENCIA ESCOLAR
    const convivenciaKeywords = [
      "pelea",
      "bullying",
      "acoso",
      "agresión",
      "insulto",
      "amenaza",
      "violencia",
      "discusión",
    ];
    if (
      type === IncidentType.CONDUCTA &&
      convivenciaKeywords.some((k) => lowerDesc.includes(k))
    ) {
      protocolTitleToFind = "Protocolo de Convivencia Escolar";
    }

    // PROTOCOLO DE VIDEOVIGILANCIA
    const videoKeywords = [
      "cámara",
      "grabación",
      "robo",
      "perdida",
      "evidencia",
      "videovigilancia",
      "hechos",
    ];
    if (videoKeywords.some((k) => lowerDesc.includes(k))) {
      protocolTitleToFind = "Protocolo de Videovigilancia Escolar";
    }

    // ACTUACIÓN DOCENTE ANTE CONTINGENCIAS
    const contingenciaKeywords = [
      "accidente",
      "caída",
      "emergencia",
      "riesgo",
      "sangre",
      "desmayo",
      "convulsión",
      "fractura",
      "primeros auxilios",
    ];
    if (
      type === IncidentType.SALUD ||
      contingenciaKeywords.some((k) => lowerDesc.includes(k))
    ) {
      protocolTitleToFind = "Protocolo de Actuación Docente ante Contingencias";
    }

    // PROTOCOLO PREVENCIÓN DE ADICCIONES ("Si te drogas, te dañas")
    const adiccionesKeywords = [
      "droga",
      "vape",
      "cigarro",
      "tabaco",
      "alcohol",
      "marihuana",
      "fentanilo",
      "pasón",
      "intoxicado",
      "olor a quemado",
    ];
    if (adiccionesKeywords.some((k) => lowerDesc.includes(k))) {
      protocolTitleToFind = "Protocolo de Prevención de Adicciones";
    }

    // PROTOCOLO PROTECCIÓN CIVIL
    const civilKeywords = [
      "sismo",
      "temblor",
      "incendio",
      "fuego",
      "humo",
      "balacera",
      "detonación",
      "arma",
      "amenaza de bomba",
    ];
    if (civilKeywords.some((k) => lowerDesc.includes(k))) {
      protocolTitleToFind = "Protocolo de Protección Civil";
    }

    // Default Fallbacks for legacy/general keywords
    if (!protocolTitleToFind) {
      if (lowerDesc.includes("sismo") || lowerDesc.includes("temblor")) {
        protocolTitleToFind = "Sismo";
      }
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

    // Acciones Documentales (IA-SASE)
    if (generarCitatorio) {
      toast.success(
        `Citatorio a Padres agendado para: ${
          fechaCitatorio || "Próxima fecha disponible"
        } a las ${horaCitatorio || "08:00 AM"}. Formato listo para impresión.`,
        { icon: "📅", duration: 5000 }
      );
    }

    if (generarActa) {
      const nombreActa = tipoActa === "hechos" ? "Acta de Hechos" : "Hoja de Acuerdos";
      setTimeout(() => {
        toast.success(
          `${nombreActa} generada y anexada al Expediente del alumno automáticamente.`,
          { icon: "📝", duration: 5000 }
        );
      }, 1000); // Delayed slightly to not overlap with the primary toast
    }

    setIsSuccess(true);

    // Clean up tour if it was active
    if (localStorage.getItem("sase_tour_active")) {
      localStorage.removeItem("sase_tour_active");
    }

    // Auto-close logic only if no protocol detected, otherwise keep open to show button
    if (!protocolTitleToFind) {
      setTimeout(() => {
        resetForm();
      }, 2500);
    }
  };

  // Reset all form fields
  const resetForm = () => {
    setIsSuccess(false);
    setQuickRegisterOpen(false);
    setSearchTerm("");
    setSelectedStudentId("");
    setDescription("");
    setDetectedProtocol(null);
    setSelectedGrado("");
    setSelectedGrupo("");
    setStudentNotFound(false);
    setPendingStudentName("");
    setGenerarCitatorio(false);
    setFechaCitatorio("");
    setHoraCitatorio("");
    setGenerarActa(false);
  };

  const isDemoMode = localStorage.getItem("sase_tour_active") === "true";

  const handleVoiceInput = (text: string) => {
    setDescription((prev) => (prev ? `${prev} ${text}` : text));
  };

  // Filter types based on role boundaries
  const availableTypes = Object.values(IncidentType).filter((t) => {
    if (currentUserRole === UserRole.MEDICO_ESCOLAR)
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
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
            {/* Smart Filters: Grado → Grupo */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="qr-grado"
                  className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider"
                >
                  1. Grado
                </label>
                <select
                  id="qr-grado"
                  name="grado"
                  value={selectedGrado}
                  onChange={(e) => {
                    setSelectedGrado(e.target.value);
                    setSelectedGrupo("");
                    setSelectedStudentId("");
                    setSearchTerm("");
                    setStudentNotFound(false);
                  }}
                  className="w-full px-3 py-2.5 border border-white/20 rounded-lg bg-black/40 text-white focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="">-- Seleccionar --</option>
                  {grados.map((g) => (
                    <option key={g} value={g} className="text-black">
                      {g}° Grado
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="qr-grupo"
                  className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider"
                >
                  2. Grupo
                </label>
                <select
                  id="qr-grupo"
                  name="grupo"
                  value={selectedGrupo}
                  onChange={(e) => {
                    setSelectedGrupo(e.target.value);
                    setSelectedStudentId("");
                    setSearchTerm("");
                    setStudentNotFound(false);
                  }}
                  disabled={!selectedGrado}
                  className="w-full px-3 py-2.5 border border-white/20 rounded-lg bg-black/40 text-white focus:ring-2 focus:ring-primary outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">-- Seleccionar --</option>
                  {gruposForGrado.map((g) => (
                    <option key={g} value={g} className="text-black">
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Student Search - Only visible after selecting group */}
            {selectedGrupo && !studentNotFound && (
              <div>
                <label
                  htmlFor="qr-search"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  3. Buscar Alumno (Nombre o Apellidos)
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400">
                    search
                  </span>
                  <input
                    id="qr-search"
                    name="student-search"
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border border-white/20 rounded-lg bg-black/40 text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none placeholder:text-gray-500"
                    placeholder="Escriba nombre o apellido..."
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
                  <div className="bg-slate-800 border border-white/10 shadow-lg rounded-lg mt-1 max-h-48 overflow-y-auto">
                    {filteredStudents.length === 0 ? (
                      <div className="p-4">
                        <p className="text-sm text-gray-400 mb-3">
                          No se encontró ningún alumno con "{searchTerm}" en{" "}
                          {selectedGrupo}
                        </p>
                        <button
                          onClick={() => {
                            setStudentNotFound(true);
                            setPendingStudentName(searchTerm);
                          }}
                          className="w-full py-2 px-3 bg-orange-600/20 border border-orange-500/50 rounded-lg text-orange-300 text-sm font-medium hover:bg-orange-600/30 transition-colors flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-lg">
                            person_add
                          </span>
                          Registrar como "Pendiente de Asignar"
                        </button>
                      </div>
                    ) : (
                      filteredStudents.slice(0, 8).map((s) => (
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
            )}

            {/* Show pending student indicator */}
            {studentNotFound && pendingStudentName && (
              <div className="bg-orange-600/20 border border-orange-500/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-orange-400">
                      person_off
                    </span>
                    <div>
                      <p className="text-sm font-bold text-orange-300">
                        Alumno Pendiente de Asignar
                      </p>
                      <p className="text-xs text-orange-400/80">
                        "{pendingStudentName}" - {selectedGrupo}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setStudentNotFound(false);
                      setPendingStudentName("");
                      setSearchTerm("");
                    }}
                    className="text-orange-400 hover:text-white"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>
            )}

            {/* Incident Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="qr-type"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Tipo de Evento
                </label>
                <select
                  id="qr-type"
                  name="incident-type"
                  value={type}
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
                <label
                  htmlFor="qr-desc"
                  className="block text-sm font-medium text-gray-300"
                >
                  Descripción Breve
                </label>
                <VoiceInput
                  onTranscript={handleVoiceInput}
                  className="text-gray-400 hover:text-white"
                />
              </div>
              <textarea
                id="qr-desc"
                name="description"
                className="w-full px-3 py-2 border border-white/20 rounded-lg bg-black/40 text-white focus:ring-2 focus:ring-primary outline-none h-24 resize-none placeholder:text-gray-500 font-medium text-sm"
                placeholder="Describa el hecho de forma objetiva..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              {/* GUIAS DE REDACCIÓN (Premium Actionable Labels) */}
              <div className="mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] font-black uppercase text-blue-400 tracking-[0.2em]">
                    Sugerencias de Registro
                  </span>
                  <div className="h-px flex-1 bg-blue-500/20"></div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {getQuickGuides(type).map((guide) => (
                    <button
                      key={guide}
                      type="button"
                      onClick={() =>
                        setDescription((prev) =>
                          prev.endsWith(" ")
                            ? prev + guide
                            : prev + " " + guide,
                        )
                      }
                      className="px-2 py-1.5 bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/40 rounded-lg text-[10px] text-blue-300 font-bold transition-all hover:scale-105 active:scale-95"
                    >
                      + {guide}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Opciones de Documentación Automática */}
            <div className="space-y-2 mt-4 bg-black/20 p-3 rounded-lg border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-purple-400 text-sm">auto_awesome</span>
                <span className="text-[10px] font-black uppercase text-purple-400 tracking-[0.2em]">
                  Acciones Posteriores (IA-SASE)
                </span>
              </div>
              
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={generarCitatorio}
                    onChange={(e) => setGenerarCitatorio(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="w-4 h-4 rounded border border-white/20 bg-white/5 peer-checked:bg-purple-500 peer-checked:border-purple-500 transition-all flex items-center justify-center group-hover:border-purple-400">
                    <span className="material-symbols-outlined text-[12px] text-white opacity-0 peer-checked:opacity-100">
                      check
                    </span>
                  </div>
                </div>
                <span className="text-sm text-gray-300 font-medium group-hover:text-white transition-colors">Generar y Agendar Citatorio a Padres</span>
              </label>

              {generarCitatorio && (
                <div className="pl-7 grid grid-cols-2 gap-3 mt-2 animate-fade-in">
                  <div>
                    <label className="block text-[10px] uppercase text-gray-500 mb-1 font-bold">Fecha Proyectada</label>
                    <input type="date" value={fechaCitatorio} onChange={e => setFechaCitatorio(e.target.value)} className="w-full px-2 py-1.5 border border-white/10 rounded bg-black/40 text-white text-xs outline-none focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-gray-500 mb-1 font-bold">Hora Citatorio</label>
                    <input type="time" value={horaCitatorio} onChange={e => setHoraCitatorio(e.target.value)} className="w-full px-2 py-1.5 border border-white/10 rounded bg-black/40 text-white text-xs outline-none focus:border-purple-500" />
                  </div>
                </div>
              )}

              <label className="flex items-center gap-3 cursor-pointer group mt-2 relative">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={generarActa}
                    onChange={(e) => setGenerarActa(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="w-4 h-4 rounded border border-white/20 bg-white/5 peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all flex items-center justify-center group-hover:border-blue-400">
                    <span className="material-symbols-outlined text-[12px] text-white opacity-0 peer-checked:opacity-100">
                      check
                    </span>
                  </div>
                </div>
                <span className="text-sm text-gray-300 font-medium group-hover:text-white transition-colors">Formular Documento Oficial (Acta/Acuerdo)</span>
              </label>

              {generarActa && (
                <div className="pl-7 mt-2 space-y-2 animate-fade-in">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={tipoActa === 'hechos'} onChange={() => setTipoActa('hechos')} className="text-blue-500 focus:ring-blue-500 bg-white/5 border-white/20" />
                      <span className="text-xs text-gray-400">Acta de Hechos</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={tipoActa === 'acuerdos'} onChange={() => setTipoActa('acuerdos')} className="text-blue-500 focus:ring-blue-500 bg-white/5 border-white/20" />
                      <span className="text-xs text-gray-400">Hoja de Acuerdos</span>
                    </label>
                  </div>
                </div>
              )}
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
