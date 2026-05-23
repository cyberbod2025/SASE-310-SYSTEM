# Vercel Deploy Guard

## Propósito
Evitar despliegues manuales o ambiguos que rompan la superficie institucional.

## Reglas absolutas
- No deploy manual sin autorización.
- No promover preview a producción sin autorización.
- No cambiar variables de entorno sin autorización.
- No conectar dominios sin autorización.
- No borrar proyectos Vercel.
- No duplicar superficies institucionales sin dictamen.

## Procedimiento de revisión

1. Listar proyectos/despliegues:
vercel ls

2. Revisar PR/deploy relacionado:
gh pr view <PR>
gh pr checks <PR>

3. Confirmar:
- proyecto Vercel correcto;
- branch correcta;
- commit correcto;
- status READY;
- no variables faltantes;
- no producción accidental.

## Reporte obligatorio
- Proyecto Vercel.
- URL preview.
- Commit desplegado.
- Rama.
- Estado.
- Riesgos.
- Recomendación: usar preview / no usar / bloquear deploy.

## Proyecto canónico SASE-310
- Proyecto permitido: `sase-310-system`.
- Proyecto a retirar/desconectar para este repo: `sase-310_-sistema-escolar`.
- Validación en build/deploy: `pnpm vercel:guard:project` (requiere `VERCEL_PROJECT_NAME`).
