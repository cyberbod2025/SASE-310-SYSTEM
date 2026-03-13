---
description: Probar flujo completo de login con video intro
---

// turbo-all

## Pasos para probar el video intro del login

1. Verificar que el servidor esté corriendo

```bash
echo "Verificando servidor en localhost:3000..."
```

2. Limpiar localStorage para simular primera visita

```bash
echo "Simulando primera visita (sin localStorage.sase_intro_seen)"
```

3. Abrir navegador y capturar evidencias:

   - Screenshot 1: Video intro reproduciéndose
   - Screenshot 2: Formulario de login visible
   - Screenshot 3: Vista móvil (390px)

4. Probar modo demo con parámetro ?intro=1

5. Verificar fallback con prefers-reduced-motion

6. Guardar capturas en: C:\Users\cyber\Desktop\Capturas_Video_SASE\Login
