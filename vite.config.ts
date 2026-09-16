import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// Vite config (Vitest reuses `test` below).
// Tauri expects the dev server on 1420 by default; configurable via TAURI_DEV_HOST.
const host = process.env['TAURI_DEV_HOST'];

// https://vite.dev/config/
export default defineConfig({
  // The main bundle (~1 MB) exceeds the default 500 kB warning because of marked, highlight.js,
  // and dompurify. This is a Tauri desktop app, not a web app, so bundle size does not affect
  // load time. Raise the threshold to silence the warning.
  build: {
    chunkSizeWarningLimit: 2000,
  },
  // Force the browser export conditions so Svelte 5 resolves the client build
  // (import { mount } from 'svelte') for component tests. Without this, Vitest
  // uses the Node conditions and mount resolves to the server build.
  resolve: {
    conditions: ['browser'],
  },
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
    // Vitest does not resolve `import x from './x.json'` out of the box. This tiny inline plugin
    // loads JSON default imports so the i18n layer (which imports `locales/en-US.json`) is testable.
    plugins: [
      {
        name: 'load-json',
        resolveId(id) {
          if (id.endsWith('.json')) return id;
          return null;
        },
        load(id) {
          if (!id.endsWith('.json')) return null;
          return `export default ${readFileSync(id, 'utf8')};`;
        },
      },
    ],
  },
});
