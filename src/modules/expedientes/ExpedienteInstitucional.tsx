import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "../../supabase/client";
import { printContent } from "../../components/PrintButtons";
import DOMPurify from "dompurify";

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
  const [historialMedicoVisible, setHistorialMedicoVisible] = useState(false);
  const [historialAcademicoVisible, setHistorialAcademicoVisible] = useState(false);
  const [modalAcceso, setModalAcceso] = useState<"medico" | "academico" | null>(null);
  const [claveAcceso, setClaveAcceso] = useState("");
  const [validandoAcceso, setValidandoAcceso] = useState(false);
  const [correoUsuario, setCorreoUsuario] = useState<string | null>(null);

  useEffect(() => {
    cargarDatosExpediente();
  }, [alumno.id]);

  useEffect(() => {
    const cargarUsuario = async () => {
      const { data } = await supabase.auth.getUser();
      setCorreoUsuario(data.user?.email || null);
    };
    cargarUsuario();
  }, []);

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
          objetosRetenidos,
          lineaTiempo,
          analisisIA: analisisIA || undefined,
          fechaGeneracion: fechaActual,
          generadoPor: "SASE-310 (Sistema)",
        };

      const htmlContent = generarHTMLExpediente(expedienteData);
      const sanitizedHtml = DOMPurify.sanitize(htmlContent);

      // Usar printContent que ya existe en la plataforma (usa iframe y window.print)
      printContent("Expediente_Institucional", sanitizedHtml);

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
      const { error } = await (supabase as any)
        .from("documentos_institucionales")
        .update({ contenido: contenidoTemp })
        .eq("id", documentoSeleccionado.id);

      if (error) throw error;

      toast.success("Documento actualizado correctamente");
      setEditandoDocumento(false);
      
      // Actualizar estado local
      setDocumentos(prev => 
        prev.map(d => d.id === documentoSeleccionado.id ? { ...d, contenido: contenidoTemp } : d)
      );
      setDocumentoSeleccionado(prev => prev ? { ...prev, contenido: contenidoTemp } : null);
      
    } catch (err) {
      console.error(err);
      toast.error("Error al actualizar el documento");
    }
  };

  const calcularEdad = (fecha?: string) => {
    if (!fecha) return undefined;
    const nacimiento = new Date(fecha);
    if (Number.isNaN(nacimiento.getTime())) return undefined;
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad -= 1;
    }
    return edad;
  };

  const edadAlumno = alumno.edad ?? calcularEdad(alumno.fecha_nacimiento);

  const resumenAsistencia = React.useMemo(() => {
    return incidencias.reduce(
      (acc, inc) => {
        const tipo = (inc.tipo || "").toLowerCase();
        if (tipo.includes("asistencia") || tipo.includes("falta")) acc.faltas += 1;
        if (tipo.includes("retardo")) acc.retardos += 1;
        return acc;
      },
      { faltas: 0, retardos: 0 },
    );
  }, [incidencias]);

  const incidenciasConducta = React.useMemo(() => {
    return incidencias.filter((inc) => {
      const tipo = (inc.tipo || "").toLowerCase();
      return tipo.includes("conducta") || tipo.includes("disciplina");
    });
  }, [incidencias]);

  const promedioGeneral = React.useMemo(() => {
    if (!alumno.calificaciones || alumno.calificaciones.length === 0) return "N/D";
    const suma = alumno.calificaciones.reduce((acc: number, cal: any) => {
      const promedio =
        cal.promedioFinal ??
        (Number(cal.trimestre1 || 0) + Number(cal.trimestre2 || 0) + Number(cal.trimestre3 || 0)) / 3;
      return acc + (Number.isFinite(promedio) ? promedio : 0);
    }, 0);
    return (suma / alumno.calificaciones.length).toFixed(1);
  }, [alumno.calificaciones]);

  const obtenerCorreoUsuario = async () => {
    if (correoUsuario) return correoUsuario;
    const { data } = await supabase.auth.getUser();
    const correo = data.user?.email || null;
    setCorreoUsuario(correo);
    return correo;
  };

  const registrarAccesoSensibles = async (accion: string) => {
    const correo = await obtenerCorreoUsuario();
    await (supabase as any).from("auditoria_accesos").insert({
      usuario: correo || "usuario_desconocido",
      rol: "operador",
      accion,
      alumno_id: alumno.id,
      pantalla: "ExpedienteInstitucional",
      fecha: new Date().toISOString().split("T")[0],
      hora: new Date().toLocaleTimeString("es-MX", { hour12: false }),
    });
  };

  const confirmarAcceso = async () => {
    if (!modalAcceso) return;
    if (!claveAcceso.trim()) {
      toast.error("Ingrese su contraseña");
      return;
    }
    setValidandoAcceso(true);
    const correo = await obtenerCorreoUsuario();
    if (!correo) {
      toast.error("No se pudo validar la sesión actual");
      setValidandoAcceso(false);
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({
      email: correo,
      password: claveAcceso,
    });
    if (error) {
      toast.error("Contraseña incorrecta");
      setValidandoAcceso(false);
      return;
    }
    if (modalAcceso === "medico") {
      setHistorialMedicoVisible(true);
      await registrarAccesoSensibles("consultar_historial_medico");
    } else {
      setHistorialAcademicoVisible(true);
      await registrarAccesoSensibles("consultar_historial_academico");
    }
    toast.success("Acceso autorizado");
    setClaveAcceso("");
    setModalAcceso(null);
    setValidandoAcceso(false);
  };

  const imprimirHistorialAcademico = () => {
    const calificaciones = alumno.calificaciones || [];
    const filasCalificaciones = calificaciones
      .map(
        (cal: any) => `
          <tr>
            <td style="padding: 8px; border: 1px solid #e2e8f0;">${cal.materia || "Materia"}</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">${cal.trimestre1 ?? "-"}</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">${cal.trimestre2 ?? "-"}</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">${cal.trimestre3 ?? "-"}</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">${cal.promedioFinal ?? "-"}</td>
          </tr>
        `,
      )
      .join("");

    const html = DOMPurify.sanitize(`
      <div style="font-family: Arial, sans-serif; color: #1e293b;">
        <h2 style="margin-bottom: 8px;">Historial Académico</h2>
        <p style="margin-top: 0; color: #475569;">Alumno: ${alumno.nombre} — Grupo ${alumno.grupo}</p>
        <h3 style="margin-top: 20px;">Asistencia</h3>
        <p>Faltas registradas: ${resumenAsistencia.faltas}</p>
        <p>Retardos registrados: ${resumenAsistencia.retardos}</p>
        <h3 style="margin-top: 20px;">Calificaciones</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f1f5f9;">
              <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: left;">Materia</th>
              <th style="padding: 8px; border: 1px solid #e2e8f0;">T1</th>
              <th style="padding: 8px; border: 1px solid #e2e8f0;">T2</th>
              <th style="padding: 8px; border: 1px solid #e2e8f0;">T3</th>
              <th style="padding: 8px; border: 1px solid #e2e8f0;">Final</th>
            </tr>
          </thead>
          <tbody>
            ${filasCalificaciones || "<tr><td colspan='5' style='padding: 8px; text-align: center; color: #64748b;'>Sin calificaciones registradas</td></tr>"}
          </tbody>
        </table>
        <p style="margin-top: 16px;">Promedio general: ${promedioGeneral}</p>
      </div>
    `);

    printContent("Historial_Academico", html);
  };

  const imprimirHistorialConducta = () => {
    const filas = incidencias
      .map(
        (inc) => `
          <tr>
            <td style="padding: 8px; border: 1px solid #e2e8f0;">${new Date(inc.fecha).toLocaleDateString("es-MX")}</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0;">${inc.tipo}</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0;">${inc.estado}</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0; color: #475569;">${inc.descripcion}</td>
          </tr>
        `,
      )
      .join("");

    const html = DOMPurify.sanitize(`
      <div style="font-family: Arial, sans-serif; color: #1e293b;">
        <h2 style="margin-bottom: 8px;">Historial de Conducta</h2>
        <p style="margin-top: 0; color: #475569;">Alumno: ${alumno.nombre} — Grupo ${alumno.grupo}</p>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f1f5f9;">
              <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: left;">Fecha</th>
              <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: left;">Tipo</th>
              <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: left;">Estado</th>
              <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: left;">Descripcion</th>
            </tr>
          </thead>
          <tbody>
            ${filas || "<tr><td colspan='4' style='padding: 8px; text-align: center; color: #64748b;'>Sin incidencias registradas</td></tr>"}
          </tbody>
        </table>
      </div>
    `);

    printContent("Historial_Conducta", html);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0B1120]/90 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-white/10 backdrop-blur-3xl">
        {/* ENCABEZADO */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5 shrink-0">
          <div className="flex items-center gap-4">
            <div className="size-12 bg-indigo-500/10 border border-indigo-400/20 rounded-xl flex items-center justify-center">
              <span className="material-icons text-indigo-300 text-2xl">
                folder_shared
              </span>
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight">
                Expediente Institucional
              </h2>
              <p className="text-xs text-slate-300 font-medium">
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
              <span className="material-icons text-sm">
                picture_as_pdf
              </span>
              {generandoPDF
                ? "Exportando..."
                : "Imprimir Expediente Institucional"}
            </button>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-slate-200 rounded-xl transition-colors text-slate-600 hover:text-slate-600"
            >
              <span className="material-icons">close</span>
            </button>
          </div>
        </div>

        {/* CONTENIDO */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row min-h-0">
          {cargando ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12">
              <span className="material-icons text-indigo-500 animate-spin text-4xl mb-4">
                progress_activity
              </span>
              <p className="text-sm font-black text-slate-600 uppercase tracking-widest">
                Recopilando historial institucional...
              </p>
            </div>
          ) : (
            <>
              {/* LÍNEA DE TIEMPO (Izquierda) */}
               <div className="w-full md:w-[40%] lg:w-1/3 border-r border-white/10 bg-white/5 p-6 overflow-y-auto custom-scrollbar">
                 <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <span className="material-icons text-sm">
                    history
                  </span>
                  Línea de Tiempo del Caso
                </h3>

                {lineaTiempo.length === 0 ? (
                  <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-xl">
                    <span className="material-icons text-slate-300 text-3xl mb-2">
                      history_toggle_off
                    </span>
                    <p className="text-xs text-slate-600 font-medium tracking-wide">
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
                          <span className="material-icons text-[16px]">
                            {evento.icon}
                          </span>
                        </div>
                        <div 
                          onClick={() => evento.tipo === "documento" && handleVerDocumento(evento)}
                         className={`w-[calc(100%-3.5rem)] bg-white/5 p-4 rounded-xl border border-white/10 shadow-sm transition-all ${evento.tipo === "documento" ? "cursor-pointer hover:border-indigo-400/30 hover:shadow-xl hover:bg-indigo-500/10" : "hover:shadow-xl"}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              {evento.fecha}
                            </span>
                            <div className="flex items-center gap-2">
                              {evento.tipo === "documento" && (
                                <span className="material-icons text-[12px] text-indigo-400">
                                  visibility
                                </span>
                              )}
                              <span
                                className={`px-2 py-0.5 rounded text-[8px] font-black uppercase bg-${evento.color}-50 text-${evento.color}-600 border border-${evento.color}-200`}
                              >
                                {evento.tipo}
                              </span>
                            </div>
                          </div>
                          <h4 className={`text-xs font-bold mb-1 ${evento.tipo === "documento" ? "text-indigo-200" : "text-slate-100"}`}>
                            {evento.titulo}
                          </h4>
                          <p className="text-[10px] text-slate-300 leading-relaxed font-medium">
                            {evento.descripcion}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ANÁLISIS E INFORMACIÓN (Derecha) */}
               <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar bg-transparent flex flex-col gap-6">
                {/* Resumen Estadístico */}
                <div className="grid grid-cols-2 gap-4 shrink-0">
                  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center gap-4">
                    <div className="size-12 bg-rose-100 rounded-xl flex items-center justify-center shrink-0">
                      <span className="material-icons text-rose-600 text-2xl">
                        report
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        Incidencias
                      </p>
                      <p className="text-2xl font-black text-white">
                        {incidencias.length}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center gap-4">
                    <div className="size-12 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                      <span className="material-icons text-indigo-600 text-2xl">
                        description
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        Documentos
                      </p>
                      <p className="text-2xl font-black text-white">
                        {documentos.length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Custodia de Objetos */}
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-sm shrink-0">
                  <div className="bg-white/5 px-5 py-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-icons text-amber-500">
                        inventory_2
                      </span>
                        <h3 className="text-xs font-black text-slate-100 uppercase tracking-widest">
                        Custodia de Objetos
                      </h3>
                    </div>
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                      {objetosRetenidos.length} registros
                    </span>
                  </div>
                  <div className="p-5">
                    {objetosRetenidos.length === 0 ? (
                      <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-xl">
                        <span className="material-icons text-slate-300 text-3xl mb-2">
                          inventory
                        </span>
                        <p className="text-xs text-slate-600 font-medium tracking-wide">
                          Sin objetos retenidos registrados.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {objetosRetenidos.map((obj) => (
                          <div key={obj.id} className="border border-slate-200 rounded-xl p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-sm font-black text-white uppercase tracking-tight">
                                  {obj.objeto}
                                </p>
                                <p className="text-[11px] text-slate-300 font-medium mt-1">
                                  {obj.motivo}
                                </p>
                                <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
                                  <span>{new Date(obj.fecha).toLocaleDateString("es-MX")}</span>
                                  <span>•</span>
                                  <span>{obj.responsableNombre || "Responsable no definido"}</span>
                                </div>
                              </div>
                              <span className={`px-2.5 py-1 rounded-2xl text-[9px] font-black uppercase tracking-widest border ${
                                obj.estado === "retenido"
                                  ? "text-amber-600 border-amber-200 bg-amber-50"
                                  : "text-emerald-600 border-emerald-200 bg-emerald-50"
                              }`}>
                                {obj.estado === "retenido" ? "Bajo custodia" : obj.estado}
                              </span>
                            </div>
                            {obj.fechaDevolucion && (
                              <div className="mt-3 text-[10px] text-slate-700 font-semibold uppercase tracking-widest">
                                Devuelto: {new Date(obj.fechaDevolucion).toLocaleDateString("es-MX")} {obj.entregadoA ? `— ${obj.entregadoA}` : ""}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Análisis IA */}
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-sm shrink-0 flex flex-col">
                  <div className="bg-white/5 px-5 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="material-icons text-indigo-500">
                        psychology
                      </span>
                        <h3 className="text-xs font-black text-slate-100 uppercase tracking-widest">
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
                        className="px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-200 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {analizando ? (
                          <>
                            <span className="material-icons text-[14px] animate-spin">
                              progress_activity
                            </span>
                            Analizando...
                          </>
                        ) : (
                          <>
                            <span className="material-icons text-[14px]">
                              auto_awesome
                            </span>
                            Generar Análisis
                          </>
                        )}
                      </button>
                    )}
                  </div>
                   <div className="p-6 bg-transparent shrink-0 min-h-[160px]">
                    {analisisIA ? (
                       <div className="prose prose-sm max-w-none prose-p:text-[13px] prose-p:leading-relaxed prose-p:text-slate-200 text-justify text-slate-200">
                        {analisisIA
                          .split("\n")
                          .filter((p) => p.trim() !== "")
                          .map((parrafo, i) => (
                            <p key={i}>{parrafo}</p>
                          ))}
                      </div>
                    ) : (
                       <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-3 py-6 text-center">
                        <span className="material-icons text-4xl opacity-50">
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
                 <div className="mt-auto p-4 bg-amber-500/10 rounded-xl border border-amber-400/20 flex items-start gap-3 shrink-0">
                   <span className="material-icons text-amber-300 shrink-0 mt-0.5">
                    gavel
                  </span>
                   <p className="text-[11px] text-amber-100 leading-relaxed font-medium">
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

      {/* MODAL DE VISTA/EDICIÓN DE DOCUMENTO */}
      {documentoSeleccionado && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-8 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0B1120]/90 rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl border border-white/10 overflow-hidden backdrop-blur-3xl">
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-indigo-100 rounded-2xl flex items-center justify-center">
                  <span className="material-icons text-indigo-600">description</span>
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">
                    {documentoSeleccionado.titulo}
                  </h3>
                  <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                    Expediente Institucional — {alumno.nombre}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!editandoDocumento ? (
                  <button
                    onClick={() => setEditandoDocumento(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 text-slate-200 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    <span className="material-icons text-sm">edit</span>
                    Editar
                  </button>
                ) : (
                  <button
                    onClick={handleGuardarDocumento}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-xl shadow-black/5 shadow-green-600/20"
                  >
                    <span className="material-icons text-sm">save</span>
                    Guardar Cambios
                  </button>
                )}
                <button
                  onClick={() => printContent(documentoSeleccionado.titulo, documentoSeleccionado.contenido)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-black/5 shadow-blue-600/20"
                >
                  <span className="material-icons text-sm">print</span>
                  Imprimir
                </button>
                <div className="w-px h-6 bg-slate-200 mx-2" />
                <button
                  onClick={() => setDocumentoSeleccionado(null)}
                  className="p-2 hover:bg-slate-200 rounded-2xl transition-colors text-slate-600 hover:text-slate-600"
                >
                  <span className="material-icons">close</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-12 bg-slate-100/30 custom-scrollbar">
              <div className="max-w-[210mm] mx-auto bg-white shadow-xl border border-slate-200 min-h-full p-[2cm]">
                {editandoDocumento ? (
                  <textarea
                    value={contenidoTemp}
                    onChange={(e) => setContenidoTemp(e.target.value)}
                    className="w-full h-full min-h-[60vh] border-none focus:ring-0 p-0 text-[14px] font-serif leading-relaxed text-slate-800 resize-none overflow-hidden"
                    autoFocus
                  />
                ) : (
                  <div 
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(documentoSeleccionado.contenido) }}
                    className="document-content-preview text-[14px] font-serif leading-relaxed text-slate-800"
                  />
                )}
              </div>
            </div>
            
            {editandoDocumento && (
              <div className="px-6 py-3 bg-amber-50 border-t border-amber-100 flex items-center gap-2 text-[10px] text-amber-700 font-bold uppercase tracking-widest">
                <span className="material-icons text-[14px]">info</span>
                Estás en modo edición. Los cambios se guardarán directamente en el expediente institucional.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
