#!/bin/bash
# SASE-310: Script de auditoría de migraciones SQL
# Detecta patrones peligrosos antes del despliegue

set -e

MIGRATIONS_DIR="supabase/migrations"
EXIT_CODE=0

echo "🔍 Iniciando auditoria de migraciones en $MIGRATIONS_DIR..."

# 1. Detectar DO $$ con EXECUTE dinámico (riesgo de inyección SQL)
echo "   - Buscando EXECUTE dinámico dentro de bloques DO..."
if grep -rn "DO \$\$" $MIGRATIONS_DIR -A 20 | grep -q "EXECUTE"; then
  echo "⚠️ ADVERTENCIA: Se detectó EXECUTE dinámico. Validar que no sea vulnerable a inyección."
  # No bloqueamos por defecto si es para migraciones de datos controladas, pero alertamos.
fi

# 2. Detectar DROP TABLE (riesgo de pérdida de datos)
echo "   - Buscando DROP TABLE..."
DROPS=$(grep -rn "DROP TABLE" $MIGRATIONS_DIR || true)
if [ ! -z "$DROPS" ]; then
  echo "⚠️ SE DETECTARON DROP TABLE:"
  echo "$DROPS"
  # Permitimos si es intencional, pero el pipeline debe registrar la alerta.
fi

# 3. Detectar DELETE sin WHERE (destrucción masiva de datos)
echo "   - Buscando DELETE sin WHERE..."
# Buscamos DELETE FROM tabla; (que termina en punto y coma sin WHERE previo en la misma linea o cercania)
# Este regex es una aproximacion.
BAD_DELETES=$(grep -rnE "DELETE FROM [a-zA-Z0-9_\.]+[[:space:]]*;" $MIGRATIONS_DIR || true)
if [ ! -z "$BAD_DELETES" ]; then
  echo "❌ ERROR: SE DETECTARON DELETE SIN WHERE (Peligro de borrado masivo):"
  echo "$BAD_DELETES"
  EXIT_CODE=1
fi

# 4. Validar habilitación de RLS para nuevas tablas
echo "   - Verificando RLS en tablas creadas..."
# Si hay un 'CREATE TABLE', debe haber un 'ALTER TABLE ... ENABLE ROW LEVEL SECURITY'
# Analizamos por archivo para mayor precision
for file in $MIGRATIONS_DIR/*.sql; do
  TABLES=$(grep -i "CREATE TABLE" "$file" | sed -E 's/.*CREATE TABLE (IF NOT EXISTS )?([a-zA-Z0-9_\.]+).*/\2/' || true)
  for table in $TABLES; do
    if ! grep -qi "ALTER TABLE $table ENABLE ROW LEVEL SECURITY" "$file"; then
      # A veces se habilita en otro archivo, pero alertamos si es en el mismo.
      echo "⚠️ Alerta: La tabla $table en $(basename "$file") podría no tener RLS habilitado en el mismo archivo."
    fi
  done
done

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ Auditoria de migraciones completada sin errores criticos."
else
  echo "❌ Auditoria de migraciones falló."
fi

exit $EXIT_CODE
