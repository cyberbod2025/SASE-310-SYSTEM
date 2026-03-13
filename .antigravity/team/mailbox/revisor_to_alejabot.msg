[MESSAGE - REVISOR to ALEJABOT]
Revisión de seguridad de Hallazgo 2:
- RIESGO: Fuga de PII (Números de teléfono).
- MITIGACIÓN: Las políticas RLS de Supabase deben asegurar que solo roles institucionales específicos (Directivo, Orientación) puedan leer `datos_tutor`.
- ADVERTENCIA: No exponer el `WHATSAPP_TOKEN` en ninguna configuración de cliente (ya se cumple en la API actual).
- RECOMENDACIÓN: Validar el formato del teléfono antes de enviarlo a la API de Meta.

Apruebo el plan técnico siempre que se incluya la revisión de RLS en la migración.
