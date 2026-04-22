import { createClient } from "@supabase/supabase-js";
import { config as loadDotenv } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

loadDotenv({ path: path.join(repoRoot, ".env.local"), override: false });
loadDotenv({ path: path.join(repoRoot, ".env"), override: false });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const pilotEmail = process.env.SASE_PILOT_EMAIL || "docente.feria.smoke@sase.mx";
const blockedEmail = process.env.SASE_BLOCKED_EMAIL || "bloqueado.feria.smoke@sase.mx";
const password = process.env.SASE_SMOKE_PASSWORD || "SmokePass123!";

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY para preparar usuarios smoke.");
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});

async function main() {
  await admin.from("modulos_ecosistema_usuarios").delete().in("email", [pilotEmail, blockedEmail]);
  await admin.from("perfiles_usuario").delete().in("email", [pilotEmail, blockedEmail]);
  await admin.from("profiles").delete().in("full_name", ["Docente Feria Smoke", "Bloqueado Feria Smoke"]);

  await deleteUserByEmail(pilotEmail);
  await deleteUserByEmail(blockedEmail);

  const pilotUser = await createUser(pilotEmail, "Docente Feria Smoke");
  const blockedUser = await createUser(blockedEmail, "Bloqueado Feria Smoke");

  await upsertInstitutionalProfiles(pilotUser.id, pilotEmail, "Docente Feria Smoke");
  await upsertInstitutionalProfiles(blockedUser.id, blockedEmail, "Bloqueado Feria Smoke");

  const { data: feriaModule, error: moduleError } = await admin
    .from("modulos_ecosistema")
    .select("id")
    .eq("key", "feria")
    .maybeSingle();

  if (moduleError || !feriaModule) {
    throw moduleError || new Error("No se encontro el modulo feria en la base hospedada.");
  }

  const { error: accessError } = await admin.from("modulos_ecosistema_usuarios").insert({
    module_id: feriaModule.id,
    email: pilotEmail,
    is_active: true,
  });

  if (accessError) {
    throw accessError;
  }

  console.log(
    JSON.stringify(
      {
        pilot: { email: pilotEmail, password },
        blocked: { email: blockedEmail, password },
      },
      null,
      2,
    ),
  );
}

async function deleteUserByEmail(email) {
  const { data, error } = await admin.auth.admin.listUsers();
  if (error) throw error;

  const existing = data.users.find((user) => user.email === email);
  if (!existing) return;

  const { error: deleteError } = await admin.auth.admin.deleteUser(existing.id);
  if (deleteError) throw deleteError;
}

async function createUser(email, fullName) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (error || !data.user) {
    throw error || new Error(`No se pudo crear ${email}`);
  }

  return data.user;
}

async function upsertInstitutionalProfiles(userId, email, fullName) {
  const perfil = await admin.from("perfiles_usuario").upsert(
    {
      id: userId,
      matricula_sase: `SMOKE-${userId.slice(0, 8).toUpperCase()}`,
      rol: "docente",
      nombre_completo: fullName,
      email,
      estado_cuenta: "activo",
      alcances: { can_register: true },
      permisos: { can_register: true },
      grupos: ["2A"],
      grupo_tutor: "2A",
    },
    { onConflict: "id" },
  );

  if (perfil.error) throw perfil.error;

  const legacy = await admin.from("profiles").upsert(
    {
      id: userId,
      full_name: fullName,
      role: "docente",
    },
    { onConflict: "id" },
  );

  if (legacy.error) throw legacy.error;
}
