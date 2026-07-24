import { createClient } from "@supabase/supabase-js";
import { getRateLimitKey, isRateLimited } from "../api/ai/rateLimit";

type RequestLike = {
  body?: unknown;
  headers?: Record<string, unknown>;
  socket?: { remoteAddress?: string };
};

type SupabaseServiceClient = ReturnType<typeof createClient<any>>;

export type AIContextType =
  | "asistente_institucional"
  | "redaccion_institucional"
  | "borrador_documento";

export type AIProvider = "gemini" | "openrouter";

export type AIAuditEvent =
  | "IA_SOLICITUD_AUTORIZADA"
  | "IA_RESPUESTA_RECIBIDA"
  | "IA_PROVEEDOR_FALLIDO";

export type AuthorizedAIRequest = {
  contextType: AIContextType;
  model: string;
  profileEmail: string | null;
  prompt: string;
  purpose: string;
  role: string;
  supabase: SupabaseServiceClient;
  userEmail: string | null;
  userId: string;
};

export type AIAuthorizationResult =
  | { ok: true; value: AuthorizedAIRequest }
  | { ok: false; status: number; error: string };

export type AIAuditDetails = {
  contextType: AIContextType;
  httpStatus?: number;
  model: string;
  promptChars: number;
  provider: AIProvider;
  responseChars?: number;
  tokens?: number;
};

const ALLOWED_FIELDS = new Set([
  "prompt",
  "model",
  "purpose",
  "contextType",
]);
const ALLOWED_CONTEXTS = new Set<AIContextType>([
  "asistente_institucional",
  "redaccion_institucional",
  "borrador_documento",
]);
const ALLOWED_ROLES = new Set([
  "directivo",
  "subdireccion",
  "docente",
  "docente_tutor",
  "prefectura",
  "orientacion",
  "trabajo_social",
  "medico_escolar",
  "udeii",
  "promotora_lectura",
  "secretaria",
  "system_admin",
  "developer",
]);

const CURP_PATTERN =
  /\b[A-ZÑ&]{4}\d{6}[HM][A-ZÑ]{5}[A-Z0-9]\d\b/i;
const EMAIL_PATTERN =
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const PHONE_PATTERN =
  /(?:\+?52[\s().-]*)?(?:\d[\s().-]*){10,13}/;
const SENSITIVE_LABEL_PATTERN =
  /\b(curp|rfc|matr[ií]cula|domicilio|direcci[oó]n particular|tel[eé]fono (?:del )?tutor|fecha de nacimiento|datos[_ ]?tutor|datos[_ ]?bap|diagn[oó]stico m[eé]dico)\b/i;
const SERIALIZED_SENSITIVE_KEY_PATTERN =
  /["']?(nombre_completo|datos_tutor|datos_bap|phoneprimary|matricula|curp)["']?\s*:/i;
const DIRECT_STUDENT_NAME_PATTERN =
  /\b(nombre(?:\s+completo)?|alumn[oa]|estudiante)\s*:\s*[\p{Lu}ÁÉÍÓÚÑ][\p{L}'-]+(?:\s+[\p{Lu}ÁÉÍÓÚÑ][\p{L}'-]+){1,5}/iu;

function getBearerToken(authorization: unknown): string | null {
  if (typeof authorization !== "string") return null;
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export function containsSensitivePersonalData(prompt: string): boolean {
  return (
    CURP_PATTERN.test(prompt) ||
    EMAIL_PATTERN.test(prompt) ||
    PHONE_PATTERN.test(prompt) ||
    SENSITIVE_LABEL_PATTERN.test(prompt) ||
    SERIALIZED_SENSITIVE_KEY_PATTERN.test(prompt) ||
    DIRECT_STUDENT_NAME_PATTERN.test(prompt)
  );
}

export async function authorizeInstitutionalAIRequest(
  request: RequestLike,
  allowedModels: ReadonlySet<string>,
  defaultModel: string,
): Promise<AIAuthorizationResult> {
  const token = getBearerToken(request.headers?.authorization);
  if (!token) {
    return { ok: false, status: 401, error: "Autenticación requerida" };
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return {
      ok: false,
      status: 500,
      error: "Credenciales de servicio Supabase no configuradas",
    };
  }

  const supabase = createClient<any>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return { ok: false, status: 401, error: "Autenticación inválida" };
  }

  const { data: profile, error: profileError } = await supabase
    .from("perfiles_usuario")
    .select("rol, email")
    .eq("id", user.id)
    .eq("estado_cuenta", "activo")
    .eq("seguridad_status", "active")
    .maybeSingle();
  if (
    profileError ||
    !profile ||
    typeof profile.rol !== "string" ||
    !ALLOWED_ROLES.has(profile.rol)
  ) {
    return {
      ok: false,
      status: 403,
      error: "Rol institucional no autorizado",
    };
  }

  const rateKey = `${user.id}:${getRateLimitKey(request)}`;
  if (await isRateLimited(`ia-institucional:${rateKey}`, 20, 60_000)) {
    return {
      ok: false,
      status: 429,
      error: "Límite de solicitudes excedido",
    };
  }

  const body = request.body ?? {};
  if (
    typeof body !== "object" ||
    Array.isArray(body) ||
    Object.keys(body).some((key) => !ALLOWED_FIELDS.has(key))
  ) {
    return {
      ok: false,
      status: 400,
      error: "Cuerpo de solicitud inválido",
    };
  }

  const { prompt, model, purpose, contextType } = body as {
    prompt?: unknown;
    model?: unknown;
    purpose?: unknown;
    contextType?: unknown;
  };
  if (
    typeof prompt !== "string" ||
    prompt.trim().length === 0 ||
    prompt.length > 8000
  ) {
    return { ok: false, status: 400, error: "Prompt inválido" };
  }
  if (
    typeof purpose !== "string" ||
    purpose.trim().length < 5 ||
    purpose.trim().length > 240
  ) {
    return { ok: false, status: 400, error: "Propósito inválido" };
  }
  if (
    typeof contextType !== "string" ||
    !ALLOWED_CONTEXTS.has(contextType as AIContextType)
  ) {
    return { ok: false, status: 400, error: "Contexto de IA inválido" };
  }
  if (
    model !== undefined &&
    (typeof model !== "string" || !allowedModels.has(model))
  ) {
    return { ok: false, status: 400, error: "Modelo no permitido" };
  }
  if (containsSensitivePersonalData(prompt)) {
    return {
      ok: false,
      status: 422,
      error:
        "La solicitud contiene identificadores personales que no pueden enviarse a un proveedor externo.",
    };
  }

  return {
    ok: true,
    value: {
      contextType: contextType as AIContextType,
      model: typeof model === "string" ? model : defaultModel,
      profileEmail:
        typeof profile.email === "string" ? profile.email : null,
      prompt,
      purpose: purpose.trim(),
      role: profile.rol,
      supabase,
      userEmail: typeof user.email === "string" ? user.email : null,
      userId: user.id,
    },
  };
}

export async function recordInstitutionalAIEvent(
  request: AuthorizedAIRequest,
  event: AIAuditEvent,
  details: AIAuditDetails,
): Promise<{ ok: true } | { ok: false; code: string }> {
  const descriptions: Record<AIAuditEvent, string> = {
    IA_SOLICITUD_AUTORIZADA:
      "Se autorizó una solicitud de apoyo de IA institucional.",
    IA_RESPUESTA_RECIBIDA:
      "El proveedor devolvió un borrador de apoyo institucional.",
    IA_PROVEEDOR_FALLIDO:
      "El proveedor no completó la solicitud de apoyo institucional.",
  };
  const { error } = await request.supabase.from("auditoria").insert({
    usuario_id: request.userId,
    email_usuario: request.profileEmail ?? request.userEmail,
    rol_usuario: request.role,
    tipo_accion: event,
    descripcion_accion: descriptions[event],
    tabla_objetivo: "ia_institucional",
    proposito: request.purpose,
    origen: "servidor",
    new_values: {
      contexto: details.contextType,
      proveedor: details.provider,
      modelo: details.model,
      caracteres_entrada: details.promptChars,
      estado:
        event === "IA_RESPUESTA_RECIBIDA"
          ? "COMPLETADO"
          : event === "IA_PROVEEDOR_FALLIDO"
            ? "FALLIDO"
            : "AUTORIZADO",
      ...(typeof details.httpStatus === "number"
        ? { estado_http: details.httpStatus }
        : {}),
      ...(typeof details.tokens === "number"
        ? { tokens: details.tokens }
        : {}),
      ...(typeof details.responseChars === "number"
        ? { caracteres_salida: details.responseChars }
        : {}),
    },
  });

  return error
    ? { ok: false, code: error.code || "AUDIT_WRITE_FAILED" }
    : { ok: true };
}
