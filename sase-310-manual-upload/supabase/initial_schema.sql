-- SASE-310: BRAIN RECOVERY & SETUP SCRIPT v2 (MIGRATION SAFE)
-- SAFETY: This script is IDEMPOTENT. It handles existing tables by adding missing columns.
-- IT WILL: Fix "column role does not exist" error.
-- RUN THIS ENTIRE FILE IN SUPABASE SQL EDITOR.

-- ==============================================================================
-- 1. ENUMS (Safe Creation)
-- ==============================================================================

do $$ begin
    create type app_role as enum ('directivo', 'docente', 'docente_tutor', 'prefectura', 'orientacion', 'trabajo_social', 'enfermeria', 'secretaria');
exception when duplicate_object then null; end $$;

do $$ begin
    create type estado_caso_alumno as enum ('normal', 'observado', 'intervencion', 'seguimiento');
exception when duplicate_object then null; end $$;

do $$ begin
    create type tipo_incidencia as enum ('retardo', 'conducta', 'uniforme', 'otro');
exception when duplicate_object then null; end $$;

-- ==============================================================================
-- 2. TABLES & COLUMNS (Migration Safe)
-- ==============================================================================

-- PROFILES
create table if not exists public.profiles (
    id uuid references auth.users(id) on delete cascade primary key,
    created_at timestamp with time zone default now() not null
);

-- Fix: Add columns if they don't exist (Migration)
alter table public.profiles add column if not exists role app_role not null default 'docente';
alter table public.profiles add column if not exists full_name text;

-- ALUMNOS
create table if not exists public.alumnos (
    id uuid default gen_random_uuid() primary key,
    curp text unique not null,
    matricula text unique not null,
    nombre_completo text not null,
    created_at timestamp with time zone default now() not null
);

alter table public.alumnos add column if not exists grado int not null default 1;
alter table public.alumnos add column if not exists grupo text not null default 'A';
alter table public.alumnos add column if not exists tutor_escolar_id uuid references public.profiles(id);
alter table public.alumnos add column if not exists estado_caso estado_caso_alumno default 'normal' not null;

-- INCIDENCIAS
create table if not exists public.incidencias (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default now() not null
);
alter table public.incidencias add column if not exists alumno_id uuid references public.alumnos(id) not null;
alter table public.incidencias add column if not exists reportado_por uuid references public.profiles(id) not null;
alter table public.incidencias add column if not exists tipo tipo_incidencia not null;
alter table public.incidencias add column if not exists descripcion text not null;
alter table public.incidencias add column if not exists nivel_gravedad int check (nivel_gravedad between 1 and 3) not null default 1;

-- SALUD
create table if not exists public.salud (
    id uuid default gen_random_uuid() primary key,
    ultima_actualizacion timestamp with time zone default now() not null
);
alter table public.salud add column if not exists alumno_id uuid references public.alumnos(id) not null;
alter table public.salud add column if not exists padecimiento text;
alter table public.salud add column if not exists alergias text;
alter table public.salud add column if not exists medicamentos text;

-- ATENCIONES MEDICAS
create table if not exists public.atenciones_medicas (
    id uuid default gen_random_uuid() primary key,
    hora timestamp with time zone default now() not null
);
alter table public.atenciones_medicas add column if not exists alumno_id uuid references public.alumnos(id) not null;
alter table public.atenciones_medicas add column if not exists atendido_por uuid references public.profiles(id) not null;
alter table public.atenciones_medicas add column if not exists sintomas text not null;
alter table public.atenciones_medicas add column if not exists tratamiento text not null;

-- JUSTIFICANTES
create table if not exists public.justificantes (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default now() not null
);
alter table public.justificantes add column if not exists folio text unique;
alter table public.justificantes add column if not exists alumno_id uuid references public.alumnos(id) not null;
alter table public.justificantes add column if not exists start_date date;
alter table public.justificantes add column if not exists end_date date;
alter table public.justificantes add column if not exists reason text;
alter table public.justificantes add column if not exists description text;
alter table public.justificantes add column if not exists issued_by uuid references public.profiles(id) not null;

-- SOCIO GENERAL
create table if not exists public.socioeconomico_general (
    alumno_id uuid references public.alumnos(id) primary key,
    updated_at timestamp with time zone default now() not null
);
alter table public.socioeconomico_general add column if not exists nivel_ingresos text;
alter table public.socioeconomico_general add column if not exists situacion_familiar text;
alter table public.socioeconomico_general add column if not exists observaciones_generales text;

-- SOCIO PRIVADO
create table if not exists public.socioeconomico_privado (
    alumno_id uuid references public.alumnos(id) primary key,
    updated_at timestamp with time zone default now() not null
);
alter table public.socioeconomico_privado add column if not exists observaciones_restringidas text;

-- ==============================================================================
-- 3. INDEXES (If Not Exists)
-- ==============================================================================

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_alumnos_tutor on public.alumnos(tutor_escolar_id);
create index if not exists idx_incidencias_alumno on public.incidencias(alumno_id);
create index if not exists idx_salud_alumno on public.salud(alumno_id);
create index if not exists idx_justificantes_alumno on public.justificantes(alumno_id);

-- ==============================================================================
-- 4. ENABLE RLS (Safe)
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.alumnos enable row level security;
alter table public.incidencias enable row level security;
alter table public.salud enable row level security;
alter table public.atenciones_medicas enable row level security;
alter table public.justificantes enable row level security;
alter table public.socioeconomico_general enable row level security;
alter table public.socioeconomico_privado enable row level security;

-- ==============================================================================
-- 5. FUNCTION (Replace)
-- ==============================================================================

create or replace function public.get_my_role()
returns app_role as $$
declare
  _role app_role;
begin
  select role into _role from public.profiles where id = auth.uid();
  return _role; -- No secure default fallback
end;
$$ language plpgsql security definer;

-- ==============================================================================
-- 6. POLICIES (Reset & Recreate)
-- ==============================================================================

-- DROP OLD POLICIES TO AVOID CONFLICTS
do $$ begin
  drop policy if exists "Users can view own profile" on public.profiles;
  drop policy if exists "Directivos view all profiles" on public.profiles;
  
  drop policy if exists "Directivo view all students" on public.alumnos;
  drop policy if exists "Staff view all students" on public.alumnos;
  
  drop policy if exists "Directivo view incidencias" on public.incidencias;
  drop policy if exists "Directivo manage incidencias" on public.incidencias;
  drop policy if exists "Staff view incidencias" on public.incidencias;
  drop policy if exists "Docentes/Prefect create incidencias" on public.incidencias;
  
  drop policy if exists "Directivo manage salud" on public.salud;
  drop policy if exists "Enfermeria view salud" on public.salud;
  drop policy if exists "Enfermeria update salud" on public.salud;
  drop policy if exists "Enfermeria insert salud" on public.salud;
  drop policy if exists "Staff view salud" on public.salud;
  
  drop policy if exists "Enfermeria manage atenciones" on public.atenciones_medicas;
  drop policy if exists "Directivo view atenciones" on public.atenciones_medicas;
  
  drop policy if exists "TS manage justificantes" on public.justificantes;
  drop policy if exists "Directivo view justificantes" on public.justificantes;
  drop policy if exists "Tutor view justificantes" on public.justificantes;
  
  drop policy if exists "TS manage socio general" on public.socioeconomico_general;
  drop policy if exists "Directivo manage socio general" on public.socioeconomico_general;
  drop policy if exists "Staff view socio general" on public.socioeconomico_general;
  
  drop policy if exists "TS manage socio privado" on public.socioeconomico_privado;
  drop policy if exists "Directivo view socio privado" on public.socioeconomico_privado;
  drop policy if exists "Orientacion view socio privado" on public.socioeconomico_privado;
end $$;

-- --- PROFILES ---
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Directivos view all profiles" on public.profiles for select using (public.get_my_role() = 'directivo');

-- --- ALUMNOS ---
create policy "Directivo view all students" on public.alumnos for all using (public.get_my_role() = 'directivo');
create policy "Staff view all students" on public.alumnos for select using (public.get_my_role() in ('docente', 'docente_tutor', 'prefectura', 'orientacion', 'trabajo_social', 'enfermeria', 'secretaria'));

-- --- INCIDENCIAS ---
-- Se corrigio el error de 'relation ... does not exist' al asegurar las tablas antes
create policy "Directivo view incidencias" on public.incidencias for select using (public.get_my_role() = 'directivo');
create policy "Directivo manage incidencias" on public.incidencias for all using (public.get_my_role() = 'directivo');
create policy "Staff view incidencias" on public.incidencias for select using (public.get_my_role() in ('docente', 'docente_tutor', 'prefectura', 'orientacion', 'trabajo_social'));
create policy "Docentes/Prefect create incidencias" on public.incidencias for insert with check (public.get_my_role() in ('docente', 'docente_tutor', 'prefectura'));

-- --- SALUD ---
create policy "Directivo manage salud" on public.salud for all using (public.get_my_role() = 'directivo');
create policy "Enfermeria view salud" on public.salud for select using (public.get_my_role() = 'enfermeria');
create policy "Enfermeria update salud" on public.salud for update using (public.get_my_role() = 'enfermeria');
create policy "Enfermeria insert salud" on public.salud for insert with check (public.get_my_role() = 'enfermeria');
create policy "Staff view salud" on public.salud for select using (public.get_my_role() in ('docente', 'docente_tutor', 'orientacion', 'trabajo_social'));

-- --- ATENCIONES MEDICAS ---
create policy "Enfermeria manage atenciones" on public.atenciones_medicas for all using (public.get_my_role() = 'enfermeria');
create policy "Directivo view atenciones" on public.atenciones_medicas for select using (public.get_my_role() = 'directivo');

-- --- JUSTIFICANTES ---
create policy "TS manage justificantes" on public.justificantes for all using (public.get_my_role() = 'trabajo_social');
create policy "Directivo view justificantes" on public.justificantes for select using (public.get_my_role() in ('directivo', 'orientacion'));
create policy "Tutor view justificantes" on public.justificantes for select using (public.get_my_role() = 'docente_tutor');

-- --- SOCIOECONOMICO GENERAL ---
create policy "TS manage socio general" on public.socioeconomico_general for all using (public.get_my_role() = 'trabajo_social');
create policy "Directivo manage socio general" on public.socioeconomico_general for all using (public.get_my_role() = 'directivo');
create policy "Staff view socio general" on public.socioeconomico_general for select using (public.get_my_role() in ('docente', 'docente_tutor', 'orientacion'));

-- --- SOCIOECONOMICO PRIVADO ---
create policy "TS manage socio privado" on public.socioeconomico_privado for all using (public.get_my_role() = 'trabajo_social');
create policy "Directivo view socio privado" on public.socioeconomico_privado for select using (public.get_my_role() = 'directivo');
create policy "Orientacion view socio privado" on public.socioeconomico_privado for select using (public.get_my_role() = 'orientacion');
