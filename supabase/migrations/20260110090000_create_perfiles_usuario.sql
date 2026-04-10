-- Crea la tabla base de perfiles institucionales si aún no existe.
-- Esto evita fallos de migraciones posteriores que asumen su presencia.

create table if not exists public.perfiles_usuario (
  id uuid primary key references auth.users(id),
  created_at timestamptz not null default now(),

  -- Identidad institucional básica
  nombre_completo text,
  rol text,
  role text,
  email text,

  -- Campos operativos comunes
  matricula_sase text,
  alcances jsonb,
  estado_cuenta text,
  curp text,
  telefono text,
  materias text[],
  grupos text[],
  turno text,
  es_tutor boolean,
  grupo_tutor text,
  observaciones text,
  permisos jsonb,
  rol_solicitado text,
  validado_por uuid references auth.users(id),
  fecha_validacion timestamptz,
  preferencias_dashboard jsonb default '{}'::jsonb,

  updated_at timestamptz default now()
);

-- Índice auxiliar para búsquedas por rol
create index if not exists idx_perfiles_usuario_rol on public.perfiles_usuario(rol);
