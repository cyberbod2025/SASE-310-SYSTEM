import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

type VercelRequest = any;
type VercelResponse = any;

const DIAGNOSTICO_MODULE = "diagnostico";
const ALLOWED_ROLES = new Set([
  "teacher",
  "docente",
  "docente_tutor",
  "maestro",
  "orientacion",
  "trabajo_social",
  "directivo",
  "subdireccion",
  "admin",
  "developer",
  "system_admin",
]);

function getSharedSecret() {
  const secret = process.env.SASE_SHARED_SECRET;
  if (!secret) throw new Error("Missing SASE_SHARED_SECRET");
  return secret;
}

function fromBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return Buffer.from(padded, "base64");
}

function toBase64Url(value: string | Buffer): string {
  const buffer = Buffer.isBuffer(value) ? value : Buffer.from(value, "utf8");
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function verifySignature(payloadBase64Url: string, signatureBase64Url: string) {
  const expected = toBase64Url(
    crypto.createHmac("sha256", getSharedSecret()).update(payloadBase64Url).digest(),
  );

  const actualBuffer = Buffer.from(signatureBase64Url);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}

function parseToken(token: string) {
  if (!token || !token.includes(".")) throw new Error("Token SASE invalido");

  const [payloadBase64Url, signatureBase64Url] = token.split(".");
  if (!payloadBase64Url || !signatureBase64Url || !verifySignature(payloadBase64Url, signatureBase64Url)) {
    throw new Error("Token SASE invalido");
  }

  const payload = JSON.parse(fromBase64Url(payloadBase64Url).toString("utf8"));
  if (!payload || payload.module !== DIAGNOSTICO_MODULE) throw new Error("Modulo SASE invalido");

  const role = String(payload.role || "").trim().toLowerCase();
  if (!ALLOWED_ROLES.has(role)) throw new Error("Rol SASE no autorizado");

  const exp = Number(payload.exp || 0);
  if (!exp || Date.now() >= exp * 1000) throw new Error("Token SASE expirado");

  return payload;
}

function mapNivelRiesgo(value: string | undefined): "bajo" | "medio" | "alto" | null {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  if (v === "bajo" || v === "crítico" || v === "deficiente" || v === "hostil" || v === "nula") return "bajo"; // Mapeo de legacy
  if (v === "medio" || v === "regular" || v === "tenso" || v === "parcialmente") return "medio";
  if (v === "alto" || v === "óptimo" || v === "sano" || v === "sí") return "alto";
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Metodo no permitido" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { token, payload: legacyPayload } = body;

    // 1. Validar Token
    const session = parseToken(token);
    const docenteId = session.sub || session.uid;

    if (!docenteId) throw new Error("ID de docente no encontrado en sesion");

    // 2. Mapear Payload Legacy a Tabla Canónica
    const canonicalData = {
      docente_id: docenteId,
      grupo: legacyPayload.grupoId || legacyPayload.grupo || "Sin grupo",
      nivel_riesgo: mapNivelRiesgo(legacyPayload.nivelRiesgo || legacyPayload.impacto),
      observaciones: legacyPayload.observaciones || legacyPayload.comentarios || "",
      fecha_diagnostico: legacyPayload.fecha || new Date().toISOString(),
      metodologia: legacyPayload.metodologia || "observacion_directa",
      clima_grupal: mapNivelRiesgo(legacyPayload.climaGrupal || (legacyPayload.ambiente && legacyPayload.ambiente.atencion)),
      participacion_padres: mapNivelRiesgo(legacyPayload.participacionPadres || (legacyPayload.ambiente && legacyPayload.ambiente.participacion)),
      incidencias_conducta: legacyPayload.incidenciasCount || 0,
      necesidades_apoyo: Array.isArray(legacyPayload.necesidades) ? legacyPayload.necesidades : [],
      fortalezas_detectadas: Array.isArray(legacyPayload.fortalezas) ? legacyPayload.fortalezas : [],
      plan_accion_breve: legacyPayload.planAccion || "",
      estado: "completado"
    };

    // 3. Insertar en Supabase (Service Role para bypass RLS y usar docente_id derivado)
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) throw new Error("Missing Supabase credentials");

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await supabase
      .from("diagnosticos_colectivos_docentes")
      .insert([canonicalData])
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error("[colectivo-submit] Error:", error.message);
    return res.status(error.message.includes("invalido") ? 401 : 500).json({ 
      message: error.message || "Error al procesar el diagnóstico" 
    });
  }
}
