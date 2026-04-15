#!/usr/bin/env bash
set -euo pipefail

API_KEY_VALUE="${TESTSPRITE_API_KEY:-${API_KEY:-}}"

if [ -z "$API_KEY_VALUE" ]; then
  echo "TestSprite MCP: falta TESTSPRITE_API_KEY (o API_KEY) en el entorno." >&2
  exit 1
fi

export API_KEY="$API_KEY_VALUE"

TESTSPRITE_NPX="/home/hugo_system/.nvm/versions/node/v24.14.1/bin/npx"

if [ ! -x "$TESTSPRITE_NPX" ]; then
  echo "TestSprite MCP: no se encontró npx de Node 24 en $TESTSPRITE_NPX" >&2
  exit 1
fi

exec "$TESTSPRITE_NPX" -y @testsprite/testsprite-mcp@0.0.37 "$@"
