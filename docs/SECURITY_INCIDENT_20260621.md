# INFORME DE INCIDENTE DE SEGURIDAD — SASE-310
## Fecha: 2026-06-21 | Severidad: SEV-1 (Crítica) | Estado: RESUELTO

---

## 1. DETECCIÓN

Durante una auditoría de seguridad se detectaron credenciales hardcodeadas en el repositorio y referencias de configuración que no debían permanecer en código fuente ni en historial Git.

## 2. SECRETOS EXPUESTOS EN GIT HISTORY

| Secreto | Naturaleza | Ubicación original |
|---|---|---|
| `[REDACTED_PASSWORD]` | Contraseña institucional en texto plano | `_wip/sos/`, `scripts/`, `scratch/` |
| `[REDACTED_SUPABASE_ANON_KEY]` | Clave pública Supabase embebida | `src/`, archivos de configuración |
| `[REDACTED_SUPABASE_SERVICE_ROLE_KEY]` | Clave administrativa Supabase embebida | `api/`, edge functions, scripts |
| `[REDACTED_SUPABASE_URL]` | URL de proyecto Supabase hardcodeada | `src/lib/supabaseClient.ts`, `src/supabase/client.ts` |

**Nota de manejo documental:** aunque algunos identificadores de proyecto puedan considerarse públicos, este informe se mantiene redactado para evitar correlación innecesaria entre infraestructura, repositorio y cronología del incidente.

## 3. ACCIONES TOMADAS

### 3.1 Contención inmediata (2026-06-21)

- **Rotación de claves Supabase:** service role key y anon key rotadas en el panel de Supabase. Las llaves legacy fueron deshabilitadas.
- **Variables de entorno:** `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` migradas a `.env`; el frontend las lee desde `VITE_*` en lugar de constantes hardcodeadas.
- **Hotfix de limpieza:** se eliminaron secretos del working tree y se migró configuración sensible a variables de entorno.

### 3.2 Purga de historial Git (2026-06-21)

- **Herramienta:** `git-filter-repo` sobre mirror bare.
- **Ámbito:** patrones de reemplazo en contenido y eliminación de archivos scratch con material sensible.
- **Resultado:** historial reescrito y verificado sin pérdida funcional reportada.

### 3.3 Validación

- `pnpm install`: ✅ completado.
- `pnpm lint`: ✅ 0 errores.
- `pnpm type-check`: ✅ pasa.
- `pnpm build`: ✅ pasa.
- `pnpm test`: ✅ suite completa reportada como exitosa.
- Verificación de secrets en remoto: ✅ 0 hits para los patrones auditados.

### 3.4 Despliegue remoto

- `main` y ramas activas fueron actualizadas tras la purga.
- Pull requests abiertos conservaron estado después de actualizar SHAs.
- GitHub Actions quedó sin ejecuciones activas pendientes al cierre del incidente.

## 4. CRONOLOGÍA

| Momento | Evento |
|---|---|
| Detección | Auditoría detecta credenciales hardcodeadas en git history. |
| Contención | Rotación de claves Supabase y eliminación del working tree. |
| Purga | Reescritura de historial con `git-filter-repo`. |
| Validación | Build, type-check, tests y búsqueda de secretos completados. |
| Cierre | Ramas remotas actualizadas y verificación final ejecutada. |

Tiempo total detección→resolución: ~2.5 horas.

## 5. DEUDA PENDIENTE

### 5.1 Supabase Security Advisor
- Migración de hardening preparada.
- Pendiente: aplicar, verificar y documentar resultado.
- Incluye: `SET search_path`, RLS hardening y leaked password protection.

### 5.2 Dependabot
- Vulnerabilidades pendientes en rama default.
- Pendiente: clasificar runtime vs dev, priorizar fixes que no rompan build.

### 5.3 PRs abiertos
- Priorizar PRs pequeños de tests/UI.
- Cerrar o actualizar PRs obsoletos de CI antes de mergear.
- Evitar mezclar seguridad, frontend y documentación en un mismo cambio.

### 5.4 Limpieza local
- Conservar backup mirror por ventana limitada.
- Reclonar repositorio limpio como workspace principal.
- Eliminar copias locales temporales al vencer el periodo de retención definido.

## 6. LECCIONES APRENDIDAS

1. **Las credenciales en git history son irrecuperables sin reescritura.** No basta con borrar el archivo; hay que purgar el commit.
2. **`git-filter-repo` es la herramienta correcta** para purgas quirúrgicas cuando se requiere conservar estructura del repo.
3. **Las bitácoras de incidente también deben redactarse.** No deben repetir contraseñas, URLs de infraestructura ni identificadores que faciliten correlación.
4. **Siempre mantener un backup mirror** antes de cualquier reescritura de historial.

---

*Documentado para auditoría interna. Detalles sensibles redactados por seguridad operacional.*
