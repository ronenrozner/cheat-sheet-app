import { describe, expect, it } from 'vitest';
import { APP_VERSION, APP_LICENSE } from '../src/lib/version';

// Smoke test: confirms the Vitest + Svelte/Vite pipeline is wired for later unit tests
// (combo normalizer, two-way search golden set, etc.).
describe('scaffold smoke', () => {
  it('exposes app metadata', () => {
    expect(APP_VERSION).toMatch(/^\d{4}\.\d{1,2}\.\d{1,2}$/);
    expect(APP_LICENSE).toBe('Apache-2.0');
  });
});
