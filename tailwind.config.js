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
          dark: "#0b0e14",
          card: "rgba(17, 24, 39, 0.7)",
          cyan: "#00f2ff",
          blue: "#3b82f6",
          purple: "#a855f7",
          emerald: "#10b981",
        },
      },
      boxShadow: {
        "glow-cyan": "0 0 20px rgba(0, 242, 255, 0.3)",
        "glow-blue": "0 0 20px rgba(59, 130, 246, 0.3)",
      },
    },
  },
  plugins: [],
};
