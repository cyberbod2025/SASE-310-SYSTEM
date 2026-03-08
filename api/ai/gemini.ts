type VercelRequest = any;
type VercelResponse = any;

const ALLOWED_MODELS = new Set(["gemini-flash-latest", "gemini-2.0-flash"]);

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

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Missing GOOGLE_API_KEY" });
    return;
  }

  const modelId = model && ALLOWED_MODELS.has(model) ? model : "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
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
  const text =
    data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ||
    "";

  res.status(200).json({ text });
}
