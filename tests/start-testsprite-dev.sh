#!/usr/bin/env bash
set -euo pipefail

cd /home/hugo_system/code/SASE-310-SYSTEM

eval "$(npx supabase status -o env | grep -E '^(API_URL|ANON_KEY)=')"

export VITE_SUPABASE_URL="$API_URL"
export VITE_SUPABASE_ANON_KEY="$ANON_KEY"

nohup npm run dev -- --host 127.0.0.1 --port 3100 > .tmp-testsprite-dev.log 2>&1 &
echo $!
