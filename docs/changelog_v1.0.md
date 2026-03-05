# Changelog SASE v1.0 — Sistema de Alertas de Riesgo Escolar

Fecha: 2026-03-05

## [v1.0-alertas-riesgo] - Lanzamiento Inicial del Núcleo Táctico

### ✨ Nuevas Funcionalidades

- **Sistema de Alertas de Riesgo**: Implementación de una capa de inteligencia de datos que detecta automáticamente alumnos en vulnerabilidad.
- **Expediente Integral del Alumno**: Vista consolidada (`expediente_integral_alumno`) que centraliza información de:
  - Incidencias (Disciplina)
  - Atenciones Médicas (Salud)
  - Seguimiento Social (Entorno Familiar)
  - Seguimiento BAP (UDEII / Inclusión)
  - Registro de Lectura (Biblioteca)
- **Dashboard de Dirección Premium**:
  - Integración del widget "Alumnos en Riesgo".
  - Sincronización con la **Decision Matrix** para intervención protocolaria inmediata.
- **Integración con Gamificación**: Conexión de identidades entre el sistema escolar y el sistema de gamificación "Islas del Saber" mediante `alumno_id`.

### 🧹 Limpieza y Estabilidad (Higiene del Repositorio)

- **Archivado de Tablas Legacy**: Mover tablas obsoletas (`students`, `incidents`, `sandbox_personas`, `sandbox_incidencias`) al esquema `archive` para reducir ambigüedad técnica.
- **Resolución de Deuda Técnica**: Corrección de tipos en consultas de Supabase y eliminación de referencias a tablas inexistentes.

### 🛠️ Cambios en Base de Datos

- Nuevas Vistas: `public.expediente_integral_alumno`, `public.alumnos_en_riesgo`.
- Nuevas Columnas: `public.estudiantes.alumno_id` (Relación FO).
- Registro de Auditoría: Documentación automática de cambios estructurales en la tabla `auditoria`.

---

_SASE - Sistema de Acompañamiento y Seguimiento Escolar_
