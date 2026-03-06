import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "../../supabase/client";
import { printContent } from "../../components/PrintButtons";

import type {
  DatosAlumnoExpediente,
  IncidenciaExpediente,
  DocumentoExpediente,
  EventoLinea,
  ExpedienteCompleto,
} from "./types";

import {
  recopilarIncidencias,
  recopilarDocumentos,
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
  const [lineaTiempo, setLineaTiempo] = useState<EventoLinea[]>([]);
  const [analisisIA, setAnalisisIA] = useState<string | null>(null);
  const [analizando, setAnalizando] = useState(false);

  useEffect(() => {
    cargarDatosExpediente();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alumno.id]);

  const cargarDatosExpediente = async () => {
    try {
      setCargando(true);

      const [inc, docs] = await Promise.all([
        recopilarIncidencias(supabase, alumno.id),
        recopilarDocumentos(supabase, alumno.id),
      ]);

      setIncidencias(inc);
      setDocumentos(docs);
      setLineaTiempo(construirLineaTiempo(inc, docs));
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar datos del expediente");
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
      toast.error("Error al generar análisis institucional");
    } finally {
      setAnalizando(false);
    }
  };

  const exportarPDF = async () => {
    if (generandoPDF) return;

    try {
      setGenerandoPDF(true);
      toast.loading("Generando expediente...", { id: "pdf-exp" });

      const folio = generarFolioExpediente(alumno.grupo);
      const fechaActual = new Date().toLocaleDateString("es-MX", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

      const expedienteData: ExpedienteCompleto = {
        folio,
        alumno,
        incidencias,
        documentos,
        lineaTiempo,
        analisisIA: analisisIA || undefined,
        fechaGeneracion: fechaActual,
        generadoPor: "SASE-310 (Sistema)",
      };

      const htmlContent = generarHTMLExpediente(expedienteData);

      // Usar printContent que ya existe en la plataforma (usa iframe y window.print)
      printContent("Expediente_Institucional", htmlContent);

      // Registrar en auditoría
      await (supabase as any).from("auditoria_accesos").insert({
        usuario: "SASE-310 User",
        rol: "docente",
        accion: "exportar_expediente_pdf",
        alumno_id: alumno.id,
        pantalla: `EXPEDIENTE_GENERADO:${folio}`,
        fecha: new Date().toISOString().split("T")[0],
        hora: new Date().toLocaleTimeString("es-MX", { hour12: false }),
      });

      toast.success("Expediente impreso", { id: "pdf-exp" });
    } catch (err) {
      console.error(err);
      toast.error("Error al exportar", { id: "pdf-exp" });
    } finally {
      setGenerandoPDF(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* ENCABEZADO */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center gap-4">
            <div className="size-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-indigo-600 text-2xl">
                folder_shared
              </span>
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                Expediente Institucional
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {alumno.nombre} — Grupo {alumno.grupo}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportarPDF}
              disabled={cargando || generandoPDF}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm shadow-blue-600/20"
            >
              <span className="material-symbols-outlined text-sm">
                picture_as_pdf
              </span>
              {generandoPDF
                ? "Exportando..."
                : "Imprimir Expediente Institucional"}
            </button>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-slate-200 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* CONTENIDO */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row min-h-0">
          {cargando ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12">
              <span className="material-symbols-outlined text-indigo-500 animate-spin text-4xl mb-4">
                progress_activity
              </span>
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
                Recopilando historial institucional...
              </p>
            </div>
          ) : (
            <>
              {/* LÍNEA DE TIEMPO (Izquierda) */}
              <div className="w-full md:w-[40%] lg:w-1/3 border-r border-slate-100 bg-slate-50/50 p-6 overflow-y-auto custom-scrollbar">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">
                    history
                  </span>
                  Línea de Tiempo del Caso
                </h3>

                {lineaTiempo.length === 0 ? (
                  <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-xl">
                    <span className="material-symbols-outlined text-slate-300 text-3xl mb-2">
                      history_toggle_off
                    </span>
                    <p className="text-xs text-slate-400 font-medium tracking-wide">
                      No hay historial registrado.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                    {lineaTiempo.map((evento, idx) => (
                      <div
                        key={idx}
                        className="relative flex items-center justify-between group is-active"
                      >
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-${evento.color}-50 text-${evento.color}-600 shadow-sm shrink-0 z-10`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {evento.icon}
                          </span>
                        </div>
                        <div className="w-[calc(100%-3.5rem)] bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              {evento.fecha}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[8px] font-black uppercase bg-${evento.color}-50 text-${evento.color}-600 border border-${evento.color}-200`}
                            >
                              {evento.tipo}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-700 mb-1">
                            {evento.titulo}
                          </h4>
                          <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                            {evento.descripcion}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ANÁLISIS E INFORMACIÓN (Derecha) */}
              <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar bg-white flex flex-col gap-6">
                {/* Resumen Estadístico */}
                <div className="grid grid-cols-2 gap-4 shrink-0">
                  <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex items-center gap-4">
                    <div className="size-12 bg-rose-100 rounded-xl flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-rose-600 text-2xl">
                        report
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Incidencias
                      </p>
                      <p className="text-2xl font-black text-slate-800">
                        {incidencias.length}
                      </p>
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex items-center gap-4">
                    <div className="size-12 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-indigo-600 text-2xl">
                        description
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Documentos
                      </p>
                      <p className="text-2xl font-black text-slate-800">
                        {documentos.length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Análisis IA */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm shrink-0 flex flex-col">
                  <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-indigo-500">
                        psychology
                      </span>
                      <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">
                        Análisis Institucional IA-SASE
                      </h3>
                    </div>
                    {!analisisIA && (
                      <button
                        onClick={ejecutarAnalisisInstitucional}
                        disabled={
                          analizando ||
                          (incidencias.length === 0 && documentos.length === 0)
                        }
                        className="px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-200 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {analizando ? (
                          <>
                            <span className="material-symbols-outlined text-[14px] animate-spin">
                              progress_activity
                            </span>
                            Analizando...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[14px]">
                              auto_awesome
                            </span>
                            Generar Análisis
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <div className="p-6 bg-white shrink-0 min-h-[160px]">
                    {analisisIA ? (
                      <div className="prose prose-sm prose-slate max-w-none prose-p:text-[13px] prose-p:leading-relaxed prose-p:text-slate-600 text-justify">
                        {analisisIA
                          .split("\n")
                          .filter((p) => p.trim() !== "")
                          .map((parrafo, i) => (
                            <p key={i}>{parrafo}</p>
                          ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3 py-6 text-center">
                        <span className="material-symbols-outlined text-4xl opacity-50">
                          analytics
                        </span>
                        <p className="text-xs font-medium max-w-[280px]">
                          {incidencias.length === 0 && documentos.length === 0
                            ? "No hay suficientes datos para generar un análisis."
                            : "Solicite a IA-SASE un análisis institucional objetivo basado en el Marco para la Convivencia Escolar."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Normativa */}
                <div className="mt-auto p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3 shrink-0">
                  <span className="material-symbols-outlined text-amber-500 shrink-0 mt-0.5">
                    gavel
                  </span>
                  <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                    <strong className="font-black uppercase tracking-wider block mb-1">
                      Confidencialidad
                    </strong>
                    Este expediente contiene información sensible y
                    disciplinaria. Su uso está restringido al seguimiento
                    formativo conforme a la normatividad escolar vigente CDMX.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
