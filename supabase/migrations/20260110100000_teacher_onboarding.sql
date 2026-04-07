-- Migration: 20260110_teacher_onboarding_v2.sql

-- 1. Extend perfiles_usuario table with Institutional SASE fields
alter table public.perfiles_usuario 
add column if not exists estado_cuenta text default 'pendiente', -- pendiente, activo, rechazado, suspendido
add column if not exists matricula_sase text unique, -- El ID público (ej. DOC-310-024)
add column if not exists curp text, 
add column if not exists telefono text,
add column if not exists materias text,
add column if not exists turno text,
add column if not exists rol_solicitado text,
add column if not exists es_tutor boolean default false,
add column if not exists observaciones text,
add column if not exists email text,
add column if not exists permisos jsonb default '{}'::jsonb, -- Alcances: { registrar: true, editar: false, etc }
add column if not exists validado_por uuid references auth.users(id),
add column if not exists fecha_validacion timestamptz;

-- 2. Update trigger function to populate comprehensive profile
create or replace function public.manejar_nuevo_usuario() 
returns trigger as $$
begin
  insert into public.perfiles_usuario (
      id, 
      nombre_completo, 
      rol, 
      estado_cuenta,
      curp,
      email,
      rol_solicitado,
      materias,
      turno,
      telefono,
      es_tutor,
      observaciones
  )
  values (
      new.id, 
      new.raw_user_meta_data->>'full_name', 
      'docente', -- Default safe role until validation
      'pendiente', 
      new.raw_user_meta_data->>'curp', 
      new.email,
      new.raw_user_meta_data->>'rol_solicitado',
      new.raw_user_meta_data->>'materias',
      new.raw_user_meta_data->>'turno',
      new.raw_user_meta_data->>'telefono',
      (new.raw_user_meta_data->>'es_tutor')::boolean,
      new.raw_user_meta_data->>'observaciones'
  )
  on conflict (id) do update set
      nombre_completo = excluded.nombre_completo,
      email = excluded.email,
      rol_solicitado = excluded.rol_solicitado,
      curp = excluded.curp;
  return new;
end;
$$ language plpgsql;
