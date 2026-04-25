#!/usr/bin/env node

import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { config as loadDotenv } from "dotenv";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

loadEnvFile(path.join(repoRoot, ".env.local"));
loadEnvFile(path.join(repoRoot, ".env"));

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  printHelp();
  process.exit(0);
}

const requiredRuntimeEnv = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SASE_SHARED_SECRET",
  "SASE_BASE_URL",
];

const optionalAuthEnv = [
  "SASE_PUBLISHABLE_KEY",
  "VITE_SUPABASE_ANON_KEY",
  "SASE_PILOT_EMAIL",
  "SASE_PILOT_PASSWORD",
  "SASE_BLOCKED_EMAIL",
  "SASE_BLOCKED_PASSWORD",
];

const runtimeSummary = Object.fromEntries(
  [...requiredRuntimeEnv, ...optionalAuthEnv].map((key) => [
    key,
    process.env[key] ? "present" : "missing",
  ]),
);

printSection("Entorno");
for (const [key, state] of Object.entries(runtimeSummary)) {
  console.log(`- ${key}: ${state}`);
}

const missingRuntimeEnv = requiredRuntimeEnv.filter((key) => !process.env[key]);
if (missingRuntimeEnv.length > 0) {
  fail(
    `Faltan variables obligatorias para el smoke real: ${missingRuntimeEnv.join(", ")}.`,
  );
}

const moduleKey = (process.env.SASE_MODULE || "feria").trim().toLowerCase();
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const sharedSecret = process.env.SASE_SHARED_SECRET;
const moduleAppUrl = resolveModuleAppUrl(moduleKey);
const saseBaseUrl = process.env.SASE_BASE_URL;
const expectedHash = process.env.SASE_EXPECTED_HASH ?? (moduleKey === "feria" ? "#/docente" : "");

const authKey =
  process.env.SASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || serviceRoleKey;

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const publicClient = createClient(supabaseUrl, authKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const results = {
  launchUrl: null,
  positiveStatus: null,
  negativeStatus: null,
};

async function main() {
  await verifyModuleReachability(moduleAppUrl);
  const moduleRecord = await verifyCatalogState(admin, moduleKey);
  await verifyPilotRules(admin, moduleRecord.id, moduleKey);
  await verifyRuntimeEndpoint(saseBaseUrl);

  const pilotToken = await resolveAccessToken(
    publicClient,
    process.env.SASE_PILOT_EMAIL,
    process.env.SASE_PILOT_PASSWORD,
    "piloto",
  );

  const blockedToken = await resolveAccessToken(
    publicClient,
    process.env.SASE_BLOCKED_EMAIL,
    process.env.SASE_BLOCKED_PASSWORD,
    "no_autorizado",
  );

  const positiveResponse = await launchModule(saseBaseUrl, pilotToken, moduleKey);
  results.positiveStatus = positiveResponse.status;
  if (positiveResponse.status !== 200) {
    fail(
      `El launcher no autorizo al piloto. HTTP ${positiveResponse.status}: ${stringifyJson(
        positiveResponse.body,
      )}`,
    );
  }

  if (!positiveResponse.body?.url) {
    fail("El launcher positivo no devolvio una URL de handoff.");
  }

  results.launchUrl = positiveResponse.body.url;
  console.log(`Launch URL: ${positiveResponse.body.url}`);

  const decoded = verifyLaunchUrl(positiveResponse.body.url, moduleAppUrl, sharedSecret, moduleKey, expectedHash);
  console.log(`Token payload: ${JSON.stringify(decoded.payload, null, 2)}`);

  const negativeResponse = await launchModule(saseBaseUrl, blockedToken, moduleKey);
  results.negativeStatus = negativeResponse.status;
  if (negativeResponse.status !== 403) {
    fail(
      `La prueba negativa no devolvio 403. HTTP ${negativeResponse.status}: ${stringifyJson(
        negativeResponse.body,
      )}`,
    );
  }

  const auditRows = await verifyAudit(admin, decoded.payload.sub, moduleKey);
  console.log(`Auditoria reciente: ${JSON.stringify(auditRows, null, 2)}`);

  printSection("Resultado");
  console.log(`Smoke OK: SASE runtime authorized the pilot, denied the blocked user and preserved the ${moduleKey} handoff URL.`);
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});

async function verifyModuleReachability(urlString) {
  printSection("Modulo destino");
  const target = new URL(urlString);
  target.hash = "";

  const response = await fetch(target, {
    method: "GET",
    redirect: "manual",
  }).catch((error) => {
    throw new Error(`La URL del modulo no es accesible: ${error.message}`);
  });

  console.log(`- Destino reachable: HTTP ${response.status} @ ${target.toString()}`);
}

async function verifyCatalogState(adminClient, currentModuleKey) {
  printSection("Catalogo");
  const { data, error } = await adminClient
    .from("modulos_ecosistema")
    .select("id, key, name, base_url, is_active")
    .eq("key", currentModuleKey)
    .maybeSingle();

  if (error || !data) {
    throw new Error(`No se encontro el modulo ${currentModuleKey} en catalogo: ${error?.message || "sin datos"}`);
  }

  if (!data.is_active) {
    throw new Error(`El modulo ${currentModuleKey} existe pero esta inactivo.`);
  }

  console.log(`- ${currentModuleKey} activo en catalogo: ${data.base_url}`);
  return data;
}

async function verifyPilotRules(adminClient, moduleId, currentModuleKey) {
  printSection("Accesos");
  const pilotEmail = normalizeEmail(process.env.SASE_PILOT_EMAIL);
  const blockedEmail = normalizeEmail(process.env.SASE_BLOCKED_EMAIL);

  const { data, error } = await adminClient
    .from("modulos_ecosistema_usuarios")
    .select("email, user_id, is_active")
    .eq("module_id", moduleId);

  if (error) {
    throw new Error(`No se pudieron leer reglas de acceso de feria: ${error.message}`);
  }

  const rows = data || [];
  console.log(`- Reglas por usuario cargadas: ${rows.length}`);

  if (currentModuleKey === "feria" && pilotEmail && !rows.some((row) => normalizeEmail(row.email) === pilotEmail && row.is_active)) {
    throw new Error(`El piloto ${pilotEmail} no aparece activo en modulos_ecosistema_usuarios.`);
  }

  if (pilotEmail) {
    console.log(`- Piloto autorizado confirmado: ${pilotEmail}`);
  }

  if (blockedEmail && rows.some((row) => normalizeEmail(row.email) === blockedEmail && row.is_active)) {
    throw new Error(`El usuario bloqueado ${blockedEmail} aparece autorizado en modulos_ecosistema_usuarios.`);
  }

  if (blockedEmail) {
    console.log(`- Usuario negativo confirmado fuera de allowlist: ${blockedEmail}`);
  }
}

async function verifyRuntimeEndpoint(baseUrl) {
  printSection("Runtime SASE");
  const response = await fetch(`${stripTrailingSlash(baseUrl)}/api/modules/launch`, {
    method: "OPTIONS",
  }).catch((error) => {
    throw new Error(`No se pudo alcanzar el runtime HTTP de SASE: ${error.message}`);
  });

  console.log(`- Runtime reachable: HTTP ${response.status} ${stripTrailingSlash(baseUrl)}/api/modules/launch`);
}

async function resolveAccessToken(client, email, password, label) {
  if (!email || !password) {
    throw new Error(
      `Faltan credenciales para la prueba ${label}. Define ${label === "piloto" ? "SASE_PILOT_EMAIL/SASE_PILOT_PASSWORD" : "SASE_BLOCKED_EMAIL/SASE_BLOCKED_PASSWORD"}.`,
    );
  }

  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.session?.access_token) {
    throw new Error(`No se pudo autenticar ${label} (${email}): ${error?.message || "sin sesion"}`);
  }

  console.log(`- Login ${label} OK: ${email}`);
  return data.session.access_token;
}

async function launchModule(baseUrl, accessToken, moduleKey) {
  const response = await fetch(`${stripTrailingSlash(baseUrl)}/api/modules/launch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ module: moduleKey }),
  });

  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  return {
    status: response.status,
    body,
  };
}

function verifyLaunchUrl(launchUrl, expectedModuleUrl, secret, expectedModuleKey, expectedHash) {
  const hashIndex = launchUrl.indexOf("#");
  const hash = hashIndex >= 0 ? launchUrl.slice(hashIndex) : "";
  if ((expectedHash || "") !== hash) {
    throw new Error(`El hash final no coincide. Esperado: ${expectedHash || "(vacio)"} | Recibido: ${hash || "(vacio)"}`);
  }

  if (!launchUrl.includes("?sase_token=")) {
    throw new Error("La URL final no incluye ?sase_token=...");
  }

  const url = new URL(hashIndex >= 0 ? launchUrl.slice(0, hashIndex) : launchUrl);
  const expectedBase = new URL(expectedModuleUrl.split("#")[0]);
  if (url.origin !== expectedBase.origin || url.pathname !== expectedBase.pathname) {
    throw new Error(
      `La URL de handoff apunta a un destino distinto del modulo. Recibido: ${url.toString()} | Esperado: ${expectedBase.toString()}`,
    );
  }

  const token = url.searchParams.get("sase_token");
  if (!token) {
    throw new Error("No se encontro el parametro sase_token en la URL final.");
  }

  const [payloadBase64Url, signatureBase64Url] = token.split(".");
  if (!payloadBase64Url || !signatureBase64Url) {
    throw new Error("El token no tiene el formato payload.signature esperado.");
  }

  if (!/^[A-Za-z0-9_-]+$/.test(signatureBase64Url)) {
    throw new Error("La firma no esta codificada en base64url.");
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payloadBase64Url)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  if (!timingSafeEqual(signatureBase64Url, expectedSignature)) {
    throw new Error("La firma del token no coincide con SASE_SHARED_SECRET.");
  }

  const payload = JSON.parse(fromBase64Url(payloadBase64Url).toString("utf8"));
  if (!payload.sub) throw new Error("El payload no incluye sub.");
  if (!payload.uid) throw new Error("El payload no incluye uid temporal.");
  if (payload.module !== expectedModuleKey) throw new Error(`El payload module es invalido: ${payload.module}`);
  if (typeof payload.iat !== "number" || typeof payload.exp !== "number") {
    throw new Error("El payload no incluye iat/exp numericos.");
  }
  if (payload.exp - payload.iat > 300) {
    throw new Error(`El token excede 5 minutos de vigencia (${payload.exp - payload.iat}s).`);
  }

  return { payload, token };
}

async function verifyAudit(adminClient, pilotUserId, currentModuleKey) {
  printSection("Auditoria");
  const { data, error } = await adminClient
    .from("auditoria")
    .select("tipo_accion, descripcion_accion, usuario_id, fecha, id_registro_objetivo")
    .eq("tabla_objetivo", "modulos_ecosistema")
    .eq("id_registro_objetivo", currentModuleKey)
    .order("fecha", { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(`No se pudo leer auditoria de lanzamiento: ${error.message}`);
  }

  const rows = data || [];
  const hasOk = rows.some((row) => row.tipo_accion === "MODULO_LAUNCH_OK" && row.usuario_id === pilotUserId);
  const hasDenied = rows.some((row) => row.tipo_accion === "MODULO_LAUNCH_DENIED");

  if (!hasOk) {
    throw new Error("No se encontro auditoria MODULO_LAUNCH_OK para el piloto.");
  }

  if (!hasDenied) {
    throw new Error("No se encontro auditoria MODULO_LAUNCH_DENIED para la prueba negativa.");
  }

  console.log("- Auditoria OK y DENIED encontrada.");
  return rows;
}

function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : null;
}

function fromBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(`${normalized}${padding}`, "base64");
}

function timingSafeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function stripTrailingSlash(value) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function resolveModuleAppUrl(currentModuleKey) {
  if (process.env.SASE_MODULE_URL) {
    return process.env.SASE_MODULE_URL;
  }

  const envMap = {
    feria: process.env.FERIA_APP_URL,
    diagnostico: process.env.DIAGNOSTICO_APP_URL,
    mate: process.env.MATE_APP_URL,
  };

  const url = envMap[currentModuleKey];
  if (!url) {
    throw new Error(`Falta la URL del modulo ${currentModuleKey}. Configura SASE_MODULE_URL o la variable especifica del modulo.`);
  }

  return url;
}

function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    loadDotenv({ path: filePath, override: false });
  }
}

function printSection(title) {
  console.log(`\n== ${title} ==`);
}

function stringifyJson(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function fail(message) {
  console.error(`\nSmoke FAIL: ${message}`);
  process.exit(1);
}

function printHelp() {
  console.log(`Uso:

  export SASE_BASE_URL="https://sase.midominio.com"
  export FERIA_APP_URL="https://feria.midominio.com/#/docente"
  export DIAGNOSTICO_APP_URL="https://diagnostico.midominio.com/"
  export MATE_APP_URL="https://mate.midominio.com/"
  export SUPABASE_URL="https://proyecto.supabase.co"
  export SUPABASE_SERVICE_ROLE_KEY="..."
  export SASE_SHARED_SECRET="..."
  export SASE_PUBLISHABLE_KEY="..."    # opcional, usa VITE_SUPABASE_ANON_KEY o service role como fallback
  export SASE_MODULE="feria"           # opcional: feria | diagnostico | mate
  export SASE_EXPECTED_HASH="#/docente" # opcional, por defecto solo feria usa hash
  export SASE_PILOT_EMAIL="docente.piloto@sase.mx"
  export SASE_PILOT_PASSWORD="..."
  export SASE_BLOCKED_EMAIL="usuario.no.autorizado@sase.mx"
  export SASE_BLOCKED_PASSWORD="..."

  node ops/smoke-sase-launch.js

Este smoke valida:
- variables de runtime de SASE
- accesibilidad HTTP del modulo y del launcher real
- modulo activo en catalogo
- piloto presente en reglas de acceso si aplica
- handoff con ?sase_token=...#/docente
- payload con sub y uid
- firma base64url valida
- MODULO_LAUNCH_OK y MODULO_LAUNCH_DENIED en auditoria
`);
}
