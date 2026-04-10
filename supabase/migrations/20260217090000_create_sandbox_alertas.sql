-- Crea tabla sandbox_alertas si no existe, para pruebas y auditorías automáticas.

create table if not exists public.sandbox_alertas (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  estado text,
  persona_id uuid,
  tipo_patron text
);
