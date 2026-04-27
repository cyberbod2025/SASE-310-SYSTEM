-- Matrícula Inteligente + Cierre de Ciclo: Schema base
-- Crea las tablas de ciclos escolares, alumno_ciclo y asignación,
-- con backfill del ciclo actual, trigger de sincronización y RLS.

-- ════════════════════════════════════════════════════════════════
-- 1. TABLAS
-- ════════════════════════════════════════════════════════════════

-- 1.1 Ciclos escolares
create table if not exists public.ciclos_escolares (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null,
  activo     boolean not null default false,
  fecha_inicio date,
  fecha_fin    date,
  created_at timestamptz not null default now(),
  constraint ciclos_escolares_nombre_unique unique (nombre)
);

comment on table public.ciclos_escolares is
  'Catálogo de ciclos escolares institucionales. Solo uno puede estar activo.';

-- 1.2 Registro alumno×ciclo (historial inmutable por ciclo cerrado)
create table if not exists public.alumno_ciclo (
  id              uuid primary key default gen_random_uuid(),
  alumno_id       uuid not null references public.alumnos(id) on delete cascade,
  ciclo_id        uuid not null references public.ciclos_escolares(id) on delete restrict,
  grado           integer not null check (grado between 1 and 3),
  grupo           text,
  grupo_id        uuid references public.grupos(id) on delete set null,
  estatus         text not null default 'activo'
                    check (estatus in ('activo','promovido','retenido','baja','egresado')),
  grupo_sugerido  text,
  locked          boolean not null default false,
  fecha_asignacion timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  constraint alumno_ciclo_unique unique (alumno_id, ciclo_id)
);

comment on table public.alumno_ciclo is
  'Registro por alumno por ciclo escolar. Preserva historial: los ciclos cerrados no se modifican.';

-- 1.3 Log de asignaciones de grupo (trazabilidad de movimientos)
create table if not exists public.asignacion_alumno_grupo (
  id              uuid primary key default gen_random_uuid(),
  alumno_ciclo_id uuid not null references public.alumno_ciclo(id) on delete cascade,
  grupo_id        uuid not null references public.grupos(id) on delete restrict,
  grupo_anterior  text,
  grupo_nuevo     text not null,
  asignado_por    uuid references public.perfiles_usuario(id) on delete set null,
  origen          text not null default 'manual'
                    check (origen in ('manual','ia','cierre')),
  created_at      timestamptz not null default now()
);

comment on table public.asignacion_alumno_grupo is
  'Log inmutable de movimientos de alumnos entre grupos. Cada entrada registra un cambio.';

-- ════════════════════════════════════════════════════════════════
-- 2. BACKFILL: Poblar ciclo actual desde datos existentes
-- ════════════════════════════════════════════════════════════════

-- Insertar ciclo activo basado en los grupos existentes
insert into public.ciclos_escolares (nombre, activo)
select distinct ciclo_escolar, true
from public.grupos
where ciclo_escolar is not null
limit 1
on conflict (nombre) do nothing;

-- Poblar alumno_ciclo desde snapshot de alumnos
insert into public.alumno_ciclo (alumno_id, ciclo_id, grado, grupo, grupo_id)
select
  a.id,
  c.id,
  a.grado::integer,
  a.grupo,
  g.id
from public.alumnos a
cross join public.ciclos_escolares c
left join public.grupos g
  on g.nombre = (a.grado || 'º ' || a.grupo)
  and g.ciclo_escolar = c.nombre
where c.activo = true
  and a.grado is not null
on conflict (alumno_id, ciclo_id) do nothing;

-- ════════════════════════════════════════════════════════════════
-- 3. CONSTRAINT: Solo un ciclo activo a la vez
-- ════════════════════════════════════════════════════════════════

-- Índice parcial: solo puede existir un registro con activo=true
create unique index if not exists idx_un_ciclo_activo
  on public.ciclos_escolares (activo)
  where activo = true;

-- ════════════════════════════════════════════════════════════════
-- 4. TRIGGER: Sincronizar alumno_ciclo.grupo → alumnos.grupo
--    Para compatibilidad con dashboards existentes
-- ════════════════════════════════════════════════════════════════

create or replace function public.sync_alumno_grupo_desde_ciclo()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Solo sincronizar si el ciclo está activo
  if exists (
    select 1 from public.ciclos_escolares
    where id = new.ciclo_id and activo = true
  ) then
    update public.alumnos
    set grupo = new.grupo
    where id = new.alumno_id
      and (grupo is distinct from new.grupo);
  end if;
  return new;
end;
$$;

drop trigger if exists trigger_sync_alumno_grupo on public.alumno_ciclo;

create trigger trigger_sync_alumno_grupo
  after insert or update of grupo
  on public.alumno_ciclo
  for each row
  execute function public.sync_alumno_grupo_desde_ciclo();

comment on function public.sync_alumno_grupo_desde_ciclo() is
  'Mantiene alumnos.grupo sincronizado con alumno_ciclo.grupo del ciclo activo para compatibilidad con dashboards.';

-- ════════════════════════════════════════════════════════════════
-- 5. RPC: simular_promocion — Read-only
-- ════════════════════════════════════════════════════════════════

create or replace function public.simular_promocion(p_ciclo_id uuid)
returns table (
  alumno_id       uuid,
  nombre          text,
  grado           integer,
  grupo           text,
  faltas          bigint,
  faltas_consecutivas integer,
  promedio        numeric,
  incidencias     bigint,
  bap             boolean,
  decision_sugerida text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    ac.alumno_id,
    a.nombre_completo                      as nombre,
    ac.grado,
    ac.grupo,

    -- Faltas totales (attendance_logs con estado distinto a presente)
    coalesce((
      select count(*)
      from public.attendance_logs al
      where al.alumno_id = ac.alumno_id
        and lower(al.estado) != 'presente'
    ), 0)                                  as faltas,

    -- Faltas consecutivas (gap analysis simplificado)
    coalesce((
      select max(streak)
      from (
        select count(*) as streak
        from (
          select al.fecha,
                 al.fecha - (row_number() over (order by al.fecha))::int as grp
          from public.attendance_logs al
          where al.alumno_id = ac.alumno_id
            and lower(al.estado) != 'presente'
        ) gaps
        group by grp
      ) streaks
    ), 0)::integer                         as faltas_consecutivas,

    -- Promedio de calificaciones
    coalesce((
      select round(avg(et.calificacion_final), 2)
      from public.examenes_trimestre et
      where et.nombre_alumno = a.nombre_completo
    ), 0)                                  as promedio,

    -- Total de incidencias
    coalesce((
      select count(*)
      from public.incidencias i
      where i.alumno_id = ac.alumno_id
    ), 0)                                  as incidencias,

    -- Tiene datos BAP
    (a.datos_bap is not null)              as bap,

    -- Decisión sugerida
    case
      when ac.grado = 3 then 'egresar'
      when coalesce((
        select count(*)
        from public.attendance_logs al2
        where al2.alumno_id = ac.alumno_id
          and lower(al2.estado) != 'presente'
      ), 0) >= 21 then 'baja'
      else 'promover'
    end                                    as decision_sugerida

  from public.alumno_ciclo ac
  join public.alumnos a on a.id = ac.alumno_id
  where ac.ciclo_id = p_ciclo_id
    and ac.estatus = 'activo'
  order by ac.grado, ac.grupo, a.nombre_completo;
end;
$$;

comment on function public.simular_promocion(uuid) is
  'Simulación read-only de promoción: retorna decisión sugerida por alumno sin escribir en la base.';

-- ════════════════════════════════════════════════════════════════
-- 6. RPC: ejecutar_promocion — Escribe
-- ════════════════════════════════════════════════════════════════

create or replace function public.ejecutar_promocion(
  p_ciclo_actual uuid,
  p_ciclo_nuevo  uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_alumno record;
  v_conteo_promovidos integer := 0;
  v_conteo_egresados  integer := 0;
  v_conteo_bajas      integer := 0;
  v_conteo_retenidos  integer := 0;
  v_faltas bigint;
  v_decision text;
begin
  -- Validar que el ciclo actual esté activo
  if not exists (
    select 1 from public.ciclos_escolares
    where id = p_ciclo_actual and activo = true
  ) then
    raise exception 'El ciclo actual no está activo o no existe.';
  end if;

  -- Validar que el ciclo nuevo exista y NO esté activo
  if not exists (
    select 1 from public.ciclos_escolares
    where id = p_ciclo_nuevo and activo = false
  ) then
    raise exception 'El ciclo nuevo no existe o ya está activo.';
  end if;

  -- Iterar alumnos activos del ciclo actual
  for v_alumno in
    select ac.id as alumno_ciclo_id,
           ac.alumno_id,
           ac.grado,
           ac.grupo
    from public.alumno_ciclo ac
    where ac.ciclo_id = p_ciclo_actual
      and ac.estatus = 'activo'
  loop
    -- Contar faltas
    select count(*) into v_faltas
    from public.attendance_logs al
    where al.alumno_id = v_alumno.alumno_id
      and lower(al.estado) != 'presente';

    -- Determinar decisión
    if v_alumno.grado = 3 then
      v_decision := 'egresado';
    elsif v_faltas >= 21 then
      v_decision := 'baja';
    else
      v_decision := 'promovido';
    end if;

    -- Actualizar estatus en ciclo actual (nunca borrar)
    update public.alumno_ciclo
    set estatus = v_decision
    where id = v_alumno.alumno_ciclo_id;

    -- Si promovido: insertar en nuevo ciclo con grado+1
    if v_decision = 'promovido' then
      insert into public.alumno_ciclo (alumno_id, ciclo_id, grado, estatus)
      values (v_alumno.alumno_id, p_ciclo_nuevo, v_alumno.grado + 1, 'activo')
      on conflict (alumno_id, ciclo_id) do nothing;
      v_conteo_promovidos := v_conteo_promovidos + 1;
    elsif v_decision = 'egresado' then
      v_conteo_egresados := v_conteo_egresados + 1;
    elsif v_decision = 'baja' then
      v_conteo_bajas := v_conteo_bajas + 1;
    end if;
  end loop;

  -- Cerrar ciclo actual
  update public.ciclos_escolares
  set activo = false
  where id = p_ciclo_actual;

  -- Activar ciclo nuevo
  update public.ciclos_escolares
  set activo = true
  where id = p_ciclo_nuevo;

  -- Log en auditoría
  insert into public.auditoria (
    tipo_accion,
    descripcion_accion,
    tabla_objetivo,
    old_values,
    new_values
  ) values (
    'CIERRE_CICLO',
    'Cierre de ciclo escolar y promoción de alumnos.',
    'alumno_ciclo',
    jsonb_build_object('ciclo_cerrado', p_ciclo_actual),
    jsonb_build_object(
      'ciclo_nuevo', p_ciclo_nuevo,
      'promovidos', v_conteo_promovidos,
      'egresados', v_conteo_egresados,
      'bajas', v_conteo_bajas,
      'retenidos', v_conteo_retenidos
    )
  );

  return jsonb_build_object(
    'success', true,
    'promovidos', v_conteo_promovidos,
    'egresados', v_conteo_egresados,
    'bajas', v_conteo_bajas,
    'retenidos', v_conteo_retenidos
  );
end;
$$;

comment on function public.ejecutar_promocion(uuid, uuid) is
  'Ejecuta cierre de ciclo: promueve (grado+1), egresa (3°) y da baja (≥21 faltas). Inmutable: no modifica ciclos cerrados.';

-- ════════════════════════════════════════════════════════════════
-- 7. RLS
-- ════════════════════════════════════════════════════════════════

-- 7.1 ciclos_escolares
alter table public.ciclos_escolares enable row level security;

create policy "Todos los autenticados ven ciclos"
  on public.ciclos_escolares for select
  using (auth.role() = 'authenticated');

create policy "Directivos gestionan ciclos"
  on public.ciclos_escolares for all
  using (
    public.get_my_role_text() in ('directivo','system_admin','developer')
  );

-- 7.2 alumno_ciclo
alter table public.alumno_ciclo enable row level security;

create policy "Personal lee registros de alumnos por ciclo"
  on public.alumno_ciclo for select
  using (auth.role() = 'authenticated');

create policy "Secretaria y directivos asignan alumnos en ciclo activo"
  on public.alumno_ciclo for insert
  with check (
    public.get_my_role_text() in ('secretaria','directivo','subdireccion','system_admin','developer')
    and exists (
      select 1 from public.ciclos_escolares
      where id = ciclo_id and activo = true
    )
  );

create policy "Secretaria y directivos actualizan asignaciones del ciclo activo"
  on public.alumno_ciclo for update
  using (
    public.get_my_role_text() in ('secretaria','directivo','subdireccion','system_admin','developer')
    and exists (
      select 1 from public.ciclos_escolares
      where id = ciclo_id and activo = true
    )
  );

-- 7.3 asignacion_alumno_grupo
alter table public.asignacion_alumno_grupo enable row level security;

create policy "Personal lee movimientos de grupo"
  on public.asignacion_alumno_grupo for select
  using (auth.role() = 'authenticated');

create policy "Secretaria y directivos registran movimientos"
  on public.asignacion_alumno_grupo for insert
  with check (
    public.get_my_role_text() in ('secretaria','directivo','subdireccion','system_admin','developer')
  );

-- ════════════════════════════════════════════════════════════════
-- 8. Auditoría institucional
-- ════════════════════════════════════════════════════════════════

insert into public.auditoria (
  tipo_accion,
  descripcion_accion,
  tabla_objetivo
) values (
  'MIGRACION_SISTEMA',
  'Matrícula Inteligente + Cierre de Ciclo: schema base con ciclos_escolares, alumno_ciclo, asignacion_alumno_grupo, RPCs y RLS.',
  'ciclos_escolares'
);
