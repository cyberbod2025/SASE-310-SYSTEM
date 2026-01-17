# SASE Pilot - QA Audit & UX Check

**Fecha:** 16 de Enero de 2026  
**Auditor:** Antigravity (Simulando Usuario Docente/Directivo)  
**Versión:** 2.4.0 (Pilot)

## Resumen Ejecutivo

El sistema presenta una identidad visual sólida y "premium" acorde a los requisitos. La experiencia de entrada (Intro + Login) es fluida. Sin embargo, existen inconsistencias funcionales en los dashboards secundarios (Promotora, Orientación) donde muchos botones son meramente visuales sin feedback claro. El flujo crítico de **Registro de Incidencias** funciona correctamente, incluyendo las nuevas alertas contextuales de protocolo.

---

## 1. Video Intro & Login

| Elemento                 | Estado | Observación                                            |
| :----------------------- | :----: | :----------------------------------------------------- |
| **Carga de Video**       | 🟢 OK  | Carga rápido, buena calidad visual.                    |
| **Botón "Saltar Intro"** | 🟢 OK  | Ubicación correcta (top-right), funcional.             |
| **Transición a Login**   | 🟢 OK  | Fade-in suave, se siente integrado.                    |
| **Login Institucional**  | 🟢 OK  | Campos claros. Botón "π" oculto funciona.              |
| **Solicitar Registro**   | 🟢 OK  | Abre formulario de registro de personal correctamente. |

---

## 2. Dashboards y Navegación (Rol por Rol)

### 🧭 Navegación General (OrbMenu)

- **Visibilidad:** Impactante, animaciones fluidas.
- **Confusión Potencial:** El botón **"Registro de Usuarios"** aparece prominentemente para todos los roles.
  - _Riesgo:_ Un docente no debería ver/usar esto como acción primaria.
  - _Recomendación:_ Ocultar para roles no administrativos o mover a sección secundaria.

### 👨‍🏫 Rol: Docente (`DashboardDocente`)

- **Primer Impacto:** Claro. Se entiende que es "su grupo".
- **Tarjetas de Alumno:** Visualmente bien, pero **NO son clickeables**.
  - _Problema:_ No se puede ver el detalle/expediente del alumno desde aquí.
- **Alertas:** Lista de "Alertas del Grupo" visualmente clara, pero no interactiva.
- **Botones Rápidos:** "Registrar Incidencia" funciona perfecto.

### 🏢 Rol: Dirección (`DashboardDireccion`)

- **KPIs:** Claros y útiles (Data derivada real).
- **Focos de Atención:** Muy útil para detectar problemas de golpe.
- **Checklist:** Funcional pero efímero (se borra al recargar).
- **Módulos Admin:** "Aprobaciones" conecta bien. "Próximos Módulos" correctamente deshabilitado.

### 📚 Rol: Promotora de Lectura (`DashboardPromotora`)

- **Estado:** 🟡 **Prototipo Visual High-Fidelity**.
- **Funcionalidad:** Limitada.
  - Botones "Nuevo Registro", "Agendar Cita", "Subir Evidencia" **no hacen nada**.
  - No hay feedback al hacer click (ni siquiera un `alert` en algunos casos).
  - _Recomendación:_ Agregar `toast("Próximamente")` o deshabilitar visualmente para no frustrar.

### 🧠 Rol: Orientación (`DashboardOrientacion`)

- **Estado:** 🟢 Funcionalidad Mixta.
- **Nuevo Widget:** Protocolos de Apoyo funciona correctamente (abre modal).
- **Botones:** "Solicitar Reporte" lleva al módulo correcto. "Imprimir" usa simulación (OK para piloto).

---

## 3. Auditoría de Botones (Muestra Representativa)

| Ubicación     | Botón / Texto          | Acción Esperada | Acción Real                                | Estado |
| :------------ | :--------------------- | :-------------- | :----------------------------------------- | :----: |
| **Docente**   | "Registrar Incidencia" | Abrir modal     | Abre Modal QuickRegister                   |   🟢   |
| **Docente**   | "Ver Cronograma"       | Ver fechas      | **Ninguna** (Muerto)                       |   🔴   |
| **Docente**   | "Modo Tutor"           | Cambiar vista   | Toggle State (Funciona)                    |   🟢   |
| **Docente**   | Student Card (Click)   | Ver Perfil      | **Ninguna**                                |   🔴   |
| **Dirección** | "Exportar Informe"     | Descargar PDF   | Abre diálogo de impresión (Simulado)       |   🟡   |
| **Promotora** | "+ Nuevo Registro"     | Formulario      | **Ninguna**                                |   🔴   |
| **Promotora** | "Agendar Cita"         | Formulario      | **Ninguna**                                |   🔴   |
| **General**   | "Registro de Usuarios" | Admin/Registro  | Navega a Inscripciones (Confuso ubicación) |   🟡   |

---

## 4. Flujos Complejos

### ✅ 1. Registrar Incidencia (Docente)

- **Inicio:** Botón "Registrar Incidencia".
- **Búsqueda:** Autocomplete de alumnos funciona rápido.
- **Contexto:** Al seleccionar "Salud" o "Conducta", aparece sugerencia de protocolo (NUEVO). **Funciona**.
- **Guardado:** Feedback visual "Misión Completada" o "Registrado". Tono Gamificado en Demo Mode.
- **Resultado:** 🟢 **Éxito**. Flujo más sólido del sistema.

### ⚠️ 2. Consultar Expediente Alumno

- **Ruta:** Dashboard Docente -> Click en Alumno.
- **Resultado:** 🔴 **Bloqueo**. No hay enlace desde la tarjeta del alumno al perfil completo.
- _Workaround:_ Ir a "Reportes" -> "Lista". Muy largo.

### ⚠️ 3. Gestión de Lectura (Promotora)

- **Ruta:** Dashboard Promotora -> Avances.
- **Resultado:** 🔴 **Bloqueo**. Solo lectura. No se pueden ingresar datos reales en el piloto.

---

## 5. Mensajes del Sistema (Tone Check)

- **Asistente AI:** Mensajes como _"Patrón detectado: 5 retardos en 3º B"_ son excelentes. Dan valor real.
- **Modales:** Textos claros.
- **Errores:** _"Verifique sus credenciales"_ (Estándar).

---

## 6. Recomendaciones Mínimas (Quick Wins)

1.  **Conectar Tarjetas de Alumno (Docente):** Agregar un `onClick` que abra un modal básico o navegue al perfil del alumno. Es la acción más intuitiva y actualmente falla.
2.  **Feedback en Botones Muertos:** Poner un `toast.success("Función disponible en versión final")` a los botones de Promotora y "Ver Cronograma" para que no parezca roto.
3.  **Ocultar Registro de Usuarios:** En `OrbNavigation`, envolver el botón de "Registro de Usuarios" en una condición `if (role === SECRETARIA || role === DIRECTIVO)`.
4.  **Typo en Logo:** Verificar nombre de archivo `DIRECION.png` vs `DIRECCION.png` para asegurar carga (aunque actualmente carga si el archivo se llama así).

---

**Clasificación Final del Piloto:**
🚀 **Listo para Demo Guiada.**
⚠️ **Precaución en uso libre:** Usuarios exploradores encontrarán botones sin acción en dashboards secundarios.
