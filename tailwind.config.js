/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "sans-serif"],
      },
      colors: {
        // Atmospheric Refraction — "The Ethereal Monolith" Palette
        sase: {
          dark: "#16141b",
          card: "rgba(121, 118, 124, 0.12)",
          primary: "#816ab8",
          cyan: "#7d7293",
          pink: "#b7687a",
          purple: "#816ab8",
          magenta: "#b7687a",
          emerald: "#afa63c",
          // Semantic Tokens (opacity-aware via CSS vars)
          info: "rgb(var(--sase-info) / <alpha-value>)",
          warning: "rgb(var(--sase-warning) / <alpha-value>)",
          danger: "rgb(var(--sase-danger) / <alpha-value>)",
          clinical: "rgb(var(--sase-clinical) / <alpha-value>)",
          admin: "rgb(var(--sase-admin) / <alpha-value>)",
        },
      },
      boxShadow: {
        // Ambient tinted shadows (Luminous Refraction spec)
        "glow-primary": "0 0 20px rgba(129, 106, 184, 0.22)",
        "glow-cyan": "0 0 20px rgba(125, 114, 147, 0.22)",
        "glow-pink": "0 0 20px rgba(183, 104, 122, 0.22)",
        "glow-info": "0 0 20px rgb(var(--sase-info) / 0.3)",
        "glow-warning": "0 0 20px rgb(var(--sase-warning) / 0.3)",
        "glow-danger": "0 0 20px rgb(var(--sase-danger) / 0.3)",
        "glow-clinical": "0 0 20px rgb(var(--sase-clinical) / 0.3)",
        "glow-admin": "0 0 20px rgb(var(--sase-admin) / 0.3)",
      },
      borderRadius: {
        "sase": "1.5rem",
        "sase-pill": "9999px",
      },
    },
  },
  plugins: [],
};

