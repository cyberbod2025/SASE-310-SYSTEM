# Especificación Técnica: IA-SASE Intelligence Engine

## 1. Introducción

El motor de inteligencia IA-SASE es el núcleo analítico de SASE-310. Su propósito es transformar registros aislados en información estratégica para la toma de decisiones institucionales.

## 2. Arquitectura del Motor (Cuatro Motores Internos)

### 2.1 DATA ENGINE (El Archivo Histórico)

**Propósito:** Centralizar y normalizar eventos de múltiples fuentes.

- **Fuentes:**
  - `attendance_logs` (Asistencia/Retardos)
  - `incidencias` (Conducta/Uniforme)
  - `atenciones_medicas` (Salud)
  - `seguimiento_social` (Socioemocional)
  - `seguimiento_bap` (Académico/UDEII)
  - `calificaciones` (Académico)
  - `interventions_log` (Intervenciones)
- **Implementación:** Vista SQL `v_data_engine` que unifica los campos básicos: `alumno_id`, `fecha`, `tipo_evento`, `dimension`, `gravedad`, `puntaje_base`.

### 2.2 PATTERN ENGINE (El Detector de Anomalías)

**Propósito:** Identificar comportamientos recurrentes.

- **Detección de patrones:**
  - **Reincidencia Crítica:** 3 incidencias graves en la misma dimensión en 60 días.
  - **Ausentismo en Escalada:** Patrón de inasistencias los mismos días o incremento de retardos.
  - **Anomalía de Uniforme:** Incumplimiento sistemático.
- **Implementación:** Funciones de ventana en PostgreSQL para detectar secuencias.

### 2.3 RISK ENGINE (El Calculador de Riesgo)

**Propósito:** Generar un puntaje dinámico basado en la historia del alumno.

- **Reglas de Cálculo (Basado en AGENTS.md):**
  - **Pesos por Gravedad:**
    - Leve: 1 punto
    - Media: 3 puntos
    - Grave: 5 puntos
    - Crítica/Intervención: 8 puntos
  - **Decaimiento Temporal:**
    - 0-30 días: 100% de peso.
    - 31-90 días: 50% de peso.
    - > 90 días: 0% de peso (Amnistía institucional).
- **Dimensiones de Riesgo:** Disciplina, Asistencia, Académico, Socioemocional.

### 2.4 ALERT ENGINE (El Sistema de Notificaciones)

**Proposito:** Comunicar el riesgo al personal adecuado.

- **Estados del Semaforo (Institucional):**
  - **CERRADO:** Acompanamiento concluido.
  - **OBSERVADO:** Observacion inicial.
  - **PATRON_DETECTADO:** Analisis de trayectoria.
  - **EN_ANALISIS:** Atencion prioritaria.
  - **INTERVENCION:** Acompanamiento intensivo / intervencion institucional.

**Nota:** Los nombres de estado deben alinearse con `AGENTS.md`. Si se usan colores en UI, deben mapearse a estos estados institucionales.

## 3. Niveles de Análisis

1. **Alumno:** Expediente individual con trayectoria de riesgo.
1. **Grupo:** Mapa de calor de riesgo grupal para tutores y prefectura.
1. **Institución:** Dashboard directivo con tendencias globales.

## 4. Visualización (Intelligence Dashboard)

Componente premium `DashboardIntelligence` que muestra:

- Alumnos en "Zona Roja/Dorada".
- Grupos con mayor incremento de riesgo en la última semana.
- Tipos de incidencias más frecuentes (Top 5).
- Análisis de horas críticas (Momentos del día con más incidencias).
