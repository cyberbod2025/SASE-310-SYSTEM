# PRD SASE-310 para Testing Automatizado

## Resumen del producto

**SASE-310** es el **Sistema de Acompañamiento y Seguimiento Escolar** de una institución educativa real. Su propósito es centralizar el acompañamiento institucional de estudiantes, el registro de incidencias, el seguimiento operativo por rol y la consulta de información escolar con trazabilidad.

SASE-310 no es un sistema punitivo. Es una plataforma de operación escolar orientada al acompañamiento, la intervención temprana y la coordinación institucional entre docencia, prefectura, orientación, trabajo social y directivos.

## Regla de oro del producto

**SASE acompaña procesos, no persigue errores.**

Esta regla debe reflejarse en el tono del producto, en la presentación de alertas, en el onboarding y en los módulos visibles para usuarios nuevos. La interfaz debe reducir fricción y sobrecarga cognitiva, especialmente durante los primeros días de uso.

## Objetivo de este documento

Este documento existe para que **TestSprite** ejecute pruebas automatizadas del frontend con una comprensión funcional del producto.

El foco principal de testing inicial debe ser:

- validar la experiencia de navegación principal
- validar el onboarding progresivo 30-60-90
- validar que un usuario nuevo en **Fase 1** no vea módulos avanzados
- validar que la UI mantenga una experiencia clara, táctil y consistente

## Visión del producto

Como sistema institucional, SASE-310 debe permitir que el personal escolar:

- consulte información relevante sin depender de procesos manuales
- registre incidencias y seguimiento con contexto institucional
- detecte patrones de riesgo sin recalcular lógica crítica en frontend
- trabaje con interfaces simples, orientadas a tareas y seguras por rol

El producto debe sentirse como una herramienta de operación confiable, no como un panel técnico experimental.

## Alcance funcional a probar

Las pruebas automatizadas deben concentrarse primero en estos flujos visibles del frontend:

- acceso al layout principal
- navegación por sidebar
- visibilidad progresiva de módulos según onboarding
- acceso al módulo de `Tablero`
- acceso al módulo de `Asistencia`
- acceso al flujo de `Reporte Rápido` dentro del dashboard docente
- ocultamiento o bloqueo de módulos avanzados durante Fase 1

## Roles relevantes para testing inicial

Para esta primera ronda, el rol más importante es:

- `docente`

También puede ser útil validar:

- `docente_tutor`

No deben usarse como referencia de restricciones de onboarding:

- `developer`
- `system_admin`

Estos roles tienen privilegios ampliados y no representan el flujo normal de adopción.

## Lógica crítica de onboarding 30-60-90

La lógica del onboarding se calcula a partir de la fecha de creación del usuario o perfil.

Fases reales implementadas en frontend:

- **Fase 1**: 0 a 30 días
- **Fase 2**: 31 a 60 días
- **Fase 3**: 61 días o más

### Regla funcional por fase

#### Fase 1

Usuario nuevo. El sistema debe reducir complejidad y mostrar solo herramientas esenciales.

Módulos permitidos en la lógica base:

- `Tablero`
- `Asistencia`

Adicionalmente, para usuarios `docente` y `docente_tutor`, el sidebar muestra una entrada específica de onboarding:

- `Detección Pedagógica`

Dentro del dashboard docente también existe una acción visible relacionada con:

- `Reporte Rápido`

### Requisito crítico de testing para Fase 1

Cuando el usuario está en **Fase 1** y su rol es `docente` o `docente_tutor`, TestSprite debe comprobar que:

- puede ver `Tablero`
- puede ver `Asistencia`
- puede ver la herramienta inicial `Detección Pedagógica` si aplica
- puede usar el contexto de `Reporte Rápido` desde la experiencia docente
- **no puede ver** `Expedientes`
- **no puede ver** `Agenda`
- **no puede ver** `Incidencias`
- **no puede ver** `Protocolos`
- **no puede ver** módulos avanzados de operación institucional

### Nota importante para el agente de testing

El pedido funcional del proyecto habla de `Reporte Rápido`, pero en la implementación actual el sidebar restringido de Fase 1 utiliza una entrada llamada **`Detección Pedagógica`**, mientras que `Reporte Rápido` aparece dentro del dashboard docente.

Por lo tanto, el testing debe validar ambas cosas:

- la navegación mínima visible en sidebar
- la existencia del flujo rápido dentro del dashboard docente

#### Fase 2

Usuario en adopción intermedia.

Módulos habilitados por lógica:

- `Tablero`
- `Asistencia`
- `Expedientes`
- `Protocolos`

#### Fase 3

Usuario con adopción madura.

- acceso total según rol

## Historias de usuario para testing

### Historia 1: Acceso seguro para docente nuevo

Como `docente` recién creado, quiero entrar al sistema y ver solo los módulos esenciales para iniciar mi operación sin sentir sobrecarga.

**Criterios de aceptación**

- el sidebar muestra `Tablero`
- el sidebar muestra `Asistencia`
- el sidebar no muestra `Expedientes`
- el sidebar no muestra `Agenda`
- el sidebar no muestra `Incidencias`
- el sidebar no muestra `Protocolos`

### Historia 2: Onboarding guiado y acotado

Como `docente_tutor` en sus primeros 30 días, quiero contar con accesos operativos mínimos y claros para comenzar a usar la plataforma.

**Criterios de aceptación**

- el sistema calcula al usuario dentro de `Fase 1`
- se aplica la restricción visual de módulos
- la navegación no expone herramientas avanzadas
- la interfaz prioriza claridad sobre densidad funcional

### Historia 3: Registro rápido desde experiencia docente

Como `docente` en onboarding, quiero poder identificar un acceso de acción rápida para mi trabajo cotidiano sin navegar por módulos avanzados.

**Criterios de aceptación**

- el usuario puede abrir `Tablero`
- dentro del dashboard existe una acción o sección visible de `Reporte Rápido`
- ese flujo no requiere acceso a `Expedientes` para ser descubierto

### Historia 4: Desbloqueo progresivo

Como usuario con más tiempo en la plataforma, quiero ver más herramientas conforme avanzo en adopción.

**Criterios de aceptación**

- en `Fase 2` ya aparece `Expedientes`
- en `Fase 2` ya aparece `Protocolos`
- en `Fase 3` desaparecen las restricciones de onboarding

## Requisitos visuales de la interfaz

La UI utiliza una mezcla intencional de componentes con identidad visual marcada.

Conceptos visuales clave:

- componentes táctiles tipo **Neo-Tactile**
- tarjetas translúcidas tipo **Liquid Glass**
- sidebar con sensación de cristal institucional
- acentos luminosos y profundidad visual

### Qué debe revisar TestSprite en lo visual

- la interfaz carga sin elementos superpuestos de forma evidente
- el sidebar es visible y navegable
- los módulos del menú son distinguibles como elementos interactivos
- las tarjetas y contenedores principales mantienen contraste suficiente para lectura
- el contenido principal no queda oculto detrás del sidebar ni de overlays móviles

## Riesgos a detectar en la primera ronda de pruebas

- un usuario de `Fase 1` ve módulos que deberían estar ocultos
- un usuario de `Fase 1` puede navegar hacia `Expedientes`
- el sidebar muestra más opciones de las debidas para `docente`
- `Reporte Rápido` no es visible o no se puede alcanzar desde el flujo docente
- la UI carga con glitches visuales, capas rotas o navegación bloqueada
- el layout móvil deja overlays abiertos que impiden interacción

## Suposiciones de testing

- el entorno local está corriendo en `http://localhost:3000` o `http://localhost:3100`
- existe una forma de autenticarse o simular un usuario `docente`
- el usuario de prueba puede representarse con una fecha de creación reciente para forzar `Fase 1`

## Escenarios de prueba prioritarios

### Escenario A: Docente nuevo en Fase 1

- abrir la aplicación
- autenticar o simular usuario `docente`
- forzar perfil reciente
- confirmar visibilidad de `Tablero`
- confirmar visibilidad de `Asistencia`
- confirmar ausencia de `Expedientes`
- confirmar ausencia de módulos avanzados
- abrir `Tablero`
- localizar `Reporte Rápido` o la acción equivalente en la vista docente

### Escenario B: Docente en Fase 2

- autenticar o simular usuario con 31 a 60 días
- confirmar que aparece `Expedientes`
- confirmar que aparece `Protocolos`

### Escenario C: Robustez visual del layout

- validar carga del sidebar
- validar estados hover/click básicos
- validar que el contenido principal responda al cambio de módulo
- revisar consola del navegador si TestSprite lo soporta

## Resultado esperado del testing

TestSprite debe producir hallazgos orientados a:

- regresiones de onboarding
- problemas de visibilidad de módulos
- errores de navegación del sidebar
- defectos visuales severos
- inconsistencias entre la intención del producto y la implementación actual

## Nota final para testing automatizado

Si el agente encuentra discrepancias entre el producto esperado y el código visible, debe reportarlas explícitamente. En particular:

- el producto esperado menciona `Reporte Rápido` como herramienta esencial
- la implementación actual restringe por sidebar usando `Detección Pedagógica`
- `Reporte Rápido` está presente dentro del dashboard docente

Esa diferencia no debe ocultarse. Debe reportarse como detalle funcional relevante del onboarding actual.
