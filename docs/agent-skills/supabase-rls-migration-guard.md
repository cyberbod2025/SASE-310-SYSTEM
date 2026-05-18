# Supabase RLS Migration Guard

## Propósito
Controlar cualquier cambio en base de datos, RLS, policies, grants o migrations.

## Regla absoluta
No tocar Supabase, RLS, policies, grants, schemas ni migrations sin autorización explícita.

## Si una tarea requiere DB
Antes de editar, entregar:
- tabla afectada
- política afectada
- riesgo de seguridad
- SQL propuesto
- rollback
- validación
- impacto por rol

## Prohibido
- db push sin autorización
- migration repair sin autorización
- service_role en frontend
- policies permisivas sin justificación
- usar anon para datos sensibles
