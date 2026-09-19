import { describe, expect, it } from 'vitest';
import { resolveTheme } from '../../src/lib/theme';

const cases = [
  { preference: 'Light' as const, prefersDark: false, expected: 'light' },
  { preference: 'Light' as const, prefersDark: true, expected: 'light' },
  { preference: 'Dark' as const, prefersDark: false, expected: 'dark' },
  { preference: 'Dark' as const, prefersDark: true, expected: 'dark' },
  { preference: 'Follow' as const, prefersDark: false, expected: 'light' },
  { preference: 'Follow' as const, prefersDark: true, expected: 'dark' },
];

describe('resolveTheme', () => {
  for (const { preference, prefersDark, expected } of cases) {
    it(`resolves ${preference} with prefersDark=${prefersDark} to ${expected}`, () => {
      expect(resolveTheme(preference, prefersDark).name).toBe(expected);
    });
  }
});
