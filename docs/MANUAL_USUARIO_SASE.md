# 📖 Manual de Usuario SASE-310 (Versión Institucional)

> **Actualizacion:** 14 de marzo, 2026
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

| Botón / Función              | Ubicación             | Qué hace                                                        | Caso de Uso (Ejemplo)                            |
| :--------------------------- | :-------------------- | :-------------------------------------------------------------- | :----------------------------------------------- |
| **Registro Veloz**           | Dashboard Principal   | Registra retardo o falta de credencial en segundos.             | Alumnos llegando tarde en la puerta principal.   |
| **Carga Masiva e IA**         | Dashboard Principal   | Importa alumnos (Excel/CSV) y balancea grupos.                  | Inicio de ciclo / altas masivas.                 |
| **Sala de Gestión (Trámites)** | Trámites Activos       | Gestiona constancias y certificados pendientes.                 | Seguimiento de solicitudes.                      |
| **Balance Institucional (PDF)** | Sección Estadísticas  | Imprime PDF con la distribución de grupos.                      | Reporte para Supervisión.                        |
| **Inscripciones**            | Menú Lateral          | Gestiona altas de alumnos y documentos.                         | Periodo de preinscripciones o traslados.         |

### B. Trabajo Social

**Foco:** Diagnóstico comunitario y seguimiento de riesgos sociales.

| Botón / Función        | Ubicación             | Qué hace                                              | Caso de Uso (Ejemplo)                                 |
| :--------------------- | :-------------------- | :---------------------------------------------------- | :---------------------------------------------------- |
| **Justificantes**      | Tab Justificantes     | Emite justificantes y registra motivo de ausencia.    | Alumno que faltó por cita médica.                     |
| **Riesgos**            | Tab Riesgos           | Lista alumnos con riesgo por faltas/incidencias.      | Priorizar seguimiento de casos.                       |
| **Análisis de Comunidad** | Tab Análisis Comunidad | Muestra el perfil socioeconómico escolar.            | Justificar la necesidad de apoyos ante SEP.           |

### C. Dirección (Autoridad)

**Foco:** Estrategia, seguridad y validación de personal.

| Botón / Función           | Ubicación          | Qué hace                                    | Caso de Uso (Ejemplo)                                             |
| :------------------------ | :----------------- | :------------------------------------------ | :---------------------------------------------------------------- |
| **Aprobaciones**          | Panel Directivo    | Aprueba o rechaza nuevas cuentas de staff.  | Nuevo docente que se incorporó al plantel hoy.                    |
| **Auditoría (Bitácora)**  | Módulo Auditoría   | Revisa quién accedió a qué datos y cuándo.  | Verificar consultas de expedientes sensibles.                     |
| **Activar Protocolo**     | Expediente Alumno  | Inicia un proceso formal (Acta, Citatorio). | Incidencia de acoso escolar que requiere intervención legal.      |

### D. Docente / Tutor

**Foco:** Detección primaria y acompañamiento pedagógico.

| Botón / Función           | Ubicación         | Qué hace                                       | Caso de Uso (Ejemplo)                                       |
| :------------------------ | :---------------- | :--------------------------------------------- | :---------------------------------------------------------- |
| **Pase de Lista**         | Tab Pase de Lista | Registra asistencia en tiempo real.            | Inicio de la primera hora de clase.                         |
| **Reporte de Incidencias** | Vista General     | Reporta conducta, academia o salud (individual o masivo). | Alumno con excelente desempeño o conducta disruptiva.       |
| **Barreras (BAP)**        | Expediente        | Muestra los ajustes razonables necesarios.     | Adaptar el examen para un alumno con discapacidad visual.   |
| **Resumen Médico**        | Ficha Clínica     | Muestra alergias o alertas vitales.            | Antes de salir a una excursión o clase de Educación Física. |

### E. UDEII (Inclusión)

**Foco:** Garantizar la equidad y eliminación de barreras para el aprendizaje (BAP).

| Botón / Función         | Ubicación            | Qué hace                                         | Caso de Uso (Ejemplo)                                   |
| :---------------------- | :------------------- | :----------------------------------------------- | :------------------------------------------------------ |
| **Monitor de BAP**      | Dashboard UDEII      | Visualiza alumnos con barreras de aprendizaje.   | Seguimiento de alumnos con necesidades especiales.      |
| **Ficha de Apoyo**      | Expediente Alumno    | Registra ajustes razonables y estrategias.       | Definir adecuación curricular para un alumno con TDAH.  |
| **Vínculo con Docente** | Panel de Orientación | Comparte estrategias pedagógicas con el titular. | Sugerir cambios en la dinámica de clase para inclusión. |
| **Seguimiento Externo** | Bitácora UDEII       | Registra canalizaciones a USAER o especialistas. | Alumno que requiere evaluación por neuropediatría.      |

---

## 🚀 3. Flujos de Trabajo Recomendados

1. **Si un alumno llega sin credencial:** Secretaría usa **Registro Veloz**. SASE verifica si ya está "En Trámite". Si sí, no genera reporte de castigo, solo aviso de información.
2. **Si un alumno acumula 3 retardos:** El sistema escala a **Trabajo Social**, quien emite un **Citatorio** automático para platicar con el tutor.
3. **Si hay un accidente en el patio:** El docente activa el **Protocolo de Salud**. Enfermería recibe alerta y registra el **Suministro** utilizado (Paracetamol/Gasa).
4. **Para el Consejo Técnico:** Trabajo Social consulta **Análisis de Comunidad** para mostrar cuántos alumnos no tienen internet o viven lejos.

---

**SASE-310: Conectamos Contigo.**
_Sistema optimizado para la ESD No. 310 "Presidentes de México"._
