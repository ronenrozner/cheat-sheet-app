<!--
   Overlay shell (Task 9 wiring). App owns the current sheet (`slug`) and the search `query`.
   - SearchBox (top of HUD) binds `query`.
   - SheetView renders the current sheet with matches highlighted internally.
   The body loader is injectable (Task 12 wires the real Tauri store); the default calls the
   Rust `load_sheet` command.
-->
<script lang="ts">
  import { invoke } from '@tauri-apps/api/core';
  import { listen, emit } from '@tauri-apps/api/event';
  import SheetView from './components/SheetView.svelte';
  import SearchBox from './components/SearchBox.svelte';
  import Sidebar from './components/Sidebar.svelte';
  import { createSelection, selectSheet, type Selection } from './lib/overlay/selection';
  import { resolveInitialSlug } from './lib/overlay/initialSlug';
  import {
    coerceSettings,
    getSettings as loadSettings,
    setSettings as persistSettings,
  } from './lib/settings/bridge';
  import { type Settings as SettingsModel, DEFAULT_SETTINGS } from './lib/settings/types';
  import { t } from './lib/i18n';
  import { findMatches } from './lib/search/findInSheet';
  import { openSettings } from './lib/settingsWindow';

  // Body loader (Task 12). Calls the Rust `load_sheet` command, which reads
  // `<home>/cheatsheets/<slug>.md` and returns the body with front-matter stripped, or `None`
  // when the sheet is missing/unreadable/empty.
  let {
    load = async (slug: string): Promise<string | null> => {
      try {
        return await invoke('load_sheet', { slug });
      } catch {
        return null;
      }
    },
  } = $props();

  // Selection is the single source of truth shared across the overlay: the Sidebar switches it,
  // the SearchBox highlights matches in it, and SheetView renders it.
  let selection = $state<Selection>(createSelection('', []));
  // Search text bound to SearchBox.
  let query = $state('');

  // Persisted settings (Task 11/12). Loaded once on mount so we can read the pinned slug for the
  // open-sheet decision and persist new pins. Loaded defensively (falls back to defaults).
  let settings = $state<SettingsModel>({ ...DEFAULT_SETTINGS });
  let appliedSettings: SettingsModel = { ...DEFAULT_SETTINGS };

  // Switch the selected sheet. Ignores unavailable slugs and no-op switches.
  function onSelect(slug: string) {
    const next = selectSheet(selection, slug);
    if (next.changed) {
      selection = next.selection;
    }
  }

  // Pin the current sheet (Task 11). Persists the slug so the next open shows it front-and-center.
  async function onPin() {
    const slug = selection.slug;
    if (!slug) return;
    const next: SettingsModel = { ...settings, pinned_slug: slug };
    settings = next;
    await persist(next);
  }

  // Persist an updated settings snapshot (Task 12). The panel calls this on every edit.
  async function persist(s: SettingsModel): Promise<void> {
    const trayChanged = appliedSettings.show_tray !== s.show_tray;
    const topChanged = appliedSettings.always_on_top !== s.always_on_top;

    settings = s;
    appliedSettings = s;
    try {
      await persistSettings(s);
    } catch {
      // Persist failed (e.g. store unavailable). The in-memory settings still reflect the edit.
    }
    // Live sync (Task 19): notify all open windows so they reflect the in-memory edit.
    try {
      await emit('settings-changed', s);
    } catch {
      // window destroyed; ignore.
    }
    // System tray (Task 17): when the tray toggle changes, apply it to the running instance.
    if (trayChanged) {
      try {
        await invoke('set_tray_visibility', { show: s.show_tray === 'On' });
      } catch {
        // tray command failed (e.g. tray not built); ignore.
      }
    }
    // Always-on-top (Task 18): when the toggle changes, apply it to the running instance.
    if (topChanged) {
      try {
        await invoke('set_always_on_top', { always_on_top: s.always_on_top === 'On' });
      } catch {
        // command failed; ignore.
      }
    }
  }

  // Open the settings window (Task 19). Triggered by the gear icon in the overlay header.
  function onOpenSettings() {
    void openSettings();
  }

  // Whether the current sheet is the pinned one (drives the header button label).
  let isPinned = $derived(settings.pinned_slug === selection.slug);

  // Raw body of the current sheet (for the SearchBox match count).
  let body = $state('');

  // Fetch the sheet list once, load settings, and select the resolved open sheet (Task 11: pinned
  // sheet wins, first run falls back to a bundled default, then the first available sheet).
  async function loadSheets(): Promise<void> {
    try {
      const sheets = await invoke<[{ slug: string; title: string }]>('list_sheets', {});
      const slugs = sheets.map((s: { slug: string }) => s.slug);
      // Load persisted settings once (Task 11/12): read the pinned slug for the open-sheet decision.
      try {
        settings = await loadSettings();
        appliedSettings = settings;
      } catch {
        settings = { ...DEFAULT_SETTINGS };
        appliedSettings = settings;
      }
      // Pinned sheet wins; first run falls back to a bundled default, then the first available sheet.
      const initial = resolveInitialSlug(settings.pinned_slug, slugs);
      if (slugs.length > 0) {
        selection = { slug: initial, slugs };
      }
    } catch {
      // empty list — the Sidebar stays empty
    }
  }

  // Match count for the current body + query. `let` (not `const`) so `$derived` is a reactive
  // variable that reads as a plain number — a `const` $derived is a getter object and must be
  // called as `matchCount()`, which would break the SearchBox prop binding.
  let matchCount = $derived(findMatches(body, query).length);

  // Load the current sheet body, then keep `body` in sync for the search box.
  async function refreshBody(): Promise<void> {
    try {
      const raw = await load(selection.slug);
      body = raw ?? '';
    } catch {
      body = '';
    }
  }

  // Refresh whenever the selected sheet changes. `$effect` also fires on mount, so no onMount
  // block is needed here.
  $effect(() => {
    void refreshBody();
  });

  // Fetch the sheet list once on mount. This effect reads no reactive state, so it runs once
  // and never re-runs when `selection` changes.
  $effect(() => {
    void loadSheets();
  });

  // Live sync (Task 19): when a window persists a change, it emits `settings-changed`.
  // Use the payload directly so a store failure does not reset the edited in-memory settings.
  $effect(() => {
    let unlisten: (() => void) | undefined;
    (async () => {
      unlisten = await listen<SettingsModel>('settings-changed', async ({ payload }) => {
        settings = coerceSettings(payload);
        appliedSettings = settings;
      });
    })();
    return () => {
      unlisten?.();
    };
  });
</script>

<main class="overlay">
  <header class="title">
    <h1>{t('app.title')}</h1>
    <span class="hint">{t('app.hotkey')}</span>
    <button class="pin" type="button" onclick={onPin} aria-pressed={isPinned}>
      {isPinned ? t('app.unpin') : t('app.pin')}
    </button>
    <button class="gear" type="button" aria-label={t('settings.close')} onclick={onOpenSettings}>
      ⚙
    </button>
  </header>

  <SearchBox {query} {matchCount} />

  <div class="pane">
    <div class="pane-body">
      <Sidebar {selection} onselect={onSelect} />
      <div class="sheet">
        <SheetView slug={selection.slug} {load} {query} />
      </div>
    </div>
  </div>
</main>

<style>
  .overlay {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
    height: 100vh;
    box-sizing: border-box;
    background: var(--cs-bg, #1e1e2e);
    color: var(--cs-fg, #cdd6f4);
    font-family: system-ui, sans-serif;
  }
  .title {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
  }
  .title h1 {
    font-size: 1.1rem;
    margin: 0;
  }
  .hint {
    font-size: 0.8rem;
    opacity: 0.7;
    margin: 0;
  }
  .sheet {
    flex: 1;
    min-height: 0;
  }
  .pane-body {
    display: flex;
    flex: 1;
    min-height: 0;
  }
  .pane {
    display: flex;
    flex: 1;
  }
  .pin {
    padding: 0.35rem 0.6rem;
    font-size: 0.8rem;
    border-radius: 4px;
    border: 1px solid var(--cs-border, #44475a);
    background: transparent;
    color: var(--cs-fg, #cdd6f4);
    cursor: pointer;
  }
  .pin:hover {
    background: var(--cs-hover-bg, #282c3f);
  }
  .pin[aria-pressed='true'] {
    background: var(--cs-selected-bg, #7d9ad4);
    color: #1e1e2e;
  }
  .gear {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.6rem;
    height: 1.6rem;
    font-size: 1.1rem;
    border-radius: 4px;
    border: 1px solid var(--cs-border, #44475a);
    background: transparent;
    color: var(--cs-fg, #cdd6f4);
    cursor: pointer;
  }
  .gear:hover {
    background: var(--cs-hover-bg, #282c3f);
  }
</style>
