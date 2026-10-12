<!--
  SettingsPanel: edit the persisted settings snapshot (Task 12).

  Props:
  - `settings` (bound): the full snapshot from `lib/settings`.
  - `onSave`: called with the updated snapshot when the user commits a change. The parent persists
    it (and, if it changes the trigger, re-binds the global hotkey — Task 14).

  One control per field: theme (select), window geometry toggle, trigger (three
  checkboxes + a key input), language (select), pinned slug (text input).

  Every control is uncontrolled internally but the value is driven by the bound `settings` prop, so
  a change updates the prop and the parent persists it.
-->
<script lang="ts">
  import type { Settings, Theme, Language, ThemeDefinition } from '../lib/settings/types';
  import { DEFAULT_SETTINGS } from '../lib/settings/types';
  import { setLanguageLocale, t } from '../lib/i18n';

  let {
    settings = $bindable(DEFAULT_SETTINGS),
    onSave,
    themes = [],
  } = $props<{
    settings?: Settings;
    onSave: (s: Settings) => void;
    themes?: ThemeDefinition[];
  }>();

  let activeThemeSlot = $derived(
    settings.theme === 'Light'
      ? 'light'
      : settings.theme === 'Dark'
        ? 'dark'
        : window.matchMedia?.('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
  );

  // Theme (Follow / Light / Dark).
  function onTheme(e: Event) {
    const v = (e.target as HTMLSelectElement).value;
    settings = { ...settings, theme: v as Theme };
    onSave(settings);
  }

  function onLightTheme(e: Event) {
    const value = (e.target as HTMLSelectElement).value;
    settings = { ...settings, theme_light: value };
    onSave(settings);
  }

  function onDarkTheme(e: Event) {
    const value = (e.target as HTMLSelectElement).value;
    settings = { ...settings, theme_dark: value };
    onSave(settings);
  }

  // Window geometry. On = save main window size and position when it changes.
  function onSaveWindowGeometry(checked: boolean) {
    settings = {
      ...settings,
      save_window_geometry: checked ? 'On' : 'Off',
    };
    onSave(settings);
  }

  // Language (v1 ships only en-US).
  function onLanguage(e: Event) {
    const v = (e.target as HTMLSelectElement).value as Language;
    setLanguageLocale(v);
    settings = { ...settings, language: v };
    onSave(settings);
  }

  // System tray toggle (Task 17). Off = hidden window only; On = persistent tray icon.
  function onTray(checked: boolean) {
    settings = {
      ...settings,
      show_tray: checked ? 'On' : 'Off',
    };
    onSave(settings);
  }

  // Always-on-top toggle (Task 18). On = window stays above others; Off = window goes behind.
  function onAlwaysOnTop(checked: boolean) {
    settings = {
      ...settings,
      always_on_top: checked ? 'On' : 'Off',
    };
    onSave(settings);
  }
</script>

<div class="panel">
  <label class="row">
    <span>{t('settings.theme')}</span>
    <select class="ctrl" value={settings.theme} onchange={onTheme}>
      <option value="Follow">{t('settings.optionFollow')}</option>
      <option value="Light">{t('settings.optionLight')}</option>
      <option value="Dark">{t('settings.optionDark')}</option>
    </select>
  </label>

  <label class="row">
    <span class="setting-label">
      {t('settings.lightTheme')}
      {#if activeThemeSlot === 'light'}
        <strong class="active-badge">{t('settings.activeTheme')}</strong>
      {/if}
    </span>
    <select class="ctrl" value={settings.theme_light} onchange={onLightTheme}>
      {#each themes as themeDefinition (themeDefinition.name)}
        <option value={themeDefinition.name}>
          {themeDefinition.name}{themeDefinition.is_custom
            ? ` · ${t('settings.customThemeBadge')}`
            : ''}
        </option>
      {/each}
    </select>
  </label>

  <label class="row">
    <span class="setting-label">
      {t('settings.darkTheme')}
      {#if activeThemeSlot === 'dark'}
        <strong class="active-badge">{t('settings.activeTheme')}</strong>
      {/if}
    </span>
    <select class="ctrl" value={settings.theme_dark} onchange={onDarkTheme}>
      {#each themes as themeDefinition (themeDefinition.name)}
        <option value={themeDefinition.name}>
          {themeDefinition.name}{themeDefinition.is_custom
            ? ` · ${t('settings.customThemeBadge')}`
            : ''}
        </option>
      {/each}
    </select>
  </label>

  <label class="row">
    <span>{t('settings.saveWindowGeometry')}</span>
    <input
      class="switch"
      type="checkbox"
      role="switch"
      aria-label={t('settings.saveWindowGeometry')}
      checked={settings.save_window_geometry === 'On'}
      onchange={(e) => onSaveWindowGeometry((e.target as HTMLInputElement).checked)}
    />
  </label>

  <label class="row">
    <span>{t('settings.language')}</span>
    <select class="ctrl language-select" value={settings.language} onchange={onLanguage}>
      <option value="EnUs">{t('settings.optionEnUs')}</option>
      <option value="EsEs">{t('settings.optionEsEs')}</option>
      <option value="FrFr">{t('settings.optionFrFr')}</option>
    </select>
  </label>

  <label class="row">
    <span>{t('settings.trayToggle')}</span>
    <input
      class="switch"
      type="checkbox"
      role="switch"
      aria-label={t('settings.trayToggle')}
      checked={settings.show_tray === 'On'}
      onchange={(e) => onTray((e.target as HTMLInputElement).checked)}
    />
  </label>

  <label class="row">
    <span>{t('settings.alwaysOnTop')}</span>
    <input
      class="switch"
      type="checkbox"
      role="switch"
      aria-label={t('settings.alwaysOnTop')}
      checked={settings.always_on_top === 'On'}
      onchange={(e) => onAlwaysOnTop((e.target as HTMLInputElement).checked)}
    />
  </label>
</div>

<style>
  .panel {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--cs-border, #44475a);
    border-radius: 4px;
    padding: 0.6rem;
  }
  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.6rem 0;
    border-bottom: 1px solid var(--cs-border, #44475a);
  }
  .panel > .row:first-child {
    padding-top: 0;
  }
  .panel > .row:last-child {
    padding-bottom: 0;
    border-bottom: 0;
  }
  .row span {
    font-size: 0.85rem;
    opacity: 0.8;
  }
  .setting-label {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
  .active-badge {
    padding: 0.1rem 0.3rem;
    border-radius: 999px;
    background: var(--cs-selected-bg, #7d9ad4);
    color: var(--cs-selected-fg, #1e1e2e);
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    opacity: 1;
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
  .language-select {
    min-width: 13rem;
  }
  .switch {
    position: relative;
    width: 2.7rem;
    height: 1.45rem;
    flex: 0 0 auto;
    margin: 0;
    appearance: none;
    cursor: pointer;
    border: 1px solid var(--cs-border, #44475a);
    border-radius: 999px;
    background: color-mix(in srgb, var(--cs-input-bg, #282c3f) 80%, var(--cs-fg, #cdd6f4));
    transition:
      background 120ms ease,
      border-color 120ms ease;
  }
  .switch::before {
    content: '';
    position: absolute;
    top: 0.15rem;
    left: 0.15rem;
    width: 1.05rem;
    height: 1.05rem;
    border-radius: 50%;
    background: var(--cs-fg, #cdd6f4);
    box-shadow: 0 1px 3px rgb(0 0 0 / 0.35);
    transition: transform 120ms ease;
  }
  .switch:checked {
    border-color: var(--cs-accent, #7d9ad4);
    background: var(--cs-accent, #7d9ad4);
  }
  .switch:checked::before {
    transform: translateX(1.25rem);
    background: var(--cs-selected-fg, #1e1e2e);
  }
  .switch:focus-visible {
    outline: 2px solid var(--cs-accent, #7d9ad4);
    outline-offset: 2px;
  }
</style>
