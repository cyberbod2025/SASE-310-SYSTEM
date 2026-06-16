# Quickstart - QA de RLS institucional

Estado: Implementado / en QA

Este documento es un relevo de validación local. No autoriza merge, deploy ni
aplicación manual sobre un proyecto hospedado.

## 1. Alcance a validar

- Migración real:
  `supabase/migrations/20260701000000_add_rls_policies.sql`.
- Tablas RLS: `interventions_log`, `evidence_log`, `citas_padres`,
  `contacts_log` y `activities_log`.
- SOS canónico: `alertas_emergencia`; `sase_alerts` no debe participar en el
  flujo operativo de SOS.
- `evidence_log` no tiene ni requiere `student_id`.
- UPDATE de cliente solo aplica a `interventions_log` y `citas_padres`.
- UPDATE de `perfiles_usuario` solo permite `nombre_completo`, `telefono` y
  `preferencias_dashboard`.

## 2. Puertas automáticas

Ejecutar en entorno local controlado:

```bash
./scripts/audit-migrations.sh
supabase db start
supabase db lint --local

pnpm lint
pnpm type-check
pnpm test
pnpm build
```

No usar `scripts/test_auth.mjs`, `scripts/test_rls.mjs`,
`scripts/mass_invite_staff.js` ni `scripts/seed-institucional.ts`: apuntan a
entornos hospedados o mutan datos con privilegios.

## 3. Escenarios RLS

Validar con usuarios de prueba locales y evidencia auditable:

1. Un actor institucional activo puede insertar registros propios.
2. Un actor institucional no privilegiado solo puede leer sus registros.
3. `directivo`, `subdireccion`, `developer` y `system_admin` pueden realizar
   SELECT global.
4. En `citas_padres`, el creador, `orientacion` y los roles privilegiados
   pueden consultar; otros roles no obtienen lectura global.
5. Solo los roles autorizados pueden actualizar `interventions_log` y
   `citas_padres`.
6. `evidence_log`, `contacts_log` y `activities_log` rechazan UPDATE desde el
   cliente autenticado.
7. Un perfil inexistente, inactivo, bloqueado o con rol fuera del catálogo es
   rechazado.
8. Un usuario autenticado no puede modificar su rol ni estados de cuenta o
   seguridad en `perfiles_usuario`.

## 4. Flujo funcional

1. Registrar una acción institucional y confirmar persistencia en la tabla
   correspondiente.
2. Registrar evidencia y confirmar que el INSERT no intenta enviar
   `student_id`.
3. Programar una cita y comprobar las reglas de creador, `orientacion` y roles
   privilegiados.
4. Crear, reconocer y resolver un SOS desde el flujo local.
5. Confirmar que el SOS se persiste en `alertas_emergencia` y que no se consulta
   ni escribe `sase_alerts` como parte del flujo operativo.

## 5. Cierre de QA

Registrar comandos ejecutados, resultados, identidades de prueba y cualquier
desviación entre `spec.md` y la migración. Hasta cerrar esas evidencias, el
expediente permanece en estado implementado/en QA.
