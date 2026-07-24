# Investigación

## Fuente de verdad actual

- Tabla canónica: `public.auditoria`.
- Identidad institucional: `public.perfiles_usuario`.
- Navegación: `ModuleRouter` y permisos de `usePermissions`.
- Registro manual legado: `src/store/slices/useAuditLogic.ts`.
- Consulta activa: `src/components/BitacoraAuditoria.tsx`.

## Hallazgos

1. `useAuditLogic` inserta directamente en `auditoria` y puede sustituir al
   actor `developer` por una identidad de sistema.
2. La vista consulta `select('*')`, no presenta error al usuario e inventa
   `new Date()` cuando falta `fecha`.
3. La descarga CSV solo muestra un toast.
4. `GeneradorDocumentos` consulta `audit_log`, tabla unificada y eliminada por
   `20260410120000_supabase_final_polish.sql`.
5. `AprobacionesPersonal` también inserta directamente en `auditoria`.
6. La política vigente depende de JWT y excluye Subdirección aunque su matriz
   de permisos declara `can_view_audit`.
7. `public.log_audit` existe por compatibilidad, pero su ejecución fue revocada
   a clientes autenticados.
8. `auditoria_accesos` permite al cliente escribir `usuario`, `rol`, fecha y
   hora; además hay escrituras directas con identidades literales falsas.

## Decisiones

- No se reutiliza `log_event`: escribe en otra familia de tablas y resuelve el
  rol desde JWT.
- No se devuelve `old_values/new_values`: pueden contener PII o notas sensibles.
- No se agrega hash de integridad: se evita prometer inmutabilidad criptográfica
  sin un modelo de custodia y verificación.
- Se conserva `developer` como lector porque su matriz de permisos vigente
  declara auditoría; su identidad ya no puede ocultarse.
- La exportación usa únicamente las filas ya autorizadas y visibles.
- Los accesos sensibles nuevos entran por la RPC canónica; los anteriores se
  migran con el rol explícitamente marcado como no verificado.

## Referencias verificadas

- `memory/constitution.md`
- `memory/sase-canon.md`
- documentación oficial de Supabase sobre RLS y seguridad del Data API;
- reglas locales de mínimo privilegio, RLS e índices.
