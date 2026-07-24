import {
  authorizeInstitutionalAIRequest,
  recordInstitutionalAIEvent,
} from "../../server/aiSecurity";

type VercelRequest = any;
type VercelResponse = any;

const ALLOWED_MODELS = new Set([
  "google/gemini-2.0-flash-lite-preview-02-05:free",
  "openai/gpt-4o-mini",
  "google/gemini-pro-1.5",
  "google/gemini-flash-1.5",
]);
const DEFAULT_MODEL =
  "google/gemini-2.0-flash-lite-preview-02-05:free";

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

function readOpenRouterResult(
  payload: unknown,
): { text: string; tokens: number } | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  const choices = record.choices;
  if (!Array.isArray(choices) || choices.length === 0) return null;
  const first = choices[0];
  if (!first || typeof first !== "object") return null;
  const message = (first as Record<string, unknown>).message;
  if (!message || typeof message !== "object") return null;
  const content = (message as Record<string, unknown>).content;
  if (typeof content !== "string" || !content.trim()) return null;

  const usage =
    record.usage && typeof record.usage === "object"
      ? (record.usage as Record<string, unknown>)
      : null;
  const totalTokens = usage?.total_tokens;
  return {
    text: content.trim(),
    tokens:
      typeof totalTokens === "number" &&
      Number.isFinite(totalTokens) &&
      totalTokens >= 0
        ? totalTokens
        : 0,
  };
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
    provider: "openrouter" as const,
  };

  const startAudit = await recordInstitutionalAIEvent(
    institutionalRequest,
    "IA_SOLICITUD_AUTORIZADA",
    auditDetails,
  );
  if (!startAudit.ok) {
    console.error(
      "No se pudo auditar la solicitud de OpenRouter",
      startAudit.code,
    );
    response.status(500).json({
      error: "No se pudo registrar la trazabilidad de la solicitud.",
    });
    return;
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
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
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "X-Title": "SASE Institucional",
          "HTTP-Referer": origin,
        },
        body: JSON.stringify({
          model: institutionalRequest.model,
          messages: [
            { role: "user", content: institutionalRequest.prompt },
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
          "No se pudo auditar el fallo de OpenRouter",
          failureAudit.code,
        );
      }
      response.status(502).json({
        error: "El proveedor no pudo completar el borrador solicitado.",
      });
      return;
    }

    const result = readOpenRouterResult(payload);
    if (!result) {
      const failureAudit = await recordInstitutionalAIEvent(
        institutionalRequest,
        "IA_PROVEEDOR_FALLIDO",
        { ...auditDetails, httpStatus: 502 },
      );
      if (!failureAudit.ok) {
        console.error(
          "No se pudo auditar la respuesta vacía de OpenRouter",
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
        responseChars: result.text.length,
        tokens: result.tokens,
      },
    );
    if (!successAudit.ok) {
      console.error(
        "No se pudo auditar la respuesta de OpenRouter",
        successAudit.code,
      );
      response.status(500).json({
        error: "No se pudo registrar la trazabilidad del borrador.",
      });
      return;
    }

    response.status(200).json({
      text: result.text,
      tokens: result.tokens,
      draft: true,
    });
  } catch (error) {
    const failureAudit = await recordInstitutionalAIEvent(
      institutionalRequest,
      "IA_PROVEEDOR_FALLIDO",
      { ...auditDetails, httpStatus: 502 },
    );
    if (!failureAudit.ok) {
      console.error(
        "No se pudo auditar la interrupción de OpenRouter",
        failureAudit.code,
      );
    }
    console.error(
      "Falló la conexión con OpenRouter",
      error instanceof Error ? error.name : "UNKNOWN_ERROR",
    );
    response.status(502).json({
      error: "No se pudo conectar con el proveedor de IA.",
    });
  }
}
