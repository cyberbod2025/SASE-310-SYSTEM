type VercelRequest = any;
type VercelResponse = any;

const ALLOWED_MODELS = new Set([
  "google/gemini-2.0-flash-lite-preview-02-05:free",
  "openai/gpt-4o-mini",
  "google/gemini-pro-1.5",
  "google/gemini-flash-1.5",
]);

function isAllowedOrigin(origin: string | undefined): boolean {
  const allowed = process.env.ALLOWED_ORIGINS;
  if (!allowed) return true;
  if (!origin) return true;
  return allowed
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean)
    .includes(origin);
}

// TODO: Replace with a shared store (Upstash/Redis) for multi-instance rate limiting.
const rateLimitState = new Map<string, { count: number; resetAt: number }>();
function isRateLimited(key: string, limit = 60, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = rateLimitState.get(key);
  if (!entry || entry.resetAt <= now) {
    rateLimitState.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > limit;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const origin = req.headers.origin;
  if (!isAllowedOrigin(origin)) {
    res.status(403).json({ error: "Forbidden origin" });
    return;
  }

  const rateKey = (req.headers["x-forwarded-for"] as string) || "unknown";
  if (isRateLimited(rateKey)) {
    res.status(429).json({ error: "Rate limit exceeded" });
    return;
  }

  const body = req.body ?? {};
  if (typeof body !== "object" || Array.isArray(body)) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { prompt, model } = body as { prompt?: string; model?: string };
  if (!prompt || typeof prompt !== "string" || prompt.length > 8000) {
    res.status(400).json({ error: "Invalid prompt" });
    return;
  }

  if (model && typeof model !== "string") {
    res.status(400).json({ error: "Invalid model" });
    return;
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Missing OPENROUTER_API_KEY" });
    return;
  }

  const modelId = model && ALLOWED_MODELS.has(model)
    ? model
    : "google/gemini-2.0-flash-lite-preview-02-05:free";

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-Title": "SASE Institucional",
      ...(req.headers.origin ? { "HTTP-Referer": req.headers.origin } : {}),
    },
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    res.status(response.status).json({
      error: errorData?.error?.message || response.statusText,
    });
    return;
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content || "";
  const tokens = data?.usage?.total_tokens || 0;

  res.status(200).json({ text, tokens });
}
