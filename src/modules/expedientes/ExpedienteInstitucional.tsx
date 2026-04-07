import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "../../supabase/client";
import { printContent } from "../../components/PrintButtons";
import DOMPurify from "dompurify";
import { GlassCard } from "../../components/ui/GlassCard";
import { GlassButton } from "../../components/ui/GlassButton";
import { motion, AnimatePresence } from "framer-motion";

import type {
  DatosAlumnoExpediente,
  IncidenciaExpediente,
  DocumentoExpediente,
  EventoLinea,
  ExpedienteCompleto,
  ObjetoRetenidoExpediente,
} from "./types";

import {
  recopilarIncidencias,
  recopilarDocumentos,
  recopilarObjetosRetenidos,
  construirLineaTiempo,
  generarAnalisisIA,
  generarFolioExpediente,
  generarHTMLExpediente,
} from "./serviciosExpediente";

interface ExpedienteInstitucionalProps {
  alumno: DatosAlumnoExpediente;
  onClose: () => void;
}

export function ExpedienteInstitucional({
  alumno,
  onClose,
}: ExpedienteInstitucionalProps) {
  const [cargando, setCargando] = useState(true);
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [incidencias, setIncidencias] = useState<IncidenciaExpediente[]>([]);
  const [documentos, setDocumentos] = useState<DocumentoExpediente[]>([]);
  const [objetosRetenidos, setObjetosRetenidos] = useState<ObjetoRetenidoExpediente[]>([]);
  const [lineaTiempo, setLineaTiempo] = useState<EventoLinea[]>([]);
  const [analisisIA, setAnalisisIA] = useState<string | null>(null);
  const [analizando, setAnalizando] = useState(false);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState<DocumentoExpediente | null>(null);
  const [editandoDocumento, setEditandoDocumento] = useState(false);
  const [contenidoTemp, setContenidoTemp] = useState("");

  useEffect(() => {
    cargarDatosExpediente();
  }, [alumno.id]);

  const cargarDatosExpediente = async () => {
    try {
      setCargando(true);
      const [inc, docs, objetos] = await Promise.all([
        recopilarIncidencias(supabase, alumno.id),
        recopilarDocumentos(supabase, alumno.id),
        recopilarObjetosRetenidos(supabase, alumno.id),
      ]);
      setIncidencias(inc);
      setDocumentos(docs);
      setObjetosRetenidos(objetos);
      setLineaTiempo(construirLineaTiempo(inc, docs));
    } catch (err) {
      toast.error("Error al cargar historial institucional");
    } finally {
      setCargando(false);
    }
  };

  const ejecutarAnalisisInstitucional = async () => {
    try {
      setAnalizando(true);
      const analisis = await generarAnalisisIA(alumno, incidencias, documentos);
      setAnalisisIA(analisis);
      toast.success("Análisis IA-SASE completado");
    } catch {
      toast.error("Error en el análisis cognitivo");
    } finally {
      setAnalizando(false);
    }
  };

  const exportarPDF = async () => {
    if (generandoPDF) return;
    try {
      setGenerandoPDF(true);
      const loadingToast = toast.loading("Consolidando expediente...");
      const folio = generarFolioExpediente(alumno.grupo);
      const fechaActual = new Date().toLocaleDateString("es-MX", { year: "numeric", month: "2-digit", day: "2-digit" });
      const expedienteData: ExpedienteCompleto = { folio, alumno, incidencias, documentos, objetosRetenidos, lineaTiempo, analisisIA: analisisIA || undefined, fechaGeneracion: fechaActual, generadoPor: "SASE-310 (Sistema)" };
      const htmlContent = generarHTMLExpediente(expedienteData);
      printContent("Expediente_Institucional", htmlContent);
      toast.dismiss(loadingToast);
      toast.success("Expediente generado con éxito");
    } catch (err) {
      toast.error("Error en exportación");
    } finally {
      setGenerandoPDF(false);
    }
  };

  const handleVerDocumento = (evento: EventoLinea) => {
    const doc = documentos.find(d => d.id === evento.document_id);
    if (doc) {
      setDocumentoSeleccionado(doc);
      setContenidoTemp(doc.contenido);
      setEditandoDocumento(false);
    }
  };

  const handleGuardarDocumento = async () => {
    if (!documentoSeleccionado) return;
    try {
      const { error } = await (supabase as any).from("documentos_institucionales").update({ contenido: contenidoTemp }).eq("id", documentoSeleccionado.id);
      if (error) throw error;
      toast.success("Repositorio actualizado");
      setEditandoDocumento(false);
      setDocumentos(prev => prev.map(d => d.id === documentoSeleccionado.id ? { ...d, contenido: contenidoTemp } : d));
      setDocumentoSeleccionado(prev => prev ? { ...prev, contenido: contenidoTemp } : null);
    } catch (err) {
      toast.error("Error de escritura");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-slate-900/60 backdrop-blur-md"
    >
      <GlassCard className="w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden bg-white/95 border-slate-200">
        {/* Header Institucional */}
        <div className="flex items-center justify-between p-8 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-6">
            <div className="size-14 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm">
               <span className="material-icons text-blue-600 text-3xl">folder_shared</span>
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">Expediente Institucional</h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">{alumno.nombre} • Grupo {alumno.grupo}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <GlassButton onClick={exportarPDF} loading={generandoPDF} variant="primary" className="h-[46px] px-6">
               <span className="material-icons mr-2 text-sm">print</span>
               Imprimir
            </GlassButton>
            <GlassButton variant="outline" onClick={onClose} className="h-[46px] w-[46px] p-0 flex items-center justify-center">
               <span className="material-icons text-slate-400">close</span>
            </GlassButton>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-50/30">
          {cargando ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
               <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronizando protocolos estudiantiles...</p>
            </div>
          ) : (
            <>
              {/* Timeline Column */}
              <div className="w-full md:w-1/3 lg:w-[400px] border-r border-slate-100 p-8 overflow-y-auto custom-scrollbar flex flex-col gap-8">
                 <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                       <span className="material-icons text-sm">history</span>
                       Historial Cronológico
                    </h3>
                    <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">{lineaTiempo.length} Eventos</span>
                 </div>

                 {lineaTiempo.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                       <span className="material-icons text-5xl mb-3">inventory_2</span>
                       <p className="text-[10px] font-black uppercase tracking-widest">Sin registros activos</p>
                    </div>
                 ) : (
                    <div className="relative space-y-6 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
                       {lineaTiempo.map((evento, idx) => (
                          <motion.div 
                            initial={{ opacity: 0, x: -10 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            transition={{ delay: idx * 0.05 }}
                            key={idx} 
                            className="relative pl-12 group"
                          >
                             <div className={`absolute left-0 top-0 w-10 h-10 rounded-2xl flex items-center justify-center border-4 border-white shadow-sm z-10 
                               ${evento.tipo === 'incidencia' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'} transition-transform group-hover:scale-110`}>
                                <span className="material-icons text-base">{evento.icon}</span>
                             </div>
                             <div 
                               onClick={() => evento.tipo === "documento" && handleVerDocumento(evento)}
                               className={`p-4 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all ${evento.tipo === "documento" ? "cursor-pointer hover:border-blue-300 hover:shadow-md" : ""}`}
                             >
                                <div className="flex items-center justify-between mb-1">
                                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{evento.fecha}</span>
                                   <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase border ${evento.tipo === 'incidencia' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                      {evento.tipo}
                                   </span>
                                </div>
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">{evento.titulo}</h4>
                                <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1 line-clamp-2">{evento.descripcion}</p>
                             </div>
                          </motion.div>
                       ))}
                    </div>
                 )}
              </div>

              {/* Analysis & Details Column */}
              <div className="flex-1 p-8 overflow-y-auto custom-scrollbar space-y-8 flex flex-col">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <GlassCard className="p-6 border border-slate-200 bg-white">
                       <div className="flex items-center gap-4 mb-6">
                          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                             <span className="material-icons">psychology</span>
                          </div>
                          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Análisis IA-SASE</h3>
                       </div>
                       
                       <AnimatePresence mode="wait">
                          {analisisIA ? (
                             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                {analisisIA.split("\n").filter(p => p.trim()).map((p, i) => (
                                   <p key={i} className="text-xs text-slate-600 leading-relaxed font-medium text-justify">{p}</p>
                                ))}
                             </motion.div>
                          ) : (
                             <div className="py-8 flex flex-col items-center justify-center text-center gap-4">
                                <p className="text-[11px] text-slate-400 font-medium italic px-6 leading-relaxed">
                                   Solicite un análisis objetivo basado en el Marco de Convivencia Escolar para una perspectiva integral del caso.
                                </p>
                                <GlassButton onClick={ejecutarAnalisisInstitucional} loading={analizando} variant="outline" className="h-10 text-[10px] font-black uppercase tracking-widest">
                                   Generar Reporte Cognitivo
                                </GlassButton>
                             </div>
                          ) }
                       </AnimatePresence>
                    </GlassCard>

                    <div className="space-y-6">
                       <GlassCard className="p-6 border border-slate-200 bg-white">
                          <div className="flex items-center gap-4 mb-6">
                             <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                                <span className="material-icons">summarize</span>
                             </div>
                             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Resumen Disciplinario</h3>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-1 items-center">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Incidencias</span>
                                <span className="text-2xl font-black text-slate-800">{incidencias.length}</span>
                             </div>
                             <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-1 items-center">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Documentos</span>
                                <span className="text-2xl font-black text-slate-800">{documentos.length}</span>
                             </div>
                          </div>
                       </GlassCard>

                       <GlassCard className="p-6 border border-slate-200 bg-white/50 border-dashed">
                          <div className="flex items-center gap-4 mb-4">
                             <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
                                <span className="material-icons text-sm">inventory_2</span>
                             </div>
                             <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Custodia de Objetos</h3>
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium italic">
                             {objetosRetenidos.length === 0 ? "Sin objetos bajo resguardo institucional." : `${objetosRetenidos.length} artículos en custodia oficial.`}
                          </p>
                       </GlassCard>
                    </div>
                 </div>

                 <div className="mt-auto bg-amber-50 border border-amber-100 rounded-2xl p-6 flex items-start gap-4">
                    <span className="material-icons text-amber-600 mt-0.5">gavel</span>
                    <div>
                       <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1">Nota de Privacidad y Normativa</p>
                       <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                          Este expediente contiene información de carácter sensible protegida por la Ley de Protección de Datos Personales. Su consulta queda registrada en la bitácora de auditoría institucional y su uso queda restringido exclusivamente a fines académicos y formativos.
                       </p>
                    </div>
                 </div>
              </div>
            </>
          )}
        </div>
      </GlassCard>

      {/* DOCUMENT PREVIEW MODAL */}
      <AnimatePresence>
        {documentoSeleccionado && (
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }} 
             animate={{ opacity: 1, scale: 1 }} 
             exit={{ opacity: 0, scale: 0.95 }}
             className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-12 bg-black/40 backdrop-blur-xl"
           >
              <GlassCard className="w-full max-w-4xl h-[85vh] flex flex-col bg-white border-slate-200 shadow-2xl">
                 <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                          <span className="material-icons">description</span>
                       </div>
                       <div>
                          <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">{documentoSeleccionado.titulo}</h3>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Expediente Oficial • {alumno.nombre}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <GlassButton variant={editandoDocumento ? 'primary' : 'outline'} onClick={() => editandoDocumento ? handleGuardarDocumento() : setEditandoDocumento(true)}>
                          <span className="material-icons text-sm mr-2">{editandoDocumento ? 'save' : 'edit'}</span>
                          {editandoDocumento ? 'Guardar' : 'Editar'}
                       </GlassButton>
                       <GlassButton onClick={() => setDocumentoSeleccionado(null)} className="h-[40px] w-[40px] p-0 flex items-center justify-center">
                          <span className="material-icons text-slate-400">close</span>
                       </GlassButton>
                    </div>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto p-12 bg-slate-100/30 custom-scrollbar">
                    <div className="max-w-[210mm] mx-auto bg-white shadow-2xl border border-slate-200 min-h-full p-[2cm] print-container">
                       {editandoDocumento ? (
                          <textarea
                            title="Editor de contenido del documento"
                            aria-label="Editor de contenido del documento"
                            value={contenidoTemp}
                            onChange={(e) => setContenidoTemp(e.target.value)}
                            className="w-full h-full min-h-[50vh] border-none focus:ring-0 p-0 text-[14px] font-serif leading-relaxed text-slate-800 resize-none"
                            autoFocus
                          />
                       ) : (
                          <div 
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(documentoSeleccionado.contenido) }}
                            className="text-[14px] font-serif leading-relaxed text-slate-800"
                          />
                       )}
                    </div>
                 </div>
              </GlassCard>
           </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
