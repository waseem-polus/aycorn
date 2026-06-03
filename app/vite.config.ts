import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

export default defineConfig(({ command, mode }) => ({
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
    {
      name: "apple-touch-icon",
      transformIndexHtml() {
        const isDev = command === "serve" || mode === "development";
        return [{ tag: "link", attrs: { rel: "apple-touch-icon", href: isDev ? "/apple-touch-icon-dev.png" : "/apple-touch-icon.png" }, injectTo: "head" }];
      },
    },
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
}));
