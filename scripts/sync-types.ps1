Write-Host "🔄 Sincronizando tipos con Supabase..."

npx supabase gen types typescript --project-id $env:SUPABASE_PROJECT_ID | Out-File -Encoding utf8 src/supabase/types.ts

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error generando tipos"
    exit 1
}

Write-Host "✅ Tipos actualizados correctamente"