import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../supabase/client";
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

const INITIAL_STUDENTS: Student[] = [
  {
    id: "1",
    matricula: "2023-4492",
    name: "Carlos Alberto Ruiz",
    group: "3º B",
    avatar: "https://i.pravatar.cc/150?u=1",
    caseState: CaseState.OBSERVADO,
    incidents: [
      {
        id: "i1",
        studentId: "1",
        type: IncidentType.RETARDO,
        description: "Llegada tarde 15 min",
        date: new Date().toISOString(),
        reportedBy: "Prefectura",
      },
    ],
    medicalAlerts: ["Alergia Estacional"],
    guardianInfo: {
      name: "María Ruiz (Madre)",
      relationship: "Madre",
      phonePrimary: "55-1234-5678",
      address: "Calle 10 #402, Col. Centro",
    },
    justificantes: [],
    bapInfo: {
      hasBAP: false,
      diagnosisPrivate: "",
      accommodations: [],
      lastUpdated: "",
    },
  },
  {
    id: "2",
    matricula: "2023-1122",
    name: "Sofia Hernández G.",
    group: "2º A",
    avatar: "https://i.pravatar.cc/150?u=2",
    caseState: CaseState.PATRON_DETECTADO,
    incidents: [
      {
        id: "i2",
        studentId: "2",
        type: IncidentType.CONDUCTA,
        description: "Uso de celular en clase",
        date: new Date().toISOString(),
        reportedBy: "Docente",
      },
      {
        id: "i3",
        studentId: "2",
        type: IncidentType.UNIFORME,
        description: "Falta de uniforme completo",
        date: new Date().toISOString(),
        reportedBy: "Prefectura",
      },
      {
        id: "i4",
        studentId: "2",
        type: IncidentType.CONDUCTA,
        description: "Interrupción reiterada",
        date: new Date().toISOString(),
        reportedBy: "Docente",
      },
    ],
    guardianInfo: {
      name: "Roberto Hernández",
      relationship: "Padre",
      phonePrimary: "55-8765-4321",
    },
    justificantes: [],
    bapInfo: {
      hasBAP: true,
      diagnosisPrivate: "TDAH (Diagnóstico Clínico Confidencial)",
      accommodations: [
        "Ubicación preferencial frente al pizarrón",
        "Segmentación de tareas largas",
        "Permitir uso de material manipulativo",
      ],
      lastUpdated: "2023-10-01",
    },
  },
];

export const useStudentsSlice = (
  user: any,
  currentUserRole: UserRole,
  addNotification: (notif: any) => void,
  logAudit: (
    type: AuditActionType,
    desc: string,
    table: string,
    id: string,
    name?: string,
    old?: any,
    newVal?: any,
  ) => Promise<void>,
  fetchDailyStats: () => Promise<void>,
) => {
  const [students, setStudents] = useState<Student[]>([]);

  const fetchStudents = useCallback(async () => {
    if (!user) {
      setStudents(INITIAL_STUDENTS);
      return;
    }

    try {
      const { data, error } = await supabase.from("alumnos").select(`
          *,
          incidencias (
            id, tipo, descripcion, creado_en, reportado_por
          ),
          justificantes (
            id, folio, fecha_inicio, fecha_fin, motivo, descripcion, creado_en, emitido_por
          ),
          salud (
            padecimiento, documento_url
          ),
          calificaciones (
            id, materia, trimestre1, trimestre2, trimestre3, promedio_final, ciclo_escolar
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
    const newIncidentLocal: Incident = {
      id: tempId,
      studentId,
      type,
      description,
      date: new Date().toISOString(),
      reportedBy: currentUserRole,
      evidence,
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
          fecha: new Date().toISOString(),
          evidencia: evidence,
        },
      ]);
      if (error) throw error;
      toast.success("Incidencia registrada");
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
        .update({ is_distancia: isDistancia })
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
    fetchStudents();
  }, [fetchStudents]);

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
    addIncident,
    addJustificante,
    updateGrades,
    updateBapInfo,
    toggleDistanceState,
    importStudents,
    setStudents,
  };
};
