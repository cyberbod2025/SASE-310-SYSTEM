-- 1. Fix Advisors: Add table comments to satisfy 'docs_description_missing'
comment on table public.justificantes is 'Almacena los justificantes de inasistencia de los alumnos.';
comment on table public.alumnos is 'Tabla principal de información de estudiantes.';
comment on table public.audit_log is 'Registro de auditoría de acciones del sistema.';
comment on table public.profiles is 'Perfiles de usuario extendidos manejados por la aplicación.';
comment on table public.roles_permisos is 'Definición de permisos por rol de usuario.';
comment on table public.sandbox_alertas is 'Tabla temporal para alertas en entorno sandbox (pruebas).';

-- 2. Fix Advisors: Add RLS policies to tables that have RLS enabled but no policies
-- audit_log
-- Permitir que cualquier usuario autenticado inserte registros (log de acciones)
drop policy if exists "Auth users insert audit" on public.audit_log;
create policy "Auth users insert audit" on public.audit_log
    for insert to authenticated with check (true);

-- Permitir lectura a usuarios autenticados (para reportes o dashboard)
drop policy if exists "Auth users view audit" on public.audit_log;
create policy "Auth users view audit" on public.audit_log
    for select to authenticated using (true);

-- profiles
-- Permitir leer todos los perfiles (necesario para mostrar nombres en UI)
drop policy if exists "Auth users view all profiles" on public.profiles;
create policy "Auth users view all profiles" on public.profiles
    for select to authenticated using (true);

-- Permitir actualizar solo el propio perfil
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles
    for update to authenticated using (auth.uid() = id);

-- roles_permisos
-- Lectura publica para autenticados (para saber qué permisos tienen)
drop policy if exists "Auth users view roles" on public.roles_permisos;
create policy "Auth users view roles" on public.roles_permisos
    for select to authenticated using (true);

-- 3. Fix Agenda: Create 'eventos' table
create table if not exists public.eventos (
    id uuid not null default gen_random_uuid() primary key,
    titulo text not null,
    fecha date not null,
    hora time,
    tipo text not null check (tipo in ('reunion', 'entrega', 'evento', 'evaluacion', 'festivo')),
    descripcion text,
    creado_por uuid references auth.users(id) default auth.uid(),
    creado_en timestamptz default now()
);

-- Enable RLS on admin events
alter table public.eventos enable row level security;

-- Add comment
comment on table public.eventos is 'Almacena eventos de la agenda escolar.';

-- Policies for eventos
drop policy if exists "Ver eventos" on public.eventos;
create policy "Ver eventos" on public.eventos
    for select to authenticated using (true);

drop policy if exists "Crear eventos" on public.eventos;
create policy "Crear eventos" on public.eventos
    for insert to authenticated with check (auth.uid() = creado_por);

drop policy if exists "Modificar eventos propios" on public.eventos;
create policy "Modificar eventos propios" on public.eventos
    for update to authenticated using (auth.uid() = creado_por);

drop policy if exists "Eliminar eventos propios" on public.eventos;
create policy "Eliminar eventos propios" on public.eventos
    for delete to authenticated using (auth.uid() = creado_por);

-- 4. Fix Sandbox Alertas (Ensure policies exist if flagged by advisor)
alter table public.sandbox_alertas enable row level security;

drop policy if exists "Sandbox full access" on public.sandbox_alertas;
create policy "Sandbox full access" on public.sandbox_alertas
    for all to authenticated using (true) with check (true);
