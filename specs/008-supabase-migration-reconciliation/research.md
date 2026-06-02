# Research: Deriva de migraciones Supabase

Estado: borrador local

## Hallazgos

`supabase branches list --project-ref uvnetpnjinxzhggoqmwz` reporto `main` con `status = MIGRATIONS_FAILED`.

`supabase migration list --linked` mostro que `20260527051018` esta aplicada en ambos lados, pero tambien mostro deriva previa.

La tabla remota `supabase_migrations.schema_migrations` registro estos nombres remotos sin archivo local previo:

- `sos_auto_escalation`
- `fix_diagnosticos_docentes_rls`
- `fix_v_diagnosticos_docentes_view`
- `create_feedback_institucional`
- `refine_feedback_institucional_rls`

## Interpretacion

`MIGRATIONS_FAILED` no debe interpretarse como fallo de la ultima migracion solamente. En este caso es consistente con una falla o deriva de secuencia: hay IDs aplicados remotamente que no estaban en `supabase/migrations`, y hay IDs locales que remoto no registra.

Los parches remotos `fix_diagnosticos_docentes_rls` y `fix_v_diagnosticos_docentes_view` apuntan a una forma legacy de `public.diagnosticos_docentes`, distinta a la forma canonica de `20260501084547_orientacion_v2_backend`. Por eso se agregaron como migraciones condicionadas y no como SQL directo.

## Restricciones operativas

- Hubo respuesta `ECIRCUITBREAKER` temporal del pooler durante una consulta SQL remota; no conviene hacer bucles de retry.
- `supabase migration fetch` no se uso porque no permite seleccionar versiones concretas y puede escribir mas archivos de los necesarios.
- `supabase branches get main` puede devolver variables sensibles; no debe usarse como fuente para reportes.
