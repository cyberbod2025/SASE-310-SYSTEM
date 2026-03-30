import { createClient } from "@supabase/supabase-js";
import { getRateLimitKey, isRateLimited } from "./rateLimit";

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
  if (!allowed) return false;
  if (!origin) return false;
  return allowed
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean)
    .includes(origin);
}

function setCorsHeaders(res: VercelResponse, origin: string | undefined) {
  if (!origin) return;
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );
  res.setHeader("Access-Control-Max-Age", "86400");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!process.env.ALLOWED_ORIGINS) {
    res.status(500).json({ error: "CORS origins not configured" });
    return;
  }

  const origin = req.headers.origin;
  if (!isAllowedOrigin(origin)) {
    res.status(403).json({ error: "Forbidden origin" });
    return;
  }

  setCorsHeaders(res, origin);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const authHeader =
    req.headers.authorization || (req.headers.Authorization as string | undefined);
  if (!authHeader || typeof authHeader !== "string") {
    res.status(401).json({ error: "Missing authorization" });
    return;
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : "";
  if (!token) {
    res.status(401).json({ error: "Invalid authorization" });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    res.status(500).json({ error: "Missing Supabase credentials" });
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData?.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const rateKey = getRateLimitKey(req);
  if (await isRateLimited(rateKey)) {
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
