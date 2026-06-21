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
  const testEmail = "debug.inserts@sase.mx";
  const testPassword = "DebugPassword123!";

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
    nombre_completo: "Debug Docente",
    rol: "docente",
    seguridad_status: "active",
  });

  // 4. Log in as user
  const supabaseUser = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY);
  const { data: signInData, error: signInError } = await supabaseUser.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (signInError) {
    console.error("Error login:", signInError);
    return;
  }

  console.log("Login exitoso. Intentando insertar incidencia...");

  // 5. Try insert incidencia
  const { data, error } = await supabaseUser.from("incidencias").insert([{
    alumno_id: "00000000-0000-0000-0000-000000000000",
    reportado_por: userId,
    descripcion: "Prueba debug",
    tipo: "conducta",
    estado: "Abierta"
  }]);

  if (error) {
    console.error("\n❌ ERROR AL INSERTAR INCIDENCIA:");
    console.error(JSON.stringify(error, null, 2));
  } else {
    console.log("✅ Insert exitoso", data);
  }

  // Try select
  const { error: selError } = await supabaseUser.from("incidencias").select("*").limit(1);
  if (selError) {
    console.error("\n❌ ERROR AL LEER INCIDENCIA:", selError);
  } else {
    console.log("✅ Lectura exitosa");
  }

  // Try insert evento (agenda)
  console.log("\nIntentando insertar evento (agenda)...");
  const { error: evError } = await supabaseUser.from("eventos").insert([{
    titulo: "Prueba agenda",
    tipo: "Reunión",
    fecha: "2026-10-10",
    creado_por: userId
  }]);

  if (evError) {
    console.error("❌ ERROR AL INSERTAR EVENTO:");
    console.error(JSON.stringify(evError, null, 2));
  } else {
    console.log("✅ Insert EVENTO exitoso");
  }

  // Clean up
  await supabaseAdmin.auth.admin.deleteUser(userId);
}

main();
