<!--
  SearchBox: find-in-current-sheet input (Task 9).
  Located at the top of the HUD, above the sheet content. NL only, no cross-sheet index.
  The match count and highlight are computed in the parent (App), which owns the sheet body.
-->
<script lang="ts">
  import { t } from '../lib/i18n';

  // `query` is bindable so typing updates App's source of truth.
  // `matchCount` is computed by the parent from the current sheet body and query.
  let { query = $bindable(), matchCount } = $props();

  // "N matches" when there are matches; "No matches" when zero but text is entered;
  // empty (placeholder only) when there is no text yet.
  const label = $derived(
    (() => {
      const q = query.trim();
      if (!q) return '';
      return matchCount > 0
        ? `${matchCount} ${matchCount === 1 ? t('search.match') : t('search.matches')}`
        : t('search.noMatches');
    })()
  );
</script>

<div class="search">
  <input
    class="search-input"
    type="text"
    placeholder={t('search.placeholder')}
    aria-label={t('search.placeholder')}
    bind:value={query}
  />
  {#if label}
    <span class="search-count" aria-live="polite">{label}</span>
  {/if}
</div>

<style>
  .search {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .search-input {
    flex: 1;
    padding: 0.4rem 0.6rem;
    font-size: 0.9rem;
    border-radius: 4px;
    border: 1px solid var(--cs-border, #44475a);
    background: var(--cs-input-bg, #282c3f);
    color: var(--cs-fg, #cdd6f4);
  }
  .search-input:focus {
    outline: 2px solid var(--cs-accent, #7d9ad4);
    outline-offset: 1px;
  }
  .search-count {
    font-size: 0.8rem;
    opacity: 0.7;
    white-space: nowrap;
  }
</style>
