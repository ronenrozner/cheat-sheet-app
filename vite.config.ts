import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// Vite config (Vitest reuses `test` below).
// Tauri expects the dev server on 1420 by default; configurable via TAURI_DEV_HOST.
const host = process.env['TAURI_DEV_HOST'];

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host ? { port: 1421, protocol: 'ws', host } : undefined,
    watch: {
      // Do not watch the Rust backend.
      ignored: ['**/src-tauri/**'],
    },
  },
  // Prevent Vite from obscuring Rust errors.
  clearScreen: false,
  test: {
    globals: true,
    // Pure-logic unit tests (combo normalizer, search index) run in Node.
    // Component/DOM tests can opt in via per-file `// @vitest-environment jsdom`.
    environment: 'node',
    include: ['tests/**/*.{test,spec}.{ts,svelte}'],
    exclude: ['e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});
