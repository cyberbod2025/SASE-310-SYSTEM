# Performance Budget Review

## Propósito
Revisar rendimiento web sin mezclarlo con hotfixes críticos.

## Métricas
- LCP
- CLS
- TTFB
- FCP
- render-blocking
- JS main thread
- third-party impact
- bundle size

## Regla
No optimizar performance dentro de PRs de seguridad, CI o hotfix institucional salvo autorización explícita.

## Recomendaciones típicas
- lazy loading por módulo
- reducir fuentes externas
- evitar icon packs globales
- diferir scripts de terceros
- code splitting
- compresión de imágenes
