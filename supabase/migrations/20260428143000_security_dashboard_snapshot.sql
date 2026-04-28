-- SASE-310: snapshot seguro para Dashboard de Seguridad.
-- RPC publico SECURITY INVOKER + lector privado con validacion por perfiles_usuario.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.is_security_dashboard_admin(p_user_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = pg_catalog, public
stable
as $$
  select exists (
    select 1
    from public.perfiles_usuario p
    where p.id = p_user_id
      and lower(trim(p.rol::text)) in ('directivo', 'system_admin', 'developer', 'admin')
      and coalesce(p.estado_cuenta, 'activo') = 'activo'
      and coalesce(p.seguridad_status, 'active') = 'active'
  );
$$;

create or replace function private.get_security_dashboard_snapshot(p_user_id uuid default auth.uid())
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, storage
stable
as $$
declare
  v_authorized boolean := false;
  v_generated_at timestamptz := now();
  v_status text := 'ok';
  v_critical_count integer := 0;
  v_warning_count integer := 0;
  v_open_policies jsonb := '[]'::jsonb;
  v_open_policy_count integer := 0;
  v_storage_policies jsonb := '[]'::jsonb;
  v_storage_policy_count integer := 0;
  v_sensitive_rls jsonb := '[]'::jsonb;
  v_sensitive_rls_count integer := 0;
  v_public_tables_without_rls jsonb := '[]'::jsonb;
  v_public_tables_without_rls_count integer := 0;
  v_public_definer_anon jsonb := '[]'::jsonb;
  v_public_definer_anon_count integer := 0;
  v_public_definer_auth jsonb := '[]'::jsonb;
  v_public_definer_auth_count integer := 0;
  v_active_alerts jsonb := '[]'::jsonb;
  v_active_alert_count integer := 0;
  v_storage_buckets jsonb := '[]'::jsonb;
  v_legacy_surfaces jsonb := '[]'::jsonb;
  v_legacy_surface_count integer := 0;
begin
  v_authorized := private.is_security_dashboard_admin(p_user_id);

  if v_authorized is not true then
    return jsonb_build_object(
      'authorized', false,
      'generatedAt', v_generated_at,
      'overallStatus', 'unauthorized',
      'counts', jsonb_build_object(
        'criticalFindings', 0,
        'warningFindings', 0,
        'activeAlerts', 0
      ),
      'sections', jsonb_build_object()
    );
  end if;

  select coalesce(jsonb_agg(payload order by sort_key), '[]'::jsonb), count(*)::integer
  into v_open_policies, v_open_policy_count
  from (
    select
      schemaname || '.' || tablename || ' | ' || policyname as sort_key,
      jsonb_build_object(
        'severidad', 'critical',
        'area', 'RLS',
        'objeto', schemaname || '.' || tablename,
        'detalle', policyname || ' | ' || cmd,
        'riesgo', 'Policy permisiva con USING/WITH CHECK exactamente true.',
        'accion', 'Reemplazar true por una condicion basada en rol, duenio o alcance institucional.'
      ) as payload
    from pg_policies
    where permissive = 'PERMISSIVE'
      and cmd <> 'SELECT'
      and (
        regexp_replace(lower(coalesce(qual, '')), '[[:space:]()]', '', 'g') = 'true'
        or regexp_replace(lower(coalesce(with_check, '')), '[[:space:]()]', '', 'g') = 'true'
      )
  ) q;

  select coalesce(jsonb_agg(payload order by sort_key), '[]'::jsonb), count(*)::integer
  into v_storage_policies, v_storage_policy_count
  from (
    select
      policyname as sort_key,
      jsonb_build_object(
        'severidad', 'critical',
        'area', 'Storage',
        'objeto', 'storage.objects',
        'detalle', policyname || ' | ' || roles::text,
        'riesgo', 'Policy SELECT permite listado amplio de bucket publico.',
        'accion', 'Mantener lectura por ruta conocida o por owner/rol, sin SELECT amplio sobre objetos.'
      ) as payload
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and cmd = 'SELECT'
      and roles && array['public'::name, 'anon'::name, 'authenticated'::name]
      and (
        regexp_replace(lower(coalesce(qual, '')), '[[:space:]()]', '', 'g') = 'true'
        or regexp_replace(lower(coalesce(qual, '')), '[[:space:]()]', '', 'g') in (
          'bucket_id=''avatars''::text',
          'bucket_id=''documentos_salud''::text'
        )
      )
  ) q;

  select coalesce(jsonb_agg(payload order by sort_key), '[]'::jsonb), count(*)::integer
  into v_sensitive_rls, v_sensitive_rls_count
  from (
    with critical_tables(tablename) as (
      values
        ('alertas_emergencia'),
        ('atenciones_medicas'),
        ('auditoria'),
        ('documentos_institucionales'),
        ('salud'),
        ('seguimiento_social'),
        ('socioeconomico_privado')
    )
    select
      'public.' || c.tablename as sort_key,
      jsonb_build_object(
        'severidad', 'critical',
        'area', 'RLS',
        'objeto', 'public.' || c.tablename,
        'detalle', 'RLS disabled',
        'riesgo', 'Tabla sensible expuesta sin RLS activo.',
        'accion', 'Habilitar RLS y crear policies TO authenticated con filtros institucionales.'
      ) as payload
    from critical_tables c
    join pg_class r on r.relname = c.tablename
    join pg_namespace n on n.oid = r.relnamespace
    where n.nspname = 'public'
      and r.relkind = 'r'
      and r.relrowsecurity = false
  ) q;

  select coalesce(jsonb_agg(payload order by sort_key), '[]'::jsonb), count(*)::integer
  into v_public_tables_without_rls, v_public_tables_without_rls_count
  from (
    select
      schemaname || '.' || tablename as sort_key,
      jsonb_build_object(
        'severidad', 'warning',
        'area', 'RLS',
        'objeto', schemaname || '.' || tablename,
        'detalle', 'RLS disabled',
        'riesgo', 'Tabla en schema public sin defensa RLS.',
        'accion', 'Habilitar RLS o justificar que no se expone a Data API.'
      ) as payload
    from pg_tables
    where schemaname = 'public'
      and tablename not in (
        select relname from pg_class where relrowsecurity = true
      )
  ) q;

  select coalesce(jsonb_agg(payload order by sort_key), '[]'::jsonb), count(*)::integer
  into v_public_definer_anon, v_public_definer_anon_count
  from (
    select
      n.nspname || '.' || p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')' as sort_key,
      jsonb_build_object(
        'severidad', 'critical',
        'area', 'Funciones',
        'objeto', n.nspname || '.' || p.proname,
        'detalle', pg_get_function_identity_arguments(p.oid),
        'riesgo', 'SECURITY DEFINER ejecutable por anon/public.',
        'accion', 'Revocar EXECUTE de anon/public o mover logica privilegiada a schema privado.'
      ) as payload
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where p.prosecdef = true
      and n.nspname = 'public'
      and (
        has_function_privilege('anon', p.oid, 'EXECUTE')
        or has_function_privilege('public', p.oid, 'EXECUTE')
      )
  ) q;

  select coalesce(jsonb_agg(payload order by sort_key), '[]'::jsonb), count(*)::integer
  into v_public_definer_auth, v_public_definer_auth_count
  from (
    select
      n.nspname || '.' || p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')' as sort_key,
      jsonb_build_object(
        'severidad', 'warning',
        'area', 'Funciones',
        'objeto', n.nspname || '.' || p.proname,
        'detalle', pg_get_function_identity_arguments(p.oid),
        'riesgo', 'SECURITY DEFINER en public ejecutable por authenticated.',
        'accion', 'Mantener solo si es RPC operacional; preferir wrapper invoker + core privado.'
      ) as payload
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where p.prosecdef = true
      and n.nspname = 'public'
      and has_function_privilege('authenticated', p.oid, 'EXECUTE')
  ) q;

  select coalesce(jsonb_agg(payload order by sort_key desc), '[]'::jsonb)
  into v_active_alerts
  from (
    select
      created_at as sort_key,
      jsonb_build_object(
        'severidad', coalesce(severity, 'medium'),
        'area', 'Alertas SASE',
        'objeto', coalesce(type, 'security'),
        'detalle', message,
        'riesgo', 'Alerta de seguridad activa sin resolver.',
        'accion', 'Revisar actor, resolver causa raiz y marcar como atendida.'
      ) as payload
    from public.sase_alerts
    where resolved = false
    order by created_at desc
    limit 12
  ) q;

  select count(*)::integer
  into v_active_alert_count
  from public.sase_alerts
  where resolved = false;

  select coalesce(jsonb_agg(payload order by sort_key), '[]'::jsonb)
  into v_storage_buckets
  from (
    select
      b.id as sort_key,
      jsonb_build_object(
        'severidad', case when b.public then 'warning' else 'info' end,
        'area', 'Storage',
        'objeto', b.id,
        'detalle', case when b.public then 'bucket publico' else 'bucket privado' end,
        'riesgo', case when b.public then 'Requiere policies SELECT estrictas para evitar listado.' else 'Sin exposicion publica directa.' end,
        'accion', 'Validar policies en storage.objects antes de publicar rutas.'
      ) as payload
    from storage.buckets b
  ) q;

  select coalesce(jsonb_agg(payload order by sort_key), '[]'::jsonb), count(*)::integer
  into v_legacy_surfaces, v_legacy_surface_count
  from (
    select
      table_schema || '.' || table_name as sort_key,
      jsonb_build_object(
        'severidad', 'warning',
        'area', 'Identidad',
        'objeto', table_schema || '.' || table_name,
        'detalle', 'superficie legacy presente',
        'riesgo', 'Puede divergir de perfiles_usuario como fuente de verdad.',
        'accion', 'Mantener solo como fallback legado y auditar grants/RLS.'
      ) as payload
    from information_schema.tables
    where table_schema = 'public'
      and table_name in ('profiles', 'user_profiles')
  ) q;

  v_critical_count := v_open_policy_count
    + v_storage_policy_count
    + v_sensitive_rls_count
    + v_public_definer_anon_count;

  v_warning_count := v_public_tables_without_rls_count
    + v_public_definer_auth_count
    + v_legacy_surface_count;

  if v_critical_count > 0 then
    v_status := 'critical';
  elsif v_warning_count > 0 or v_active_alert_count > 0 then
    v_status := 'warning';
  else
    v_status := 'ok';
  end if;

  return jsonb_build_object(
    'authorized', true,
    'generatedAt', v_generated_at,
    'overallStatus', v_status,
    'counts', jsonb_build_object(
      'criticalFindings', v_critical_count,
      'warningFindings', v_warning_count,
      'activeAlerts', v_active_alert_count,
      'openPolicies', v_open_policy_count,
      'storageBroadPolicies', v_storage_policy_count,
      'sensitiveTablesWithoutRls', v_sensitive_rls_count,
      'publicTablesWithoutRls', v_public_tables_without_rls_count,
      'publicDefinerAnon', v_public_definer_anon_count,
      'publicDefinerAuthenticated', v_public_definer_auth_count,
      'legacySurfaces', v_legacy_surface_count
    ),
    'sections', jsonb_build_object(
      'activeAlerts', v_active_alerts,
      'openPolicies', v_open_policies,
      'storageBroadPolicies', v_storage_policies,
      'sensitiveTablesWithoutRls', v_sensitive_rls,
      'publicTablesWithoutRls', v_public_tables_without_rls,
      'publicDefinerAnon', v_public_definer_anon,
      'publicDefinerAuthenticated', v_public_definer_auth,
      'storageBuckets', v_storage_buckets,
      'legacySurfaces', v_legacy_surfaces,
      'manualChecks', jsonb_build_array(
        jsonb_build_object(
          'severidad', 'warning',
          'area', 'Auth',
          'objeto', 'Proteccion de contrasenas filtradas',
          'detalle', 'No se puede validar por SQL en este proyecto.',
          'riesgo', 'Debe confirmarse en Supabase Dashboard.',
          'accion', 'Activar manualmente en Auth > Settings > Leaked Password Protection.'
        )
      )
    )
  );
end;
$$;

create or replace function public.get_security_dashboard_snapshot()
returns jsonb
language sql
security invoker
set search_path = pg_catalog, public, private
stable
as $$
  select private.get_security_dashboard_snapshot(auth.uid());
$$;

revoke all on function private.is_security_dashboard_admin(uuid) from public;
revoke all on function private.get_security_dashboard_snapshot(uuid) from public;
revoke all on function public.get_security_dashboard_snapshot() from public, anon, authenticated;

grant execute on function private.is_security_dashboard_admin(uuid) to authenticated;
grant execute on function private.get_security_dashboard_snapshot(uuid) to authenticated;
grant execute on function public.get_security_dashboard_snapshot() to authenticated;

comment on function public.get_security_dashboard_snapshot() is
  'Devuelve un snapshot de postura de seguridad para roles SASE elevados. Wrapper invoker sin privilegios propios.';
