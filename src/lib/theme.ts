import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import type { Settings, Theme as ThemePreference, ThemeDefinition } from './settings/types';

const DARK_THEME: ThemeDefinition = {
  name: 'Pomotroid',
  is_custom: false,
  colors: {
    '--color-background': '#2f384b',
    '--color-background-light': '#3d4457',
    '--color-background-lightest': '#9ca5b5',
    '--color-foreground': '#f6f2eb',
    '--color-foreground-darker': '#c0c9da',
    '--color-foreground-darkest': '#dbe1ef',
    '--color-accent': '#05ec8c',
  },
};

const LIGHT_THEME: ThemeDefinition = {
  name: 'Pomotroid Light',
  is_custom: false,
  colors: {
    '--color-background': '#f5f0e8',
    '--color-background-light': '#ede6db',
    '--color-background-lightest': '#c4bdb5',
    '--color-foreground': '#2f384b',
    '--color-foreground-darker': '#55647a',
    '--color-foreground-darkest': '#8899b0',
    '--color-accent': '#3a7d58',
  },
};

export const FALLBACK_THEMES: ThemeDefinition[] = [LIGHT_THEME, DARK_THEME];

export function resolveTheme(
  preference: ThemePreference,
  prefersDark: boolean,
  themes: ThemeDefinition[] = FALLBACK_THEMES,
  lightThemeName = LIGHT_THEME.name,
  darkThemeName = DARK_THEME.name
): ThemeDefinition {
  const fallback = prefersDark ? DARK_THEME : LIGHT_THEME;
  const name =
    preference === 'Light'
      ? lightThemeName
      : preference === 'Dark'
        ? darkThemeName
        : prefersDark
          ? darkThemeName
          : lightThemeName;
  return findTheme(themes, name) ?? findTheme(themes, fallback.name) ?? fallback;
}

export function resolveThemeFromSettings(
  settings: Pick<Settings, 'theme' | 'theme_light' | 'theme_dark'>,
  themes: ThemeDefinition[],
  prefersDark: boolean
): ThemeDefinition {
  return resolveTheme(
    settings.theme,
    prefersDark,
    themes,
    settings.theme_light,
    settings.theme_dark
  );
}

export async function getThemes(): Promise<ThemeDefinition[]> {
  try {
    const themes = await invoke<ThemeDefinition[]>('themes_list', {});
    return themes.length > 0 ? themes : FALLBACK_THEMES;
  } catch {
    return FALLBACK_THEMES;
  }
}

export function onThemesChanged(cb: (themes: ThemeDefinition[]) => void): Promise<UnlistenFn> {
  return listen<ThemeDefinition[]>('themes:changed', (event) => cb(event.payload));
}

export function prefersDarkScheme(): boolean {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

export function applyTheme(theme: ThemeDefinition): void {
  const root = document.documentElement;
  const isDark = theme.colors['--color-background'] !== LIGHT_THEME.colors['--color-background'];
  root.dataset.theme = theme.name;
  root.style.colorScheme = isDark ? 'dark' : 'light';

  for (const [key, value] of Object.entries(toAppTokens(theme))) {
    root.style.setProperty(key, value);
  }
}

export function applyThemePreference(
  settings: Pick<Settings, 'theme' | 'theme_light' | 'theme_dark'> | ThemePreference,
  themes: ThemeDefinition[] = FALLBACK_THEMES
): void {
  const next =
    typeof settings === 'string'
      ? resolveTheme(settings, prefersDarkScheme(), themes)
      : resolveThemeFromSettings(settings, themes, prefersDarkScheme());
  applyTheme(next);
}

export function watchPreferredColorScheme(onChange: () => void): () => void {
  const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
  if (!mq) return () => {};

  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

function findTheme(themes: ThemeDefinition[], name: string): ThemeDefinition | undefined {
  return themes.find((theme) => theme.name.toLowerCase() === name.toLowerCase());
}

function toAppTokens(theme: ThemeDefinition): Record<string, string> {
  const colors = theme.colors;
  const token = (key: string, fallback: string): string => colors[key] ?? fallback;
  const darkToken = (key: string): string => DARK_THEME.colors[key] ?? '#000000';

  return {
    ...colors,
    '--cs-bg': token('--cs-bg', token('--color-background', darkToken('--color-background'))),
    '--cs-surface': token(
      '--cs-surface',
      token('--color-background-light', darkToken('--color-background-light'))
    ),
    '--cs-fg': token('--cs-fg', token('--color-foreground', darkToken('--color-foreground'))),
    '--cs-muted': token(
      '--cs-muted',
      token('--color-foreground-darker', darkToken('--color-foreground-darker'))
    ),
    '--cs-border': token(
      '--cs-border',
      token('--color-background-lightest', darkToken('--color-background-lightest'))
    ),
    '--cs-input-bg': token(
      '--cs-input-bg',
      token('--color-background-light', darkToken('--color-background-light'))
    ),
    '--cs-hover-bg': token(
      '--cs-hover-bg',
      token('--color-background-light', darkToken('--color-background-light'))
    ),
    '--cs-selected-bg': token(
      '--cs-selected-bg',
      token('--color-accent', darkToken('--color-accent'))
    ),
    '--cs-selected-fg': token(
      '--cs-selected-fg',
      token('--color-background', darkToken('--color-background'))
    ),
    '--cs-accent': token('--cs-accent', token('--color-accent', darkToken('--color-accent'))),
  };
}
