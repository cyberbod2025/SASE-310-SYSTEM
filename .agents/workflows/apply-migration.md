---
description: Aplicar migración SQL a Supabase
---

## Pasos para aplicar una migración

1. Verificar que la migración SQL esté lista

```bash
dir supabase\migrations
```

// turbo 2. Revisar el contenido de la migración antes de aplicar

```bash
type supabase\migrations\[nombre-migracion].sql
```

3. Aplicar la migración (REQUIERE APROBACIÓN)

```bash
# Este comando modifica la base de datos, requiere confirmación del usuario
supabase db push
```

4. Verificar que la migración se aplicó correctamente

```bash
supabase db diff
```

> [!WARNING]
> El paso 3 modifica la base de datos y requiere aprobación explícita del usuario.
