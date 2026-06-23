import { supabase } from "../lib/supabaseClient";
import type { Database } from "../supabase/types";

type DiagnosticoRow = Database["public"]["Tables"]["diagnosticos_colectivos_docentes"]["Row"];
type DiagnosticoInsert = Database["public"]["Tables"]["diagnosticos_colectivos_docentes"]["Insert"];

interface AlumnoReportadoRaw {
  alumno_id?: string;
  nombre?: string;
  behaviors?: Record<string, string>;
  [key: string]: unknown;
}

function normalizeAlumnosReportados(raw: unknown): AlumnoReportadoRaw[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw as AlumnoReportadoRaw[];
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed as AlumnoReportadoRaw[] : [];
    } catch {
      return [];
    }
  }
  if (typeof raw === "object") {
    return [raw as AlumnoReportadoRaw];
  }
  return [];
}

function extractBehaviors(alumno: AlumnoReportadoRaw): Record<string, string> {
  if (alumno.behaviors && typeof alumno.behaviors === "object") {
    return alumno.behaviors as Record<string, string>;
  }
  const { alumno_id, nombre, behaviors, ...rest } = alumno;
  return rest as Record<string, string>;
}

export type DiagnosticoDocente = DiagnosticoRow;

export interface ResumenGrupo {
  grupo: string;
  totalDiagnosticos: number;
  pctConductaAlta: number;
  pctAprovechamientoBajo: number;
  pctAsistenciaBaja: number;
  alumnosFocoRojo: number;
  alumnosCriticos: {
    alumnoId: string;
    nombre: string;
    indicadoresAlto: number;
  }[];
}

export interface FiltroDiagnosticos {
  grupoId?: string;
  fechaInicio?: string;
  fechaFin?: string;
  periodo?: string;
}

/**
 * Obtiene diagnósticos con filtros opcionales
 */
export async function getDiagnosticos({
  grupoId,
  fechaInicio,
  fechaFin,
  periodo,
}: FiltroDiagnosticos): Promise<DiagnosticoDocente[]> {
  let query = supabase
    .from("diagnosticos_colectivos_docentes")
    .select("*")
    .order("fecha_diagnostico", { ascending: false });

  if (grupoId) query = query.eq("grupo", grupoId);
  if (periodo) query = query.eq("periodo", periodo);
  if (fechaInicio) query = query.gte("fecha_diagnostico", fechaInicio);
  if (fechaFin) query = query.lte("fecha_diagnostico", fechaFin);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/**
 * Obtiene diagnósticos de un alumno específico (busca en alumnos_reportados JSONB)
 */
export async function getDiagnosticosByAlumno(
  alumnoId: string
): Promise<DiagnosticoDocente[]> {
  const { data, error } = await supabase
    .from("diagnosticos_colectivos_docentes")
    .select("*")
    .contains("alumnos_reportados", JSON.stringify([{ alumno_id: alumnoId }]))
    .order("fecha_diagnostico", { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Obtiene resumen agregado de un grupo para el dashboard
 */
export async function getResumenGrupo(
  grupoId: string
): Promise<ResumenGrupo> {
  const { data, error } = await supabase
    .from("diagnosticos_colectivos_docentes")
    .select("*")
    .eq("grupo", grupoId);

  if (error) throw error;

  const diagnosticos = data || [];
  const total = diagnosticos.length;

  if (total === 0) {
    return {
      grupo: grupoId,
      totalDiagnosticos: 0,
      pctConductaAlta: 0,
      pctAprovechamientoBajo: 0,
      pctAsistenciaBaja: 0,
      alumnosFocoRojo: 0,
      alumnosCriticos: [],
    };
  }

  // Calcular porcentajes (escala unificada: bajo/medio/alto)
  const conductaAlta = diagnosticos.filter(
    (d) => d.conducta_general === "alto"
  ).length;
  const aprovechamientoBajo = diagnosticos.filter(
    (d) => d.aprovechamiento === "bajo"
  ).length;
  const asistenciaBaja = diagnosticos.filter(
    (d) => d.asistencia === "bajo"
  ).length;

  // Detectar alumnos con 2+ indicadores en "alto/bajo" (focos rojos)
  const alumnoIndicadores: Record<
    string,
    { nombre: string; indicadoresAlto: number }
  > = {};

  diagnosticos.forEach((d) => {
    const reportados = normalizeAlumnosReportados(d.alumnos_reportados);
    reportados.forEach((a) => {
      const id = a.alumno_id;
      if (!id) return;
      if (!alumnoIndicadores[id]) {
        alumnoIndicadores[id] = {
          nombre: a.nombre || "Alumno sin nombre",
          indicadoresAlto: 0,
        };
      }
      const behaviors = extractBehaviors(a);
      Object.values(behaviors).forEach((val) => {
        if (val === "alto" || val === "bajo") {
          alumnoIndicadores[id].indicadoresAlto++;
        }
      });
    });
  });

  const alumnosCriticos = Object.entries(alumnoIndicadores)
    .filter(([_, v]) => v.indicadoresAlto >= 2)
    .map(([id, v]) => ({ alumnoId: id, ...v }))
    .sort((a, b) => b.indicadoresAlto - a.indicadoresAlto);

  return {
    grupo: grupoId,
    totalDiagnosticos: total,
    pctConductaAlta: Math.round((conductaAlta / total) * 100),
    pctAprovechamientoBajo: Math.round((aprovechamientoBajo / total) * 100),
    pctAsistenciaBaja: Math.round((asistenciaBaja / total) * 100),
    alumnosFocoRojo: alumnosCriticos.length,
    alumnosCriticos,
  };
}

/**
 * Obtiene los últimos diagnósticos para el panel de "últimos registros"
 */
export async function getUltimosDiagnosticos(
  limite = 10
): Promise<DiagnosticoDocente[]> {
  const { data, error } = await supabase
    .from("diagnosticos_colectivos_docentes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limite);

  if (error) throw error;
  return data || [];
}

/**
 * Guarda un nuevo diagnóstico (usado por el módulo colectivo)
 */
export async function saveDiagnostico(
  diagnostico: DiagnosticoInsert
): Promise<DiagnosticoDocente> {
  const { data, error } = await supabase
    .from("diagnosticos_colectivos_docentes")
    .insert(diagnostico)
    .select()
    .single();

  if (error) throw error;
  return data;
}
