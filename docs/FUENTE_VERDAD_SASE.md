# 📚 FUENTE DE VERDAD ÚNICA - SASE-310
## Base de Conocimiento para NotebookLM

> **Versión:** 1.0 | **Fecha:** 2026-02-07
> **Propósito:** Documento maestro consolidado que integra la documentación del sistema SASE-310 con el marco normativo educativo mexicano.

---

# PARTE 1: SISTEMA SASE-310 (Documentación Interna)

## 1.1 Misión y Filosofía

**SASE-310** (Sistema de Acompañamiento y Seguimiento Escolar) es la infraestructura digital central de la **Escuela Secundaria Diurna No. 310 "Presidentes de México"**.

### Misión
Transformar la gestión escolar reactiva en una **estrategia preventiva, humana y pedagógica**, asegurando que ningún alumno pase desapercibido ante riesgos académicos, conductuales, emocionales o de salud.

> _"SASE no existe para castigar. SASE existe para detectar, acompañar, dar seguimiento y documentar."_

### Principios Rectores
1. **Acompañamiento** antes que sanción
2. **Seguimiento** antes que olvido
3. **Evidencia** antes que opinión
4. **Prevención** antes que crisis
5. **Humanidad** antes que burocracia

> **"SASE acompaña procesos, no persigue errores."**

---

## 1.2 Arquitectura Tecnológica

### Stack Tecnológico
| Componente | Tecnología | Función |
|------------|------------|---------|
| **Backend** | Supabase (PostgreSQL) | Almacenamiento, RLS, auditoría |
| **Frontend** | React + Vite + TypeScript | Interfaz premium Glassmorphism |
| **Estilos** | Tailwind CSS | Sistema de diseño "Metro Lab Institucional" |
| **IA** | Copiloto contextual | Sugiere acciones, no decide |

### Diseño Desktop-First
El sistema está optimizado para uso institucional intensivo en computadoras de escritorio, con énfasis en reducir la carga cognitiva del personal operativo.

---

## 1.3 Modelo de Datos

### Tablas Principales
```
profiles          → Usuarios del sistema (roles)
alumnos           → Catálogo de estudiantes
incidencias       → Registros de eventos (retardos, conducta, etc.)
salud             → Información médica del alumno
atenciones_medicas → Bitácora de enfermería
justificantes     → Justificantes de ausencias
socioeconomico_general → Datos familiares visibles
socioeconomico_privado → Datos restringidos (solo TS/Dirección)
```

### Estados de Caso de Alumno
| Estado | Descripción | Disparador |
|--------|-------------|-----------|
| `En Seguimiento Preventivo` | Observación silenciosa | 1-2 incidencias |
| `Atención Prioritaria` | Notificación a especialistas | 3 incidencias |
| `Acompañamiento Intensivo` | Intervención formal | 4+ incidencias |
| `Acompañamiento Concluido` | Caso cerrado | Resolución positiva |

### Tipos de Incidencia
- Asistencia / Falta
- Retardo
- Observación de Convivencia
- Observación Académica
- Atención Médica
- Falta de Uniforme

---

## 1.4 Sistema de Roles y Permisos

### Roles Institucionales
| Rol | Etiqueta | Función Principal |
|-----|----------|-------------------|
| `directivo` | Dirección | Visión macro, decisiones estratégicas |
| `docente` | Docente | Sensor académico |
| `docente_tutor` | Docente Tutor | Acompañante de grupo |
| `prefectura` | Prefectura | Primera línea operativa |
| `orientacion` | Orientación | Análisis humano, contención |
| `trabajo_social` | Trabajo Social | Casos familiares, legales |
| `enfermeria` | Enfermería | Bitácora clínica |
| `secretaria` | Secretaría | Integridad documental |
| `udeii` | UDEII | Inclusión, BAP |
| `promotora` | Enlace de Fomento a la Lectura | Promoción lectora |

### Políticas de Seguridad (RLS)
- **Profiles:** Cada usuario ve su perfil; Directivos ven todos
- **Alumnos:** Directivos CRUD completo; Staff solo lectura
- **Incidencias:** Docentes/Prefectura crean; Directivos administran
- **Salud:** Solo Enfermería y Directivos; Staff ve alertas generales
- **Socioeconómico Privado:** Solo Trabajo Social y Dirección

---

## 1.5 Motor de Escalación

### Lógica de Patrones (No eventos aislados)
```
1-2 incidencias → Registro silencioso (historial)
3 incidencias   → Notificación automática a especialistas
4+ incidencias  → Generación de Actas, Citatorios, Minutas
```

### Documentos Institucionales Generados
| Tipo | Descripción |
|------|-------------|
| `HECHOS` | Narración de eventos |
| `MINUTA` | Acuerdos de reunión |
| `ACUERDO` | Compromisos formales |
| `CITATORIO` | Convocatoria a padres |
| `DISTANCIA` | Modo a distancia |

---

## 1.6 Identidad Visual "Metro Lab Institucional"

### Slogan Oficial
# **CONECTAMOS CONTIGO**
> _No es marketing. Es una promesa operativa._

### Paleta de Colores por Rol
| Rol/Función | Color Tailwind | Significado |
|-------------|---------------|-------------|
| Docente | `blue-600` | Planeación, grupo |
| Prefectura | `orange-600` | Alerta, urgencia |
| Orientación | `emerald-600` | Apoyo, seguimiento |
| Trabajo Social | `purple-600` | Caso familiar/legal |
| Dirección | `slate-800` | Autoridad |
| Riesgo/Error | `red-600` | Atención inmediata |

### Estética
- Fondo: `bg-slate-50` (papel, nunca negro)
- Tarjetas: `bg-white` con `shadow-sm`
- Tipografía: Inter/Roboto, `uppercase font-black` para títulos
- Bordes superiores de color para indicar función

### Prohibido
- Degradados neón, Cyberpunk
- Glassmorphism saturado
- Ilustraciones 3D tipo startup
- Animaciones de rebote excesivas

---

## 1.7 Módulos del Sistema

```typescript
enum AppModule {
  DASHBOARD,         // Vista general
  INSCRIPCIONES,     // Alta de alumnos
  ARCHIVO,           // Expedientes
  AGENDA,            // Calendario
  REPORTES,          // Informes
  NOTIFICATIONS,     // Alertas
  BITACORA,          // Registro diario
  SOLICITUDES,       // Peticiones
  PROTOCOLOS,        // Procedimientos
  CALIFICACIONES,    // Notas
  DOCUMENTACION,     // Generación de docs
  MIS_GRUPOS,        // Para docentes
}
```

---

## 1.8 Protocolos Internos

### Tipos de Protocolo
| Tipo | Descripción |
|------|-------------|
| `convivencia` | Resolución de conflictos |
| `salud` | Emergencias médicas |
| `proteccion_civil` | Sismos, evacuaciones |
| `apoyo` | Acompañamiento socioemocional |

### Estructura de Protocolo
```typescript
interface Protocol {
  titulo: string;
  tipo: ProtocolType;
  objetivo: string;
  activacion: string;        // Condición de disparo
  fuente: string;            // Base normativa
  roles_responsables: string[];
}
```

---

## 1.9 Checklist de Producción

- [ ] Cero errores 400 en consola
- [ ] Datos reales en Supabase (sin mocks)
- [ ] PDFs institucionales operativos
- [ ] Notificaciones entre roles en tiempo real
- [ ] Seguimientos visibles y trazables
- [ ] IA contextual funcionando

---

# PARTE 2: MARCO NORMATIVO EDUCATIVO MEXICANO

## 2.1 Plan de Estudios 2022 - Nueva Escuela Mexicana

### Fundamento Legal
**ACUERDO 14/08/22** publicado en el DOF el 16 de agosto de 2022.
Establece el Plan de Estudio para educación preescolar, primaria y secundaria.

**URL oficial:** http://www.dof.gob.mx/2022/SEP/ANEXO_DEL_ACUERDO_14_08_22.pdf

### Características Principales
1. **Enfoque humanista** - Desarrollo integral del ser humano
2. **Educación contextualizada** - Responde a realidades locales
3. **Autonomía curricular** - Flexibilidad para escuelas
4. **Ejes articuladores** transversales
5. **Campos formativos** en lugar de asignaturas aisladas

### Fases Educativas
| Fase | Nivel | Grados |
|------|-------|--------|
| 1 | Educación Inicial | 0-3 años |
| 2 | Preescolar | 1°, 2°, 3° |
| 3 | Primaria | 1°, 2° |
| 4 | Primaria | 3°, 4° |
| 5 | Primaria | 5°, 6° |
| **6** | **Secundaria** | **1°, 2°, 3°** |

---

## 2.2 Fase 6: Educación Secundaria (NEM)

### Campos Formativos
1. **Lenguajes** - Comunicación oral, escrita, artística
2. **Saberes y Pensamiento Científico** - Matemáticas, ciencias
3. **Ética, Naturaleza y Sociedades** - Historia, formación cívica
4. **De lo Humano y lo Comunitario** - Desarrollo socioemocional

### Programa Sintético
- Documento **oficial federal**
- Contiene contenidos nacionales y PDAs (Procesos de Desarrollo de Aprendizaje)
- Es el punto de partida que requiere contextualización

### Programa Analítico
- Construido por el **colectivo docente de cada escuela**
- Contextualiza el programa sintético a la realidad local
- Tres fases de elaboración:
  1. Análisis de la realidad educativa
  2. Codiseño de contenidos locales
  3. Reflexión pedagógica

### Ejes Articuladores
- Inclusión
- Pensamiento crítico
- Interculturalidad crítica
- Igualdad de género
- Vida saludable
- Apropiación de las culturas a través de la lectura y la escritura
- Artes y experiencias estéticas

---

## 2.3 Ley General de Educación (LGE)

### Fundamento
Última reforma: **7 de junio de 2024** (actualizada 15/01/2026)
Base: Artículo 3° Constitucional

### Artículos Principales para Educación Básica

| Artículo | Contenido |
|----------|-----------|
| **1°** | Garantiza derecho a la educación (orden público) |
| **2°** | Prioriza interés superior de NNA |
| **3°** | Fomenta participación de todos los actores |
| **4°** | Obligatoriedad de preescolar, primaria, secundaria |
| **15°** | Fines de la educación (desarrollo integral) |
| **16°** | Criterios: obligatoria, universal, inclusiva, pública, gratuita, laica |
| **23°** | SEP determina planes y programas |

### Criterios de la Educación (Art. 16)
- **Obligatoria** - Derecho exigible
- **Universal** - Para todos sin distinción
- **Inclusiva** - Atención a la diversidad
- **Pública** - Servicio del Estado
- **Gratuita** - Sin costo
- **Laica** - Sin religión oficial

---

## 2.4 Marco para la Convivencia Escolar (AEFCM)

### Fundamento
Publicado por la **Autoridad Educativa Federal en la Ciudad de México** (AEFCM) en 2023.

### Objetivos
1. Promover ambientes de convivencia armónica, pacífica, inclusiva y democrática
2. Fomentar cultura de paz
3. Desarrollar habilidades socioemocionales
4. Educación inclusiva

### Cambios Clave
- El término "consecuencias disciplinarias" cambia a **"acciones formativas"**
- Incluye estrategias para uso responsable de TIC
- Aborda conductas de riesgo (retos virales, sustancias)

### Aplicación en SASE
- Toda incidencia de tipo `conducta` debe seguir el Marco de Convivencia
- Las escalaciones respetan el principio de acciones formativas
- La generación de documentos refleja el enfoque restaurativo

---

## 2.5 UDEII y Barreras para el Aprendizaje (BAP)

### ¿Qué es UDEII?
**Unidad de Educación Especial y Educación Inclusiva**
- Guía y apoya al personal escolar
- Implementa estrategias para identificar y minimizar BAP
- Asegura oportunidades equitativas

### Definición de BAP
> "Obstáculos que impiden a los estudiantes acceder y ejercer su derecho a la educación"

**Las BAP NO son características del estudiante**, sino problemas del contexto educativo.

### Tipos de BAP
| Tipo | Ejemplos |
|------|----------|
| **Estructurales** | Infraestructura no accesible |
| **Normativas** | Reglamentos excluyentes |
| **Didácticas** | Currículo rígido, métodos inflexibles |
| **Actitudinales** | Percepciones negativas, sobreprotección |

### Protocolo UDEII en SASE
1. **Identificación** - Diagnóstico de culturas, políticas y prácticas
2. **Clasificación** - Categorizar los tipos de BAP
3. **Intervención** - Adaptaciones, capacitación, materiales
4. **Monitoreo** - Evaluación continua

### Manejo en SASE
```typescript
interface BAPInfo {
  hasBAP: boolean;
  diagnosisPrivate: string;    // Solo visible para UDEII
  accommodations: string[];    // Visible para docentes
  lastUpdated: string;
}
```

---

## 2.6 USICAMM (Carrera de las Maestras y los Maestros)

### Fundamento Legal
**Ley General del Sistema para la Carrera de las Maestras y los Maestros (LGSCMM)**
Publicada: 30 de septiembre de 2019

### ¿Qué es USICAMM?
Órgano administrativo desconcentrado de la SEP que regula:
- **Admisión** al servicio docente
- **Promoción** horizontal y vertical
- **Reconocimiento** al desempeño destacado

### Procesos Principales
1. Convocatorias de admisión (nuevos maestros)
2. Promoción a funciones directivas
3. Horas adicionales
4. Incentivos y estímulos

### Perfiles e Indicadores 2024
- Alineados con la Nueva Escuela Mexicana
- Consideran contexto socioeducativo
- Evalúan competencias docentes integrales

---

## 2.7 SIPINNA y Protección de NNA

### ¿Qué es SIPINNA?
**Sistema Nacional de Protección Integral de Niñas, Niños y Adolescentes**
- Coordina políticas de protección entre los tres niveles de gobierno
- Establece protocolos de actuación

### Fundamento Legal
**Ley General de los Derechos de Niñas, Niños y Adolescentes**

### Obligaciones de Escuelas
1. Prestar servicios en condiciones óptimas
2. Garantizar ambiente de convivencia armónica
3. Implementar mecanismos de atención a violaciones de derechos
4. Conformar instancia multidisciplinaria para casos de violencia
5. Elaborar **protocolos de actuación** para acoso y violencia escolar

### Protocolos Clave
| Protocolo | Ámbito |
|-----------|--------|
| Prevención de Violencia contra NNA | SIPINNA Nacional |
| Protección en Seguridad Escolar | Entornos seguros |
| Abuso Sexual Infantil | Detección y actuación |
| Acoso Escolar | Prevención y respuesta |

### Prohibiciones
- **Operativo Mochila Segura** prohibido como medida rutinaria
- Solo permitido en situaciones de urgencia con enfoque de DDHH

---

## 2.8 Guías Operativas de Escuelas de Educación Básica

### Fuente
**AEFCM** (para escuelas en CDMX)
Secretarías estatales de educación (para otros estados)

### Contenido Típico
1. Calendario escolar y días efectivos
2. Horarios de operación
3. Procesos de inscripción y reinscripción
4. Control de asistencia
5. Evaluación y acreditación
6. Expedientes escolares
7. Relación con padres de familia
8. Protocolos de seguridad

### Aplicación en SASE
- Los horarios de atención siguen las guías operativas
- La generación de citatorios respeta horarios oficiales
- Los expedientes cumplen con los requisitos documentales

---

## 2.9 Programas Sociales Relevantes

### Beca Benito Juárez para Educación Básica
- Apoyo económico a familias en situación de vulnerabilidad
- Administrado por la Secretaría del Bienestar
- Beneficiarios identificables en el sistema

### Programa Nacional de Convivencia Escolar (PNCE)
- Desarrollo de habilidades socioemocionales
- Materiales para docentes y alumnos
- Talleres para padres

### Alimentación Escolar
- Desayunos escolares en zonas prioritarias
- Coordinación con DIF

---

## 2.10 Dependencias y Contactos Clave

| Dependencia | Función | Cuándo contactar |
|-------------|---------|-----------------|
| **SIPINNA Local** | Protección NNA | Casos de violencia grave |
| **DIF** | Desarrollo Familiar | Situaciones de riesgo familiar |
| **Fiscalía** | Delitos | Abuso, violencia |
| **CNDH/CDHCM** | Derechos Humanos | Violaciones a derechos |
| **AEFCM** | Autoridad Educativa | Consultas normativas |
| **UDEII Zona** | Inclusión | Diagnósticos, BAP |

---

# PARTE 3: ALINEACIÓN SASE-NORMATIVA

## 3.1 Correspondencia de Roles SASE ↔ Estructura SEP

| Rol SASE | Equivalente Normativo |
|----------|----------------------|
| Directivo | Director/Subdirector (Estructura orgánica SEP) |
| Docente | Personal docente frente a grupo |
| Docente Tutor | Tutor de grupo (asignación formal) |
| Prefectura | Personal de apoyo a la supervisión de alumnos |
| Orientación | Orientador Educativo |
| Trabajo Social | Trabajador Social Escolar |
| Enfermería | Personal de apoyo médico escolar |
| Secretaría | Personal administrativo |
| UDEII | Enlace con Unidad de Educación Especial |
| Promotora | Enlace de Fomento a la Lectura |

## 3.2 Motor de Escalación ↔ Marco de Convivencia

| Nivel SASE | Acción Marco Convivencia |
|------------|--------------------------|
| 1-2 incidencias | Diálogo formativo, registro |
| 3 incidencias | Entrevista con tutor, plan de mejora |
| 4+ incidencias | Citatorio a padres, acuerdos formales |
| Persistente | Canalización a especialistas externos |

## 3.3 Datos Sensibles ↔ Protección de NNA

| Dato | Clasificación | Acceso en SASE |
|------|--------------|----------------|
| CURP | Identificación | Secretaría, Dirección |
| Diagnóstico médico | Sensible | Enfermería, Dirección |
| Diagnóstico BAP | Sensible | UDEII, Dirección |
| Situación familiar | Sensible | Trabajo Social, Dirección |
| Calificaciones | Personal | Docentes, Tutor, Dirección |

---

# PARTE 4: REGLAS SUPREMAS

## 4.1 Regla de Oro SASE
> **"Si una decisión técnica o de diseño contradice el CONTEXTO_SASE.md, la decisión es incorrecta."**

## 4.2 Regla de Protección
> **"El interés superior del niño, niña o adolescente prevalece sobre cualquier otra consideración."**

## 4.3 Regla de Evidencia
> **"Lo que no se documenta, se olvida. SASE existe para que no se olvide nada."**

## 4.4 Regla de IA
> **"La IA observa, detecta patrones, sugiere y acompaña. NUNCA decide, sanciona o sustituye al humano."**

---

# APÉNDICE: URLs de Referencia

| Documento | URL |
|-----------|-----|
| Plan de Estudios 2022 | http://www.dof.gob.mx/2022/SEP/ANEXO_DEL_ACUERDO_14_08_22.pdf |
| Ley General de Educación | https://www.diputados.gob.mx/LeyesBiblio/pdf/LGE.pdf |
| LGSCMM (USICAMM) | https://www.diputados.gob.mx/LeyesBiblio/pdf/LGSCMM.pdf |
| Ley de Derechos NNA | https://www.diputados.gob.mx/LeyesBiblio/pdf/LGDNNA.pdf |
| SIPINNA | https://www.gob.mx/sipinna |
| AEFCM | https://www.aefcm.gob.mx |
| SEP Nueva Escuela Mexicana | https://www.sep.gob.mx |

---

**Documento generado para uso exclusivo de NotebookLM como fuente de consulta del proyecto SASE-310.**
