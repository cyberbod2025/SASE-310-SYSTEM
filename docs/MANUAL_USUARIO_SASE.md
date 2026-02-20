# 📖 Manual de Usuario SASE-310 (Versión Institucional)

> **Actualización:** 20 de Febrero, 2026
> **Propósito:** Guía rápida de operación por roles y descripción de protocolos activos.

---

## 🛡️ 1. Protocolos Activos en el Sistema

Actualmente, SASE-310 tiene integrados los siguientes protocolos oficiales que se activan automáticamente según la gravedad de las incidencias o por decisión directiva:

| Protocolo                 | Tipo             | Objetivo                                         | Activación                                                 |
| :------------------------ | :--------------- | :----------------------------------------------- | :--------------------------------------------------------- |
| **Convivencia Escolar**   | Convivencia      | Resolución de conflictos y disciplina positiva.  | Automática al detectar patrones de conducta (3+ reportes). |
| **ASI / Maltrato**        | Seguridad        | Abuso Sexual y Maltrato Infantil (SEP).          | Detección de indicadores físicos o psicológicos de riesgo. |
| **Drogas / Sustancias**   | Legal            | Prevención y atención del consumo de sustancias. | Identificación de intoxicación o posesión en el plantel.   |
| **Videovigilancia**       | Protección Civil | Regulación y uso de evidencia digital (cámaras). | Solicitud expresa ante incidencia grave o robo.            |
| **Contingencias Médicas** | Salud            | Guía de primeros auxilios y emergencias.         | Registro de accidentes o malestares graves en aula.        |
| **Perfil BAP (UDEII)**    | Apoyo            | Inclusión y ajustes razonables académicos.       | Diagnóstico de alumnos con barreras de aprendizaje.        |

---

## 👩‍💻 2. Guía por Roles y Funciones

### A. Secretaría (Control Escolar)

**Foco:** Integridad de datos y registro de flujo diario.

| Botón / Función         | Ubicación             | Qué hace                                            | Caso de Uso (Ejemplo)                            |
| :---------------------- | :-------------------- | :-------------------------------------------------- | :----------------------------------------------- |
| **Registro Veloz**      | Dashboard Principal   | Registra retardo o falta de credencial en segundos. | Alumnos llegando tarde en la puerta principal.   |
| **Balance de Grupos**   | Sección Estadísticas  | Muestra distribución de género y promedios.         | Planeación de nuevos grupos o balanceo de carga. |
| **Imprimir / Exportar** | Cabecera Estadísticas | Genera PDF o CSV con el balance escolar.            | Entrega de reporte mensual a la Supervisión.     |
| **Inscripciones**       | Menú Lateral          | Gestiona altas de alumnos y documentos.             | Periodo de preinscripciones o traslados.         |

### B. Trabajo Social

**Foco:** Diagnóstico comunitario y seguimiento de riesgos sociales.

| Botón / Función           | Ubicación              | Qué hace                                       | Caso de Uso (Ejemplo)                                 |
| :------------------------ | :--------------------- | :--------------------------------------------- | :---------------------------------------------------- |
| **Análisis de Comunidad** | Pestaña Especial       | Muestra el perfil socioeconómico escolar.      | Justificar la necesidad de becas o apoyos ante SEP.   |
| **Exportar Análisis**     | Panel de Reportes      | Genera un estudio colectivo de vulnerabilidad. | Presentar panorama social en el Consejo Técnico.      |
| **Justificantes**         | Módulo Central         | Valida ausencias por salud o motivos legales.  | Alumno que faltó por cita médica y requiere prórroga. |
| **Justificante Express**  | Registro de Incidencia | Emite justificante rápido desde el reporte.    | Alumno con malestar que debe retirarse temprano.      |

### C. Dirección (Autoridad)

**Foco:** Estrategia, seguridad y validación de personal.

| Botón / Función          | Ubicación           | Qué hace                                    | Caso de Uso (Ejemplo)                                             |
| :----------------------- | :------------------ | :------------------------------------------ | :---------------------------------------------------------------- |
| **Gestión de Personal**  | Panel Directivo     | Aprueba o rechaza nuevas cuentas de staff.  | Nuevo docente que se incorporó al plantel hoy.                    |
| **Auditoría IA**         | Módulo de Seguridad | Revisa quién accedió a qué datos y cuándo.  | Verificar quién consultó el expediente de un alumno en resguardo. |
| **Activar Protocolo**    | Expediente Alumno   | Inicia un proceso formal (Acta, Citatorio). | Incidencia de acoso escolar que requiere intervención legal.      |
| **Perfil Institucional** | Configuración       | Ajusta logos, nombre de escuela y ciclo.    | Cambio de ciclo escolar o actualización de identidad.             |

### D. Docente / Tutor

**Foco:** Detección primaria y acompañamiento pedagógico.

| Botón / Función     | Ubicación          | Qué hace                                       | Caso de Uso (Ejemplo)                                       |
| :------------------ | :----------------- | :--------------------------------------------- | :---------------------------------------------------------- |
| **Paso de Lista**   | Módulo Mi Grupo    | Registra asistencia en tiempo real.            | Inicio de la primera hora de clase.                         |
| **Nuevo Incidente** | Botón "+" Flotante | Reporta conducta, academia o salud brevemente. | Alumno con excelente desempeño o conducta disruptiva.       |
| **Barreras (BAP)**  | Expediente         | Muestra los ajustes razonables necesarios.     | Adaptar el examen para un alumno con discapacidad visual.   |
| **Resumen Médico**  | Ficha Clínica      | Muestra alergias o alertas vitales.            | Antes de salir a una excursión o clase de Educación Física. |

---

## 🚀 3. Flujos de Trabajo Recomendados

1.  **Si un alumno llega sin credencial:** Secretaría usa **Registro Veloz**. SASE verifica si ya está "En Trámite". Si sí, no genera reporte de castigo, solo aviso de información.
2.  **Si un alumno acumula 3 retardos:** El sistema escala a **Trabajo Social**, quien emite un **Citatorio** automático para platicar con el tutor.
3.  **Si hay un accidente en el patio:** El docente activa el **Protocolo de Salud**. Enfermería recibe alerta y registra el **Suministro** utilizado (Paracetamol/Gasa).
4.  **Para el Consejo Técnico:** Dirección echa mano de **Reportes > Análisis de Comunidad** para mostrar cuántos alumnos no tienen internet o viven lejos.

---

**SASE-310: Conectamos Contigo.**
_Sistema optimizado para la ESD No. 310 "Presidentes de México"._
