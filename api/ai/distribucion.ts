import { createClient } from "@supabase/supabase-js";
import { getRateLimitKey, isRateLimited } from "./rateLimit";

type VercelRequest = any;
type VercelResponse = any;

type EnrollmentCandidate = {
  alumnoId: string;
  riskScore: number;
};

type GroupCandidate = {
  id: string;
  nombre: string;
};

const ALLOWED_FIELDS = new Set(["cycleId", "purpose"]);
const ALLOWED_ROLES = new Set([
  "directivo",
  "subdireccion",
  "system_admin",
  "developer",
]);
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

function getBearerToken(authorization: unknown): string | null {
  if (typeof authorization !== "string") return null;
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

function readRiskScore(relation: unknown): number {
  const candidate = Array.isArray(relation) ? relation[0] : relation;
  if (!candidate || typeof candidate !== "object") return 0;
  const score = (candidate as Record<string, unknown>).puntaje_riesgo;
  return typeof score === "number" && Number.isFinite(score) ? score : 0;
}

function normalizeEnrollments(rows: unknown): EnrollmentCandidate[] {
  if (!Array.isArray(rows)) return [];

  const unique = new Map<string, EnrollmentCandidate>();
  rows.forEach((row) => {
    if (!row || typeof row !== "object") return;
    const record = row as Record<string, unknown>;
    if (
      typeof record.alumno_id !== "string" ||
      !UUID_PATTERN.test(record.alumno_id)
    ) {
      return;
    }
    unique.set(record.alumno_id, {
      alumnoId: record.alumno_id,
      riskScore: readRiskScore(record.alumnos),
    });
  });

  return [...unique.values()].sort(
    (left, right) =>
      right.riskScore - left.riskScore ||
      left.alumnoId.localeCompare(right.alumnoId),
  );
}

function normalizeGroups(rows: unknown): GroupCandidate[] {
  if (!Array.isArray(rows)) return [];

  const unique = new Map<string, GroupCandidate>();
  rows.forEach((row) => {
    if (!row || typeof row !== "object") return;
    const record = row as Record<string, unknown>;
    if (
      typeof record.id !== "string" ||
      !UUID_PATTERN.test(record.id) ||
      typeof record.nombre !== "string" ||
      !record.nombre.trim()
    ) {
      return;
    }
    unique.set(record.id, {
      id: record.id,
      nombre: record.nombre.trim(),
    });
  });

  return [...unique.values()].sort(
    (left, right) =>
      left.nombre.localeCompare(right.nombre, "es") ||
      left.id.localeCompare(right.id),
  );
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

  const accessToken = getBearerToken(request.headers?.authorization);
  if (!accessToken) {
    response.status(401).json({ error: "Autenticación requerida" });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    response
      .status(500)
      .json({ error: "Credenciales de servicio Supabase no configuradas" });
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(accessToken);
  if (authError || !user) {
    response.status(401).json({ error: "Autenticación inválida" });
    return;
  }

  const { data: profile, error: profileError } = await supabase
    .from("perfiles_usuario")
    .select("rol, email")
    .eq("id", user.id)
    .eq("estado_cuenta", "activo")
    .eq("seguridad_status", "active")
    .maybeSingle();
  if (
    profileError ||
    !profile ||
    typeof profile.rol !== "string" ||
    !ALLOWED_ROLES.has(profile.rol)
  ) {
    response.status(403).json({ error: "Rol institucional no autorizado" });
    return;
  }

  const rateKey = `${user.id}:${getRateLimitKey(request)}`;
  if (await isRateLimited(`distribucion:${rateKey}`, 5, 60_000)) {
    response.status(429).json({ error: "Límite de solicitudes excedido" });
    return;
  }

  const body = request.body ?? {};
  if (
    typeof body !== "object" ||
    Array.isArray(body) ||
    Object.keys(body).some((key) => !ALLOWED_FIELDS.has(key))
  ) {
    response.status(400).json({ error: "Cuerpo de solicitud inválido" });
    return;
  }

  const { cycleId, purpose } = body as {
    cycleId?: unknown;
    purpose?: unknown;
  };
  if (typeof cycleId !== "string" || !UUID_PATTERN.test(cycleId)) {
    response.status(400).json({ error: "Identificador de ciclo inválido" });
    return;
  }
  if (
    typeof purpose !== "string" ||
    purpose.trim().length < 5 ||
    purpose.trim().length > 240
  ) {
    response.status(400).json({ error: "Propósito inválido" });
    return;
  }
  const normalizedPurpose = purpose.trim();

  try {
    const { data: cycle, error: cycleError } = await supabase
      .from("ciclos_escolares")
      .select("id, nombre")
      .eq("id", cycleId)
      .eq("activo", true)
      .maybeSingle();
    if (cycleError) {
      console.error(
        "No se pudo consultar el ciclo para distribución",
        cycleError.code,
      );
      response.status(500).json({
        error: "No se pudo consultar el ciclo escolar.",
      });
      return;
    }
    if (
      !cycle ||
      typeof cycle.nombre !== "string" ||
      !cycle.nombre.trim()
    ) {
      response
        .status(404)
        .json({ error: "No se encontró un ciclo escolar activo" });
      return;
    }

    const { data: enrollmentRows, error: enrollmentError } = await supabase
      .from("alumno_ciclo")
      .select("alumno_id, alumnos (puntaje_riesgo)")
      .eq("ciclo_id", cycleId)
      .eq("estatus", "activo");
    if (enrollmentError) {
      console.error(
        "No se pudieron consultar alumnos para distribución",
        enrollmentError.code,
      );
      response.status(500).json({
        error: "No se pudo consultar la población del ciclo.",
      });
      return;
    }

    const { data: groupRows, error: groupError } = await supabase
      .from("grupos")
      .select("id, nombre")
      .eq("ciclo_escolar", cycle.nombre.trim());
    if (groupError) {
      console.error(
        "No se pudieron consultar grupos para distribución",
        groupError.code,
      );
      response.status(500).json({
        error: "No se pudieron consultar los grupos del ciclo.",
      });
      return;
    }

    const enrollments = normalizeEnrollments(enrollmentRows);
    const groups = normalizeGroups(groupRows);
    if (groups.length === 0) {
      response.status(409).json({
        error: "El ciclo no tiene grupos válidos para generar una propuesta.",
      });
      return;
    }

    const balance = new Map(groups.map((group) => [group.id, 0]));
    const suggestions = enrollments.map((enrollment, index) => {
      const group = groups[index % groups.length];
      balance.set(group.id, (balance.get(group.id) ?? 0) + 1);
      return {
        alumno_id: enrollment.alumnoId,
        grupo_id: group.id,
        grupo_sugerido: group.nombre,
      };
    });

    const { error: auditError } = await supabase.from("auditoria").insert({
      usuario_id: user.id,
      email_usuario:
        typeof profile.email === "string" ? profile.email : user.email ?? null,
      rol_usuario: profile.rol,
      tipo_accion: "SUGERENCIA_DISTRIBUCION_GENERADA",
      descripcion_accion:
        "Se generó una propuesta de distribución escolar de solo lectura.",
      tabla_objetivo: "ciclos_escolares",
      id_registro_objetivo: cycleId,
      proposito: normalizedPurpose,
      origen: "servidor",
      new_values: {
        ciclo_id: cycleId,
        alumnos_considerados: enrollments.length,
        grupos_considerados: groups.length,
        solo_propuesta: true,
      },
    });
    if (auditError) {
      console.error(
        "No se pudo auditar la propuesta de distribución",
        auditError.code,
      );
      response.status(500).json({
        error: "No se pudo registrar la trazabilidad de la propuesta.",
      });
      return;
    }

    response.status(200).json({
      sugerencias: suggestions,
      equilibrio: groups.map((group) => ({
        grupo_id: group.id,
        grupo: group.nombre,
        alumnos_sugeridos: balance.get(group.id) ?? 0,
      })),
      ciclo_id: cycleId,
      alumnos_considerados: enrollments.length,
      grupos_considerados: groups.length,
      solo_propuesta: true,
      requiere_aprobacion_humana: true,
    });
  } catch (error) {
    console.error(
      "Falló la propuesta institucional de distribución",
      error instanceof Error ? error.name : "UNKNOWN_ERROR",
    );
    response.status(500).json({
      error: "No se pudo generar la propuesta institucional.",
    });
  }
}
