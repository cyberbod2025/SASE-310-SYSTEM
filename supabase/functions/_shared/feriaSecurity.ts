import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";

type JsonRecord = Record<string, unknown>;
type SupabaseClient = ReturnType<typeof createClient>;

export type SaseLaunchPayload = {
  sub?: string;
  uid?: string;
  email?: string | null;
  role?: string | null;
  name?: string | null;
  module?: string | null;
  institutionId?: string | null;
  groupId?: string | null;
  iat?: number;
  exp?: number;
};

export type FeriaSession = {
  id: string;
  estudiante_id: string;
  alumno_id: string | null;
  issued_by_user_id: string | null;
  issued_by_email: string | null;
  issued_by_role: string | null;
  group_id: string | null;
  expires_at: string;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DEFAULT_SESSION_TTL_SECONDS = 60 * 60 * 2;
const DEFAULT_PROGRESS_POINTS = 0;
const DEFAULT_TRIVIA_POINTS = 10;
const MAX_SAFE_TEXT = 512;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function buildCorsHeaders(origin: string | null): HeadersInit {
  const allowed = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const allowOrigin = allowed.length === 0
    ? origin ?? "*"
    : origin && allowed.includes(origin)
      ? origin
      : allowed[0];

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-student-session-token, x-request-id",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export function jsonResponse(
  body: JsonRecord,
  status: number,
  corsHeaders: HeadersInit,
): Response {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}

export async function readJsonObject(req: Request): Promise<JsonRecord> {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new HttpError(400, "Cuerpo JSON inválido.");
  }
  return body as JsonRecord;
}

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function getServiceClient(): SupabaseClient {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase service credentials");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function sanitizeText(value: unknown, maxLength = MAX_SAFE_TEXT): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!normalized) return null;
  return normalized.slice(0, maxLength);
}

export function normalizeEmail(value: unknown): string | null {
  const text = sanitizeText(value, 320);
  return text ? text.toLowerCase() : null;
}

export function parseUuid(value: unknown, label: string): string {
  const text = sanitizeText(value, 80);
  if (!text || !UUID_PATTERN.test(text)) {
    throw new HttpError(400, `${label} inválido.`);
  }
  return text;
}

export function parseOptionalUuid(value: unknown): string | null {
  const text = sanitizeText(value, 80);
  return text && UUID_PATTERN.test(text) ? text : null;
}

export function parseBoundedInteger(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
): number {
  const parsed = typeof value === "number"
    ? value
    : typeof value === "string"
      ? Number(value)
      : Number.NaN;
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.trunc(parsed)));
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - base64.length % 4) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function constantTimeEquals(left: Uint8Array, right: Uint8Array): boolean {
  let diff = left.length ^ right.length;
  const maxLength = Math.max(left.length, right.length);
  for (let index = 0; index < maxLength; index += 1) {
    diff |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }
  return diff === 0;
}

async function hmacSha256Base64Url(secret: string, value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return toBase64Url(new Uint8Array(signature));
}

export async function sha256Base64Url(value: string): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return toBase64Url(new Uint8Array(hash));
}

export async function verifySaseLaunchToken(rawToken: unknown): Promise<SaseLaunchPayload> {
  const token = sanitizeText(rawToken, 4096);
  if (!token) throw new HttpError(401, "Token SASE requerido.");

  const secret = Deno.env.get("SASE_SHARED_SECRET") ?? "";
  if (!secret) throw new Error("Missing SASE_SHARED_SECRET");

  const [payloadBase64Url, receivedSignature, extra] = token.split(".");
  if (!payloadBase64Url || !receivedSignature || extra !== undefined) {
    throw new HttpError(401, "Token SASE inválido.");
  }

  const expectedSignature = await hmacSha256Base64Url(secret, payloadBase64Url);
  if (!constantTimeEquals(fromBase64Url(receivedSignature), fromBase64Url(expectedSignature))) {
    throw new HttpError(401, "Firma SASE inválida.");
  }

  let payload: SaseLaunchPayload;
  try {
    payload = JSON.parse(decoder.decode(fromBase64Url(payloadBase64Url))) as SaseLaunchPayload;
  } catch {
    throw new HttpError(401, "Payload SASE inválido.");
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.module !== "feria") throw new HttpError(403, "Token no corresponde a Feria.");
  if (!payload.exp || payload.exp <= now) throw new HttpError(401, "Token SASE expirado.");
  if (!normalizeEmail(payload.email)) throw new HttpError(403, "Token SASE sin correo institucional.");

  return payload;
}

export function getSessionTtlSeconds(): number {
  return parseBoundedInteger(
    Deno.env.get("FERIA_STUDENT_SESSION_TTL_SECONDS"),
    DEFAULT_SESSION_TTL_SECONDS,
    60,
    60 * 60 * 8,
  );
}

export async function createOpaqueStudentToken(): Promise<string> {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
}

export async function hashStudentToken(token: string): Promise<string> {
  return await sha256Base64Url(token);
}

export async function resolveStudentSession(
  req: Request,
  supabase: SupabaseClient,
): Promise<FeriaSession> {
  const token = sanitizeText(
    req.headers.get("x-student-session-token") ?? req.headers.get("x-student-session"),
    2048,
  );
  if (!token) throw new HttpError(401, "Sesión de estudiante requerida.");

  const tokenHash = await hashStudentToken(token);
  const { data, error } = await supabase
    .from("feria_student_sessions")
    .select("id, estudiante_id, alumno_id, issued_by_user_id, issued_by_email, issued_by_role, group_id, expires_at, revoked_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error || !data) throw new HttpError(401, "Sesión de estudiante inválida.");

  const session = data as FeriaSession & { revoked_at?: string | null };
  if (session.revoked_at || new Date(session.expires_at).getTime() <= Date.now()) {
    throw new HttpError(401, "Sesión de estudiante expirada.");
  }

  return session;
}

export async function auditFeriaEvent(
  supabase: SupabaseClient,
  params: {
    session?: Partial<FeriaSession> | null;
    launchPayload?: SaseLaunchPayload | null;
    action: string;
    description: string;
    targetTable?: string;
    targetId?: string | null;
    values?: JsonRecord;
  },
): Promise<void> {
  const session = params.session ?? null;
  const payload = params.launchPayload ?? null;
  const userId = parseOptionalUuid(session?.issued_by_user_id ?? payload?.uid ?? payload?.sub ?? null);
  const email = normalizeEmail(session?.issued_by_email ?? payload?.email ?? null);

  const row = {
    usuario_id: userId,
    email_usuario: email,
    rol_usuario: sanitizeText(session?.issued_by_role ?? payload?.role ?? "feria", 80) ?? "feria",
    tipo_accion: params.action,
    descripcion_accion: params.description,
    tabla_objetivo: params.targetTable ?? "feria",
    id_registro_objetivo: params.targetId ?? null,
    new_values: params.values ?? null,
  };

  const { error } = await supabase.from("auditoria").insert(row);
  if (error) console.error("Feria audit failed", error.message);
}

function normalizeScalarAnswer(value: unknown): unknown {
  if (typeof value === "string") return value.trim().toLowerCase();
  if (typeof value === "number" || typeof value === "boolean" || value === null) return value;
  if (Array.isArray(value)) return value.map(normalizeScalarAnswer).sort();
  if (typeof value === "object" && value) {
    const entries = Object.entries(value as JsonRecord)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => [key, normalizeScalarAnswer(nested)]);
    return Object.fromEntries(entries);
  }
  return null;
}

export function canonicalAnswer(value: unknown): string {
  return JSON.stringify(normalizeScalarAnswer(value));
}

function extractNestedValue(source: JsonRecord, keys: string[]): unknown {
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) return source[key];
  }
  return null;
}

export function getStationPoints(station: JsonRecord, envName: string, fallback: number): number {
  const configured = parseBoundedInteger(Deno.env.get(envName), fallback, 0, 100);
  const raw = extractNestedValue(station, [
    "puntos",
    "puntos_base",
    "puntos_estacion",
    "puntos_trivia",
    "score",
  ]);
  return parseBoundedInteger(raw, configured, 0, 100);
}

export async function evaluateTriviaAnswers(
  station: JsonRecord,
  answers: unknown,
): Promise<{ correct: boolean; points: number; answerHash: string }> {
  if (answers === undefined || answers === null) {
    throw new HttpError(400, "Respuestas requeridas.");
  }

  const trivia = typeof station.trivia === "object" && station.trivia && !Array.isArray(station.trivia)
    ? station.trivia as JsonRecord
    : {};

  const submittedCanonical = canonicalAnswer(answers);
  const submittedHash = await sha256Base64Url(submittedCanonical);
  const expectedHash = sanitizeText(extractNestedValue(station, [
    "respuesta_correcta_hash",
    "answer_hash",
    "trivia_answer_hash",
  ]) ?? extractNestedValue(trivia, ["respuesta_correcta_hash", "answer_hash"]), 512);

  let correct = false;
  if (expectedHash) {
    correct = constantTimeEquals(encoder.encode(submittedHash), encoder.encode(expectedHash));
  } else {
    const expectedAnswer = extractNestedValue(station, [
      "respuesta_correcta",
      "respuestaCorrecta",
      "correct_answer",
      "correctAnswer",
    ]) ?? extractNestedValue(trivia, [
      "respuesta_correcta",
      "respuestaCorrecta",
      "correct_answer",
      "correctAnswer",
    ]);

    if (expectedAnswer === null || expectedAnswer === undefined) {
      throw new HttpError(422, "La estación no tiene llave de validación de trivia.");
    }

    correct = canonicalAnswer(expectedAnswer) === submittedCanonical;
  }

  return {
    correct,
    points: correct ? getStationPoints(station, "FERIA_TRIVIA_POINTS", DEFAULT_TRIVIA_POINTS) : 0,
    answerHash: submittedHash,
  };
}

export function getProgressPoints(station: JsonRecord): number {
  return getStationPoints(station, "FERIA_SCAN_POINTS", DEFAULT_PROGRESS_POINTS);
}

export function getRequestId(req: Request, body?: JsonRecord): string | null {
  return sanitizeText(req.headers.get("x-request-id") ?? body?.request_id ?? body?.requestId ?? null, 128);
}

export function errorResponse(error: unknown, corsHeaders: HeadersInit): Response {
  if (error instanceof HttpError) {
    return jsonResponse({ error: error.message }, error.status, corsHeaders);
  }

  console.error(error);
  return jsonResponse({ error: "Error interno de Feria." }, 500, corsHeaders);
}
