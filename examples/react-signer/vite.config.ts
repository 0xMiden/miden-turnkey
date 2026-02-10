import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';
import { fileURLToPath } from 'url';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    wasm(),
    topLevelAwait(),
    react(),
    nodePolyfills({
      include: ['buffer', 'crypto', 'stream', 'util'],
    }),
  ],
  optimizeDeps: {
    exclude: ['@miden-sdk/miden-sdk'],
  },
  build: {
    target: 'esnext',
  },
  resolve: {
    alias: {
      '@miden-sdk/miden-turnkey': path.resolve(__dirname, '..', '..', 'src', 'index.ts'),
      '@miden-sdk/miden-turnkey-react': path.resolve(__dirname, '..', '..', 'packages', 'use-miden-turnkey-react', 'src', 'index.ts'),
      '@miden-sdk/react': path.resolve(process.env.HOME!, 'miden', 'miden-client', 'packages', 'react-sdk', 'src', 'index.ts'),
      '@miden-sdk/miden-sdk': path.resolve(__dirname, '..', '..', 'node_modules', '@miden-sdk', 'miden-sdk'),
    },
    dedupe: ['@miden-sdk/miden-sdk', '@miden-sdk/react', 'react', 'react-dom'],
  },
  server: {
    fs: {
      allow: [path.resolve(__dirname, '..', '..')],
    },
  },
  worker: {
    format: 'es',
  },
});
