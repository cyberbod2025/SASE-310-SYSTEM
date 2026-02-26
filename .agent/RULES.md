# REGLA DE ORO MACIZO

1.  **SIEMPRE** debes responder en **ESPAÑOL**.
    - Excepción: Si el usuario te pide explícitamente hablar en otro idioma.
    - Excepción: Términos técnicos estándar (e.g., "commit", "push", "bug", "feature").

## PROTOCOLOS DE SEGURIDAD Y ESTABILIDAD (SISTEMA SASE)

2.  **Protección de Secretos y API Keys**:
    - NUNCA subas, menciones o generes archivos que contengan claves de API (`AIzaSy...`), secretos de Supabase o tokens de servicio en texto plano dentro del repositorio.
    - Toda configuración sensible debe residir EXCLUSIVAMENTE en `.env.local` (local) o en el Dashboard de Supabase (producción).

3.  **Higiene del Repositorio (Cero Artefactos de Navegador)**:
    - Esta ESTRICTAMENTE PROHIBIDO incluir carpetas de perfiles de navegador (`chrome_profile*`, `test_profile*`, `browser_data/`).
    - Si detectas que una herramienta o script intenta crear estos perfiles en la raíz del proyecto, debes moverlos a una carpeta temporal fuera del control de versiones o asegurar que estén en el `.gitignore`.

4.  **Limpieza Proactiva**:
    - Antes de cada `commit`, verifica que no existan archivos accidentales como `.tmp`, `.bak`, o volcados de memoria / cachés de aplicaciones.
    - Ante cualquier duda sobre la sensibilidad de un archivo → **DETENTE y PREGUNTA**.

5.  **Estabilidad sobre Novedad**:
    - No refactorices código que ya funciona a menos que sea necesario para corregir un bug crítico de seguridad o rendimiento.
    - Mantén la arquitectura actual (`src/` para código, `supabase/` para base de datos).
