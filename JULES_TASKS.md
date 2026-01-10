# Tareas de Verificación para Jules (QA & Performance)

## 1. Verificación de Optimización (Módulo Reportes)

> **Contexto:** Se implementó una optimización O(N) en la generación de reportes de asistencia.

- [ ] Navegar al módulo **Reportes**.
- [ ] Seleccionar el reporte de **Asistencia**.
- [ ] Cambiar rápidamente entre los filtros de "Semana", "Mes" y "Año".
- [ ] **Objetivo:** Confirmar que la actualización de la tabla es instantánea y no hay "lag" perceptible, incluso con el conjunto de datos completo.

## 2. Prueba de Nueva Página 404 (Diseño Matrix)

- [ ] Intentar navegar a una ruta inexistente (ej: `/ruta-falsa`).
- [ ] **Verificar Visual:**
  - ¿Se reproduce el video de fondo (`404.mp4`)?
  - ¿El texto "404" y "Falla del Sistema" es legible sobre el video?
  - ¿La animación de "glitch" o estilos CSS están activos?
- [ ] **Verificar Funcionalidad:**
  - Clic en el botón **"Regresar al Sistema"**.
  - Debe redirigir correctamente al Dashboard principal sin recargar la app completa.

## 3. Flujo de Usuario End-to-End (Smoke Test)

- [ ] **Login:** Iniciar sesión como `DOCENTE`.
- [ ] **Navegación:** Ir a "Capturar Notas" -> Regresar al Dashboard.
- [ ] **Interacción:** Abrir el menú de usuario -> Cerrar Sesión.
- [ ] **Objetivo:** Asegurar que los cambios recientes en `App.tsx` (lazy loading) no rompieron la navegación básica.

## 4. Auditoría de Código (Opcional)

- [ ] Revisar `components/NotFound.tsx` para asegurar que el video tiene los atributos `muted`, `loop`, `playsInline` (crítico para autoplay en Chrome).
