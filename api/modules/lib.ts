import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

type VercelRequest = any;
type VercelResponse = any;

export type ModuleKey = "feria" | "diagnostico" | "mate";

type InstitutionalProfile = {
  id: string;
  role: string;
  email: string | null;
  name: string;
  groupId: string | null;
};

type AuthenticatedUser = {
  id: string;
  email: string | null;
  user_metadata?: Record<string, unknown>;
};

type ServiceSupabase = any;

type ModuleRecord = {
  id: string;
  key: ModuleKey;
  name: string;
  base_url: string;
  is_active: boolean;
};

const MODULE_KEYS = new Set<ModuleKey>(["feria", "diagnostico", "mate"]);
const TOKEN_TTL_SECONDS = 60 * 5;
const DEFAULT_INSTITUTION_ID = "09DES4310M";

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  return normalized || null;
}

function normalizeRole(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  return normalized || null;
}

function normalizeGroupId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized || null;
}

function toBase64Url(value: string | Buffer): string {
  const buffer = Buffer.isBuffer(value) ? value : Buffer.from(value, "utf8");
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function setCorsHeaders(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin;
  const allowed = process.env.ALLOWED_ORIGINS;
  
  if (origin && allowed?.split(",").map(o => o.trim()).includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  } else {
    const firstAllowed = allowed?.split(",")[0]?.trim();
    if (firstAllowed) res.setHeader("Access-Control-Allow-Origin", firstAllowed);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
  );
}

function getServiceSupabase(): ServiceSupabase {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase service credentials");
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

function getSharedSecret() {
  const secret = process.env.SASE_SHARED_SECRET;
  if (!secret) {
    throw new Error("Missing SASE_SHARED_SECRET");
  }
  return secret;
}

function getEnvBaseUrl(moduleKey: ModuleKey): string | null {
  switch (moduleKey) {
    case "feria":
      return process.env.FERIA_APP_URL?.trim() || null;
    case "diagnostico":
      return process.env.DIAGNOSTICO_APP_URL?.trim() || null;
    case "mate":
      return process.env.MATE_APP_URL?.trim() || null;
    default:
      return null;
  }
}

function isDevelopmentFallbackAllowed() {
  return process.env.NODE_ENV !== "production" && process.env.VERCEL_ENV !== "production";
}

function resolveModuleBaseUrl(moduleKey: ModuleKey, dbBaseUrl: string): string {
  const envBaseUrl = getEnvBaseUrl(moduleKey);
  if (envBaseUrl) {
    return envBaseUrl;
  }

  if (isDevelopmentFallbackAllowed() && dbBaseUrl.trim()) {
    console.warn(
      `[modules] ${moduleKey} is using database base_url as local fallback. Configure the explicit environment variable before production.`,
    );
    return dbBaseUrl.trim();
  }

  throw new Error(`Missing base URL for module ${moduleKey}`);
}

function buildLaunchUrl(baseUrl: string, token: string): string {
  const hashIndex = baseUrl.indexOf("#");
  const prefix = hashIndex >= 0 ? baseUrl.slice(0, hashIndex) : baseUrl;
  const hash = hashIndex >= 0 ? baseUrl.slice(hashIndex) : "";
  const url = new URL(prefix);

  url.searchParams.set("sase_token", token);
  return `${url.toString()}${hash}`;
}

function mapTokenRole(institutionalRole: string): string {
  if (["docente", "docente_tutor", "teacher", "maestro"].includes(institutionalRole)) {
    return "teacher";
  }

  return institutionalRole;
}

function extractGroupId(profile: Record<string, unknown>): string | null {
  const tutorGroup = normalizeGroupId(profile.grupo_tutor);
  if (tutorGroup) return tutorGroup;

  const groups = profile.grupos;
  if (Array.isArray(groups)) {
    for (const group of groups) {
      const normalized = normalizeGroupId(group);
      if (normalized) return normalized;
    }
  }

  return null;
}

async function resolveAuthenticatedUser(authHeader: unknown) {
  if (typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing authorization header");
  }

  const accessToken = authHeader.slice(7).trim();
  if (!accessToken) {
    throw new Error("Invalid authorization header");
  }

  const supabase = getServiceSupabase();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    throw new Error("Invalid session");
  }

  return {
    supabase,
    authUser: user as AuthenticatedUser,
  };
}

async function resolveInstitutionalProfile(
  supabase: ServiceSupabase,
  authUser: AuthenticatedUser,
): Promise<InstitutionalProfile | null> {
  const { data } = await supabase
    .from("perfiles_usuario")
    .select("id, rol, role, email, nombre_completo, grupo_tutor, grupos")
    .eq("id", authUser.id)
    .maybeSingle();

  const institutionalProfile = data as Record<string, unknown> | null;

  if (institutionalProfile) {
    const role = normalizeRole(institutionalProfile.rol ?? institutionalProfile.role);
    if (!role) return null;

    return {
      id: authUser.id,
      role,
      email: normalizeEmail(institutionalProfile.email) || normalizeEmail(authUser.email),
      name:
        (typeof institutionalProfile.nombre_completo === "string" && institutionalProfile.nombre_completo.trim()) ||
        (typeof authUser.user_metadata?.full_name === "string" && authUser.user_metadata.full_name.trim()) ||
        normalizeEmail(authUser.email) ||
        "Usuario SASE",
      groupId: extractGroupId(institutionalProfile as Record<string, unknown>),
    };
  }

  const { data: legacyProfileData } = await supabase
    .from("profiles")
    .select("id, role, full_name")
    .eq("id", authUser.id)
    .maybeSingle();

  const legacyProfile = legacyProfileData as Record<string, unknown> | null;

  const legacyRole = normalizeRole(legacyProfile?.role);
  if (!legacyProfile || !legacyRole) {
    return null;
  }

  return {
    id: authUser.id,
    role: legacyRole,
    email: normalizeEmail(authUser.email),
    name:
      (typeof legacyProfile.full_name === "string" && legacyProfile.full_name.trim()) ||
      (typeof authUser.user_metadata?.full_name === "string" && authUser.user_metadata.full_name.trim()) ||
      normalizeEmail(authUser.email) ||
      "Usuario SASE",
    groupId: null,
  };
}

async function resolveModuleRecord(
  supabase: ServiceSupabase,
  moduleKey: ModuleKey,
): Promise<ModuleRecord | null> {
  const { data, error } = await supabase
    .from("modulos_ecosistema")
    .select("id, key, name, base_url, is_active")
    .eq("key", moduleKey)
    .maybeSingle();

  if (error) {
    throw new Error("Failed to load module catalog");
  }

  return (data as ModuleRecord | null) ?? null;
}

function isRuleActive(rule: { is_active?: boolean | null; starts_at?: string | null; ends_at?: string | null }) {
  if (rule.is_active === false) return false;

  const now = Date.now();
  if (rule.starts_at && new Date(rule.starts_at).getTime() > now) return false;
  if (rule.ends_at && new Date(rule.ends_at).getTime() < now) return false;
  return true;
}

async function hasModuleAccess(
  supabase: ServiceSupabase,
  moduleId: string,
  profile: InstitutionalProfile,
): Promise<boolean> {
  const normalizedEmail = normalizeEmail(profile.email);

  const [roleAccessResponse, userAccessResponse, emailAccessResponse] = await Promise.all([
    supabase
      .from("modulos_ecosistema_roles")
      .select("is_active, starts_at, ends_at")
      .eq("module_id", moduleId)
      .eq("role", profile.role),
    supabase
      .from("modulos_ecosistema_usuarios")
      .select("is_active, starts_at, ends_at")
      .eq("module_id", moduleId)
      .eq("user_id", profile.id),
    normalizedEmail
      ? supabase
          .from("modulos_ecosistema_usuarios")
          .select("is_active, starts_at, ends_at")
          .eq("module_id", moduleId)
          .ilike("email", normalizedEmail)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (roleAccessResponse.error || userAccessResponse.error || emailAccessResponse.error) {
    throw new Error("Failed to evaluate module access");
  }

  const roleAllowed = (roleAccessResponse.data || []).some(isRuleActive);
  const userAllowed = (userAccessResponse.data || []).some(isRuleActive);
  const emailAllowed = (emailAccessResponse.data || []).some(isRuleActive);

  return roleAllowed || userAllowed || emailAllowed;
}

async function writeAudit(
  supabase: ServiceSupabase,
  profile: InstitutionalProfile,
  moduleKey: ModuleKey,
  actionType: "MODULO_LAUNCH_OK" | "MODULO_LAUNCH_DENIED" | "MODULO_LAUNCH_ERROR",
  message: string,
) {
  try {
    await (supabase.from("auditoria") as any).insert({
      usuario_id: profile.id,
      email_usuario: normalizeEmail(profile.email),
      rol_usuario: profile.role,
      tipo_accion: actionType,
      descripcion_accion: message,
      tabla_objetivo: "modulos_ecosistema",
      id_registro_objetivo: moduleKey,
    });
  } catch (error) {
    console.warn("Module launch audit failed", error);
  }
}

function parseRequestedModule(req: VercelRequest, forcedModuleKey?: ModuleKey): ModuleKey | null {
  if (forcedModuleKey) return forcedModuleKey;

  let body: Record<string, unknown> = {};
  if (typeof req.body === "string") {
    try {
      body = JSON.parse(req.body || "{}");
    } catch {
      return null;
    }
  } else if (req.body && typeof req.body === "object") {
    body = req.body;
  }

  const rawModule = typeof body?.module === "string" ? body.module.trim().toLowerCase() : "";
  return MODULE_KEYS.has(rawModule as ModuleKey) ? (rawModule as ModuleKey) : null;
}

function buildToken(profile: InstitutionalProfile, moduleKey: ModuleKey) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + TOKEN_TTL_SECONDS;
  const payload = {
    sub: profile.id,
    uid: profile.id,
    email: normalizeEmail(profile.email),
    role: mapTokenRole(profile.role),
    name: profile.name,
    module: moduleKey,
    institutionId: DEFAULT_INSTITUTION_ID,
    groupId: profile.groupId,
    iat,
    exp,
  };

  const payloadBase64Url = toBase64Url(JSON.stringify(payload));
  const signature = toBase64Url(
    crypto.createHmac("sha256", getSharedSecret()).update(payloadBase64Url).digest(),
  );

  return {
    payload,
    token: `${payloadBase64Url}.${signature}`,
  };
}

export async function handleModuleLaunch(
  req: VercelRequest,
  res: VercelResponse,
  forcedModuleKey?: ModuleKey,
) {
  setCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const moduleKey = parseRequestedModule(req, forcedModuleKey);
  if (!moduleKey) {
    return res.status(400).json({ error: "Modulo invalido" });
  }

  let supabase: ServiceSupabase | null = null;
  let profile: InstitutionalProfile | null = null;
  let authUser: AuthenticatedUser | null = null;

  try {
    const authResult = await resolveAuthenticatedUser(
      req.headers.authorization || req.headers.Authorization,
    );
    supabase = authResult.supabase;
    authUser = authResult.authUser;
    profile = await resolveInstitutionalProfile(supabase, authResult.authUser);

    if (!profile) {
      await writeAudit(
        supabase,
        {
          id: authResult.authUser.id,
          role: "sin_perfil",
          email: normalizeEmail(authResult.authUser.email),
          name:
            (typeof authResult.authUser.user_metadata?.full_name === "string" &&
              authResult.authUser.user_metadata.full_name.trim()) ||
            normalizeEmail(authResult.authUser.email) ||
            "Usuario SASE",
          groupId: null,
        },
        moduleKey,
        "MODULO_LAUNCH_DENIED",
        `Launch rechazado para ${moduleKey}: perfil institucional ausente o invalido.`,
      );
      return res.status(403).json({ error: "Perfil institucional no autorizado" });
    }

    const moduleRecord = await resolveModuleRecord(supabase, moduleKey);
    if (!moduleRecord || !moduleRecord.is_active) {
      await writeAudit(
        supabase,
        profile,
        moduleKey,
        "MODULO_LAUNCH_DENIED",
        `Launch rechazado para ${moduleKey}: modulo inexistente o inactivo.`,
      );
      return res.status(404).json({ error: "Modulo no disponible" });
    }

    const allowed = await hasModuleAccess(supabase, moduleRecord.id, profile);
    if (!allowed) {
      await writeAudit(
        supabase,
        profile,
        moduleKey,
        "MODULO_LAUNCH_DENIED",
        `Launch rechazado para ${moduleKey}: usuario sin regla activa de acceso.`,
      );
      return res.status(403).json({ error: "No tienes acceso a este modulo" });
    }

    const { token } = buildToken(profile, moduleKey);
    const launchUrl = buildLaunchUrl(
      resolveModuleBaseUrl(moduleKey, moduleRecord.base_url),
      token,
    );

    await writeAudit(
      supabase,
      profile,
      moduleKey,
      "MODULO_LAUNCH_OK",
      `Launch autorizado para ${moduleKey}.`,
    );

    return res.status(200).json({ url: launchUrl, module: moduleKey });
  } catch (error: any) {
    if (supabase && profile) {
      await writeAudit(
        supabase,
        profile,
        moduleKey,
        "MODULO_LAUNCH_ERROR",
        `Error al lanzar ${moduleKey}: ${error?.message || "Error desconocido"}.`,
      );
    } else if (supabase && authUser) {
      await writeAudit(
        supabase,
        {
          id: authUser.id,
          role: "sin_perfil",
          email: normalizeEmail(authUser.email),
          name:
            (typeof authUser.user_metadata?.full_name === "string" && authUser.user_metadata.full_name.trim()) ||
            normalizeEmail(authUser.email) ||
            "Usuario SASE",
          groupId: null,
        },
        moduleKey,
        "MODULO_LAUNCH_ERROR",
        `Error al lanzar ${moduleKey}: ${error?.message || "Error desconocido"}.`,
      );
    }

    if (error?.message === "Missing authorization header" || error?.message === "Invalid authorization header") {
      return res.status(401).json({ error: "No autorizado" });
    }

    if (error?.message === "Invalid session") {
      return res.status(401).json({ error: "Sesion invalida" });
    }

    console.error("Module launch error", error);
    return res.status(500).json({ error: error?.message || "Error al lanzar modulo" });
  }
}
