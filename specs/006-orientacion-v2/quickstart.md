# Quickstart - Orientacion v2

## Verificacion frontend

```bash
pnpm install --frozen-lockfile
pnpm type-check
pnpm build
pnpm test
```

## Verificacion Supabase local

```bash
./scripts/audit-migrations.sh
supabase db start
supabase db lint --local
```

## Flujo funcional esperado

1. Orientacion abre un caso de alumno en riesgo.
2. Orientacion solicita diagnostico a docente asignado.
3. Docente responde solo su solicitud.
4. Orientacion crea plan de intervencion.
5. Orientacion deriva a Trabajo Social o escala a Direccion.
6. Toda mutacion registra auditoria.
