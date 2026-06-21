# Runbook de Pruebas: Prevención de Autoescalamiento de Roles

Este documento detalla las pruebas de seguridad para verificar que los usuarios autenticados **no puedan** modificar campos sensibles de su propio perfil vía self-update. Las políticas RLS `WITH CHECK` deben bloquear cualquier intento de autoescalamiento.

> [!CAUTION]
> **NUNCA uses Supabase SQL Editor ni psql con conexión `service_role` para validar RLS.**
>
> Las conexiones con `service_role` (incluido el SQL Editor del dashboard de Supabase) operan con privilegios de superusuario y **evaden completamente RLS**. Cualquier prueba ejecutada así dará resultados falsos — los UPDATE parecerán exitosos incluso si las políticas están correctas.
>
> Usa **siempre** un cliente autenticado real (Métodos A o B) o una sesión SQL configurada correctamente (Método C).

## Entorno de prueba

- **Entorno:** Local (`supabase start`) o staging. **NUNCA producción.**
- **Usuario de prueba:** Crear un usuario QA desechable con rol `docente` o `estudiante`.
- **Credenciales:** Usar `anon` key + sesión de usuario autenticado (nunca `service_role` key).

## Campos protegidos (self-update PROHIBIDO)

| Tabla | Campo | Razón |
|-------|-------|-------|
| `perfiles_usuario` | `rol` | Escalamiento de privilegios |
| `perfiles_usuario` | `permisos` | Modificación de permisos JSONB |
| `perfiles_usuario` | `alcances` | Modificación de alcances JSONB |
| `perfiles_usuario` | `matricula_sase` | Identidad institucional |
| `perfiles_usuario` | `email` | Identidad |
| `perfiles_usuario` | `role` | Campo legacy de rol |
| `perfiles_usuario` | `seguridad_status` | Bloqueo de seguridad |
| `perfiles_usuario` | `blocked_until` | Bloqueo temporal |
| `perfiles_usuario` | `grupo_tutor` | Scope de grupo para tokens |
| `perfiles_usuario` | `grupos` | Scope de grupos para tokens |
| `perfiles_usuario` | `estado_cuenta` | Estado de la cuenta |
| `perfiles_usuario` | `risk_score` | Puntaje de riesgo automático |
| `profiles` | `role` | Rol en tabla legacy |

## Campos permitidos (self-update PERMITIDO)

| Tabla | Campo |
|-------|-------|
| `perfiles_usuario` | `nombre_completo` |
| `perfiles_usuario` | `telefono` |
| `perfiles_usuario` | `preferencias_dashboard` |

---

## Método A: Supabase JS Client (Recomendado)

Este método usa el cliente oficial de Supabase con la `anon` key y una sesión real de usuario autenticado. Es la forma más fiel de simular lo que un usuario real puede hacer desde el frontend.

### Prerequisitos

```bash
# En el directorio del proyecto
npm install @supabase/supabase-js
# O usar el cliente ya instalado en el proyecto
```

### Script de prueba

Crear archivo `scripts/test-rls-self-escalation.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";

// ── Configuración ──────────────────────────────────────────────
// Usar SIEMPRE la anon key, nunca service_role
const SUPABASE_URL = process.env.SUPABASE_URL ?? "http://127.0.0.1:54321";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? "<anon-key-local>";

// Credenciales del usuario QA de prueba (NO admin)
const TEST_EMAIL = "qa-test-docente@sase-test.local";
const TEST_PASSWORD = "TestPassword123!";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Helpers ────────────────────────────────────────────────────
async function signIn() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });
  if (error) throw new Error(`Auth failed: ${error.message}`);
  console.log(`✅ Autenticado como: ${data.user.email} (${data.user.id})`);
  return data.user.id;
}

interface TestCase {
  name: string;
  table: string;
  payload: Record<string, unknown>;
  expectBlocked: boolean;
}

async function runTest(tc: TestCase, userId: string) {
  const { data, error } = await supabase
    .from(tc.table)
    .update(tc.payload)
    .eq("id", userId)
    .select();

  const blocked = !!error || !data || data.length === 0;
  const pass = blocked === tc.expectBlocked;
  const icon = pass ? "✅" : "❌";
  const status = tc.expectBlocked ? "BLOQUEADO" : "PERMITIDO";

  console.log(`${icon} ${tc.name}: ${status}`);
  if (error) console.log(`   Error: ${error.message} (code: ${error.code})`);
  if (!pass) {
    console.error(`   ⚠️  FALLA DE SEGURIDAD: esperaba ${status} pero no fue así`);
  }
  return pass;
}

// ── Casos de prueba ────────────────────────────────────────────
async function main() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  RLS Self-Escalation Prevention Test Suite");
  console.log("═══════════════════════════════════════════════════\n");

  const userId = await signIn();

  // Campos que DEBEN ser bloqueados en perfiles_usuario
  const blockedFields: TestCase[] = [
    { name: "rol → admin", table: "perfiles_usuario", payload: { rol: "admin" }, expectBlocked: true },
    { name: "permisos → all:true", table: "perfiles_usuario", payload: { permisos: { all: true } }, expectBlocked: true },
    { name: "alcances → global:true", table: "perfiles_usuario", payload: { alcances: { global: true } }, expectBlocked: true },
    { name: "matricula_sase", table: "perfiles_usuario", payload: { matricula_sase: "HACK-001" }, expectBlocked: true },
    { name: "email", table: "perfiles_usuario", payload: { email: "hacked@evil.com" }, expectBlocked: true },
    { name: "role (legacy)", table: "perfiles_usuario", payload: { role: "directivo" }, expectBlocked: true },
    { name: "seguridad_status", table: "perfiles_usuario", payload: { seguridad_status: "restricted" }, expectBlocked: true },
    { name: "blocked_until → 2099", table: "perfiles_usuario", payload: { blocked_until: "2099-01-01T00:00:00.000Z" }, expectBlocked: true }, // Se usa un valor futuro distinto al actual para probar que realmente está congelado (NULL a NULL no lo probaría)
    { name: "grupo_tutor", table: "perfiles_usuario", payload: { grupo_tutor: "admin-group" }, expectBlocked: true },
    { name: "grupos", table: "perfiles_usuario", payload: { grupos: ["all-access"] }, expectBlocked: true },
    { name: "estado_cuenta", table: "perfiles_usuario", payload: { estado_cuenta: "suspendido" }, expectBlocked: true },
    { name: "risk_score", table: "perfiles_usuario", payload: { risk_score: 100 }, expectBlocked: true },
  ];

  // Campo que DEBE ser bloqueado en profiles (tabla legacy)
  const blockedLegacy: TestCase[] = [
    { name: "profiles.role → directivo", table: "profiles", payload: { role: "directivo" }, expectBlocked: true },
  ];

  // Campos que DEBEN ser permitidos
  const allowedFields: TestCase[] = [
    { name: "nombre_completo", table: "perfiles_usuario", payload: { nombre_completo: "QA Test User Updated" }, expectBlocked: false },
    { name: "telefono", table: "perfiles_usuario", payload: { telefono: "+52 555 000 0000" }, expectBlocked: false },
    { name: "preferencias_dashboard", table: "perfiles_usuario", payload: { preferencias_dashboard: { theme: "dark" } }, expectBlocked: false },
  ];

  console.log("\n── Campos BLOQUEADOS (perfiles_usuario) ──\n");
  let allPass = true;
  for (const tc of blockedFields) {
    const pass = await runTest(tc, userId);
    if (!pass) allPass = false;
  }

  console.log("\n── Campos BLOQUEADOS (profiles legacy) ──\n");
  for (const tc of blockedLegacy) {
    const pass = await runTest(tc, userId);
    if (!pass) allPass = false;
  }

  console.log("\n── Campos PERMITIDOS ──\n");
  for (const tc of allowedFields) {
    const pass = await runTest(tc, userId);
    if (!pass) allPass = false;
  }

  console.log("\n═══════════════════════════════════════════════════");
  console.log(allPass ? "✅ TODAS LAS PRUEBAS PASARON" : "❌ HAY FALLAS DE SEGURIDAD");
  console.log("═══════════════════════════════════════════════════\n");

  await supabase.auth.signOut();
  process.exit(allPass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

### Ejecución

```bash
# Desde el directorio del proyecto con Supabase local corriendo
npx tsx scripts/test-rls-self-escalation.ts
```

### Resultados esperados

- Todos los campos de la sección "BLOQUEADOS" deben mostrar `✅ BLOQUEADO`.
- Todos los campos de la sección "PERMITIDOS" deben mostrar `✅ PERMITIDO`.
- Si algún campo bloqueado muestra `❌`, hay una **falla de seguridad crítica**.

---

## Método B: curl / REST API con Bearer Token

Este método usa la API REST (PostgREST) de Supabase directamente con `curl`. Útil para validación rápida sin escribir código.

> **Nota:** Este script asume que tienes `jq` instalado en tu sistema para extraer el token y el ID del JSON de respuesta. Si no tienes `jq`, deberás extraer estos valores manualmente de la respuesta.

### 1. Obtener un token de usuario autenticado

```bash
# Login con usuario QA (usar anon key, NUNCA service_role)
LOGIN_RESPONSE=$(curl -s -X POST \
  "${SUPABASE_URL}/auth/v1/token?grant_type=password" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"${TEST_EMAIL}\", \"password\": \"${TEST_PASSWORD}\"}")

ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token')
USER_ID=$(echo "$LOGIN_RESPONSE" | jq -r '.user.id')

# Validaciones defensivas para asegurar la prueba
test -n "$ACCESS_TOKEN" || { echo "❌ Falta ACCESS_TOKEN"; exit 1; }
test "$ACCESS_TOKEN" != "null" || { echo "❌ ACCESS_TOKEN es null"; exit 1; }
test -n "$USER_ID" || { echo "❌ Falta USER_ID"; exit 1; }
test "$USER_ID" != "null" || { echo "❌ USER_ID es null"; exit 1; }

echo "Testing QA user id: $USER_ID"
```

### 2. Intentar self-escalation (DEBE fallar)

```bash
# Intentar cambiar rol a admin — DEBE retornar error o 0 filas
curl -s -X PATCH \
  "${SUPABASE_URL}/rest/v1/perfiles_usuario?id=eq.${USER_ID}" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"rol": "admin"}'

# Resultado esperado: [] (array vacío) o error 40x
# Si retorna el registro actualizado con rol=admin → FALLA DE SEGURIDAD

# Intentar cambiar permisos
curl -s -X PATCH \
  "${SUPABASE_URL}/rest/v1/perfiles_usuario?id=eq.${USER_ID}" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"permisos": {"all": true}}'

# Resultado esperado: [] o error 40x

# Intentar cambiar seguridad_status
curl -s -X PATCH \
  "${SUPABASE_URL}/rest/v1/perfiles_usuario?id=eq.${USER_ID}" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"seguridad_status": "restricted"}'

# Resultado esperado: [] o error 40x
```

### 3. Verificar que campos permitidos SÍ funcionan (DEBE tener éxito)

```bash
# Actualizar nombre_completo — DEBE retornar el registro actualizado
curl -s -X PATCH \
  "${SUPABASE_URL}/rest/v1/perfiles_usuario?id=eq.${USER_ID}" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"nombre_completo": "QA Test User Updated"}'

# Resultado esperado: el registro con nombre_completo actualizado
```

### Resultados esperados

| Operación | Resultado esperado |
|-----------|-------------------|
| `PATCH rol=admin` | `[]` vacío o HTTP 403/400 |
| `PATCH permisos={...}` | `[]` vacío o HTTP 403/400 |
| `PATCH alcances={...}` | `[]` vacío o HTTP 403/400 |
| `PATCH matricula_sase=...` | `[]` vacío o HTTP 403/400 |
| `PATCH email=...` | `[]` vacío o HTTP 403/400 |
| `PATCH role=...` | `[]` vacío o HTTP 403/400 |
| `PATCH seguridad_status=...` | `[]` vacío o HTTP 403/400 |
| `PATCH blocked_until=...` | `[]` vacío o HTTP 403/400 |
| `PATCH grupo_tutor=...` | `[]` vacío o HTTP 403/400 |
| `PATCH grupos=...` | `[]` vacío o HTTP 403/400 |
| `PATCH estado_cuenta=...` | `[]` vacío o HTTP 403/400 |
| `PATCH risk_score=...` | `[]` vacío o HTTP 403/400 |
| `PATCH nombre_completo=...` | Registro actualizado ✅ |
| `PATCH telefono=...` | Registro actualizado ✅ |
| `PATCH preferencias_dashboard=...` | Registro actualizado ✅ |

---

## Método C: SQL con sesión autenticada correcta

> [!WARNING]
> Este método solo es válido si configuras la sesión correctamente con `set_config`. **NO uses `SET local role authenticated`** en SQL Editor de Supabase — eso NO simula RLS correctamente porque la conexión subyacente sigue siendo `service_role`.

Si necesitas usar SQL directo (por ejemplo, en `psql` conectado al puerto local de Supabase), debes configurar las claims JWT manualmente usando `set_config` dentro de una transacción:

```sql
-- ═══════════════════════════════════════════════════════════════
-- IMPORTANTE: Ejecutar contra la base de datos LOCAL (puerto 54322)
-- NUNCA contra producción ni con credenciales service_role del dashboard
-- ═══════════════════════════════════════════════════════════════

-- Conectar como usuario con privilegios limitados
-- psql postgresql://postgres:postgres@127.0.0.1:54322/postgres

BEGIN;

  -- 1. Cambiar al rol 'authenticated' (simula conexión PostgREST)
  SET LOCAL ROLE authenticated;

  -- 2. Configurar claims JWT del usuario de prueba
  --    IMPORTANTE: usar el UUID REAL del usuario QA de prueba
  SELECT set_config('request.jwt.claims', json_build_object(
    'sub', '<uuid-real-del-usuario-qa>',
    'role', 'authenticated',
    'email', 'qa-test-docente@sase-test.local',
    'aud', 'authenticated'
  )::text, true);

  -- También configurar el claim individual (algunas policies lo leen así)
  SELECT set_config('request.jwt.claim.sub', '<uuid-real-del-usuario-qa>', true);
  SELECT set_config('request.jwt.claim.email', 'qa-test-docente@sase-test.local', true);
  SELECT set_config('request.jwt.claim.role', 'authenticated', true);

  -- ── Prueba 1: Intentar autoescalamiento de rol (DEBE FALLAR) ──
  SAVEPOINT before_test1;
  UPDATE public.perfiles_usuario
  SET rol = 'admin'
  WHERE id = '<uuid-real-del-usuario-qa>';
  -- Esperado: 0 filas afectadas (la política WITH CHECK lo rechaza)
  ROLLBACK TO before_test1;

  -- ── Prueba 2: Intentar modificar permisos (DEBE FALLAR) ──
  SAVEPOINT before_test2;
  UPDATE public.perfiles_usuario
  SET permisos = '{"all": true}'::jsonb
  WHERE id = '<uuid-real-del-usuario-qa>';
  -- Esperado: 0 filas afectadas
  ROLLBACK TO before_test2;

  -- ── Prueba 3: Intentar modificar seguridad_status (DEBE FALLAR) ──
  SAVEPOINT before_test3;
  UPDATE public.perfiles_usuario
  SET seguridad_status = 'restricted'
  WHERE id = '<uuid-real-del-usuario-qa>';
  -- Esperado: 0 filas afectadas
  ROLLBACK TO before_test3;

  -- ── Prueba 4: Modificar nombre_completo (DEBE TENER ÉXITO) ──
  SAVEPOINT before_test4;
  UPDATE public.perfiles_usuario
  SET nombre_completo = 'QA Test User SQL'
  WHERE id = '<uuid-real-del-usuario-qa>';
  -- Esperado: 1 fila afectada ✅
  RELEASE SAVEPOINT before_test4;

  -- Verificar estado final
  SELECT id, rol, nombre_completo, seguridad_status
  FROM public.perfiles_usuario
  WHERE id = '<uuid-real-del-usuario-qa>';

ROLLBACK;  -- Revertir todos los cambios de prueba
```

### ¿Por qué `set_config` y no `SET local`?

| Aspecto | `SET local request.jwt.claim.sub` | `set_config('request.jwt.claims', ...)` |
|---------|-----------------------------------|---------------------------------------|
| Configura claims completas | ❌ Solo un claim | ✅ Objeto JSON completo |
| Compatible con PostgREST | Parcial | ✅ Sí |
| Funciona en SQL Editor dashboard | ❌ La conexión sigue siendo superuser | ❌ Mismo problema |
| Funciona en psql local | ✅ Con `SET LOCAL ROLE` | ✅ Con `SET LOCAL ROLE` |

> [!IMPORTANT]
> El método SQL **solo es confiable desde psql conectado al puerto local** (`54322`). El SQL Editor del dashboard de Supabase usa una conexión `service_role` que evade RLS sin importar qué `SET ROLE` ejecutes. **Para validación autoritativa, usa siempre el Método A o B.**

---

## Crear usuario QA de prueba

Antes de ejecutar cualquier test, necesitas un usuario QA desechable:

```bash
# Crear usuario QA en Supabase local
curl -s -X POST \
  "${SUPABASE_URL}/auth/v1/signup" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "qa-test-docente@sase-test.local",
    "password": "TestPassword123!",
    "data": { "nombre_completo": "QA Test Docente" }
  }'
```

Luego asignar un rol no-admin con `service_role` (esto sí es válido para setup):

```bash
# Asignar rol docente al usuario QA (usar service_role solo para SETUP)
curl -s -X PATCH \
  "${SUPABASE_URL}/rest/v1/perfiles_usuario?id=eq.${QA_USER_ID}" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"rol": "docente"}'

# Crear fila legacy profile si existe la tabla (usar service_role para SETUP)
curl -s -X POST \
  "${SUPABASE_URL}/rest/v1/profiles" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"id\": \"${QA_USER_ID}\", \"role\": \"docente\"}"
```

---

## Limpieza

Después de las pruebas, eliminar el usuario QA:

```bash
# Eliminar usuario QA (requiere service_role — esto es correcto para limpieza admin)
curl -s -X DELETE \
  "${SUPABASE_URL}/auth/v1/admin/users/${QA_USER_ID}" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}"
```

O desde SQL local:

```sql
-- Limpiar usuario QA de prueba
DELETE FROM auth.users WHERE email = 'qa-test-docente@sase-test.local';
```

---

## Caso especial: Modificación por servicio administrativo (DEBE permitirse)

Los flujos server-side y Edge Functions que usan `service_role` key **sí** pueden modificar campos sensibles. Esto es correcto y esperado:

- **Actor:** Edge Functions, API handlers server-side.
- **Mecanismo:** `createClient(url, SERVICE_ROLE_KEY)` que evade RLS.
- **Uso legítimo:** Crear/aprobar personal, cambiar roles por decisión institucional, bloquear usuarios.
- **Resultado esperado:** Éxito total sin restricciones RLS.

> [!NOTE]
> La clave `service_role` es un secreto de servidor. Nunca debe exponerse al cliente ni usarse en código frontend.

---

## Resumen de validación

| # | Prueba | Método recomendado | Resultado esperado |
|---|--------|-------------------|-------------------|
| 1 | Self-update de `rol` | A o B | ❌ Bloqueado |
| 2 | Self-update de `permisos` | A o B | ❌ Bloqueado |
| 3 | Self-update de `alcances` | A o B | ❌ Bloqueado |
| 4 | Self-update de `matricula_sase` | A o B | ❌ Bloqueado |
| 5 | Self-update de `email` | A o B | ❌ Bloqueado |
| 6 | Self-update de `role` (legacy) | A o B | ❌ Bloqueado |
| 7 | Self-update de `seguridad_status` | A o B | ❌ Bloqueado |
| 8 | Self-update de `blocked_until` | A o B | ❌ Bloqueado |
| 9 | Self-update de `grupo_tutor` | A o B | ❌ Bloqueado |
| 10 | Self-update de `grupos` | A o B | ❌ Bloqueado |
| 11 | Self-update de `nombre_completo` | A o B | ✅ Permitido |
| 12 | Self-update de `telefono` | A o B | ✅ Permitido |
| 13 | Self-update de `preferencias_dashboard` | A o B | ✅ Permitido |
| 14 | Lectura de perfil propio | A o B | ✅ Permitido |
| 15 | Modificación admin vía service_role | N/A (server) | ✅ Permitido |
