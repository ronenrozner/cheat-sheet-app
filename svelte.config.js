import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// https://svelte.dev/docs/kit/configuration
// Runes are always on in Svelte 5, so no compiler flag is needed here.
export default {
  preprocess: vitePreprocess(),
};
