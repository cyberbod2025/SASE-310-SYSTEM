import { createClient } from "@supabase/supabase-js";
import { config as loadDotenv } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

loadDotenv({ path: path.join(repoRoot, ".env.local") });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const users = [
  { email: "docente.feria.smoke@sase.mx", name: "Docente Feria Smoke" },
  { email: "bloqueado.feria.smoke@sase.mx", name: "Bloqueado Feria Smoke" }
];
const password = "SmokePass123!";

async function run() {
  console.log("Verificando usuarios en:", supabaseUrl);
  
  for (const u of users) {
    let user = null;
    
    if (!user) {
      console.log(`Intentando crear usuario ${u.email}...`);
      const { data, error } = await admin.auth.admin.createUser({
        email: u.email,
        password,
        email_confirm: true,
        user_metadata: { full_name: u.name }
      });
      
      if (error) {
        if (error.message.includes("already been registered")) {
            console.log(`Usuario ${u.email} ya existe (detectado por error de creación). Buscando ID...`);
            const { data: { users: allUsers } } = await admin.auth.admin.listUsers({ perPage: 1000 });
            user = allUsers.find(x => x.email === u.email);
        } else {
            console.error(`Error creando ${u.email}:`, error.message);
            continue;
        }
      } else {
        user = data.user;
      }
    }

    if (user) {
      console.log(`Reseteando password para ${u.email} (${user.id})...`);
      const { error } = await admin.auth.admin.updateUserById(user.id, { password });
      if (error) console.error(`Error reseteando ${u.email}:`, error.message);
    }

    // Asegurar perfil institucional
    console.log(`Asegurando perfil para ${u.email}...`);
    const { error: profileError } = await admin.from("perfiles_usuario").upsert({
      id: user.id,
      email: u.email,
      nombre_completo: u.name,
      rol: "docente",
      estado_cuenta: "activo",
      matricula_sase: `SMOKE-${user.id.slice(0, 8).toUpperCase()}`,
      alcances: { can_register: true },
      permisos: { can_register: true }
    }, { onConflict: "id" });
    if (profileError) console.error(`Error perfil ${u.email}:`, profileError.message);

    // Asegurar acceso al modulo feria
    const { data: module } = await admin.from("modulos_ecosistema").select("id").eq("key", "feria").maybeSingle();
    if (module) {
        console.log(`Asegurando acceso al modulo feria para ${u.email}...`);
        // Primero borrar por si acaso para simular el upsert si no hay constraint unica accesible
        await admin.from("modulos_ecosistema_usuarios").delete().match({ module_id: module.id, email: u.email });
        const { error: accError } = await admin.from("modulos_ecosistema_usuarios").insert({
            module_id: module.id,
            email: u.email,
            is_active: u.email.includes("docente")
        });
        if (accError) console.error(`Error acceso ${u.email}:`, accError.message);
    }
  }
  console.log("Proceso completado.");
}

run().catch(console.error);
