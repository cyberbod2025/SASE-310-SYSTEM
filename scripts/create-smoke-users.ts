import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Faltan variables de entorno de Supabase.");
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const users = [
    {
      email: process.env.TEST_DOCENTE_EMAIL,
      password: process.env.TEST_DOCENTE_PASSWORD,
      name: "Docente Smoke (Temporal)",
      hasAccess: true,
    },
    {
      email: process.env.TEST_BLOQUEADO_EMAIL,
      password: process.env.TEST_BLOQUEADO_PASSWORD,
      name: "Bloqueado Smoke (Temporal)",
      hasAccess: false,
    }
  ];

  for (const u of users) {
    if (!u.email || !u.password) {
      console.warn(`⚠️ Saltando usuario incompleto: ${u.email}`);
      continue;
    }

    console.log(`\n--- Procesando: ${u.email} ---`);

    // 1. Verificar si existe
    const { data: { users: allUsers }, error: listError } = await admin.auth.admin.listUsers();
    if (listError) throw listError;
    
    let user = allUsers.find(x => x.email === u.email);

    if (user) {
      console.log(`♻️ Usuario existente. Actualizando...`);
      await admin.auth.admin.updateUserById(user.id, {
        password: u.password,
        user_metadata: { full_name: u.name, temporal: true, scope: "smoke_test" }
      });
    } else {
      console.log(`➕ Creando nuevo usuario...`);
      const { data, error } = await admin.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { full_name: u.name, temporal: true, scope: "smoke_test" }
      });
      if (error) {
        console.error(`❌ Error creando ${u.email}:`, error.message);
        continue;
      }
      user = data.user;
    }

    // 2. Perfil Institucional
    const { error: profileError } = await admin.from("perfiles_usuario").upsert({
      id: user.id,
      email: u.email,
      nombre_completo: u.name,
      rol: "docente",
      estado_cuenta: "activo",
      matricula_sase: `SMOKE-${user.id.slice(0, 8).toUpperCase()}`,
      alcances: { can_register: true, temporal: true }
    }, { onConflict: "id" });

    if (profileError) console.error(`❌ Error perfil:`, profileError.message);

    // 3. Acceso a Módulos (Feria)
    const { data: module } = await admin.from("modulos_ecosistema").select("id").eq("key", "feria").maybeSingle();
    if (module) {
      await admin.from("modulos_ecosistema_usuarios").delete().match({ module_id: module.id, email: u.email });
      if (u.hasAccess) {
        console.log(`✅ Concediendo acceso a Feria`);
        await admin.from("modulos_ecosistema_usuarios").insert({
          module_id: module.id,
          email: u.email,
          is_active: true
        });
      } else {
        console.log(`🚫 Denegando acceso a Feria`);
      }
    }
  }

  console.log("\n🚀 Usuarios de prueba preparados.");
}

main().catch(err => {
  console.error("💥 Error fatal:", err);
  process.exit(1);
});
