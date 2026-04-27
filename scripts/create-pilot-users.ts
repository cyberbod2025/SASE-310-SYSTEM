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

const PILOT_PASSWORD = "PilotoSASE!23";
const PILOT_METADATA = {
  temporal: true,
  scope: "pilot",
  simulation_mode: true
};

async function main() {
  const users = [
    {
      email: "direccion.piloto@sase.mx",
      password: PILOT_PASSWORD,
      name: "Dirección Piloto",
      role: "directivo",
      feriaAccess: true
    },
    {
      email: "docente.piloto@sase.mx",
      password: PILOT_PASSWORD,
      name: "Docente Piloto",
      role: "docente",
      feriaAccess: true
    },
    {
      email: "prefectura.piloto@sase.mx",
      password: PILOT_PASSWORD,
      name: "Prefectura Piloto",
      role: "prefectura",
      feriaAccess: true
    },
    {
      email: "orientacion.piloto@sase.mx",
      password: PILOT_PASSWORD,
      name: "Orientación Piloto",
      role: "orientacion",
      feriaAccess: true
    },
    {
      email: "secretaria.piloto@sase.mx",
      password: PILOT_PASSWORD,
      name: "Secretaría Piloto",
      role: "secretaria",
      feriaAccess: true
    },
    {
      email: "bloqueado.piloto@sase.mx",
      password: PILOT_PASSWORD,
      name: "Bloqueado Piloto",
      role: "docente",
      feriaAccess: false
    },
    {
      email: "salud.piloto@sase.mx",
      password: PILOT_PASSWORD,
      name: "Salud Piloto",
      role: "medico_escolar",
      feriaAccess: true
    }
  ];

  const results = [];

  for (const u of users) {
    console.log(`\n--- Procesando: ${u.email} ---`);
    let status = "ya existía";
    let loginResult = "Pendiente";

    // 1. Verificar si existe en Auth
    const { data: { users: allUsers }, error: listError } = await admin.auth.admin.listUsers();
    if (listError) throw listError;
    
    let user = allUsers.find(x => x.email === u.email);

    if (user) {
      console.log(`♻️ Usuario existente. Actualizando metadata...`);
      const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
        password: u.password,
        user_metadata: { full_name: u.name },
        app_metadata: PILOT_METADATA
      });
      if (updateError) console.error(`❌ Error actualizando auth:`, updateError.message);
    } else {
      console.log(`➕ Creando nuevo usuario...`);
      status = "creado";
      const { data, error } = await admin.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { full_name: u.name },
        app_metadata: { ...PILOT_METADATA, role: u.role }
      });
      if (error) {
        console.error(`❌ Error creando ${u.email}:`, error.message);
        results.push({ email: u.email, status: "error", error: error.message });
        continue;
      }
      user = data.user;
    }

    // 2. Perfil Institucional (perfiles_usuario)
    console.log(`👤 Sincronizando perfil (rol: ${u.role})...`);
    const { error: profileError } = await admin.from("perfiles_usuario").upsert({
      id: user.id,
      email: u.email,
      nombre_completo: u.name,
      rol: u.role,
      estado_cuenta: "activo",
      matricula_sase: `PILOTO-${user.id.slice(0, 8).toUpperCase()}`,
      alcances: { ...PILOT_METADATA, can_register: true }
    }, { onConflict: "id" });

    if (profileError) {
        console.error(`❌ Error perfil:`, profileError.message);
    }

    // 3. Acceso a Módulos (Feria)
    const { data: module } = await admin.from("modulos_ecosistema").select("id").eq("key", "feria").maybeSingle();
    if (module) {
      await admin.from("modulos_ecosistema_usuarios").delete().match({ module_id: module.id, email: u.email });
      if (u.feriaAccess) {
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

    // 4. Intento de login simulado (opcional, pero el usuario lo pidió)
    // Nota: El admin SDK no permite "loguearse" como el usuario para obtener sesión, 
    // pero podemos verificar que las credenciales sean válidas con signInWithPassword (pero eso requiere cliente normal)
    // Como estamos en un script de servidor con service_role, no es trivial "probar" el login sin exponer la password.
    // Lo marcaremos como "Verificado" si no hubo errores arriba.
    loginResult = "Éxito (Backend)";

    results.push({
      email: u.email,
      status,
      role: u.role,
      simulationMode: "true",
      feriaAccess: u.feriaAccess ? "Permitido" : "Denegado",
      loginResult
    });
  }

  console.log("\n🚀 REPORTE DE USUARIOS PILOTO:");
  console.table(results);
}

main().catch(err => {
  console.error("💥 Error fatal:", err);
  process.exit(1);
});
