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
  import { localeRevision, setLanguageLocale, t } from './lib/i18n';
  import { findMatches } from './lib/search/findInSheet';
  import { openSettings } from './lib/settingsWindow';
  import {
    FALLBACK_THEMES,
    applyThemePreference,
    getThemes,
    onThemesChanged,
    watchPreferredColorScheme,
  } from './lib/theme';
  import type { ThemeDefinition } from './lib/settings/types';

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
  let themes = $state<ThemeDefinition[]>(FALLBACK_THEMES);

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
        await invoke('set_always_on_top', { alwaysOnTop: s.always_on_top === 'On' });
      } catch {
        // command failed; ignore.
      }
    }
  }

  // Move focus to the in-sheet search field. Overrides the browser find shortcut in the overlay.
  function onWindowKeydown(event: KeyboardEvent) {
    if (!event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return;
    if (event.key.toLowerCase() !== 'f') return;

    event.preventDefault();
    const input = document.querySelector<HTMLInputElement>('.search-input');
    input?.focus();
    input?.select();
  }

  // Open the selected sheet in the system editor.
  async function onEditSheet() {
    if (!selection.slug) return;
    try {
      await invoke('open_sheet_for_edit', { slug: selection.slug });
    } catch {
      // The OS did not open an editor. Keep the overlay usable.
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
        const loadedSettings = await loadSettings();
        setLanguageLocale(loadedSettings.language);
        settings = loadedSettings;
        appliedSettings = settings;
      } catch {
        const defaultSettings = { ...DEFAULT_SETTINGS };
        setLanguageLocale(defaultSettings.language);
        settings = defaultSettings;
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

  // Theme sync: mirrors the Cheatsheet pattern. Resolve the saved preference against the OS
  // scheme, then apply CSS custom properties on the document root.
  $effect(() => {
    applyThemePreference(settings, themes);
  });

  // If the user selected Follow, live OS scheme changes must update the app without restart.
  $effect(() => {
    return watchPreferredColorScheme(() => applyThemePreference(settings, themes));
  });

  // Load bundled + custom JSON themes, then subscribe to backend hot-reload events.
  $effect(() => {
    let unlisten: (() => void) | undefined;
    (async () => {
      themes = await getThemes();
      unlisten = await onThemesChanged((updated) => {
        themes = updated.length > 0 ? updated : FALLBACK_THEMES;
      });
    })();
    return () => {
      unlisten?.();
    };
  });

  // Live sync (Task 19): when a window persists a change, it emits `settings-changed`.
  // Use the payload directly so a store failure does not reset the edited in-memory settings.
  $effect(() => {
    let unlisten: (() => void) | undefined;
    (async () => {
      unlisten = await listen<SettingsModel>('settings-changed', async ({ payload }) => {
        const nextSettings = coerceSettings(payload);
        setLanguageLocale(nextSettings.language);
        settings = nextSettings;
        appliedSettings = settings;
      });
    })();
    return () => {
      unlisten?.();
    };
  });
</script>

<svelte:window onkeydown={onWindowKeydown} />

{#key $localeRevision}
<main class="overlay">
  <header class="title">
    <div class="drag-region" data-tauri-drag-region>
      <h1 data-tauri-drag-region>{t('app.title')}</h1>
    </div>
    <div class="title-actions">
      <button
        class="icon-button"
        type="button"
        aria-label={t('app.edit')}
        onclick={onEditSheet}
        disabled={!selection.slug}
      >
        ✎
      </button>
      <button
        class="icon-button gear"
        type="button"
        aria-label={t('settings.settingsOpen')}
        onclick={onOpenSettings}
      >
        ⚙
      </button>
    </div>
  </header>

  <SearchBox bind:query {matchCount} />

  <div class="pane">
    <div class="pane-body">
      <div class="left-rail">
        <Sidebar {selection} onselect={onSelect} />
        <button class="pin" type="button" onclick={onPin} aria-pressed={isPinned}>
          {isPinned ? t('app.unpin') : t('app.pin')}
        </button>
      </div>
      <div class="sheet">
        <SheetView slug={selection.slug} {load} {query} />
      </div>
    </div>
  </div>
</main>
{/key}

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
    font-family: 'Mona Sans', system-ui, sans-serif;
  }
  .title {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
  }
  .drag-region {
    flex: 1;
    min-width: 0;
    cursor: move;
  }
  .title h1 {
    font-size: 1.1rem;
    margin: 0;
  }
  .left-rail {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-height: 0;
    width: 7rem;
  }
  .left-rail :global(.sidebar) {
    flex: 1;
    min-height: 0;
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
    width: 100%;
    padding: 0.35rem 0.45rem;
    font-size: 0.78rem;
    border-radius: 4px;
    border: 1px solid var(--cs-border, #44475a);
    background: transparent;
    color: var(--cs-fg, #cdd6f4);
    cursor: pointer;
    white-space: normal;
  }
  .pin:hover {
    background: var(--cs-hover-bg, #282c3f);
  }
  .pin[aria-pressed='true'] {
    background: var(--cs-selected-bg, #7d9ad4);
    color: var(--cs-selected-fg, #1e1e2e);
  }
  .title-actions {
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }
  .icon-button {
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
  .icon-button:hover:not(:disabled) {
    background: var(--cs-hover-bg, #282c3f);
  }
  .icon-button:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
</style>
