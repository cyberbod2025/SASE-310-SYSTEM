import crypto from "crypto";

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

function setCorsHeaders(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin;
  const allowed = process.env.ALLOWED_ORIGINS;

  if (origin && allowed?.split(",").map((item) => item.trim()).includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function getSharedSecret() {
  const secret = process.env.SASE_SHARED_SECRET;
  if (!secret) throw new Error("Missing SASE_SHARED_SECRET");
  return secret;
}

function toBase64Url(value: string | Buffer): string {
  const buffer = Buffer.isBuffer(value) ? value : Buffer.from(value, "utf8");
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return Buffer.from(padded, "base64");
}

function parseBody(req: VercelRequest): Record<string, unknown> {
  if (typeof req.body === "string") {
    return JSON.parse(req.body || "{}");
  }

  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  return {};
}

function verifySignature(payloadBase64Url: string, signatureBase64Url: string) {
  const expected = toBase64Url(
    crypto.createHmac("sha256", getSharedSecret()).update(payloadBase64Url).digest(),
  );

  const actualBuffer = Buffer.from(signatureBase64Url);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}

function parseToken(token: unknown) {
  if (typeof token !== "string" || !token.includes(".")) {
    throw new Error("Token SASE invalido");
  }

  const [payloadBase64Url, signatureBase64Url] = token.split(".");
  if (!payloadBase64Url || !signatureBase64Url || !verifySignature(payloadBase64Url, signatureBase64Url)) {
    throw new Error("Token SASE invalido");
  }

  const payload = JSON.parse(fromBase64Url(payloadBase64Url).toString("utf8"));
  if (!payload || payload.module !== DIAGNOSTICO_MODULE) {
    throw new Error("Modulo SASE invalido");
  }

  const role = String(payload.role || "").trim().toLowerCase();
  if (!ALLOWED_ROLES.has(role)) {
    throw new Error("Rol SASE no autorizado");
  }

  const exp = Number(payload.exp || 0);
  if (!exp || Date.now() >= exp * 1000) {
    throw new Error("Token SASE expirado");
  }

  return { payload, role };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Metodo no permitido" });
  }

  try {
    const { token } = parseBody(req);
    const { payload, role } = parseToken(token);

    return res.status(200).json({
      provider: "sase",
      role,
      userId: String(payload.sub || payload.uid || ""),
      displayName: String(payload.name || payload.email || "Personal SASE"),
      email: String(payload.email || ""),
      institutionId: String(payload.institutionId || ""),
      groupId: String(payload.groupId || ""),
      issuedAt: Number(payload.iat || 0) * 1000,
      expiresAt: Number(payload.exp || 0) * 1000,
    });
  } catch (error: any) {
    const message = error?.message || "No se pudo validar el acceso desde SASE";
    const status = message.includes("Missing SASE_SHARED_SECRET") ? 500 : 401;
    return res.status(status).json({ message });
  }
}
