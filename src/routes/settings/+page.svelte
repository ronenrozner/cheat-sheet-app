<script lang="ts">
  import { invoke } from '@tauri-apps/api/core';
  import { emit, listen } from '@tauri-apps/api/event';
  import SettingsWindow from '../../components/SettingsWindow.svelte';
  import { coerceSettings, getSettings, setSettings } from '../../lib/settings/bridge';
  import { DEFAULT_SETTINGS, type Settings } from '../../lib/settings/types';
  import { type HotkeyStatus, type WaylandSnippets } from '../../lib/overlay/hotkey';
  import { APP_VERSION } from '../../lib/version';

  let settings = $state<Settings>({ ...DEFAULT_SETTINGS });
  let appliedSettings: Settings = { ...DEFAULT_SETTINGS };
  let hotkeyStatus = $state<HotkeyStatus | null>(null);
  let waylandSnippets = $state<WaylandSnippets | null>(null);
  let sheetsBySlug: Record<string, string> = $state({});

  async function loadSettingsPage(): Promise<void> {
    try {
      const sheets = await invoke<Array<{ slug: string; title: string }>>('list_sheets', {});
      sheetsBySlug = Object.fromEntries(sheets.map((sheet) => [sheet.slug, sheet.title]));
    } catch {
      sheetsBySlug = {};
    }

    try {
      settings = await getSettings();
      appliedSettings = settings;
    } catch {
      settings = { ...DEFAULT_SETTINGS };
      appliedSettings = settings;
    }

    try {
      hotkeyStatus = await invoke<HotkeyStatus>('get_hotkey_status', {});
    } catch {
      hotkeyStatus = null;
    }

    try {
      waylandSnippets = await invoke<WaylandSnippets>('get_wayland_snippets', {});
    } catch {
      waylandSnippets = null;
    }
  }

  async function persist(next: Settings): Promise<void> {
    const trayChanged = appliedSettings.show_tray !== next.show_tray;
    const topChanged = appliedSettings.always_on_top !== next.always_on_top;

    settings = next;
    appliedSettings = next;

    try {
      await setSettings(next);
    } catch {
      // Persist failed. Keep the in-memory value visible.
    }

    try {
      await emit('settings-changed', next);
    } catch {
      // Window destroyed; ignore.
    }

    if (trayChanged) {
      try {
        await invoke('set_tray_visibility', { show: next.show_tray === 'On' });
      } catch {
        // Tray command failed; ignore.
      }
    }

    if (topChanged) {
      try {
        await invoke('set_always_on_top', { always_on_top: next.always_on_top === 'On' });
      } catch {
        // Command failed; ignore.
      }
    }
  }

  $effect(() => {
    void loadSettingsPage();
  });

  $effect(() => {
    let unlisten: (() => void) | undefined;
    (async () => {
      unlisten = await listen<Settings>('settings-changed', async ({ payload }) => {
        settings = coerceSettings(payload);
        appliedSettings = settings;
      });
    })();
    return () => {
      unlisten?.();
    };
  });
</script>

<SettingsWindow
  bind:settings
  onSave={(next: Settings) => void persist(next)}
  version={APP_VERSION}
  {hotkeyStatus}
  {waylandSnippets}
  {sheetsBySlug}
/>
