import React, { useState } from "react";
import { useApp } from "../store";
import { IncidentType, UserRole } from "../types";
import { VoiceInput } from "./VoiceInput";
import { startRegisterModalTour } from "./TourGuide";

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

  const handleRegister = () => {
    if (!selectedStudentId) return;
    addIncident(
      selectedStudentId,
      type,
      description || "Reporte rápido sin descripción"
    );
    setIsSuccess(true);

    // Clean up tour if it was active
    if (localStorage.getItem("sase_tour_active")) {
      localStorage.removeItem("sase_tour_active");
    }

    setTimeout(() => {
      setIsSuccess(false);
      setQuickRegisterOpen(false);
      setSearchTerm("");
      setSelectedStudentId("");
      setDescription("");
    }, 2500); // Increased time to enjoy the success message
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
            <p className="text-gray-300">
              {isDemoMode
                ? "Has dominado el registro rápido. ¡Tu campus está bajo control!"
                : "La incidencia se ha guardado en el expediente."}
            </p>
            {isDemoMode && (
              <div className="mt-6 flex gap-2 justify-center">
                <span className="text-2xl animate-pulse">🎉</span>
                <span className="text-2xl animate-pulse delay-100">⭐</span>
                <span className="text-2xl animate-pulse delay-200">🎉</span>
              </div>
            )}
          </div>
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
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setQuickRegisterOpen(false)}
                className="px-4 py-2 text-gray-300 font-medium hover:bg-white/10 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                id="qr-save"
                onClick={handleRegister}
                disabled={!selectedStudentId}
                className="px-6 py-2 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">save</span>
                Registrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
