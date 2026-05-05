# Orientación v2 — Modelo de Diagnósticos

Este documento detalla la coexistencia y distinción técnica entre los dos modelos de diagnóstico implementados en el sistema SASE-310 para evitar colisiones arquitectónicas y confusiones de flujo.

## 1. Propósito del módulo (Orientación v2)
Orientación v2 es el módulo institucional encargado de centralizar la atención individualizada de alumnos que requieren intervención psicopedagógica o conductual. Su objetivo es orquestar la comunicación entre orientadores, docentes, familias y directivos para resolver casos específicos de riesgo o necesidad especial.

## 2. Diagnóstico Individual
*   **Tabla**: `public.diagnosticos_docentes`
*   **Ámbito**: Alumno individual vinculado a un caso.
*   **Flujo Institucional**:
    1.  **Apertura**: Orientación detecta una necesidad y abre un caso (`orientacion_casos`).
    2.  **Solicitud**: Orientación envía una solicitud formal (`solicitudes_diagnostico`) a uno o más docentes del alumno.
    3.  **Respuesta**: El docente recibe la notificación y registra el diagnóstico individual vía RPC (`registrar_diagnostico`).
    4.  **Uso**: Orientación analiza las respuestas para definir un **Plan de Intervención** estructurado.

## 3. Diagnóstico Colectivo
*   **Tabla**: `public.diagnosticos_colectivos_docentes`
*   **Ámbito**: Grupo, asignatura o clima de aula general.
*   **Flujo Funcional (Dashboard Docente v2)**:
    1.  **Registro**: El docente, de forma autónoma y periódica, registra el pulso general de sus grupos (clima, aprovechamiento grupal, incidencias colectivas).
    2.  **Consulta**: El docente visualiza el panorama de sus grupos para identificar tendencias grupales.
    3.  **Uso**: Prevención temprana y visualización del Dashboard Docente para toma de decisiones pedagógicas a nivel grupo.

## 4. Diferencia Crítica
Es imperativo no mezclar estos flujos debido a su naturaleza distinta:
*   **Individual (Orientación)**: Es una respuesta a un requerimiento institucional. Tiene implicaciones legales y de expediente académico. Se vincula a un ID de caso.
*   **Colectivo (Docente)**: Es una herramienta de gestión de aula. No está vinculado a un caso de orientación ni a un alumno único, sino al desempeño de una cohorte o grupo.

## 5. Riesgo de Confusión Actual
Actualmente, el componente frontend `TeacherDiagnosisOverview` representa el **Diagnóstico Colectivo** (Dashboard Docente v2), a pesar de que su nombre es genérico. 
*   **Riesgo**: Un desarrollador podría intentar integrar solicitudes de Orientación en este componente, lo cual corrompería la separación de preocupaciones (*Separation of Concerns*).
*   **Nota**: Las solicitudes individuales de Orientación deben gestionarse exclusivamente a través de los componentes del módulo `src/components/orientacion/`.

## 6. Reglas para Futuros Desarrolladores
*   **Prohibición**: No usar `diagnosticos_docentes` para reportes de clima grupal.
*   **Prohibición**: No usar `diagnosticos_colectivos_docentes` para alimentar expedientes de Orientación.
*   **Encapsulamiento**: Todo flujo que dependa de un `caso_id` o `solicitud_id` pertenece al módulo de **Orientación**. Todo flujo que dependa de un `grupo_id` o `docente_id` (sin caso) pertenece al **Dashboard Docente**.

## 7. Pendientes Recomendados
*   **Naming**: Evaluar el renombre de `TeacherDiagnosisOverview` a `TeacherColectiveDiagnosisOverview`.
*   **Hardening RLS**: Ajustar `seguimiento_orientacion` para forzar `created_by = auth.uid()` en la cláusula `WITH CHECK`.
*   **Calidad**: Implementar tests de integración que validen que un docente solo puede responder diagnósticos individuales si tiene una solicitud pendiente.
