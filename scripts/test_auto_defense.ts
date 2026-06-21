import { createClient } from "@supabase/supabase-js";

const PROJECT_URL = process.env.SASE_PROJECT_URL || "http://127.0.0.1:54321";
const SECRET_KEY = process.env.SASE_SECRET_KEY || ""; // Service Role
const PUBLISHABLE_KEY = process.env.SASE_PUBLISHABLE_KEY || "";

const adminClient = createClient(PROJECT_URL, SECRET_KEY);
const publicClient = createClient(PROJECT_URL, PUBLISHABLE_KEY);

const TEST_EMAIL = `victim.security.${Date.now()}@sase.mx`;
const PASSWORD = process.env.TEST_SECURITY_PASSWORD || (() => { throw new Error("Falta TEST_SECURITY_PASSWORD en .env.local"); })();

async function runSecurityTest() {
  console.log("🛡️ Iniciando Test de Auto-Defensa SASE...");

  // 1. Crear usuario de prueba
  const { data: { user }, error: createError } = await adminClient.auth.admin.createUser({
    email: TEST_EMAIL,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: "Test Seguridad" }
  });

  if (createError || !user) {
    console.error("❌ Fallo al crear usuario:", createError);
    return;
  }
  console.log("✅ Usuario creado:", TEST_EMAIL);

  // 2. Simular 5 fallos de login + auditoría
  console.log("🔥 Simulando ataque de fuerza bruta (5 fallos)...");
  for (let i = 1; i <= 5; i++) {
    const { error: loginError } = await publicClient.auth.signInWithPassword({
        email: TEST_EMAIL,
        password: "WrongPassword"
    });
    
    // El frontend llamaría a log_event en cada fallo
    await publicClient.rpc('log_event', {
        p_module: 'AUTH',
        p_action: 'LOGIN_FAILURE',
        p_result: 'ERROR_AUTH',
        p_details: { email: TEST_EMAIL, attempt: i }
    });
    console.log(`  Intento ${i} procesado.`);
  }

  // 3. Verificar respuesta automática
  console.log("🔍 Verificando estado en perfiles_usuario...");
  const { data: perfil, error: perfilError } = await adminClient
    .from('perfiles_usuario')
    .select('seguridad_status, risk_score, blocked_until')
    .eq('id', user.id)
    .single();

  if (perfilError || !perfil) {
    console.error("❌ Error al leer perfil:", perfilError);
  } else {
    console.log("📊 Estado Actual del Perfil:");
    console.log(`   Status: ${perfil.seguridad_status} (Esperado: restricted)`);
    console.log(`   Risk Score: ${perfil.risk_score} (Esperado: > 0)`);
    console.log(`   Blocked Until: ${perfil.blocked_until} (Esperado: +10 min)`);

    if (perfil.seguridad_status === 'restricted' && perfil.risk_score > 0) {
        console.log("✅ AUTO-DEFENSA ACTIVA: El sistema penalizó al atacante.");
    } else {
        console.error("❌ FALLO: El sistema no respondió automáticamente.");
    }
  }

  // 4. Intentar login legítimo mientras está bloqueado
  console.log("🚫 Intentando login legítimo con usuario restringido/bloqueado...");
  // Nota: El bloqueo de Login.tsx es FRONTEND-checked, pero handle_anomaly_response puso blocked_until.
  const { error: lateLoginError } = await publicClient.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: PASSWORD
  });

  if (!lateLoginError) {
    console.log("⚠️ Auth permitió el login (Correcto, Supabase Auth no sabe de blocked_until)");
    console.log("ℹ️ El bloqueo real ocurre en el componente Login.tsx al verificar perfiles_usuario.");
  }

  // Limpieza
  await adminClient.auth.admin.deleteUser(user.id);
  console.log("🧹 Test finalizado y usuario eliminado.");
}

runSecurityTest();
