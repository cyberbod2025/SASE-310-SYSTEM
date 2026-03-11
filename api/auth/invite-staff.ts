import { createClient } from "@supabase/supabase-js";
import { getRateLimitKey, isRateLimited } from "../ai/rateLimit";

type VercelRequest = any;
type VercelResponse = any;

const ALLOWED_INVITE_ROLES = new Set([
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
  "guest",
  "developer",
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

  const rateKey = getRateLimitKey(req);
  if (await isRateLimited(rateKey, 10, 60_000)) {
    res.status(429).json({ error: "Rate limit exceeded" });
    return;
  }

  const body = req.body ?? {};
  if (typeof body !== "object" || Array.isArray(body)) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { email, role: inviteRole, fullName } = body as {
    email?: string;
    role?: string;
    fullName?: string;
  };

  const emailRegex = /^[a-z]+\.[a-z]+@sase\.mx$/;
  if (!email || typeof email !== "string" || !emailRegex.test(email)) {
    res.status(400).json({ error: "Invalid email" });
    return;
  }

  if (inviteRole && typeof inviteRole !== "string") {
    res.status(400).json({ error: "Invalid role" });
    return;
  }

  const normalizedInviteRole = inviteRole?.toLowerCase().trim();
  if (normalizedInviteRole && !ALLOWED_INVITE_ROLES.has(normalizedInviteRole)) {
    res.status(400).json({ error: "Invalid role" });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    res.status(500).json({ error: "Missing Supabase service credentials" });
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

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData?.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  let { data: profile } = await supabase
    .from("perfiles_usuario")
    .select("rol")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (!profile) {
    const { data: legacyProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .maybeSingle();
    if (legacyProfile) {
      profile = { rol: legacyProfile.role } as any;
    }
  }

  const requesterRole = (profile?.rol || "").toString().toLowerCase();
  const allowedRoles = new Set(["directivo", "subdireccion", "developer"]);
  if (!allowedRoles.has(requesterRole)) {
    res.status(403).json({ error: "Insufficient permissions" });
    return;
  }

  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: {
      role: normalizedInviteRole,
      full_name: fullName,
    },
  });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(200).json({ invited: true, user: data?.user ?? null });
}
