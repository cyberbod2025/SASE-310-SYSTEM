import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    base: "/",
    server: {
      port: 3100,
      host: "0.0.0.0",
      open: false,
    },
    plugins: [react()],
    define: {},
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("react") || id.includes("react-dom") || id.includes("react-router-dom")) {
                return "vendor-react";
              }
              if (id.includes("@supabase")) {
                return "vendor-supabase";
              }
              if (id.includes("framer-motion")) {
                return "vendor-framer";
              }
              if (id.includes("@google/generative-ai")) {
                return "vendor-ai";
              }
              if (id.includes("date-fns")) {
                return "vendor-utils";
              }
              return "vendor";
            }
            if (id.includes("src/data/officialStaff.ts")) {
              return "staff-data";
            }
          },
        },
      },
      chunkSizeWarningLimit: 800,
    },
  };
});
