// deno-deploy-functions/supabase/functions/create-user/index.ts

// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
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
