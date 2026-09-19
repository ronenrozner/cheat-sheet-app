<!--
  SettingsWindow: the settings window UI (Task 19).

  Renders from the SvelteKit `/settings` route inside the `settings` Tauri window.
  Layout mirrors the reference screenshot:
  - Left tab sidebar (Settings / About).
  - Custom title bar ("SETTINGS" text + close button) that supports window dragging.

  Props:
  - `settings` (bound): the full settings snapshot.
  - `onSave`: called with the updated snapshot when the user commits a change. The parent
    persists it and emits the `settings-changed` event so the main overlay updates live.
  - `version` (string): the app version for the About tab.
  - `hotkeyStatus` / `waylandSnippets`: passed through to the Settings tab (Task 14).
-->
<script lang="ts">
  import { getCurrentWindow } from '@tauri-apps/api/window';
  import SettingsPanel from './SettingsPanel.svelte';
  import AboutTab from './AboutTab.svelte';
  import { t } from '../lib/i18n';
  import type { Settings, ThemeDefinition } from '../lib/settings/types';
  import { DEFAULT_SETTINGS } from '../lib/settings/types';
  import { type HotkeyStatus, type WaylandSnippets, isWayland } from '../lib/overlay/hotkey';

  let {
    settings = $bindable(DEFAULT_SETTINGS),
    onSave,
    version = '',
    hotkeyStatus = null,
    waylandSnippets = null,
    sheetsBySlug = {},
    themes = [],
  } = $props<{
    settings?: Settings;
    onSave: (s: Settings) => void;
    version?: string;
    hotkeyStatus?: HotkeyStatus | null;
    waylandSnippets?: WaylandSnippets | null;
    sheetsBySlug?: Record<string, string>;
    themes?: ThemeDefinition[];
  }>();

  // Active tab: 'settings' | 'about'.
  let tab = $state<'settings' | 'about'>('settings');

  // Drag the window from anywhere except form controls (decorations: false, so there is no
  // native drag handle). Without the guard below, starting a drag on a mousedown swallows the
  // following click, so checkboxes, text inputs, and selects never register a change.
  function onStartDrag(e: MouseEvent) {
    const target = e.target as HTMLElement;
    // A control (or the text of a label wrapping one) must not start a drag: the native drag
    // gesture would steal the click and the control would not update.
    if (target.closest('select, input, textarea, button') || target.closest('label')) {
      return;
    }
    void getCurrentWindow().startDragging();
  }

  // Close the settings window and keep the main overlay open.
  function onClose() {
    void getCurrentWindow().hide();
  }
</script>

<div
  class="window"
  role="dialog"
  aria-label={t('settings.title')}
  tabindex="-1"
  onmousedown={onStartDrag}
>
  <header class="titlebar">
    <span class="title">{t('settings.title')}</span>
    <button
      class="close"
      type="button"
      aria-label={t('settings.close')}
      // Stop the mousedown from bubbling to the .window drag handle, otherwise clicking the X
      // starts a window drag instead of calling onClose().
      onmousedown={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      onclick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      ×
    </button>
  </header>

  <div class="body">
    <nav class="tabs" aria-label={t('settings.tabsLabel')}>
      <button
        class={`tab ${tab === 'settings' ? 'active' : ''}`}
        type="button"
        aria-pressed={tab === 'settings'}
        onclick={() => {
          tab = 'settings';
        }}
      >
        {t('settings.settingsTab')}
      </button>
      <button
        class={`tab ${tab === 'about' ? 'active' : ''}`}
        type="button"
        aria-pressed={tab === 'about'}
        onclick={() => {
          tab = 'about';
        }}
      >
        {t('settings.aboutTab')}
      </button>
    </nav>

    <div class="content">
      {#if tab === 'settings'}
        <SettingsPanel
          bind:settings
          {onSave}
          {hotkeyStatus}
          {waylandSnippets}
          {sheetsBySlug}
          {themes}
        />
      {:else}
        <AboutTab {version} />
      {/if}
    </div>
  </div>
</div>

<style>
  .window {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: var(--cs-bg, #1e1e2e);
    color: var(--cs-fg, #cdd6f4);
    font-family: system-ui, sans-serif;
    user-select: none;
  }
  .titlebar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.75rem;
    cursor: move;
    border-bottom: 1px solid var(--cs-border, #44475a);
  }
  .titlebar .title {
    font-size: 0.95rem;
    letter-spacing: 0.15em;
    opacity: 0.9;
  }
  .titlebar .close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    font-size: 1.2rem;
    line-height: 1;
    border: 1px solid var(--cs-border, #44475a);
    border-radius: 4px;
    background: transparent;
    color: var(--cs-fg, #cdd6f4);
    cursor: pointer;
  }
  .titlebar .close:hover {
    background: var(--cs-hover-bg, #282c3f);
  }
  .body {
    display: flex;
    flex: 1;
    min-height: 0;
  }
  .tabs {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.75rem;
    border-right: 1px solid var(--cs-border, #44475a);
    min-width: 120px;
  }
  .tab {
    text-align: left;
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
    border-radius: 4px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--cs-fg, #cdd6f4);
    cursor: pointer;
  }
  .tab:hover {
    background: var(--cs-hover-bg, #282c3f);
  }
  .tab.active {
    background: var(--cs-selected-bg, #7d9ad4);
    color: var(--cs-selected-fg, #1e1e2e);
  }
  .content {
    flex: 1;
    padding: 0.75rem;
    overflow-y: auto;
  }
</style>
