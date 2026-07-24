export type AIRouteContext =
  | "asistente_institucional"
  | "redaccion_institucional"
  | "borrador_documento";

export interface AIRouteOptions {
  contextType?: AIRouteContext;
  purpose?: string;
}

type AIProxyPayload = {
  draft?: unknown;
  error?: unknown;
  text?: unknown;
  tokens?: unknown;
};

/**
 * Solicita un borrador al proxy gobernado. La respuesta nunca equivale a una
 * decisión ni se persiste automáticamente.
 */
export async function routeAI(
  prompt: string,
  tipo?: string,
  options: AIRouteOptions = {},
): Promise<{ text: string; tokens?: number }> {
  let modelId = "google/gemini-2.0-flash-lite-preview-02-05:free";

  if (tipo === "gpt-4o") {
    modelId = "openai/gpt-4o-mini";
  } else if (tipo === "gemini-pro-latest") {
    modelId = "google/gemini-pro-1.5";
  } else if (tipo === "gemini-flash-latest") {
    modelId = "google/gemini-flash-1.5";
  }

  const authHeaders = await import("./aiAuth").then((module) =>
    module.buildAuthHeaders(),
  );
  const response = await fetch("/api/ai/openrouter", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify({
      prompt,
      model: modelId,
      purpose:
        options.purpose ||
        "Atender una consulta institucional asistida y no decisoria",
      contextType: options.contextType || "asistente_institucional",
    }),
  });
  const payload = (await response.json().catch(() => null)) as
    | AIProxyPayload
    | null;

  if (!response.ok) {
    throw new Error(
      typeof payload?.error === "string"
        ? payload.error
        : "No se pudo obtener el borrador institucional.",
    );
  }
  if (
    payload?.draft !== true ||
    typeof payload.text !== "string" ||
    !payload.text.trim()
  ) {
    throw new Error("El proveedor no devolvió un borrador verificable.");
  }

  return {
    text: payload.text.trim(),
    tokens:
      typeof payload.tokens === "number" && Number.isFinite(payload.tokens)
        ? payload.tokens
        : 0,
  };
}
