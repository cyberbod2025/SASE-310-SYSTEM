# Quickstart: Validar reconciliacion sin tocar remoto

Estado: borrador local

## Precondiciones

- No tener un deploy o migracion remota en curso.
- Confirmar que el trabajo esta en una rama de reconciliacion.
- No ejecutar `db push`, `migration repair` ni `migration up` remoto.

## Validacion local recomendada

```bash
git status --short
./scripts/audit-migrations.sh
supabase db start
supabase db lint --local
```

## Validacion remota de solo lectura

```bash
supabase branches list --project-ref uvnetpnjinxzhggoqmwz
supabase migration list --linked
```

## Decision posterior

Si la validacion local pasa, preparar una tabla de decision:

- version
- existe en Git
- existe en remoto
- efecto existe en schema remoto
- accion propuesta: ninguna, snapshot, repair, nueva migracion

Toda accion remota debe aprobarse explicitamente antes de ejecutarse.
