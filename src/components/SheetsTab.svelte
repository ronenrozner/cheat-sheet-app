<script lang="ts">
  import { open } from '@tauri-apps/plugin-dialog';
  import { t } from '../lib/i18n';
  import { DEFAULT_SETTINGS, type Settings } from '../lib/settings/types';

  let {
    settings = $bindable(DEFAULT_SETTINGS),
    onSave,
    sheetsBySlug = {},
  } = $props<{
    settings?: Settings;
    onSave: (s: Settings) => void;
    sheetsBySlug?: Record<string, string>;
  }>();

  async function onChooseEditor() {
    const selected = await open({
      multiple: false,
      directory: false,
      title: t('settings.editorSelect'),
    });
    if (typeof selected !== 'string') return;
    settings = { ...settings, editor_path: selected };
    onSave(settings);
  }

  function onEditorPath(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    settings = { ...settings, editor_path: value };
    onSave(settings);
  }

  function onSystemEditor() {
    settings = { ...settings, editor_path: '' };
    onSave(settings);
  }

  function onPinned(e: Event) {
    const el = e.target as HTMLSelectElement;
    settings = { ...settings, pinned_slug: el.value };
    onSave(settings);
  }
</script>

<div class="panel">
  <label class="row">
    <span>{t('settings.pinnedSheet')}</span>
    <select
      class="ctrl"
      value={settings.pinned_slug}
      onchange={onPinned}
      aria-label={t('settings.pinnedSheet')}
    >
      <option value="">{t('settings.nonePlaceholder')}</option>
      {#each Object.keys(sheetsBySlug).sort((a, b) => a.localeCompare(b)) as slug (slug)}
        <option value={slug}>{sheetsBySlug[slug]}</option>
      {/each}
    </select>
  </label>

  <div class="row">
    <span>{t('settings.editor')}</span>
    <div class="editor-control">
      <input
        class="ctrl editor-output"
        type="text"
        aria-label={t('settings.editor')}
        placeholder={t('settings.editorSystem')}
        value={settings.editor_path}
        onchange={onEditorPath}
      />
      <button class="ctrl button" type="button" onclick={onChooseEditor}>
        {t('settings.editorBrowse')}
      </button>
      <button
        class="ctrl button"
        type="button"
        onclick={onSystemEditor}
        disabled={!settings.editor_path.trim()}
      >
        {t('settings.editorUseSystem')}
      </button>
    </div>
  </div>
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
  .ctrl[type='text'] {
    background: color-mix(in srgb, var(--cs-input-bg, #282c3f) 72%, var(--cs-fg, #cdd6f4));
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--cs-fg, #cdd6f4) 18%, transparent);
  }
  .ctrl[type='text']:hover {
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--cs-fg, #cdd6f4) 30%, transparent);
  }
  .ctrl[type='text']:focus {
    background: color-mix(in srgb, var(--cs-input-bg, #282c3f) 60%, var(--cs-fg, #cdd6f4));
    box-shadow: inset 0 0 0 1px var(--cs-accent, #7d9ad4);
  }
  .editor-control {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.35rem;
    flex: 1;
    min-width: 0;
  }
  .editor-output {
    flex: 1;
    min-width: 8rem;
    max-width: 16rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .button {
    cursor: pointer;
  }
  .button:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
</style>
