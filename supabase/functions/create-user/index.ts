// deno-deploy-functions/supabase/functions/create-user/index.ts

// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";

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
  const isAllowedOrigin = origin ? allowedOrigins.includes(origin) : false;

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

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // 1. Verificar que quien llama es Super Admin o Dirección (auth context)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user: caller },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !caller) {
      throw new Error("Unauthorized caller");
    }

    // 1.1 Verificar el rol del solicitante en perfiles_usuario
    const { data: callerProfile, error: profileError } = await supabase
      .from("perfiles_usuario")
      .select("rol")
      .eq("id", caller.id)
      .single();

    if (profileError || !callerProfile) {
      throw new Error("No se pudo verificar el perfil del solicitante.");
    }

    const permittedRoles = ["directivo", "developer", "subdireccion"];
    if (!permittedRoles.includes(callerProfile.rol?.toLowerCase())) {
      throw new Error("No tienes permisos suficientes (Admin Required)");
    }

    const { email, password, userData } = await req.json();

    // 2. Crear usuario REAL
    const { data: newUser, error: createError } =
      await supabase.auth.admin.createUser({
        email,
        password, // O auto-generada
        email_confirm: true,
        user_metadata: userData,
      });

    if (createError) throw createError;

    return new Response(JSON.stringify(newUser), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
