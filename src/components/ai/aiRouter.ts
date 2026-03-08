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
    const response = await fetch("/api/ai/openrouter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, model: modelId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error || response.statusText);
    }

    const data = await response.json();
    return { text: data.text || "", tokens: data.tokens || 0 };
  } catch (proxyError: any) {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error(proxyError?.message || "OpenRouter proxy error");
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "SASE Institucional",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenRouter Error: ${errorData.error?.message || response.statusText}`,
      );
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";
    const tokens = data.usage?.total_tokens || 0;
    return { text, tokens };
  }
}
