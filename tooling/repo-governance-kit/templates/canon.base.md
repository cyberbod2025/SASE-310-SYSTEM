# Canon Brownfield del Repositorio

Estado: Canonico
Objetivo: concentrar reglas verificadas del repo para futuros agentes y mantenedores.

## Fuentes de verdad usadas

- `AGENTS.md`
- `README*`
- manifests raiz (`package.json`, `pyproject.toml`, etc.)
- workflows CI (`.github/workflows/*`)
- config de lint, test, typecheck, formatter y build
- config de workspace/monorepo
- instrucciones locales (`AGENTS.md`, `CLAUDE.md`, `.cursor/rules/`, `.github/copilot-instructions.md`, `opencode.json`)
- puntos de entrada reales del codigo

## 1. Limites reales del repo

- Documenta que carpeta o app es la activa.
- Documenta si existen subapps, prototipos o copias historicas que no deben tocarse por defecto.

## 2. Arquitectura verificada

- Documenta entrypoints reales, boundaries de paquetes y fuentes de verdad de estado/autenticacion.
- Documenta solo wiring y limites que no sean obvios desde nombres de archivo.

## 3. Reglas de build, test y verificacion

- Registra la cadena minima de verificacion con comandos exactos.
- Registra como correr una prueba focalizada.
- Registra que partes del repo no cubren lint/typecheck/test normales.

## 4. Entorno local y gotchas

- Registra puertos, vars requeridas, seeds, codegen o dependencias locales no obvias.
- Registra cualquier desalineacion entre docs heredadas y config ejecutable.

## 5. Seguridad y limites sensibles

- Registra superficies sensibles, secretos, scripts peligrosos y fallbacks historicamente riesgosos.
- Registra que endpoints o funciones deben validar rol real, CORS o auditoria.

## 6. Reglas de datos, permisos y contratos

- Documenta donde viven permisos, tipos compartidos, migraciones, RLS o contratos relevantes.
- Documenta que cambios deben mantenerse sincronizados entre capas.

## 7. Workflows y automatizacion

- Registra orden real de CI, duplicidades, huecos de cobertura y herramientas relevantes.

## 8. Regla de cambio futuro

- Si el cambio afecta seguridad, datos, permisos, onboarding, workflows, integraciones o artefactos de agente, debe abrirse un expediente en `specs/` antes de implementarse.
