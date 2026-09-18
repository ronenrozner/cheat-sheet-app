<!--
  SettingsPanel: edit the persisted settings snapshot (Task 12).

  Props:
  - `settings` (bound): the full snapshot from `lib/settings`.
  - `onSave`: called with the updated snapshot when the user commits a change. The parent persists
    it (and, if it changes the trigger, re-binds the global hotkey — Task 14).

  One control per field: theme (select), window size (two number inputs), trigger (three
  checkboxes + a key input), language (select), pinned slug (text input).

  Every control is uncontrolled internally but the value is driven by the bound `settings` prop, so
  a change updates the prop and the parent persists it.
-->
<script lang="ts">
  import type { Settings, Theme, SourceMode, Language, ShowTray } from '../lib/settings/types';
  import { DEFAULT_SETTINGS } from '../lib/settings/types';
  import { t } from '../lib/i18n';
  import { type HotkeyStatus, type WaylandSnippets, isWayland } from '../lib/overlay/hotkey';

  let {
    settings = DEFAULT_SETTINGS,
    onSave,
    hotkeyStatus = null,
    waylandSnippets = null,
    sheetsBySlug = {},
  } = $props<{
    settings?: Settings;
    onSave: (s: Settings) => void;
    hotkeyStatus?: HotkeyStatus | null;
    waylandSnippets?: WaylandSnippets | null;
    sheetsBySlug?: Record<string, string>;
  }>();

  // Theme (Follow / Light / Dark).
  function onTheme(e: Event) {
    const v = (e.target as HTMLSelectElement).value;
    settings = { ...settings, theme: v as Theme };
    onSave(settings);
  }

  // Window size (width / height).
  function onWidth(e: Event) {
    const el = e.target as HTMLInputElement;
    const width = Number.parseInt(el.value || '0', 10);
    settings = {
      ...settings,
      win_size: {
        ...settings.win_size,
        width: Number.isFinite(width) ? width : settings.win_size.width,
      },
    };
    onSave(settings);
  }

  function onHeight(e: Event) {
    const el = e.target as HTMLInputElement;
    const height = Number.parseInt(el.value || '0', 10);
    settings = {
      ...settings,
      win_size: {
        ...settings.win_size,
        height: Number.isFinite(height) ? height : settings.win_size.height,
      },
    };
    onSave(settings);
  }

  // Trigger key parts.
  function onTrigger(part: 'ctrl' | 'alt' | 'shift', checked: boolean) {
    settings = { ...settings, trigger: { ...settings.trigger, [part]: checked } };
    onSave(settings);
  }

  function onKey(e: Event) {
    const el = e.target as HTMLInputElement;
    settings = { ...settings, trigger: { ...settings.trigger, key: el.value } };
    onSave(settings);
  }

  // Language (v1 ships only en-US).
  function onLanguage(e: Event) {
    const v = (e.target as HTMLSelectElement).value;
    settings = { ...settings, language: v as Language };
    onSave(settings);
  }

  // System tray toggle (Task 17). Off = hidden window only; On = persistent tray icon.
  function onTray(e: Event, checked: boolean) {
    settings = {
      ...settings,
      show_tray: checked ? 'On' : 'Off',
    };
    onSave(settings);
  }

  // Always-on-top toggle (Task 18). On = window stays above others; Off = window goes behind.
  function onAlwaysOnTop(e: Event, checked: boolean) {
    settings = {
      ...settings,
      always_on_top: checked ? 'On' : 'Off',
    };
    onSave(settings);
  }

  // Pinned sheet: dropdown of every available sheet. The header shows the current title, or the
  // placeholder when nothing is pinned. Selecting a sheet sets `pinned_slug` (the value the overlay
  // uses to open the sheet). Clearing it sets an empty slug (no pin).
  function onPinned(e: Event) {
    const el = e.target as HTMLSelectElement;
    settings = { ...settings, pinned_slug: el.value };
    onSave(settings);
  }
</script>

<div class="panel">
  <label class="row">
    <span>{t('settings.theme')}</span>
    <select class="ctrl" bind:value={settings.theme} onchange={onTheme}>
      <option value="Follow">{t('settings.optionFollow')}</option>
      <option value="Light">{t('settings.optionLight')}</option>
      <option value="Dark">{t('settings.optionDark')}</option>
    </select>
  </label>

  <div class="row">
    <span>{t('settings.windowSize')}</span>
    <div class="size">
      <input
        class="ctrl"
        type="number"
        min="1"
        placeholder={t('settings.widthPlaceholder')}
        bind:value={settings.win_size.width}
        onchange={onWidth}
      />
      <input
        class="ctrl"
        type="number"
        min="1"
        placeholder={t('settings.heightPlaceholder')}
        bind:value={settings.win_size.height}
        onchange={onHeight}
      />
    </div>
  </div>

  <div class="row">
    <span>{t('settings.trigger')}</span>
    <div class="trigger">
      <label
        ><input
          type="checkbox"
          bind:checked={settings.trigger.ctrl}
          onchange={(e) => onTrigger('ctrl', (e.target as HTMLInputElement).checked)}
        />
        {t('settings.ctrl')}</label
      >
      <label
        ><input
          type="checkbox"
          bind:checked={settings.trigger.alt}
          onchange={(e) => onTrigger('alt', (e.target as HTMLInputElement).checked)}
        />
        {t('settings.alt')}</label
      >
      <label
        ><input
          type="checkbox"
          bind:checked={settings.trigger.shift}
          onchange={(e) => onTrigger('shift', (e.target as HTMLInputElement).checked)}
        />
        {t('settings.shift')}</label
      >
      <input
        class="ctrl key"
        type="text"
        placeholder={t('settings.keyPlaceholder')}
        bind:value={settings.trigger.key}
        onchange={onKey}
      />
    </div>
  </div>

  <label class="row">
    <span>{t('settings.language')}</span>
    <select class="ctrl" bind:value={settings.language} onchange={onLanguage}>
      <option value="EnUs">{t('settings.optionEnUs')}</option>
    </select>
  </label>

  <label class="row">
    <span>{t('settings.pinnedSheet')}</span>
    <select
      class="ctrl"
      bind:value={settings.pinned_slug}
      onchange={onPinned}
      aria-label={t('settings.pinnedSheet')}
    >
      <option value="">{t('settings.nonePlaceholder')}</option>
      {#each Object.keys(sheetsBySlug).sort((a, b) => a.localeCompare(b)) as slug (slug)}
        <option value={slug}>{sheetsBySlug[slug]}</option>
      {/each}
    </select>
  </label>

  <label class="row">
    <span>{t('settings.trayToggle')}</span>
    <input
      class="ctrl"
      type="checkbox"
      checked={settings.show_tray === 'On'}
      onchange={(e) => onTray(e, (e.target as HTMLInputElement).checked)}
    />
  </label>

  <label class="row">
    <span>{t('settings.alwaysOnTop')}</span>
    <input
      class="ctrl"
      type="checkbox"
      checked={settings.always_on_top === 'On'}
      onchange={(e) => onAlwaysOnTop(e, (e.target as HTMLInputElement).checked)}
    />
  </label>

  <!-- Global hotkey status (Task 14). On Wayland the global grab is best-effort + flagged;
       surface the `--toggle` fallback and per-compositor bind snippets. On X11/Windows it
       confirms the registered path. -->
  <div class="row wayland">
    <span>{t('settings.waylandTitle')}</span>
    <div class="wayland-body">
      {#if isWayland(hotkeyStatus) && waylandSnippets}
        <p class="warn">{t('settings.waylandUnavailable')}</p>
        <p>{t('settings.waylandUseToggle')}</p>
        <code class="cmd">cheatsheet-app --toggle</code>
        <p>{t('settings.waylandManualBind')}</p>
        <ul class="snippets">
          <li><code>{waylandSnippets.hyprland}</code></li>
          <li><code>{waylandSnippets.sway}</code></li>
          <li><code>{waylandSnippets.gnome}</code></li>
        </ul>
        <p class="hint">{t('settings.waylandHint')}</p>
      {:else}
        <p class="ok">{t('settings.waylandX11Ok')}</p>
      {/if}
    </div>
  </div>
</div>

<style>
  .panel {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    border: 1px solid var(--cs-border, #44475a);
    border-radius: 4px;
    padding: 0.6rem;
  }
  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }
  .row span {
    font-size: 0.85rem;
    opacity: 0.8;
  }
  .ctrl {
    padding: 0.3rem 0.4rem;
    font-size: 0.85rem;
    border-radius: 4px;
    border: 1px solid var(--cs-border, #44475a);
    background: var(--cs-input-bg, #282c3f);
    color: var(--cs-fg, #cdd6f4);
  }
  .ctrl:focus {
    outline: 2px solid var(--cs-accent, #7d9ad4);
    outline-offset: 1px;
  }
  .size {
    display: flex;
    gap: 0.4rem;
    flex: 1;
    max-width: 160px;
  }
  .trigger {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    font-size: 0.85rem;
  }
  .trigger label {
    display: flex;
    align-items: center;
    gap: 0.2rem;
  }
  .trigger .key {
    width: 3rem;
  }

  .wayland-body {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.8rem;
    max-width: 260px;
    text-align: right;
  }
  .wayland-body p,
  .wayland-body ul {
    margin: 0;
  }
  .wayland-body .warn {
    color: #f5deb3;
  }
  .wayland-body .ok {
    color: var(--cs-fg, #cdd6f4);
  }
  .wayland-body .hint {
    opacity: 0.65;
  }
  .wayland-body code.cmd {
    font-family: ui-monospace, monospace;
    background: var(--cs-input-bg, #282c3f);
    padding: 0.15rem 0.35rem;
    border-radius: 3px;
  }
  .wayland-body ul.snippets {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }
  .wayland-body ul.snippets code {
    font-family: ui-monospace, monospace;
    background: var(--cs-input-bg, #282c3f);
    padding: 0.15rem 0.35rem;
    border-radius: 3px;
  }
</style>
