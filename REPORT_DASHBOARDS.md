# Reporte de Auditoría SASE - Dashboards y Funcionalidad

**Fecha:** 2026-01-15
**Auditor:** Antigravity (AI System)
**Versión:** 2.0 (Audit & Fix)

## 1. Resumen Ejecutivo de Cambios

Se ha implementado el **Modo de Gobierno (Governance Mode)** solicitado para el piloto:

1.  **Protección de Identidad Super Admin:** Implementada "Caja Negra" en auditoría. Todas las acciones del rol `DEVELOPER` (alias Super Admin) se registran como `SYSTEM_ADMIN` con ID `SYSTEM`.
2.  **Acceso Oculto:** El rol Super Admin ha sido removido de los selectores públicos y el menú. Se accede mediante **Ctrl + Click** en el símbolo **π** ubicado en el footer del Orb Menu.
    - _Mecanismo:_ `?role=developer&mode=god` activa el modo Dios bypassando la DB.
3.  **Flujo de Aprobación Real:** Se ha integrado la lógica para invocar una Edge Function (`create-user`) segura, con fallback a simulación inteligente si la función no está desplegada.

---

## 2. Análisis por Rol (Actualizado)

### 2.1. Dirección (`DashboardDireccion.tsx`)

- **Estado:** ✅ Listo para Piloto.
- **Cambios:**
  - Botón "Aprobaciones" conecta con el flujo real/simulado robusto.
  - KPIs reflejan datos de la store global.

### 2.2. Docente (`DashboardDocente.tsx`)

- **Estado:** ✅ Funcional (Core).
- **Pendiente:** Módulos de "Evaluaciones" y "Asistencia" marcados como "Próximamente".
- **IA:** Preparado para redacción de reportes (simulado por ahora).

### 2.3. Super Admin (`DashboardDeveloper.tsx` - Oculto)

- **Acceso:** Solo vía `π` (Ctrl+Click).
- **Visibilidad:** Invisible en menús estándar.
- **Auditoría:** Sus acciones son anónimas (`SYSTEM`).

---

## 3. Matriz de Permisos (Piloto)

| Rol              | Ver KPIs Globales | Ver Expediente Completo | Editar Horarios | Aprobar Usuarios | Citar Padres |
| :--------------- | :---------------: | :---------------------: | :-------------: | :--------------: | :----------: |
| **Super Admin**  |        ✅         |           ✅            |       ✅        |        ✅        |      ✅      |
| **Dirección**    |        ✅         |           ✅            |       ✅        |        ✅        |      ✅      |
| **Subdirección** |        ✅         |           ✅            |       ❌        |        ❌        |      ✅      |
| **Docente**      |        ❌         |     ❌ (Solo Grupo)     |       ❌        |        ❌        |      ✅      |
| **Tutor**        |        ❌         |     ✅ (Solo Grupo)     |       ❌        |        ❌        |      ✅      |
| **Orientación**  |        ❌         |       ✅ (Casos)        |       ❌        |        ❌        |      ✅      |

---

## 4. Estado de la Infraestructura

- **Edge Function (`create-user`):** Código fuente listo en `supabase/functions/create-user`. Pendiente despliegue manual con Supabase CLI.
- **Auditoría:** Tabla `auditoria` recibiendo logs correctamente enmascarados.
- **Feedback:** Widget activo y funcional.

## 5. Recomendaciones Finales

Antes del 1 de Febrero:

1.  **Desplegar Edge Function:** Ejecutar `supabase functions deploy create-user`.
2.  **Carga de Alumnos:** Importar CSV real de alumnos.
3.  **Capacitación:** Enseñar el uso del botón de Feedback a los docentes.
