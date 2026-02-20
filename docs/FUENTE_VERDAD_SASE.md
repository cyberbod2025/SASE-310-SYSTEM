# 📚 FUENTE DE VERDAD ÚNICA - SASE-310

## Base de Conocimiento para NotebookLM

> **Versión:** 2.0 | **Fecha Actualización:** 2026-02-19
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

| Componente   | Tecnología                | Función                                     |
| ------------ | ------------------------- | ------------------------------------------- |
| **Backend**  | Supabase (PostgreSQL)     | Almacenamiento, RLS, auditoría              |
| **Frontend** | React + Vite + TypeScript | Interfaz premium Glassmorphism              |
| **Estilos**  | Tailwind CSS              | Sistema de diseño "Metro Lab Institucional" |
| **IA**       | Copiloto contextual       | Sugiere acciones, no decide                 |

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

| Estado                      | Descripción                  | Disparador          |
| --------------------------- | ---------------------------- | ------------------- |
| `En Seguimiento Preventivo` | Observación silenciosa       | 1-2 incidencias     |
| `Atención Prioritaria`      | Notificación a especialistas | 3 incidencias       |
| `Acompañamiento Intensivo`  | Intervención formal          | 4+ incidencias      |
| `Acompañamiento Concluido`  | Caso cerrado                 | Resolución positiva |

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

| Rol              | Etiqueta       | Función Principal                     |
| ---------------- | -------------- | ------------------------------------- |
| `directivo`      | Dirección      | Visión macro, decisiones estratégicas |
| `docente`        | Docente        | Sensor académico                      |
| `docente_tutor`  | Docente Tutor  | Acompañante de grupo                  |
| `prefectura`     | Prefectura     | Primera línea operativa               |
| `orientacion`    | Orientación    | Análisis humano, contención           |
| `trabajo_social` | Trabajo Social | Casos familiares, legales             |
| `enfermeria`     | Enfermería     | Bitácora clínica                      |
| `secretaria`     | Secretaría     | Integridad documental                 |
| `udeii`          | UDEII          | Inclusión, BAP                        |

## 1.5 Proceso de Registro y Validación de Identidad (Protocolo de Seguridad)

Para garantizar que solo el personal autorizado de la **ESD 310** tenga acceso a datos sensibles de los menores, se ha implementado un **Protocolo de Alta Jerárquica**:

### Fase 1: Activación de la Dirección (Nivel 0)

- El **Desarrollador (SuperAdmin)** valida y activa la cuenta del Director Escolar (Miguel).
- Se le otorgan privilegios de Administrador del Sistema.

### Fase 2: Solicitud del Personal (Wizard de Identidad)

- El docente/administrativo escanea el **Código QR Institucional**.
- Completa el "Wizard de Bienvenida" y acepta los términos de privacidad.
- El sistema genera una solicitud con estado `PENDIENTE`.

### Fase 3: Aprobación por Dirección (Gestión Interna)

- El Director ingresa a su **Panel de Control > Gestión de Personal**.
- Revisa las solicitudes pendientes y valida la identidad del solicitante (interno).
- Aprueba la solicitud con un clic, activando inmediatamente las credenciales y permisos RLS del usuario.
  _Nota: No es necesario una validación presencial externa; la validación es interna por la autoridad del plantel._

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

| Tipo        | Descripción           |
| ----------- | --------------------- |
| `HECHOS`    | Narración de eventos  |
| `MINUTA`    | Acuerdos de reunión   |
| `ACUERDO`   | Compromisos formales  |
| `CITATORIO` | Convocatoria a padres |
| `DISTANCIA` | Modo a distancia      |

---

## 1.6 Identidad Visual "Metro Lab Institucional"

### Slogan Oficial

# **CONECTAMOS CONTIGO**

> _No es marketing. Es una promesa operativa._

### Paleta de Colores por Rol

| Rol/Función    | Color Tailwind | Significado         |
| -------------- | -------------- | ------------------- |
| Docente        | `blue-600`     | Planeación, grupo   |
| Prefectura     | `orange-600`   | Alerta, urgencia    |
| Orientación    | `emerald-600`  | Apoyo, seguimiento  |
| Trabajo Social | `purple-600`   | Caso familiar/legal |
| Dirección      | `slate-800`    | Autoridad           |
| Riesgo/Error   | `red-600`      | Atención inmediata  |

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
  DASHBOARD, // Vista general
  INSCRIPCIONES, // Alta de alumnos
  ARCHIVO, // Expedientes
  AGENDA, // Calendario
  REPORTES, // Informes
  NOTIFICATIONS, // Alertas
  BITACORA, // Registro diario
  SOLICITUDES, // Peticiones
  PROTOCOLOS, // Procedimientos
  CALIFICACIONES, // Notas
  DOCUMENTACION, // Generación de docs
  MIS_GRUPOS, // Para docentes
}
```

---

## 1.8 Protocolos Internos

### Tipos de Protocolo

| Tipo               | Descripción                          |
| ------------------ | ------------------------------------ |
| `seguridad`        | Abuso Sexual (ASI) y Maltrato        |
| `legal`            | Prevención de Drogas y Adicciones    |
| `convivencia`      | Protocolo de Convivencia Escolar     |
| `salud`            | Actuación Docente ante Contingencias |
| `proteccion_civil` | Protocolo de Videovigilancia         |
| `apoyo`            | Perfil BAP (UDEII) / Inclusión       |

### Estructura de Protocolo

```typescript
interface Protocol {
  titulo: string;
  tipo: ProtocolType;
  objetivo: string;
  activacion: string; // Condición de disparo
  fuente: string; // Base normativa
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

# PARTE 2: MARCO NORMATIVO EDUCATIVO MEXICANO (ACTUALIZADO 2026)

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

| Fase  | Nivel             | Grados         |
| ----- | ----------------- | -------------- |
| 1     | Educación Inicial | 0-3 años       |
| 2     | Preescolar        | 1°, 2°, 3°     |
| 3     | Primaria          | 1°, 2°         |
| 4     | Primaria          | 3°, 4°         |
| 5     | Primaria          | 5°, 6°         |
| **6** | **Secundaria**    | **1°, 2°, 3°** |

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

| Artículo | Contenido                                                              |
| -------- | ---------------------------------------------------------------------- |
| **1°**   | Garantiza derecho a la educación (orden público)                       |
| **2°**   | Prioriza interés superior de NNA                                       |
| **3°**   | Fomenta participación de todos los actores                             |
| **4°**   | Obligatoriedad de preescolar, primaria, secundaria                     |
| **15°**  | Fines de la educación (desarrollo integral)                            |
| **16°**  | Criterios: obligatoria, universal, inclusiva, pública, gratuita, laica |
| **23°**  | SEP determina planes y programas                                       |

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

Publicado por la **Autoridad Educativa Federal en la Ciudad de México** (AEFCM).
Este documento sustituye los reglamentos punitivos tradicionales.

### Objetivos

1. Promover ambientes de convivencia armónica, pacífica, inclusiva y democrática.
2. Fomentar la **Cultura de Paz** y el respeto a los Derechos Humanos.
3. Establecer **Acciones Formativas** en lugar de castigos.

### Clasificación de Faltas y Medidas

Las conductas contrarias a la convivencia se clasifican en niveles, cada uno con una intervención progresiva:

**TIPOS DE FALTAS (Niveles):**

1.  **Faltas Leves (Nivel I):** Conductas que dificultan la convivencia pero no ponen en riesgo la integridad (ej. llegar tarde, no traer material, distraerse).
2.  **Faltas Moderadas (Nivel II):** Reincidencia en faltas leves o conductas que afectan el desarrollo de actividades (ej. uso de celular no autorizado, faltar al respeto a compañeros).
3.  **Faltas Graves (Nivel III):** Transgresiones que vulneran la integridad física o emocional (ej. peleas, bullying, daños al patrimonio).
4.  **Faltas Gravísimas (Nivel IV y V):** Posesión de armas, sustancias, violencia severa, delitos.

### Acciones Formativas (Progresión Obligatoria)

El sistema SASE debe seguir este flujo antes de cualquier sanción mayor:

1.  **Diálogo Reflexivo:** Docente ↔ Alumno.
2.  **Compromiso Escrito:** Alumno firma acuerdo de mejora.
3.  **Inclusión Familiar:** Citatorio a Padres/Tutores para establecer corresponsabilidad.
4.  **Círculo Restaurativo:** Dinámica de reparación del daño con afectados.
5.  **Canalización:** A servicios de apoyo (UDEII, Psicología, Centros de Salud).
6.  **Medida Disciplinaria:** Suspensión temporal sugerida (último recurso), siempre con actividades académicas a distancia.

> **IMPORTANTE:** Está prohibida la expulsión definitiva o negar el servicio educativo como primera medida.

---

## 2.5 Guía Operativa para Escuelas Secundarias (CDMX)

### Función

Documento normativo de la AEFCM que regula la operación diaria de los planteles.

### Aspectos Clave para SASE

1.  **Horarios:** Regula la jornada escolar, entradas y salidas. SASE debe considerar retardos según la tolerancia oficial (normalmente 10-15 mins).
2.  **Seguridad Escolar:** Define los protocolos de "Mochila Segura" (que ahora es "Revisión de Útiles" consensuada) y entrega de alumnos.
3.  **Protección Civil:** Obliga a tener comités de seguridad y realizar simulacros.
4.  **Uso de Tecnología:** Regula cuándo y cómo se pueden usar dispositivos electrónicos en aula.

---

## 2.6 Protocolos de Protección Civil y Seguridad

### 1. SISMO

- **Antes:** Simulacros (4 al año mínimo). Identificación de zonas de menor riesgo.
- **Durante:**
  - **Alerta Sísmica ( ~40 seg):** Evacuación hacia zonas de seguridad o repliegue (según piso).
  - **Movimiento:** "No corro, no grito, no empujo".
- **Después:** Revisión estructural rápida. Si hay daño, suspensión de clases.

### 2. INCENDIO

- Uso de extintores (Clase A, B, C).
- Evacuación inmediata por rutas libres de humo.
- Llamada al 911 / Bomberos.

### 3. VIOLENCIA / BALACERA (Protocolo de Seguridad)

- **ACCIÓN CLAVE:** **NO EVACUAR**. Resguardo en el interior (Shelter in Place).
- **Posición:** "Pecho tierra" (tirarse al piso boca abajo, manos a la cabeza, lejos de ventanas).
- **Comunicación:** Silencio absoluto. No usar celulares para no saturar redes ni hacer ruido.

---

## 2.7 Estrategia "Si te drogas, te dañas" (Prevención de Adicciones)

### Contexto

Estrategia nacional de la SEP prioritaria para secundarias y preparatorias.

### Focos de Alerta (Sustancias Críticas)

- **Fentanilo:** "A la primera te mata". Riesgo extremo.
- **Metanfetaminas:** Daño neurológico rápido.
- **Vapeadores:** Mitos de "inocuidad" vs. realidad de daño pulmonar.
- **Cannabis, Alcohol y Tabaco:** Drogas de inicio.

### Implementación en SASE

- **Detección:** El sistema debe permitir registrar "Sospecha de consumo" de forma confidencial (solo visible para Director/Médico/TS).
- **Intervención:** Canalización inmediata a centros de integración juvenil (CIJ) o UNEME-CAPA.
- **Charlas:** Registro de intervenciones preventivas (10-15 min en aula).

---

## 2.8 UDEII y Barreras para el Aprendizaje (BAP)

### ¿Qué es UDEII?

**Unidad de Educación Especial y Educación Inclusiva**. Apoya en la identificación de BAP (Barreras para el Aprendizaje y la Participación).

### Clasificación BAP

1.  **Estructurales:** Acceso físico, infraestructura.
2.  **Normativas:** Leyes o reglamentos que excluyen.
3.  **Didácticas:** Métodos de enseñanza no adaptados.
4.  **Actitudinales:** Prejuicios, rechazo, sobreprotección.

---

## 2.9 Programas Sociales y Apoyos

1.  **Beca Benito Juárez:** Apoyo universal/focalizado para permanencia escolar.
2.  **Mi Beca para Empezar (CDMX):** Apoyo universal en educación básica CDMX.
3.  **La Escuela es Nuestra:** Recursos directos para infraestructura (padres administran).

---

## 2.10 Dependencias y Contactos Clave

| Dependencia            | Función            | Cuándo contactar                                      |
| ---------------------- | ------------------ | ----------------------------------------------------- |
| **SIPINNA**            | Protección NNA     | Violación de derechos, violencia familiar grave.      |
| **DIF / Procuraduría** | Protección Menores | Abandono, maltrato evidente.                          |
| **Fiscalía (FGJ)**     | Delitos            | Hechos tipificados como delito (armas, drogas venta). |
| **AEFCM**              | Autoridad          | Normativa, conflictos escolares graves.               |
| **911**                | Emergencias        | Sismo, incendio, heridos graves.                      |

---

# PARTE 3: ALINEACIÓN SASE-NORMATIVA

## 3.1 Correspondencia de Roles SASE ↔ Estructura SEP

| Rol SASE       | Equivalente Normativo                  |
| -------------- | -------------------------------------- |
| Directivo      | Director/Subdirector (Gestión)         |
| Docente        | Maestro frente a Grupo (Pedagógico)    |
| Tutor          | Tutor de Grupo (Acompañamiento)        |
| Prefectura     | Asistente de Servicios (Vigilancia)    |
| Orientación    | Orientador Educativo (Psicopedagógico) |
| Trabajo Social | Trabajador Social (Sociofamiliar)      |

## 3.2 Motor de Escalación ↔ Marco de Convivencia

| Nivel SASE          | Acción Marco Convivencia                             | Nivel de Falta (Aprox)         |
| ------------------- | ---------------------------------------------------- | ------------------------------ |
| **1-2 incidencias** | Diálogo formativo, registro en bitácora.             | Faltas Leves (Nivel I)         |
| **3 incidencias**   | Compromiso escrito, Citatorio a padres.              | Faltas Moderadas (Nivel II)    |
| **4+ incidencias**  | Carta Compromiso, Acción Restaurativa, Canalización. | Faltas Graves (Nivel III)      |
| **Alerta Roja**     | Protocolo de Seguridad, Notificación Autoridades.    | Faltas Gravísimas (Nivel IV/V) |

## 3.3 Datos Sensibles ↔ Protección de NNA (LGDNNA)

> **Ley General de los Derechos de Niñas, Niños y Adolescentes**
> _Art. 76: Derecho a la intimidad personal y familiar y a la protección de sus datos personales._

**En SASE:**

- Datos como "Diagnóstico Clínico" o "Situación Legal Familiar" están **ENCRIPTADOS** o restringidos por RLS.
- Solo el personal con "necesidad legítima de saber" (Director, Médico, TS) accede a detalles sensibles.
- Docentes ven solo lo necesario para la pedagogía (ej. "Requiere lentes", "Evitar actividad física intensa").

---

# PARTE 4: REGLAS SUPREMAS DE OPERACIÓN

## 4.1 Regla de Oro SASE

> **"Si una decisión técnica o de diseño contradice el CONTEXTO_SASE.md o el Marco Normativo, la decisión es INCORRECTA."**

## 4.2 Regla de Protección

> **"El interés superior del niño, niña o adolescente prevalece sobre cualquier otra consideración administrativa."**

## 4.3 Regla de Evidencia

> **"Lo que no se documenta, se olvida. SASE existe para que no se olvide nada, protegiendo así al alumno y al docente."**

## 4.4 Regla de IA

> **"La IA observa, detecta patrones, sugiere y acompaña. NUNCA decide, sanciona o sustituye al juicio humano ético."**

---

**Documento generado para uso exclusivo de NotebookLM y Antigravity como fuente de verdad absoluta del proyecto SASE-310.**
