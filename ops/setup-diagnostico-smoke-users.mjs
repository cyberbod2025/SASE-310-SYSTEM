import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const pilotEmail = process.env.SASE_PILOT_EMAIL || "docente.diagnostico.smoke@sase.mx";
const blockedEmail = process.env.SASE_BLOCKED_EMAIL || "secretaria.diagnostico.smoke@sase.mx";
const password = process.env.SASE_SMOKE_PASSWORD || "SmokePass123!";

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY para preparar usuarios smoke de Diagnóstico.");
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});

async function main() {
  await admin.from("perfiles_usuario").delete().in("email", [pilotEmail, blockedEmail]);
  await admin.from("profiles").delete().in("full_name", ["Docente Diagnóstico Smoke", "Secretaria Diagnóstico Smoke"]);

  await deleteUserByEmail(pilotEmail);
  await deleteUserByEmail(blockedEmail);

  const pilotUser = await createUser(pilotEmail, "Docente Diagnóstico Smoke");
  const blockedUser = await createUser(blockedEmail, "Secretaria Diagnóstico Smoke");

  await upsertInstitutionalProfiles(pilotUser.id, pilotEmail, "Docente Diagnóstico Smoke", "docente");
  await upsertInstitutionalProfiles(blockedUser.id, blockedEmail, "Secretaria Diagnóstico Smoke", "secretaria");

  console.log(
    JSON.stringify(
      {
        pilot: { email: pilotEmail, password, role: "docente" },
        blocked: { email: blockedEmail, password, role: "secretaria" },
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

async function upsertInstitutionalProfiles(userId, email, fullName, role) {
  const perfil = await admin.from("perfiles_usuario").upsert(
    {
      id: userId,
      matricula_sase: `SMOKE-${userId.slice(0, 8).toUpperCase()}`,
      rol: role,
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
      role,
    },
    { onConflict: "id" },
  );

  if (legacy.error) throw legacy.error;
}
