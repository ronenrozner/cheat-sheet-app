// Settings store bridge (Task 12).
//
// Thin wrapper over the Tauri `get_settings` / `set_settings` IPC commands (backend, Task 3). Two
// defenses:
//
// - `getSettings` falls back to `DEFAULT_SETTINGS` if the backend errors or returns something
//   unparseable. A first run with no on-disk file returns defaults; malformed on-disk data also
//   recovers to defaults (backend + this layer both recover, so recovery is redundant-safe).
// - `setSettings` validates the snapshot before persisting. Only a well-formed snapshot is sent;
//   a malformed one is logged and skipped (never written to the store).

import { invoke } from '@tauri-apps/api/core';
import type { Settings } from './types';
import { DEFAULT_SETTINGS } from './types';

/** Coerce an unknown settings value into a valid snapshot, defaulting any missing/bad field. */
export function coerceSettings(raw: unknown): Settings {
  if (!isPlainObject(raw)) {
    return { ...DEFAULT_SETTINGS };
  }
  const s = raw as Partial<Settings>;
  const themes = new Set(['Light', 'Dark', 'Follow']);
  return {
    theme: themes.has(String(s.theme)) ? (s.theme as Settings['theme']) : DEFAULT_SETTINGS.theme,
    theme_light: typeof s.theme_light === 'string' ? s.theme_light : DEFAULT_SETTINGS.theme_light,
    theme_dark: typeof s.theme_dark === 'string' ? s.theme_dark : DEFAULT_SETTINGS.theme_dark,
    win_size: isWinSize(s.win_size) ? s.win_size : { ...DEFAULT_SETTINGS.win_size },
    trigger: isTriggerKey(s.trigger) ? s.trigger : { ...DEFAULT_SETTINGS.trigger },
    source_mode: s.source_mode ?? DEFAULT_SETTINGS.source_mode,
    language: s.language ?? DEFAULT_SETTINGS.language,
    pinned_slug: typeof s.pinned_slug === 'string' ? s.pinned_slug : DEFAULT_SETTINGS.pinned_slug,
    dataDir: typeof s.dataDir === 'string' ? s.dataDir : DEFAULT_SETTINGS.dataDir,
    show_tray:
      s.show_tray === 'On' || s.show_tray === 'Off' ? s.show_tray : DEFAULT_SETTINGS.show_tray,
    always_on_top: coerceAlwaysOnTop(s.always_on_top),
  };
}

/** Load settings, falling back to defaults on any error. */
export async function getSettings(): Promise<Settings> {
  try {
    const raw = await invoke<Settings>('get_settings', {});
    return coerceSettings(raw);
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Persist settings. Returns true only when the backend accepted a well-formed snapshot.
 *
 * A malformed snapshot is validated, logged, and skipped — it is never written to the store.
 */
export async function setSettings(settings: Settings): Promise<boolean> {
  const ok = await validate(settings);
  if (!ok) {
    console.warn('setSettings: rejecting malformed snapshot; not persisted');
    return false;
  }
  const validated = coerceSettings(settings);
  try {
    await invoke('set_settings', { settings: toBackendSettings(validated) });
    return true;
  } catch {
    return false;
  }
}

/** Validate a snapshot: every field must be present and of the expected shape. */
async function validate(s: Settings): Promise<boolean> {
  const themes = new Set(['Light', 'Dark', 'Follow']);
  const modes = new Set(['Online', 'Local', 'Both']);
  const langs = new Set(['EnUs']);
  const trays = new Set(['Off', 'On']);
  const tops = new Set(['On', 'Off']);
  return (
    themes.has(s.theme) &&
    typeof s.theme_light === 'string' &&
    typeof s.theme_dark === 'string' &&
    modes.has(s.source_mode) &&
    langs.has(s.language) &&
    trays.has(s.show_tray) &&
    tops.has(s.always_on_top) &&
    isWinSize(s.win_size) &&
    isTriggerKey(s.trigger) &&
    typeof s.pinned_slug === 'string' &&
    typeof s.dataDir === 'string'
  );
}

// --- shape guards (used by validate + coerceSettings) ---

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isWinSize(v: unknown): v is { width: number; height: number } {
  const w = isPlainObject(v) ? (v as { width?: unknown; height?: unknown }) : undefined;
  return !!w && typeof w.width === 'number' && typeof w.height === 'number';
}

function coerceAlwaysOnTop(value: unknown): Settings['always_on_top'] {
  if (value === 'On' || value === true) return 'On';
  if (value === 'Off' || value === false) return 'Off';
  return DEFAULT_SETTINGS.always_on_top;
}

function toBackendSettings(settings: Settings): Omit<Settings, 'always_on_top'> & {
  always_on_top: boolean;
} {
  return {
    ...settings,
    always_on_top: settings.always_on_top === 'On',
  };
}

function isTriggerKey(v: unknown): v is {
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  key: string;
} {
  if (!isPlainObject(v)) return false;
  const t = v as { ctrl?: unknown; alt?: unknown; shift?: unknown; key?: unknown };
  return (
    typeof t.ctrl === 'boolean' &&
    typeof t.alt === 'boolean' &&
    typeof t.shift === 'boolean' &&
    typeof t.key === 'string'
  );
}
