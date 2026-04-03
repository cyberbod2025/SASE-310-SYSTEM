import React, { useState } from "react";
import { useApp } from "../store";
import { UserRole } from "../types";
import { supabase } from "../supabase/client";
import toast from "react-hot-toast";
import { MiniCalendar } from "./widgets/MiniCalendar";

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
// Initial state empty
const MOCK_SOLICITUDES: SolicitudDocumento[] = [];

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
  const [solicitudes, setSolicitudes] = useState<SolicitudDocumento[]>([]);
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);

  // Fetch data on mount
  React.useEffect(() => {
    fetchSolicitudes();
    fetchComunicados();
  }, []);

  const fetchSolicitudes = async () => {
    const { data, error } = await supabase
      .from("solicitudes" as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching solicitudes:", error);
    } else {
      // Map DB structure to internal type if needed, but names match mostly
      // Adjust snake_case to camelCase mapping
      const mapped = (data || []).map((d: any) => ({
        id: d.id,
        tipo: d.tipo,
        descripcion: d.descripcion,
        asignadoA: d.asignado_a,
        asignadoNombre: d.asignado_nombre,
        prioridad: d.prioridad,
        estado: d.estado,
        fechaLimite: d.fecha_limite,
        alumnoNombre: d.alumno_nombre,
        createdAt: d.created_at,
      }));
      setSolicitudes(mapped);
    }
  };

  const fetchComunicados = async () => {
    const { data, error } = await supabase
      .from("comunicados" as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching comunicados:", error);
    } else {
      const mapped = (data || []).map((d: any) => ({
        id: d.id,
        tipo: d.tipo,
        titulo: d.titulo,
        descripcion: d.descripcion,
        audiencia: d.audiencia || [],
        fechaEvento: d.fecha_evento,
        horaEvento: d.hora_evento,
        createdAt: d.created_at,
      }));
      setComunicados(mapped);
    }
  };

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
    (s) => s.id === newSolicitud.asignadoA,
  );

  const [newComunicado, setNewComunicado] = useState<{
    tipo: "evento" | "comunicado" | "recordatorio" | "urgente";
    titulo: string;
    descripcion: string;
    audiencia: string[];
    fechaEvento: string;
    horaEvento: string;
  }>({
    tipo: "comunicado",
    titulo: "",
    descripcion: "",
    audiencia: [] as string[],
    fechaEvento: "",
    horaEvento: "",
  });

  const handleCreateSolicitud = async () => {
    if (!newSolicitud.tipo || !newSolicitud.asignadoA) {
      toast.error("Por favor complete los campos requeridos.");
      return;
    }

    const secretario = SECRETARIOS.find((s) => s.id === newSolicitud.asignadoA);
    const alumno = students.find((s) => s.id === newSolicitud.alumnoId);

    // Build list of recipients (always include Gaby as CC)
    const recipients = [secretario?.nombre];
    if (secretario?.id !== "gaby") {
      recipients.push("Gabriela (CC)");
    }

    try {
      const { data, error } = await supabase
        .from("solicitudes" as any)
        .insert({
          tipo: newSolicitud.tipo,
          descripcion: newSolicitud.descripcion,
          asignado_a: newSolicitud.asignadoA,
          asignado_nombre: secretario?.nombre || "",
          prioridad: newSolicitud.prioridad,
          estado: "pendiente",
          fecha_limite: newSolicitud.fechaLimite || null,
          alumno_id: alumno?.id || null,
          alumno_nombre: alumno?.name || null,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state by refetching or appending logic
      fetchSolicitudes();

      setNewSolicitud({
        tipo: "",
        descripcion: "",
        asignadoA: "",
        prioridad: "normal",
        fechaLimite: "",
        alumnoId: "",
      });
      setActiveTab("solicitudes");
      toast.success(
        `Solicitud enviada a: ${recipients.filter(Boolean).join(", ")}`,
      );
    } catch (err: any) {
      console.error("Error creating solicitud:", err);
      toast.error("Error al crear la solicitud: " + err.message);
    }
  };

  const handleCreateComunicado = async () => {
    if (!newComunicado.titulo || newComunicado.audiencia.length === 0) {
      toast.error("Por favor complete título y seleccione audiencia.");
      return;
    }

    try {
      const { error } = await supabase.from("comunicados" as any).insert({
        tipo: newComunicado.tipo,
        titulo: newComunicado.titulo,
        descripcion: newComunicado.descripcion,
        audiencia: newComunicado.audiencia,
        fecha_evento: newComunicado.fechaEvento || null,
        hora_evento: newComunicado.horaEvento || null,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      });

      if (error) throw error;

      fetchComunicados();

      setNewComunicado({
        tipo: "comunicado",
        titulo: "",
        descripcion: "",
        audiencia: [],
        fechaEvento: "",
        horaEvento: "",
      });
      toast.success(
        `Comunicado enviado a: ${newComunicado.audiencia.join(", ")}`,
      );
    } catch (err: any) {
      console.error("Error creating comunicado:", err);
      toast.error("Error al crear comunicado: " + err.message);
    }
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
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <span className="material-icons text-blue-600 text-3xl">
              assignment
            </span>
            Panel de Solicitudes
            <span className="ml-3 px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-widest border border-blue-200">
              Turno Vespertino
            </span>
          </h2>
          <p className="text-slate-500 font-bold text-sm mt-1">
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
          <span className="material-icons text-lg align-middle mr-1">
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
          <span className="material-icons text-lg align-middle mr-1">
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
          <span className="material-icons text-lg align-middle mr-1">
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
              className="px-4 py-2 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-black/5 shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <span className="material-icons text-sm">
                add_circle
              </span>
              Nueva Solicitud
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 divide-y divide-border-color">
              {solicitudes.length === 0 ? (
                <div className="p-10 text-center text-text-secondary">
                  No hay solicitudes pendientes.
                </div>
              ) : (
                solicitudes.map((sol) => (
                  <div
                    key={sol.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest ${getPrioridadStyle(
                              sol.prioridad,
                            )}`}
                          >
                            {sol.prioridad}
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest ${getEstadoStyle(
                              sol.estado,
                            )}`}
                          >
                            {sol.estado.replace("_", " ")}
                          </span>
                        </div>
                        <p className="font-bold text-slate-800">
                          {TIPOS_DOCUMENTO.find((t) => t.id === sol.tipo)
                            ?.label || sol.tipo}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          {sol.descripcion}
                        </p>
                        {sol.alumnoNombre && (
                          <p className="text-xs text-blue-600 mt-2 font-bold flex items-center gap-1">
                            <span className="material-icons text-sm">
                              person
                            </span>{" "}
                            {sol.alumnoNombre}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                          Asignado
                        </p>
                        <p className="text-sm font-bold text-slate-700">
                          {sol.asignadoNombre}
                        </p>
                        {sol.fechaLimite && (
                          <div className="mt-3 inline-flex items-center gap-1 px-2 py-1 bg-amber-50 rounded-2xl border border-amber-100">
                            <span className="material-icons text-[14px] text-amber-600">
                              event
                            </span>
                            <p className="text-[10px] font-bold text-amber-700">
                              {new Date(sol.fechaLimite).toLocaleDateString(
                                "es-MX",
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="lg:col-span-4 p-6 bg-slate-50 border-l border-slate-100">
              <MiniCalendar />
              <div className="mt-6 space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Resumen de Carga
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <p className="text-2xl font-black text-blue-600">
                      {solicitudes.length}
                    </p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">
                      Totales
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <p className="text-2xl font-black text-amber-600">
                      {
                        solicitudes.filter((s) => s.estado === "pendiente")
                          .length
                      }
                    </p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">
                      Pendientes
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
              <span className="material-icons text-4xl mb-2">
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
                      className={`p-2 rounded-2xl ${
                        com.tipo === "urgente"
                          ? "bg-red-100 text-red-600"
                          : com.tipo === "evento"
                            ? "bg-purple-100 text-purple-600"
                            : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      <span className="material-icons">
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
                <span className="material-icons text-primary">
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
                  className="w-full p-2 border border-border-color rounded-2xl text-sm text-gray-900 bg-white"
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
                  className="w-full p-2 border border-border-color rounded-2xl text-sm text-gray-900 bg-white"
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
                      <span className="material-icons text-xs">
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
                  className="w-full p-2 border border-border-color rounded-2xl text-sm text-gray-900 bg-white"
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
                    <span className="material-icons text-xs">
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
                    className="w-full p-2 border border-border-color rounded-2xl text-sm text-gray-900 bg-white"
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
                    className="w-full p-2 border border-border-color rounded-2xl text-sm text-gray-900 bg-white"
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
                  className="w-full p-2 border border-border-color rounded-2xl text-sm resize-none text-gray-900 bg-white"
                  placeholder="Detalles adicionales..."
                />
              </div>

              <button
                onClick={handleCreateSolicitud}
                className="w-full py-2 bg-primary text-white rounded-2xl font-bold hover:bg-primary-hover transition-colors"
              >
                Enviar Solicitud
              </button>
            </div>
          </div>

          {/* Nuevo Comunicado */}
          <div className="bg-white rounded-xl border border-border-color shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border-color bg-gray-50">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <span className="material-icons text-purple-600">
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
                  className="w-full p-2 border border-border-color rounded-2xl text-sm text-gray-900 bg-white"
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
                  className="w-full p-2 border border-border-color rounded-2xl text-sm text-gray-900 bg-white"
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
                      className="w-full p-2 border border-border-color rounded-2xl text-sm text-gray-900 bg-white"
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
                      className="w-full p-2 border border-border-color rounded-2xl text-sm text-gray-900 bg-white"
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
                  className="w-full p-2 border border-border-color rounded-2xl text-sm resize-none text-gray-900 bg-white"
                  placeholder="Contenido del comunicado..."
                />
              </div>

              <button
                onClick={handleCreateComunicado}
                className="w-full py-2 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-colors"
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
