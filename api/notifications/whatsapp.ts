import { createClient } from "@supabase/supabase-js";

type VercelRequest = any;
type VercelResponse = any;

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin;
  
  // CORS Check
  if (isAllowedOrigin(origin)) {
    setCorsHeaders(res, origin);
  }

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
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    res.status(500).json({ error: "Error de configuración del servidor" });
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data: authData, error: authError } = await supabase.auth.getUser(token);

  if (authError || !authData?.user) {
    res.status(401).json({ error: "Sesión inválida" });
    return;
  }

  // Payload Validation
  const { to, message, studentName, incidentType } = req.body ?? {};

  if (!to || !message) {
    res.status(400).json({ error: "Faltan datos obligatorios (destinatario o mensaje)" });
    return;
  }

  /**
   * INTEGRACIÓN CON WHATSAPP BUSINESS API (META)
   * Aquí se realizaría la llamada real a la API de Meta o Twilio.
   * Por ahora, implementamos la lógica de registro y simulamos el envío.
   */
  
  const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
  const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_ID;

  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    // Modo Simulación / Loggeado si no hay llaves configuradas
    console.log(`[SASE-WHATSAPP] MOCK SEND to ${to}: ${message}`);
    
    // Registrar en auditoría de la DB
    await supabase.from("auditoria").insert({
      usuario_id: authData.user.id,
      email_usuario: authData.user.email,
      descripcion_accion: `Notificación WhatsApp enviada a ${to} (Simulado) - Alumno: ${studentName}`,
      tabla_objetivo: "incidencias",
      creado_en: new Date().toISOString()
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
          to: to.replace(/\D/g, ""), // Limpiar formato a E.164 sin +
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

    res.status(200).json({ success: true, meta_id: result.messages?.[0]?.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
