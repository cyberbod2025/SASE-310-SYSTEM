/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Manrope", "system-ui", "sans-serif"],
      },
      colors: {
        // Restauración de Paleta SASE Premium (Fondo Oscuro + Neón)
        sase: {
          dark: "#0a0d17",
          card: "rgba(17, 24, 39, 0.7)",
          cyan: "#06b6d4",
          blue: "#3b82f6",
          purple: "#8b5cf6",
          magenta: "#f43f5e",
          emerald: "#10b981",
        },
      },
      boxShadow: {
        "glow-cyan": "0 0 20px rgba(6, 182, 212, 0.4)",
        "glow-purple": "0 0 20px rgba(139, 92, 246, 0.4)",
        "glow-blue": "0 0 20px rgba(59, 130, 246, 0.3)",
      },
    },
  },
  plugins: [],
};
