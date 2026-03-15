---
description: Capturar evidencias visuales del sistema SASE
---

# Capturar evidencias visuales del sistema SASE

// turbo-all

## Pasos para capturar evidencias

1. Crear directorio de capturas si no existe

```bash
mkdir -p "C:\Users\cyber\Desktop\Capturas_Video_SASE\Login"
```

1. Iniciar servidor si no está corriendo

```bash
npm run dev
```

1. Usar Browser Subagent para capturar screenshots:

   - Estado inicial del login
   - Video intro reproduciéndose
   - Formulario de login visible
   - Vista móvil responsive
   - Fallback de video (si aplica)

1. Guardar capturas con nombres descriptivos:

   - 01_intro_video.png
   - 02_login_visible.png
   - 03_mobile_login_390.png

1. Verificar que las capturas se guardaron correctamente

```bash
dir "C:\Users\cyber\Desktop\Capturas_Video_SASE\Login"
```
