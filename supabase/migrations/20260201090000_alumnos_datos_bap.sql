-- Asegura que la columna datos_bap exista antes de poblarla en migraciones posteriores.

alter table public.alumnos
  add column if not exists datos_bap jsonb,
  add column if not exists datos_tutor jsonb;
