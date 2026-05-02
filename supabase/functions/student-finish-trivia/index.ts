import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  auditFeriaEvent,
  buildCorsHeaders,
  errorResponse,
  evaluateTriviaAnswers,
  getRequestId,
  getServiceClient,
  jsonResponse,
  parseUuid,
  readJsonObject,
  resolveStudentSession,
} from "../_shared/feriaSecurity.ts";

type JsonRecord = Record<string, unknown>;

serve(async (req: Request) => {
  const corsHeaders = buildCorsHeaders(req.headers.get("Origin"));

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 204 });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Método no permitido." }, 405, corsHeaders);
  }

  const supabase = getServiceClient();

  try {
    const session = await resolveStudentSession(req, supabase);
    const body = await readJsonObject(req);
    const estacionId = parseUuid(body.estacion_id ?? body.estacionId, "estacion_id");
    const requestId = getRequestId(req, body);
    const answers = body.respuestas ?? body.answers;

    const { data: station, error: stationError } = await supabase
      .from("estaciones")
      .select("*")
      .eq("id", estacionId)
      .maybeSingle();

    if (stationError) throw stationError;
    if (!station) {
      await auditFeriaEvent(supabase, {
        session,
        action: "FERIA_TRIVIA_DENIED",
        description: "Intento de trivia en estación inexistente.",
        targetTable: "estaciones",
        targetId: estacionId,
        values: { reason: "station_not_found", request_id: requestId },
      });
      return jsonResponse({ error: "Estación no encontrada." }, 404, corsHeaders);
    }

    const validation = await evaluateTriviaAnswers(station as JsonRecord, answers);
    const { data, error } = await supabase.rpc("internal_feria_finalizar_trivia", {
      p_session_id: session.id,
      p_estudiante_id: session.estudiante_id,
      p_estacion_id: estacionId,
      p_puntos_adicionales: validation.points,
      p_answer_hash: validation.answerHash,
      p_request_id: requestId,
    });

    if (error) throw error;

    return jsonResponse({
      correct: validation.correct,
      result: data,
    }, 200, corsHeaders);
  } catch (error) {
    return errorResponse(error, corsHeaders);
  }
});
