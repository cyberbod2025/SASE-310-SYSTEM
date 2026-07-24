import React, { useState, useEffect, useCallback, useMemo } from "react";
import DOMPurify from "dompurify";
import toast from "react-hot-toast";
import { useApp } from "../../store";
import { useAuth } from "../../components/AuthProvider";
import { useAuditoriaAccesos } from "../../hooks/useAuditoriaAccesos";
import { supabase } from "../../supabase/client";
import { printContent } from "../../components/PrintButtons";
import {
  TipoDocumentoInstitucional,
  DatosDocumento,
  TIPOS_DOCUMENTO,
} from "./types";
import { generarPlantillaHTML } from "./plantillas";
import { analizarDocumento, Advertencia } from "./detectarAdvertencias";
import {
  mejorarRedaccionInstitucional,
  detectarIncidenciasPrevias,
  hacerMasFormal,
  resumirTexto,
} from "./serviciosIA";
import { PanelAdvertencias } from "./PanelAdvertencias";
import { generarFolioInstitucional } from "./trazabilidad";
import { getDocumentosPorCategoria, CATEGORIAS_LABEL } from "./types";
import { SaseSplineOrb } from "../../components/SaseSplineOrb";
import { sanitizeHtml } from "../../utils/security";

interface GeneradorDocumentosProps {
  studentId: string;
  studentName: string;
  studentGroup: string;
  studentTutorName?: string;
  studentTutorRelationship?: string;
  incidentDescription?: string;
  onClose: () => void;
}

function obtenerCicloEscolar(fecha = new Date()): string {
  const anio = fecha.getFullYear();
  const iniciaNuevoCiclo = fecha.getMonth() >= 7;
  return iniciaNuevoCiclo ? `${anio}-${anio + 1}` : `${anio - 1}-${anio}`;
}

/**
 * Generador Institucional de Documentos SASE
 * - Citatorio a Padres
 * - Acta de Hechos
 * - Hoja de Acuerdos
 *
 * Flujo: Datos → IA genera borrador → Docente revisa/edita → PDF imprimible
 */
export const GeneradorDocumentos: React.FC<GeneradorDocumentosProps> = ({
  studentId,
  studentName,
  studentGroup,
  studentTutorName = "",
  studentTutorRelationship = "",
  incidentDescription = "",
  onClose,
}) => {
  const { currentUserRole } = useApp();
  const { user } = useAuth();
  const { logAccess } = useAuditoriaAccesos();

  // State
  const [tipoDoc, setTipoDoc] =
    useState<TipoDocumentoInstitucional>("acta_hechos");
  const [fase, setFase] = useState<
    "datos" | "generando" | "revision" | "listo"
  >("datos");
  const [contenidoIA, setContenidoIA] = useState("");
  const [contenidoEditado, setContenidoEditado] = useState("");
  const [htmlFinal, setHtmlFinal] = useState("");
  const [citatoriosPrevios, setCitatoriosPrevios] = useState(0);
  const [folio, setFolio] = useState("");
  const [documentoRegistrado, setDocumentoRegistrado] = useState(false);

  // Editor inteligente: advertencias y mejora de redacción
  const [incidenciasPrevias, setIncidenciasPrevias] = useState<{
    cantidad: number;
    resumen: string[];
  }>({ cantidad: 0, resumen: [] });
  const [mejorando, setMejorando] = useState(false);
  const [cambiosIA, setCambiosIA] = useState<string[]>([]);

  // Formulario de datos
  const [datos, setDatos] = useState<DatosDocumento>({
    alumno_nombre: studentName,
    alumno_id: studentId,
    grupo: studentGroup,
    docente_reporta: user?.email?.split("@")[0] || currentUserRole,
    fecha: new Date().toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    hora: new Date().toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    lugar_incidente: "Instalaciones del plantel",
    descripcion: incidentDescription,
    tipo_falta: "",
    testigos: "",
    acuerdos: [],
    fecha_citatorio: "",
    hora_citatorio: "",
    ciclo_escolar: obtenerCicloEscolar(),
    tutor_nombre: studentTutorName,
    tutor_parentesco: studentTutorRelationship,
    personal_prefectura: "",
    testigo_institucional: "",
    reflexion_alumno: "",
    compromiso_alumno: "",
    compromiso_familia: "",
    observaciones: "",
  });

  // Detección automática de incidencias previas
  useEffect(() => {
    detectarIncidenciasPrevias(supabase, studentId).then(setIncidenciasPrevias);
  }, [studentId]);

  // Verificar citatorios previos al seleccionar citatorio
  useEffect(() => {
    if (tipoDoc === "citatorio_padres") {
      checkCitatoriosPrevios();
    }
  }, [tipoDoc]); // eslint-disable-line react-hooks/exhaustive-deps

  // Análisis en tiempo real del texto editado
  const advertencias: Advertencia[] = useMemo(() => {
    const texto = fase === "datos" ? datos.descripcion : contenidoEditado;
    return analizarDocumento(texto, datos);
  }, [fase, datos, contenidoEditado]);

  const checkCitatoriosPrevios = useCallback(async () => {
    try {
      // Consultar documentos persistidos, no una tabla de auditoría legada.
      const { data, error } = await (supabase as any)
        .from("documentos_institucionales")
        .select("id")
        .eq("alumno_id", studentId)
        .eq("tipo", "citatorio_padres")
        .limit(10);

      if (error) throw error;
      setCitatoriosPrevios(data?.length ?? 0);
    } catch (error) {
      console.error("No se confirmó el historial de citatorios:", error);
      setCitatoriosPrevios(0);
    }
  }, [studentId]);

  // Generar borrador local para evitar transferir datos del caso.
  const handleGenerarBorrador = () => {
    if (!datos.descripcion.trim()) {
      toast.error("Ingrese una descripción del incidente");
      return;
    }

    setFase("generando");
    // Folio institucional: SASE-310-[TIPO]-[GRUPO]-[FECHA]-[ID]
    const nuevoFolio = generarFolioInstitucional(tipoDoc, datos.grupo);
    setFolio(nuevoFolio);
    setDocumentoRegistrado(false);

    const borradorLocal = generarTextoFallback(tipoDoc, datos);
    setContenidoIA(borradorLocal);
    setContenidoEditado(borradorLocal);
    setFase("revision");
    toast.success(
      "Borrador local generado; revise los hechos antes de continuar.",
    );
  };

  // Generar documento final
  const handleGenerarFinal = async () => {
    const html = generarPlantillaHTML(tipoDoc, datos, contenidoEditado, folio);
    setHtmlFinal(html);
    setFase("listo");

    // Registrar seguimiento institucional
    await logAccess({
      accion: "generar_documento_institucional",
      alumno_id: studentId,
      pantalla: `GeneradorDocumentos:${tipoDoc}:${folio}`,
    });

    if (!documentoRegistrado) {
      await registrarDocumentoInstitucional(html);
    }

    toast.success("Documento listo para revisión e impresión");
  };

  const registrarDocumentoInstitucional = async (html: string) => {
    try {
      const firmas = [
        datos.alumno_nombre,
        datos.tutor_nombre || "En preparación",
        datos.docente_reporta,
        datos.personal_prefectura || "En preparación",
        datos.testigo_institucional || "En preparación",
      ];

      const { error } = await (supabase as any)
        .from("documentos_institucionales")
        .insert({
          alumno_id: studentId,
          tipo: tipoDoc,
          folio,
          fecha: new Date().toISOString(),
          titulo: TIPOS_DOCUMENTO[tipoDoc].label,
          contenido: html,
          narracion_ia: contenidoIA || null,
          firmas,
          creado_por: user?.id || null,
        });

      if (error) throw error;

      setDocumentoRegistrado(true);
      toast.success("Documento registrado en expediente institucional");
    } catch (error) {
      console.error("[DOC_GEN] Error registrando acta:", error);
      toast.error(
        "Documento generado; registro en expediente: En preparación",
      );
    }
  };

  // Imprimir y cerrar
  const handleImprimir = async () => {
    printContent(
      `${TIPOS_DOCUMENTO[tipoDoc].label} — ${studentName}`,
      htmlFinal,
    );

    const auditConfirmed = await logAccess({
      accion: "imprimir_documento_institucional",
      alumno_id: studentId,
      pantalla: `GeneradorDocumentos:IMPRIMIR:${tipoDoc}:${folio}`,
    });

    if (auditConfirmed) {
      toast.success(
        "Documento enviado a impresión y trazabilidad confirmada.",
      );
    }
  };

  // UI del campo de datos
  const updateDato = (key: keyof DatosDocumento, value: any) => {
    setDatos((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-2 md:p-4 animate-fade-in font-['Inter']">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* === HEADER === */}
        <div className="px-8 py-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="size-12 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-400/30">
              <span className="material-symbols-outlined text-blue-400 text-2xl">
                auto_awesome
              </span>
            </div>
            <div>
              <h2 className="text-lg font-black uppercase italic tracking-tight">
                Generador Institucional
              </h2>
              <p className="text-[10px] font-bold text-blue-300 uppercase tracking-[0.2em]">
                Documentos Oficiales — SASE-310
              </p>
            </div>
          </div>

          {/* Indicador de fase */}
          <div className="flex items-center gap-2">
            {(["datos", "generando", "revision", "listo"] as const).map(
              (f, i) => (
                <div key={f} className="flex items-center gap-1">
                  <div
                    className={`size-2.5 rounded-full transition-all ${
                      fase === f
                        ? "bg-blue-400 shadow-lg shadow-blue-400/50 scale-125"
                        : i <
                            ["datos", "generando", "revision", "listo"].indexOf(
                              fase,
                            )
                          ? "bg-emerald-400"
                          : "bg-white/20"
                    }`}
                  />
                  {i < 3 && <div className="w-4 h-px bg-white/10" />}
                </div>
              ),
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
            title="Cerrar generador"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* === CUERPO === */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          {/* ADVERTENCIA CITATORIO PREVIO */}
          {tipoDoc === "citatorio_padres" && citatoriosPrevios > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 animate-fade-in">
              <span className="material-symbols-outlined text-amber-500 text-2xl">
                warning
              </span>
              <div>
                <p className="text-xs font-black text-amber-800 uppercase">
                  ⚠️ Citatorio previo detectado
                </p>
                <p className="text-[11px] text-amber-700 font-medium">
                  Se encontraron <strong>{citatoriosPrevios}</strong> citatorios
                  anteriores para este alumno en el sistema. Considere el
                  historial antes de generar uno nuevo.
                </p>
              </div>
            </div>
          )}

          {/* FASE 1: DATOS */}
          {fase === "datos" && (
            <div className="space-y-5 animate-fade-in">
              {/* Selector de tipo organizado por categorías */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  Centro Documental — Tipo de Documento
                </label>
                {(
                  Object.entries(getDocumentosPorCategoria()) as [
                    string,
                    TipoDocumentoInstitucional[],
                  ][]
                ).map(([cat, tipos]) => (
                  <div key={cat} className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-sm text-slate-400">
                        {
                          CATEGORIAS_LABEL[cat as keyof typeof CATEGORIAS_LABEL]
                            .icon
                        }
                      </span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        {
                          CATEGORIAS_LABEL[cat as keyof typeof CATEGORIAS_LABEL]
                            .label
                        }
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {tipos.map((key) => {
                        const val = TIPOS_DOCUMENTO[key];
                        return (
                          <button
                            key={key}
                            onClick={() => {
                              setTipoDoc(key);
                              setDocumentoRegistrado(false);
                            }}
                            className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 ${
                              tipoDoc === key
                                ? "border-blue-400 bg-blue-50 shadow-sm"
                                : "border-slate-200 hover:border-slate-300 bg-white"
                            }`}
                          >
                            <span
                              className={`material-symbols-outlined text-xl ${
                                tipoDoc === key
                                  ? "text-blue-500"
                                  : "text-slate-400"
                              }`}
                            >
                              {val.icon}
                            </span>
                            <span
                              className={`text-[9px] font-black uppercase tracking-wide text-center leading-tight ${
                                tipoDoc === key
                                  ? "text-blue-700"
                                  : "text-slate-500"
                              }`}
                            >
                              {val.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Datos del alumno (readonly) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Alumno(a)
                  </label>
                  <input
                    type="text"
                    value={datos.alumno_nombre}
                    disabled
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 text-sm font-black text-slate-600"
                    title="Nombre del alumno"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Grupo
                  </label>
                  <input
                    type="text"
                    value={datos.grupo}
                    disabled
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 text-sm font-black text-slate-600"
                    title="Grupo del alumno"
                  />
                </div>
              </div>

              {/* Datos editables */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Lugar del Incidente
                  </label>
                  <input
                    type="text"
                    value={datos.lugar_incidente}
                    onChange={(e) =>
                      updateDato("lugar_incidente", e.target.value)
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Ej: Patio central, Aula 3B..."
                    title="Lugar donde ocurrió el incidente"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Tipo de Falta (Marco Convivencia)
                  </label>
                  <select
                    value={datos.tipo_falta}
                    onChange={(e) => updateDato("tipo_falta", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    title="Clasificación de la falta"
                  >
                    <option value="">Sin clasificar</option>
                    <option value="Tipo I - Leve">
                      Tipo I — Leve (Disciplina Básica)
                    </option>
                    <option value="Tipo II - Moderada">
                      Tipo II — Moderada (Falta al Reglamento)
                    </option>
                    <option value="Tipo III - Grave">
                      Tipo III — Grave (Afecta Integridad / Seguridad)
                    </option>
                  </select>
                </div>
              </div>

              {/* Citatorio: fecha y hora de cita */}
              {tipoDoc === "citatorio_padres" && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div>
                    <label className="block text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1.5">
                      Fecha del Citatorio
                    </label>
                    <input
                      type="date"
                      value={datos.fecha_citatorio}
                      onChange={(e) =>
                        updateDato("fecha_citatorio", e.target.value)
                      }
                      className="w-full bg-white border border-amber-200 rounded-xl p-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-amber-500 outline-none"
                      title="Fecha en que se cita al tutor"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1.5">
                      Hora del Citatorio
                    </label>
                    <input
                      type="time"
                      value={datos.hora_citatorio}
                      onChange={(e) =>
                        updateDato("hora_citatorio", e.target.value)
                      }
                      className="w-full bg-white border border-amber-200 rounded-xl p-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-amber-500 outline-none"
                      title="Hora en que se cita al tutor"
                    />
                  </div>
                </div>
              )}

              {tipoDoc === "acta_corresponsabilidad" && (
                <div className="space-y-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">
                      Datos para acta de corresponsabilidad
                    </p>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-widest">
                      Autollenado de personal: En preparación
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1.5">
                        Ciclo Escolar
                      </label>
                      <input
                        type="text"
                        value={datos.ciclo_escolar}
                        onChange={(e) =>
                          updateDato("ciclo_escolar", e.target.value)
                        }
                        className="w-full bg-white border border-indigo-200 rounded-xl p-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                        title="Ciclo escolar del acta"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1.5">
                        Madre, Padre o Tutor
                      </label>
                      <input
                        type="text"
                        value={datos.tutor_nombre}
                        onChange={(e) =>
                          updateDato("tutor_nombre", e.target.value)
                        }
                        className="w-full bg-white border border-indigo-200 rounded-xl p-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="En preparación"
                        title="Nombre del tutor que comparece"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1.5">
                        Parentesco
                      </label>
                      <input
                        type="text"
                        value={datos.tutor_parentesco}
                        onChange={(e) =>
                          updateDato("tutor_parentesco", e.target.value)
                        }
                        className="w-full bg-white border border-indigo-200 rounded-xl p-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="En preparación"
                        title="Relación del tutor con el alumno"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1.5">
                        Personal que Atiende
                      </label>
                      <input
                        type="text"
                        value={datos.docente_reporta}
                        onChange={(e) =>
                          updateDato("docente_reporta", e.target.value)
                        }
                        className="w-full bg-white border border-indigo-200 rounded-xl p-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                        title="Docente tutor o personal que atiende la reunión"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1.5">
                        Prefectura
                      </label>
                      <input
                        type="text"
                        value={datos.personal_prefectura}
                        onChange={(e) =>
                          updateDato("personal_prefectura", e.target.value)
                        }
                        className="w-full bg-white border border-indigo-200 rounded-xl p-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="En preparación"
                        title="Personal de prefectura que comparece"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1.5">
                        Testigo Institucional
                      </label>
                      <input
                        type="text"
                        value={datos.testigo_institucional}
                        onChange={(e) =>
                          updateDato("testigo_institucional", e.target.value)
                        }
                        className="w-full bg-white border border-indigo-200 rounded-xl p-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="En preparación"
                        title="Testigo institucional si asiste"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Descripción */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Descripción de los Hechos
                </label>
                <textarea
                  rows={5}
                  value={datos.descripcion}
                  onChange={(e) => updateDato("descripcion", e.target.value)}
                  placeholder="Describa de forma objetiva lo sucedido. La IA estructurará el documento con lenguaje institucional formal..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  title="Narración objetiva de los hechos"
                />
              </div>

              {/* Testigos */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Testigos (opcional)
                </label>
                <input
                  type="text"
                  value={datos.testigos}
                  onChange={(e) => updateDato("testigos", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Nombres de testigos presenciales..."
                  title="Testigos presentes durante el incidente"
                />
              </div>

              {tipoDoc === "acta_corresponsabilidad" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                      Reflexión del Alumno
                    </label>
                    <textarea
                      rows={3}
                      value={datos.reflexion_alumno}
                      onChange={(e) =>
                        updateDato("reflexion_alumno", e.target.value)
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="En preparación"
                      title="Reflexión del alumno"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                      Compromiso del Alumno
                    </label>
                    <textarea
                      rows={3}
                      value={datos.compromiso_alumno}
                      onChange={(e) =>
                        updateDato("compromiso_alumno", e.target.value)
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="En preparación"
                      title="Compromiso personal del alumno"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                      Compromiso de la Familia
                    </label>
                    <textarea
                      rows={3}
                      value={datos.compromiso_familia}
                      onChange={(e) =>
                        updateDato("compromiso_familia", e.target.value)
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="En preparación"
                      title="Compromiso de la familia"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                      Observaciones Adicionales
                    </label>
                    <textarea
                      rows={3}
                      value={datos.observaciones}
                      onChange={(e) =>
                        updateDato("observaciones", e.target.value)
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="En preparación"
                      title="Observaciones adicionales"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FASE 2: GENERANDO */}
          {fase === "generando" && (
            <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
              <div className="relative mb-6">
                <SaseSplineOrb state="thinking" className="size-32 md:size-48" />
              </div>
              <h3 className="text-lg font-black text-slate-700 italic uppercase tracking-tight">
                IA-SASE Analizando...
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-2">
                Generando borrador institucional con base en el Marco para la
                Convivencia Escolar
              </p>
            </div>
          )}

          {/* FASE 3: REVISIÓN Y EDICIÓN CON EDITOR INTELIGENTE */}
          {fase === "revision" && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-emerald-600 text-lg">
                      edit_note
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-700 uppercase tracking-wide">
                      Editor Inteligente — Revise y Edite
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Folio:{" "}
                      <span className="font-mono font-bold">{folio}</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {/* Botón mejorar redacción con IA */}
                  <button
                    disabled={mejorando}
                    onClick={async () => {
                      setMejorando(true);
                      try {
                        const { textoMejorado, cambiosRealizados } =
                          await mejorarRedaccionInstitucional(contenidoEditado);
                        setContenidoEditado(textoMejorado);
                        setCambiosIA(cambiosRealizados);
                        toast.success("Redacción mejorada por IA-SASE");
                      } catch {
                        toast.error("Error al mejorar redacción");
                      } finally {
                        setMejorando(false);
                      }
                    }}
                    className="px-3 py-2 text-[9px] font-black text-blue-600 bg-blue-50 border border-blue-200 uppercase tracking-widest hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    title="IA mejora la redacción manteniendo objetividad institucional"
                  >
                    <span
                      className={`material-symbols-outlined text-sm ${mejorando ? "animate-spin" : ""}`}
                    >
                      {mejorando ? "progress_activity" : "auto_fix_high"}
                    </span>
                    {mejorando ? "Procesando..." : "Mejorar Redacción"}
                  </button>
                  {/* Botón hacer más formal */}
                  <button
                    disabled={mejorando}
                    onClick={async () => {
                      setMejorando(true);
                      try {
                        const resultado =
                          await hacerMasFormal(contenidoEditado);
                        setContenidoEditado(resultado);
                        setCambiosIA([
                          "Texto formalizado con lenguaje institucional",
                        ]);
                        toast.success("Texto formalizado");
                      } catch {
                        toast.error("Error al formalizar");
                      } finally {
                        setMejorando(false);
                      }
                    }}
                    className="px-3 py-2 text-[9px] font-black text-indigo-600 bg-indigo-50 border border-indigo-200 uppercase tracking-widest hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    title="Hace el texto más formal e institucional"
                  >
                    <span className="material-symbols-outlined text-sm">
                      school
                    </span>
                    Hacer Formal
                  </button>
                  {/* Botón resumir */}
                  <button
                    disabled={mejorando}
                    onClick={async () => {
                      setMejorando(true);
                      try {
                        const resultado = await resumirTexto(contenidoEditado);
                        setContenidoEditado(resultado);
                        setCambiosIA(["Texto resumido al 50-60% del original"]);
                        toast.success("Texto resumido");
                      } catch {
                        toast.error("Error al resumir");
                      } finally {
                        setMejorando(false);
                      }
                    }}
                    className="px-3 py-2 text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 uppercase tracking-widest hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    title="Resume el texto manteniendo datos clave"
                  >
                    <span className="material-symbols-outlined text-sm">
                      compress
                    </span>
                    Resumir
                  </button>
                  <button
                    onClick={() => {
                      setFase("datos");
                      setContenidoIA("");
                      setContenidoEditado("");
                      setCambiosIA([]);
                    }}
                    className="px-3 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-100 rounded-lg transition-colors"
                    title="Volver a los datos"
                  >
                    ← Volver
                  </button>
                </div>
              </div>

              {/* Cambios realizados por IA */}
              {cambiosIA.length > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-wide mb-2">
                    Cambios realizados por IA:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {cambiosIA.map((c, i) => (
                      <span
                        key={i}
                        className="text-[10px] text-blue-700 bg-white px-2 py-1 rounded-lg border border-blue-100 font-medium"
                      >
                        ✓ {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Layout editor + advertencias */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Editor principal */}
                <div className="lg:col-span-2">
                  <textarea
                    rows={14}
                    value={contenidoEditado}
                    onChange={(e) => setContenidoEditado(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-6 text-sm font-serif text-slate-700 leading-relaxed focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    title="Edite el borrador generado por la IA antes de generar el documento final"
                  />
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold mt-2">
                    <span className="material-symbols-outlined text-sm">
                      info
                    </span>
                    Edite el texto libremente. Use "Mejorar Redacción" para que
                    la IA corrija el tono institucional.
                  </div>
                </div>

                {/* Panel de advertencias lateral */}
                <div className="space-y-3">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Análisis en Tiempo Real
                  </p>
                  <PanelAdvertencias
                    advertencias={advertencias}
                    incidenciasPrevias={incidenciasPrevias}
                  />
                </div>
              </div>
            </div>
          )}

          {/* FASE 4: DOCUMENTO LISTO */}
          {fase === "listo" && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-600 text-lg">
                    check_circle
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-black text-emerald-700 uppercase tracking-wide">
                    Documento Listo para Impresión
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Folio: <span className="font-mono font-bold">{folio}</span>
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-inner max-h-[50vh] overflow-y-auto">
                <div
                  className="prose prose-slate max-w-none text-slate-700 leading-relaxed font-serif"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(htmlFinal),
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* === FOOTER / ACCIONES === */}
        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-slate-200 rounded-xl transition-colors"
            title="Cancelar y cerrar"
          >
            Cancelar
          </button>

          <div className="flex gap-3">
            {fase === "datos" && (
              <button
                disabled={!datos.descripcion.trim()}
                onClick={handleGenerarBorrador}
                className="px-8 py-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-lg disabled:opacity-40 transition-all flex items-center gap-2"
                title="Generar borrador con inteligencia artificial"
              >
                <span className="material-symbols-outlined text-lg">
                  auto_awesome
                </span>
                Generar con IA
              </button>
            )}

            {fase === "revision" && (
              <button
                onClick={handleGenerarFinal}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-lg transition-all flex items-center gap-2"
                title="Generar documento final con formato institucional"
              >
                <span className="material-symbols-outlined text-lg">
                  description
                </span>
                Generar Documento Final
              </button>
            )}

            {fase === "listo" && (
              <>
                <button
                  onClick={() => setFase("revision")}
                  className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                  title="Volver a editar el texto"
                >
                  ← Editar
                </button>
                <button
                  onClick={handleImprimir}
                  className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:shadow-xl hover:shadow-amber-500/20 transition-all flex items-center gap-2 active:scale-95"
                  title="Imprimir documento oficial"
                >
                  <span className="material-symbols-outlined text-lg">
                    print
                  </span>
                  Imprimir Documento
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Texto fallback cuando no hay conexión con IA
function generarTextoFallback(
  tipo: TipoDocumentoInstitucional,
  datos: DatosDocumento,
): string {
  switch (tipo) {
    case "citatorio_padres":
      return `La Dirección de la Escuela Secundaria Diurna No. 310 "José Ma. Morelos y Pavón" se dirige a usted, padre, madre de familia o tutor del alumno(a) ${datos.alumno_nombre} del grupo ${datos.grupo}, para solicitarle de la manera más atenta su presencia en este plantel educativo.

Lo anterior con motivo de la siguiente situación reportada:

${datos.descripcion}

Su presencia es necesaria para abordar la situación de manera corresponsable, conforme a lo establecido en el Marco para la Convivencia Escolar y la legislación educativa vigente.

En caso de no presentarse en la fecha señalada, se procederá conforme a la normatividad aplicable.

Agradecemos su atención y colaboración en beneficio del desarrollo integral de su hijo(a).`;

    case "acta_hechos":
      return `Siendo las ${datos.hora} horas del día ${datos.fecha}, en las instalaciones de la Escuela Secundaria Diurna No. 310 "José Ma. Morelos y Pavón", ubicada en la Ciudad de México, se hace constar lo siguiente:

ANTECEDENTES:
El/La docente ${datos.docente_reporta} reporta la siguiente situación respecto al alumno(a) ${datos.alumno_nombre}, inscrito(a) en el grupo ${datos.grupo}.

NARRACIÓN DE HECHOS:
${datos.descripcion}

Lugar de los hechos: ${datos.lugar_incidente}
${datos.testigos ? `Testigos: ${datos.testigos}` : ""}

CLASIFICACIÓN SEGÚN EL MARCO PARA LA CONVIVENCIA ESCOLAR:
${datos.tipo_falta || "Pendiente de clasificación por las autoridades del plantel."}

ACCIONES FORMATIVAS SUGERIDAS:
Se sugiere abordar la situación mediante el diálogo formativo con el alumno(a) y, de ser necesario, convocar al padre, madre de familia o tutor para establecer acuerdos de corresponsabilidad.

Se deja constancia de los hechos para los efectos administrativos y formativos correspondientes.`;

    case "acta_corresponsabilidad":
      return `Se hace constar que, con fecha ${datos.fecha}, se atendió una situación relacionada con el alumno(a) ${datos.alumno_nombre}, inscrito(a) en el grupo ${datos.grupo}.

Hechos reportados:
${datos.descripcion}

Lugar de los hechos: ${datos.lugar_incidente}
${datos.testigos ? `Testigos: ${datos.testigos}` : "Testigos: En preparación"}

La intervención se registra con carácter preventivo, formativo y de acompañamiento, privilegiando el interés superior del estudiante, la corresponsabilidad familia-escuela y la mejora de la convivencia escolar.`;

    case "hoja_acuerdos":
      return `Con fecha ${datos.fecha}, en las instalaciones de la Escuela Secundaria Diurna No. 310, se llevó a cabo reunión con motivo de dar seguimiento a la situación del alumno(a) ${datos.alumno_nombre} del grupo ${datos.grupo}.

ANTECEDENTES:
${datos.descripcion}

PARTICIPANTES:
- ${datos.docente_reporta} (Personal del plantel)
- Padre/Madre de Familia o Tutor
- Alumno(a): ${datos.alumno_nombre}

ACUERDOS Y COMPROMISOS:
1. El alumno(a) se compromete a conducirse con respeto y apego al reglamento escolar.
2. El padre/madre de familia o tutor se compromete a dar seguimiento al comportamiento y desempeño académico de su hijo(a).
3. El plantel brindará el acompañamiento formativo necesario para favorecer la sana convivencia.

SEGUIMIENTO:
Se acuerda una revisión de cumplimiento en un plazo de 15 días hábiles.

El presente documento es de carácter formativo y busca favorecer la sana convivencia escolar en beneficio del alumno(a).`;

    default:
      return datos.descripcion;
  }
}
