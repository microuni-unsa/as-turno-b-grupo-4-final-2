import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const BACKEND_ORIGIN = process.env.VITE_BACKEND_URL || "http://127.0.0.1:8082";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: BACKEND_ORIGIN,
        changeOrigin: true,
      },
      "/ws": {
        target: BACKEND_ORIGIN,
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
