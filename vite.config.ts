import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    base: "/",
    server: {
      port: 3101,
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
              const match = id.split("node_modules/")[1]?.split("/");
              const pkg = match ? match[0] : "vendor";
              const safeName = pkg.replace(/@/g, "");
              return `vendor-${safeName}`;
            }
            if (id.includes("src/data/officialStaff.ts")) {
              return "staff-data";
            }
          },
        },
      },
      chunkSizeWarningLimit: 1500,
    },
  };
});
