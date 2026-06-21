import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Faltan variables de entorno");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function main() {
  const testEmail = process.env.TEST_DEBUG_UI_EMAIL || "debug.ui.insert@sase.mx";
  const testPassword = process.env.TEST_DEBUG_UI_PASSWORD || (() => { throw new Error("Falta TEST_DEBUG_UI_PASSWORD en .env.local"); })();

  // 1. Clean up
  const { data: users } = await supabaseAdmin.auth.admin.listUsers();
  const existingUser = users?.users.find((u) => u.email === testEmail);
  if (existingUser) {
    await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
  }

  // 2. Create user
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    console.error("Error creando user:", authError);
    return;
  }
  const userId = authData.user.id;

  // 3. Set profile
  await supabaseAdmin.from("perfiles_usuario").upsert({
    id: userId,
    email: testEmail,
    nombre_completo: "Debug Docente UI",
    rol: "docente",
    seguridad_status: "active",
  });

  // 4. Log in as user
  const supabaseUser = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY!);
  const { error: signInError } = await supabaseUser.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (signInError) {
    console.error("Error login:", signInError);
    return;
  }

  console.log("Login exitoso. Intentando insertar evento (como UI)...");

  const { data, error } = await supabaseUser.from("eventos").insert([{
    titulo: "Reunión de Plantilla",
    tipo: "reunion",
    fecha: "2026-10-10",
    creado_por: userId
  }]);

  if (error) {
    console.error("\n❌ ERROR AL INSERTAR EVENTO:", error);
  } else {
    console.log("✅ Insert EVENTO exitoso", data);
  }

  console.log("\nIntentando insertar incidencia (como UI)...");
  // using correct enum according to DB
  const { error: incError } = await supabaseUser.from("incidencias").insert([{
    alumno_id: "edf53be2-535a-4cab-8057-aaee7b8ace4f", // Real student from fetch
    reportado_por: userId,
    descripcion: "Prueba UI insert",
    tipo: "Retardo"
  }]);

  if (incError) {
    console.error("❌ ERROR AL INSERTAR INCIDENCIA:", incError);
  } else {
    console.log("✅ Insert INCIDENCIA exitoso");
  }

  // Clean up
  await supabaseAdmin.auth.admin.deleteUser(userId);
}

main();
