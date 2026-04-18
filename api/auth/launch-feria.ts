import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

type VercelRequest = any;
type VercelResponse = any;

const FERIA_URL = process.env.FERIA_APP_URL;
const SASE_SHARED_SECRET = process.env.SASE_SHARED_SECRET;

const PILOT_EMAILS = [
  "docente@sase.mx",
  "maestro.piloto@gmail.com",
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  
  if (!FERIA_URL || !SASE_SHARED_SECRET) {
    console.error("CRITICAL: FERIA_APP_URL or SASE_SHARED_SECRET missing in environment variables.");
    return res.status(500).json({ error: "Servidor no configurado para el lanzamiento de Feria." });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No authorization header" });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: "Invalid token" });
  }

  const userEmail = user.email || "";
  const isPilot = PILOT_EMAILS.includes(userEmail);

  if (!isPilot) {
    return res.status(403).json({ error: "El acceso a la Feria de Ciencias está restringido a docentes autorizados en esta fase." });
  }

  // Generate SASE Handoff Token (HMAC-SHA256)
  const payload = {
    userId: user.id,
    email: userEmail,
    role: "teacher",
    issuedAt: Date.now(),
    expiresAt: Date.now() + 1000 * 60 * 5, // 5 minutes validity
    displayName: user.user_metadata?.full_name || "Docente SASE"
  };

  const payloadStr = JSON.stringify(payload);
  const signature = crypto
    .createHmac("sha256", SASE_SHARED_SECRET)
    .update(payloadStr)
    .digest("hex");

  const saseToken = Buffer.from(JSON.stringify({ payload, signature })).toString("base64");
  const launchUrl = `${FERIA_URL}/?sase_token=${saseToken}`;

  return res.status(200).json({ url: launchUrl });
}
