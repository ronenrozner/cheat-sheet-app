// Hand-rolled i18n layer (Task 13). No `svelte-i18n` dependency.
//
// `t(key)` resolves `key` (dot-separated) in `locales/en-US.json`, interpolating `{{name}}`
// placeholders. Missing keys fall back to the key itself. `setLocale(next)` switches locale, but
// an unimplemented locale is a no-op (the current locale is retained, no crash).
//
// The locale is a plain module-level variable. Components that want it reactive import `getLocale`
// and read it inside `$derived`/`$effect` (or bind it to a settings `language` field, Task 12).

import enUS from '../../locales/en-US.json';

/** The one implemented locale. Any other value is a graceful no-op (see setLocale). */
export const SUPPORTED_LOCALES = ['en-US'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const LOCALES: Record<SupportedLocale, Record<string, unknown>> = {
  'en-US': enUS as unknown as Record<string, unknown>,
};

let current: SupportedLocale = 'en-US';

/** Get the current locale. Read inside `$derived`/`$effect` to keep it reactive. */
export function getLocale(): SupportedLocale {
  return current;
}

/**
 * Switch the active locale. Returns true on success; false (no-op) when `next` is unsupported or
 * equal to the current locale. The active locale never changes to an unimplemented one.
 */
export function setLocale(next: string): boolean {
  if (next === current) return false;
  if (!(next in LOCALES)) return false;
  current = next as SupportedLocale;
  return true;
}

/**
 * Resolve a UI string.
 *
 * @param key dot-separated key into the locale tree, e.g. `sheet.notFound`.
 * @param data interpolation data for `{{name}}` placeholders.
 * @returns the resolved string, or the key itself when the key is missing/empty.
 */
export function t(key: string, data: Record<string, string | number> = {}): string {
  const value = resolve(key);
  if (typeof value !== 'string') {
    return key;
  }
  return interpolate(value, data);
}

/** Resolve a dot-separated key against the active locale tree. */
function resolve(key: string): unknown {
  const parts = key.split('.');
  let node: unknown = LOCALES[current];
  for (const part of parts) {
    if (node && typeof node === 'object' && part in (node as Record<string, unknown>)) {
      node = (node as Record<string, unknown>)[part];
    } else {
      // Missing key: fall back to the full key so the caller always gets a string.
      return key;
    }
  }
  return node;
}

/** Replace `{{name}}` placeholders with `data[name]`. */
function interpolate(value: string, data: Record<string, string | number>): string {
  if (Object.keys(data).length === 0) {
    return value;
  }
  return value.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name: string) =>
    name in data ? String(data[name]) : match
  );
}
