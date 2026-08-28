// ESLint flat config (ESLint v10). Svelte-specific rules via eslint-plugin-svelte.
// JS/TS base rules arrive with the feature layers that add parsers (kept lean for the scaffold).
import svelte from 'eslint-plugin-svelte';

export default [
  {
    ignores: [
      'node_modules/**',
      'build/**',
      'dist/**',
      'e2e/**',
      'src-tauri/**',
      'coverage/**',
      'public/**',
    ],
  },
  ...svelte.configs['flat/recommended'],
  ...svelte.configs['flat/prettier'],
];
