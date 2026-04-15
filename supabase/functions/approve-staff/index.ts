// deno-deploy-functions/supabase/functions/approve-staff/index.ts

// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";

type JsonRecord = Record<string, unknown>;

const APPROVER_ROLES = new Set([
  "directivo",
  "subdireccion",
  "developer",
  "system_admin",
  "admin",
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
  "developer",
  "system_admin",
]);

const ROLE_ALIASES: Record<string, string> = {
  direccion: "directivo",
  directivo: "directivo",
  enfermeria: "medico_escolar",
  medico_escolar: "medico_escolar",
  promotora: "promotora_lectura",
  promotora_lectura: "promotora_lectura",
  desarrollador: "developer",
  developer: "developer",
  admin: "admin",
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

const PERMISSIONS_BY_ROLE: Record<string, JsonRecord> = {
  directivo: {
    can_view_names: true,
    can_register: true,
    can_edit: true,
    can_close: true,
    can_escalate: true,
    can_view_audit: true,
    can_approve_staff: true,
    can_assign_groups: true,
    can_view_sensitive: true,
    can_manage_system: true,
  },
  subdireccion: {
    can_view_names: true,
    can_register: true,
    can_edit: true,
    can_close: true,
    can_escalate: true,
    can_view_audit: true,
    can_approve_staff: true,
    can_assign_groups: true,
    can_view_sensitive: true,
    can_manage_system: false,
  },
  docente: {
    can_view_names: false,
    can_register: true,
    can_edit: false,
    can_close: false,
    can_escalate: true,
    can_view_audit: false,
    can_approve_staff: false,
    can_assign_groups: false,
    can_view_sensitive: false,
    can_manage_system: false,
  },
  docente_tutor: {
    can_view_names: false,
    can_register: true,
    can_edit: true,
    can_close: true,
    can_escalate: true,
    can_view_audit: false,
    can_approve_staff: false,
    can_assign_groups: false,
    can_view_sensitive: false,
    can_manage_system: false,
  },
  prefectura: {
    can_view_names: false,
    can_register: true,
    can_edit: true,
    can_close: true,
    can_escalate: true,
    can_view_audit: false,
    can_approve_staff: false,
    can_assign_groups: false,
    can_view_sensitive: false,
    can_manage_system: false,
  },
  orientacion: {
    can_view_names: true,
    can_register: true,
    can_edit: true,
    can_close: true,
    can_escalate: true,
    can_view_audit: false,
    can_approve_staff: false,
    can_assign_groups: false,
    can_view_sensitive: true,
    can_manage_system: false,
  },
  trabajo_social: {
    can_view_names: true,
    can_register: true,
    can_edit: true,
    can_close: true,
    can_escalate: true,
    can_view_audit: false,
    can_approve_staff: false,
    can_assign_groups: false,
    can_view_sensitive: true,
    can_manage_system: false,
  },
  medico_escolar: {
    can_view_names: true,
    can_register: true,
    can_edit: true,
    can_close: false,
    can_escalate: true,
    can_view_audit: false,
    can_approve_staff: false,
    can_assign_groups: false,
    can_view_sensitive: true,
    can_manage_system: false,
  },
  promotora_lectura: {
    can_view_names: false,
    can_register: true,
    can_edit: true,
    can_close: false,
    can_escalate: false,
    can_view_audit: false,
    can_approve_staff: false,
    can_assign_groups: false,
    can_view_sensitive: false,
    can_manage_system: false,
  },
  secretaria: {
    can_view_names: true,
    can_register: true,
    can_edit: true,
    can_close: false,
    can_escalate: false,
    can_view_audit: false,
    can_approve_staff: false,
    can_assign_groups: false,
    can_view_sensitive: false,
    can_manage_system: false,
  },
  udeii: {
    can_view_names: true,
    can_register: true,
    can_edit: true,
    can_close: true,
    can_escalate: true,
    can_view_audit: false,
    can_approve_staff: false,
    can_assign_groups: false,
    can_view_sensitive: true,
    can_manage_system: false,
  },
  developer: {
    can_view_names: true,
    can_register: true,
    can_edit: true,
    can_close: true,
    can_escalate: true,
    can_view_audit: true,
    can_approve_staff: true,
    can_assign_groups: true,
    can_view_sensitive: true,
    can_manage_system: true,
  },
  system_admin: {
    can_view_names: true,
    can_register: true,
    can_edit: true,
    can_close: true,
    can_escalate: true,
    can_view_audit: true,
    can_approve_staff: true,
    can_assign_groups: true,
    can_view_sensitive: true,
    can_manage_system: true,
  },
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

const buildCombinedScopes = (roles: string[]): JsonRecord => {
  const base: JsonRecord = {
    can_view_names: false,
    can_register: false,
    can_edit: false,
    can_close: false,
    can_escalate: false,
    can_view_audit: false,
    can_approve_staff: false,
    can_assign_groups: false,
    can_view_sensitive: false,
    can_manage_system: false,
  };

  for (const role of roles) {
    const permissions = PERMISSIONS_BY_ROLE[role];
    if (!permissions) continue;
    for (const [key, value] of Object.entries(permissions)) {
      if (value) {
        base[key] = true;
      }
    }
  }

  return base;
};

const resolveRequesterRole = async (supabase: any, userId: string): Promise<string | null> => {
  const { data: institutionalProfile } = await supabase
    .from("perfiles_usuario")
    .select("rol")
    .eq("id", userId)
    .maybeSingle();

  const institutionalRole = normalizeRole(institutionalProfile?.rol);
  if (institutionalRole) return institutionalRole;

  const { data: legacyProfile } = await supabase
    .from("profiles")
    .select("role, rol")
    .eq("id", userId)
    .maybeSingle();

  return normalizeRole(legacyProfile?.rol ?? legacyProfile?.role);
};

const findAuthUserByEmail = async (supabase: any, email: string) => {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) throw error;
  return data?.users?.find((user: any) =>
    (user.email ?? "").toLowerCase() === email.toLowerCase()
  ) ?? null;
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
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      existingUser.id,
      {
        user_metadata: {
          ...(existingUser.user_metadata ?? {}),
          ...metadata,
        },
      },
    );

    if (updateError) throw updateError;

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

    const solicitudId = typeof body.solicitudId === "string" ? body.solicitudId.trim() : "";
    const matriculaSase = typeof body.matricula_sase === "string"
      ? body.matricula_sase.trim().toUpperCase()
      : "";
    const grupos = sanitizeStringList(body.grupos, true);
    const materias = sanitizeStringList(body.materias);
    const esTutor = body.es_tutor === true;
    const grupoTutor = typeof body.grupo_tutor === "string" && esTutor
      ? body.grupo_tutor.trim().toUpperCase() || null
      : null;

    if (!solicitudId) {
      return new Response(JSON.stringify({ error: "Solicitud inválida" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!matriculaSase) {
      return new Response(JSON.stringify({ error: "Matrícula requerida" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const { data: solicitud, error: solicitudError } = await supabase
      .from("solicitudes_alta_personal")
      .select("*")
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
    const approvedRoles = [...new Set(requestedRoles
      .map((role: unknown) => normalizeRole(role))
      .filter((role): role is string => Boolean(role) && APPROVABLE_ROLES.has(role)))];

    if (approvedRoles.length === 0) {
      return new Response(JSON.stringify({ error: "La solicitud no contiene roles aprobables" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (esTutor && approvedRoles.includes("docente") && !approvedRoles.includes("docente_tutor")) {
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

    if (!institutionalEmail) {
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

    const { data: conflictingProfile } = await supabase
      .from("perfiles_usuario")
      .select("id")
      .eq("email", institutionalEmail)
      .neq("id", userId)
      .maybeSingle();

    if (conflictingProfile) {
      throw new Error("Existe un perfil institucional con otro ID para ese correo.");
    }

    const now = new Date().toISOString();
    const scopes = buildCombinedScopes(approvedRoles);
    const profilePayload = {
      id: userId,
      matricula_sase: matriculaSase,
      rol: primaryRole,
      rol_solicitado: approvedRoles.join(","),
      nombre_completo: fullName,
      curp: solicitud.curp,
      email: institutionalEmail,
      materias: materias.length > 0 ? materias : null,
      grupos: grupos.length > 0 ? grupos : null,
      turno: solicitud.turno,
      es_tutor: esTutor,
      grupo_tutor: grupoTutor,
      alcances: scopes,
      permisos: scopes,
      estado_cuenta: "activo",
      telefono: solicitud.telefono,
      fecha_validacion: now,
      validado_por: authData.user.id,
      observaciones: solicitud.observaciones,
      updated_at: now,
    };

    const { error: profileError } = await supabase
      .from("perfiles_usuario")
      .upsert(profilePayload, { onConflict: "id" });

    if (profileError) throw profileError;

    const legacyProfilePayload = {
      id: userId,
      full_name: fullName,
      role: primaryRole,
    };

    const { error: legacyProfileError } = await supabase
      .from("profiles")
      .upsert(legacyProfilePayload, { onConflict: "id" });

    if (legacyProfileError) {
      console.warn("No se pudo sincronizar el perfil legacy", legacyProfileError.message);
    }

    const solicitudUpdate = {
      estado: "APROBADA",
      matricula_sase: matriculaSase,
      es_tutor: esTutor,
      grupo_tutor: grupoTutor,
      materias: materias.length > 0 ? materias : null,
      grupos: grupos.length > 0 ? grupos : null,
      rol_solicitado: approvedRoles,
      aprobado_por: authData.user.id,
      aprobado_en: now,
      observaciones_validacion: null,
    };

    const { error: updateSolicitudError } = await supabase
      .from("solicitudes_alta_personal")
      .update(solicitudUpdate)
      .eq("id", solicitudId);

    if (updateSolicitudError) throw updateSolicitudError;

    const { error: auditError } = await supabase.from("auditoria").insert({
      usuario_id: authData.user.id,
      email_usuario: authData.user.email,
      rol_usuario: requesterRole,
      tipo_accion: "APROBACION_PERSONAL",
      descripcion_accion:
        `Aprobó la solicitud ${solicitudId} para ${institutionalEmail} con rol ${primaryRole} (${status === "invited" ? "usuario invitado" : "usuario existente"}).`,
      tabla_objetivo: "solicitudes_alta_personal",
      id_registro_objetivo: solicitudId,
    });

    if (auditError) {
      console.warn("No se pudo registrar auditoría de aprobación", auditError.message);
    }

    return new Response(JSON.stringify({
      approved: true,
      primaryRole,
      approvedRoles,
      userId,
      alreadyExisted: status === "existing",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    const statusCode = error.message === "Unauthorized" ||
        error.message.includes("authorization")
      ? 401
      : error.message.includes("perfil institucional")
      ? 409
      : 400;

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: statusCode,
    });
  }
});
