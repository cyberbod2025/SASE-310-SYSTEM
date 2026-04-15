# Checklist - Auditoria de Secretos y Operacion Sensible

- Buscar claves hardcodeadas en scripts, wrappers, tests, docs y archivos de config.
- Buscar credenciales de servicios externos, service role, tokens y URLs sensibles.
- Verificar `.env.example` vs variables reales usadas por el codigo.
- Verificar scripts que muten datos reales o apunten a entornos hospedados.
- Verificar wrappers de testing, MCPs o automatizacion con claves embebidas.
- Verificar que secretos no entren en commits, docs o archivos temporales.
- Si se detectan secretos reales: retirar del repo, recomendar rotacion y pasar a entorno seguro.
