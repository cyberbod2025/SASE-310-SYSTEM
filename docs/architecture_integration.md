# Arquitectura Integral SASE-310 & Islas del Saber

## Diagrama de Capas

```mermaid
graph TD
    subgraph CAPA_1_USUARIO ["CAPA 1: INTERFAZ & ROLES"]
        U1[Docente Dashboard]
        U2[Directivo Dashboard]
        U3[Orientación / Social]
        U4[Médico Escolar]
    end

    subgraph CAPA_2_SEGURIDAD ["CAPA 2: ACCESO & AUTH"]
        Auth[Supabase Auth]
        RLS[Row Level Security]
        Profiles[perfiles_usuario]
    end

    subgraph CAPA_3_LOGICA ["CAPA_3: PROCESAMIENTO (STORE)"]
        Slice[useStudentsSlice]
        Types[types.ts / Database Types]
    end

    subgraph CAPA_4_PERSISTENCIA ["CAPA 4: DATOS (CORE)"]
        Alumnos[(public.alumnos)]
        Incidencias[(public.incidencias)]
        Salud[(public.atenciones_medicas)]
        Calific[(public.calificaciones)]
        Gami[(public.estudiantes - Islas del Saber)]
    end

    subgraph CAPA_5_VISTAS_AUDITORIA ["CAPA 5: INTELIGENCIA & ARCHIVO"]
        ViewIntegral[expediente_integral_alumno]
        ViewRiesgo[alumnos_en_riesgo]
        Audit[(public.auditoria)]
        Archive[(archive.legacy_tables)]
    end

    %% Relaciones
    U1 & U2 & U3 & U4 --> Auth
    Auth --> Profiles
    Profiles --> RLS
    RLS --> Alumnos

    Alumnos --- Incidencias
    Alumnos --- Salud
    Alumnos --- Calific
    Alumnos --- Gami

    %% Consolidación & Riesgo
    Alumnos & Incidencias & Salud & Gami --> ViewIntegral
    ViewIntegral --> ViewRiesgo
    ViewRiesgo --> |Alertas| U2

    %% Higiene
    Archive -.-> |Legacy| Alumnos
```

---

## Estado de la Integración

### 1. Higiene de Datos

- **Acción**: Se creó una migración SQL para mover tablas `students`, `incidents` y sandboxes al esquema `archive`.
- **Resultado**: El esquema `public` ahora es 100% oficial y libre de ambigüedad.

### 2. Integración de Gamificación ("Islas del Saber")

- **Base de Datos**: Se vinculó la tabla `estudiantes` con `alumnos` mediante `alumno_id`.
- **Migración**: Script inteligente para emparejar nicknames existentes con IDs de alumnos oficiales.
- **Frontend**:
  - Actualizado `types.ts` con la interfaz `GamificacionData`.
  - Modificado `useStudentsSlice.ts` para traer datos de puntos y escaneos en tiempo real.
  - Se añadió sección visual premium en `StudentAdvancedPanel`.
  - Nuevo KPI de Gamificación en el Dashboard del Docente.

### 3. Expediente Integral & Sistema de Alertas (v1.0)

- **Vista Integral**: `expediente_integral_alumno` agrupa incidencias, salud, fichas sociales, UDEII y gamificación en una sola consulta.
- **Detección de Riesgo**: La vista `alumnos_en_riesgo` aplica lógica institucional para clasificar casos:
  - **Identidad**: Relación directa `Alumno` → `Expediente` → `Alerta`.
  - **Niveles**: Crítico, Medio, Social, BAP.
- **Frontend (Dirección)**:
  - Widget táctico en `DashboardDireccion`.
  - Conexión con `Decision Matrix` para acciones protocolarias inmediatas.
