// ESLint flat config (ESLint v10). Svelte-specific rules via eslint-plugin-svelte.
// JS/TS base rules arrive with the feature layers that add parsers (kept lean for the scaffold).
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import tsParser from '@typescript-eslint/parser';

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
  {
    // Enable TS type-aware parsing for <script lang="ts"> in Svelte components so
    // svelte-check and eslint agree on noImplicitAny. svelte-eslint-parser hands the
    // inner <script> block to @typescript-eslint/parser.
    files: ['*.svelte', '**/*.svelte'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        parser: tsParser,
      },
    },
  },
];
