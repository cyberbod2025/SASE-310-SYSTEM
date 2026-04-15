import { createClient } from "@supabase/supabase-js";

type VercelRequest = any;
type VercelResponse = any;

const WHATSAPP_ALLOWED_ROLES = new Set([
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
  admin: "directivo",
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

/**
 * SASE-310: WhatsApp Notification Service
 * Este endpoint maneja el envío de notificaciones críticas a padres y personal.
 * Implementado siguiendo los principios de seguridad y estabilidad institucional.
 */

function isAllowedOrigin(origin: string | undefined): boolean {
  const allowed = process.env.ALLOWED_ORIGINS;
  if (!allowed) return false;
  if (!origin) return false;
  return allowed
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean)
    .includes(origin);
}

function setCorsHeaders(res: VercelResponse, origin: string | undefined) {
  if (!origin) return;
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );
  res.setHeader("Access-Control-Max-Age", "86400");
}

function normalizeRole(role: unknown): string | null {
  if (typeof role !== "string") return null;
  const normalized = role.trim().toLowerCase();
  if (!normalized) return null;
  return ROLE_ALIASES[normalized] || normalized;
}

async function resolveInstitutionalRole(supabase: any, userId: string) {
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

  return normalizeRole(legacyProfile?.rol || legacyProfile?.role);
}

async function insertAuditEntry(
  supabase: any,
  params: {
    userId: string;
    email: string | null | undefined;
    role: string;
    to: string;
    studentName?: string;
    incidentType?: string;
    status: string;
  },
) {
  const { error } = await supabase.from("auditoria").insert({
    usuario_id: params.userId,
    email_usuario: params.email ?? null,
    rol_usuario: params.role,
    tipo_accion: "NOTIFICACION_WHATSAPP",
    descripcion_accion:
      `WhatsApp ${params.status} a ${params.to} para ${params.studentName || "alumno no especificado"} (${params.incidentType || "incidencia no especificada"}).`,
    tabla_objetivo: "incidencias",
  });

  if (error) {
    console.warn("[SASE-WHATSAPP] No se pudo registrar auditoría:", error.message);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!process.env.ALLOWED_ORIGINS) {
    res.status(500).json({ error: "CORS origins not configured" });
    return;
  }

  const origin = req.headers.origin;
  if (!isAllowedOrigin(origin)) {
    res.status(403).json({ error: "Forbidden origin" });
    return;
  }

  setCorsHeaders(res, origin);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  // Authentication Check (Only authenticated staff can trigger notifications)
  const authHeader = req.headers.authorization || (req.headers.Authorization as string | undefined);
  if (!authHeader || typeof authHeader !== "string") {
    res.status(401).json({ error: "No autorizado" });
    return;
  }

  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    res.status(500).json({ error: "Error de configuración del servidor" });
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: authData, error: authError } = await supabase.auth.getUser(token);

  if (authError || !authData?.user) {
    res.status(401).json({ error: "Sesión inválida" });
    return;
  }

  const requesterRole = await resolveInstitutionalRole(supabase, authData.user.id);
  if (!requesterRole || !WHATSAPP_ALLOWED_ROLES.has(requesterRole)) {
    res.status(403).json({ error: "Permisos institucionales insuficientes" });
    return;
  }

  // Payload Validation
  const { to, message, studentName, incidentType } = req.body ?? {};

  if (typeof to !== "string" || typeof message !== "string" || !to.trim() || !message.trim()) {
    res.status(400).json({ error: "Faltan datos obligatorios (destinatario o mensaje)" });
    return;
  }

  const cleanRecipient = to.trim();
  const cleanMessage = message.trim();

  /**
   * INTEGRACIÓN CON WHATSAPP BUSINESS API (META)
   * Aquí se realizaría la llamada real a la API de Meta o Twilio.
   * Por ahora, implementamos la lógica de registro y simulamos el envío.
   */
  
  const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
  const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_ID;

  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    // Modo Simulación / Loggeado si no hay llaves configuradas
    console.log(`[SASE-WHATSAPP] MOCK SEND to ${cleanRecipient}: ${cleanMessage}`);
    await insertAuditEntry(supabase, {
      userId: authData.user.id,
      email: authData.user.email,
      role: requesterRole,
      to: cleanRecipient,
      studentName,
      incidentType,
      status: "SIMULADO",
    });

    res.status(200).json({ 
      success: true, 
      status: "simulated",
      message: "Notificación procesada en modo simulación (Faltan variables de entorno)" 
    });
    return;
  }

  // Llamada Real a Meta API (Opcional si el usuario provee las llaves)
  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: cleanRecipient.replace(/\D/g, ""), // Limpiar formato a E.164 sin +
          type: "template",
          template: {
            name: "incidencia_critica", // Template pre-aprobado por Meta para SASE
            language: { code: "es_MX" },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: studentName || "el alumno" },
                  { type: "text", text: incidentType || "conducta" }
                ]
              }
            ]
          }
        }),
      }
    );

    const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || "Error en Meta API");
      }

      await insertAuditEntry(supabase, {
        userId: authData.user.id,
        email: authData.user.email,
        role: requesterRole,
        to: cleanRecipient,
        studentName,
        incidentType,
        status: "ENVIADO",
      });

      res.status(200).json({ success: true, meta_id: result.messages?.[0]?.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
