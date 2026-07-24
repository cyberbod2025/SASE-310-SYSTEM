import { createClient } from "@supabase/supabase-js";
import { getRateLimitKey, isRateLimited } from "../ai/rateLimit";

type VercelRequest = any;
type VercelResponse = any;

const APPROVABLE_ROLES = new Set([
  "directivo",
  "subdireccion",
  "docente",
  "docente_tutor",
  "prefectura",
  "orientacion",
  "trabajo_social",
  "medico_escolar",
  "udeii",
  "promotora_lectura",
  "secretaria",
]);

const ROLE_ALIASES: Record<string, string> = {
  direccion: "directivo",
  enfermeria: "medico_escolar",
  promotora: "promotora_lectura",
};

function normalizeName(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function normalizeRole(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  const canonical = ROLE_ALIASES[normalized] ?? normalized;
  return APPROVABLE_ROLES.has(canonical) ? canonical : null;
}

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
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
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

  const rateKey = getRateLimitKey(req);
  if (await isRateLimited(rateKey, 20, 60_000)) {
    res.status(429).json({ error: "Rate limit exceeded" });
    return;
  }

  const body = req.body ?? {};
  if (typeof body !== "object" || Array.isArray(body)) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { fullName, alternateFullName } = body as {
    fullName?: string;
    alternateFullName?: string;
  };
  if (!fullName || typeof fullName !== "string" || fullName.length > 200) {
    res.status(400).json({ error: "Invalid fullName" });
    return;
  }

  if (fullName.trim().length < 4) {
    res.status(400).json({ error: "Invalid fullName" });
    return;
  }
  if (
    alternateFullName !== undefined &&
    (typeof alternateFullName !== "string" ||
      alternateFullName.length > 200 ||
      alternateFullName.trim().length < 4)
  ) {
    res.status(400).json({ error: "Invalid alternateFullName" });
    return;
  }

  const normalizedTarget = normalizeName(fullName);
  const normalizedAlternate =
    typeof alternateFullName === "string"
      ? normalizeName(alternateFullName)
      : normalizedTarget;
  const nameCandidates = [...new Set([normalizedTarget, normalizedAlternate])];
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    res.status(500).json({ error: "Missing Supabase service credentials" });
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data, error } = await supabase
    .from("personal_oficial")
    .select("role")
    .eq("is_active", true)
    .in("full_name_normalized", nameCandidates)
    .limit(5);

  if (error) {
    res.status(500).json({ error: "Error al validar la nomina oficial" });
    return;
  }

  const matchedRoles = [
    ...new Set((data || []).map((staff) => normalizeRole(staff.role))),
  ].filter((role): role is string => Boolean(role));
  if (matchedRoles.length !== 1) {
    res.status(200).json({ match: false });
    return;
  }

  res.status(200).json({ match: true, role: matchedRoles[0] });
}
