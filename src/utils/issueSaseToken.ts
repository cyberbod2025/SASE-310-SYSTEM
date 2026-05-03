/**
 * Emite sase_token JWT para módulos externos.
 * Usa SASE_SECRET (compartido con módulos).
 * El token se firma en el cliente (frontend) usando HMAC-SHA256.
 * NOTA: El secreto debe estar en variables de entorno, no hardcodeado.
 */

const SASE_SECRET = import.meta.env.VITE_SASE_SHARED_SECRET
  ?? "clave-secreta-compartida-feria" // Fallback (solo para desarrollo)

export interface SaseTokenPayload {
  sub: string          // userId
  nombre: string
  rol: string
  grupo?: string        // opcional: grupo del docente
  module?: string      // 'diagnostico' | 'feria' | etc.
  iat?: number
  exp?: number
}

/**
 * Emite un sase_token (JWT firmado con HMAC-SHA256).
 * Equivalente a la lógica en api/modules/lib.ts per para múltiples módulos.
 */
export async function issueSaseToken(
  user: { id: string; nombre: string; rol: string; grupo?: string },
  module: string = "diagnostico",
  ttlSeconds: number = 7200 // 2 horas
): Promise<string> {
  const encoder = new TextEncoder()
  const header = { alg: "HS256", typ: "JWT" }

  // Base64URL encode helper
  const b64url = (buf: Uint8Array) =>
    btoa(String.fromCharCode(...buf))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "")

  // Encode header and payload
  const h = b64url(encoder.encode(JSON.stringify(header)))
  const p = b64url(
    encoder.encode(
      JSON.stringify({
        sub: user.id,
        nombre: user.nombre,
        rol: user.rol,
        grupo: user.grupo,
        module,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + ttlSeconds,
      } as SaseTokenPayload)
    )
  )

  // Signature
  const data = `${h}.${p}`
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(SASE_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data))
  const s = b64url(new Uint8Array(signature))

  return `${data}.${s}`
}

/**
 * Verifica un sase_token (para usar en Edge Functions).
 * Esta función es para backend; aquí solo para referencia.
 */
export async function verifySaseToken(token: string): Promise<SaseTokenPayload> {
  const encoder = new TextEncoder()
  const [h, p, s] = token.split(".")

  // Recompute signature
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(SASE_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  )
  const sig = Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0))
  const valid = await crypto.subtle.verify("HMAC", key, sig, encoder.encode(`${h}.${p}`))
  if (!valid) throw new Error("Token inválido")

  const payload = JSON.parse(atob(p.replace(/-/g, "+").replace(/_/g, "/"))) as SaseTokenPayload
  if (payload.exp && payload.exp < Date.now() / 1000) throw new Error("Token expirado")
  return payload
}
