# Tareas

- [x] Identificar el dashboard activo y las tablas fuente.
- [x] Auditar políticas RLS y flujos de escritura existentes.
- [x] Definir separación entre incidencias y memoria clínica.
- [x] Definir matriz de acceso clínico.
- [x] Crear migración mediante Supabase CLI.
- [x] Ampliar y normalizar `atenciones_medicas`.
- [x] Ampliar `salud` para alertas vigentes.
- [x] Aplicar privilegios mínimos, RLS e índices.
- [x] Implementar servicio tipado de persistencia.
- [x] Reconstruir `DashboardSalud` sobre datos persistidos.
- [x] Alinear RBAC del router y permisos.
- [x] Añadir pruebas de servicio, UI, RBAC y migración.
- [x] Ejecutar lint, type-check, pruebas, build y diff check.
- [x] Ejecutar `scripts/audit-migrations.sh`.
- [ ] Ejecutar `supabase db start` y `supabase db lint --local`.

Bloqueo actual: Docker Desktop no está iniciado o instalado; Supabase CLI no
encuentra `//./pipe/docker_engine` y el lint local no puede conectar a
Postgres.
