import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../supabase/client";
import { User } from "@supabase/supabase-js";
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
import toast from "react-hot-toast";

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
  ) => Promise<void>,
  fetchDailyStats: () => Promise<void>,
  profile?: any,
) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<any[]>([]);

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
            id, alumno_id, fecha, calidad, consistencia, frecuencia, tendencia, deriva_score, nivel_deriva, created_at
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
          avatar: d.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + d.matricula,
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
    const reporterName = profile?.nombre_completo || profile?.nombres || user?.email || "SASE-System";
    
    const newIncidentLocal: Incident = {
      id: tempId,
      studentId,
      type,
      description,
      date: new Date().toISOString(),
      reportedBy: currentUserRole,
      evidence,
      reporta: reporterName,
      notificado_whatsapp: false,
    };

    let escalationResult: any = null;

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const newIncidents = [newIncidentLocal, ...s.incidents];
        escalationResult = evaluateEscalation(newIncidentLocal, s.incidents);

        let newState = s.caseState;
        if (newIncidents.length >= 3 && s.caseState === CaseState.OBSERVADO) {
          newState = CaseState.PATRON_DETECTADO;
          addNotification({
            title: "🚨 PATRÓN DE RIESGO DETECTADO",
            message: `El estudiante ${s.name} ha alcanzado el umbral de 3 incidencias.`,
            type: "error",
            targetRole: UserRole.ORIENTACION,
            actionModule: AppModule.REPORTES,
          });
        }
        return { ...s, incidents: newIncidents, caseState: newState };
      }),
    );

    if (type === IncidentType.RETARDO || type === IncidentType.ASISTENCIA) {
      fetchDailyStats();
    }

    if (escalationResult?.notifyRoles) {
      const { notifyRoles, priority, message, protocolId } = escalationResult;
      const student = students.find((s) => s.id === studentId);
      
      notifyRoles.forEach((role: UserRole) => {
        addNotification({
          title:
            priority === "CRITICAL"
              ? "🚨 PROTOCOLO CRÍTICO"
              : "Aviso de Seguimiento",
          message: `${message} (Alumno: ${student?.name || "N/A"})`,
          type: priority === "CRITICAL" ? "error" : "warning",
          targetRole: role,
          actionModule: protocolId ? AppModule.PROTOCOLOS : AppModule.REPORTES,
          actionData: { protocolId },
        });
      });

      // Hallazgo 2: WhatsApp Automation for Critical Incidents
      if (priority === "CRITICAL" && student?.guardianInfo?.phonePrimary) {
        const whatsappMsg = `SASE-310 ALERTA: Se ha activado un protocolo de ${message} para el alumno ${student.name}. Por favor, comuníquese con la institución.`;
        
        sendWhatsAppNotification({
          to: student.guardianInfo.phonePrimary,
          message: whatsappMsg,
          studentName: student.name,
          incidentType: type
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
          tempId,
          student?.name,
        );
      }
    }

    try {
      const { error } = await supabase.from("incidencias").insert([
        {
          alumno_id: studentId,
          tipo: type,
          descripcion: description,
          reportado_por: user?.id || "unknown",
          fecha: new Date().toISOString()
        },
      ]);
      if (error) throw error;
      toast.success("Incidencia registrada institucionalmente");
    } catch (err: any) {
      if (import.meta.env.DEV) {
        console.warn("Error al guardar incidencia");
      }
      toast.error("Error al guardar incidencia");
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
          .update({ estado_caso: "distancia" })
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
          promedio_final: g.promedioFinal,
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
        .update({ estado_caso: isDistancia ? "distancia" : "activo" })
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
      await logAudit(
        "CREACION",
        `Objeto retenido registrado: ${objeto} (Alumno: ${student?.name})`,
        "objetos_retenidos",
        studentId,
        student?.name
      );

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
