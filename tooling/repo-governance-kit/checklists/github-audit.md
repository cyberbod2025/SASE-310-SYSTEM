# Checklist - Auditoria GitHub y CI

- Revisar `.github/workflows/*`.
- Verificar orden real de CI vs scripts del repo.
- Verificar version fija de runtimes y CLIs; evitar `latest` si afecta estabilidad.
- Verificar si `lint`, `type-check`, `test` y `build` realmente se ejecutan.
- Verificar si algun workflow silencia fallos con `|| echo` o patrones similares.
- Verificar duplicidad de workflows o gates solapados.
- Verificar `paths`, `concurrency`, `timeout-minutes` y triggers.
- Verificar chequeos de secretos, dependencias y surfaces sensibles.
- Verificar si CI cubre solo una parte del repo y documentar huecos.
- Registrar comandos exactos de verificacion que un agente debe replicar localmente.
