// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: "./postcss.config.cjs",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  preview: {
    port: process.env.PORT || 3000,
    host: true,
    allowedHosts: ["puntogsexshop.com", "localhost", "127.0.0.1"],
  },
  build: {
    outDir: "dist",
    // ⬇️ AÑADE ESTA SECCIÓN PARA OPTIMIZAR CHUNKS
    rollupOptions: {
      output: {
        manualChunks: {
          // Agrupa React y sus librerías principales
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          // Agrupa Chakra UI y sus dependencias de emocion
          "ui-vendor": [
            "@chakra-ui/react",
            "@emotion/react",
            "@emotion/styled",
            "framer-motion",
          ],
          // Agrupa librerías de utilidades
          "utils-vendor": [
            "react-helmet-async",
            "react-icons",
            "lucide-react",
            "recharts",
          ],
        },
      },
    },
    chunkSizeWarningLimit: 600, // Opcional: aumenta el límite de advertencia a 600kB
  },
});
