# Auditoría Funcional del Sistema SASE-310

Este documento detalla el estado actual, la identidad y la arquitectura funcional del sistema **SASE-310** (versión v4), basado en un análisis técnico y exploración real del entorno de producción local.

---

## FASE 1 — Identidad del sistema

### 1. ¿Qué es SASE?

SASE es el **Sistema de Acompañamiento y Seguridad Escolar**. Es un centro de mando digital diseñado para la gestión integral de la convivencia, disciplina y seguridad en centros educativos de nivel básico y medio.

### 2. Significado del acrónimo

**SASE**: Sistema de Acompañamiento y Seguridad Escolar.

### 3. Propósito de creación

Fue creado para digitalizar el expediente institucional del alumno, permitiendo un seguimiento en tiempo real de su trayectoria escolar, desde la asistencia hasta el comportamiento socioemocional.

### 4. Problema institucional que resuelve

Resuelve la fragmentación de la información escolar (hojas sueltas, reportes aislados). Centraliza los datos en una "Caja Negra" (sistema de auditoría) que permite identificar patrones de riesgo antes de que se conviertan en crisis, facilitando la intervención temprana.

### 5. Tipo de usuarios

* **Directivos y Subdirección**: Supervisión ejecutiva y toma de decisiones masivas.
* **Docentes y Tutores**: Registro diario de asistencia e incidencias.
* **Prefectura**: Operación táctica y monitoreo de campo.
* **Orientación y Trabajo Social**: Intervención profunda y seguimiento de casos críticos.
* **Personal Administrativo y Médico**: Gestión de salud y avisos generales.

---

## FASE 2 — Arquitectura funcional

### Dashboards Identificados

| Dashboard | Rol Principal | Objetivo | Información que presenta |
|---|---|---|---|
| **Núcleo Dirección** | Directivo / Admin | Comando y Control | Métricas de casos activos, avisos de salud, radar de riesgo y flujo de incidencias en tiempo real. |
| **Control de Expedientes** | Orientación / Prefectura | Consulta Histórica | Búsqueda retrospectiva de alumnos, historial de incidencias y estado del semáforo. |
| **Terminal de Inteligencia** | Directivo / Trabajo Social | Análisis Estadístico | Reportes de uniformes, retardos, inasistencias y conducta agrupados por periodo. |
| **Agenda Institucional** | Todos | Coordinación | Citatorios a padres de familia, eventos escolares y reuniones de consejo. |

---

## FASE 3 — Funciones del Sistema

### Funciones Comunes (Transversales)

* **Buscador Universal de Alumnos**: Integrado en la cabecera y módulos para acceso rápido a expedientes.
* **Registro Rápido Universal**: Botón flotante o modular para crear incidencias de cualquier dimensión (Conducta, Asistencia, Salud).
* **Sistema de Notificaciones**: Alertas visuales sobre nuevos eventos en el sistema.

### Funciones Exclusivas por Rol

#### Docente

* **Pase de Lista Digital**: Interfaz específica para marcar asistencia por grupo y hora.
* **Registro de Tareas**: Módulo para seguimiento académico diario.

#### Directivo

* **Monitor de Estatus Operativo**: Dashboard de salud del sistema y auditoría de acciones de staff (Unit_00).
* **Gestión de Plantilla**: Altas y bajas de personal (vía configuración central).

#### Prefectura

* **Operación de Campo**: Capacidad de registrar incidencias masivas durante recesos o cambios de clase.
* **Validación de Uniforme**: Herramienta rápida para registro de faltas al reglamento de vestimenta.

---

## FASE 4 — Evidencias Visuales

Se ha creado la carpeta `SASE_SCREENSHOTS` en la raíz del proyecto con las siguientes capturas reales:

1. `dashboard_directivo.png`: Interfaz del centro de mando principal.
2. `expedientes_busqueda.png`: Módulo de búsqueda con el fix de validación de nombres.
3. `registro_incidencia.png`: Formulario universal de reporte.
4. `reportes.png`: Terminal de análisis estadístico.
5. `agenda.png`: Calendario de actividades.
6. `manual_uso.png`: Guía de referencia interna para roles.

---

**Nota de Estabilidad**: Se han corregido el error de login y el crash en el motor de búsqueda durante esta auditoría. El sistema se encuentra estable para operación institucional.
