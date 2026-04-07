import React, { useState } from "react";
import { useApp } from "../store";
import { GlassCard } from "./ui/GlassCard";
import { GlassButton } from "./ui/GlassButton";
import { GlassInput } from "./ui/GlassInput";
import { GlassSelect } from "./ui/GlassSelect";
import { GlassTextarea } from "./ui/GlassTextarea";
import { motion, AnimatePresence } from "framer-motion";

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

const DOCENTES_POR_GRUPO: Record<string, { nombre: string; materia: string }[]> = {
  "1º A": [{ nombre: "Prof. García", materia: "Español" }, { nombre: "Prof. López", materia: "Matemáticas" }, { nombre: "Prof. Martínez", materia: "Ciencias" }, { nombre: "Prof. Hernández", materia: "Historia" }, { nombre: "Prof. Rodríguez", materia: "Inglés" }],
  "1º B": [{ nombre: "Prof. García", materia: "Español" }, { nombre: "Prof. López", materia: "Matemáticas" }, { nombre: "Prof. Sánchez", materia: "Ciencias" }, { nombre: "Prof. Hernández", materia: "Historia" }, { nombre: "Prof. Díaz", materia: "Inglés" }],
  "2º A": [{ nombre: "Prof. Ramírez", materia: "Español" }, { nombre: "Prof. Torres", materia: "Matemáticas" }, { nombre: "Prof. Flores", materia: "Física" }, { nombre: "Prof. Morales", materia: "Historia" }, { nombre: "Prof. Jiménez", materia: "Inglés" }],
  "2º B": [{ nombre: "Prof. Ramírez", materia: "Español" }, { nombre: "Prof. Torres", materia: "Matemáticas" }, { nombre: "Prof. Flores", materia: "Física" }, { nombre: "Prof. Castro", materia: "Historia" }, { nombre: "Prof. Jiménez", materia: "Inglés" }],
  "3º A": [{ nombre: "Prof. Vargas", materia: "Español" }, { nombre: "Prof. Medina", materia: "Matemáticas" }, { nombre: "Prof. Ruiz", materia: "Química" }, { nombre: "Prof. Ortiz", materia: "Historia" }, { nombre: "Prof. Guerrero", materia: "Inglés" }],
  "3º B": [{ nombre: "Prof. Vargas", materia: "Español" }, { nombre: "Prof. Medina", materia: "Matemáticas" }, { nombre: "Prof. Ruiz", materia: "Química" }, { nombre: "Prof. Delgado", materia: "Historia" }, { nombre: "Prof. Guerrero", materia: "Inglés" }],
};

const MOCK_SOLICITUDES: ReporteDocenteRequest[] = [
  {
    id: "srd-1", alumnoId: "1", alumnoNombre: "JUAN PÉREZ GARCÍA", alumnoGrupo: "3º A", tipoReporte: ["academico", "conductual"],
    docentesSolicitados: ["Prof. Vargas", "Prof. Medina"], observacionesOrientacion: "Bajo rendimiento en el primer trimestre y reporte de indisciplina.",
    estado: "completado", respuestas: [
      { docenteNombre: "Prof. Vargas", materia: "Español", fechaRespuesta: new Date().toISOString(), academico: { haceTareas: false, entregaActividades: true, participa: false, materialCompleto: true, cuadernoCompleto: true, observaciones: "Alumno con potencial pero distraído." }, conductual: { actitud: "indiferente", observaciones: "Apatía en clase." }, comunicacionPadres: { envioMensajes: true, recibioRespuesta: false, observaciones: "Recado no firmado." } },
      { docenteNombre: "Prof. Medina", materia: "Matemáticas", fechaRespuesta: new Date().toISOString(), academico: { haceTareas: true, entregaActividades: true, participa: true, materialCompleto: true, cuadernoCompleto: true, observaciones: "Trabaja bien en clase." }, conductual: { actitud: "positiva", observaciones: "Buena disposición." }, comunicacionPadres: { envioMensajes: false, recibioRespuesta: false, observaciones: "Sin incidentes." } }
    ], createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

export const SolicitudReportesDocentes: React.FC = () => {
  const { students } = useApp();
  const [activeTab, setActiveTab] = useState<"nueva" | "pendientes" | "completadas">("nueva");
  const [solicitudes, setSolicitudes] = useState<ReporteDocenteRequest[]>(MOCK_SOLICITUDES);
  const [selectedCompleted, setSelectedCompleted] = useState<string | null>(null);

  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [tipoReporte, setTipoReporte] = useState<("academico" | "conductual")[]>([]);
  const [docentesSeleccionados, setDocentesSeleccionados] = useState<string[]>([]);
  const [observaciones, setObservaciones] = useState("");

  const selectedStudentData = students.find((s) => s.id === selectedStudent);
  const docentesDisponibles = selectedStudentData ? DOCENTES_POR_GRUPO[selectedStudentData.group] || [] : [];

  const toggleTipoReporte = (tipo: "academico" | "conductual") => {
    setTipoReporte((prev) => prev.includes(tipo) ? prev.filter((t) => t !== tipo) : [...prev, tipo]);
  };

  const toggleDocente = (docente: string) => {
    setDocentesSeleccionados((prev) => prev.includes(docente) ? prev.filter((d) => d !== docente) : [...prev, docente]);
  };

  const selectAllDocentes = () => {
    if (docentesSeleccionados.length === docentesDisponibles.length) setDocentesSeleccionados([]);
    else setDocentesSeleccionados(docentesDisponibles.map((d) => d.nombre));
  };

  const handleEnviarSolicitud = () => {
    if (!selectedStudent || tipoReporte.length === 0 || docentesSeleccionados.length === 0) return;
    const nuevaSolicitud: ReporteDocenteRequest = {
      id: `srd-${Date.now()}`, alumnoId: selectedStudent, alumnoNombre: selectedStudentData?.name || "",
      alumnoGrupo: selectedStudentData?.group || "", tipoReporte, docentesSolicitados: docentesSeleccionados,
      observacionesOrientacion: observaciones, estado: "pendiente", respuestas: [], createdAt: new Date().toISOString(),
    };
    setSolicitudes([nuevaSolicitud, ...solicitudes]);
    setSelectedStudent(""); setTipoReporte([]); setDocentesSeleccionados([]); setObservaciones("");
    setActiveTab("pendientes");
  };

  const pendientes = solicitudes.filter((s) => s.estado !== "completado");
  const completadas = solicitudes.filter((s) => s.estado === "completado");

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
             <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3 italic uppercase">
                <span className="material-icons text-blue-600 text-3xl">fact_check</span>
                Gestión de Reportes Docentes
             </h1>
             <p className="text-slate-500 font-medium tracking-tight mt-1">Consolidación de informes académicos y conductuales para expedientes disciplinarios.</p>
          </div>
       </div>

       <div className="flex p-1 bg-white/40 backdrop-blur-md rounded-2xl border border-slate-200 w-fit">
          {[
            { id: 'nueva', label: 'Nueva Solicitud', icon: 'add_circle' },
            { id: 'pendientes', label: `Pendientes (${pendientes.length})`, icon: 'pending' },
            { id: 'completadas', label: `Completadas (${completadas.length})`, icon: 'check_circle' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-xl border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}>
               <span className="material-icons text-base">{tab.icon}</span>
               {tab.label}
            </button>
          ))}
       </div>

       <AnimatePresence mode="wait">
          {activeTab === "nueva" && (
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Paso 1 */}
                <GlassCard className="p-0 border border-slate-200 flex flex-col bg-white">
                   <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
                      <span className="size-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs italic">01</span>
                      <h3 className="text-sm font-black text-slate-700 uppercase tracking-tight">Estudiante</h3>
                   </div>
                   <div className="p-6 space-y-6">
                      <div className="space-y-2">
                         <GlassSelect 
                           label="Seleccionar Alumno" 
                           value={selectedStudent} 
                           onChange={e => setSelectedStudent(e.target.value)}
                           options={[
                             { value: "", label: "Buscar en padrón..." },
                             ...students.map(s => ({ value: s.id, label: `${s.name} • ${s.group}` }))
                           ]}
                         />
                      </div>
                      {selectedStudentData && (
                         <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-white border border-blue-100 flex items-center justify-center font-black text-blue-600 shadow-sm">{selectedStudentData.name.slice(0,2)}</div>
                            <div>
                               <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{selectedStudentData.name}</p>
                               <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mt-1">{selectedStudentData.group} • {selectedStudentData.matricula}</p>
                            </div>
                         </div>
                      )}
                   </div>
                </GlassCard>

                {/* Paso 2 */}
                <GlassCard className="p-0 border border-slate-200 flex flex-col bg-white">
                   <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
                      <span className="size-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs italic">02</span>
                      <h3 className="text-sm font-black text-slate-700 uppercase tracking-tight">Tipo de Informe</h3>
                   </div>
                   <div className="p-6 space-y-4">
                      {['academico', 'conductual'].map(tipo => (
                        <button key={tipo} onClick={() => toggleTipoReporte(tipo as any)} className={`w-full p-6 rounded-3xl border-2 flex items-center gap-4 transition-all text-left ${tipoReporte.includes(tipo as any) ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 bg-slate-50/30 hover:border-blue-200'}`}>
                           <div className={`size-12 rounded-2xl flex items-center justify-center ${tipoReporte.includes(tipo as any) ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border border-slate-100 text-slate-400'}`}>
                              <span className="material-icons">{tipo === 'academico' ? 'school' : 'psychology'}</span>
                           </div>
                           <div>
                              <p className={`text-xs font-black uppercase tracking-tight ${tipoReporte.includes(tipo as any) ? 'text-blue-700' : 'text-slate-600'}`}>{tipo === 'academico' ? 'Reporte Académico' : 'Reporte Conductual'}</p>
                              <p className="text-[10px] text-slate-400 font-medium leading-tight mt-1">{tipo === 'academico' ? 'Tareas, participación y materiales.' : 'Actitud y convivencia grupal.'}</p>
                           </div>
                        </button>
                      ))}
                      <div className="pt-4 space-y-2">
                        <GlassTextarea 
                          label="Observaciones de Orientación" 
                          placeholder="Instrucciones específicas para el docente..." 
                          value={observaciones} 
                          onChange={e => setObservaciones(e.target.value)} 
                        />
                      </div>
                   </div>
                </GlassCard>

                {/* Paso 3 */}
                <GlassCard className="p-0 border border-slate-200 flex flex-col bg-white">
                   <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
                      <span className="size-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs italic">03</span>
                      <h3 className="text-sm font-black text-slate-700 uppercase tracking-tight">Plantilla Docente</h3>
                   </div>
                   <div className="p-6 flex-1 flex flex-col">
                      {!selectedStudentData ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 grayscale py-20">
                           <span className="material-icons text-5xl mb-3">supervisor_account</span>
                           <p className="text-[10px] font-black uppercase tracking-widest">Pendiente de selección</p>
                        </div>
                      ) : (
                        <>
                           <button onClick={selectAllDocentes} className="text-[11px] font-black text-blue-600 uppercase tracking-widest self-end mb-4 hover:underline">
                              {docentesSeleccionados.length === docentesDisponibles.length ? 'Deseleccionar todos' : 'Marcar plantilla completa'}
                           </button>
                           <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-2 mb-8">
                              {docentesDisponibles.map(doc => (
                                <button key={doc.nombre} onClick={() => toggleDocente(doc.nombre)} className={`w-full p-4 rounded-2xl border flex items-center gap-4 transition-all text-left ${docentesSeleccionados.includes(doc.nombre) ? 'border-blue-300 bg-blue-50/50' : 'border-slate-100 bg-slate-50/30'}`}>
                                   <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${docentesSeleccionados.includes(doc.nombre) ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'}`}>
                                      {docentesSeleccionados.includes(doc.nombre) && <span className="material-icons text-[14px]">check</span>}
                                   </div>
                                   <div>
                                      <p className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{doc.nombre}</p>
                                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{doc.materia}</p>
                                   </div>
                                </button>
                              ))}
                           </div>
                           <GlassButton 
                             onClick={handleEnviarSolicitud}
                             disabled={!selectedStudent || tipoReporte.length === 0 || docentesSeleccionados.length === 0} 
                             variant="primary" 
                             className="w-full h-14 mt-auto"
                           >
                              Despachar Solicitudes ({docentesSeleccionados.length})
                           </GlassButton>
                        </>
                      )}
                   </div>
                </GlassCard>
             </motion.div>
          )}

          {activeTab === "pendientes" && (
             <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                <GlassCard className="p-0 border border-slate-200 bg-white overflow-hidden">
                   <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Protocolos en Tránsito</h3>
                      <div className="flex gap-4">
                         <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100 uppercase">{pendientes.length} Pendientes</span>
                      </div>
                   </div>
                   <div className="divide-y divide-slate-100">
                      {pendientes.length === 0 ? (
                        <div className="py-32 flex flex-col items-center justify-center text-center opacity-30">
                           <span className="material-icons text-6xl mb-4">move_to_inbox</span>
                           <p className="text-[11px] font-black uppercase tracking-[0.2em]">Bandeja de salida despejada</p>
                        </div>
                      ) : (
                        pendientes.map(sol => (
                          <div key={sol.id} className="p-8 hover:bg-slate-50/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-8 group">
                             <div className="flex items-start gap-6">
                                <div className="size-14 rounded-3xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-sm transition-transform group-hover:scale-110">
                                   <span className="material-icons text-3xl">hourglass_empty</span>
                                </div>
                                <div className="space-y-1">
                                   <h4 className="text-lg font-black text-slate-800 uppercase italic tracking-tighter">{sol.alumnoNombre}</h4>
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{sol.alumnoGrupo} • <span className="text-blue-600">ID: {sol.id}</span></p>
                                   <div className="flex gap-2 pt-2">
                                      {sol.tipoReporte.map(t => (
                                        <span key={t} className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[8px] font-black text-slate-500 uppercase tracking-widest">{t}</span>
                                      ))}
                                   </div>
                                </div>
                             </div>
                             <div className="flex flex-col md:items-end gap-3">
                                <div className="text-right">
                                   <p className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{sol.respuestas.length} de {sol.docentesSolicitados.length} Reportes</p>
                                   <div className="w-48 h-2 bg-slate-100 rounded-full mt-2 overflow-hidden border border-slate-200">
                                      <motion.div initial={{ width: 0 }} animate={{ width: `${(sol.respuestas.length / sol.docentesSolicitados.length) * 100}%` }} className="h-full bg-blue-600" />
                                   </div>
                                </div>
                                <div className="flex gap-2">
                                   <GlassButton variant="outline" className="h-10 text-[9px] px-4 font-black uppercase tracking-widest">Reenviar Alerta</GlassButton>
                                   <GlassButton variant="outline" className="h-10 text-[9px] px-4 font-black uppercase tracking-widest border-rose-100 text-rose-600">Cancelar</GlassButton>
                                </div>
                             </div>
                          </div>
                        ))
                      )}
                   </div>
                </GlassCard>
             </motion.div>
          )}

          {activeTab === "completadas" && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-4">
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-6">Archivo Consolidado</h3>
                   <div className="space-y-3">
                      {completadas.map(sol => (
                        <button key={sol.id} onClick={() => setSelectedCompleted(sol.id)} className={`w-full p-6 rounded-3xl border text-left transition-all relative overflow-hidden group ${selectedCompleted === sol.id ? 'bg-blue-600 border-blue-500 text-white shadow-2xl scale-105 z-10' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'}`}>
                           <div className="flex items-center gap-4">
                              <div className={`size-10 rounded-2xl flex items-center justify-center ${selectedCompleted === sol.id ? 'bg-white/20' : 'bg-blue-50 text-blue-600'}`}>
                                 <span className="material-icons">article</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="text-xs font-black uppercase tracking-tight truncate">{sol.alumnoNombre}</p>
                                 <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${selectedCompleted === sol.id ? 'text-white/70' : 'text-slate-400'}`}>{sol.alumnoGrupo} • {new Date(sol.createdAt).toLocaleDateString()}</p>
                              </div>
                           </div>
                        </button>
                      ))}
                   </div>
                </div>

                <div className="lg:col-span-3">
                   {selectedCompleted ? (
                      <GlassCard className="p-0 border border-slate-200 bg-white overflow-hidden shadow-2xl">
                         {(() => {
                            const sol = completadas.find(s => s.id === selectedCompleted);
                            if (!sol) return null;
                            return (
                               <>
                                  <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                     <div>
                                        <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter truncate max-w-md">EXPEDIENTE: {sol.alumnoNombre}</h2>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Consolidado Institucional • Folio {sol.id}</p>
                                     </div>
                                     <GlassButton variant="primary" className="h-10 text-[9px] px-6">Exportar Acta</GlassButton>
                                  </div>
                                  <div className="p-8 space-y-10 max-h-[650px] overflow-y-auto custom-scrollbar">
                                     <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-3xl">
                                        <h4 className="text-[10px] font-black text-indigo-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                                           <span className="material-icons text-sm">psychology</span>
                                           Diagnóstico de Orientación
                                        </h4>
                                        <p className="text-xs text-indigo-900 font-medium italic leading-relaxed">"{sol.observacionesOrientacion || "Sin anotaciones integradas"}"</p>
                                     </div>

                                     <div className="space-y-8">
                                        {sol.respuestas.map((resp, idx) => (
                                          <div key={idx} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-8 relative overflow-hidden">
                                             <div className="absolute top-0 right-0 p-8 opacity-[0.03] grayscale text-8xl">
                                                <span className="material-icons">{resp.academico ? 'school' : 'psychology'}</span>
                                             </div>
                                             <div className="flex items-center justify-between relative z-10">
                                                <div className="flex items-center gap-4">
                                                   <div className="size-14 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center text-slate-400">
                                                      <span className="material-icons text-3xl">person</span>
                                                   </div>
                                                   <div>
                                                      <h4 className="text-base font-black text-slate-800 uppercase">{resp.docenteNombre}</h4>
                                                      <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest">{resp.materia}</p>
                                                   </div>
                                                </div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(resp.fechaRespuesta).toLocaleDateString()}</span>
                                             </div>

                                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                                {resp.academico && (
                                                   <div className="space-y-4">
                                                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                         <span className="material-icons text-sm">bar_chart</span> Desempeño Escolar
                                                      </h5>
                                                      <div className="space-y-2">
                                                         {[
                                                           { label: 'Entrega Tareas', val: resp.academico.haceTareas },
                                                           { label: 'Trabajo en Clase', val: resp.academico.entregaActividades },
                                                           { label: 'Participación', val: resp.academico.participa },
                                                           { label: 'Material Completo', val: resp.academico.materialCompleto }
                                                         ].map(item => (
                                                            <div key={item.label} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                                                               <span className="text-[11px] text-slate-500 font-bold uppercase">{item.label}</span>
                                                               <span className={`material-icons text-sm ${item.val ? 'text-emerald-500' : 'text-rose-400'}`}>
                                                                  {item.val ? 'check_circle' : 'cancel'}
                                                               </span>
                                                            </div>
                                                         ))}
                                                      </div>
                                                   </div>
                                                )}

                                                <div className="space-y-6">
                                                   {resp.conductual && (
                                                      <div>
                                                         <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                                                            <span className="material-icons text-sm">mood</span> Perfil de Actitud
                                                         </h5>
                                                         <div className={`p-4 rounded-3xl border-2 flex items-center gap-4 ${
                                                           resp.conductual.actitud === 'positiva' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 
                                                           resp.conductual.actitud === 'agresiva' ? 'bg-rose-50 border-rose-100 text-rose-700' : 
                                                           'bg-slate-50 border-slate-100 text-slate-600'
                                                         }`}>
                                                            <span className="material-icons text-2xl">{resp.conductual.actitud === 'positiva' ? 'verified' : 'warning'}</span>
                                                            <p className="text-xs font-black uppercase italic tracking-tight">{resp.conductual.actitud || "Neutral"}</p>
                                                         </div>
                                                      </div>
                                                   )}
                                                   <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 italic">
                                                      <p className="text-[11px] text-slate-600 leading-relaxed font-medium">"{resp.academico?.observaciones || resp.conductual?.observaciones || "Sin observaciones adicionales."}"</p>
                                                   </div>
                                                </div>
                                             </div>
                                          </div>
                                        ))}
                                     </div>
                                  </div>
                               </>
                            );
                         })()}
                      </GlassCard>
                   ) : (
                      <div className="h-[600px] flex flex-col items-center justify-center text-center opacity-30 grayscale grayscale-[50%] bg-white/40 border border-slate-200 rounded-[3rem] border-dashed">
                         <span className="material-icons text-7xl mb-6">description</span>
                         <p className="text-xs font-black uppercase tracking-[0.3em]">Seleccione un expediente de la lista</p>
                      </div>
                   )}
                </div>
             </motion.div>
          )}
       </AnimatePresence>
    </div>
  );
};
