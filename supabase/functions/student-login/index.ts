import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  auditFeriaEvent,
  buildCorsHeaders,
  createOpaqueStudentToken,
  errorResponse,
  getServiceClient,
  getSessionTtlSeconds,
  hashStudentToken,
  jsonResponse,
  normalizeEmail,
  parseOptionalUuid,
  readJsonObject,
  sanitizeText,
  verifySaseLaunchToken,
} from "../_shared/feriaSecurity.ts";

type JsonRecord = Record<string, unknown>;

function normalizeGroup(value: unknown): string | null {
  const text = sanitizeText(value, 40);
  return text ? text.replace(/[\s_-]/g, "").toUpperCase() : null;
}

function groupMatches(tokenGroup: string | null, alumno: JsonRecord | null): boolean {
  if (!tokenGroup || !alumno) return true;

  const grade = sanitizeText(alumno.grado, 10);
  const group = sanitizeText(alumno.grupo, 10);
  const candidates = [
    normalizeGroup(group),
    normalizeGroup(`${grade ?? ""}${group ?? ""}`),
  ].filter(Boolean);

  return candidates.includes(normalizeGroup(tokenGroup));
}

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
    const body = await readJsonObject(req);
    const launchPayload = await verifySaseLaunchToken(body.sase_token ?? body.saseToken);
    const estudianteId = parseOptionalUuid(body.estudiante_id ?? body.estudianteId);
    const alumnoId = parseOptionalUuid(body.alumno_id ?? body.alumnoId);

    if (!estudianteId && !alumnoId) {
      throw new Error("Se requiere estudiante_id o alumno_id.");
    }

    const query = supabase
      .from("estudiantes")
      .select("id, alumno_id, nickname, grado, total_puntos, escaneos_realizados")
      .limit(1);

    const { data: studentRows, error: studentError } = estudianteId
      ? await query.eq("id", estudianteId)
      : await query.eq("alumno_id", alumnoId);

    if (studentError) throw studentError;
    const student = Array.isArray(studentRows) && studentRows.length > 0
      ? studentRows[0] as JsonRecord
      : null;

    if (!student?.id) {
      await auditFeriaEvent(supabase, {
        launchPayload,
        action: "FERIA_STUDENT_LOGIN_DENIED",
        description: "Intento de sesión de estudiante sin registro de Feria.",
        targetTable: "estudiantes",
        targetId: estudianteId ?? alumnoId,
        values: { reason: "student_not_found" },
      });
      return jsonResponse({ error: "Estudiante no encontrado." }, 404, corsHeaders);
    }

    let alumno: JsonRecord | null = null;
    if (student.alumno_id) {
      const { data: alumnoData, error: alumnoError } = await supabase
        .from("alumnos")
        .select("id, grado, grupo")
        .eq("id", student.alumno_id)
        .maybeSingle();
      if (alumnoError) throw alumnoError;
      alumno = alumnoData as JsonRecord | null;
    }

    if (!groupMatches(launchPayload.groupId ?? null, alumno)) {
      await auditFeriaEvent(supabase, {
        launchPayload,
        action: "FERIA_STUDENT_LOGIN_DENIED",
        description: "Intento de sesión de Feria fuera del grupo autorizado.",
        targetTable: "estudiantes",
        targetId: String(student.id),
        values: { reason: "group_mismatch", group_id: launchPayload.groupId ?? null },
      });
      return jsonResponse({ error: "Estudiante fuera del grupo autorizado." }, 403, corsHeaders);
    }

    const token = await createOpaqueStudentToken();
    const tokenHash = await hashStudentToken(token);
    const ttlSeconds = getSessionTtlSeconds();
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();

    const { data: session, error: sessionError } = await supabase
      .from("feria_student_sessions")
      .insert({
        token_hash: tokenHash,
        estudiante_id: student.id,
        alumno_id: student.alumno_id ?? null,
        issued_by_user_id: parseOptionalUuid(launchPayload.uid ?? launchPayload.sub ?? null),
        issued_by_email: normalizeEmail(launchPayload.email),
        issued_by_role: sanitizeText(launchPayload.role, 80),
        group_id: sanitizeText(launchPayload.groupId, 40),
        expires_at: expiresAt,
        metadata: {
          module: launchPayload.module,
          institutionId: launchPayload.institutionId ?? null,
        },
      })
      .select("id, expires_at")
      .single();

    if (sessionError) throw sessionError;

    await auditFeriaEvent(supabase, {
      launchPayload,
      action: "FERIA_STUDENT_LOGIN_OK",
      description: "Sesión opaca de estudiante generada para Feria.",
      targetTable: "feria_student_sessions",
      targetId: session.id,
      values: {
        session_id: session.id,
        estudiante_id: student.id,
        alumno_id: student.alumno_id ?? null,
        expires_at: session.expires_at,
      },
    });

    return jsonResponse({
      student_session_token: token,
      expires_at: session.expires_at,
      estudiante: {
        id: student.id,
        alumno_id: student.alumno_id ?? null,
        nickname: student.nickname ?? null,
        grado: student.grado ?? null,
        total_puntos: student.total_puntos ?? 0,
        escaneos_realizados: student.escaneos_realizados ?? 0,
      },
    }, 200, corsHeaders);
  } catch (error) {
    if (error instanceof Error && error.message === "Se requiere estudiante_id o alumno_id.") {
      return jsonResponse({ error: error.message }, 400, corsHeaders);
    }
    return errorResponse(error, corsHeaders);
  }
});
