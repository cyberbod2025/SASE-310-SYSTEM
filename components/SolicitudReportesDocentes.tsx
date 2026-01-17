import React, { useState } from "react";
import { useApp } from "../store";

// Types
interface ReporteDocenteRequest {
  id: string;
  alumnoId: string;
  alumnoNombre: string;
  alumnoGrupo: string;
  tipoReporte: ("academico" | "conductual")[];
  docentesSolicitados: string[];
  observacionesOrientacion: string;
  estado: "pendiente" | "parcial" | "completado";
  respuestas: ReporteDocenteResponse[];
  createdAt: string;
}

interface ReporteDocenteResponse {
  docenteNombre: string;
  materia: string;
  fechaRespuesta: string;
  academico?: {
    haceTareas: boolean | null;
    entregaActividades: boolean | null;
    participa: boolean | null;
    materialCompleto: boolean | null;
    cuadernoCompleto: boolean | null;
    observaciones: string;
  };
  conductual?: {
    actitud: "agresiva" | "indiferente" | "positiva" | null;
    observaciones: string;
  };
  comunicacionPadres: {
    envioMensajes: boolean | null;
    recibioRespuesta: boolean | null;
    observaciones: string;
  };
}

// Mock docentes - En producción vendría de la base de datos
const DOCENTES_POR_GRUPO: Record<
  string,
  { nombre: string; materia: string }[]
> = {
  "1º A": [
    { nombre: "Prof. García", materia: "Español" },
    { nombre: "Prof. López", materia: "Matemáticas" },
    { nombre: "Prof. Martínez", materia: "Ciencias" },
    { nombre: "Prof. Hernández", materia: "Historia" },
    { nombre: "Prof. Rodríguez", materia: "Inglés" },
  ],
  "1º B": [
    { nombre: "Prof. García", materia: "Español" },
    { nombre: "Prof. López", materia: "Matemáticas" },
    { nombre: "Prof. Sánchez", materia: "Ciencias" },
    { nombre: "Prof. Hernández", materia: "Historia" },
    { nombre: "Prof. Díaz", materia: "Inglés" },
  ],
  "2º A": [
    { nombre: "Prof. Ramírez", materia: "Español" },
    { nombre: "Prof. Torres", materia: "Matemáticas" },
    { nombre: "Prof. Flores", materia: "Física" },
    { nombre: "Prof. Morales", materia: "Historia" },
    { nombre: "Prof. Jiménez", materia: "Inglés" },
  ],
  "2º B": [
    { nombre: "Prof. Ramírez", materia: "Español" },
    { nombre: "Prof. Torres", materia: "Matemáticas" },
    { nombre: "Prof. Flores", materia: "Física" },
    { nombre: "Prof. Castro", materia: "Historia" },
    { nombre: "Prof. Jiménez", materia: "Inglés" },
  ],
  "3º A": [
    { nombre: "Prof. Vargas", materia: "Español" },
    { nombre: "Prof. Medina", materia: "Matemáticas" },
    { nombre: "Prof. Ruiz", materia: "Química" },
    { nombre: "Prof. Ortiz", materia: "Historia" },
    { nombre: "Prof. Guerrero", materia: "Inglés" },
  ],
  "3º B": [
    { nombre: "Prof. Vargas", materia: "Español" },
    { nombre: "Prof. Medina", materia: "Matemáticas" },
    { nombre: "Prof. Ruiz", materia: "Química" },
    { nombre: "Prof. Delgado", materia: "Historia" },
    { nombre: "Prof. Guerrero", materia: "Inglés" },
  ],
};

// Mock data
const MOCK_SOLICITUDES: ReporteDocenteRequest[] = [];

export const SolicitudReportesDocentes: React.FC = () => {
  const { students } = useApp();
  const [activeTab, setActiveTab] = useState<
    "nueva" | "pendientes" | "completadas"
  >("nueva");
  const [solicitudes, setSolicitudes] =
    useState<ReporteDocenteRequest[]>(MOCK_SOLICITUDES);

  // Form state
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [tipoReporte, setTipoReporte] = useState<
    ("academico" | "conductual")[]
  >([]);
  const [docentesSeleccionados, setDocentesSeleccionados] = useState<string[]>(
    []
  );
  const [observaciones, setObservaciones] = useState("");

  const selectedStudentData = students.find((s) => s.id === selectedStudent);
  const docentesDisponibles = selectedStudentData
    ? DOCENTES_POR_GRUPO[selectedStudentData.group] || []
    : [];

  const toggleTipoReporte = (tipo: "academico" | "conductual") => {
    setTipoReporte((prev) =>
      prev.includes(tipo) ? prev.filter((t) => t !== tipo) : [...prev, tipo]
    );
  };

  const toggleDocente = (docente: string) => {
    setDocentesSeleccionados((prev) =>
      prev.includes(docente)
        ? prev.filter((d) => d !== docente)
        : [...prev, docente]
    );
  };

  const selectAllDocentes = () => {
    if (docentesSeleccionados.length === docentesDisponibles.length) {
      setDocentesSeleccionados([]);
    } else {
      setDocentesSeleccionados(docentesDisponibles.map((d) => d.nombre));
    }
  };

  const handleEnviarSolicitud = () => {
    if (
      !selectedStudent ||
      tipoReporte.length === 0 ||
      docentesSeleccionados.length === 0
    ) {
      alert("Complete todos los campos requeridos.");
      return;
    }

    const nuevaSolicitud: ReporteDocenteRequest = {
      id: `srd-${Date.now()}`,
      alumnoId: selectedStudent,
      alumnoNombre: selectedStudentData?.name || "",
      alumnoGrupo: selectedStudentData?.group || "",
      tipoReporte,
      docentesSolicitados: docentesSeleccionados,
      observacionesOrientacion: observaciones,
      estado: "pendiente",
      respuestas: [],
      createdAt: new Date().toISOString(),
    };

    setSolicitudes([nuevaSolicitud, ...solicitudes]);

    // Reset form
    setSelectedStudent("");
    setTipoReporte([]);
    setDocentesSeleccionados([]);
    setObservaciones("");
    setActiveTab("pendientes");

    alert(
      `Solicitud enviada a ${docentesSeleccionados.length} docente(s) para el alumno ${selectedStudentData?.name}`
    );
  };

  const pendientes = solicitudes.filter((s) => s.estado !== "completado");
  const completadas = solicitudes.filter((s) => s.estado === "completado");

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              psychology
            </span>
            Reportes Docentes
          </h1>
          <p className="text-text-secondary">
            Solicitar información académica y conductual a docentes
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border-color">
        <button
          onClick={() => setActiveTab("nueva")}
          className={`px-4 py-3 font-bold text-sm border-b-2 transition-colors ${
            activeTab === "nueva"
              ? "border-primary text-primary"
              : "border-transparent text-text-secondary hover:text-text-main"
          }`}
        >
          <span className="material-symbols-outlined text-lg align-middle mr-1">
            add_circle
          </span>
          Nueva Solicitud
        </button>
        <button
          onClick={() => setActiveTab("pendientes")}
          className={`px-4 py-3 font-bold text-sm border-b-2 transition-colors ${
            activeTab === "pendientes"
              ? "border-primary text-primary"
              : "border-transparent text-text-secondary hover:text-text-main"
          }`}
        >
          <span className="material-symbols-outlined text-lg align-middle mr-1">
            pending
          </span>
          Pendientes ({pendientes.length})
        </button>
        <button
          onClick={() => setActiveTab("completadas")}
          className={`px-4 py-3 font-bold text-sm border-b-2 transition-colors ${
            activeTab === "completadas"
              ? "border-primary text-primary"
              : "border-transparent text-text-secondary hover:text-text-main"
          }`}
        >
          <span className="material-symbols-outlined text-lg align-middle mr-1">
            check_circle
          </span>
          Completadas ({completadas.length})
        </button>
      </div>

      {/* Nueva Solicitud Tab */}
      {activeTab === "nueva" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Paso 1: Seleccionar Alumno */}
          <div className="bg-white rounded-xl border border-border-color shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border-color bg-gray-50">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <span className="size-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                  1
                </span>
                Seleccionar Alumno
              </h3>
            </div>
            <div className="p-4">
              <select
                value={selectedStudent}
                onChange={(e) => {
                  const studentId = e.target.value;
                  setSelectedStudent(studentId);
                  // Auto-select ALL teachers for this student's group
                  const student = students.find((s) => s.id === studentId);
                  if (student) {
                    const docentes = DOCENTES_POR_GRUPO[student.group] || [];
                    setDocentesSeleccionados(docentes.map((d) => d.nombre));
                  } else {
                    setDocentesSeleccionados([]);
                  }
                }}
                className="w-full p-3 border border-border-color rounded-lg text-sm"
              >
                <option value="">Buscar alumno...</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} - {s.group}
                  </option>
                ))}
              </select>

              {selectedStudentData && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {selectedStudentData.name.substring(0, 2)}
                    </div>
                    <div>
                      <p className="font-bold text-text-main">
                        {selectedStudentData.name}
                      </p>
                      <p className="text-xs text-slate-500 font-black uppercase tracking-widest mt-1">
                        {selectedStudentData.group} •{" "}
                        {selectedStudentData.matricula}
                      </p>
                      <p className="text-xs text-blue-700 mt-1 font-black uppercase tracking-tight">
                        {selectedStudentData.incidents.length} incidencia(s)
                        detectada(s)
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Paso 2: Tipo de Reporte */}
          <div className="bg-white rounded-xl border border-border-color shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border-color bg-gray-50">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <span className="size-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                  2
                </span>
                Tipo de Reporte
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <button
                onClick={() => toggleTipoReporte("academico")}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  tipoReporte.includes("academico")
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`material-symbols-outlined text-2xl ${
                      tipoReporte.includes("academico")
                        ? "text-blue-600"
                        : "text-gray-400"
                    }`}
                  >
                    school
                  </span>
                  <div>
                    <p className="font-bold">Académico</p>
                    <p className="text-xs text-text-secondary">
                      Tareas, actividades, participación, materiales
                    </p>
                  </div>
                  {tipoReporte.includes("academico") && (
                    <span className="material-symbols-outlined text-blue-600 ml-auto">
                      check_circle
                    </span>
                  )}
                </div>
              </button>

              <button
                onClick={() => toggleTipoReporte("conductual")}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  tipoReporte.includes("conductual")
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 hover:border-orange-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`material-symbols-outlined text-2xl ${
                      tipoReporte.includes("conductual")
                        ? "text-orange-600"
                        : "text-gray-400"
                    }`}
                  >
                    psychology
                  </span>
                  <div>
                    <p className="font-bold">Conductual</p>
                    <p className="text-xs text-text-secondary">
                      Actitud en clase, comportamiento general
                    </p>
                  </div>
                  {tipoReporte.includes("conductual") && (
                    <span className="material-symbols-outlined text-orange-600 ml-auto">
                      check_circle
                    </span>
                  )}
                </div>
              </button>

              <div className="pt-3 border-t border-gray-100">
                <label className="block text-xs font-bold text-text-secondary uppercase mb-2">
                  Observaciones para docentes (opcional)
                </label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={3}
                  className="w-full p-2 border border-border-color rounded-lg text-sm resize-none"
                  placeholder="Contexto adicional para los docentes..."
                />
              </div>
            </div>
          </div>

          {/* Paso 3: Seleccionar Docentes */}
          <div className="bg-white rounded-xl border border-border-color shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border-color bg-gray-50">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <span className="size-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                  3
                </span>
                Docentes
              </h3>
            </div>
            <div className="p-4">
              {!selectedStudentData ? (
                <p className="text-sm text-text-secondary text-center py-8">
                  Seleccione un alumno primero
                </p>
              ) : docentesDisponibles.length === 0 ? (
                <p className="text-sm text-text-secondary text-center py-8">
                  No hay docentes configurados para {selectedStudentData.group}
                </p>
              ) : (
                <>
                  <button
                    onClick={selectAllDocentes}
                    className="w-full mb-3 py-2 text-sm font-bold text-primary hover:bg-primary/5 rounded-lg transition-colors"
                  >
                    {docentesSeleccionados.length === docentesDisponibles.length
                      ? "Deseleccionar todos"
                      : "Seleccionar todos"}
                  </button>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {docentesDisponibles.map((doc) => (
                      <button
                        key={doc.nombre}
                        onClick={() => toggleDocente(doc.nombre)}
                        className={`w-full p-3 rounded-lg border text-left transition-all flex items-center gap-3 ${
                          docentesSeleccionados.includes(doc.nombre)
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-green-300"
                        }`}
                      >
                        <div
                          className={`size-5 rounded border-2 flex items-center justify-center ${
                            docentesSeleccionados.includes(doc.nombre)
                              ? "border-green-500 bg-green-500 text-white"
                              : "border-gray-300"
                          }`}
                        >
                          {docentesSeleccionados.includes(doc.nombre) && (
                            <span className="material-symbols-outlined text-sm">
                              check
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{doc.nombre}</p>
                          <p className="text-xs text-text-secondary">
                            {doc.materia}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="p-4 border-t border-border-color bg-gray-50">
              <button
                onClick={handleEnviarSolicitud}
                disabled={
                  !selectedStudent ||
                  tipoReporte.length === 0 ||
                  docentesSeleccionados.length === 0
                }
                className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">send</span>
                Enviar a {docentesSeleccionados.length} docente(s)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pendientes Tab */}
      {activeTab === "pendientes" && (
        <div className="bg-white rounded-xl border border-border-color shadow-sm overflow-hidden">
          {pendientes.length === 0 ? (
            <div className="p-10 text-center text-text-secondary">
              <span className="material-symbols-outlined text-4xl mb-2">
                inbox
              </span>
              <p>No hay solicitudes pendientes.</p>
            </div>
          ) : (
            <div className="divide-y divide-border-color">
              {pendientes.map((sol) => (
                <div key={sol.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="size-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                        <span className="material-symbols-outlined">
                          pending
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-text-main">
                          {sol.alumnoNombre}
                        </p>
                        <p className="text-xs text-slate-500 font-black uppercase tracking-widest">
                          {sol.alumnoGrupo}
                        </p>
                        <div className="flex gap-2 mt-2">
                          {sol.tipoReporte.includes("academico") && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-black rounded-lg border border-blue-200 uppercase tracking-widest shadow-sm">
                              ACADÉMICO
                            </span>
                          )}
                          {sol.tipoReporte.includes("conductual") && (
                            <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-black rounded-lg border border-orange-200 uppercase tracking-widest shadow-sm">
                              CONDUCTUAL
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-2 font-black uppercase tracking-tight leading-relaxed">
                          Enviado a:{" "}
                          <span className="text-blue-700">
                            {sol.docentesSolicitados.join(", ")}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-text-secondary">
                        {new Date(sol.createdAt).toLocaleDateString("es-MX")}
                      </p>
                      <p className="text-sm font-bold text-yellow-600 mt-1">
                        {sol.respuestas.length}/{sol.docentesSolicitados.length}{" "}
                        respuestas
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Completadas Tab */}
      {activeTab === "completadas" && (
        <div className="bg-white rounded-xl border border-border-color shadow-sm overflow-hidden">
          {completadas.length === 0 ? (
            <div className="p-10 text-center text-text-secondary">
              <span className="material-symbols-outlined text-4xl mb-2">
                folder_open
              </span>
              <p>No hay solicitudes completadas aún.</p>
            </div>
          ) : (
            <div className="divide-y divide-border-color">
              {completadas.map((sol) => (
                <div key={sol.id} className="p-4">
                  <p className="font-bold">{sol.alumnoNombre}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Preview: Formulario que verá el Docente */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-border-color p-6">
        <h3 className="font-bold text-lg text-text-main mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined">preview</span>
          Vista Previa: Formulario del Docente
        </h3>
        <p className="text-sm text-text-secondary mb-4">
          Así verán los docentes el formulario para responder la solicitud:
        </p>

        <div className="bg-white rounded-xl border border-border-color shadow-sm p-6 space-y-6">
          {/* Sección Académica */}
          <div className="border-b border-gray-100 pb-6">
            <h4 className="font-bold text-blue-700 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">school</span>
              Desempeño Académico
            </h4>
            <div className="space-y-3">
              {[
                "¿El alumno hace tareas?",
                "¿El alumno entrega actividades?",
                "¿El alumno participa en clase?",
                "¿El alumno trae su material completo?",
                "¿El alumno tiene su cuaderno completo?",
              ].map((pregunta, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm">{pregunta}</span>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name={`ac-${idx}`}
                        className="accent-green-600"
                      />
                      <span className="text-xs font-bold text-green-600">
                        Sí
                      </span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name={`ac-${idx}`}
                        className="accent-red-600"
                      />
                      <span className="text-xs font-bold text-red-600">No</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name={`ac-${idx}`}
                        className="accent-gray-400"
                      />
                      <span className="text-xs font-bold text-gray-500">
                        A veces
                      </span>
                    </label>
                  </div>
                </div>
              ))}
              <textarea
                className="w-full p-3 border border-gray-200 rounded-lg text-sm mt-2"
                rows={2}
                placeholder="Observaciones académicas adicionales..."
              />
            </div>
          </div>

          {/* Sección Conductual */}
          <div className="border-b border-gray-100 pb-6">
            <h4 className="font-bold text-orange-700 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">psychology</span>
              Comportamiento en Clase
            </h4>
            <div className="p-3 bg-gray-50 rounded-lg mb-3">
              <p className="text-sm mb-3">
                El alumno muestra una actitud en clase:
              </p>
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-2 px-4 py-2 border-2 border-red-200 rounded-lg cursor-pointer hover:border-red-400 transition-colors">
                  <input
                    type="radio"
                    name="actitud"
                    className="accent-red-600"
                  />
                  <span className="text-sm font-bold text-red-700">
                    😠 Agresiva/Grosera
                  </span>
                </label>
                <label className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                  <input
                    type="radio"
                    name="actitud"
                    className="accent-gray-600"
                  />
                  <span className="text-sm font-bold text-gray-700">
                    😐 Indiferente/Neutral
                  </span>
                </label>
                <label className="flex items-center gap-2 px-4 py-2 border-2 border-green-200 rounded-lg cursor-pointer hover:border-green-400 transition-colors">
                  <input
                    type="radio"
                    name="actitud"
                    className="accent-green-600"
                  />
                  <span className="text-sm font-bold text-green-700">
                    😊 Positiva/Entusiasta
                  </span>
                </label>
              </div>
            </div>
            <textarea
              className="w-full p-3 border border-gray-200 rounded-lg text-sm"
              rows={2}
              placeholder="Observaciones conductuales adicionales..."
            />
          </div>

          {/* Sección Comunicación con Padres */}
          <div>
            <h4 className="font-bold text-purple-700 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">family_restroom</span>
              Comunicación con Padres/Tutores
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">
                  ¿Usted ha enviado mensajes escritos a casa del alumno?
                </span>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="mensajes"
                      className="accent-green-600"
                    />
                    <span className="text-xs font-bold text-green-600">Sí</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="mensajes"
                      className="accent-red-600"
                    />
                    <span className="text-xs font-bold text-red-600">No</span>
                  </label>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">
                  ¿Ha recibido respuesta de los padres/tutores?
                </span>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="respuesta"
                      className="accent-green-600"
                    />
                    <span className="text-xs font-bold text-green-600">Sí</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="respuesta"
                      className="accent-red-600"
                    />
                    <span className="text-xs font-bold text-red-600">No</span>
                  </label>
                </div>
              </div>
              <textarea
                className="w-full p-3 border border-gray-200 rounded-lg text-sm"
                rows={2}
                placeholder="Observaciones sobre la comunicación con familia..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
