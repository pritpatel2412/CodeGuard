import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const isReplit =
  process.env.REPL_ID !== undefined &&
  process.env.NODE_ENV !== "production";

export default defineConfig({
  root: path.resolve(import.meta.dirname, "client"),

  plugins: [
    react(),
    runtimeErrorOverlay(),

    // ✅ Replit-only plugins (disabled on Vercel)
    ...(isReplit
      ? [
          require("@replit/vite-plugin-cartographer").cartographer(),
          require("@replit/vite-plugin-dev-banner").devBanner(),
        ]
      : []),
  ],

  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },

  build: {
    // ✅ IMPORTANT: build directly to dist
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },

  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
