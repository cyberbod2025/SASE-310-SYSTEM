import { createClient } from "@supabase/supabase-js";
import { getRateLimitKey, isRateLimited } from "../ai/rateLimit";

type VercelRequest = any;
type VercelResponse = any;

const ALLOWED_FIELDS = new Set([
  "rolDeclarado",
  "turno",
  "nombres",
  "apellidoPaterno",
  "apellidoMaterno",
  "curp",
  "correoInstitucional",
  "cct",
  "aceptaPrivacidad",
  "aceptaEtica",
  "aceptaAuditoria",
]);

const isAllowedOrigin = (origin: string | undefined): boolean => {
  const allowed = process.env.ALLOWED_ORIGINS;
  if (!allowed || !origin) return false;
  return allowed
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .includes(origin);
};

const setCorsHeaders = (
  response: VercelResponse,
  origin: string | undefined,
): void => {
  if (!origin) return;
  response.setHeader("Access-Control-Allow-Origin", origin);
  response.setHeader("Vary", "Origin");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("Access-Control-Max-Age", "86400");
};

const isShortText = (
  value: unknown,
  minimum: number,
  maximum: number,
): value is string =>
  typeof value === "string" &&
  value.trim().length >= minimum &&
  value.trim().length <= maximum;

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (!process.env.ALLOWED_ORIGINS) {
    response.status(500).json({ error: "CORS origins not configured" });
    return;
  }

  const origin = request.headers.origin;
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

  const rateKey = getRateLimitKey(request);
  if (await isRateLimited(`registro-personal:${rateKey}`, 5, 60_000)) {
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

  const {
    rolDeclarado,
    turno,
    nombres,
    apellidoPaterno,
    apellidoMaterno,
    curp,
    correoInstitucional,
    cct,
    aceptaPrivacidad,
    aceptaEtica,
    aceptaAuditoria,
  } = body;

  if (
    !isShortText(rolDeclarado, 3, 40) ||
    !isShortText(turno, 5, 20) ||
    !isShortText(nombres, 1, 120) ||
    !isShortText(apellidoPaterno, 1, 120) ||
    (typeof apellidoMaterno !== "string" ||
      apellidoMaterno.trim().length > 120) ||
    !isShortText(curp, 18, 18) ||
    !isShortText(correoInstitucional, 10, 200) ||
    !isShortText(cct, 10, 10) ||
    aceptaPrivacidad !== true ||
    aceptaEtica !== true ||
    aceptaAuditoria !== true
  ) {
    response.status(400).json({ error: "Invalid request body" });
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
  const { data, error } = await supabase.rpc("registrar_solicitud_personal", {
    p_rol_declarado: rolDeclarado,
    p_turno: turno,
    p_nombres: nombres,
    p_apellido_paterno: apellidoPaterno,
    p_apellido_materno: apellidoMaterno,
    p_curp: curp,
    p_correo_institucional: correoInstitucional,
    p_cct: cct,
    p_acepta_privacidad: true,
    p_acepta_etica: true,
    p_acepta_auditoria: true,
  });

  if (error) {
    console.error("No se pudo registrar la solicitud de personal", error.code);
    response.status(400).json({
      error:
        typeof error.message === "string"
          ? error.message
          : "No se pudo guardar la solicitud de acceso.",
    });
    return;
  }

  if (
    !data ||
    typeof data !== "object" ||
    typeof data.folio !== "string" ||
    data.estado !== "PENDIENTE"
  ) {
    response
      .status(502)
      .json({ error: "La base no confirmó la solicitud de acceso." });
    return;
  }

  response.status(201).json({ folio: data.folio, estado: "PENDIENTE" });
}
