#!/usr/bin/env node

import fs from "fs";
import { parse } from "dotenv";
import { createClient } from "@supabase/supabase-js";

const envPath = new URL("../.vercel/.env.audit.production.local", import.meta.url);
const env = parse(fs.readFileSync(envPath, "utf8"));

const supabaseUrl = env.VITE_SUPABASE_URL;
const anonKey = env.VITE_SUPABASE_ANON_KEY;
const serviceUrl = env.SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const saseBaseUrl = process.env.SASE_BASE_URL || "https://sase-310-system-ten.vercel.app";
const feriaApiUrl = process.env.FERIA_API_URL || "https://nueva-feria-de-ciencias-2026.vercel.app/api/session/teacher/sase";
const feriaLaunchBase = env.FERIA_APP_URL || "";
const email = process.env.SASE_PILOT_EMAIL;
const password = process.env.SASE_PILOT_PASSWORD;

if (!email || !password) {
  throw new Error("Set SASE_PILOT_EMAIL and SASE_PILOT_PASSWORD before running this verifier.");
}

if (!supabaseUrl || !anonKey) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in production env.");
}

const publicClient = createClient(supabaseUrl, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let allowlisted = "unknown";
if (serviceUrl && serviceKey) {
  const admin = createClient(serviceUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: moduleRow } = await admin
    .from("modulos_ecosistema")
    .select("id")
    .eq("key", "feria")
    .maybeSingle();
  if (moduleRow?.id) {
    const { data: accessRows } = await admin
      .from("modulos_ecosistema_usuarios")
      .select("email, is_active")
      .eq("module_id", moduleRow.id);
    allowlisted = accessRows?.some((row) => String(row.email || "").toLowerCase() === email.toLowerCase() && row.is_active)
      ? "yes"
      : "no";
  }
}

const loginResult = await publicClient.auth.signInWithPassword({ email, password });
if (loginResult.error || !loginResult.data.session?.access_token) {
  throw new Error(`Pilot login failed: ${loginResult.error?.message || "no session"}`);
}

const accessToken = loginResult.data.session.access_token;
const launchResponse = await fetch(`${saseBaseUrl}/api/modules/launch`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  },
  body: JSON.stringify({ module: "feria" }),
});
const launchBody = await launchResponse.json().catch(() => null);

let feriaExchangeStatus = null;
let feriaSessionRole = null;
let feriaSessionProvider = null;
let handoffTarget = null;

if (launchResponse.ok && launchBody?.url) {
  handoffTarget = launchBody.url;
  const url = new URL(launchBody.url);
  const token = url.searchParams.get("sase_token");
  const feriaResponse = await fetch(feriaApiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  const feriaBody = await feriaResponse.json().catch(() => null);
  feriaExchangeStatus = feriaResponse.status;
  feriaSessionRole = feriaBody?.role || null;
  feriaSessionProvider = feriaBody?.provider || null;
}

console.log(
  JSON.stringify(
    {
      pilot_email: email,
      feria_allowlisted: allowlisted,
      feria_app_url: feriaLaunchBase || null,
      launch_status: launchResponse.status,
      handoff_url: handoffTarget,
      feria_exchange_status: feriaExchangeStatus,
      feria_session_role: feriaSessionRole,
      feria_session_provider: feriaSessionProvider,
    },
    null,
    2,
  ),
);
