import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../supabase/client";
import { User } from "@supabase/supabase-js";
import type { Database } from "../../supabase/types";
import {
  Student,
  Incident,
  IncidentType,
  CaseState,
  Justificante,
  Calificacion,
  DocumentoInstitucional,
  BAPInfo,
  AppModule,
  UserRole,
  AuditActionType,
  ObjetoRetenido,
  EstadoObjetoRetenido,
  BehaviorMetric,
} from "../../types";
import { evaluateEscalation } from "../../utils/saseUtils";
import { sendWhatsAppNotification } from "../../utils/notifications";
import { requireAuditSuccess, type AuditResult } from "./useAuditLogic";
import toast from "react-hot-toast";

type TipoIncidencia = Database["public"]["Enums"]["tipo_incidencia"];
type EstadoCasoDB = Database["public"]["Enums"]["estado_caso_alumno"];

const mapIncidentTypeToDB = (type: IncidentType): TipoIncidencia => {
  switch (type) {
    case IncidentType.RETARDO: return "retardo";
    case IncidentType.CONDUCTA: return "conducta";
    case IncidentType.UNIFORME: return "uniforme";
    case IncidentType.ASISTENCIA: return "asistencia";
    case IncidentType.ACADEMICO: return "academica";
    case IncidentType.SOCIOEMOCIONAL: return "socioemocional";
    case IncidentType.SALUD: return "salud";
    default: return "otro";
  }
};

const mapCaseStateToDB = (state: CaseState): EstadoCasoDB => {
  switch (state) {
    case CaseState.OBSERVADO: return "observado";
    case CaseState.INTERVENCION: return "intervencion";
    case CaseState.SEGUIMIENTO: return "seguimiento";
    default: return "normal";
  }
};

const PERSISTENCE_ERROR_MESSAGE = "No se pudo registrar por permisos o validación institucional.";

const isIncidentType = (value: unknown): value is IncidentType =>
  Object.values(IncidentType).includes(value as IncidentType);

interface PersistedIncidentEffectsInput {
  studentId: string;
  type: IncidentType;
  description: string;
  incidentId: string;
  incidentDate?: string;
  evidence?: string[];
}

// Production: No fictional data — students are loaded from Supabase
const INITIAL_STUDENTS: Student[] = []; // v4.1 Sync

export const useStudentsSlice = (
  user: User | null,
  currentUserRole: UserRole,
  addNotification: (notif: any) => void,
  logAudit: (
    type: AuditActionType,
    desc: string,
    table: string,
    id: string,
    name?: string,
  ) => Promise<AuditResult>,
  fetchDailyStats: () => Promise<void>,
  profile?: any,
) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<any[]>([]);

  const applyIncidentSideEffects = useCallback(async ({
    studentId,
    type,
    description,
    incidentId,
    incidentDate,
    evidence,
  }: PersistedIncidentEffectsInput) => {
    const cleanDescription = String(description ?? "").trim();
    const student = students.find((s) => s.id === studentId);
    const reporterName = profile?.nombre_completo || profile?.nombres || user?.email || "SASE-System";

    if (!student || !isIncidentType(type) || !cleanDescription || !incidentId) {
      toast.error(PERSISTENCE_ERROR_MESSAGE);
      return false;
    }

    const savedIncidentDate = incidentDate || new Date().toISOString();
    const newIncidentLocal: Incident = {
      id: incidentId,
      studentId,
      type,
      description: cleanDescription,
      date: savedIncidentDate,
      reportedBy: currentUserRole,
      evidence,
      reporta: reporterName,
      notificado_whatsapp: false,
    };

    const previousIncidents = student.incidents || [];
    const escalationResult = evaluateEscalation(newIncidentLocal, previousIncidents);
    const shouldDetectPattern =
      previousIncidents.length + 1 >= 3 && student.caseState === CaseState.OBSERVADO;

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        return {
          ...s,
          incidents: [newIncidentLocal, ...(s.incidents || [])],
          caseState: shouldDetectPattern ? CaseState.PATRON_DETECTADO : s.caseState,
        };
      }),
    );

    if (shouldDetectPattern) {
      addNotification({
        title: "🚨 PATRÓN DE RIESGO DETECTADO",
        message: `El estudiante ${student.name} ha alcanzado el umbral de 3 incidencias.`,
        type: "error",
        targetRole: UserRole.ORIENTACION,
        actionModule: AppModule.REPORTES,
      });
    }

    if (type === IncidentType.RETARDO || type === IncidentType.ASISTENCIA) {
      fetchDailyStats();
    }

    if (escalationResult?.notifyRoles) {
      const { notifyRoles, priority, message, protocolId } = escalationResult;

      notifyRoles.forEach((role: UserRole) => {
        addNotification({
          title:
            priority === "CRITICAL"
              ? "🚨 PROTOCOLO CRÍTICO"
              : "Aviso de Seguimiento",
          message: `${message} (Alumno: ${student.name || "N/A"})`,
          type: priority === "CRITICAL" ? "error" : "warning",
          targetRole: role,
          actionModule: protocolId ? AppModule.PROTOCOLOS : AppModule.REPORTES,
          actionData: { protocolId },
        });
      });

      if (priority === "CRITICAL" && student.guardianInfo?.phonePrimary) {
        const whatsappMsg = `SASE-310 ALERTA: Se ha activado un protocolo de ${message} para el alumno ${student.name}. Por favor, comuníquese con la institución.`;

        sendWhatsAppNotification({
          to: student.guardianInfo.phonePrimary,
          message: whatsappMsg,
          studentName: student.name,
          incidentType: type,
        }).then(res => {
          if (res.success) {
            console.log("WhatsApp enviado correctamente");
          } else {
            console.warn("Fallo al enviar WhatsApp:", res.error);
          }
        });
      }

      if (priority === "CRITICAL") {
        toast.error(`¡ACTIVACIÓN DE PROTOCOLO! ${message}`, { duration: 6000 });
        logAudit(
          "CREACION",
          `Protocolo Activado: ${message}`,
          "incidencias",
          newIncidentLocal.id,
          student.name,
        );
      }
    }

    toast.success("Incidencia registrada institucionalmente");
    return true;
  }, [
    addNotification,
    currentUserRole,
    fetchDailyStats,
    logAudit,
    profile?.nombre_completo,
    profile?.nombres,
    students,
    user?.email,
  ]);

  const fetchGroups = useCallback(async () => {
    if (!user) {
      setGroups([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("grupos")
        .select("*")
        .order("nombre");

      if (error) {
        if (import.meta.env.DEV) {
          console.warn("Error fetching groups");
        }
        return;
      }

      if (data) setGroups(data);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn("Unexpected error fetching groups");
      }
    }
  }, [user]);

  const fetchStudents = useCallback(async () => {
    if (!user) {
      setStudents(INITIAL_STUDENTS);
      return;
    }

    try {
      const { data, error } = await supabase.from("alumnos").select(`
          *,
          incidencias (
            id, tipo, descripcion, creado_en, reportado_por, fecha, estado, reporta, clasificacion, gravedad, notificado_whatsapp
          ),
          justificantes (
            id, folio, fecha_inicio, fecha_fin, motivo, descripcion, creado_en, emitido_por
          ),
          salud (
            padecimiento, documento_url
          ),
          calificaciones (
            id, materia, trimestre1, trimestre2, trimestre3, promedio_final, ciclo_escolar
          ),
          documentos_institucionales (
            id, tipo, folio, fecha, titulo, contenido, narracionIA:narracion_ia, firmas, creado_por
          ),
          objetos_retenidos (
            id, objeto, motivo, fecha, responsable_id, responsable_nombre, responsable_rol, 
            estado, incidencia_id, created_at, fecha_devolucion, entregado_a, entregado_por, 
            lugar_retencion, categoria, observaciones, evidencia_url, autorizado_por
          ),
          behavior_metrics (
            id, alumno_id, fecha, calidad, consistencia, frecuencia, tendencia, deriva_score, nivel_deriva, estado_datos, created_at
          )
        `);

      if (error) {
        console.error("Error fetching students:", error);
        toast.error("No se pudieron cargar los datos de los alumnos.");
        return;
      }

      if (data) {
        const mappedStudents: Student[] = data.map((d: any): Student => ({
          id: d.id,
          matricula: d.matricula,
          curp: d.curp,
          name: d.nombre_completo,
          group: d.grupo,
          avatar: d.avatar_url || '/SASE_ICON.png',
          caseState: (d.estado_semaforo as CaseState) || CaseState.CERRADO,
          puntajeRiesgo: d.puntaje_riesgo,
          estadoSemaforo: d.estado_semaforo,
          fechaCalculoRiesgo: d.fecha_calculo_riesgo,
          riesgoDisciplina: d.riesgo_disciplina,
          riesgoAsistencia: d.riesgo_asistencia,
          riesgoAcademico: d.riesgo_academico,
          riesgoSocioemocional: d.riesgo_socioemocional,
          incidents: (d.incidencias || []).map((i: any): Incident => ({
            id: i.id,
            studentId: d.id,
            type: i.tipo,
            description: i.descripcion,
            date: i.fecha || i.creado_en || "",
            reportedBy: i.reportado_por,
            gravedad: i.gravedad,
            estado: i.estado,
            clasificacion: i.clasificacion,
            notificado_whatsapp: i.notificado_whatsapp,
          })),
          justificantes: (d.justificantes || []).map((j: any): Justificante => ({
            id: j.id,
            folio: j.folio,
            startDate: j.fecha_inicio,
            endDate: j.fecha_fin,
            reason: j.motivo,
            description: j.descripcion,
            issuedAt: j.creado_en,
            issuedBy: j.emitido_por,
          })),
          medicalAlerts: (d.salud || [])
            .map((s: any) => s.padecimiento)
            .filter(Boolean),
          lastModifiedBy: d.modificado_por,
          lastModifiedAt: d.modificado_en,
          guardianInfo: d.datos_tutor || undefined,
          bapInfo: d.datos_bap
            ? {
                hasBAP: !!d.datos_bap.hasBAP,
                diagnosisPrivate: d.datos_bap.diagnosisPrivate || "",
                accommodations: d.datos_bap.accommodations || [],
                lastUpdated: d.datos_bap.lastUpdated || "",
              }
            : {
                hasBAP: false,
                diagnosisPrivate: "",
                accommodations: [],
                lastUpdated: "",
              },
          calificaciones: (d.calificaciones || []).map((c: any): Calificacion => ({
            materia: c.materia,
            trimestre1: c.trimestre1,
            trimestre2: c.trimestre2,
            trimestre3: c.trimestre3,
            promedioFinal: c.promedio_final,
          })),
          documentos: (d.documentos_institucionales || []).map((doc: any): DocumentoInstitucional => ({
            id: doc.id,
            tipo: doc.tipo,
            folio: doc.folio,
            fecha: doc.fecha,
            titulo: doc.titulo,
            contenido: doc.contenido,
            narracionIA: doc.narracionIA,
            firmas: doc.firmas || [],
            creado_por: doc.creado_por,
            studentId: d.id,
          })),
          isDistancia: !!d.is_distancia,
          objetosRetenidos: (d.objetos_retenidos || []).map((o: any): ObjetoRetenido => ({
            id: o.id,
            alumno_id: d.id,
            studentId: d.id,
            studentName: d.nombre_completo,
            group: d.grupo,
            objeto: o.objeto,
            motivo: o.motivo,
            fecha: o.fecha,
            responsable_id: o.responsable_id,
            responsableId: o.responsable_id,
            responsableNombre: o.responsable_nombre,
            responsableRol: o.responsable_rol,
            estado: o.estado as EstadoObjetoRetenido,
            incidencia_id: o.incidencia_id,
            incidenciaId: o.incidencia_id,
            fechaDevolucion: o.fecha_devolucion,
            entregadoA: o.entregado_a,
            entregadoPor: o.entregado_por,
            lugarRetencion: o.lugar_retencion,
            categoria: o.categoria,
            observaciones: o.observaciones,
            evidenciaUrl: o.evidencia_url,
            autorizadoPor: o.autorizado_por,
            created_at: o.created_at,
          })),
          behaviorMetrics: (d.behavior_metrics || [])
            .map((metric: any): BehaviorMetric => ({
              id: metric.id,
              alumnoId: metric.alumno_id,
              fecha: metric.fecha,
              calidad: Number(metric.calidad || 0),
              consistencia: Number(metric.consistencia || 0),
              frecuencia: Number(metric.frecuencia || 0),
              tendencia: Number(metric.tendencia || 0),
              derivaScore: Number(metric.deriva_score || 0),
              nivelDeriva: metric.nivel_deriva || "estable",
              estadoDatos: metric.estado_datos || "activo",
              createdAt: metric.created_at,
            }))
            .sort(
              (a: BehaviorMetric, b: BehaviorMetric) =>
                new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
            ),
        }));
        setStudents(mappedStudents);
      }
    } catch (err: any) {
      console.error("Unexpected error fetching students:", err);
      toast.error("Error crítico de sincronización.");
    }
  }, [user]);

  const addIncident = async (
    studentId: string,
    type: IncidentType,
    description: string,
    evidence?: string[],
  ) => {
    const tempId = Math.random().toString(36).substr(2, 9);

    try {
      const cleanDescription = String(description ?? "").trim();
      const student = students.find((s) => s.id === studentId);

      if (!user || !student || !isIncidentType(type) || !cleanDescription) {
        toast.error(PERSISTENCE_ERROR_MESSAGE);
        return false;
      }

      const incidentDate = new Date().toISOString();
      const { error } = await supabase.from("incidencias").insert([
        {
          alumno_id: studentId,
          tipo: mapIncidentTypeToDB(type),
          descripcion: cleanDescription,
          reportado_por: user.id,
          fecha: incidentDate,
        },
      ]);
      if (error) throw error;

      return await applyIncidentSideEffects({
        studentId,
        type,
        description: cleanDescription,
        evidence,
        incidentId: tempId,
        incidentDate,
      });
    } catch (err: any) {
      console.warn("Error al guardar incidencia", err);
      toast.error(PERSISTENCE_ERROR_MESSAGE);
      return false;
    }
  };

  const addJustificante = async (studentId: string, data: any) => {
    const folio = `JUST-${Math.floor(Math.random() * 10000)}`;
    const newJustLocal: Justificante = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      folio,
      issuedAt: new Date().toISOString(),
    };

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        return {
          ...s,
          justificantes: [newJustLocal, ...s.justificantes],
          isDistancia: data.isDistancia || s.isDistancia,
        };
      }),
    );

    try {
      const { error } = await supabase.from("justificantes").insert([
        {
          alumno_id: studentId,
          folio,
          fecha_inicio: data.startDate,
          fecha_fin: data.endDate,
          motivo: data.reason,
          descripcion: data.description,
          emitido_por: user?.id,
          trabajo_distancia: data.isDistancia || false,
        },
      ]);
      if (error) throw error;
      if (data.isDistancia) {
        await supabase
          .from("alumnos")
          .update({ is_distancia: true })
          .eq("id", studentId);
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn("Error al guardar justificante");
      }
    }
  };

  const updateGrades = async (studentId: string, grades: Calificacion[]) => {
    if (
      currentUserRole !== UserRole.SECRETARIA &&
      currentUserRole !== UserRole.DEVELOPER
    ) {
      throw new Error("Acceso denegado");
    }
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId ? { ...s, calificaciones: grades } : s,
      ),
    );
    try {
      await supabase.from("calificaciones").upsert(
        grades.map((g) => ({
          alumno_id: studentId,
          materia: g.materia,
          trimestre1: g.trimestre1,
          trimestre2: g.trimestre2,
          trimestre3: g.trimestre3,

        })),
        { onConflict: "alumno_id,materia" },
      );
      logAudit(
        "ACTUALIZACION",
        "Calificaciones actualizadas",
        "calificaciones",
        studentId,
      );
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn("Error al actualizar calificaciones");
      }
    }
  };

  const updateBapInfo = async (studentId: string, bapData: BAPInfo) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, bapInfo: bapData } : s)),
    );
    try {
      await supabase
        .from("alumnos")
        .update({
            datos_bap: { ...bapData, lastUpdated: new Date().toISOString() },
        })
        .eq("id", studentId);
      toast.success("Información UDEII actualizada");
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn("Error al actualizar informacion UDEII");
      }
    }
  };

  const toggleDistanceState = async (
    studentId: string,
    isDistancia: boolean,
  ) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, isDistancia } : s)),
    );
    try {
      await supabase
        .from("alumnos")
        .update({ is_distancia: isDistancia })
        .eq("id", studentId);
      logAudit(
        "ACTUALIZACION",
        `Modo ${isDistancia ? "Distancia" : "Presencial"}`,
        "alumnos",
        studentId,
      );
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn("Error al actualizar estado de distancia");
      }
    }
  };

  const importStudents = (newStudents: Student[]) => {
    setStudents((prev) => [...prev, ...newStudents]);
  };

  const addDocumentoInstitucional = async (doc: Omit<DocumentoInstitucional, "id">) => {
    try {
      const { data, error } = await (supabase as any)
        .from("documentos_institucionales")
        .insert([
          {
            alumno_id: doc.studentId,
            tipo: doc.tipo,
            folio: doc.folio,
            fecha: doc.fecha,
            titulo: doc.titulo,
            contenido: doc.contenido,
            narracionIA: doc.narracionIA,
            firmas: doc.firmas,
            creado_por: doc.creado_por,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setStudents((prev) =>
          prev.map((s) => {
            if (s.id !== doc.studentId) return s;
            return {
              ...s,
              documentos: [
                ...(s.documentos || []),
                {
                  id: data.id,
                  tipo: data.tipo,
                  folio: data.folio,
                  fecha: data.fecha,
                  titulo: data.titulo,
                  contenido: data.contenido,
                  narracionIA: data.narracionIA,
                  firmas: data.firmas || [],
                  creado_por: data.creado_por,
                  studentId: data.alumno_id,
                },
              ],
            };
          })
        );
        toast.success("Documento registrado exitosamente");
      }
    } catch (err) {
      console.error("Error adding document:", err);
      toast.error("No se pudo registrar el documento.");
    }
  };

  const deleteDocumentoInstitucional = async (docId: string, studentId: string) => {
    try {
      const { error } = await (supabase as any)
        .from("documentos_institucionales")
        .delete()
        .eq("id", docId);

      if (error) throw error;

      setStudents((prev) =>
        prev.map((s) => {
          if (s.id !== studentId) return s;
          return {
            ...s,
            documentos: (s.documentos || []).filter((d) => d.id !== docId),
          };
        })
      );
      toast.success("Documento eliminado");
    } catch (err) {
      console.error("Error deleting document:", err);
      toast.error("No se pudo eliminar el documento.");
    }
  };
    
  const addObjetoRetenido = async (
    studentId: string, 
    objeto: string, 
    motivo: string, 
    fecha: string,
    categoria?: string,
    lugarRetencion?: string,
    observaciones?: string
  ) => {
    try {
      if (!user) {
        toast.error("No hay sesión activa");
        return;
      }
      
      const student = students.find((s: any) => s.id === studentId);
      const reporterName = profile?.nombre_completo || profile?.full_name || user.email || "Usuario Institucional";

      // 1. Crear incidencia de conducta asociada
      const { data: incidentData, error: incError } = await (supabase as any)
        .from("incidencias")
        .insert([{
          alumno_id: studentId,
          tipo: IncidentType.CONDUCTA,
          descripcion: `RETENCIÓN DE OBJETO: ${objeto}. Motivo: ${motivo}.`,
          fecha: fecha,
          reportado_por: user.id,
          reportado_por_docente: user.id,
          reporta: reporterName,
          estado: "Abierta",
          clasificacion: "Tipo I"
        }])
        .select()
        .single();

      if (incError) throw incError;

      // 2. Crear registro de objeto retenido
      const { error: objError } = await (supabase as any)
        .from("objetos_retenidos")
        .insert([{
          alumno_id: studentId,
          objeto: objeto,
          motivo: motivo,
          fecha: fecha,
          responsable_id: user.id,
          responsable_nombre: reporterName,
          responsable_rol: currentUserRole,
          estado: EstadoObjetoRetenido.RETENIDO,
          incidencia_id: incidentData.id,
          categoria,
          lugar_retencion: lugarRetencion,
          observaciones
        }]);

      if (objError) throw objError;

      // 3. Auditoría
      requireAuditSuccess(await logAudit(
        "CREACION",
        `Objeto retenido registrado: ${objeto} (Alumno: ${student?.name})`,
        "objetos_retenidos",
        studentId,
        student?.name
      ));

      toast.success("Objeto retenido registrado correctamente");
      fetchStudents();
    } catch (err) {
      console.error("Error al registrar objeto retenido:", err);
      toast.error("No se pudo registrar el objeto");
    }
  };

  const registrarDevolucion = async (
    objetoId: string,
    entregadoA: string,
    observacionesEntrega: string,
    nuevoEstado: EstadoObjetoRetenido,
    fechaDevolucion?: string
  ) => {
    try {
      if (!user) return;

      const { error } = await (supabase as any)
        .from("objetos_retenidos")
        .update({ 
          estado: nuevoEstado, 
          entregado_a: entregadoA,
          observaciones: observacionesEntrega,
          fecha_devolucion: fechaDevolucion || new Date().toISOString(),
          entregado_por: user.id,
          updated_at: new Date().toISOString() 
        })
        .eq("id", objetoId);

      if (error) throw error;

      toast.success(`Devolución registrada: ${nuevoEstado}`);
      fetchStudents();
    } catch (err) {
      console.error("Error al registrar devolución:", err);
      toast.error("No se pudo registrar la devolución");
    }
  };

  const addAtencionMedica = async (studentId: string, data: any) => {
    try {
      if (!user) {
        toast.error("No hay sesión activa");
        return;
      }

      const { error } = await supabase
        .from("atenciones_medicas")
        .insert([{
          alumno_id: studentId,
          nombre_alumno: data.nombre_alumno,
          grupo: data.grupo,
          hora: data.hora || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          motivo: data.motivo,
          sintomas: data.sintomas || "No especificado",
          diagnostico: data.diagnostico,
          signos_vitales: data.signos_vitales,
          atencion_brindada: data.atencion_brindada,
          tratamiento: data.tratamiento || data.atencion_brindada || "Consultar atención brindada",
          medicamento: data.medicamento,
          notificacion_padres: String(data.notificacion_padres || false),
          acudieron_por_el: String(data.acudieron_por_el || false),
          condiciones_entrega: data.condiciones_entrega,
          observaciones: data.observaciones,
          generado_por: user.id,
          atendido_por: user.id
        }]);

      if (error) throw error;

      // Auditoría
      requireAuditSuccess(await logAudit(
        "CREACION",
        `Atención médica registrada: ${data.motivo}`,
        "atenciones_medicas",
        studentId,
        data.nombre_alumno
      ));

      toast.success("Atención médica guardada ✔️");
      fetchStudents();
      return { success: true };
    } catch (err: any) {
      console.error("Error al guardar atención médica:", err);
      toast.error("RLS me bloquea ❌ o hubo un error técnico");
      return { success: false, error: err };
    }
  };

  const updateEstadoObjeto = async (objetoId: string, nuevoEstado: EstadoObjetoRetenido) => {
    try {
      const { error } = await (supabase as any)
        .from("objetos_retenidos")
        .update({ estado: nuevoEstado, updated_at: new Date().toISOString() })
        .eq("id", objetoId);

      if (error) throw error;

      toast.success(`Estado del objeto actualizado a: ${nuevoEstado}`);
      fetchStudents();
    } catch (err) {
      console.error("Error al actualizar estado del objeto:", err);
      toast.error("No se pudo actualizar el estado");
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchStudents();
  }, [fetchStudents, fetchGroups]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("sase-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "incidencias" },
        () => fetchStudents(),
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "justificantes" },
        () => fetchStudents(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "objetos_retenidos" },
        () => fetchStudents(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchStudents]);

  return {
    students,
    fetchStudents,
    groups,
    fetchGroups,
    addIncident,
    applyIncidentSideEffects,
    addJustificante,
    updateGrades,
    updateBapInfo,
    toggleDistanceState,
    importStudents,
    addDocumentoInstitucional,
    deleteDocumentoInstitucional,
    addObjetoRetenido,
    updateEstadoObjeto,
    registrarDevolucion,
    addAtencionMedica,
    markIncidentAsNotified: async (studentId: string, incidentId: string) => {
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id !== studentId) return s;
          return {
            ...s,
            incidents: s.incidents.map((inc) =>
              inc.id === incidentId ? { ...inc, notificado_whatsapp: true } : inc
            ),
          };
        })
      );

      try {
        const { error } = await supabase
          .from("incidencias")
          .update({ notificado_whatsapp: true })
          .eq("id", incidentId);

        if (error) throw error;
        toast.success("Estado de notificación actualizado");
      } catch (err) {
        console.error("Error marking incident as notified:", err);
        toast.error("No se pudo actualizar el estado de notificación");
      }
    },
    setStudents,
  };
};
