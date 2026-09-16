// Settings window management (Task 19).
//
// The settings window is a separate Tauri window (label `settings`, configured in
// `src-tauri/tauri.conf.json`). It shares the same webview as the main overlay — both run the
// same `App.svelte`, which detects its own window label and renders either the overlay or the
// settings UI. This module only opens / closes / reports the settings window; it never touches
// the settings UI itself.

import { Window } from '@tauri-apps/api/window';

/** The label of the settings window (must match `tauri.conf.json`). */
export const SETTINGS_WINDOW_LABEL = 'settings';

/** Whether the settings window currently exists. */
export async function isSettingsOpen(): Promise<boolean> {
  const window = await Window.getByLabel(SETTINGS_WINDOW_LABEL);
  return window !== null && window !== undefined;
}

/**
 * Open the settings window: show and focus it.
 *
 * The window is declared in `tauri.conf.json` (label `settings`), so it always exists. Show and
 * focus it. Returns true.
 */
export async function openSettings(): Promise<boolean> {
  const window = await Window.getByLabel(SETTINGS_WINDOW_LABEL);
  if (window !== null && window !== undefined) {
    await window.show();
    await window.setFocus();
  }
  return true;
}

/** Close the settings window: hide it (does not destroy it) and keep the main overlay open. */
export async function closeSettings(): Promise<void> {
  const window = await Window.getByLabel(SETTINGS_WINDOW_LABEL);
  if (window !== null && window !== undefined) {
    await window.hide();
  }
}
