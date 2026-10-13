<script lang="ts">
  import { t } from '../lib/i18n';
  import TooltipInfo from './TooltipInfo.svelte';
  import { type HotkeyStatus, type WaylandSnippets, isWayland } from '../lib/overlay/hotkey';
  import {
    DEFAULT_SETTINGS,
    type OpenLinksModifier,
    type Settings,
    type TriggerKey,
  } from '../lib/settings/types';

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

  let listeningFor = $state<'trigger' | 'find' | null>(null);

  const MODIFIER_KEYS = new Set(['Control', 'Shift', 'Alt', 'Meta', 'CapsLock']);

  const triggerLabel = $derived(formatTrigger(settings.trigger));
  const findLabel = $derived(formatTrigger(settings.find_shortcut));

  function formatTrigger(trigger: TriggerKey): string {
    const parts = [];
    if (trigger.ctrl) parts.push(t('settings.ctrl'));
    if (trigger.alt) parts.push(t('settings.alt'));
    if (trigger.shift) parts.push(t('settings.shift'));
    parts.push(trigger.key.trim().toUpperCase() || t('settings.keyPlaceholder'));
    return parts.join(' + ');
  }

  function startListening(target: 'trigger' | 'find') {
    listeningFor = target;
  }

  function stopListening() {
    listeningFor = null;
  }

  function onOpenLinks(e: Event) {
    const openLinks = (e.target as HTMLSelectElement).value as OpenLinksModifier;
    settings = { ...settings, open_links: openLinks };
    onSave(settings);
  }

  function onShortcutKeydown(e: KeyboardEvent) {
    if (!listeningFor) return;

    e.preventDefault();
    e.stopPropagation();

    if (e.key === 'Escape') {
      stopListening();
      return;
    }

    if (MODIFIER_KEYS.has(e.key)) return;

    const shortcut = {
      ctrl: e.ctrlKey,
      alt: e.altKey,
      shift: e.shiftKey,
      key: e.key.length === 1 ? e.key.toLowerCase() : e.key,
    };

    settings =
      listeningFor === 'trigger'
        ? { ...settings, trigger: shortcut }
        : { ...settings, find_shortcut: shortcut };
    onSave(settings);
    stopListening();
  }
</script>

<section class="shortcuts" aria-labelledby="shortcuts-title">
  <h2 id="shortcuts-title">{t('shortcuts.title')}</h2>
  <p>{t('shortcuts.activeWhileFocused')}</p>

  <div class="section">
    <dl class="shortcut-list">
      <div class="shortcut-item">
        <dt>{t('settings.trigger')}</dt>
        <dd>
          <button
            class="trigger-capture"
            class:listening={listeningFor === 'trigger'}
            type="button"
            aria-pressed={listeningFor === 'trigger'}
            onclick={() => startListening('trigger')}
            onblur={stopListening}
            onkeydown={onShortcutKeydown}
          >
            {#if listeningFor === 'trigger'}
              Press shortcut…
            {:else}
              {triggerLabel}
            {/if}
          </button>
        </dd>
      </div>
      <div class="shortcut-item">
        <dt>{t('shortcuts.find')}</dt>
        <dd>
          <button
            class="trigger-capture"
            class:listening={listeningFor === 'find'}
            type="button"
            aria-pressed={listeningFor === 'find'}
            onclick={() => startListening('find')}
            onblur={stopListening}
            onkeydown={onShortcutKeydown}
          >
            {#if listeningFor === 'find'}
              Press shortcut…
            {:else}
              {findLabel}
            {/if}
          </button>
        </dd>
      </div>
      <div class="shortcut-item open-links-item">
        <dt>
          {t('shortcuts.openLinks')}
          <TooltipInfo text={t('shortcuts.openLinksTooltip')} />
        </dt>
        <dd>
          <select class="ctrl" value={settings.open_links} onchange={onOpenLinks}>
            <option value="None">{t('shortcuts.openLinksNo')}</option>
            <option value="Click">{t('shortcuts.openLinksClickOnly')}</option>
            <option value="Ctrl">{t('shortcuts.openLinksCtrlClick')}</option>
            <option value="Alt">{t('shortcuts.openLinksAltClick')}</option>
          </select>
        </dd>
      </div>
    </dl>
  </div>

  <!-- Global hotkey status (Task 14). On Wayland the global grab is best-effort + flagged. -->
  <div class="row wayland section">
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

  .section {
    border-top: 1px solid var(--cs-border, #44475a);
    padding-top: 0.75rem;
    margin-top: 0.25rem;
  }

  .shortcut-list {
    display: flex;
    flex-direction: column;
    margin: 0;
  }

  .shortcut-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 12px 0;
    border-bottom: 1px solid var(--cs-border, #44475a);
  }

  .shortcut-item:last-child {
    border-bottom: 0;
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
    min-width: 9rem;
    padding: 0.3rem 0.55rem;
    border-radius: 4px;
    border: 1px solid var(--cs-border, #44475a);
    background: var(--cs-input-bg, #282c3f);
    color: var(--cs-fg, #cdd6f4);
  }

  .trigger-capture {
    min-width: 9rem;
    padding: 0.1rem 0;
    font-family: 'Mona Sans Mono', ui-monospace, monospace;
    font-size: 0.85rem;
    text-align: center;
    border: 0;
    background: none;
    color: var(--cs-fg, #cdd6f4);
    box-shadow: none;
    cursor: pointer;
  }

  .trigger-capture:hover {
    color: var(--cs-accent, #7d9ad4);
  }

  .trigger-capture:focus,
  .trigger-capture.listening {
    outline: 2px solid var(--cs-accent, #7d9ad4);
    outline-offset: 3px;
    border-radius: 3px;
    background: color-mix(in srgb, var(--cs-accent, #7d9ad4) 14%, transparent);
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
    font-family: 'Mona Sans Mono', ui-monospace, monospace;
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
    font-family: 'Mona Sans Mono', ui-monospace, monospace;
    background: var(--cs-input-bg, #282c3f);
    padding: 0.15rem 0.35rem;
    border-radius: 3px;
  }
</style>
