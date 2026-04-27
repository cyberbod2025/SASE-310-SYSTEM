import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const users = [
    { email: "docente.smoke@sase.mx", password: "SmokePass123!", name: "Docente Smoke", hasAccess: true },
    { email: "bloqueado.smoke@sase.mx", password: "SmokePass123!", name: "Bloqueado Smoke", hasAccess: false },
    { email: "new.smoke@sase.mx", password: "password123", name: "New Smoke", hasAccess: true }
  ];

  for (const u of users) {
    console.log(`\n--- Procesando: ${u.email} ---`);
    
    const { data: { users: allUsers } } = await admin.auth.admin.listUsers();
    let user = allUsers.find(x => x.email === u.email);

    if (user) {
      console.log(`♻️ Usuario existente. Actualizando...`);
      await admin.auth.admin.updateUserById(user.id, {
        password: u.password,
        user_metadata: { full_name: u.name }
      });
    } else {
      console.log(`➕ Creando nuevo usuario...`);
      const { data, error } = await admin.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { full_name: u.name }
      });
      if (error) {
        console.error(`❌ Error creando ${u.email}:`, error.message);
        continue;
      }
      user = data.user;
    }

    // Perfil
    await admin.from("perfiles_usuario").upsert({
      id: user.id,
      email: u.email,
      nombre_completo: u.name,
      rol: "docente",
      estado_cuenta: "activo",
      matricula_sase: `SMOKE-${user.id.slice(0, 8).toUpperCase()}`,
      alcances: { can_register: true, temporal: true }
    }, { onConflict: "id" });

    // Módulos
    const { data: module } = await admin.from("modulos_ecosistema").select("id").eq("key", "feria").maybeSingle();
    if (module) {
      await admin.from("modulos_ecosistema_usuarios").delete().match({ module_id: module.id, email: u.email });
      if (u.hasAccess) {
        await admin.from("modulos_ecosistema_usuarios").insert({
          module_id: module.id,
          email: u.email,
          is_active: true
        });
      }
    }
  }

  console.log("\n🚀 Usuarios de prueba preparados.");
}

main().catch(err => {
  console.error("💥 Error fatal:", err);
  process.exit(1);
});
