// Settings window management (Task 19).
//
// The settings window is a separate Tauri webview window (label `settings`). It loads the
// SvelteKit `/settings` route so the settings UI is route-owned instead of selected by window label.

import { WebviewWindow } from '@tauri-apps/api/webviewWindow';

/** The label of the settings window (must match `tauri.conf.json`). */
export const SETTINGS_WINDOW_LABEL = 'settings';

/** Whether the settings window currently exists. */
export async function isSettingsOpen(): Promise<boolean> {
  const window = await WebviewWindow.getByLabel(SETTINGS_WINDOW_LABEL);
  return window !== null && window !== undefined;
}

/**
 * Open the settings window: create it if needed, then show and focus it.
 *
 * Config-declared windows can already exist. If not, create the webview window at `/settings`.
 */
export async function openSettings(): Promise<boolean> {
  let window = await WebviewWindow.getByLabel(SETTINGS_WINDOW_LABEL);
  if (!window) {
    window = new WebviewWindow(SETTINGS_WINDOW_LABEL, {
      url: '/settings',
      title: 'Settings',
      width: 720,
      height: 640,
      resizable: true,
      decorations: false,
      alwaysOnTop: true,
      center: true,
      visible: false,
    });
  }
  await window.show();
  await window.setFocus();
  return true;
}

/** Close the settings window: hide it (does not destroy it) and keep the main overlay open. */
export async function closeSettings(): Promise<void> {
  const window = await WebviewWindow.getByLabel(SETTINGS_WINDOW_LABEL);
  if (window !== null && window !== undefined) {
    await window.hide();
  }
}
