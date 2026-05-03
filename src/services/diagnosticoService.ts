import { supabase } from "../lib/supabaseClient"

export interface DiagnosticoTrends {
  conducta: Record<string, number>
  aprovechamiento: Record<string, number>
  asistencia: Record<string, number>
}

interface DiagnosticoResumen {
  trends: DiagnosticoTrends
  total: number
  lastUpdate: string | null
}

interface DiagnosticoGlobal {
  alumno_id: string
  conducta: string | null
  aprovechamiento: string | null
  asistencia: string | null
}

/**
 * Agrega un tally simple de valores de texto.
 * Ej: ['bueno', 'bueno', 'regular'] → { bueno: 2, regular: 1 }
 */
function tally(arr: (string | null)[]): Record<string, number> {
  return arr.reduce(
    (acc, k) => {
      if (!k) return acc
      acc[k] = (acc[k] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )
}

/**
 * Obtiene resumen agregado de diagnósticos para un alumno.
 * Usa la tabla `diagnosticos_docentes` (Orientación v2) que tiene los campos necesarios.
 * No expone RPCs sensibles; solo lectura vía RLS.
 */
export async function getDiagnosticoResumen(alumnoId: string): Promise<DiagnosticoResumen> {
  // Buscar el caso de orientación activo para este alumno
  const { data: caso, error: casoError } = await supabase
    .from("orientacion_casos" as any)
    .select("id")
    .eq("alumno_id", alumnoId)
    .in("estado", ["recibido", "en_analisis", "diagnostico_solicitado", "plan_definido"])
    .maybeSingle()

  if (casoError) throw casoError

  const casoId = (caso as any)?.id ?? null

  if (!casoId) {
    return { trends: { conducta: {}, aprovechamiento: {}, asistencia: {} }, total: 0, lastUpdate: null }
  }

  const { data, error } = await supabase
    .from("diagnosticos_docentes" as any)
    .select("conducta, aprovechamiento, asistencia, created_at")
    .eq("caso_id", casoId)
    .order("created_at", { ascending: false })

  if (error) throw error

  const rows = (data ?? []) as unknown as Array<{
    conducta: string | null
    aprovechamiento: string | null
    asistencia: string | null
    created_at: string | null
  }>

  const resumen: DiagnosticoResumen = {
    trends: {
      conducta: tally(rows.map((r) => r.conducta)),
      aprovechamiento: tally(rows.map((r) => r.aprovechamiento)),
      asistencia: tally(rows.map((r) => r.asistencia)),
    },
    total: rows.length,
    lastUpdate: rows[0]?.created_at ?? null,
  }

  return resumen
}

/**
 * Obtiene diagnósticos globales (para Dirección/Subdirección).
 * Solo lectura agregada; no expone datos sensibles de estudiantes individuales.
 */
export async function getDiagnosticoGlobal(): Promise<DiagnosticoGlobal[]> {
  const { data, error } = await supabase
    .from("v_diagnosticos_docentes" as any)
    .select("alumno_id, conducta, aprovechamiento, asistencia")
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) throw error

  return (data ?? []) as unknown as DiagnosticoGlobal[]
}

/**
 * Obtiene resumen de diagnósticos por grupo (para Dashboard Docente).
 * Retorna tendencias basadas en diagnosticos_docentes vinculados a casos del grupo.
 */
export async function getDiagnosticoPorGrupo(grupo: string): Promise<{
  completados: number
  pendientes: number
  tendencias: DiagnosticoTrends
}> {
  // Obtener alumnos del grupo
  const { data: alumnos, error: alumnosError } = await supabase
    .from("alumnos" as any)
    .select("id")
    .eq("grupo", grupo)

  if (alumnosError) throw alumnosError

  const alumnoIds = (alumnos ?? []).map((a: any) => a.id)
  if (alumnoIds.length === 0) {
    return { completados: 0, pendientes: 0, tendencias: { conducta: {}, aprovechamiento: {}, asistencia: {} } }
  }

  // Obtener casos de orientación para esos alumnos
  const { data: casos, error: casosError } = await supabase
    .from("orientacion_casos" as any)
    .select("id")
    .in("alumno_id", alumnoIds)
    .in("estado", ["recibido", "en_analisis", "diagnostico_solicitado", "plan_definido"])

  if (casosError) throw casosError

  const casoIds = (casos ?? []).map((c: any) => c.id)
  if (casoIds.length === 0) {
    return { completados: 0, pendientes: alumnoIds.length, tendencias: { conducta: {}, aprovechamiento: {}, asistencia: {} } }
  }

  const { data, error } = await supabase
    .from("diagnosticos_docentes" as any)
    .select("conducta, aprovechamiento, asistencia")
    .in("caso_id", casoIds)

  if (error) throw error

  const rows = (data ?? []) as unknown as Array<{
    conducta: string | null
    aprovechamiento: string | null
    asistencia: string | null
  }>

  return {
    completados: rows.length,
    pendientes: alumnoIds.length - new Set(rows.map((r: any) => r.caso_id)).size,
    tendencias: {
      conducta: tally(rows.map((r) => r.conducta)),
      aprovechamiento: tally(rows.map((r) => r.aprovechamiento)),
      asistencia: tally(rows.map((r) => r.asistencia)),
    },
  }
}
