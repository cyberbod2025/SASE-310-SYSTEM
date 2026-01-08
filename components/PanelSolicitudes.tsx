import React, { useState } from "react";
import { useApp } from "../store";
import { UserRole } from "../types";

// Types for the solicitudes system
interface SolicitudDocumento {
  id: string;
  tipo: string;
  descripcion: string;
  asignadoA: string;
  asignadoNombre: string;
  prioridad: "baja" | "normal" | "alta" | "urgente";
  estado: "pendiente" | "en_proceso" | "completado" | "cancelado";
  fechaLimite?: string;
  alumnoNombre?: string;
  createdAt: string;
}

interface Comunicado {
  id: string;
  tipo: "evento" | "comunicado" | "recordatorio" | "urgente";
  titulo: string;
  descripcion: string;
  audiencia: string[];
  fechaEvento?: string;
  horaEvento?: string;
  createdAt: string;
}

// Mock data for demonstration
const MOCK_SOLICITUDES: SolicitudDocumento[] = [
  {
    id: "s1",
    tipo: "constancia_inasistencias",
    descripcion: "Constancia de inasistencias para alumno de 3º B",
    asignadoA: "dulce",
    asignadoNombre: "Dulce",
    prioridad: "alta",
    estado: "pendiente",
    fechaLimite: "2025-01-05",
    alumnoNombre: "Carlos Ruiz",
    createdAt: new Date().toISOString(),
  },
  {
    id: "s2",
    tipo: "dias_economicos",
    descripcion: "Solicitud de días económicos Prof. García",
    asignadoA: "gaby",
    asignadoNombre: "Gabriela",
    prioridad: "normal",
    estado: "en_proceso",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const SECRETARIOS = [
  { id: "dulce", nombre: "Dulce", grado: "1º Grado", grados: ["1º A", "1º B"] },
  { id: "jorge", nombre: "Jorge", grado: "2º Grado", grados: ["2º A", "2º B"] },
  { id: "edgar", nombre: "Edgar", grado: "3º Grado", grados: ["3º A", "3º B"] },
  { id: "gaby", nombre: "Gabriela", rol: "Coordinación", grados: [] },
];

// Helper to get secretary by student group
const getSecretarioByGroup = (group: string): string => {
  const sec = SECRETARIOS.find((s) => s.grados?.includes(group));
  return sec?.id || "gaby"; // Default to Gaby if not found
};

const TIPOS_DOCUMENTO = [
  { id: "constancia_inasistencias", label: "Constancia de Inasistencias" },
  { id: "dias_economicos", label: "Días Económicos" },
  { id: "constancia_laboral", label: "Constancia Laboral" },
  { id: "oficio_comision", label: "Oficio de Comisión" },
  { id: "boleta_calificaciones", label: "Boleta de Calificaciones" },
  { id: "historial_academico", label: "Historial Académico" },
  { id: "otro", label: "Otro Documento" },
];

export const PanelSolicitudes: React.FC = () => {
  const { students, currentUserRole } = useApp();
  const [activeTab, setActiveTab] = useState<
    "solicitudes" | "comunicados" | "nuevo"
  >("solicitudes");
  const [solicitudes, setSolicitudes] =
    useState<SolicitudDocumento[]>(MOCK_SOLICITUDES);
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);

  // Form state for new solicitud
  const [newSolicitud, setNewSolicitud] = useState({
    tipo: "",
    descripcion: "",
    asignadoA: "",
    prioridad: "normal" as const,
    fechaLimite: "",
    alumnoId: "",
  });

  // When student is selected, auto-assign secretary
  const handleSelectStudent = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    const secretarioId = student ? getSecretarioByGroup(student.group) : "";
    setNewSolicitud({
      ...newSolicitud,
      alumnoId: studentId,
      asignadoA: secretarioId,
    });
  };

  // Get selected student and secretary info
  const selectedStudent = students.find((s) => s.id === newSolicitud.alumnoId);
  const selectedSecretario = SECRETARIOS.find(
    (s) => s.id === newSolicitud.asignadoA
  );

  // Form state for new comunicado
  const [newComunicado, setNewComunicado] = useState({
    tipo: "comunicado" as const,
    titulo: "",
    descripcion: "",
    audiencia: [] as string[],
    fechaEvento: "",
    horaEvento: "",
  });

  const handleCreateSolicitud = () => {
    if (!newSolicitud.tipo || !newSolicitud.asignadoA) {
      alert("Por favor complete los campos requeridos.");
      return;
    }

    const secretario = SECRETARIOS.find((s) => s.id === newSolicitud.asignadoA);
    const alumno = students.find((s) => s.id === newSolicitud.alumnoId);

    // Build list of recipients (always include Gaby as CC)
    const recipients = [secretario?.nombre];
    if (secretario?.id !== "gaby") {
      recipients.push("Gabriela (CC)");
    }

    const nueva: SolicitudDocumento = {
      id: `s${Date.now()}`,
      tipo: newSolicitud.tipo,
      descripcion: newSolicitud.descripcion,
      asignadoA: newSolicitud.asignadoA,
      asignadoNombre: secretario?.nombre || "",
      prioridad: newSolicitud.prioridad,
      estado: "pendiente",
      fechaLimite: newSolicitud.fechaLimite || undefined,
      alumnoNombre: alumno?.name,
      createdAt: new Date().toISOString(),
    };

    setSolicitudes([nueva, ...solicitudes]);
    setNewSolicitud({
      tipo: "",
      descripcion: "",
      asignadoA: "",
      prioridad: "normal",
      fechaLimite: "",
      alumnoId: "",
    });
    setActiveTab("solicitudes");
    alert(`Solicitud enviada a: ${recipients.filter(Boolean).join(", ")}`);
  };

  const handleCreateComunicado = () => {
    if (!newComunicado.titulo || newComunicado.audiencia.length === 0) {
      alert("Por favor complete título y seleccione audiencia.");
      return;
    }

    const nuevo: Comunicado = {
      id: `c${Date.now()}`,
      ...newComunicado,
      createdAt: new Date().toISOString(),
    };

    setComunicados([nuevo, ...comunicados]);
    setNewComunicado({
      tipo: "comunicado",
      titulo: "",
      descripcion: "",
      audiencia: [],
      fechaEvento: "",
      horaEvento: "",
    });
    alert(`Comunicado enviado a: ${newComunicado.audiencia.join(", ")}`);
  };

  const getPrioridadStyle = (prioridad: string) => {
    switch (prioridad) {
      case "urgente":
        return "bg-red-100 text-red-800 border-red-200";
      case "alta":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "normal":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "baja":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEstadoStyle = (estado: string) => {
    switch (estado) {
      case "completado":
        return "bg-green-100 text-green-800";
      case "en_proceso":
        return "bg-yellow-100 text-yellow-800";
      case "cancelado":
        return "bg-gray-100 text-gray-500";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const toggleAudiencia = (role: string) => {
    setNewComunicado((prev) => ({
      ...prev,
      audiencia: prev.audiencia.includes(role)
        ? prev.audiencia.filter((r) => r !== role)
        : [...prev.audiencia, role],
    }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              assignment
            </span>
            Centro de Solicitudes
            <span className="ml-3 px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200">
              Turno Vespertino | CCT 09DES4310M
            </span>
          </h1>
          <p className="text-gray-600">
            Gestión de documentos y comunicados institucionales
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border-color">
        <button
          onClick={() => setActiveTab("solicitudes")}
          className={`px-4 py-3 font-bold text-sm border-b-2 transition-colors ${
            activeTab === "solicitudes"
              ? "border-primary text-primary"
              : "border-transparent text-text-secondary hover:text-text-main"
          }`}
        >
          <span className="material-symbols-outlined text-lg align-middle mr-1">
            description
          </span>
          Solicitudes ({solicitudes.length})
        </button>
        <button
          onClick={() => setActiveTab("comunicados")}
          className={`px-4 py-3 font-bold text-sm border-b-2 transition-colors ${
            activeTab === "comunicados"
              ? "border-primary text-primary"
              : "border-transparent text-text-secondary hover:text-text-main"
          }`}
        >
          <span className="material-symbols-outlined text-lg align-middle mr-1">
            campaign
          </span>
          Comunicados ({comunicados.length})
        </button>
        <button
          onClick={() => setActiveTab("nuevo")}
          className={`px-4 py-3 font-bold text-sm border-b-2 transition-colors ${
            activeTab === "nuevo"
              ? "border-primary text-primary"
              : "border-transparent text-text-secondary hover:text-text-main"
          }`}
        >
          <span className="material-symbols-outlined text-lg align-middle mr-1">
            add_circle
          </span>
          Crear Nuevo
        </button>
      </div>

      {/* Solicitudes Tab */}
      {activeTab === "solicitudes" && (
        <div className="bg-white rounded-xl border border-border-color shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border-color bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-lg">Solicitudes de Documentos</h3>
            <button
              onClick={() => setActiveTab("nuevo")}
              className="text-primary text-sm font-bold hover:underline"
            >
              + Nueva Solicitud
            </button>
          </div>

          {solicitudes.length === 0 ? (
            <div className="p-10 text-center text-text-secondary">
              No hay solicitudes pendientes.
            </div>
          ) : (
            <div className="divide-y divide-border-color">
              {solicitudes.map((sol) => (
                <div
                  key={sol.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getPrioridadStyle(
                            sol.prioridad
                          )}`}
                        >
                          {sol.prioridad}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${getEstadoStyle(
                            sol.estado
                          )}`}
                        >
                          {sol.estado.replace("_", " ")}
                        </span>
                      </div>
                      <p className="font-bold text-text-main">
                        {TIPOS_DOCUMENTO.find((t) => t.id === sol.tipo)
                          ?.label || sol.tipo}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {sol.descripcion}
                      </p>
                      {sol.alumnoNombre && (
                        <p className="text-xs text-blue-600 mt-1">
                          <span className="material-symbols-outlined text-xs align-middle">
                            person
                          </span>{" "}
                          {sol.alumnoNombre}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-text-main">
                        Asignado a: {sol.asignadoNombre}
                      </p>
                      {sol.fechaLimite && (
                        <p className="text-xs text-text-secondary">
                          Límite:{" "}
                          {new Date(sol.fechaLimite).toLocaleDateString(
                            "es-MX"
                          )}
                        </p>
                      )}
                      <p className="text-[10px] text-gray-400 mt-1">
                        {new Date(sol.createdAt).toLocaleDateString("es-MX")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Comunicados Tab */}
      {activeTab === "comunicados" && (
        <div className="bg-white rounded-xl border border-border-color shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border-color bg-gray-50">
            <h3 className="font-bold text-lg">Comunicados Enviados</h3>
          </div>

          {comunicados.length === 0 ? (
            <div className="p-10 text-center text-text-secondary">
              <span className="material-symbols-outlined text-4xl mb-2">
                campaign
              </span>
              <p>No hay comunicados enviados.</p>
              <button
                onClick={() => setActiveTab("nuevo")}
                className="mt-4 text-primary font-bold text-sm hover:underline"
              >
                Crear primer comunicado
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border-color">
              {comunicados.map((com) => (
                <div key={com.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        com.tipo === "urgente"
                          ? "bg-red-100 text-red-600"
                          : com.tipo === "evento"
                          ? "bg-purple-100 text-purple-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      <span className="material-symbols-outlined">
                        {com.tipo === "evento"
                          ? "event"
                          : com.tipo === "urgente"
                          ? "priority_high"
                          : "campaign"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-text-main">{com.titulo}</p>
                      <p className="text-sm text-text-secondary">
                        {com.descripcion}
                      </p>
                      <p className="text-xs text-primary mt-1">
                        Enviado a: {com.audiencia.join(", ")}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(com.createdAt).toLocaleDateString("es-MX")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Nuevo Tab - Forms */}
      {activeTab === "nuevo" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Nueva Solicitud de Documento */}
          <div className="bg-white rounded-xl border border-border-color shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border-color bg-gray-50">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  description
                </span>
                Solicitar Documento
              </h3>
              <p className="text-xs text-text-secondary">
                Asignar a secretario
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                  Tipo de Documento *
                </label>
                <select
                  value={newSolicitud.tipo}
                  onChange={(e) =>
                    setNewSolicitud({ ...newSolicitud, tipo: e.target.value })
                  }
                  className="w-full p-2 border border-border-color rounded-lg text-sm text-gray-900 bg-white"
                >
                  <option value="">Seleccionar...</option>
                  {TIPOS_DOCUMENTO.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                  Asignar a *
                </label>
                <select
                  value={newSolicitud.asignadoA}
                  onChange={(e) =>
                    setNewSolicitud({
                      ...newSolicitud,
                      asignadoA: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-border-color rounded-lg text-sm"
                >
                  <option value="">Seleccionar secretario...</option>
                  {SECRETARIOS.filter((s) => s.id !== "gaby").map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.nombre} ({sec.grado || sec.rol})
                    </option>
                  ))}
                </select>
                {newSolicitud.asignadoA &&
                  newSolicitud.asignadoA !== "gaby" && (
                    <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">
                        mail
                      </span>
                      CC: Gabriela (Coordinación) será notificada
                    </p>
                  )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                  Alumno (si aplica)
                </label>
                <select
                  value={newSolicitud.alumnoId}
                  onChange={(e) => handleSelectStudent(e.target.value)}
                  className="w-full p-2 border border-border-color rounded-lg text-sm text-gray-900 bg-white"
                >
                  <option value="">Sin alumno específico</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} - {s.group}
                    </option>
                  ))}
                </select>
                {selectedStudent && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">
                      check_circle
                    </span>
                    Secretario asignado automáticamente:{" "}
                    {selectedSecretario?.nombre}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                    Prioridad
                  </label>
                  <select
                    value={newSolicitud.prioridad}
                    onChange={(e) =>
                      setNewSolicitud({
                        ...newSolicitud,
                        prioridad: e.target.value as any,
                      })
                    }
                    className="w-full p-2 border border-border-color rounded-lg text-sm text-gray-900 bg-white"
                  >
                    <option value="baja">Baja</option>
                    <option value="normal">Normal</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                    Fecha Límite
                  </label>
                  <input
                    type="date"
                    value={newSolicitud.fechaLimite}
                    onChange={(e) =>
                      setNewSolicitud({
                        ...newSolicitud,
                        fechaLimite: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-border-color rounded-lg text-sm text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                  Descripción
                </label>
                <textarea
                  value={newSolicitud.descripcion}
                  onChange={(e) =>
                    setNewSolicitud({
                      ...newSolicitud,
                      descripcion: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full p-2 border border-border-color rounded-lg text-sm resize-none text-gray-900 bg-white"
                  placeholder="Detalles adicionales..."
                />
              </div>

              <button
                onClick={handleCreateSolicitud}
                className="w-full py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-hover transition-colors"
              >
                Enviar Solicitud
              </button>
            </div>
          </div>

          {/* Nuevo Comunicado */}
          <div className="bg-white rounded-xl border border-border-color shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border-color bg-gray-50">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-600">
                  campaign
                </span>
                Crear Comunicado
              </h3>
              <p className="text-xs text-text-secondary">
                Enviar a personal seleccionado
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                  Tipo *
                </label>
                <select
                  value={newComunicado.tipo}
                  onChange={(e) =>
                    setNewComunicado({
                      ...newComunicado,
                      tipo: e.target.value as any,
                    })
                  }
                  className="w-full p-2 border border-border-color rounded-lg text-sm text-gray-900 bg-white"
                >
                  <option value="comunicado">Comunicado General</option>
                  <option value="evento">Evento</option>
                  <option value="recordatorio">Recordatorio</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={newComunicado.titulo}
                  onChange={(e) =>
                    setNewComunicado({
                      ...newComunicado,
                      titulo: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-border-color rounded-lg text-sm text-gray-900 bg-white"
                  placeholder="Asunto del comunicado..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                  Audiencia *
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "docente", label: "Docentes" },
                    { id: "prefectura", label: "Prefectura" },
                    { id: "orientacion", label: "Orientación" },
                    { id: "secretaria", label: "Secretaría" },
                    { id: "todos", label: "Todo el Personal" },
                  ].map((role) => (
                    <button
                      key={role.id}
                      onClick={() => toggleAudiencia(role.id)}
                      className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                        newComunicado.audiencia.includes(role.id)
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-text-secondary border-border-color hover:border-primary"
                      }`}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>

              {newComunicado.tipo === "evento" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                      Fecha del Evento
                    </label>
                    <input
                      type="date"
                      value={newComunicado.fechaEvento}
                      onChange={(e) =>
                        setNewComunicado({
                          ...newComunicado,
                          fechaEvento: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-border-color rounded-lg text-sm text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                      Hora
                    </label>
                    <input
                      type="time"
                      value={newComunicado.horaEvento}
                      onChange={(e) =>
                        setNewComunicado({
                          ...newComunicado,
                          horaEvento: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-border-color rounded-lg text-sm text-gray-900 bg-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                  Mensaje
                </label>
                <textarea
                  value={newComunicado.descripcion}
                  onChange={(e) =>
                    setNewComunicado({
                      ...newComunicado,
                      descripcion: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full p-2 border border-border-color rounded-lg text-sm resize-none text-gray-900 bg-white"
                  placeholder="Contenido del comunicado..."
                />
              </div>

              <button
                onClick={handleCreateComunicado}
                className="w-full py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors"
              >
                Enviar Comunicado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
