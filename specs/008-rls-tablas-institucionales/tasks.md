# Tareas - Spec 008

Estado: Implementado / en QA

## Implementación

- [x] Confirmar `alertas_emergencia` como flujo SOS canónico.
- [x] Mantener `sase_alerts` fuera del flujo SOS operativo.
- [x] Confirmar que `evidence_log` no tiene `student_id`.
- [x] Mantener `registerEvidence()` sobre las columnas reales de
  `evidence_log`.
- [x] Implementar RLS en
  `supabase/migrations/20260701000000_add_rls_policies.sql`.
- [x] Incorporar autorización fail-closed con `auth.uid()`,
  `perfiles_usuario.rol`, `estado_cuenta` y `seguridad_status`.
- [x] Limitar SELECT a registros propios, con acceso global solo para roles
  explícitamente privilegiados.
- [x] Definir la excepción de `citas_padres` para creador, `orientacion` y
  roles privilegiados.
- [x] Limitar UPDATE a `interventions_log` y `citas_padres`.
- [x] Restringir UPDATE de `perfiles_usuario` a nombre, teléfono y preferencias.
- [x] Actualizar `spec.md`, `tasks.md` y `quickstart.md` con la implementación
  real.

## QA pendiente

- [ ] Ejecutar `./scripts/audit-migrations.sh`.
- [ ] Ejecutar `supabase db start`.
- [ ] Ejecutar `supabase db lint --local`.
- [ ] Ejecutar `pnpm lint`.
- [ ] Ejecutar `pnpm type-check`.
- [ ] Ejecutar `pnpm test`.
- [ ] Ejecutar `pnpm build`.
- [ ] Validar escenarios RLS de propietario, roles privilegiados,
  `orientacion`, perfiles inactivos y roles no admitidos.
- [ ] Confirmar que el flujo SOS persiste exclusivamente en
  `alertas_emergencia`.

No realizado en esta actualización documental: QA, commit, push, merge o
deploy.
