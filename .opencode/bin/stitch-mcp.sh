#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CONFIG_PATH="${STITCH_MCP_CONFIG:-$ROOT_DIR/.opencode/.mcp.json}"
STITCH_URL="${STITCH_MCP_URL:-}"
STITCH_KEY="${STITCH_API_KEY:-}"

if [[ -z "$STITCH_URL" || -z "$STITCH_KEY" ]]; then
  if [[ ! -f "$CONFIG_PATH" ]]; then
    echo "Missing Stitch MCP config. Expected $CONFIG_PATH or STITCH_MCP_URL/STITCH_API_KEY env vars." >&2
    exit 1
  fi

  mapfile -t stitch_config < <(node -e "const fs=require('fs'); const config=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); const stitch=config.mcpServers?.stitch; if (!stitch?.serverUrl) { console.error('Missing mcpServers.stitch.serverUrl'); process.exit(2); } const key=stitch.headers?.['X-Goog-Api-Key']; if (!key) { console.error('Missing X-Goog-Api-Key header'); process.exit(3); } console.log(stitch.serverUrl); console.log(key);" "$CONFIG_PATH")

  STITCH_URL="${stitch_config[0]}"
  STITCH_KEY="${stitch_config[1]}"
fi

exec npx -y mcp-remote "$STITCH_URL" --header "X-Goog-Api-Key: $STITCH_KEY"
