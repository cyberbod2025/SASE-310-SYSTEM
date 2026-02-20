/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        // SASE 2026 Palette (MY CLASSES inspired)
        sase: {
          // Backgrounds
          dark: "#0f1225",
          darker: "#0a0d1a",
          card: "#1a1f3c",
          cardHover: "#242b4d",

          // Primary accents
          purple: "#7c3aed",
          violet: "#8b5cf6",
          indigo: "#6366f1",

          // Secondary accents
          cyan: "#06b6d4",
          teal: "#14b8a6",

          // Warm accents
          amber: "#f59e0b",
          orange: "#f97316",
          pink: "#ec4899",

          // Status
          success: "#22c55e",
          warning: "#eab308",
          danger: "#ef4444",
          info: "#3b82f6",

          // Text
          textPrimary: "#f8fafc",
          textSecondary: "#94a3b8",
          textMuted: "#64748b",
        },
      },
      boxShadow: {
        sase: "0 4px 20px -4px rgba(124, 58, 237, 0.3)",
        "sase-lg": "0 8px 30px -6px rgba(124, 58, 237, 0.4)",
        "glow-purple": "0 0 20px rgba(124, 58, 237, 0.5)",
        "glow-cyan": "0 0 20px rgba(6, 182, 212, 0.5)",
      },
      borderRadius: {
        sase: "12px",
        "sase-lg": "16px",
        "sase-xl": "20px",
      },
    },
  },
  plugins: [],
};
