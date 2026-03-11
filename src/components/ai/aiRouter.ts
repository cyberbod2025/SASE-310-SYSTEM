/**
 * Capa de enrutamiento IA de SASE
 * Gestiona peticiones a múltiples modelos a través de OpenRouter
 */
export async function routeAI(
  prompt: string,
  tipo?: string
): Promise<{ text: string; tokens?: number }> {
  // Selección dinámica de modelo
  let modelId = "google/gemini-2.0-flash-lite-preview-02-05:free"; 
  
  if (tipo === "gpt-4o") {
    modelId = "openai/gpt-4o-mini"; // OpenRouter default for testing
  } else if (tipo === "gemini-pro-latest") {
    modelId = "google/gemini-pro-1.5";
  } else if (tipo === "gemini-flash-latest") {
    modelId = "google/gemini-flash-1.5";
  }

  try {
    const authHeaders = await import("./aiAuth").then((mod) =>
      mod.buildAuthHeaders(),
    );
    const response = await fetch("/api/ai/openrouter", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({ prompt, model: modelId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error || response.statusText);
    }

    const data = await response.json();
    return { text: data.text || "", tokens: data.tokens || 0 };
  } catch (proxyError: any) {
    throw new Error(proxyError?.message || "OpenRouter proxy error");
  }
}
