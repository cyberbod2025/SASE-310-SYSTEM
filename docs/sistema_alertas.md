# Sistema de Alertas de Riesgo Escolar - SASE-310

## Objetivo

El **Sistema de Alertas de Riesgo** es una herramienta táctica diseñada para la detección temprana de alumnos en situación de vulnerabilidad académica, conductual o social. Permite a la dirección y al personal especializado (UDEII, Psicología, Trabajo Social) intervenir de manera proactiva basándose en datos consolidados de múltiples módulos.

## Lógica de Alertas

El sistema categoriza el riesgo de cada alumno en cuatro niveles principales, calculados automáticamente mediante la vista SQL `alumnos_en_riesgo`:

| Nivel de Alerta        | Criterio de Activación                                    | Acción Recomendada                                        |
| :--------------------- | :-------------------------------------------------------- | :-------------------------------------------------------- |
| **ALERTA CRÍTICA**     | 5 o más incidencias registradas.                          | Intervención inmediata de Dirección y citatorio a padres. |
| **ALERTA MEDIA**       | Entre 3 y 4 incidencias registradas.                      | Seguimiento por Prefectura y canalización a Orientación.  |
| **SEGUIMIENTO SOCIAL** | Cualquier registro en el módulo de Trabajo Social.        | Visita domiciliaria o entrevista de entorno familiar.     |
| **NORMAL**             | Menos de 3 incidencias y sin registros de vulnerabilidad. | Monitoreo ordinario en el expediente integral.            |

## Origen de Datos (Vistas SQL)

### 1. `expediente_integral_alumno` (Consolidación)

Esta vista centraliza la información de todas las tablas operativas:

- `incidencias`: Total de reportes conductuales.
- `atenciones_medicas`: Registros del área de salud.
- `seguimiento_social`: Intervenciones de Trabajo Social.
- `seguimiento_bap`: Seguimiento de Barreras para el Aprendizaje y la Participación (UDEII).
- `registro_lectura`: Desempeño y frecuencia en biblioteca/lectura.
- `calificaciones`: Promedio académico actual.

### 2. `alumnos_en_riesgo` (Filtrado y Clasificación)

Filtra a los alumnos que cumplen con algún criterio de riesgo y asigna el `nivel_alerta` dinámicamente:

```sql
CASE
    WHEN total_incidencias >= 5 THEN 'ALERTA_CRITICA'
    WHEN total_incidencias >= 3 THEN 'ALERTA_MEDIA'
    WHEN registros_social > 0 THEN 'SEGUIMIENTO_SOCIAL'
    WHEN registros_bap > 0 THEN 'APOYO_ESPECIALIZADO'
    ELSE 'NORMAL'
END AS nivel_alerta
```

## Integración en el Dashboard de Dirección

El widget **SISTEMA_ALERTAS_RIESGO** en el dashboard principal muestra en tiempo real los 5 casos más críticos.

- **Acción Rápida**: El botón de visibilidad permite cargar el caso en la **Matrix de Decisión** para desplegar los protocolos institucionales correspondientes.
- **Identidad**: Los colores (Rojo, Ámbar, Azul) indican visualmente la urgencia del caso.

## Propósito Institucional

Garantizar que ningún alumno con señales de alerta pase desapercibido por el sistema, unificando la visión de todos los departamentos en una sola plataforma de toma de decisiones.
