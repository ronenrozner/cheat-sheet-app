// Prettier config. Per spec Code Style: 2-space indent, single quotes, semicolons.
import svelte from 'prettier-plugin-svelte';

export default {
  singleQuote: true,
  semi: true,
  tabWidth: 2,
  printWidth: 100,
  trailingComma: 'es5',
  plugins: [svelte],
  overrides: [
    {
      files: '*.svelte',
      options: { parser: 'svelte' },
    },
  ],
};
