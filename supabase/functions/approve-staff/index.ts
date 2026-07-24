// deno-deploy-functions/supabase/functions/approve-staff/index.ts

// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";

const APPROVER_ROLES = new Set([
  "directivo",
  "subdireccion",
  "developer",
  "system_admin",
]);

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

const INSTITUTIONAL_EMAIL_PATTERN =
  /^[a-z0-9]+(?:\.[a-z0-9]+)+@sase\.mx$/;

const ROLE_ALIASES: Record<string, string> = {
  direccion: "directivo",
  directivo: "directivo",
  enfermeria: "medico_escolar",
  medico_escolar: "medico_escolar",
  promotora: "promotora_lectura",
  promotora_lectura: "promotora_lectura",
  desarrollador: "developer",
  developer: "developer",
  system_admin: "system_admin",
  subdireccion: "subdireccion",
  docente: "docente",
  docente_tutor: "docente_tutor",
  prefectura: "prefectura",
  orientacion: "orientacion",
  trabajo_social: "trabajo_social",
  udeii: "udeii",
  secretaria: "secretaria",
};

const getAllowedOrigins = (): string[] => {
  const allowed = Deno.env.get("ALLOWED_ORIGINS") ?? "";
  return allowed
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
};

const buildCorsHeaders = (origin: string | null): HeadersInit => ({
  "Access-Control-Allow-Origin": origin ?? "",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
  Vary: "Origin",
});

const normalizeRole = (role: unknown): string | null => {
  if (typeof role !== "string") return null;
  const normalized = role.trim().toLowerCase();
  if (!normalized) return null;
  return ROLE_ALIASES[normalized] ?? normalized;
};

const sanitizeStringList = (value: unknown, uppercase = false): string[] => {
  if (!Array.isArray(value)) return [];
  const items = value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => uppercase ? item.toUpperCase() : item);
  return [...new Set(items)];
};

const resolveRequesterRole = async (supabase: any, userId: string): Promise<string | null> => {
  const { data: institutionalProfile, error } = await supabase
    .from("perfiles_usuario")
    .select("rol, estado_cuenta, seguridad_status")
    .eq("id", userId)
    .eq("estado_cuenta", "activo")
    .eq("seguridad_status", "active")
    .maybeSingle();

  if (error || !institutionalProfile) return null;
  return normalizeRole(institutionalProfile.rol);
};

const findAuthUserByEmail = async (supabase: any, email: string) => {
  const normalizedEmail = email.toLowerCase();
  const perPage = 200;

  for (let page = 1; page <= 100; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error) throw error;

    const users = data?.users ?? [];
    const match = users.find((user: any) =>
      (user.email ?? "").toLowerCase() === normalizedEmail
    );
    if (match) return match;
    if (users.length < perPage) return null;
  }

  throw new Error("No se pudo completar la búsqueda del usuario Auth.");
};

const ensureAuthUser = async (
  supabase: any,
  email: string,
  fullName: string,
  primaryRole: string,
  approvedRoles: string[],
) => {
  const metadata = {
    role: primaryRole,
    roles: approvedRoles,
    full_name: fullName,
  };

  const existingUser = await findAuthUserByEmail(supabase, email);
  if (existingUser) {
    return { userId: existingUser.id, status: "existing" as const };
  }

  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: metadata,
  });

  if (error) {
    const message = error.message?.toLowerCase?.() ?? "";
    if (message.includes("already")) {
      const fallbackUser = await findAuthUserByEmail(supabase, email);
      if (fallbackUser) {
        return { userId: fallbackUser.id, status: "existing" as const };
      }
    }
    throw error;
  }

  if (!data?.user?.id) {
    throw new Error("No se pudo determinar el usuario Auth aprobado.");
  }

  return { userId: data.user.id, status: "invited" as const };
};

serve(async (req: Request) => {
  const origin = req.headers.get("Origin");
  const allowedOrigins = getAllowedOrigins();
  const isAllowedOrigin = allowedOrigins.length === 0 ||
    (origin ? allowedOrigins.includes(origin) : false);

  if (!isAllowedOrigin) {
    return new Response(JSON.stringify({ error: "Forbidden origin" }), {
      headers: { "Content-Type": "application/json" },
      status: 403,
    });
  }

  const corsHeaders = buildCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 204 });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 405,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing Supabase service credentials");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) throw new Error("Invalid authorization");

    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData?.user) {
      throw new Error("Unauthorized");
    }

    const requesterRole = await resolveRequesterRole(supabase, authData.user.id);
    if (!requesterRole || !APPROVER_ROLES.has(requesterRole)) {
      return new Response(JSON.stringify({ error: "Insufficient permissions" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const solicitudId = typeof body.solicitudId === "string"
      ? body.solicitudId.trim()
      : "";
    const action = body.action === "rechazar"
      ? "rechazar"
      : body.action === "aprobar" || body.action === undefined
      ? "aprobar"
      : null;

    if (!solicitudId || !action) {
      return new Response(JSON.stringify({ error: "Solicitud inválida" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (action === "rechazar") {
      const reason = typeof body.reason === "string" ? body.reason.trim() : "";
      if (reason.length < 10 || reason.length > 1000) {
        return new Response(
          JSON.stringify({
            error: "El motivo debe contener entre 10 y 1000 caracteres",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          },
        );
      }

      const { data: rejection, error: rejectionError } = await supabase.rpc(
        "rechazar_solicitud_personal",
        {
          p_solicitud_id: solicitudId,
          p_motivo: reason,
          p_aprobador_id: authData.user.id,
        },
      );

      if (rejectionError) {
        const rejectionFailure = new Error(
          rejectionError.message || "No se pudo rechazar la solicitud",
        );
        (rejectionFailure as any).status = rejectionError.code === "42501"
          ? 403
          : rejectionError.code === "P0002"
          ? 404
          : rejectionError.code === "23514"
          ? 409
          : 400;
        throw rejectionFailure;
      }

      return new Response(JSON.stringify(rejection), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const matriculaSase = typeof body.matricula_sase === "string"
      ? body.matricula_sase.trim().toUpperCase()
      : "";
    const grupos = sanitizeStringList(body.grupos, true);
    const materias = sanitizeStringList(body.materias);
    const esTutor = body.es_tutor === true;
    const grupoTutor = typeof body.grupo_tutor === "string" && esTutor
      ? body.grupo_tutor.trim().toUpperCase() || null
      : null;

    if (!matriculaSase) {
      return new Response(JSON.stringify({ error: "Matrícula requerida" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const { data: solicitud, error: solicitudError } = await supabase
      .from("solicitudes_alta_personal")
      .select(
        "id, estado, rol_solicitado, nombres, apellido_paterno, apellido_materno, correo_institucional",
      )
      .eq("id", solicitudId)
      .maybeSingle();

    if (solicitudError || !solicitud) {
      return new Response(JSON.stringify({ error: "Solicitud no encontrada" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    const solicitudEstado = (solicitud.estado ?? "").toUpperCase();
    if (!["PENDIENTE", "OBSERVACIONES"].includes(solicitudEstado)) {
      return new Response(
        JSON.stringify({ error: "La solicitud ya fue procesada" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 409,
        },
      );
    }

    const requestedRoles = Array.isArray(solicitud.rol_solicitado)
      ? solicitud.rol_solicitado
      : [];
    const normalizedRoles = requestedRoles.map((role: unknown) =>
      normalizeRole(role)
    );

    if (
      normalizedRoles.some((role) =>
        !role || !APPROVABLE_ROLES.has(role)
      )
    ) {
      return new Response(
        JSON.stringify({ error: "La solicitud contiene un rol no aprobable" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    const approvedRoles = [...new Set(normalizedRoles as string[])];

    if (approvedRoles.length === 0) {
      return new Response(
        JSON.stringify({ error: "La solicitud no contiene roles aprobables" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    if (
      esTutor &&
      !approvedRoles.includes("docente") &&
      !approvedRoles.includes("docente_tutor")
    ) {
      return new Response(
        JSON.stringify({
          error: "La tutoría solo puede asignarse a personal docente",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    if (
      esTutor &&
      approvedRoles.includes("docente") &&
      !approvedRoles.includes("docente_tutor")
    ) {
      approvedRoles.push("docente_tutor");
    }

    const primaryRole = approvedRoles.includes("docente_tutor")
      ? "docente_tutor"
      : approvedRoles[0];
    const fullName = [
      solicitud.nombres,
      solicitud.apellido_paterno,
      solicitud.apellido_materno,
    ].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
    const institutionalEmail = String(solicitud.correo_institucional ?? "").trim().toLowerCase();

    if (!INSTITUTIONAL_EMAIL_PATTERN.test(institutionalEmail)) {
      return new Response(JSON.stringify({ error: "Correo institucional inválido" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const { userId, status } = await ensureAuthUser(
      supabase,
      institutionalEmail,
      fullName,
      primaryRole,
      approvedRoles,
    );

    const { data: approval, error: approvalError } = await supabase.rpc(
      "finalizar_aprobacion_personal",
      {
        p_solicitud_id: solicitudId,
        p_usuario_auth_id: userId,
        p_matricula_sase: matriculaSase,
        p_grupos: grupos,
        p_materias: materias,
        p_es_tutor: esTutor,
        p_grupo_tutor: grupoTutor,
        p_aprobador_id: authData.user.id,
        p_auth_status: status,
      },
    );

    if (approvalError) {
      if (status === "invited") {
        const { error: compensationError } =
          await supabase.auth.admin.deleteUser(userId);
        if (compensationError) {
          console.error(
            "No se pudo compensar la invitación Auth",
            compensationError.message,
          );
        }
      }

      const approvalFailure = new Error(
        approvalError.message || "No se pudo finalizar la aprobación",
      );
      (approvalFailure as any).status = approvalError.code === "42501"
        ? 403
        : approvalError.code === "P0002"
        ? 404
        : approvalError.code === "23505" ||
            approvalError.code === "23514"
        ? 409
        : 400;
      throw approvalFailure;
    }

    let metadataSynchronized = status === "invited";
    if (status === "existing") {
      const existingUser = await findAuthUserByEmail(
        supabase,
        institutionalEmail,
      );
      const { error: metadataError } =
        await supabase.auth.admin.updateUserById(userId, {
          user_metadata: {
            ...(existingUser?.user_metadata ?? {}),
            role: primaryRole,
            roles: approvedRoles,
            full_name: fullName,
          },
        });
      metadataSynchronized = !metadataError;
      if (metadataError) {
        console.warn(
          "La aprobación quedó confirmada, pero Auth metadata no se sincronizó",
          metadataError.message,
        );
      }
    }

    const approvalPayload = approval &&
        typeof approval === "object" &&
        !Array.isArray(approval)
      ? approval
      : {
        approved: true,
        primaryRole,
        approvedRoles,
        userId,
        alreadyExisted: status === "existing",
      };

    return new Response(JSON.stringify({
      ...approvalPayload,
      metadataSynchronized,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    const statusCode = typeof error.status === "number"
      ? error.status
      : error.message === "Unauthorized" ||
          error.message.includes("authorization")
      ? 401
      : 400;

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: statusCode,
    });
  }
});
