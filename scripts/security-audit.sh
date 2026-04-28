#!/usr/bin/env bash
# SASE-310: auditoria de seguridad Supabase de solo lectura.

set -euo pipefail

CI_MODE=0
if [ "${1:-}" = "--ci" ]; then
  CI_MODE=1
fi

CRITICAL_COUNT=0
WARNING_COUNT=0

echo "🔐 SASE SECURITY AUDIT"
echo "===================================="

if ! command -v psql >/dev/null 2>&1; then
  echo "❌ psql no está instalado en este entorno"
  exit 1
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "❌ DATABASE_URL no definida"
  echo "👉 Exporta: export DATABASE_URL='postgresql://...'"
  exit 1
fi

query() {
  local sql="$1"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -qAt -c "$sql"
}

record_findings() {
  local title="$1"
  local sql="$2"
  local severity="${3:-warning}"
  local result count

  echo ""
  echo "$title"

  if ! result="$(query "$sql")"; then
    echo "❌ Error ejecutando consulta de auditoría"
    CRITICAL_COUNT=$((CRITICAL_COUNT + 1))
    return
  fi

  if [ -z "$result" ]; then
    echo "✅ Sin hallazgos"
    return
  fi

  echo "$result"
  count="$(printf '%s\n' "$result" | sed '/^$/d' | wc -l | tr -d ' ')"
  if [ "$severity" = "critical" ]; then
    CRITICAL_COUNT=$((CRITICAL_COUNT + count))
  else
    WARNING_COUNT=$((WARNING_COUNT + count))
  fi
}

record_findings \
  "🔍 CRÍTICO: Policies con USING/WITH CHECK exactamente true..." \
  "
SELECT schemaname || '.' || tablename || ' | ' || policyname
FROM pg_policies
WHERE permissive = 'PERMISSIVE'
  AND cmd <> 'SELECT'
  AND (
    regexp_replace(lower(coalesce(qual, '')), '[[:space:]()]', '', 'g') = 'true'
    OR regexp_replace(lower(coalesce(with_check, '')), '[[:space:]()]', '', 'g') = 'true'
  )
ORDER BY 1;
" \
  "critical"

record_findings \
  "🪣 CRÍTICO: Buckets públicos con listado amplio..." \
  "
SELECT policyname || ' | ' || roles::text || ' | ' || coalesce(qual, '')
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND cmd = 'SELECT'
  AND roles && ARRAY['public'::name, 'anon'::name, 'authenticated'::name]
  AND (
    regexp_replace(lower(coalesce(qual, '')), '[[:space:]()]', '', 'g') = 'true'
    OR regexp_replace(lower(coalesce(qual, '')), '[[:space:]()]', '', 'g') IN (
      'bucket_id=''avatars''::text',
      'bucket_id=''documentos_salud''::text'
    )
  )
ORDER BY 1;
" \
  "critical"

record_findings \
  "🚨 CRÍTICO: Tablas ultra sensibles sin RLS activo..." \
  "
WITH critical_tables(tablename) AS (
  VALUES
    ('alertas_emergencia'),
    ('atenciones_medicas'),
    ('auditoria'),
    ('documentos_institucionales'),
    ('salud'),
    ('seguimiento_social'),
    ('socioeconomico_privado')
)
SELECT 'public.' || c.tablename || ' | RLS disabled'
FROM critical_tables c
JOIN pg_class r ON r.relname = c.tablename
JOIN pg_namespace n ON n.oid = r.relnamespace
WHERE n.nspname = 'public'
  AND r.relkind = 'r'
  AND r.relrowsecurity = false
ORDER BY 1;
" \
  "critical"

record_findings \
  "🚨 CRÍTICO: Policies abiertas en tablas ultra sensibles..." \
  "
SELECT schemaname || '.' || tablename || ' | ' || policyname || ' | ' || cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'alertas_emergencia',
    'atenciones_medicas',
    'auditoria',
    'documentos_institucionales',
    'salud',
    'seguimiento_social',
    'socioeconomico_privado'
  )
  AND permissive = 'PERMISSIVE'
  AND roles && ARRAY['public'::name, 'anon'::name, 'authenticated'::name]
  AND (
    regexp_replace(lower(coalesce(qual, '')), '[[:space:]()]', '', 'g') = 'true'
    OR regexp_replace(lower(coalesce(with_check, '')), '[[:space:]()]', '', 'g') = 'true'
  )
ORDER BY 1;
" \
  "critical"

record_findings \
  "🚨 CRÍTICO: SECURITY DEFINER ejecutable por anon/public..." \
  "
SELECT n.nspname || '.' || p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')'
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE p.prosecdef = true
  AND n.nspname = 'public'
  AND (
    has_function_privilege('anon', p.oid, 'EXECUTE')
    OR has_function_privilege('public', p.oid, 'EXECUTE')
  )
ORDER BY 1;
" \
  "critical"

record_findings \
  "⚠️ WARNING: SECURITY DEFINER ejecutable por authenticated..." \
  "
SELECT n.nspname || '.' || p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')'
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE p.prosecdef = true
  AND n.nspname = 'public'
  AND has_function_privilege('authenticated', p.oid, 'EXECUTE')
ORDER BY 1;
"

record_findings \
  "🔐 WARNING: Funciones ejecutables por PUBLIC/AUTHENTICATED..." \
  "
SELECT routine_schema || '.' || routine_name || ' | ' || grantee || ' | ' || privilege_type
FROM information_schema.role_routine_grants
WHERE lower(grantee) IN ('public', 'authenticated')
ORDER BY 1;
"

record_findings \
  "🪣 INFO: Policies en storage.objects..." \
  "
SELECT policyname || ' | ' || roles::text || ' | ' || COALESCE(qual, '')
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
ORDER BY 1;
"

record_findings \
  "⚠️ WARNING: Tablas public sin RLS activo..." \
  "
SELECT schemaname || '.' || tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT IN (
    SELECT relname FROM pg_class WHERE relrowsecurity = true
  )
ORDER BY 1;
"

record_findings \
  "⚠️ WARNING: Superficies legacy de perfil presentes..." \
  "
SELECT table_schema || '.' || table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'user_profiles')
ORDER BY 1;
"

record_findings \
  "⚠️ WARNING: Columnas URL sensibles que requieren validación de acceso..." \
  "
SELECT table_schema || '.' || table_name || ' | ' || column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name ILIKE '%url%'
ORDER BY 1;
"

record_findings \
  "⚠️ WARNING: Columnas JSONB para revisar validación de payload..." \
  "
SELECT table_schema || '.' || table_name || ' | ' || column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND data_type = 'jsonb'
ORDER BY 1;
"

record_findings \
  "⚠️ WARNING: Tablas clave sin trigger de auditoría detectable..." \
  "
WITH watched_tables(tablename) AS (
  VALUES
    ('alumnos'),
    ('atenciones_medicas'),
    ('calificaciones'),
    ('documentos_institucionales'),
    ('incidencias'),
    ('objetos_retenidos'),
    ('salud'),
    ('seguimiento_social'),
    ('socioeconomico_privado')
)
SELECT 'public.' || w.tablename || ' | sin trigger auditoria/log detectable'
FROM watched_tables w
JOIN pg_class c ON c.relname = w.tablename
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND NOT EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_proc p ON p.oid = t.tgfoid
    WHERE t.tgrelid = c.oid
      AND t.tgisinternal = false
      AND (
        t.tgname ILIKE '%audit%'
        OR p.proname ILIKE '%audit%'
        OR p.proname ILIKE 'log_%'
      )
  )
ORDER BY 1;
"

echo ""
echo "🪣 Buckets conocidos para revisión manual:"
echo " - avatars"
echo " - documentos_salud"
echo "SQL owner/admin para cerrar listado público: supabase/sql/storage_public_listing_fix.sql"

echo ""
echo "===================================="
echo "Críticos: $CRITICAL_COUNT"
echo "Warnings: $WARNING_COUNT"

if [ "$CI_MODE" -eq 1 ] && [ "$CRITICAL_COUNT" -gt 0 ]; then
  echo "❌ Auditoría falló por hallazgos críticos"
  exit 1
fi

echo "✅ Auditoría completada (solo lectura)"
