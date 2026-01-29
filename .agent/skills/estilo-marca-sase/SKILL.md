---
name: estilo-marca-sase
description: Guía OFICIAL de identidad, diseño y tono de voz para SASE (Plataforma Institucional).
---

# 🎨 Identidad Oficial SASE (Actualización 2026) -> "CONECTAMOS CONTIGO"

> **MANDATO ABSOLUTO**: La identidad de SASE no es negociable.
> No es una startup. No es un videojuego. No es "techy".
> **SASE es una institución seria que respalda a su gente en momentos de presión.**

## 1. El Slogan (LA REGLA DE ORO)

El único slogan permitido es:

# **CONECTAMOS CONTIGO**

- **Prohibido**: Modificarlo, añadir subtítulos, explicarlo, traducirlo o usar variantes creativas.
- **Uso**: Siempre asociado al logo, como cierre de narrativas o en encabezados principales.
- **Significado**: No es marketing. Es una promesa operativa: conectamos roles, datos y personas para resolver el caos.

## 2. Estilo Visual: "Metro Lab Institucional"

La estética debe evocar orden, limpieza y profesionalismo administrativo.

- **Fondo Base**: `bg-slate-50` (Blanco hueso/papel, nunca negro ni azul oscuro gamer).
- **Contenedores**:
  - Tarjetas blancas (`bg-white`) con sombras suaves (`shadow-sm`).
  - **Bordes Superiores de Color** (`border-t-4`) para indicar función/estado.
  - Diseño cuadrado o con radio mínimo (`rounded-sm` o `rounded-md`), evitando curvas excesivas tipo iOS.
- **Tipografía**:
  - Títulos: Fuente Sans (Inter/Roboto) en **Negritas/Black**, Mayúsculas para encabezados (`uppercase font-black`).
  - Color Texto: `text-slate-800` (Gris plomo, nunca negro puro #000).
  - Subtextos: `text-slate-500` o `text-slate-400`.

## 3. Paleta de Colores por Rol (Semántica Estricta)

El color no es decorativo, es funcional. Indica quién está operando o de qué trata la tarjeta.

| Rol / Función      | Color Tailwind | Significado                  |
| :----------------- | :------------- | :--------------------------- |
| **Docente**        | `blue-600`     | Planeación, Grupo, Lista     |
| **Prefectura**     | `orange-600`   | Alerta, Incidencia, Urgencia |
| **Orientación**    | `emerald-600`  | Salud, Seguimiento, Apoyo    |
| **Trabajo Social** | `purple-600`   | Caso familiar, Legal         |
| **Dirección**      | `slate-800`    | Autoridad, Reporte Final     |
| **Riesgo/Error**   | `red-600`      | Atención Inmediata           |
| **Info/Neutro**    | `slate-400`    | Datos generales              |

## 4. Narrativa Visual (El Parallax SASE)

La Landing Page no es un anuncio, es una **historia de resolución**.

1.  **FASE 1: El Caos (Problema)**
    - _Visual_: Imágenes difusas de fondo (pasillos, escritorios llenos de papeles).
    - _Elementos_: Globos de texto flotando, desordenados.
    - _Contenido_: Frases reales de dolor ("¿Quién tiene la bitácora?", "No me avisaron", "Se perdió el reporte").
    - _Sensación_: Agobio, ruido, desconexión.

2.  **FASE 2: El Orden (Transición)**
    - _Visual_: Los elementos flotantes se alinean. Las imágenes difusas se aclaran o desaparecen hacia un fondo limpio.
    - _Acción_: El sistema "toma el control" suavemente.

3.  **FASE 3: La Conexión (Resolución)**
    - _Visual_: Pantalla limpia, logo SASE centrado.
    - _Texto_: **CONECTAMOS CONTIGO** (Solo eso. Limpio).
    - _Sensación_: Alivio, respaldo, claridad.

## 5. Componentes UI Autorizados (Checklist)

### ✅ Permitido (DO)

- Botones sólidos con texto en mayúsculas (`font-bold uppercase`).
- Iconos Material Symbols (Google Fonts) simples.
- Modales limpios con bordes de color superior.
- Listas de datos densas pero legibles (Tablas estilo Excel limpio).

### ❌ Prohibido (DON'T)

- Degradados neón o "Cyberpunk".
- Efectos de vidrio excesivos (Glassmorphism saturado).
- Ilustraciones 3D tipo "Startup" (monigotes azules).
- Animaciones de rebote excesivas.

## 6. Tono de Voz

- **Directo**: "Registrar Asistencia", no "¡Vamos a pasar lista!".
- **Profesional**: "Incidencia Reportada", no "Ups, algo salió mal".
- **Empático pero Serio**: Entendemos la presión escolar, no la trivializamos.

---

**Regla de Oro para el Desarrollador (Antigravity):**

> "Si el diseño no hace que un docente, prefecto o director se sienta acompañado en un momento real de presión, entonces no es SASE."
