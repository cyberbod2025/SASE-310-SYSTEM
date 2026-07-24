import { createClient } from "@supabase/supabase-js";
import { getRateLimitKey, isRateLimited } from "../ai/rateLimit";

type VercelRequest = any;
type VercelResponse = any;

type NotificationStartRow = {
  intento_id: string;
  destinatario: string;
  alumno_nombre: string;
  incidencia_tipo: string;
};

type NotificationStatus = "ENVIADO" | "SIMULADO" | "FALLIDO";

const ALLOWED_FIELDS = new Set(["incidentId"]);
const ALLOWED_ROLES = new Set([
  "directivo",
  "subdireccion",
  "prefectura",
  "orientacion",
  "trabajo_social",
  "docente_tutor",
  "medico_escolar",
  "system_admin",
  "developer",
]);
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const NOTIFICATION_PURPOSE =
  "Comunicar al tutor una incidencia institucional registrada";

function isAllowedOrigin(origin: string | undefined): boolean {
  const configuredOrigins = process.env.ALLOWED_ORIGINS;
  if (!configuredOrigins || !origin) return false;

  return configuredOrigins
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .includes(origin);
}

function setCorsHeaders(
  response: VercelResponse,
  origin: string | undefined,
): void {
  if (!origin) return;
  response.setHeader("Access-Control-Allow-Origin", origin);
  response.setHeader("Vary", "Origin");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader(
    "Access-Control-Allow-Headers",
    "Authorization, Content-Type",
  );
  response.setHeader("Access-Control-Max-Age", "86400");
}

function getBearerToken(authorization: unknown): string | null {
  if (typeof authorization !== "string") return null;
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

function isNotificationStartRow(value: unknown): value is NotificationStartRow {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.intento_id === "string" &&
    UUID_PATTERN.test(row.intento_id) &&
    typeof row.destinatario === "string" &&
    /^\d{10,15}$/.test(row.destinatario) &&
    typeof row.alumno_nombre === "string" &&
    row.alumno_nombre.trim().length > 0 &&
    typeof row.incidencia_tipo === "string" &&
    row.incidencia_tipo.trim().length > 0
  );
}

function statusForDatabaseError(code: string | undefined): number {
  if (code === "42501") return 403;
  if (code === "P0002") return 404;
  if (code === "23505" || code === "23514") return 409;
  return 400;
}

function providerErrorCode(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "META_RECHAZADO";
  const error = (payload as Record<string, unknown>).error;
  if (!error || typeof error !== "object") return "META_RECHAZADO";
  const code = (error as Record<string, unknown>).code;
  return typeof code === "number" || typeof code === "string"
    ? `META_${String(code).slice(0, 40)}`
    : "META_RECHAZADO";
}

function providerMessageId(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const messages = (payload as Record<string, unknown>).messages;
  if (!Array.isArray(messages) || messages.length === 0) return null;
  const first = messages[0];
  if (!first || typeof first !== "object") return null;
  const id = (first as Record<string, unknown>).id;
  return typeof id === "string" && id.trim() ? id.trim().slice(0, 200) : null;
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (!process.env.ALLOWED_ORIGINS) {
    response.status(500).json({ error: "CORS origins not configured" });
    return;
  }

  const origin = request.headers?.origin;
  if (!isAllowedOrigin(origin)) {
    response.status(403).json({ error: "Forbidden origin" });
    return;
  }
  setCorsHeaders(response, origin);

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const accessToken = getBearerToken(request.headers?.authorization);
  if (!accessToken) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    response.status(500).json({ error: "Missing Supabase service credentials" });
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(accessToken);
  if (authError || !user) {
    response.status(401).json({ error: "Invalid authentication" });
    return;
  }

  const { data: profile, error: profileError } = await supabase
    .from("perfiles_usuario")
    .select("rol")
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
    response.status(403).json({ error: "Institutional role not authorized" });
    return;
  }

  const rateKey = `${user.id}:${getRateLimitKey(request)}`;
  if (await isRateLimited(`whatsapp:${rateKey}`, 10, 60_000)) {
    response.status(429).json({ error: "Rate limit exceeded" });
    return;
  }

  const body = request.body ?? {};
  if (
    typeof body !== "object" ||
    Array.isArray(body) ||
    Object.keys(body).some((key) => !ALLOWED_FIELDS.has(key))
  ) {
    response.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { incidentId } = body as { incidentId?: unknown };
  if (typeof incidentId !== "string" || !UUID_PATTERN.test(incidentId)) {
    response.status(400).json({ error: "Invalid incidentId" });
    return;
  }

  let attemptId: string | null = null;
  let attemptResolved = false;
  let providerConfirmed = false;

  const resolveAttempt = async (
    status: NotificationStatus,
    providerId?: string,
    errorCode?: string,
    errorDetail?: string,
  ): Promise<void> => {
    if (!attemptId) throw new Error("ATTEMPT_NOT_STARTED");
    const { data, error } = await supabase.rpc(
      "resolver_notificacion_whatsapp",
      {
        p_intento_id: attemptId,
        p_estado: status,
        p_proveedor_mensaje_id: providerId ?? null,
        p_error_code: errorCode ?? null,
        p_error_detail: errorDetail ?? null,
      },
    );
    if (error || !data || typeof data !== "object") {
      throw new Error("ATTEMPT_RESOLUTION_FAILED");
    }
    attemptResolved = true;
  };

  try {
    const { data: startData, error: startError } = await supabase.rpc(
      "iniciar_notificacion_whatsapp",
      {
        p_incidencia_id: incidentId,
        p_solicitante_id: user.id,
        p_proposito: NOTIFICATION_PURPOSE,
      },
    );
    if (startError) {
      console.error(
        "No se pudo iniciar la notificación institucional",
        startError.code,
      );
      response.status(statusForDatabaseError(startError.code)).json({
        error: "No se pudo iniciar la notificación institucional.",
      });
      return;
    }

    const startRow = Array.isArray(startData) ? startData[0] : startData;
    if (startRow && typeof startRow === "object") {
      const candidateId = (startRow as Record<string, unknown>).intento_id;
      if (typeof candidateId === "string" && UUID_PATTERN.test(candidateId)) {
        attemptId = candidateId;
      }
    }
    if (!isNotificationStartRow(startRow)) {
      if (attemptId) {
        await resolveAttempt(
          "FALLIDO",
          undefined,
          "RESPUESTA_INSTITUCIONAL_INVALIDA",
          "La base no devolvió todos los datos requeridos para el envío.",
        );
      }
      response.status(502).json({
        error: "La base no confirmó el intento de notificación.",
      });
      return;
    }
    attemptId = startRow.intento_id;

    const whatsappToken = process.env.WHATSAPP_TOKEN;
    const whatsappPhoneId = process.env.WHATSAPP_PHONE_ID;
    if (!whatsappToken || !whatsappPhoneId) {
      await resolveAttempt(
        "SIMULADO",
        undefined,
        "CANAL_NO_CONFIGURADO",
        "El canal institucional de WhatsApp no está configurado.",
      );
      response.status(200).json({
        delivered: false,
        status: "simulated",
        attemptId,
        incidentId,
        error:
          "Canal no configurado; la incidencia no fue marcada como notificada.",
      });
      return;
    }

    const providerResponse = await fetch(
      `https://graph.facebook.com/v21.0/${encodeURIComponent(whatsappPhoneId)}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${whatsappToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: startRow.destinatario,
          type: "template",
          template: {
            name: "incidencia_critica",
            language: { code: "es_MX" },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: startRow.alumno_nombre },
                  { type: "text", text: startRow.incidencia_tipo },
                ],
              },
            ],
          },
        }),
      },
    );
    const providerPayload: unknown = await providerResponse
      .json()
      .catch(() => null);

    if (!providerResponse.ok) {
      await resolveAttempt(
        "FALLIDO",
        undefined,
        providerErrorCode(providerPayload),
        "El proveedor rechazó la solicitud de envío.",
      );
      response.status(502).json({
        delivered: false,
        status: "failed",
        attemptId,
        error: "El proveedor no confirmó el envío de la notificación.",
      });
      return;
    }

    const messageId = providerMessageId(providerPayload);
    if (!messageId) {
      await resolveAttempt(
        "FALLIDO",
        undefined,
        "RESPUESTA_SIN_ID",
        "El proveedor respondió sin un identificador de entrega.",
      );
      response.status(502).json({
        delivered: false,
        status: "failed",
        attemptId,
        error: "El proveedor no confirmó el envío de la notificación.",
      });
      return;
    }

    providerConfirmed = true;
    await resolveAttempt("ENVIADO", messageId);
    response.status(200).json({
      delivered: true,
      status: "sent",
      attemptId,
      incidentId,
      messageId,
    });
  } catch (error) {
    if (attemptId && !attemptResolved && !providerConfirmed) {
      try {
        await resolveAttempt(
          "FALLIDO",
          undefined,
          "ERROR_SERVIDOR",
          "El servidor no pudo completar el intento de notificación.",
        );
      } catch {
        console.error(
          "No se pudo cerrar el intento de notificación",
          "ATTEMPT_RESOLUTION_FAILED",
        );
      }
    }
    console.error(
      "Falló la notificación institucional",
      error instanceof Error ? error.message : "UNKNOWN_ERROR",
    );
    response.status(500).json({
      delivered: false,
      status: "failed",
      attemptId,
      error: "No se pudo completar la notificación institucional.",
    });
  }
}
