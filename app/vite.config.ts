import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ["@tabler/icons-react"],
  },
  server: {
    // In dev, Vite serves the frontend and proxies /api to the Go backend.
    // The target port matches the Go server default (8000) or $AYCORN_PORT if set.
    proxy: {
      "/api": `http://localhost:${process.env.AYCORN_PORT ?? 8000}`,
    },
  },
});
