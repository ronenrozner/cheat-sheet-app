import { describe, expect, it } from 'vitest';
import { resolveTheme, resolveThemeFromSettings } from '../../src/lib/theme';
import { DEFAULT_SETTINGS, type ThemeDefinition } from '../../src/lib/settings/types';

const cases = [
  { preference: 'Light' as const, prefersDark: false, expected: 'Cheatsheet Light' },
  { preference: 'Light' as const, prefersDark: true, expected: 'Cheatsheet Light' },
  { preference: 'Dark' as const, prefersDark: false, expected: 'Cheatsheet' },
  { preference: 'Dark' as const, prefersDark: true, expected: 'Cheatsheet' },
  { preference: 'Follow' as const, prefersDark: false, expected: 'Cheatsheet Light' },
  { preference: 'Follow' as const, prefersDark: true, expected: 'Cheatsheet' },
];

const customTheme: ThemeDefinition = {
  name: 'My Custom Theme',
  is_custom: true,
  colors: {
    '--color-background': '#111111',
    '--color-background-light': '#222222',
    '--color-background-lightest': '#333333',
    '--color-foreground': '#eeeeee',
    '--color-foreground-darker': '#dddddd',
    '--color-foreground-darkest': '#cccccc',
    '--color-accent': '#00ff00',
  },
};

describe('resolveTheme', () => {
  for (const { preference, prefersDark, expected } of cases) {
    it(`resolves ${preference} with prefersDark=${prefersDark} to ${expected}`, () => {
      expect(resolveTheme(preference, prefersDark).name).toBe(expected);
    });
  }

  it('resolves saved custom light and dark theme names', () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      theme: 'Light' as const,
      theme_light: customTheme.name,
      theme_dark: 'Cheatsheet',
    };

    expect(resolveThemeFromSettings(settings, [customTheme], false)).toBe(customTheme);
  });
});
