import { createClient } from "@supabase/supabase-js";
import handler from "../api/notifications/whatsapp";

type JsonRecord = Record<string, unknown>;

const PROJECT_URL = process.env.SASE_PROJECT_URL || "http://127.0.0.1:54321";
const PUBLISHABLE_KEY = process.env.SASE_PUBLISHABLE_KEY || "";
const SECRET_KEY = process.env.SASE_SECRET_KEY || "";
const PASSWORD = process.env.TEST_DOCENTE_PASSWORD || "SmokePass123!";

if (!PUBLISHABLE_KEY || !SECRET_KEY) {
  throw new Error("Faltan SASE_PUBLISHABLE_KEY o SASE_SECRET_KEY para el smoke T017.");
}

const admin = createClient(PROJECT_URL, SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const publicClient = createClient(PROJECT_URL, PUBLISHABLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const SMOKE_EMAIL = process.env.TEST_SMOKE_REGISTRO_EMAIL || "prueba.registro.smoke@sase.mx";
const APPROVER_EMAIL = process.env.TEST_DOCENTE_EMAIL || "directivo.smoke@sase.mx";
const OUTSIDER_EMAIL = process.env.TEST_BLOQUEADO_EMAIL || "externo.smoke@sase.mx";
const PHONE = "+525511112222";

async function deleteUserByEmail(email: string) {
  const { data, error } = await admin.auth.admin.listUsers();
  if (error) throw error;

  const existing = data.users.find((user) => user.email === email);
  if (existing) {
    const { error: deleteError } = await admin.auth.admin.deleteUser(existing.id);
    if (deleteError) throw deleteError;
  }
}

async function cleanup() {
  await admin.from("solicitudes_alta_personal").delete().in("correo_institucional", [
    SMOKE_EMAIL,
    APPROVER_EMAIL,
    OUTSIDER_EMAIL,
  ]);

  await admin.from("perfiles_usuario").delete().in("email", [
    SMOKE_EMAIL,
    APPROVER_EMAIL,
    OUTSIDER_EMAIL,
  ]);

  await admin.from("profiles").delete().in("full_name", [
    "Prueba Smoke",
    "Directivo Smoke",
    "Externo Smoke",
  ]);

  await deleteUserByEmail(SMOKE_EMAIL);
  await deleteUserByEmail(APPROVER_EMAIL);
  await deleteUserByEmail(OUTSIDER_EMAIL);
}

async function createUser(email: string, fullName: string) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (error || !data.user) {
    throw error || new Error(`No se pudo crear ${email}`);
  }

  return data.user;
}

async function signIn(email: string) {
  const client = createClient(PROJECT_URL, PUBLISHABLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password: PASSWORD,
  });

  if (error || !data.session?.access_token) {
    throw error || new Error(`No se pudo autenticar ${email}`);
  }

  return data.session.access_token;
}

async function insertApproverProfiles(userId: string) {
  const scopes: JsonRecord = {
    can_view_names: true,
    can_register: true,
    can_edit: true,
    can_close: true,
    can_escalate: true,
    can_view_audit: true,
    can_approve_staff: true,
    can_assign_groups: true,
    can_view_sensitive: true,
    can_manage_system: true,
  };

  const { error: perfilError } = await admin.from("perfiles_usuario").upsert({
    id: userId,
    matricula_sase: "SASE-SMOKE-DIR-001",
    rol: "directivo",
    nombre_completo: "Directivo Smoke",
    email: APPROVER_EMAIL,
    alcances: scopes,
    permisos: scopes,
    estado_cuenta: "activo",
  });
  if (perfilError) throw perfilError;

  const { error: profileError } = await admin.from("profiles").upsert({
    id: userId,
    full_name: "Directivo Smoke",
    role: "directivo",
  });
  if (profileError) throw profileError;
}

async function insertPendingRequest() {
  const { error } = await publicClient.from("solicitudes_alta_personal").insert({
    rol_solicitado: ["docente"],
    turno: "matutino",
    nombres: "PRUEBA",
    apellido_paterno: "SMOKE",
    apellido_materno: "SASE",
    curp: "ABCD010101HDFRRS09",
    correo_institucional: SMOKE_EMAIL,
    acepta_privacidad: true,
    acepta_etica: true,
    acepta_auditoria: true,
    estado: "PENDIENTE",
    metadata: {
      folio_solicitud: "REQ-SMOKE-T017",
      cct: "09DES0310X",
      matricula: "SMOKE-T017",
      origen: "SMOKE_T017",
    },
  });

  if (error) throw error;

  const { data, error: queryError } = await admin
    .from("solicitudes_alta_personal")
    .select("id, estado")
    .eq("correo_institucional", SMOKE_EMAIL)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (queryError || !data) {
    throw queryError || new Error("No se pudo recuperar la solicitud de smoke");
  }

  return data.id as string;
}

async function invokeApproveStaff(token: string, solicitudId: string) {
  const response = await fetch(`${PROJECT_URL}/functions/v1/approve-staff`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Origin: "http://127.0.0.1:3100",
    },
    body: JSON.stringify({
      solicitudId,
      matricula_sase: "SASE-26-DOC-321",
      grupos: ["3A"],
      materias: ["Matemáticas"],
      es_tutor: true,
      grupo_tutor: "3A",
    }),
  });

  const body = await response.json().catch(() => ({}));
  return { status: response.status, body };
}

function createMockRes() {
  return {
    statusCode: 200,
    headers: {} as Record<string, string>,
    payload: undefined as unknown,
    setHeader(name: string, value: string) {
      this.headers[name] = value;
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.payload = payload;
      return this;
    },
    end() {
      return this;
    },
  };
}

async function invokeWhatsapp(token: string) {
  const req = {
    method: "POST",
    headers: {
      origin: "http://127.0.0.1:3100",
      authorization: `Bearer ${token}`,
    },
    body: {
      to: PHONE,
      message: "Smoke test de WhatsApp",
      studentName: "Prueba Smoke",
      incidentType: "conducta",
    },
  } as any;

  const res = createMockRes();
  await handler(req, res as any);
  return res;
}

async function main() {
  process.env.ALLOWED_ORIGINS = "http://127.0.0.1:3100,http://localhost:3100";
  process.env.SUPABASE_URL = PROJECT_URL;
  process.env.SUPABASE_SERVICE_ROLE_KEY = SECRET_KEY;
  delete process.env.WHATSAPP_TOKEN;
  delete process.env.WHATSAPP_PHONE_ID;

  await cleanup();

  const approver = await createUser(APPROVER_EMAIL, "Directivo Smoke");
  const outsider = await createUser(OUTSIDER_EMAIL, "Externo Smoke");

  await insertApproverProfiles(approver.id);

  const approverToken = await signIn(APPROVER_EMAIL);
  const outsiderToken = await signIn(OUTSIDER_EMAIL);

  const solicitudId = await insertPendingRequest();

  const negativeApprove = await invokeApproveStaff(outsiderToken, solicitudId);
  const positiveApprove = await invokeApproveStaff(approverToken, solicitudId);

  const { data: approvedRequest } = await admin
    .from("solicitudes_alta_personal")
    .select("estado, matricula_sase, correo_institucional")
    .eq("id", solicitudId)
    .single();

  const createdAuthUsers = await admin.auth.admin.listUsers();
  const approvedAuthUser = createdAuthUsers.data.users.find((user) => user.email === SMOKE_EMAIL);

  const { data: approvedProfile } = await admin
    .from("perfiles_usuario")
    .select("email, rol, matricula_sase, es_tutor, grupo_tutor")
    .eq("email", SMOKE_EMAIL)
    .maybeSingle();

  const whatsappDenied = await invokeWhatsapp(outsiderToken);
  const whatsappAllowed = await invokeWhatsapp(approverToken);

  const summary = {
    registroPublico: {
      solicitudId,
      estadoInsertado: approvedRequest?.estado,
    },
    approveStaff: {
      unauthorizedStatus: negativeApprove.status,
      authorizedStatus: positiveApprove.status,
      authorizedBody: positiveApprove.body,
      approvedRequest,
      approvedAuthUser: approvedAuthUser
        ? { id: approvedAuthUser.id, email: approvedAuthUser.email }
        : null,
      approvedProfile,
    },
    whatsapp: {
      unauthorizedStatus: whatsappDenied.statusCode,
      unauthorizedPayload: whatsappDenied.payload,
      authorizedStatus: whatsappAllowed.statusCode,
      authorizedPayload: whatsappAllowed.payload,
    },
    createdUsers: {
      approver: approver.id,
      outsider: outsider.id,
    },
  };

  console.log(JSON.stringify(summary, null, 2));

  await cleanup();
}

main().catch(async (error) => {
  console.error(error);
  try {
    await cleanup();
  } catch {}
  process.exitCode = 1;
});
