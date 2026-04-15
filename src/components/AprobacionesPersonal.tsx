import React, { useState, useEffect } from "react";
import { supabase } from "../supabase/client";
import toast from "react-hot-toast";
import { GlassCard } from "./ui/GlassCard";
import { GlassButton } from "./ui/GlassButton";
import { GlassInput } from "./ui/GlassInput";
import { GlassTextarea } from "./ui/GlassTextarea";
import { motion, AnimatePresence } from "framer-motion";

interface Solicitud {
  id: string;
  created_at: string;
  matricula_sase?: string;
  rol_solicitado: string[];
  turno: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  curp: string;
  correo_institucional: string;
  telefono: string | null;
  materias: string[] | null;
  grupos: string[] | null;
  es_tutor: boolean;
  grupo_tutor: string | null;
  area_cobertura: string | null;
  observaciones: string | null;
  estado: "PENDIENTE" | "APROBADA" | "RECHAZADA" | "OBSERVACIONES";
  observaciones_validacion: string | null;
  metadata?: { cct?: string; folio_solicitud?: string; };
}

const normalizeSolicitudRole = (role: string) => {
  const normalized = role.trim().toLowerCase();
  const aliases: Record<string, string> = {
    direccion: "directivo",
    directivo: "directivo",
    enfermeria: "medico_escolar",
    medico_escolar: "medico_escolar",
    promotora: "promotora_lectura",
  };

  return aliases[normalized] || normalized;
};

const sanitizeStringList = (values: string[], uppercase = false) => {
  const sanitized = values
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => uppercase ? value.toUpperCase() : value);
  return [...new Set(sanitized)];
};

export const AprobacionesPersonal: React.FC = () => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState<string | null>(null);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<Solicitud | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [assignmentData, setAssignmentData] = useState({ grupos: [] as string[], materias: [] as string[], es_tutor: false, grupo_tutor: "", matricula_sase: "" });

  useEffect(() => { cargarSolicitudes(); }, []);

  const generarMatricula = (rol: string) => {
    const year = new Date().getFullYear().toString().slice(-2);
    const canonicalRole = normalizeSolicitudRole(rol);
    const rolePrefix = {
      docente: "DOC",
      docente_tutor: "DOC",
      prefectura: "PRE",
      orientacion: "ORI",
      trabajo_social: "SOC",
      medico_escolar: "MED",
      udeii: "UDE",
      secretaria: "SEC",
      directivo: "DIR",
      subdireccion: "SUB",
    }[canonicalRole] || "PER";
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    return `SASE-${year}-${rolePrefix}-${randomSuffix}`;
  };

  useEffect(() => {
    if (solicitudSeleccionada) {
      const rolPrincipal = solicitudSeleccionada.rol_solicitado[0];
      setAssignmentData({
        grupos: solicitudSeleccionada.grupos || [], materias: solicitudSeleccionada.materias || [],
        es_tutor: solicitudSeleccionada.es_tutor || false, grupo_tutor: solicitudSeleccionada.grupo_tutor || "",
        matricula_sase: solicitudSeleccionada.matricula_sase || generarMatricula(rolPrincipal),
      });
    }
  }, [solicitudSeleccionada]);

  const cargarSolicitudes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("solicitudes_alta_personal").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setSolicitudes((data as unknown as Solicitud[]) || []);
    } finally {
      setLoading(false);
    }
  };

  const aprobarSolicitud = async (solicitud: Solicitud) => {
    if (!assignmentData.matricula_sase) return toast.error("Matrícula requerida");
    setProcesando(solicitud.id);
    try {
      const { data, error } = await supabase.functions.invoke("approve-staff", {
        body: {
          solicitudId: solicitud.id,
          matricula_sase: assignmentData.matricula_sase.trim().toUpperCase(),
          grupos: sanitizeStringList(assignmentData.grupos, true),
          materias: sanitizeStringList(assignmentData.materias),
          es_tutor: assignmentData.es_tutor,
          grupo_tutor: assignmentData.es_tutor
            ? assignmentData.grupo_tutor.trim().toUpperCase()
            : null,
        },
      });

      if (error) {
        throw new Error(error.message || "No se pudo aprobar la solicitud");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast.success(
        data?.alreadyExisted
          ? "Personal vinculado y activado con éxito"
          : "Personal activado con éxito",
      );
      await cargarSolicitudes();
      setSolicitudSeleccionada(null);
    } catch (err: any) {
      toast.error(err?.message || "Error al procesar alta");
    } finally {
      setProcesando(null);
    }
  };

  const rechazarSolicitud = async (solicitud: Solicitud) => {
    if (!motivoRechazo.trim()) return toast.error("Motivo de rechazo requerido");
    setProcesando(solicitud.id);
    try {
      const { error } = await supabase
        .from("solicitudes_alta_personal")
        .update({ estado: "RECHAZADA", observaciones_validacion: motivoRechazo.trim() })
        .eq("id", solicitud.id);
      if (error) throw error;
      toast.success("Solicitud rechazada");
      await cargarSolicitudes();
      setSolicitudSeleccionada(null);
      setMotivoRechazo("");
    } catch (err: any) {
      toast.error(err?.message || "No se pudo rechazar la solicitud");
    } finally {
      setProcesando(null);
    }
  };

  const pendientes = solicitudes.filter(s => s.estado === "PENDIENTE");
  const aprobadas = solicitudes.filter(s => s.estado === "APROBADA");
  const rechazadas = solicitudes.filter(s => s.estado === "RECHAZADA");

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 animate-fade-in flex flex-col min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3 uppercase italic">
             <span className="material-icons text-blue-300 text-3xl">verified_user</span>
             Validación de Personal
           </h1>
          <p className="text-slate-300 font-medium tracking-tight mt-1">Gestión estratégica de credenciales y accesos institucionales SASE-310.</p>
        </div>
        <GlassButton variant="outline" onClick={cargarSolicitudes} loading={loading}>Sincronizar Solicitudes</GlassButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <StatCard label="Pendientes de Revisión" value={pendientes.length} color="text-amber-300" bg="bg-amber-500/10" border="border-amber-400/20" />
         <StatCard label="Altas Autorizadas" value={aprobadas.length} color="text-emerald-300" bg="bg-emerald-500/10" border="border-emerald-400/20" />
         <StatCard label="Registros Denegados" value={rechazadas.length} color="text-rose-300" bg="bg-rose-500/10" border="border-rose-400/20" />
      </div>

      <div className="space-y-6 flex-1">
         <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-4 flex items-center gap-4">
            Bandeja de Validación
            <div className="flex-1 h-px bg-slate-100"></div>
         </h3>

         {pendientes.length === 0 ? (
           <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 py-32 grayscale">
              <span className="material-icons text-7xl mb-4">how_to_reg</span>
              <p className="text-xs font-black uppercase tracking-[0.3em]">Sin personal pendiente de alta</p>
           </div>
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendientes.map(sol => (
                <motion.div key={sol.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                   <GlassCard hover onClick={() => setSolicitudSeleccionada(sol)} className="p-8 border-white/10 !bg-white/5 group cursor-pointer h-full flex flex-col justify-between">
                      <div className="space-y-6">
                         <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center text-blue-300 transition-transform group-hover:scale-110 shadow-sm">
                               <span className="material-icons text-xl">person</span>
                            </div>
                            <div>
                               <h4 className="text-sm font-black text-white uppercase italic tracking-tight truncate max-w-[180px]">{sol.nombres} {sol.apellido_paterno}</h4>
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{sol.created_at.split('T')[0]}</p>
                            </div>
                         </div>
                         <div className="flex flex-wrap gap-2">
                            {sol.rol_solicitado.map(rol => <span key={rol} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[8px] font-black text-slate-300 uppercase tracking-widest">{rol}</span>)}
                            <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-400/20 rounded text-[8px] font-black text-blue-300 uppercase tracking-widest">{sol.turno}</span>
                         </div>
                      </div>
                      <div className="pt-8 flex items-center justify-between text-blue-600">
                         <span className="text-[10px] font-black uppercase tracking-widest">Ver Expediente</span>
                         <span className="material-icons text-sm">arrow_forward</span>
                      </div>
                   </GlassCard>
                </motion.div>
              ))}
           </div>
         )}
      </div>

      <AnimatePresence>
         {solicitudSeleccionada && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-slate-900/60 backdrop-blur-xl">
                <GlassCard className="w-full max-w-5xl h-[85vh] p-0 !bg-[#0B1120]/85 border-white/10 shadow-2xl overflow-hidden flex flex-col">
                   <div className="p-8 border-b border-white/10 bg-white/5 flex justify-between items-center shrink-0">
                     <div className="flex items-center gap-4">
                        <div className="size-14 rounded-3xl bg-blue-600 text-white flex items-center justify-center shadow-lg">
                           <span className="material-icons text-3xl">assignment_ind</span>
                        </div>
                        <div>
                           <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Validación de Expediente</h3>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocolo de Alta Nivel Direccion • SASE-310</p>
                        </div>
                     </div>
                     <button onClick={() => setSolicitudSeleccionada(null)}><span className="material-icons text-slate-400">close</span></button>
                  </div>
                  
                  <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                     <div className="flex-1 p-8 overflow-y-auto custom-scrollbar space-y-10">
                        <Section title="Información Civil" icon="badge">
                           <div className="grid grid-cols-2 gap-6 bg-white/5 p-6 rounded-3xl border border-white/10">
                              <DataField label="Nombres" value={solicitudSeleccionada.nombres} />
                              <DataField label="Apellidos" value={`${solicitudSeleccionada.apellido_paterno} ${solicitudSeleccionada.apellido_materno}`} />
                              <DataField label="CURP" value={solicitudSeleccionada.curp} />
                              <DataField label="Correo" value={solicitudSeleccionada.correo_institucional} />
                           </div>
                        </Section>

                        <Section title="Estatus y Observaciones" icon="notes">
                           <p className="text-xs text-slate-200 font-medium leading-relaxed italic bg-amber-500/10 p-6 rounded-3xl border border-amber-400/20">
                              "{solicitudSeleccionada.observaciones || "Sin comentarios adicionales por parte del solicitante."}"
                           </p>
                        </Section>

                        <div className="pt-10 border-t border-slate-100 space-y-6">
                           <label className="text-[11px] font-black text-rose-300 uppercase tracking-[0.4em] flex items-center gap-4">Rechazo Consular <div className="flex-1 h-px bg-rose-400/20"></div></label>
                           <GlassTextarea 
                              placeholder="Especifique el motivo de la cancelación del alta..." 
                              value={motivoRechazo} 
                              onChange={e => setMotivoRechazo(e.target.value)} 
                               className="bg-rose-500/5 border-rose-400/20 focus:border-rose-400"
                             />
                           <GlassButton variant="outline" className="w-full h-14 border-rose-400/20 text-rose-300 hover:bg-rose-500/10" onClick={() => rechazarSolicitud(solicitudSeleccionada)}>Ejecutar Rechazo Permanente</GlassButton>
                        </div>
                     </div>

                      <div className="w-full md:w-[400px] bg-white/5 border-l border-white/10 p-8 flex flex-col gap-8 shrink-0">
                        <Section title="Configuración SASE" icon="settings_suggest" color="text-blue-600">
                           <div className="space-y-6">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Matrícula Asignada</label>
                                 <div className="h-14 bg-blue-600/90 rounded-2xl flex items-center justify-center text-white font-black tracking-[0.4em] shadow-xl border border-blue-400/20">{assignmentData.matricula_sase}</div>
                              </div>
                              <GlassInput label="Grupos (1A, 2B...)" value={assignmentData.grupos.join(", ")} onChange={e => setAssignmentData({...assignmentData, grupos: e.target.value.split(',').map(g => g.trim().toUpperCase())})} />
                              
                               <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl cursor-pointer" onClick={() => setAssignmentData({...assignmentData, es_tutor: !assignmentData.es_tutor})}>
                                 <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${assignmentData.es_tutor ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'}`}>
                                    {assignmentData.es_tutor && <span className="material-icons text-[14px]">check</span>}
                                 </div>
                                 <p className="text-[10px] font-black text-slate-100 uppercase tracking-widest">Asignar Tutoría</p>
                              </div>

                              {assignmentData.es_tutor && <GlassInput label="Grupo Tutoreado" value={assignmentData.grupo_tutor} onChange={e => setAssignmentData({...assignmentData, grupo_tutor: e.target.value.toUpperCase()})} />}
                           </div>
                        </Section>
                        <GlassButton className="w-full h-16 mt-auto shadow-2xl" variant="primary" onClick={() => aprobarSolicitud(solicitudSeleccionada)} loading={procesando === solicitudSeleccionada.id}>Autorizar y Activar Credenciales</GlassButton>
                     </div>
                  </div>
               </GlassCard>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ label, value, color, bg, border }: { label: string; value: number; color: string; bg: string; border: string }) => (
  <GlassCard className={`${bg} ${border} p-8 group hover:scale-105 transition-all cursor-default`}>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
    <p className={`text-5xl font-black italic tracking-tighter ${color}`}>{value}</p>
  </GlassCard>
);

const Section = ({ title, icon, color = "text-slate-400", children }: { title: string; icon: string; color?: string; children: React.ReactNode }) => (
  <div className="space-y-6">
    <h4 className={`text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-3 ${color}`}>
       <span className="material-icons text-lg">{icon}</span> {title}
    </h4>
    {children}
  </div>
);

const DataField = ({ label, value }: { label: string; value: any }) => (
  <div className="space-y-1">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    <p className="text-xs font-black text-slate-700 uppercase italic tracking-tight truncate">{value || "---"}</p>
  </div>
);
