#!/usr/bin/env bash
# SASE-310: simulacion ofensiva segura de solo lectura / no destructiva.

set -euo pipefail

SUPABASE_URL=${SUPABASE_URL:-${VITE_SUPABASE_URL:-}}
SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY:-${VITE_SUPABASE_ANON_KEY:-}}
ACCESS_TOKEN=${ACCESS_TOKEN:-}

echo "SASE SECURITY ATTACK SIM"
echo "========================"
echo "Fecha: $(date)"

if ! command -v curl >/dev/null 2>&1; then
  echo "ERROR: curl no esta instalado"
  exit 1
fi

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
  echo "ERROR: define SUPABASE_URL y SUPABASE_ANON_KEY"
  echo "Tambien se aceptan VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY"
  exit 1
fi

request() {
  local label="$1"
  local method="$2"
  local url="$3"
  local token="$4"
  local body="${5:-}"
  local tmp status

  tmp="$(mktemp)"
  if [ -n "$body" ]; then
    status="$(curl -sS -o "$tmp" -w '%{http_code}' \
      -X "$method" "$url" \
      -H "apikey: $SUPABASE_ANON_KEY" \
      -H "Authorization: Bearer $token" \
      -H "Content-Type: application/json" \
      --data "$body")"
  else
    status="$(curl -sS -o "$tmp" -w '%{http_code}' \
      -X "$method" "$url" \
      -H "apikey: $SUPABASE_ANON_KEY" \
      -H "Authorization: Bearer $token")"
  fi

  echo ""
  echo "$label"
  echo "HTTP $status"
  sed -e 's/[[:cntrl:]]//g' "$tmp" | cut -c 1-500
  rm -f "$tmp"

  case "$status" in
    401|403|404)
      echo "OK: bloqueo esperado"
      ;;
    200|201|204)
      echo "REVISAR: la solicitud fue permitida"
      ;;
    *)
      echo "INFO: respuesta no concluyente"
      ;;
  esac
}

ANON_TOKEN="$SUPABASE_ANON_KEY"
AUTH_TOKEN="$ACCESS_TOKEN"

echo ""
echo "Escenario 1: listar documentos_salud como anon"
request \
  "Storage list documentos_salud anon" \
  "POST" \
  "$SUPABASE_URL/storage/v1/object/list/documentos_salud" \
  "$ANON_TOKEN" \
  '{"limit":10,"offset":0,"prefix":""}'

echo ""
echo "Escenario 1B: leer tablas ultra sensibles como anon"
for table in salud atenciones_medicas seguimiento_social socioeconomico_privado auditoria; do
  request \
    "REST select $table anon" \
    "GET" \
    "$SUPABASE_URL/rest/v1/$table?select=*&limit=1" \
    "$ANON_TOKEN"
done

echo ""
echo "Escenario 2: listar avatars como anon"
request \
  "Storage list avatars anon" \
  "POST" \
  "$SUPABASE_URL/storage/v1/object/list/avatars" \
  "$ANON_TOKEN" \
  '{"limit":10,"offset":0,"prefix":""}'

echo ""
echo "Escenario 3: abuso RPC ejecutar_promocion como anon"
request \
  "RPC ejecutar_promocion anon" \
  "POST" \
  "$SUPABASE_URL/rest/v1/rpc/ejecutar_promocion" \
  "$ANON_TOKEN" \
  '{}'

if [ -n "$AUTH_TOKEN" ]; then
  echo ""
  echo "Escenario 4: abuso RPC ejecutar_promocion con ACCESS_TOKEN proporcionado"
  request \
    "RPC ejecutar_promocion authenticated" \
    "POST" \
    "$SUPABASE_URL/rest/v1/rpc/ejecutar_promocion" \
    "$AUTH_TOKEN" \
    '{}'
else
  echo ""
  echo "Escenario 4 omitido: define ACCESS_TOKEN para probar usuario autenticado normal"
fi

echo ""
echo "========================"
echo "Simulacion terminada. Revisa manualmente cualquier respuesta 200/201/204."
