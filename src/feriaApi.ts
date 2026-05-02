/**
 * Cliente para Feria Edge Functions.
 *
 * ANTES (❌ NO HACER):
 *   supabase.rpc('registrar_progreso_v2', { p_estudiante_id, p_estacion_id, p_puntos_ganados })
 *
 * AHORA (✅ HACER):
 *   import { feriaApi } from './feriaApi'
 *   await feriaApi.registrarProgreso({ estudianteId, estacionId, puntosGanados, sessionToken })
 */

const EDGE_FUNCTIONS_BASE = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
  : 'http://localhost:54321/functions/v1'

export interface FeriaSession {
  student_session_token: string
  estudiante_id: string
  expires_at: string
}

export interface ProgressResult {
  success: boolean
  duplicate: boolean
  estudiante_id: string
  estacion_id: string
  puntos_ganados: number
}

export interface TriviaResult {
  success: boolean
  duplicate: boolean
  estudiante_id: string
  estacion_id: string
  puntos_adicionales: number
}

export interface ProgressData {
  success: boolean
  student: {
    id: string
    nickname: string
    grado: string
    total_puntos: number
    escaneos_realizados: number
    alumno_id: string
  }
  progress: Array<{
    estacion_id: string
    puntos_ganados: number
    trivia_respondida_correctamente: boolean
    completado_at: string | null
  }>
}

export class FeriaApiClient {
  private baseUrl: string

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl ?? EDGE_FUNCTIONS_BASE
  }

  private async fetchWithAuth(path: string, sessionToken: string, options?: RequestInit): Promise<Response> {
    return fetch(`${this.baseUrl}/${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`,
        ...options?.headers,
      },
    })
  }

  /**
   * Login de estudiante vía sase_token.
   * Retorna un student_session_token opaco (válido por TTL configurado).
   */
  async studentLogin(saseToken: string): Promise<FeriaSession> {
    const resp = await fetch(`${this.baseUrl}/student-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sase_token: saseToken }),
    })

    if (!resp.ok) {
      const error = await resp.json().catch(() => ({ error: `HTTP ${resp.status}` }))
      throw new Error(error.error ?? `Login failed: ${resp.status}`)
    }

    return resp.json()
  }

  /**
   * Registra avance en estación (reemplaza registrar_progreso_v2 RPC).
   */
  async registrarProgreso(params: {
    estudianteId: string
    estacionId: string
    puntosGanados: number
    sessionToken: string
    requestId?: string
  }): Promise<ProgressResult> {
    const resp = await this.fetchWithAuth('student-progress', params.sessionToken, {
      method: 'POST',
      body: JSON.stringify({
        estudiante_id: params.estudianteId,
        estacion_id: params.estacionId,
        puntos_ganados: params.puntosGanados,
        request_id: params.requestId ?? crypto.randomUUID(),
      }),
    })

    if (!resp.ok) {
      const error = await resp.json().catch(() => ({ error: `HTTP ${resp.status}` }))
      throw new Error(error.error ?? `Progress registration failed: ${resp.status}`)
    }

    return resp.json()
  }

  /**
   * Finaliza trivia en estación (reemplaza finalizar_trivia_v2 RPC).
   */
  async finalizarTrivia(params: {
    estudianteId: string
    estacionId: string
    puntosAdicionales: number
    answerHash: string
    sessionToken: string
    requestId?: string
  }): Promise<TriviaResult> {
    const resp = await this.fetchWithAuth('student-finish-trivia', params.sessionToken, {
      method: 'POST',
      body: JSON.stringify({
        estudiante_id: params.estudianteId,
        estacion_id: params.estacionId,
        puntos_adicionales: params.puntosAdicionales,
        answer_hash: params.answerHash,
        request_id: params.requestId ?? crypto.randomUUID(),
      }),
    })

    if (!resp.ok) {
      const error = await resp.json().catch(() => ({ error: `HTTP ${resp.status}` }))
      throw new Error(error.error ?? `Trivia finish failed: ${resp.status}`)
    }

    return resp.json()
  }

  /**
   * Consulta progreso del estudiante.
   */
  async getProgress(params: {
    estudianteId: string
    sessionToken: string
  }): Promise<ProgressData> {
    const resp = await this.fetchWithAuth('student-progress-get', params.sessionToken, {
      method: 'POST',
      body: JSON.stringify({
        estudiante_id: params.estudianteId,
      }),
    })

    if (!resp.ok) {
      const error = await resp.json().catch(() => ({ error: `HTTP ${resp.status}` }))
      throw new Error(error.error ?? `Get progress failed: ${resp.status}`)
    }

    return resp.json()
  }
}

export const feriaApi = new FeriaApiClient()
