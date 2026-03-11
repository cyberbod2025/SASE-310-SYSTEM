-- 1. Crear tabla de GRUPOS
-- Sirve para asignar tutores y centralizar la información del grupo
create table if not exists public.grupos (
  id uuid default uuid_generate_v4() primary key,
  nombre text unique not null, -- Ej: "1-A", "3-B"
  tutor_id uuid references auth.users(id), -- Usuario asignado como tutor
  ciclo_escolar text default '2025-2026',
  creado_en timestamptz default now()
);

-- 2. Crear tabla de ASIGNACIONES (Profesores -> Grupos)
-- Sirve para saber qué maestros dan clase a qué grupos
create table if not exists public.asignaciones_profesor (
  id uuid default uuid_generate_v4() primary key,
  profesor_id uuid references auth.users(id) on delete cascade not null,
  grupo_id uuid references public.grupos(id) on delete cascade not null,
  materia text not null, -- Ej: "Matemáticas", "Historia"
  unique(profesor_id, grupo_id, materia) -- Evitar duplicados
);

-- 3. Personalización de Dashboard
-- Agregamos una columna para guardar preferencias (JSON)
alter table public.perfiles_usuario 
add column if not exists preferencias_dashboard jsonb default '{}';

-- 4. Actualizar políticas de seguridad (RLS)
alter table public.grupos enable row level security;
alter table public.asignaciones_profesor enable row level security;

-- Políticas Grupos
create policy "Todos pueden ver grupos" on public.grupos for select using (auth.role() = 'authenticated');
create policy "Solo admin crea grupos" on public.grupos for insert with check (
  exists (select 1 from public.perfiles_usuario where id = auth.uid() and rol in ('directivo', 'admin'))
);

-- Políticas Asignaciones
create policy "Todos pueden ver asignaciones" on public.asignaciones_profesor for select using (auth.role() = 'authenticated');
