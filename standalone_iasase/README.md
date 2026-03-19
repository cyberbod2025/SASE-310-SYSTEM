# 🧠 IA-SASE Neural Core (Standalone)

Esta es la versión portátil del "Rostro" de **IA-SASE** con ojos inteligentes que siguen el cursor, parpadeo ocasional y sistema de capas reactivas al estado del sistema.

## 📦 Dependencias

Para que este componente funcione en un proyecto nuevo de React (Vite/Next.js), necesitas instalar:

```bash
npm install framer-motion @splinetool/react-spline
```

## 📂 Archivos Necesarios

1.  **SaseNeuralCoreStandalone.tsx**: El código del componente (Cópialo en tu carpeta de componentes).
2.  **sase-orb.splinecode**: Debes copiar el archivo original de la escena Spline (ubicado en `public/sase-orb.splinecode`) a la carpeta `public` de tu nuevo proyecto.

## 🚀 Uso Rápido

```tsx
import { SaseNeuralCore } from './SaseNeuralCoreStandalone';

function App() {
  return (
    <div className="bg-slate-900 min-h-screen flex items-center justify-center">
      <SaseNeuralCore 
        state="normal"          // 'normal', 'warning', 'alert', 'thinking'
        isInteracting={false}    // cambia a true para activar el pulso visual
        size="w-64 h-64"        // clases de Tailwind para tamaño
      />
    </div>
  );
}
```

## ✨ Características Incluidas en este archivo:

*   **Sentient Eyes:** Ojos que siguen el mouse del usuario.
*   **Heartbeat Scan:** Línea de escaneo vital que recorre el núcleo.
*   **Random Blink:** Lógica de parpadeo aleatorio (cada 2-6 segundos) para mayor realismo.
*   **Tactical HUD:** Anillos rotatorios y filtros SVG de resplandor.
*   **Multi-State:** Soporta los estados Oro (Estable), Ámbar (Precaución), Rojo (Alerta) y Azul (Procesando).

---
*Desarrollado para SASE-310 — Identidad Neural Institucional.*
