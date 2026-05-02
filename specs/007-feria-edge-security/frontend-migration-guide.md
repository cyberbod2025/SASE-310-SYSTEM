# Guía de Migración: Frontend Feria → Edge Functions

## Contexto

El frontend externo de Feria usa RPCs públicas legacy que exponen lógica de negocio:

```sql
-- ❌ LEGACY (a revocar tras el corte)
SELECT * FROM registrar_progreso_v2(p_estudiante_id, p_estacion_id, p_puntos_ganados);
SELECT * FROM finalizar_trivia_v2(p_estudiante_id, p_estacion_id, p_puntos_adicionales);
```

Estas funciones están grant a `authenticated` y son vulnerables a manipulación de puntos.

## Migración

### 1. Instalar cliente (copiar `src/feriaApi.ts`)

El archivo `src/feriaApi.ts` contiene el cliente tipado para las 4 Edge Functions:

- `student-login`: obtiene `student_session_token` opaco
- `student-progress`: reemplaza `registrar_progreso_v2`
- `student-finish-trivia`: reemplaza `finalizar_trivia_v2`
- `student-progress-get`: consulta progreso

### 2. Antes vs Después

#### ❌ Antes (RPC directo - NO HACER)

```typescript
// frontend externo de Feria
import { supabase } from './supabaseClient' // ⚠️ expone service keys o anon key limitada

async function registrarAvance(estudianteId: string, estacionId: string, puntos: number) {
  const { data, error } = await supabase.rpc('registrar_progreso_v2', {
    p_estudiante_id: estudianteId,
    p_estacion_id: estacionId,
    p_puntos_ganados: puntos, // ⚠️ el cliente puede manipular esto
  })
  // ...
}
```

#### ✅ Después (Edge Functions - HACER)

```typescript
// frontend externo de Feria
import { feriaApi } from './feriaApi'

// 1. Login con sase_token (HMAC validado por Edge Function)
const session = await feriaApi.studentLogin(saseToken)
// session.student_session_token es opaco (hash SHA-256)

// 2. Registrar avance (Edge Function valida sesión y puntos)
const result = await feriaApi.registrarProgreso({
  estudianteId: session.estudiante_id,
  estacionId: 'uuid-estacion-123',
  puntosGanados: 10, // Validado y limitado por Edge Function (0-100)
  sessionToken: session.student_session_token,
})

// 3. Finalizar trivia
const triviaResult = await feriaApi.finalizarTrivia({
  estudianteId: session.estudiante_id,
  estacionId: 'uuid-estacion-123',
  puntosAdicionales: 50,
  answerHash: 'sha256-hex-de-respuestas',
  sessionToken: session.student_session_token,
})
```

### 3. Variables de entorno

En el frontend externo, asegurar:

```env
VITE_SUPABASE_URL=https://<project>.supabase.co
```

El cliente `feriaApi.ts` construye la URL base automáticamente:
```
${VITE_SUPABASE_URL}/functions/v1/student-login
```

### 4. Flujo completo recomendado

```
┌─────────────────┐     sase_token (HMAC)      ┌──────────────────────┐
│  Frontend Feria │ ──────────────────────────► │  student-login      │
│  (externo)     │                             │  Edge Function      │
└─────────────────┘                             └─────────┬────────────┘
                                                       │ student_session_token (opaco)
                                                       ▼
┌─────────────────┐     Bearer session_token      ┌──────────────────────┐
│  Frontend Feria │ ◄──────────────────────────  │  student-progress    │
│                 │ ──────────────────────────►  │  student-finish-    │
│                 │                             │  trivia              │
└─────────────────┘                             └─────────┬────────────┘
                                                       │ internal_feria_*
                                                       ▼
                                              ┌──────────────────────┐
                                              │  PostgreSQL          │
                                              │  (solo service_role) │
                                              └──────────────────────┘
```

## Checklist de migración

- [ ] Copiar `src/feriaApi.ts` al frontend externo
- [ ] Reemplazar `supabase.rpc('registrar_progreso_v2', ...)` → `feriaApi.registrarProgreso(...)`
- [ ] Reemplazar `supabase.rpc('finalizar_trivia_v2', ...)` → `feriaApi.finalizarTrivia(...)`
- [ ] Implementar login con `feriaApi.studentLogin(saseToken)`
- [ ] Guardar `student_session_token` en memoria (no localStorage)
- [ ] Configurar `VITE_SUPABASE_URL` en frontend externo
- [ ] Probar en staging: `http://localhost:54321/functions/v1/student-login`
- [ ] Desplegar Edge Functions: `supabase functions deploy`
- [ ] Ejecutar script de revocación: `supabase/sql/feria_rpc_revoke_after_edge_cutover.sql`

## Post-migración (corte)

Una vez confirmado que el frontend externo usa Edge Functions:

1. Ejecutar manualmente en SQL Editor:
   ```sql
   -- Revocar RPCs legacy expuestas
   revoke execute on function public.registrar_progreso_v2(uuid, uuid, integer) from authenticated;
   revoke execute on function public.finalizar_trivia_v2(uuid, uuid, integer) from authenticated;
   drop function if exists public.registrar_progreso_v2(uuid, uuid, integer) cascade;
   drop function if exists public.finalizar_trivia_v2(uuid, uuid, integer) cascade;
   ```

2. O ejecutar el script preparado:
   ```bash
   supabase db execute --local --file supabase/sql/feria_rpc_revoke_after_edge_cutover.sql
   ```

## Notas de seguridad

- `sase_token` usa HMAC-SHA256 con `SASE_SHARED_SECRET`
- `student_session_token` es un UUID opaco; no contiene datos del estudiante
- Las Edge Functions validan la sesión en `feria_student_sessions` (tabla con RLS denegada a anon/authenticated)
- Los puntos están limitados a 0-100 por la Edge Function
- Toda acción se audita en `auditoria` con `tipo_accion` = `FERIA_*`
