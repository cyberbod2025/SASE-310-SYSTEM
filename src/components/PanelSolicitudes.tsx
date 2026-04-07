import React, { useState } from "react";
import { useApp } from "../store";
import { supabase } from "../supabase/client";
import toast from "react-hot-toast";
import { MiniCalendar } from "./widgets/MiniCalendar";
import { GlassCard } from "./ui/GlassCard";
import { GlassButton } from "./ui/GlassButton";
import { GlassInput } from "./ui/GlassInput";
import { GlassSelect } from "./ui/GlassSelect";
import { GlassTextarea } from "./ui/GlassTextarea";
import { motion, AnimatePresence } from "framer-motion";

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

const SECRETARIOS = [
  { id: "dulce", nombre: "Dulce", grado: "1º Grado", grados: ["1º A", "1º B"] },
  { id: "jorge", nombre: "Jorge", grado: "2º Grado", grados: ["2º A", "2º B"] },
  { id: "edgar", nombre: "Edgar", grado: "3º Grado", grados: ["3º A", "3º B"] },
  { id: "gaby", nombre: "Gabriela", rol: "Coordinación", grados: [] },
];

const getSecretarioByGroup = (group: string): string => {
  const sec = SECRETARIOS.find((s) => s.grados?.includes(group));
  return sec?.id || "gaby";
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
  const { students } = useApp();
  const [activeTab, setActiveTab] = useState<"solicitudes" | "comunicados" | "nuevo">("solicitudes");
  const [solicitudes, setSolicitudes] = useState<SolicitudDocumento[]>([]);
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);

  React.useEffect(() => {
    fetchSolicitudes();
    fetchComunicados();
  }, []);

  const fetchSolicitudes = async () => {
    const { data, error } = await supabase
      .from("solicitudes" as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
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

    if (!error) {
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

  const [newSolicitud, setNewSolicitud] = useState({
    tipo: "",
    descripcion: "",
    asignadoA: "",
    prioridad: "normal" as const,
    fechaLimite: "",
    alumnoId: "",
  });

  const handleSelectStudent = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    const secretarioId = student ? getSecretarioByGroup(student.group) : "";
    setNewSolicitud({
      ...newSolicitud,
      alumnoId: studentId,
      asignadoA: secretarioId,
    });
  };

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
      toast.error("Complete los campos obligatorios");
      return;
    }

    const secretario = SECRETARIOS.find((s) => s.id === newSolicitud.asignadoA);
    const alumno = students.find((s) => s.id === newSolicitud.alumnoId);

    try {
      const { error } = await supabase
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
        });

      if (error) throw error;

      fetchSolicitudes();
      setNewSolicitud({ tipo: "", descripcion: "", asignadoA: "", prioridad: "normal", fechaLimite: "", alumnoId: "" });
      setActiveTab("solicitudes");
      toast.success("Solicitud enviada a Control Escolar");
    } catch (err: any) {
      toast.error("Error institucional: " + err.message);
    }
  };

  const getPrioridadStyle = (prioridad: string) => {
    switch (prioridad) {
      case "urgente": return "bg-red-50 text-red-700 border-red-100";
      case "alta": return "bg-orange-50 text-orange-700 border-orange-100";
      case "normal": return "bg-blue-50 text-blue-700 border-blue-100";
      case "baja": return "bg-slate-50 text-slate-700 border-slate-100";
      default: return "bg-slate-50 text-slate-700";
    }
  };

  const getEstadoStyle = (estado: string) => {
    switch (estado) {
      case "completado": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "en_proceso": return "bg-amber-50 text-amber-700 border-amber-100";
      default: return "bg-slate-50 text-slate-500 border-slate-100";
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 min-h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <span className="material-icons text-blue-600 text-3xl">assignment_turned_in</span>
            Gestión Institucional
          </h2>
          <p className="text-slate-500 font-medium tracking-tight mt-1">
            Administración de solicitudes, trámites y comunicados oficiales.
          </p>
        </div>
      </div>

      {/* Tabs Institucionales */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
        {[
          { id: "solicitudes", label: "Solicitudes", icon: "description" },
          { id: "comunicados", label: "Comunicados", icon: "campaign" },
          { id: "nuevo", label: "Nueva Acción", icon: "add_circle_outline" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? "bg-white text-blue-600 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className="material-icons text-lg">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="flex-1 flex flex-col"
        >
          {activeTab === "solicitudes" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 flex flex-col gap-4">
                {solicitudes.length === 0 ? (
                  <GlassCard className="p-12 text-center border-slate-200">
                    <span className="material-icons text-slate-200 text-6xl mb-4">folder_open</span>
                    <p className="text-slate-400 font-medium tracking-tight">No se registran solicitudes pendientes en el sistema.</p>
                  </GlassCard>
                ) : (
                  solicitudes.map((sol) => (
                    <GlassCard key={sol.id} className="p-6 border border-slate-200 hover:border-blue-200 transition-all">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                         <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                               <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getPrioridadStyle(sol.prioridad)}`}>
                                 {sol.prioridad}
                               </span>
                               <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getEstadoStyle(sol.estado)}`}>
                                 {sol.estado.replace("_", " ")}
                               </span>
                            </div>
                            <h4 className="text-lg font-extrabold text-slate-800 mb-1 leading-tight">
                              {TIPOS_DOCUMENTO.find((t) => t.id === sol.tipo)?.label || sol.tipo}
                            </h4>
                            <p className="text-sm text-slate-500 font-medium mb-4">{sol.descripcion}</p>
                            {sol.alumnoNombre && (
                               <div className="flex items-center gap-2 bg-blue-50 w-fit px-3 py-1 rounded-full border border-blue-100">
                                  <span className="material-icons text-blue-600 text-[14px]">person</span>
                                  <span className="text-[10px] font-black text-blue-700 uppercase tracking-tight">{sol.alumnoNombre}</span>
                               </div>
                            )}
                         </div>
                         <div className="text-left md:text-right flex flex-col justify-between">
                            <div>
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Encargado/a</p>
                               <p className="text-sm font-bold text-slate-700">{sol.asignadoNombre}</p>
                            </div>
                            {sol.fechaLimite && (
                               <div className="mt-4 flex items-center gap-2 md:justify-end text-orange-600">
                                  <span className="material-icons text-sm">event</span>
                                  <span className="text-xs font-bold">{new Date(sol.fechaLimite).toLocaleDateString("es-MX", { dateStyle: "medium" })}</span>
                               </div>
                            )}
                         </div>
                      </div>
                    </GlassCard>
                  ))
                )}
              </div>
              <div className="lg:col-span-4 space-y-6">
                 <GlassCard className="p-6 border border-slate-200">
                    <MiniCalendar />
                 </GlassCard>
                 <GlassCard className="p-6 border border-slate-200 bg-slate-50/50">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Carga Operativa</h3>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                          <p className="text-3xl font-black text-blue-600 leading-none">{solicitudes.length}</p>
                          <p className="text-[8px] font-black text-slate-400 uppercase mt-2 tracking-widest">Registros</p>
                       </div>
                       <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                          <p className="text-3xl font-black text-orange-600 leading-none">{solicitudes.filter(s => s.estado === "pendiente").length}</p>
                          <p className="text-[8px] font-black text-slate-400 uppercase mt-2 tracking-widest">Pendientes</p>
                       </div>
                    </div>
                 </GlassCard>
              </div>
            </div>
          )}

          {activeTab === "nuevo" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <GlassCard className="p-8 border border-slate-200">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                        <span className="material-icons">description</span>
                     </div>
                     <div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Solicitud de Documento</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Control Escolar y Trámites</p>
                     </div>
                  </div>
                  <div className="space-y-6">
                     <div className="flex flex-col gap-2">
                        <GlassSelect
                          label="Documento Requerido *"
                          value={newSolicitud.tipo}
                          onChange={(e) => setNewSolicitud({ ...newSolicitud, tipo: e.target.value })}
                          options={[
                            { value: "", label: "Seleccionar trámite..." },
                            ...TIPOS_DOCUMENTO.map(t => ({ value: t.id, label: t.label }))
                          ]}
                        />
                     </div>
                     <div className="flex flex-col gap-2">
                        <GlassSelect
                          label="Secretario/a Responsable *"
                          value={newSolicitud.asignadoA}
                          onChange={(e) => setNewSolicitud({ ...newSolicitud, asignadoA: e.target.value })}
                          options={[
                            { value: "", label: "Seleccionar personal..." },
                            ...SECRETARIOS.filter(s => s.id !== "gaby").map(sec => ({ 
                              value: sec.id, 
                              label: `${sec.nombre} (${sec.grado || sec.rol})` 
                            }))
                          ]}
                        />
                     </div>
                     <div className="flex flex-col gap-2">
                        <GlassSelect
                          label="Alumno Relacionado (Opcional)"
                          value={newSolicitud.alumnoId}
                          onChange={(e) => handleSelectStudent(e.target.value)}
                          options={[
                            { value: "", label: "Ninguno específico" },
                            ...students.map(s => ({ value: s.id, label: `${s.name} - ${s.group}` }))
                          ]}
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <GlassSelect
                            label="Prioridad"
                            value={newSolicitud.prioridad}
                            onChange={(e) => setNewSolicitud({ ...newSolicitud, prioridad: e.target.value as any })}
                            options={[
                              { value: "baja", label: "Baja" },
                              { value: "normal", label: "Normal" },
                              { value: "alta", label: "Alta" },
                              { value: "urgente", label: "Urgente" }
                            ]}
                          />
                        </div>
                        <GlassInput label="Fecha Límite" type="date" value={newSolicitud.fechaLimite} onChange={(e) => setNewSolicitud({...newSolicitud, fechaLimite: e.target.value})} />
                     </div>
                     <div className="flex flex-col gap-2">
                        <GlassTextarea
                          label="Instrucciones Adicionales"
                          value={newSolicitud.descripcion}
                          onChange={(e) => setNewSolicitud({ ...newSolicitud, descripcion: e.target.value })}
                          placeholder="Especifique detalles del trámite..."
                        />
                     </div>
                     <GlassButton onClick={handleCreateSolicitud} className="w-full">Registrar Solicitud</GlassButton>
                  </div>
               </GlassCard>

               <GlassCard className="p-8 border border-slate-200 bg-slate-50/30">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                        <span className="material-icons">campaign</span>
                     </div>
                     <div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Comunicado Oficial</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Difusión Institucional</p>
                     </div>
                  </div>
                  <p className="text-slate-400 text-xs font-medium italic mb-6 leading-relaxed">
                    Utilice este módulo para enviar avisos, recordatorios o circulares a departamentos específicos del plantel escolar.
                  </p>
                  <GlassButton variant="outline" className="w-full">Próximamente: Integración con Email/SMS</GlassButton>
               </GlassCard>
            </div>
          )}

          {activeTab === "comunicados" && (
            <GlassCard className="p-12 text-center border-slate-200 border-dashed">
               <span className="material-icons text-slate-200 text-6xl mb-4">history</span>
               <h3 className="text-lg font-bold text-slate-400">Historial de Comunicados</h3>
               <p className="text-sm text-slate-300 mt-2">No se registran envíos masivos recientemente.</p>
            </GlassCard>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
