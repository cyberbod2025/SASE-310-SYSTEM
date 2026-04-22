import { createClient } from "@supabase/supabase-js";

const apiUrl = process.env.API_URL;
const secretKey = process.env.SECRET_KEY;

if (!apiUrl || !secretKey) {
  throw new Error("Faltan API_URL o SECRET_KEY en el entorno.");
}

const client = createClient(apiUrl, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const email = "docente.testsprite@sase.mx";
const password = "DocenteTest123!";

const list = await client.auth.admin.listUsers();
const existing = list.data?.users?.find((user) => user.email === email);
if (existing) {
  const deleted = await client.auth.admin.deleteUser(existing.id);
  if (deleted.error) throw deleted.error;
}

const created = await client.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { full_name: "Docente TestSprite" },
});

if (created.error || !created.data.user) {
  throw created.error || new Error("No se pudo crear el usuario docente.testsprite@sase.mx");
}

const userId = created.data.user.id;

const perfil = await client.from("perfiles_usuario").upsert({
  id: userId,
  matricula_sase: "SASE-TS-DOC-001",
  rol: "docente",
  nombre_completo: "Docente TestSprite",
  email,
  estado_cuenta: "activo",
  alcances: { can_register: true },
  permisos: { can_register: true },
}, { onConflict: "id" });

if (perfil.error) throw perfil.error;

const legacy = await client.from("profiles").upsert({
  id: userId,
  full_name: "Docente TestSprite",
  role: "docente",
}, { onConflict: "id" });

if (legacy.error) throw legacy.error;

console.log(JSON.stringify({ email, password, userId }, null, 2));
