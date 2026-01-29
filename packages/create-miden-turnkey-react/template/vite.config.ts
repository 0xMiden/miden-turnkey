import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import inject from "@rollup/plugin-inject";

export default defineConfig({
  plugins: [
    react(),
    wasm(),
    topLevelAwait(),
    nodePolyfills({
      include: ["buffer", "process"],
      globals: {
        Buffer: true,
        process: true,
      },
    }),
  ],
  build: {
    target: "esnext",
  },
  optimizeDeps: {
    exclude: ["@demox-labs/miden-sdk"],
  },
  worker: {
    format: "es",
    plugins: () => [wasm(), topLevelAwait()],
  },
  resolve: {
    alias: {
      buffer: "buffer",
    },
  },
  define: {
    "process.env": {},
    global: "globalThis",
  },
});
