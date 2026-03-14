# Documento Maestro — Arquitectura y Visión de SASE-310

# SASE-310

## Sistema de Acompañamiento y Seguimiento Escolar

Documento Maestro de Arquitectura Funcional
Versión inicial — Base para desarrollo institucional

---

# 1. Identidad del Sistema

## 1.1 ¿Qué es SASE?

SASE-310 es un sistema digital institucional diseñado para gestionar, registrar y analizar la convivencia escolar en tiempo real.

Su objetivo es centralizar toda la información relevante de los alumnos para permitir acompañamiento pedagógico, prevención de riesgos y toma de decisiones informada dentro de una institución educativa.

SASE funciona como un centro de inteligencia escolar que integra:

* asistencia
* incidencias disciplinarias
* información socioemocional
* seguimiento institucional
* análisis de patrones escolares

---

## 1.2 Significado del acrónimo

SASE significa:

Sistema de Acompañamiento y Seguimiento Escolar

Este nombre refleja la filosofía del sistema: no se trata únicamente de seguridad o control, sino de acompañamiento continuo al alumno durante su trayectoria escolar.

---

## 1.3 Propósito del sistema

El propósito de SASE es resolver uno de los problemas estructurales de las escuelas:

la fragmentación de la información institucional.

En muchos centros educativos la información se encuentra dispersa en:

* hojas sueltas
* reportes aislados
* cuadernos de registro
* documentos físicos
* memoria informal del personal

SASE centraliza esta información en un sistema digital que permite:

* seguimiento longitudinal del alumno
* análisis de patrones de conducta
* intervención temprana
* toma de decisiones institucional basada en datos

---

# 2. Principio de la "Caja Negra Institucional"

SASE funciona como una caja negra institucional.

Cada evento relevante que ocurre en la vida escolar queda registrado dentro del sistema:

* asistencias
* retardos
* incidencias disciplinarias
* intervenciones
* seguimiento socioemocional
* observaciones docentes

Esto permite reconstruir la trayectoria institucional de un alumno cuando sea necesario y detectar patrones antes de que escalen a crisis.

---

# 3. Usuarios del Sistema

SASE está diseñado para múltiples roles institucionales.

Los usuarios principales son:

Directivos
Subdirección
Docentes
Prefectura
Orientación
Trabajo Social
UDEII
Enfermería
Promotora de lectura
Secretaría administrativa

Cada rol posee un dashboard específico con funciones particulares.

---

# 4. Arquitectura General del Sistema

La arquitectura de SASE se organiza en tres niveles funcionales.

---

## Nivel 1 — Núcleo Institucional

### Dirección

Centro de mando institucional.

Funciones principales:

* monitoreo de incidencias en tiempo real
* radar de riesgo escolar
* indicadores de convivencia
* alertas críticas
* métricas institucionales

---

### Subdirección

Operación disciplinaria diaria.

Funciones:

* seguimiento de incidencias
* coordinación con docentes
* intervención en conflictos
* supervisión operativa

---

### System Admin

Configuración técnica del sistema.

Funciones:

* gestión de roles
* permisos
* usuarios
* auditoría del sistema

---

# 5. Operación Escolar

## Docentes

Funciones principales:

* pase de lista digital
* registro de incidencias
* observaciones pedagógicas
* seguimiento académico

---

## Prefectura

Operación de campo.

Funciones:

* registro rápido de incidencias
* control de uniforme
* monitoreo en pasillos
* registro de retardos
* incidencias durante recesos

También puede registrar objetos retenidos.

---

## Secretaría

Gestión administrativa de alumnos.

Funciones:

* alta de alumnos
* carga de documentos
* generación de matrícula
* creación de expedientes institucionales

SASE puede formar grupos automáticamente utilizando:

* promedio de primaria
* balance de género
* tamaño equilibrado de grupos

---

## Enfermería

Gestión de salud escolar.

Funciones:

* registro de atenciones médicas
* historial de salud del alumno
* alertas médicas
* comunicación con padres

---

# 6. Intervención Especializada

## Orientación

Funciones:

* seguimiento socioemocional
* registro de sesiones
* intervención con alumnos

---

## Trabajo Social

Funciones:

* visitas domiciliarias
* análisis familiar
* reportes sociales

---

## UDEII

Atención a barreras para el aprendizaje.

Funciones:

* seguimiento de alumnos con BAP
* registro de intervenciones
* coordinación con docentes

---

## Promotora de Lectura

Rol pedagógico y de convivencia.

Funciones:

* actividades lectoras
* seguimiento de productos de lectura
* retroalimentación a alumnos
* registro de observaciones

También puede registrar incidencias observadas en pasillos.

---

# 7. Módulos Transversales del Sistema

## Buscador Universal de Alumnos

Permite localizar cualquier alumno dentro del sistema y abrir su expediente completo.

---

## Registro Rápido de Incidencias

Botón universal para registrar incidencias en segundos.

Campos mínimos:

Alumno
Grupo
Tipo de incidencia
Observación

El sistema optimiza el registro mostrando incidencias comunes según el momento del día.

Ejemplos:

Entrada escolar:

* retardo
* falta de credencial
* uniforme incorrecto

Después del receso:

* retardo a clase
* alimentos en el aula

---

## Agenda Institucional

Coordina:

* citatorios a padres
* reuniones
* eventos escolares
* actividades institucionales

---

## Terminal de Inteligencia

Módulo de análisis de datos institucionales.

Genera reportes sobre:

* retardos
* inasistencias
* conducta
* uniformes
* incidencias por grupo

---

# 8. Registro de Objetos Retenidos

El sistema permite registrar decomisos temporales conforme al reglamento escolar.

Ejemplos:

* celulares
* maquillaje
* perfumes
* aerosoles
* prendas fuera del uniforme

Cada registro incluye:

Alumno
Objeto
Motivo
Fecha
Responsable
Estado de devolución

---

# 9. IA-SASE

IA-SASE es la entidad analítica del sistema.

Su función es interpretar los datos generados por la actividad escolar.

Estados visuales del sistema:

Azul — observación
Verde — sistema estable
Amarillo — alerta preventiva
Rojo — alerta crítica
Dorado — análisis profundo

La IA detecta patrones y genera alertas institucionales.

---

# 10. Flujo Central del Sistema

El funcionamiento básico de SASE es el siguiente:

Docente o personal registra un evento
↓
El evento se guarda en el expediente del alumno
↓
IA-SASE analiza patrones históricos
↓
Se actualiza el estado del sistema
↓
Dirección recibe alertas cuando es necesario

---

# 11. Filosofía del Sistema

SASE no es únicamente un sistema de incidencias.

Es una plataforma de inteligencia institucional diseñada para acompañar al alumno durante su trayectoria escolar y fortalecer la convivencia educativa.
