-- 1. Crear tabla solicitudes_diagnostico si no existe
create table if not exists public.solicitudes_diagnostico (
  id uuid primary key default gen_random_uuid(),
  alumno_id uuid not null,
  docente_id uuid not null,
  tipo text not null check (tipo in ('nuevo','historico')),
  estado text not null default 'pendiente' check (estado in ('pendiente','respondido','vencido')),
  fecha_inicio timestamptz,
  fecha_fin timestamptz,
  mensaje text,
  fecha_limite timestamptz,
  created_at timestamptz default now(),
  respondido_at timestamptz
);

-- 2. Añadir columna solicitud_id a diagnosticos_docentes si no existe
alter table public.diagnosticos_docentes
  add column if not exists solicitud_id uuid;

create index if not exists idx_diag_solicitud
  on public.diagnosticos_docentes(solicitud_id);

-- 3. Trigger para marcar solicitud respondida automáticamente
create or replace function public.fn_marcar_solicitud_respondida()
returns trigger
language plpgsql
as $$
begin
  if new.solicitud_id is not null then
    update public.solicitudes_diagnostico
    set estado = 'respondido',
        respondido_at = now()
    where id = new.solicitud_id
      and estado <> 'respondido';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_diag_responde on public.diagnosticos_docentes;

create trigger trg_diag_responde
  after insert on public.diagnosticos_docentes
  for each row
  execute function public.fn_marcar_solicitud_respondida();

-- 4. Validación mínima: la solicitud debe existir y pertenecer al docente
create or replace function public.fn_valida_solicitud()
returns trigger
language plpgsql
as $$
declare
  v_ok integer;
begin
  if new.solicitud_id is not null then
    select 1 into v_ok
    from public.solicitudes_diagnostico s
    where s.id = new.solicitud_id
      and s.docente_id = new.docente_id;

    if v_ok is null then
      raise exception 'Solicitud inválida para este docente' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_valida_solicitud on public.diagnosticos_docentes;

create trigger trg_valida_solicitud
  before insert on public.diagnosticos_docentes
  for each row
  execute function public.fn_valida_solicitud();

-- 5. RLS para solicitudes_diagnostico
alter table public.solicitudes_diagnostico enable row level security;

create policy "docente_ve_sus_solicitudes"
  on public.solicitudes_diagnostico
  for select
  to authenticated
  using (auth.uid() = docente_id);

create policy "docente_actualiza_sus_solicitudes"
  on public.solicitudes_diagnostico
  for update
  to authenticated
  using (auth.uid() = docente_id);

create policy "orientacion_ve_todo"
  on public.solicitudes_diagnostico
  for select
  to authenticated
  using (exists (
    select 1 from public.perfiles_usuario pu
    where pu.id = auth.uid()
      and pu.rol in ('orientacion','direccion','subdireccion','developer','system_admin')
  ));

create policy "orientacion_crea"
  on public.solicitudes_diagnostico
  for insert
  to authenticated
  with check (exists (
    select 1 from public.perfiles_usuario pu
    where pu.id = auth.uid()
      and pu.rol in ('orientacion','developer','system_admin')
  ));

-- 6. Revoke y grant para RPCs
revoke execute on function public.fn_marcar_solicitud_respondida() from anon, authenticated, public;
revoke execute on function public.fn_valida_solicitud() from anon, authenticated, public;

grant execute on function public.fn_marcar_solicitud_respondida() to service_role;
grant execute on function public.fn_valida_solicitud() to service_role;

comment on table public.solicitudes_diagnostico is 'Solicitudes de diagnóstico a docentes. Trigger automático marca respondido al insertar en diagnosticos_docentes.';
