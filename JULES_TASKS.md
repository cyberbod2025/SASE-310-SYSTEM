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
- [ ] **Navegación:** Ir al "Centro de Comando" -> Click "Tablero" -> Verificar Dashboard -> Sidebar "Inicio".
- [ ] **Interacción:** Abrir el menú de usuario -> Cerrar Sesión.
- [ ] **Objetivo:** Asegurar que el flujo entre el Menú Orbital y los Dashboards es fluido.

## 4. Auditoría Visual de Nuevos Dashboards (Cyber/Holo)

> **Contexto:** Se ha implementado un rediseño completo con tema "Holográfico/Futurista" en los módulos principales.

### Dashboard Docente:

- [ ] Iniciar sesión como `DOCENTE`.
- [ ] Verificar que el fondo tenga elementos ambientales animados ("blobs" azules/cyan).
- [ ] Hover sobre la tarjeta de un estudiante:
  - ¿Aparece el borde brillante holográfico?
  - ¿La tarjeta se eleva ligeramente?
- [ ] Verificar el "Semáforo del Grupo":
  - ¿Los puntos indicadores tienen animación de "ping" (radar)?

### Dashboard Prefectura:

- [ ] Iniciar sesión como `PREFECTURA`.
- [ ] Verificar que la estética coincida con la del Docente (glassmorphism oscuro).
- [ ] Probar el widget de "Registro Rápido":
  - ¿Los inputs tienen el estilo oscuro/transparente correcto?
  - ¿El botón de "Registrar" tiene el efecto glow azul?
- [ ] Verificar la tabla de "Actividad Reciente":
  - ¿Los iconos de alumno tienen el gradiente correcto?

### Dashboard Secretaría:

- [ ] Iniciar sesión como `SECRETARIA`.
- [ ] Verificar animación de "float" en el logo principal.
- [ ] Probar el buscador holográfico:
  - ¿El input brilla al hacer focus?
- [ ] Verificar la Tabla de Estudiantes:
  - ¿Las filas tienen efecto hover con sutil brillo cyan?
  - ¿Al hacer click en "Consultar" el panel de detalles aparece con animación suave?

### Menú Orbital (Home):

- [ ] Ir al "Centro de Comando" (Home).
- [ ] Hover sobre las esferas:
  - ¿Rotan y escalan suavemente?
  - ¿El efecto de cristal es visible?

### Dashboard Enfermería (Bio-Digital HUD):

- [ ] Iniciar sesión como `ENFERMERIA`.
- [ ] Verificar el fondo "Bio-Digital" con círculos rojos/teal y grid médico.
- [ ] **Monitor de Constantes:**
  - ¿El ticker de "ALERTAS URGENTES" parpadea en rojo?
  - ¿La tarjeta "Visitas Hoy" tiene la animación de electrocardiograma (EKG)?
- [ ] **Inventario:**
  - ¿Los items tienen barras de progreso visuales?
  - ¿Al modificar stock, los controles responden inmediatamente?

### Dashboard Orientación (Neural Network):

- [ ] Iniciar sesión como `ORIENTACION`.
- [ ] Verificar el fondo "Red Neuronal" con nodos conectados.
- [ ] **Interacciones:**
  - Hover sobre el logo 3D: ¿Gira y brilla?
  - Panel "Patrones de Riesgo": ¿Tiene el efecto de borde parpadeante "warning"?
- [ ] **Gráficos:**
  - ¿Las barras de estadísticas muestran el porcentaje al hacer hover?

### Dashboard Trabajo Social (Community Network):

- [ ] Iniciar sesión como `TRABAJO_SOCIAL`.
- [ ] Verificar el fondo con patrón hexagonal y gradientes naranja/ámbar.
- [ ] **Generador de Justificantes:**
  - ¿El formulario tiene el estilo "glass" oscuro y limpio?
  - ¿El botón "Generar y Timbrar" tiene el efecto de brillo al pasar el mouse?
- [ ] **Bitácora:**
  - ¿Los estados (Médico, Legal, Social) tienen sus colores distintivos (badges)?

### Dashboard UDEII (Structure & Support):

- [ ] Iniciar sesión como `UDEII`.
- [ ] Verificar el fondo "Structural Support" con líneas isométricas y tonos púrpura.
- [ ] **Expedientes:**
  - ¿Las tarjetas tienen el borde púrpura brillante al hacer hover?
  - ¿La sección "Diagnóstico Confidencial" tiene el estilo de bloque de datos encriptado?
- [ ] **Ajustes Razonables:**
  - ¿Se pueden agregar nuevos ajustes (simulados) con un click?

### Dashboard Dirección (Executive Command):

- [ ] Iniciar sesión como `DIRECTOR`.
- [ ] Verificar el fondo "Executive" con tonos azul profundo/oro y streams de datos.
- [ ] **KPIs Ejecutivos:**
  - ¿Las tarjetas de Asistencia/Riesgo tienen íconos grandes translúcidos de fondo?
  - ¿Los números son grandes y brillantes (typography scale)?
- [ ] **Checklist Estratégico:**
  - ¿Los checkboxes tienen el estilo personalizado (cuadrado azul al activar)?
  - ¿El texto se tacha suavemente al completar la tarea?
