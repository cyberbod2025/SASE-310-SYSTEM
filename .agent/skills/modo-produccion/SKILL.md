---
name: modo-produccion
description: Revisa una app/landing, detecta problemas típicos, propone mejoras y aplica correcciones con un checklist fijo para dejarlo listo para enseñar o publicar.
---

# Modo Producción (QA + Fix)

Esta habilidad es un control de calidad final. No diseña ni planifica; audita lo existente y lo pule para que sea profesional y presentable.

## Cuándo usar este skill

- Cuando ya tienes algo generado (landing/app) y quieres dejarlo “presentable”.
- Cuando algo funciona “a medias” (móvil raro, imágenes rotas, botones sin acción, espaciados feos).
- Antes de enseñarlo a un cliente, grabarlo o publicarlo.

## Inputs necesarios (si faltan, pregunta primero)

1. **Archivo principal**: Ruta del proyecto o archivo de entrada (ej: `src/App.tsx`).
2. **Objetivo**: ¿"Lista para enseñar" (MVP) o "Lista para publicar" (Producción)?
3. **Restricciones**: No cambiar branding, no tocar copy, no refactorizar estructura profunda, etc.

## Checklist de calidad (Orden fijo)

### A) Funciona y se ve

- [ ] Abre la preview / localhost sin errores de consola.
- [ ] Imágenes cargan correctamente y no hay rutas rotas.
- [ ] Tipografías y estilos (Tailwind) se aplican como deben.

### B) Responsive (Móvil primero)

- [ ] Se ve bien en móvil (sin scroll horizontal accidental).
- [ ] Botones y textos tienen tamaños legibles al tacto (>44px touch targets).
- [ ] Secciones con espaciado vertical coherente (sin apelotonamientos).

### C) Copy y UX básica

- [ ] Titular claro y coherente con la propuesta.
- [ ] CTAs consistentes (mismo verbo, misma intención).
- [ ] No queda texto “placeholder” tipo Lorem Ipsum.

### D) Accesibilidad mínima

- [ ] Contraste razonable en textos (Blanco sobre azul, Negro sobre blanco).
- [ ] Imágenes con texto alternativo (`alt`).
- [ ] Estructura de headings (h1, h2) lógica.

## Workflow (Flujo de trabajo)

1. **Diagnóstico rápido**: Lista de problemas detectados en 5–10 bullets (priorizados por gravedad).
2. **Plan de arreglos**: Define “qué cambiar y por qué” (máximo 8 cambios críticos).
3. **Aplicar cambios**: Modifica los archivos necesarios.
4. **Validación**: Vuelve a revisar contra el checklist.
5. **Resumen final**: Reporta cambios hechos + qué queda como mejora opcional.

## Reglas (Instrucciones)

- **Marca Sagrada**: No cambies el estilo de marca si existe un skill de marca activo (`estilo-marca-sase`).
- **Mínimo esfuerzo, máximo impacto**: No rehagas todo; corrige lo mínimo para ganar calidad rápido.
- **Claridad > Belleza**: Si hay un conflicto entre “se ve bonito” y “se entiende claro”, prioriza la claridad.

## Output (Formato exacto)

Devuelve siempre:

1. **Diagnóstico** (Priorizado).
2. **Cambios aplicados** (Lista técnica corta).
3. **Resultado**: “OK para enseñar” / “OK para publicar” + notas finales.
