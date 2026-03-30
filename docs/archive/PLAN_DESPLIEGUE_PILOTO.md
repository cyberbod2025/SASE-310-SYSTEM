# Plan de Despliegue Piloto - SASE 310

Este documento detalla la estrategia para el lanzamiento piloto del Sistema de Administración Escolar (SASE).

## 1. Estado Inicial del Sistema (Tabula Rasa)

Al iniciar la prueba piloto, la base de datos estará **vacía** de usuarios operativos y alumnos, excepto por los administradores fundadores.

### Estrategia de "Sembrado" (Seed)

Para que el sistema sea accesible por primera vez, necesitamos dar de alta manualmente a las autoridades que aprobarán al resto del personal.

**Usuarios Fundadores Requeridos:**

1. **Director (Miguel)**: Rol `DIRECTIVO`. Capacidad de aprobar todo.
1. **Dev/Soporte (Cuenta Técnica)**: Rol `DEVELOPER`. **Debe ser un correo distinto al institucional** (ej. personal o de soporte). Se usa solo para mantenimiento, respaldos y emergencias. No para clases.
1. **Tú (Hugo Sánchez)**: Rol `DOCENTE` + `TUTOR`. Tu cuenta operativa diaria para clases y grupos. Ya configurada.

**Acción Requerida:**

Necesito los **Correos Electrónicos** exactos de estas 3 personas para insertarlos directamente en la tabla de permisos iniciales (`perfiles_usuario` o `profiles`) y vincularlos a sus usuarios de Supabase una vez que se registren/inicien sesión.

## 2. Flujo de Alta de Personal (Onboarding)

Dado que es un sistema cerrado, no cualquiera puede entrar. Hemos diseñado un flujo de **Solicitud -> Aprobación**.

### Paso A: Invitación y Registro

El personal recibe las instrucciones (ver documento `COMUNICACION_LANZAMIENTO.md`) e instala/accede a la App.

1. En la pantalla de Login, seleccionan **"Solicitar Alta Personal"**.
1. Llenan sus datos (Nombre, CURP, Rol Solicitado, Turno).
1. El sistema crea una `Solicitud de Alta` en estado `PENDIENTE`.

### Paso B: Aprobación (El "Visto Bueno")

1. El **Director (o Tú/Dev)** inicia sesión.
1. En el **Dashboard Dirección**, verán una notificación o un botón **"Aprobaciones"**.
1. Entran al módulo **Aprobaciones de Personal**.
1. Revisan la lista de solicitantes.
1. Al dar click en **"Aprobar"**:
   - El sistema crea su `Perfil de Usuario` oficial.
   - Les asigna los permisos correspondientes a su Rol.
   - (Futuro) Les envía un correo de bienvenida (por ahora es acceso inmediato).

## 3. Carga de Información de Alumnos

Una vez que las **Secretarias** y **Directivos** están aprobados:

1. Ingresan al módulo **Archivo**.
1. Usan la función **"Carga Masiva e IA"** que verificamos anteriormente.
1. Suben las listas de Excel de los grupos.
1. El sistema puebla la tabla `alumnos`.

## 4. Notificaciones y Feedback

### ¿Dónde ven las notificaciones los directivos?

- **Móvil/Escritorio**: En el **Dashboard de Dirección**, hemos integrado un panel de notificaciones (la campana en la esquina superior derecha y el widget de "Feed del Plantel").
- **Aprobaciones**: Las solicitudes pendientes aparecen numéricamente en el botón "Aprobaciones" del dashboard.

### Feedback y Entrenamiento IA

- **Botón Feedback**: Ya está implementado (botón flotante `?` o `Feedback` en la esquina inferior derecha).
- **Importancia**: Cada reporte de "Error" o "Sugerencia" se guarda en la tabla `system_feedback` junto con metadatos del dispositivo. Esto es crucial para depurar la "experiencia móvil" vs "escritorio".

## 5. Documentos Oficiales Faltantes

El sistema actualmente **NO** genera los PDFs "oficiales" (Actas de Hechos, Citatorios con formato SEP, etc.) porque no tenemos las plantillas.

- **Solución Temporal**: El sistema registrará la data (quién, cuándo, por qué).
- **Solución Futura**: Subiremos las plantillas HTML/PDF para que el botón "Imprimir" rellene esos formatos automáticamente.

---

## Cronograma de Ejecución Sugerido

1. **Día 0 (Configuración)**:
   - Me proporcionas los correos de los Admins.
   - Yo ejecuto el script SQL para pre-autorizarlos.
1. **Día 1 (Lanzamiento Admins)**:
   - Miguel, Tú y Dev se registran.
   - Verifican acceso al Dashboard Dirección.
1. **Día 1 (Tarde) - Carga Alumnos**:
   - Secretarias (aprobadas por ustedes) suben las listas de alumnos.
1. **Día 2 (Lanzamiento General)**:
   - Se envía el comunicado a los Docentes.
   - Comienzan a registrarse.
   - Ustedes aprueban en lotes (mañana/tarde).
