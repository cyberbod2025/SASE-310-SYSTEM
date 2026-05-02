import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  buildCorsHeaders,
  errorResponse,
  getServiceClient,
  jsonResponse,
  resolveStudentSession,
} from "../_shared/feriaSecurity.ts";

serve(async (req: Request) => {
  const corsHeaders = buildCorsHeaders(req.headers.get("Origin"));

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 204 });
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return jsonResponse({ error: "Método no permitido." }, 405, corsHeaders);
  }

  const supabase = getServiceClient();

  try {
    const session = await resolveStudentSession(req, supabase);
    const { data, error } = await supabase.rpc("internal_feria_get_progress", {
      p_session_id: session.id,
      p_estudiante_id: session.estudiante_id,
    });

    if (error) throw error;

    return jsonResponse({ data }, 200, corsHeaders);
  } catch (error) {
    return errorResponse(error, corsHeaders);
  }
});
