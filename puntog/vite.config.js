import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  base: "/", // 🔥 CLAVE PARA RAILWAY + ROUTER
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      // Proxy para el backend de Railway (SOLUCIÓN AL CORS)
      "/api/railway": {
        target: "https://gleaming-motivation-production-4018.up.railway.app",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/railway/, ""),
        secure: false,
        configure: (proxy, options) => {
          proxy.on("proxyReq", (proxyReq, req, res) => {
            console.log(
              `[PROXY] ${req.method} ${req.url} -> ${options.target}${req.url}`,
            );
          });
        },
      },
      // Proxy alternativo si el primero falla
      "/api/proxy": {
        target: "https://gleaming-motivation-production-4018.up.railway.app",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/proxy/, ""),
        secure: false,
      },
    },
  },
  // Configuración para build
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
});
