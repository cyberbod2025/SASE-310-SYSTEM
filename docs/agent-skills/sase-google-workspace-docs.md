# SASE Google Workspace Docs

## Contexto
El usuario dejó de usar Office como herramienta principal. Todo el flujo documental institucional se basa en Google Workspace.

## Herramientas priorizadas

| Tipo | Plataforma |
|------|-----------|
| Documentos formales | **Google Docs** |
| Registros y tablas | **Google Sheets** |
| Presentaciones | **Google Slides** o **Canva** |
| Documentación de agentes IA | **Markdown** en el repo |
| Exportación final | **PDF** solo cuando se solicite |
| Archivos .docx | Solo si el usuario lo pide explícitamente |

## Reglas de estilo para documentos institucionales
- **Tipografía:** Arial 11 o equivalente.
- **Interlineado:** 1.15 para documentos densos, 1.5 para documentos formales (cartas, actas).
- **Lenguaje:** claro, institucional, objetivo. Evitar adjetivos innecesarios.
- **Estructura:** títulos (Heading 1, 2, 3), subtítulos, listas simples.
- **Tablas:** evitar tablas pesadas si el usuario usará lector de voz. Preferir listas o formato simple.
- **Párrafos:** cortos. Una idea por párrafo.

## Flujo para documentos
1. Confirmar con el usuario el tipo de documento y plataforma objetivo.
2. Redactar en Google Docs (o Markdown si es documentación técnica).
3. Compartir vía link de Drive si se requiere edición colaborativa.
4. Exportar a PDF solo al cierre, cuando el usuario lo solicite.
5. No generar .docx a menos que el usuario lo pida explícitamente.

## Buenas prácticas
- Usar Google Docs para todo lo que antes iba en Word.
- Usar Google Sheets para registros, censos, estadísticas.
- Usar Google Slides o Canva para materiales de proyección o reuniones.
- Mantener los prompts y skills de agentes en Markdown dentro del repo.
- Todo link de Drive debe tener permisos adecuados (cualquiera con el link puede ver/editar según corresponda).
