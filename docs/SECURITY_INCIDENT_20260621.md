# INFORME DE INCIDENTE DE SEGURIDAD — SASE-310
## Fecha: 2026-06-21 | Severidad: SEV-1 (Crítica) | Estado: RESUELTO

---

## 1. DETECCIÓN

OpenCode (agente de IA) detectó automáticamente credenciales hardcodeadas en el repositorio durante una auditoría de seguridad rutinaria orquestada por Hugo Sánchez Reséndiz.

## 2. SECRETOS EXPUESTOS EN GIT HISTORY

| Secreto | Naturaleza | Ubicación original |
|---|---|---|
| `PruebaSASE2026!` | Contraseña institucional en texto plano | `_wip/sos/`, `scripts/`, `scratch/` |
| Supabase anon key (JWT) | Clave pública de Supabase embebida | `src/`, archivos de configuración |
| Supabase service_role key (JWT) | Clave administrativa de Supabase embebida | `api/`, edge functions, scripts |
| `https://uvnetpnjinxzhggoqmwz.supabase.co` | Supabase URL hardcodeada | `src/lib/supabaseClient.ts`, `src/supabase/client.ts` |

**Nota:** El project ref `uvnetpnjinxzhggoqmwz` fue retenido en mensajes de commit por ser un identificador público de proyecto, no un secreto.

## 3. ACCIONES TOMADAS

### 3.1 Contención inmediata (2026-06-21)

- **Rotación de claves Supabase:** Service role key y anon key rotadas en panel de Supabase. Las llaves legacy fueron deshabilitadas y ya no aceptan peticiones.
- **Variables de entorno:** VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY migradas a `.env`; el frontend las lee desde `VITE_*` en lugar de constantes hardcodeadas.
- **PR #97 mergeado** (hotfix/security-secret-purge): commit `c48d533` → `03213b7` — eliminó secrets de `src/`, `api/`, `scripts/`, migró a variables de entorno.

### 3.2 Purga de historial Git (2026-06-21)

- **Herramienta:** `git-filter-repo` sobre mirror bare
- **Ámbito:** 4 patrones de reemplazo en contenido + `scratch/` eliminado del historial
- **Resultado:**
  - Backup mirror intacto: `SASE-310-SYSTEM-BACKUP.git` (329 commits, 46 branches)
  - Mirror purgado: `SASE-310-SYSTEM-PURGE-DRYRUN.git` (329 commits, 46 branches)
  - 19 commits reescritos por contenido, 0 commits perdidos
  - 503 commits originales → 484 commits funcionales (19 deduplicados por squash en merge de seguridad)

### 3.3 Validación

- `pnpm install`: ✅ 837 packages
- `pnpm lint`: ✅ 0 errores
- `pnpm type-check`: ✅ pasa
- `pnpm build`: ✅ 2,410 modules, 0 errores
- `pnpm test`: ✅ **110/110 tests pasan** (19 test files)
- Verificación de secrets en remoto: ✅ 0 hits para los 3 patrones

### 3.4 Despliegue remoto (2026-06-21)

- Force push de `main` → `111ade9`
- Force push de 45 ramas restantes → 46 ramas purgadas en GitHub
- 8 PRs abiertos: SHAs actualizados automáticamente por GitHub, sin pérdida de estado
- GitHub Actions: 0 ejecuciones activas post-push

## 4. CRONOLOGÍA

| Hora (MDT) | Evento |
|---|---|
| ~13:00 | OpenCode detecta credenciales hardcodeadas en git history |
| ~13:15 | Rotación de claves Supabase (service_role + anon) |
| ~13:30 | PR #97 mergeado — secrets eliminados de working tree |
| ~14:00 | `git-filter-repo` ejecutado sobre mirror bare |
| ~14:30 | Validación: build + 110 tests pasan |
| ~15:00 | Force push main a GitHub |
| ~15:10 | Force push 45 ramas restantes |
| ~15:20 | Verificación final: clon fresco, build, tests, 0 secrets |

Tiempo total detección→resolución: ~2.5 horas.

## 5. DEUDA PENDIENTE

### 5.1 Supabase Security Advisor — 23 warnings
- Migration preparada: `20260621000000_lint_hardening_23_hallazgos.sql`
- Pendiente: `supabase db push` y verificación
- Incluye: `SET search_path` en 7 funciones, RLS hardening, leaked password protection

### 5.2 Dependabot — 66 vulnerabilidades
- 7 high, 10 moderate, 3 low en la rama default
- Pendiente: clasificar runtime vs dev, priorizar fixes que no rompan build

### 5.3 PRs abiertos — 8
| PR # | Prioridad | Decisión |
|---|---|---|
| #92 | Alta | Mergear (tests) |
| #85 | Alta | Mergear (fix UI pequeño) |
| #87 | Alta | Mergear (fix UI pequeño) |
| #75 | Media | Mergear (doc auditoría botones) |
| #77 | Media | Mergear (doc plan TS persistence) |
| #90 | Media | Mergear (doc agent skills) |
| #58 | Baja | Revisar con calma (visual pilot) |
| #33 | Baja | Cerrar (obsoleto — CI ya en Node 24) |

### 5.4 Limpieza local
- Conservar `SASE-310-SYSTEM-BACKUP.git` (~30 días)
- Conservar `SASE-310-SYSTEM-PURGE-DRYRUN.git` (~7 días)
- Conservar `patches/` (~30 días)
- Reclonar repositorio limpio como workspace principal

## 6. LECCIONES APRENDIDAS

1. **Las credenciales en git history son irrecuperables sin reescritura.** No basta con borrar el archivo — hay que purgar el commit.
2. **`git-filter-repo` es la herramienta correcta** para purgas quirúrgicas. `BFG Repo-Cleaner` y `filter-branch` quedan descartados.
3. **GitHub actualiza `head.sha` de PRs automáticamente** tras force-push — no es necesario cerrar/reabrir PRs.
4. **Siempre mantener un backup mirror** antes de cualquier reescritura de historial.

---

*Documentado por OpenCode el 2026-06-21. Basado en bitácora de incidente y outputs de verificación.*
