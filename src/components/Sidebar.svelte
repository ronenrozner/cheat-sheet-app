<!--
  Sidebar: lists the available sheets and switches the selected one (Task 10).

  The selected sheet (`slug`) is the single source of truth shared across the overlay: the Sidebar
  switches it via an `onselect` event, the SearchBox highlights matches in it, and SheetView
  renders it. This component stays thin — it only renders the list and emits the click.

  Props:
  - `selection`: the current selection `{ slug, slugs }`.
  - `label`: optional per-sheet label (slug shown when absent).
-->
<script lang="ts">
  import { t } from '../lib/i18n';

  let { selection, label = (slug: string) => slug, onselect } = $props();

  const labelText = $derived(t('sidebar.label'));

  function onClick(slug: string) {
    onselect?.(slug);
  }
</script>

<aside class="sidebar" aria-label={labelText}>
  <ul class="sheet-list">
    {#each selection.slugs as slug (slug)}
      <li>
        <button
          class={`sheet-item ${slug === selection.slug ? 'sheet-item-selected' : ''}`}
          type="button"
          aria-current={slug === selection.slug ? 'true' : undefined}
          onclick={() => onClick(slug)}
        >
          <span class="sheet-item-name">{label(slug)}</span>
        </button>
      </li>
    {/each}
  </ul>
</aside>

<style>
  .sidebar {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    border: 1px solid var(--cs-border, #44475a);
    border-radius: 4px;
    padding: 0.5rem;
  }
  .sheet-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .sheet-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    width: 100%;
    padding: 0.4rem 0.6rem;
    font-size: 0.9rem;
    text-align: left;
    border-radius: 4px;
    border: none;
    background: transparent;
    color: var(--cs-fg, #cdd6f4);
    cursor: pointer;
  }
  .sheet-item:hover {
    background: var(--cs-hover-bg, #282c3f);
  }
  .sheet-item.selected {
    background: var(--cs-selected-bg, #7d9ad4);
    color: #1e1e2e;
  }
  .sheet-item-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
