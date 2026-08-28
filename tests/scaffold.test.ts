import { describe, expect, it } from 'vitest';
import { APP_VERSION, APP_LICENSE } from '../src/lib/version';

// Smoke test: confirms the Vitest + Svelte/Vite pipeline is wired for later unit tests
// (combo normalizer, two-way search golden set, etc.).
describe('scaffold smoke', () => {
  it('exposes app metadata', () => {
    expect(APP_VERSION).toBe('0.1.0');
    expect(APP_LICENSE).toBe('Apache-2.0');
  });
});
