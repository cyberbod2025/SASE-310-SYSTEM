#!/bin/bash

echo "🚀 AGENTE: Test Login SASE"

# 1. Verificar servidor
echo "🔎 Verificando servidor en http://localhost:3000..."

if curl -s http://localhost:3000 > /dev/null; then
  echo "✅ Servidor activo"
else
  echo "❌ Servidor no responde. Levántalo primero (npm run dev)"
  exit 1
fi

# 2. Simular primera visita (limpieza localStorage no se puede desde bash)
echo "🧠 Simulando primera visita (manual en navegador)"

# 3. Análisis con IA del flujo
echo "🤖 Analizando flujo de login con Gemma..."

PROMPT="
Actúa como QA experto.

Sistema: SASE-310
Stack: React + Supabase

Valida:
- flujo de login
- manejo de sesión
- posibles errores en primera visita
- problemas con roles

Responde:
- errores críticos
- mejoras
- estado (PASS/FAIL)
"

echo "$PROMPT" | ollama run gemma4:e2b

echo "🏁 Test terminado"
