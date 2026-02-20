# Manual de Operaciones - Modo Desarrollador (DEV / ROOT)

Este documento detalla las capacidades exclusivas del rol **DEVELOPER** (`Modo Root`) en el sistema SASE 310, diseñado para mantenimiento crítico y supervisión técnica.

---

## 1. ¿Qué es el Modo Dev?

Es el nivel de acceso más alto del sistema. Mientras que el Director gestiona la escuela, el Dev gestiona la **plataforma** misma.

- **Acceso**: Exclusivo para cuentas con rol `DEVELOPER` en la base de datos.
- **Responsabilidad**: Uso cauteloso. Las acciones aquí pueden alterar todo el sistema.

---

## 2. Capacidades y Acciones

### A. Gestión de Usuarios y Accesos

**¿Qué hace?** Permite generar invitaciones y aprobar cuentas institucionales manualmente.
**¿Cuándo usarlo?**

- Cuando el Director no puede acceder para aprobar a alguien.
- Para crear cuentas especiales (ej. auditores externos).

**Pasos:**

1.  Ingresa al Dashboard Dev.
2.  Pestaña **"Cuentas Institucionales"**.
3.  Usa el **Generador de Invitaciones** para crear accesos pre-aprobados.

### B. Bitácora de Auditoría (El "Ojo que Todo lo Ve")

**¿Qué hace?** Muestra un registro inmutable de quién hizo qué en el sistema.
**¿Cuándo usarlo?**

- Para investigar incidentes de seguridad (ej. "¿Quién borró este alumno?").
- Para verificar si un usuario realmente "intentó entrar y no pudo".

**Pasos:**

1.  Pestaña **"Bitácora de Auditoría"**.
2.  Revisa la tabla: **Acción | Descripción | Usuario | Rol | Hora**.
3.  Busca acciones críticas como `ELIMINACION` (en rojo) o `CREACION` (en verde).

### C. Centro de Feedback y Errores

**¿Qué hace?** Centraliza todos los reportes enviados por los usuarios desde el botón `?`.
**¿Cuándo usarlo?**

- **Diariamente** durante el piloto.
- Para detectar bugs reportados por los maestros ("No me deja subir calificaciones").
- Para ver sugerencias de mejora UX ("El botón está muy chico en mi celular").

### D. Historial de Versiones (Changelog)

- **Cierres de Sesión:** Agregado botón de salir en DashboardDocente.
- **Registro de Personal:** Se habilita campo CCT como editable.
- **Seguridad:** Protocolo de contraseñas visibles.

**Pasos:**

1.  Pestaña **"Retroalimentación"**.
2.  Filtra por tipos:
    - 🐞 **Bug**: Errores técnicos. Prioridad Alta.
    - 💡 **Idea**: Sugerencias.
    - 🎨 **UX**: Problemas de diseño/usabilidad.
3.  Revisa el **User Agent** para saber si falló en Android, iPhone o PC.

### D. "Botón Rojo": Sincronización de Ambiente (Sync)

**¿Qué hace?** `Sync Ambiente` (Botón arriba a la derecha).
⚠️ **PELIGRO**: Reinicia la base de datos con datos de demostración o "semilla".
**¿Cuándo usarlo?**

- **NUNCA en producción real** con datos de alumnos verdaderos.
- Solo en fase de pruebas iniciales si la base de datos se corrompe y necesitas "resetear" el sistema a cero.

---

## 3. Resumen de Flujos de Emergencia

| Escenario                      | Acción Dev                                                            |
| :----------------------------- | :-------------------------------------------------------------------- |
| **Director olvidó contraseña** | Entras como Dev -> Cuentas -> Resetear/Reenviar invitación.           |
| **Reportan "Sistema Lento"**   | Entras a Auditoría -> Verificas si hay spam de acciones.              |
| **Error en una pantalla**      | Entras a Feedback -> Ves el reporte con la URL exacta y el navegador. |
| **Base de Datos Corrupta**     | Sync Ambiente (Solo como último recurso extremo).                     |
