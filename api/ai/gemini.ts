import {
  authorizeInstitutionalAIRequest,
  recordInstitutionalAIEvent,
} from "../../server/aiSecurity";

type VercelRequest = any;
type VercelResponse = any;

const ALLOWED_MODELS = new Set([
  "gemini-flash-latest",
  "gemini-2.0-flash",
]);
const DEFAULT_MODEL = "gemini-2.0-flash";

function isAllowedOrigin(origin: string | undefined): boolean {
  const allowed = process.env.ALLOWED_ORIGINS;
  if (!allowed || !origin) return false;
  return allowed
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

function readGeminiText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const candidates = (payload as Record<string, unknown>).candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) return null;
  const candidate = candidates[0];
  if (!candidate || typeof candidate !== "object") return null;
  const content = (candidate as Record<string, unknown>).content;
  if (!content || typeof content !== "object") return null;
  const parts = (content as Record<string, unknown>).parts;
  if (!Array.isArray(parts)) return null;
  const text = parts
    .map((part) =>
      part && typeof part === "object"
        ? (part as Record<string, unknown>).text
        : null,
    )
    .filter((value): value is string => typeof value === "string")
    .join("")
    .trim();
  return text || null;
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (!process.env.ALLOWED_ORIGINS) {
    response.status(500).json({ error: "Orígenes CORS no configurados" });
    return;
  }

  const origin = request.headers?.origin;
  if (!isAllowedOrigin(origin)) {
    response.status(403).json({ error: "Origen no permitido" });
    return;
  }
  setCorsHeaders(response, origin);

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }
  if (request.method !== "POST") {
    response.status(405).json({ error: "Método no permitido" });
    return;
  }

  const authorization = await authorizeInstitutionalAIRequest(
    request,
    ALLOWED_MODELS,
    DEFAULT_MODEL,
  );
  if (!authorization.ok) {
    response
      .status(authorization.status)
      .json({ error: authorization.error });
    return;
  }
  const institutionalRequest = authorization.value;
  const auditDetails = {
    contextType: institutionalRequest.contextType,
    model: institutionalRequest.model,
    promptChars: institutionalRequest.prompt.length,
    provider: "gemini" as const,
  };

  const startAudit = await recordInstitutionalAIEvent(
    institutionalRequest,
    "IA_SOLICITUD_AUTORIZADA",
    auditDetails,
  );
  if (!startAudit.ok) {
    console.error(
      "No se pudo auditar la solicitud de Gemini",
      startAudit.code,
    );
    response.status(500).json({
      error: "No se pudo registrar la trazabilidad de la solicitud.",
    });
    return;
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    await recordInstitutionalAIEvent(
      institutionalRequest,
      "IA_PROVEEDOR_FALLIDO",
      { ...auditDetails, httpStatus: 500 },
    );
    response.status(503).json({
      error: "El proveedor de IA no está configurado.",
    });
    return;
  }

  try {
    const providerResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(institutionalRequest.model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: institutionalRequest.prompt }],
            },
          ],
        }),
      },
    );
    const payload: unknown = await providerResponse.json().catch(() => null);

    if (!providerResponse.ok) {
      const failureAudit = await recordInstitutionalAIEvent(
        institutionalRequest,
        "IA_PROVEEDOR_FALLIDO",
        { ...auditDetails, httpStatus: providerResponse.status },
      );
      if (!failureAudit.ok) {
        console.error(
          "No se pudo auditar el fallo de Gemini",
          failureAudit.code,
        );
      }
      response.status(502).json({
        error: "El proveedor no pudo completar el borrador solicitado.",
      });
      return;
    }

    const text = readGeminiText(payload);
    if (!text) {
      const failureAudit = await recordInstitutionalAIEvent(
        institutionalRequest,
        "IA_PROVEEDOR_FALLIDO",
        { ...auditDetails, httpStatus: 502 },
      );
      if (!failureAudit.ok) {
        console.error(
          "No se pudo auditar la respuesta vacía de Gemini",
          failureAudit.code,
        );
      }
      response.status(502).json({
        error: "El proveedor no devolvió un borrador utilizable.",
      });
      return;
    }

    const successAudit = await recordInstitutionalAIEvent(
      institutionalRequest,
      "IA_RESPUESTA_RECIBIDA",
      {
        ...auditDetails,
        httpStatus: 200,
        responseChars: text.length,
      },
    );
    if (!successAudit.ok) {
      console.error(
        "No se pudo auditar la respuesta de Gemini",
        successAudit.code,
      );
      response.status(500).json({
        error: "No se pudo registrar la trazabilidad del borrador.",
      });
      return;
    }

    response.status(200).json({ text, draft: true });
  } catch (error) {
    const failureAudit = await recordInstitutionalAIEvent(
      institutionalRequest,
      "IA_PROVEEDOR_FALLIDO",
      { ...auditDetails, httpStatus: 502 },
    );
    if (!failureAudit.ok) {
      console.error(
        "No se pudo auditar la interrupción de Gemini",
        failureAudit.code,
      );
    }
    console.error(
      "Falló la conexión con Gemini",
      error instanceof Error ? error.name : "UNKNOWN_ERROR",
    );
    response.status(502).json({
      error: "No se pudo conectar con el proveedor de IA.",
    });
  }
}
