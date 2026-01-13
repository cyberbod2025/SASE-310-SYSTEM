-- =====================================================
-- SASE-310: Sistema Institucional de Alta de Personal
-- Migración: Compatible con schema existente
-- =====================================================

-- 1) CREAR TABLA: Solicitudes de Alta de Personal
create table if not exists public.solicitudes_alta_personal (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz not null default now(),

  -- Identidad institucional
  matricula_sase text null, -- Autogenerada
  rol_solicitado text[] not null,
  turno text not null check (turno in ('matutino','vespertino','mixto')),

  -- Datos sensibles
  nombres text not null,
  apellido_paterno text not null,
  apellido_materno text not null,
  curp text not null check (length(curp) = 18),
  correo_institucional text not null,
  telefono text null check (telefono is null or length(telefono) = 10),

  -- Info académica
  materias text[] null,
  grupos text[] null,
  es_tutor boolean not null default false,
  grupo_tutor text null,
  area_cobertura text null,
  observaciones text null,

  -- Consentimientos legales
  acepta_privacidad boolean not null default false,
  acepta_etica boolean not null default false,
  acepta_auditoria boolean not null default false,

  -- Flujo de aprobación
  estado text not null default 'PENDIENTE'
    check (estado in ('PENDIENTE','APROBADA','RECHAZADA','OBSERVACIONES')),
  observaciones_validacion text null,

  -- Auditoría de aprobación
  aprobado_por uuid references auth.users(id),
  aprobado_en timestamptz null,
  
  -- Metadata
  metadata jsonb not null default '{}'::jsonb
);

-- Índices para solicitudes
create index if not exists idx_solicitudes_estado on public.solicitudes_alta_personal(estado);
create index if not exists idx_solicitudes_curp on public.solicitudes_alta_personal(curp);
create index if not exists idx_solicitudes_matricula on public.solicitudes_alta_personal(matricula_sase);

-- 2) EXTENDER perfiles_usuario con columnas SASE
alter table public.perfiles_usuario 
add column if not exists matricula_sase text,
add column if not exists alcances jsonb default '{
  "can_view_names": false,
  "can_register": false,
  "can_edit": false,
  "can_close": false,
  "can_escalate": false,
  "can_view_audit": false,
  "can_approve_staff": false
}'::jsonb,
add column if not exists estado_cuenta text default 'activo' 
  check (estado_cuenta in ('activo','suspendido','inactivo','pendiente')),
add column if not exists curp text,
add column if not exists telefono text,
add column if not exists email text,
add column if not exists materias text[],
add column if not exists grupos text[],
add column if not exists turno text,
add column if not exists es_tutor boolean default false,
add column if not exists grupo_tutor text,
add column if not exists updated_at timestamptz default now();

-- Índice único para matricula_sase
create unique index if not exists idx_perfiles_matricula_sase on public.perfiles_usuario(matricula_sase) where matricula_sase is not null;

-- 3) NO TOCAR tabla auditoria existente
-- Ya tiene: usuario_id, email_usuario, rol_usuario, tipo_accion, descripcion_accion, etc.
-- Solo vamos a usarla como está

-- 4) FUNCIÓN: Generar Matrícula SASE automática
create or replace function public.generar_matricula_sase()
returns text as $$
declare
  nuevo_numero int;
  nueva_matricula text;
  max_solicitudes int;
  max_perfiles int;
begin
  -- Buscar el máximo en solicitudes
  select coalesce(max(
    cast(substring(matricula_sase from 9) as int)
  ), 0)
  into max_solicitudes
  from public.solicitudes_alta_personal
  where matricula_sase like 'EMP-310-%';
  
  -- Buscar el máximo en perfiles
  select coalesce(max(
    cast(substring(matricula_sase from 9) as int)
  ), 0)
  into max_perfiles
  from public.perfiles_usuario
  where matricula_sase like 'EMP-310-%';
  
  -- Tomar el mayor de los dos y sumar 1
  nuevo_numero := greatest(max_solicitudes, max_perfiles) + 1;
  
  -- Formatear con padding de 3 dígitos
  nueva_matricula := 'EMP-310-' || lpad(nuevo_numero::text, 3, '0');
  
  return nueva_matricula;
end;
$$ language plpgsql;

-- 5) TRIGGER: Auto-asignar matrícula en solicitudes
create or replace function public.auto_assign_matricula()
returns trigger as $$
begin
  if new.matricula_sase is null or new.matricula_sase = '' or new.matricula_sase like 'TEMP-%' then
    new.matricula_sase := public.generar_matricula_sase();
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_auto_matricula on public.solicitudes_alta_personal;
create trigger trigger_auto_matricula
  before insert on public.solicitudes_alta_personal
  for each row
  execute function public.auto_assign_matricula();

-- 6) FUNCIÓN HELPER: Registrar en auditoría (compatible con estructura existente)
create or replace function public.registrar_auditoria_sase(
  p_usuario_id uuid,
  p_email text,
  p_rol text,
  p_tipo_accion text,
  p_descripcion text,
  p_tabla text default null,
  p_id_registro text default null
) returns uuid as $$
declare
  audit_id uuid;
begin
  insert into public.auditoria (
    usuario_id,
    email_usuario,
    rol_usuario,
    tipo_accion,
    descripcion_accion,
    tabla_objetivo,
    id_registro_objetivo
  ) values (
    p_usuario_id,
    p_email,
    p_rol,
    p_tipo_accion,
    p_descripcion,
    p_tabla,
    p_id_registro
  ) returning id into audit_id;
  
  return audit_id;
end;
$$ language plpgsql;

-- 7) ROW LEVEL SECURITY para solicitudes

alter table public.solicitudes_alta_personal enable row level security;

-- Policy: Dirección puede ver solicitudes
drop policy if exists "Dirección ve solicitudes" on public.solicitudes_alta_personal;
create policy "Dirección ve solicitudes"
  on public.solicitudes_alta_personal
  for select
  using (
    exists (
      select 1 from public.perfiles_usuario
      where id = auth.uid()
      and rol in ('directivo', 'direccion', 'subdireccion')
    )
  );

-- Policy: Permitir creación anónima (para el registro inicial)
drop policy if exists "Permitir crear solicitud" on public.solicitudes_alta_personal;
create policy "Permitir crear solicitud"
  on public.solicitudes_alta_personal
  for insert
  with check (true);

-- Policy: Solo Dirección actualiza (aprobar/rechazar)
drop policy if exists "Dirección actualiza solicitudes" on public.solicitudes_alta_personal;
create policy "Dirección actualiza solicitudes"
  on public.solicitudes_alta_personal
  for update
  using (
    exists (
      select 1 from public.perfiles_usuario
      where id = auth.uid()
      and rol in ('directivo', 'direccion', 'subdireccion')
    )
  );

-- 8) COMENTARIOS
comment on table public.solicitudes_alta_personal is 'Solicitudes de alta institucional pendientes de validación';
comment on column public.perfiles_usuario.matricula_sase is 'Identificador SASE público (EMP-310-XXX)';
comment on column public.perfiles_usuario.alcances is 'Permisos granulares JSON';

-- 9) Registrar migración en auditoría
insert into public.auditoria (
  tipo_accion,
  descripcion_accion,
  tabla_objetivo
) values (
  'MIGRACION_SISTEMA',
  'Sistema institucional SASE implementado: solicitudes de alta, matrícula SASE, alcances granulares',
  'solicitudes_alta_personal'
);

-- ✅ Migración completada
