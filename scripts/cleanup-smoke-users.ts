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
  console.log("🧹 Iniciando limpieza de usuarios temporales...");

  const { data: { users }, error } = await admin.auth.admin.listUsers({
    perPage: 1000
  });

  if (error) throw error;

  const now = new Date().getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;
  let deletedCount = 0;

  for (const user of users) {
    const isTemporal = user.user_metadata?.temporal === true;
    const createdAt = new Date(user.created_at).getTime();
    const ageMs = now - createdAt;

    if (isTemporal && ageMs > oneDayMs) {
      console.log(`🗑️ Eliminando usuario temporal expirado: ${user.email} (Edad: ${Math.round(ageMs/3600000)}h)`);
      
      // Limpieza en cascada (aunque Supabase suele manejarla, aseguramos perfiles)
      await admin.from("modulos_ecosistema_usuarios").delete().eq("email", user.email);
      await admin.from("perfiles_usuario").delete().eq("id", user.id);
      await admin.from("profiles").delete().eq("id", user.id);
      
      const { error: delError } = await admin.auth.admin.deleteUser(user.id);
      if (delError) {
        console.error(`❌ Fallo al eliminar ${user.email}:`, delError.message);
      } else {
        deletedCount++;
      }
    }
  }

  console.log(`\n✨ Limpieza completada. Usuarios eliminados: ${deletedCount}`);
}

main().catch(err => {
  console.error("💥 Error en limpieza:", err);
  process.exit(1);
});
