// deno-deploy-functions/supabase/functions/invite-staff/index.ts

// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";

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

const getAllowedOrigins = (): string[] => {
  const allowed = Deno.env.get("ALLOWED_ORIGINS") ?? "";
  return allowed
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
};

const buildCorsHeaders = (origin: string | null): HeadersInit => {
  return {
    "Access-Control-Allow-Origin": origin ?? "",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
};

serve(async (req: Request) => {
  const origin = req.headers.get("Origin");
  const allowedOrigins = getAllowedOrigins();
  // Allow if ALLOWED_ORIGINS is not set (for local dev) or if origin is in the list
  const isAllowedOrigin = (allowedOrigins.length === 0) || (origin ? allowedOrigins.includes(origin) : false);

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
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      throw new Error("Invalid authorization");
    }

    const { data: authData, error: authError } = await supabase.auth.getUser(token);

    if (authError || !authData?.user) {
      throw new Error("Unauthorized");
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
      return new Response(JSON.stringify({ error: "Insufficient permissions" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    const body = await req.json();
    const { email, role: inviteRole, fullName } = body;

    const emailRegex = /^[a-z]+\.[a-z]+@sase\.mx$/;
    if (!email || typeof email !== "string" || !emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (inviteRole && typeof inviteRole !== "string") {
      return new Response(JSON.stringify({ error: "Invalid role" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const normalizedInviteRole = inviteRole?.toLowerCase().trim();
    if (normalizedInviteRole && !ALLOWED_INVITE_ROLES.has(normalizedInviteRole)) {
      return new Response(JSON.stringify({ error: "Invalid role" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: {
        role: normalizedInviteRole,
        full_name: fullName,
      },
    });

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ invited: true, user: data?.user ?? null }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    const statusCode = error.message === "Unauthorized" || error.message.includes("authorization") ? 401 : 400;
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: statusCode,
    });
  }
});
