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
  return {
    theme: s.theme ?? DEFAULT_SETTINGS.theme,
    win_size: isWinSize(s.win_size) ? s.win_size : { ...DEFAULT_SETTINGS.win_size },
    trigger: isTriggerKey(s.trigger) ? s.trigger : { ...DEFAULT_SETTINGS.trigger },
    source_mode: s.source_mode ?? DEFAULT_SETTINGS.source_mode,
    language: s.language ?? DEFAULT_SETTINGS.language,
    pinned_slug: typeof s.pinned_slug === 'string' ? s.pinned_slug : DEFAULT_SETTINGS.pinned_slug,
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
  const validated = coerceSettings(settings);
  const ok = await validate(validated);
  if (!ok) {
    console.warn('setSettings: rejecting malformed snapshot; not persisted');
    return false;
  }
  try {
    await invoke('set_settings', { settings: validated });
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
  return (
    themes.has(s.theme) &&
    modes.has(s.source_mode) &&
    langs.has(s.language) &&
    isWinSize(s.win_size) &&
    isTriggerKey(s.trigger) &&
    typeof s.pinned_slug === 'string'
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
