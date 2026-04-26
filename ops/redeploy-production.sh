#!/usr/bin/env bash
set -euo pipefail

mkdir -p "$HOME/bin"
cat > "$HOME/bin/pnpm" <<'EOF'
#!/usr/bin/env bash
exec npx -y pnpm@10.17.1 "$@"
EOF
chmod +x "$HOME/bin/pnpm"

export PATH="$HOME/bin:$PATH"

pnpm --version
npx -y vercel build --prod --yes
npx -y vercel deploy --prebuilt --prod --yes
