# Spec 008 - RLS y tablas institucionales faltantes

Estado: Pendiente de implementacion

## Problema

El frontend escribe en 6 tablas institucionales que fallan silenciosamente:

| Tabla | Creada | RLS policies | Frontend escribe | Resultado |
|-------|--------|-------------|-----------------|-----------|
| `interventions_log` | `20260425200000_legacy_tables_sync.sql` | 0 (RLS ON sin policies) | 8 funciones via `as any` | Query rechazada por RLS |
| `evidence_log` | ídem | 0 (RLS ON sin policies) | `registerEvidence()` via `as any` | Query rechazada |
| `citas_padres` | ídem | 0 (RLS ON sin policies) | `scheduleFollowUp()` via `as any` | Query rechazada |
| `contacts_log` | ídem | 0 (RLS ON sin policies) | `orientacionApi.ts` | Query rechazada |
| `sos_alerts` | Solo en `_wip/sos/` (no migrado) | No aplica | 3 funciones via `as any` | Tabla no existe |
| `activities_log` | `20260425200000_legacy_tables_sync.sql` | 0 (RLS ON sin policies) | Solo store | Query rechazada |

**Consecuencia:** `useInstitutionalActions()` ejecuta `catch` silencioso en todas sus 9 funciones. Direccion, Prefectura y cualquier rol que use escalamiento, SOS, cierre, evidencia o seguimiento cree que la operacion funciono (toast.success) pero los datos nunca se persisten.

## Causa raiz

La migracion `20260425200000_legacy_tables_sync.sql` creo las tablas con `CREATE TABLE IF NOT EXISTS` y habilito RLS (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`), pero **nunca agrego `CREATE POLICY`**. Sin policies, RLS bloquea toda operacion.

El frontend uso `as any` para que TypeScript no se queje, pero Supabase igual rechaza las queries.

`sos_alerts` quedo en `_wip/sos/` y nunca se migro.

## Alcance

### Backend (orden de migracion)

1. **Migrar `sos_alerts` desde `_wip/sos/` a `supabase/migrations/`**
   - Mover `_wip/sos/20260503220000_sos_auto_escalation.sql` a `supabase/migrations/20260612000001_sos_alerts_y_auto_escalation.sql`
   - La migracion ya contiene: CREATE TABLE, RLS, auto_escalate_sos(), pg_cron schedule, trigger auto_resolve

2. **Agregar RLS policies a `interventions_log`**
   - `interventions_log_insert_institutional`: INSERT permitido si `auth.uid()` es personal institucional (rol en perfiles_usuario != 'alumno' y != null)
   - `interventions_log_select_own`: SELECT donde `user_id = auth.uid()` O el rol es direccion/subdireccion/developer/system_admin (ven todo)
   - `interventions_log_update_institutional`: UPDATE solo para direccion/subdireccion/developer/system_admin

3. **Agregar RLS policies a `evidence_log`**
   - `evidence_log_insert_institutional`: INSERT si rol institucional
   - `evidence_log_select_own`: SELECT propio + direccion ve todo

4. **Agregar RLS policies a `citas_padres`**
   - `citas_padres_insert_institutional`: INSERT si rol institucional
   - `citas_padres_select_institutional`: SELECT si rol institucional (todos ven citas)
   - `citas_padres_update_institutional`: UPDATE solo para orientacion/direccion/developer

5. **Agregar RLS policies a `contacts_log`**
   - `contacts_log_insert_institutional`: INSERT si rol institucional
   - `contacts_log_select_own`: SELECT propio + direccion/developer ve todo

6. **Agregar RLS policies a `activities_log`**
   - `activities_log_insert_institutional`: INSERT si rol institucional
   - `activities_log_select_own`: SELECT propio + direccion/developer ve todo

### Frontend

7. **Tipar `useInstitutionalActions.ts`** — quitar los 51 `as any`
   - Eliminar `as any` en todas las llamadas a `supabase.from("interventions_log" as any)`
   - Eliminar `as any` en `supabase.from("sos_alerts" as any)`
   - Eliminar `as any` en `supabase.from("citas_padres" as any)`
   - Eliminar `as any` en `supabase.from("evidence_log" as any)`
   - Requisito: regenerar tipos con `supabase gen types typescript --local > src/supabase/types.ts`

8. **`registerEvidence()` en `useInstitutionalActions.ts`**
   - Agregar campo `student_id` al INSERT (hoy omite student_id, la tabla lo tiene como FK opcional)

9. **Limpiar `evidence_log` INSERT en `store.tsx`**
   - Buscar y tipar correctamente la referencia en `src/store.tsx:260`

## Fuera de alcance

- No tocar `DashboardTrabajoSocial.tsx` — requiere PR separado con diseno de persistencia
- No tocar `DashboardDocente.tsx` — el boton escalar es placeholder intencional
- No tocar Orientacion v2 — ya completo y funcional
- No tocar flujo de emergencia (`alertas_emergencia`, `respuestas_alerta_emergencia`) — ya funcional
- No tocar auth ni perfiles_usuario
- No regenerar toda la UI de Trabajo Social

## Reglas funcionales

- Cualquier usuario con rol institucional (docente, tutor, orientacion, trabajo_social, prefectura, direccion, subdireccion, enfermeria, medico_escolar, secretaria, desarrollador, system_admin) puede INSERT en las 5 tablas
- Cada quien ve SOLO sus propios registros (por `user_id` o `creado_por`)
- Direccion, Subdireccion, Developer, System_admin ven TODO en SELECT
- UPDATE solo para direccion/subdireccion/developer/system_admin (excepcion: `citas_padres` tambien para orientacion)
- `sos_alerts`: todos los roles institucionales pueden INSERT, todos pueden SELECT (visibilidad completa por ser emergencia), UPDATE para quien atiende (ACK/resolver)

## Archivos a crear

| Archivo | Accion |
|---------|--------|
| `supabase/migrations/20260612000001_sos_alerts_y_auto_escalation.sql` | Mover desde `_wip/sos/` |
| `supabase/migrations/20260612000002_rls_tablas_institucionales.sql` | RLS policies para interventions_log, evidence_log, citas_padres, contacts_log, activities_log |

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/hooks/useInstitutionalActions.ts` | Quitar `as any` en las 10 funciones |
| `src/types.ts` o `src/supabase/types.ts` | Regenerar tipos (o agregar interfaces manuales para las 6 tablas) |
| Opcional: `src/store.tsx` | Tipar evidencia_log |

## Prueba minima

```bash
# 1. Migraciones locales
supabase db start
supabase migration up

# 2. TypeScript sin escapes
pnpm type-check
# No debe haber errores en useInstitutionalActions.ts ni referencias a tablas sin tipo

# 3. Tests existentes pasan
pnpm test

# 4. Auditoria de migraciones
./scripts/audit-migrations.sh

# 5. Lint SQL
supabase db lint --local
```

## Prueba end-to-end manual

```
1. Login como Direccion
2. Abrir el dashboard de Direccion
3. Hacer clic en "Escalar caso" con un alumno
4. Verificar que aparece toast.success y NO error en consola
5. Ir a Supabase dashboard → SQL editor → SELECT * FROM interventions_log WHERE student_id = '<id>'
6. Verificar que el registro existe
7. Repetir con SOS, Cerrar caso, Registrar evidencia
8. Login como Trabajo Social → verificar que NO puede hacer SELECT de interventions_log de otros
```

## Plan de merge

```
1. main ← fix/rls-tablas-institucionales
2. CI: pnpm install → pnpm lint → pnpm type-check → pnpm test → pnpm build
3. Migraciones locales OK
4. Revisar que `_wip/sos/` queda vacio (opcional: borrarlo)
5. Merge a main
6. Post-merge: `supabase db push` para aplicar migraciones a produccion
```

## Riesgos

- Si alguna policy es muy restrictiva, el frontend seguira cayendo al catch silencioso. Validar con prueba end-to-end antes del merge.
- `sos_alerts` tiene pg_cron scheduling que puede fallar si pg_cron no esta habilitado en el proyecto. La migracion ya maneja ese caso con `RAISE NOTICE`.
- Las policies para `interventions_log` deben permitir INSERT desde cualquier rol institucional, no solo direccion, porque `notifyDepartment()` y `confirmAttention()` tambien escriben ahi.
