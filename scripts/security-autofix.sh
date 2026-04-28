#!/usr/bin/env bash
# SASE-310: autofix interactivo de seguridad Supabase.
# No ejecuta cambios sin confirmacion explicita.

set -euo pipefail

DRY_RUN=${DRY_RUN:-false}
FAIL_ON_CRITICAL=${FAIL_ON_CRITICAL:-false}
LOG_DIR=${SECURITY_LOG_DIR:-logs}
LOG_FILE="$LOG_DIR/security-autofix-$(date +%Y%m%d-%H%M%S).log"

mkdir -p "$LOG_DIR"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "SASE SECURITY AUTOFIX (modo seguro)"
echo "===================================="
echo "Modo DRY_RUN: $DRY_RUN | Fecha: $(date)"
echo "Log: $LOG_FILE"

if ! command -v psql >/dev/null 2>&1; then
  echo "ERROR: psql no esta instalado en este entorno"
  exit 1
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL no definida"
  echo "Exporta: export DATABASE_URL='postgresql://...'"
  exit 1
fi

if [ ! -t 0 ] && [ "$DRY_RUN" != "true" ]; then
  echo "ERROR: este script requiere terminal interactiva para confirmar cambios"
  exit 1
fi

psql_query() {
  local sql="$1"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -qAt -c "$sql"
}

psql_apply() {
  local sql="$1"
  if [ "$DRY_RUN" = "true" ]; then
    echo "DRY RUN: no se ejecuta SQL"
    echo "$sql"
    return 0
  fi

  printf '%s\n' "$sql" | psql "$DATABASE_URL" -v ON_ERROR_STOP=1
}

confirm() {
  local prompt="$1"
  local ans
  read -r -p "$prompt (y/N): " ans
  [[ "$ans" == "y" || "$ans" == "Y" ]]
}

confirm_high_risk() {
  local prompt="$1"
  local ans
  echo "$prompt"
  read -r -p "Escribe APLICAR para continuar: " ans
  [[ "$ans" == "APLICAR" ]]
}

show_and_apply() {
  local title="$1"
  local generator_sql="$2"
  local mode="${3:-normal}"
  local commands

  echo ""
  echo "$title"
  commands="$(psql_query "$generator_sql" || true)"

  if [ -z "$commands" ]; then
    echo "OK: no hay cambios propuestos"
    return 0
  fi

  echo "SQL propuesto:"
  echo "$commands"
  echo ""

  if [ "$DRY_RUN" = "true" ]; then
    psql_apply "$commands"
    echo "Omitido por DRY_RUN=true."
    return 0
  fi

  if [ "$mode" = "high" ]; then
    if confirm_high_risk "ALTO RIESGO: puede afectar UI, RLS o modulos externos."; then
      psql_apply "$commands"
      echo "Aplicado."
    else
      echo "Omitido."
    fi
    return 0
  fi

  if confirm "Aplicar este bloque"; then
    psql_apply "$commands"
    echo "Aplicado."
  else
    echo "Omitido."
  fi
}

echo ""
echo "1) Policies con USING/WITH CHECK siempre true"
show_and_apply \
  "Eliminar solo policies cuyo qual/with_check sea exactamente true" \
  "
SELECT format('DROP POLICY IF EXISTS %I ON %I.%I;', policyname, schemaname, tablename)
FROM pg_policies
WHERE permissive = 'PERMISSIVE'
  AND cmd <> 'SELECT'
  AND (
    regexp_replace(lower(coalesce(qual, '')), '[[:space:]()]', '', 'g') = 'true'
    OR regexp_replace(lower(coalesce(with_check, '')), '[[:space:]()]', '', 'g') = 'true'
  )
ORDER BY schemaname, tablename, policyname;
"

echo ""
echo "2) Helpers SECURITY DEFINER candidatos a SECURITY INVOKER"
echo "Nota: este bloque es opcional. Si un helper se usa dentro de RLS, prueba antes en staging."
show_and_apply \
  "Cambiar helpers allowlist a SECURITY INVOKER" \
  "
SELECT format(
  'ALTER FUNCTION %I.%I(%s) SECURITY INVOKER;',
  n.nspname,
  p.proname,
  pg_get_function_identity_arguments(p.oid)
)
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.prosecdef = true
  AND p.proname IN ('get_my_role', 'get_my_role_text', 'get_my_rol_safe', 'get_user_role')
ORDER BY p.proname;
" \
  "high"

echo ""
echo "3) Revocar EXECUTE anon/public en SECURITY DEFINER"
show_and_apply \
  "Cerrar superficie publica/anon sin tocar authenticated" \
  "
SELECT format(
  'REVOKE EXECUTE ON FUNCTION %I.%I(%s) FROM anon, public;',
  n.nspname,
  p.proname,
  pg_get_function_identity_arguments(p.oid)
)
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.prosecdef = true
  AND (
    has_function_privilege('anon', p.oid, 'EXECUTE')
    OR has_function_privilege('public', p.oid, 'EXECUTE')
  )
ORDER BY p.proname;
"

echo ""
echo "4) Revocar EXECUTE authenticated en RPCs criticos conocidos"
echo "Nota: puede romper frontend o modulos externos si todavia llaman estos RPCs directo."
show_and_apply \
  "Cerrar authenticated en funciones criticas allowlist" \
  "
SELECT format(
  'REVOKE EXECUTE ON FUNCTION %I.%I(%s) FROM authenticated;',
  n.nspname,
  p.proname,
  pg_get_function_identity_arguments(p.oid)
)
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.prosecdef = true
  AND has_function_privilege('authenticated', p.oid, 'EXECUTE')
  AND p.proname IN (
    'ejecutar_promocion',
    'registrar_progreso_v2',
    'finalizar_trivia_v2',
    'increment_visitantes',
    'decrement_visitantes'
  )
ORDER BY p.proname;
" \
  "high"

echo ""
echo "5) Storage"
echo "Storage no se corrige automaticamente desde este script."
echo "Aplicar desde un contexto owner/admin de storage.objects si el Advisor lo reporta."
cat <<'SQL'

-- avatars: evita listado publico, mantiene acceso por propietario.
drop policy if exists "Avatar public read" on storage.objects;

create policy "avatars_read_safe"
on storage.objects
for select
using (
  bucket_id = 'avatars'
  and owner_id = auth.uid()::text
);

-- documentos_salud: acceso por rol institucional sensible.
drop policy if exists "Allow public read documents" on storage.objects;

create policy "salud_read_safe"
on storage.objects
for select
using (
  bucket_id = 'documentos_salud'
  and exists (
    select 1
    from public.perfiles_usuario p
    where p.id = auth.uid()
      and p.rol in ('medico_escolar', 'directivo', 'subdireccion', 'admin', 'system_admin')
  )
);
SQL

echo ""
echo "===================================="
if [ "$FAIL_ON_CRITICAL" = "true" ]; then
  echo "Validando riesgos críticos con scripts/security-audit.sh --ci..."
  "$(dirname "$0")/security-audit.sh" --ci
fi

echo "Log guardado en $LOG_FILE"
echo "Autofix terminado. Ejecuta scripts/security-audit.sh para validar."
