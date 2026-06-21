# Spec 008 - RLS de tablas institucionales

Estado: Implementado / en QA

La implementación está en la rama `fix/rls-institutional-action-tables`. No se
considera desplegada ni aplicada a producción hasta completar QA y el flujo de
revisión autorizado.

## Problema

Las tablas `interventions_log`, `evidence_log`, `citas_padres`, `contacts_log`
y `activities_log` fueron creadas por
`supabase/migrations/20260425200000_legacy_tables_sync.sql` con RLS habilitado,
pero sin las políticas necesarias para las acciones institucionales.

El expediente también conservaba dos supuestos incorrectos:

- El flujo SOS no usa `sase_alerts` como tabla operativa.
  `alertas_emergencia` es la fuente canónica; `sase_alerts` queda como
  observabilidad fuera de este alcance.
- `evidence_log` no tiene una columna `student_id`; la relación contextual con
  un alumno se conserva en la auditoría y no debe inventarse en el esquema.

## Implementación real

La migración de este cambio es:

`supabase/migrations/20260701000000_add_rls_policies.sql`

La migración:

- habilita y define RLS para las cinco tablas institucionales;
- agrega el helper privado `private.is_institutional_actor(text[])`;
- limita los privilegios de `UPDATE` por tabla y columna;
- endurece `UPDATE` sobre `perfiles_usuario` para impedir autoescalamiento.

No se crea ni se migra `sase_alerts` dentro de este cambio.

## Autorización fail-closed

`private.is_institutional_actor(text[])` usa `auth.uid()` y
`perfiles_usuario.rol` como fuente de autorización. Solo devuelve acceso cuando:

- existe un perfil cuyo `id` coincide con `auth.uid()`;
- `estado_cuenta = 'activo'`;
- `seguridad_status = 'active'`;
- el rol pertenece al catálogo institucional admitido;
- el rol pertenece además al arreglo solicitado por la política.

La ausencia de sesión, perfil, rol reconocido o cuenta activa produce
denegación. El helper es `SECURITY DEFINER`, usa `search_path = ''`, vive en el
schema `private` y solo concede ejecución a `authenticated`.

## Reglas RLS

Los roles con lectura global explícita son `directivo`, `subdireccion`,
`developer` y `system_admin`. Los demás roles institucionales solo consultan
registros propios, salvo la regla específica de `citas_padres`.

| Tabla | SELECT | INSERT | UPDATE |
|---|---|---|---|
| `interventions_log` | Propio por `user_id`; lectura global para roles privilegiados | Actor institucional con `user_id = auth.uid()`; la FK valida `student_id` cuando se informa | Solo roles privilegiados; columnas `reason`, `result`, `notes` |
| `evidence_log` | Propio por `user_id`; lectura global para roles privilegiados | Actor institucional con `user_id = auth.uid()` | No permitido |
| `contacts_log` | Propio por `user_id`; lectura global para roles privilegiados | Actor institucional con `user_id = auth.uid()`; la FK valida `student_id` cuando se informa | No permitido |
| `activities_log` | Propio por `user_id`; lectura global para roles privilegiados | Actor institucional con `user_id = auth.uid()` | No permitido |
| `citas_padres` | Creador por `creado_por`; lectura institucional ampliada para `orientacion` y roles privilegiados | Actor institucional con `creado_por = auth.uid()`; la FK valida `alumno_id` | `orientacion` y roles privilegiados; columnas `estado`, `fecha_cita`, `motivo`, `observaciones` |

Solo `interventions_log` y `citas_padres` conservan privilegios de `UPDATE`
para el cliente autenticado.

## Endurecimiento de perfiles

La migración revoca el privilegio general de `UPDATE` sobre
`perfiles_usuario` para `public`, `anon` y `authenticated`. Después concede a
`authenticated` únicamente:

- `nombre_completo`;
- `telefono`;
- `preferencias_dashboard`.

No se concede actualización de `rol`, `role`, estados de cuenta, atributos de
seguridad ni otros campos que permitan autoescalamiento.

## Flujo SOS canónico

`src/hooks/useInstitutionalActions.ts` registra, reconoce y resuelve SOS en
`alertas_emergencia`. El contexto del alumno se conserva en `metadata`, y
`interventions_log` mantiene el registro histórico institucional cuando
corresponde.

`sase_alerts` no forma parte del alcance operativo de SOS en este cambio.

## Frontend y evidencia

`src/hooks/useInstitutionalActions.ts` usa las tablas tipadas sin crear una
columna ficticia para evidencia. `registerEvidence()` inserta los campos reales
de `evidence_log`; el identificador del alumno se usa en la auditoría asociada.

## Fuera de alcance

- Cambiar el papel de `sase_alerts` más allá de su uso de observabilidad fuera
  del flujo SOS operativo.
- Agregar `student_id` a `evidence_log`.
- Cambiar el modelo funcional de `alertas_emergencia`.
- Hacer merge, push, deploy o aplicar manualmente la migración.

## Estado de verificación

La implementación está en QA. Este ajuste documental no ejecuta validaciones.
Las puertas requeridas y los escenarios RLS están descritos en `quickstart.md`.

## Riesgos

- Una diferencia entre la matriz documentada y las políticas SQL puede ampliar
  lectura institucional o bloquear operaciones legítimas.
- Un perfil sin estados activos o con rol fuera del catálogo queda denegado por
  diseño.
- La restricción de columnas en `perfiles_usuario` puede exponer dependencias
  cliente existentes que intenten actualizar campos ahora protegidos.
- La implementación no debe considerarse operativa en producción sin QA,
  revisión y aplicación autorizada de la migración.
