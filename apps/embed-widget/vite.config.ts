// ============================================================================
// embed-widget — Vite Configuration
// Author: Karthik Kathari
// ============================================================================

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig(({ mode }) => {
  const isLibBuild = process.env.BUILD_MODE === "lib";

  return {
    plugins: [vue()],

    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
    },

    // -------------------------------------------------------------------------
    // Dev server
    // -------------------------------------------------------------------------
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: process.env.VITE_API_URL ?? "http://localhost:3001",
          changeOrigin: true,
        },
      },
    },

    // -------------------------------------------------------------------------
    // Build — IIFE library mode so the widget can be embedded via <script>
    // -------------------------------------------------------------------------
    build: isLibBuild
      ? {
          lib: {
            entry: resolve(__dirname, "src/widget-entry.ts"),
            name: "VectraBaseWidget",
            fileName: "widget",
            formats: ["iife"],
          },
          rollupOptions: {
            // Bundle everything — consumers only drop in one <script> tag
            external: [],
            output: {
              // Expose the global as VectraBaseWidget
              globals: {},
            },
          },
          cssCodeSplit: false,
          minify: "esbuild",
          sourcemap: false,
          outDir: "dist",
        }
      : {
          outDir: "dist",
          sourcemap: mode === "development",
        },

    define: {
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
    },
  };
});
