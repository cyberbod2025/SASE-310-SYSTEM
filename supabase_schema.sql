-- Esquema de Base de Datos SASE-310 (Versión en Español)
-- Ejecuta este script en el Editor SQL de Supabase

-- 1. Habilitar extensión UUID
create extension if not exists "uuid-ossp";

-- 2. Crear tabla ALUMNOS
create table if not exists public.alumnos (
  id uuid default uuid_generate_v4() primary key,
  matricula text unique not null,
  nombre_completo text not null,
  grupo text not null, 
  avatar_url text,
  datos_tutor jsonb, 
  datos_bap jsonb default '{"tiene_bap": false}', 
  modificado_por uuid references auth.users(id),
  modificado_en timestamptz default now(),
  creado_en timestamptz default now()
);

-- 3. Crear tabla INCIDENCIAS
create table if not exists public.incidencias (
  id uuid default uuid_generate_v4() primary key,
  alumno_id uuid references public.alumnos(id) on delete cascade not null,
  tipo text not null, 
  descripcion text,
  fecha timestamptz default now(),
  reportado_por uuid references auth.users(id), 
  creado_en timestamptz default now()
);

-- 4. Crear tabla JUSTIFICANTES
create table if not exists public.justificantes (
  id uuid default uuid_generate_v4() primary key,
  alumno_id uuid references public.alumnos(id) on delete cascade not null,
  folio text,
  fecha_inicio date,
  fecha_fin date,
  motivo text, 
  descripcion text,
  emitido_por uuid references auth.users(id),
  creado_en timestamptz default now()
);

-- 5. Crear tabla AUDITORIA (Historial de cambios)
create table if not exists public.auditoria (
  id uuid default uuid_generate_v4() primary key,
  usuario_id uuid references auth.users(id),
  email_usuario text,
  rol_usuario text,
  tipo_accion text not null, 
  descripcion_accion text,
  tabla_objetivo text,
  id_registro_objetivo text,
  nombre_alumno_objetivo text,
  valores_anteriores jsonb,
  nuevos_valores jsonb,
  creado_en timestamptz default now()
);

-- 6. Crear tabla SALUD
create table if not exists public.salud (
  id uuid default uuid_generate_v4() primary key,
  alumno_id uuid references public.alumnos(id) on delete cascade,
  padecimiento text not null,
  documento_url text,
  creado_en timestamptz default now()
);

-- 7. HABILITAR SEGURIDAD A NIVEL DE FILA (RLS)
alter table public.alumnos enable row level security;
alter table public.incidencias enable row level security;
alter table public.justificantes enable row level security;
alter table public.auditoria enable row level security;
alter table public.salud enable row level security;

-- 8. POLÍTICAS DE SEGURIDAD (Eliminar primero para evitar errores de duplicidad)

-- Alumnos
drop policy if exists "Personal puede ver alumnos" on public.alumnos;
create policy "Personal puede ver alumnos" on public.alumnos for select using (auth.role() = 'authenticated');

drop policy if exists "Personal puede actualizar alumnos" on public.alumnos;
create policy "Personal puede actualizar alumnos" on public.alumnos for update using (auth.role() = 'authenticated');

drop policy if exists "Personal puede registrar alumnos" on public.alumnos;
create policy "Personal puede registrar alumnos" on public.alumnos for insert with check (auth.role() = 'authenticated');

-- Incidencias
drop policy if exists "Personal puede ver incidencias" on public.incidencias;
create policy "Personal puede ver incidencias" on public.incidencias for select using (auth.role() = 'authenticated');

drop policy if exists "Personal puede crear incidencias" on public.incidencias;
create policy "Personal puede crear incidencias" on public.incidencias for insert with check (auth.role() = 'authenticated');

-- Justificantes
drop policy if exists "Personal puede ver justificantes" on public.justificantes;
create policy "Personal puede ver justificantes" on public.justificantes for select using (auth.role() = 'authenticated');

drop policy if exists "Personal puede crear justificantes" on public.justificantes;
create policy "Personal puede crear justificantes" on public.justificantes for insert with check (auth.role() = 'authenticated');

-- Auditoría
drop policy if exists "Personal puede registrar auditoria" on public.auditoria;
create policy "Personal puede registrar auditoria" on public.auditoria for insert with check (auth.role() = 'authenticated');

drop policy if exists "Admins pueden ver auditoria" on public.auditoria;
create policy "Admins pueden ver auditoria" on public.auditoria for select using (
  exists (
    select 1 from public.perfiles_usuario
    where id = auth.uid() and rol = 'directivo'
  )
);

-- Salud
drop policy if exists "Personal puede ver salud" on public.salud;
create policy "Personal puede ver salud" on public.salud for select using (auth.role() = 'authenticated');

drop policy if exists "Personal puede actualizar salud" on public.salud;
create policy "Personal puede actualizar salud" on public.salud for update using (auth.role() = 'authenticated');

drop policy if exists "Personal puede registrar salud" on public.salud;
create policy "Personal puede registrar salud" on public.salud for insert with check (auth.role() = 'authenticated');

-- 9. PERFILES DE USUARIO
create table if not exists public.perfiles_usuario (
  id uuid references auth.users(id) primary key,
  rol text default 'docente', 
  nombre_completo text
);
alter table public.perfiles_usuario enable row level security;

drop policy if exists "Usuarios ven su propio perfil" on public.perfiles_usuario;
create policy "Usuarios ven su propio perfil" on public.perfiles_usuario for select using (auth.uid() = id);

-- Función disparadora (Trigger) para nuevos usuarios
create or replace function public.manejar_nuevo_usuario() 
returns trigger as $$
begin
  insert into public.perfiles_usuario (id, nombre_completo, rol)
  values (new.id, new.raw_user_meta_data->>'full_name', 'docente')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql;

-- Trigger para ejecutar la función
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.manejar_nuevo_usuario();
