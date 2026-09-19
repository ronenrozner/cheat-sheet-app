import type { Theme as ThemePreference } from './settings/types';

export type AppThemeName = 'light' | 'dark';

export interface AppTheme {
  name: AppThemeName;
  colors: Record<string, string>;
}

const DARK_THEME: AppTheme = {
  name: 'dark',
  colors: {
    '--color-background': '#2f384b',
    '--color-background-light': '#3d4457',
    '--color-background-lightest': '#9ca5b5',
    '--color-foreground': '#f6f2eb',
    '--color-foreground-darker': '#c0c9da',
    '--color-foreground-darkest': '#dbe1ef',
    '--color-accent': '#05ec8c',
    '--cs-bg': '#2f384b',
    '--cs-surface': '#3d4457',
    '--cs-fg': '#f6f2eb',
    '--cs-muted': '#c0c9da',
    '--cs-border': '#9ca5b5',
    '--cs-input-bg': '#3d4457',
    '--cs-hover-bg': '#465267',
    '--cs-selected-bg': '#05ec8c',
    '--cs-selected-fg': '#2f384b',
    '--cs-accent': '#05ec8c',
  },
};

const LIGHT_THEME: AppTheme = {
  name: 'light',
  colors: {
    '--color-background': '#f5f0e8',
    '--color-background-light': '#ede6db',
    '--color-background-lightest': '#c4bdb5',
    '--color-foreground': '#2f384b',
    '--color-foreground-darker': '#55647a',
    '--color-foreground-darkest': '#8899b0',
    '--color-accent': '#3a7d58',
    '--cs-bg': '#f5f0e8',
    '--cs-surface': '#ede6db',
    '--cs-fg': '#2f384b',
    '--cs-muted': '#55647a',
    '--cs-border': '#c4bdb5',
    '--cs-input-bg': '#ede6db',
    '--cs-hover-bg': '#e7ded1',
    '--cs-selected-bg': '#3a7d58',
    '--cs-selected-fg': '#f5f0e8',
    '--cs-accent': '#3a7d58',
  },
};

const THEMES: Record<AppThemeName, AppTheme> = {
  light: LIGHT_THEME,
  dark: DARK_THEME,
};

export function resolveTheme(preference: ThemePreference, prefersDark: boolean): AppTheme {
  if (preference === 'Light') return THEMES.light;
  if (preference === 'Dark') return THEMES.dark;
  return prefersDark ? THEMES.dark : THEMES.light;
}

export function prefersDarkScheme(): boolean {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

export function applyTheme(theme: AppTheme): void {
  const root = document.documentElement;
  root.dataset.theme = theme.name;
  root.style.colorScheme = theme.name;

  for (const [key, value] of Object.entries(theme.colors)) {
    root.style.setProperty(key, value);
  }
}

export function applyThemePreference(preference: ThemePreference): void {
  applyTheme(resolveTheme(preference, prefersDarkScheme()));
}

export function watchPreferredColorScheme(onChange: () => void): () => void {
  const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
  if (!mq) return () => {};

  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}
