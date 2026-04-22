#!/usr/bin/env bash
set -euo pipefail

# Intentar cargar desde .env.local si existe
if [ -f ".env.local" ]; then
  # Extraer SUPABASE_ACCESS_TOKEN si existe
  TOKEN_FROM_ENV=$(grep "^SUPABASE_ACCESS_TOKEN=" .env.local | cut -d'=' -f2- | tr -d '"' | tr -d "'")
  if [ -n "$TOKEN_FROM_ENV" ]; then
    export SUPABASE_ACCESS_TOKEN="$TOKEN_FROM_ENV"
  fi
fi

# El token puede venir ya en el entorno
ACCESS_TOKEN="${SUPABASE_ACCESS_TOKEN:-}"

if [ -z "$ACCESS_TOKEN" ]; then
  echo "Supabase MCP Error: Falta SUPABASE_ACCESS_TOKEN en el entorno o en .env.local" >&2
  echo "Obtén uno en: https://supabase.com/dashboard/account/tokens" >&2
  exit 1
fi

# Ejecutar el servidor MCP oficial de Supabase
# Usamos npx para asegurar que esté disponible
exec npx -y @supabase/mcp-server-supabase@latest "$@"
