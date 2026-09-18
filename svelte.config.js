import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// https://svelte.dev/docs/kit/configuration
// Tauri serves the built files from `dist`, so the static adapter writes there.
export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: 'dist',
      assets: 'dist',
    }),
    csp: {
      mode: 'auto',
      directives: {
        'default-src': ['self'],
        'script-src': ['self'],
        'style-src': ['self', 'unsafe-inline'],
        'img-src': ['self', 'data:', 'blob:'],
        'connect-src': ['self', 'ipc:', 'http://ipc.localhost'],
        'font-src': ['self', 'data:'],
      },
    },
  },
};
