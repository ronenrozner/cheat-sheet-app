<script lang="ts">
  import { t } from '../lib/i18n';
  import { type HotkeyStatus, type WaylandSnippets, isWayland } from '../lib/overlay/hotkey';
  import { DEFAULT_SETTINGS, type Settings } from '../lib/settings/types';

  let {
    settings = $bindable(DEFAULT_SETTINGS),
    onSave,
    hotkeyStatus = null,
    waylandSnippets = null,
  } = $props<{
    settings?: Settings;
    onSave: (s: Settings) => void;
    hotkeyStatus?: HotkeyStatus | null;
    waylandSnippets?: WaylandSnippets | null;
  }>();

  function onTrigger(part: 'ctrl' | 'alt' | 'shift', checked: boolean) {
    settings = { ...settings, trigger: { ...settings.trigger, [part]: checked } };
    onSave(settings);
  }

  function onKey(e: Event) {
    const el = e.target as HTMLInputElement;
    settings = { ...settings, trigger: { ...settings.trigger, key: el.value } };
    onSave(settings);
  }
</script>

<section class="shortcuts" aria-labelledby="shortcuts-title">
  <h2 id="shortcuts-title">{t('shortcuts.title')}</h2>
  <p>{t('shortcuts.activeWhileFocused')}</p>

  <dl class="shortcut-list">
    <div class="shortcut-item">
      <dt>{t('shortcuts.find')}</dt>
      <dd><kbd>Ctrl</kbd><span>+</span><kbd>F</kbd></dd>
    </div>
  </dl>

  <div class="row">
    <span>{t('settings.trigger')}</span>
    <div class="trigger">
      <label
        ><input
          type="checkbox"
          checked={settings.trigger.ctrl}
          onchange={(e) => onTrigger('ctrl', (e.target as HTMLInputElement).checked)}
        />
        {t('settings.ctrl')}</label
      >
      <label
        ><input
          type="checkbox"
          checked={settings.trigger.alt}
          onchange={(e) => onTrigger('alt', (e.target as HTMLInputElement).checked)}
        />
        {t('settings.alt')}</label
      >
      <label
        ><input
          type="checkbox"
          checked={settings.trigger.shift}
          onchange={(e) => onTrigger('shift', (e.target as HTMLInputElement).checked)}
        />
        {t('settings.shift')}</label
      >
      <input
        class="ctrl key"
        type="text"
        placeholder={t('settings.keyPlaceholder')}
        value={settings.trigger.key}
        oninput={onKey}
      />
    </div>
  </div>

  <!-- Global hotkey status (Task 14). On Wayland the global grab is best-effort + flagged. -->
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
</section>

<style>
  .shortcuts {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .shortcuts h2 {
    margin: 0;
    font-size: 0.95rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .shortcuts p {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.85;
  }

  .shortcut-list {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin: 0.25rem 0 0;
  }

  .shortcut-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .shortcut-item dt {
    font-size: 0.85rem;
    opacity: 0.8;
  }

  .shortcut-item dd {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    margin: 0;
    font-size: 0.8rem;
  }

  .shortcut-item kbd {
    min-width: 1.5rem;
    padding: 0.15rem 0.35rem;
    border: 1px solid var(--cs-border, #44475a);
    border-radius: 3px;
    background: var(--cs-input-bg, #282c3f);
    color: var(--cs-fg, #cdd6f4);
    font-family: ui-monospace, monospace;
    text-align: center;
  }

  .row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 0.5rem;
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
    background: color-mix(in srgb, var(--cs-input-bg, #282c3f) 72%, var(--cs-fg, #cdd6f4));
    color: var(--cs-fg, #cdd6f4);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--cs-fg, #cdd6f4) 18%, transparent);
  }

  .ctrl:focus {
    outline: 2px solid var(--cs-accent, #7d9ad4);
    outline-offset: 1px;
    background: color-mix(in srgb, var(--cs-input-bg, #282c3f) 60%, var(--cs-fg, #cdd6f4));
    box-shadow: inset 0 0 0 1px var(--cs-accent, #7d9ad4);
  }

  .trigger {
    display: flex;
    align-items: center;
    justify-content: flex-end;
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
