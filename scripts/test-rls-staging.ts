import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const TEST_EMAIL = process.env.TEST_DOCENTE_EMAIL || "docente.smoke@sase.mx";
const TEST_PASSWORD = process.env.TEST_DOCENTE_PASSWORD || "CambiaEstaClave123!";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase credentials in .env.local");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function signIn() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });
  if (error) throw new Error(`Auth failed: ${error.message}`);
  console.log(`✅ Autenticado como: ${data.user.email} (${data.user.id})`);
  return data.user.id;
}

interface TestCase {
  name: string;
  table: string;
  payload: Record<string, unknown>;
  expectBlocked: boolean;
}

async function runTest(tc: TestCase, userId: string) {
  const { data, error } = await supabase
    .from(tc.table)
    .update(tc.payload)
    .eq("id", userId)
    .select();

  const blocked = !!error || !data || data.length === 0;
  const pass = blocked === tc.expectBlocked;
  const icon = pass ? "✅" : "❌";
  const status = tc.expectBlocked ? "BLOQUEADO" : "PERMITIDO";

  console.log(`${icon} ${tc.name}: ${status}`);
  if (error) console.log(`   Error: ${error.message} (code: ${error.code})`);
  if (!pass) {
    console.error(`   ⚠️  FALLA DE SEGURIDAD: esperaba ${status} pero no fue así`);
  }
  return pass;
}

async function main() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  RLS Self-Escalation Prevention Test Suite");
  console.log("═══════════════════════════════════════════════════\n");

  const userId = await signIn();

  // Campos que DEBEN ser bloqueados en perfiles_usuario
  const blockedFields: TestCase[] = [
    { name: "rol → admin", table: "perfiles_usuario", payload: { rol: "admin" }, expectBlocked: true },
    { name: "permisos → all:true", table: "perfiles_usuario", payload: { permisos: { all: true } }, expectBlocked: true },
    { name: "alcances → global:true", table: "perfiles_usuario", payload: { alcances: { global: true } }, expectBlocked: true },
    { name: "matricula_sase", table: "perfiles_usuario", payload: { matricula_sase: "HACK-001" }, expectBlocked: true },
    { name: "email", table: "perfiles_usuario", payload: { email: "hacked@evil.com" }, expectBlocked: true },
    { name: "role (legacy)", table: "perfiles_usuario", payload: { role: "directivo" }, expectBlocked: true },
    { name: "seguridad_status", table: "perfiles_usuario", payload: { seguridad_status: "restricted" }, expectBlocked: true },
    { name: "blocked_until → 2099", table: "perfiles_usuario", payload: { blocked_until: "2099-01-01T00:00:00.000Z" }, expectBlocked: true },
    { name: "grupo_tutor", table: "perfiles_usuario", payload: { grupo_tutor: "admin-group" }, expectBlocked: true },
    { name: "grupos", table: "perfiles_usuario", payload: { grupos: ["all-access"] }, expectBlocked: true },
    { name: "estado_cuenta", table: "perfiles_usuario", payload: { estado_cuenta: "suspendido" }, expectBlocked: true },
    { name: "risk_score", table: "perfiles_usuario", payload: { risk_score: 100 }, expectBlocked: true },
  ];

  const allowedFields: TestCase[] = [
    { name: "nombre_completo", table: "perfiles_usuario", payload: { nombre_completo: "QA Test User Updated" }, expectBlocked: false },
    { name: "telefono", table: "perfiles_usuario", payload: { telefono: "+52 555 000 0000" }, expectBlocked: false },
    { name: "preferencias_dashboard", table: "perfiles_usuario", payload: { preferencias_dashboard: { theme: "dark" } }, expectBlocked: false },
  ];

  console.log("\n── Campos BLOQUEADOS (perfiles_usuario) ──\n");
  let allPass = true;
  for (const tc of blockedFields) {
    const pass = await runTest(tc, userId);
    if (!pass) allPass = false;
  }

  console.log("\n── Campos PERMITIDOS ──\n");
  for (const tc of allowedFields) {
    const pass = await runTest(tc, userId);
    if (!pass) allPass = false;
  }

  console.log("\n═══════════════════════════════════════════════════");
  console.log(allPass ? "✅ TODAS LAS PRUEBAS PASARON" : "❌ HAY FALLAS DE SEGURIDAD");
  console.log("═══════════════════════════════════════════════════\n");

  await supabase.auth.signOut();
  process.exit(allPass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
