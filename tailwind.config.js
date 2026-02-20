/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Manrope", "system-ui", "sans-serif"],
      },
      colors: {
        // Paleta Oficial SASE 2026 "Metro Lab Institucional"
        sase: {
          bg: "#f8fafc", // slate-50
          text: "#1e293b", // slate-800
          textMuted: "#64748b", // slate-500

          // Semántica por Rol
          docente: "#2563eb", // blue-600
          prefectura: "#ea580c", // orange-600
          orientacion: "#059669", // emerald-600
          social: "#9333ea", // purple-600
          direccion: "#1e293b", // slate-800
          error: "#dc2626", // red-600
        },
      },
      boxShadow: {
        sase: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
        "sase-md":
          "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
      },
      borderRadius: {
        sase: "4px", // Diseño cuadrado/mínimo
      },
    },
  },
  plugins: [],
};
