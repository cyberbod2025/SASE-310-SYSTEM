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
  calculateState,
  AppModule,
  UserRole,
  AuditActionType,
} from "../../types";
import { evaluateEscalation } from "../../utils/saseUtils";
import toast from "react-hot-toast";

// Production: No fictional data — students are loaded from Supabase
const INITIAL_STUDENTS: Student[] = [];

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
        console.error("Error fetching groups:", error);
        return;
      }

      if (data) setGroups(data);
    } catch (err) {
      console.error("Unexpected error fetching groups:", err);
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
            id, tipo, descripcion, creado_en, reportado_por, fecha, estado, reporta, clasificacion
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
          estudiantes (
            total_puntos, escaneos_realizados, nickname
          )
        `);

      if (error) {
        console.error("Error fetching students:", error);
        return;
      }

      if (data) {
        const mappedStudents: Student[] = data.map((d: any) => ({
          id: d.id,
          matricula: d.matricula,
          curp: d.curp,
          name: d.nombre_completo,
          group: d.grupo,
          avatar: d.avatar_url || "https://i.pravatar.cc/150",
          caseState: calculateState(d.incidencias || []),
          incidents: (d.incidencias || []).map((i: any) => ({
            id: i.id,
            type: i.tipo,
            description: i.descripcion,
            date: i.fecha || i.creado_en,
            reportedBy: i.reportado_por,
          })),
          justificantes: (d.justificantes || []).map((j: any) => ({
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
                hasBAP: d.datos_bap.hasBAP || false,
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
          calificaciones: (d.calificaciones || []).map((c: any) => ({
            materia: c.materia,
            trimestre1: c.trimestre1,
            trimestre2: c.trimestre2,
            trimestre3: c.trimestre3,
            promedioFinal: c.promedio_final,
          })),
          documentos: [],
          isDistancia: d.is_distancia || false,
          gamificacion: d.estudiantes?.[0]
            ? {
                total_puntos: d.estudiantes[0].total_puntos || 0,
                escaneos_realizados: d.estudiantes[0].escaneos_realizados || 0,
                nickname: d.estudiantes[0].nickname,
              }
            : undefined,
        }));
        setStudents(mappedStudents);
      }
    } catch (err: any) {
      console.error("Unexpected error:", err);
      toast.error("Error de conexión: " + (err.message || "Desconocido"));
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
      reporta: reporterName, // Use profile name
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
      notifyRoles.forEach((role: UserRole) => {
        addNotification({
          title:
            priority === "CRITICAL"
              ? "🚨 PROTOCOLO CRÍTICO"
              : "Aviso de Seguimiento",
          message: `${message} (Alumno: ${students.find((s) => s.id === studentId)?.name || "N/A"})`,
          type: priority === "CRITICAL" ? "error" : "warning",
          targetRole: role,
          actionModule: protocolId ? AppModule.PROTOCOLOS : AppModule.REPORTES,
          actionData: { protocolId },
        });
      });

      if (priority === "CRITICAL") {
        toast.error(`¡ACTIVACIÓN DE PROTOCOLO! ${message}`, { duration: 6000 });
        logAudit(
          "CREACION",
          `Protocolo Activado: ${message}`,
          "incidencias",
          tempId,
          students.find((s) => s.id === studentId)?.name,
        );
      }
    }

    try {
      const { error } = await supabase.from("incidencias").insert([
        {
          alumno_id: studentId,
          tipo: type,
          descripcion: description,
          reportado_por: user?.id,
          reporta: reporterName,
          fecha: new Date().toISOString(),
          estado: "Nuevo",
          clasificacion: "Institucional",
          evidencia: evidence,
        },
      ]);
      if (error) throw error;
      toast.success("Incidencia registrada institucionalmente");
    } catch (err: any) {
      console.error(err);
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
      console.error(err);
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
        grades.map((g) => ({ ...g, alumno_id: studentId })),
        { onConflict: "alumno_id,materia" },
      );
      logAudit(
        "ACTUALIZACION",
        "Calificaciones actualizadas",
        "calificaciones",
        studentId,
      );
    } catch (err) {
      console.error(err);
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
      console.error(err);
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
      console.error(err);
    }
  };

  const importStudents = (newStudents: Student[]) => {
    setStudents((prev) => [...prev, ...newStudents]);
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
    setStudents,
  };
};
