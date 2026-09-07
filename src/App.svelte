<!--
   Overlay shell (Task 9 wiring). App owns the current sheet (`slug`) and the search `query`.
   - SearchBox (top of HUD) binds `query`.
   - SheetView renders the current sheet with matches highlighted internally.
   The body loader is injectable (Task 12 wires the real Tauri store); a stub loader keeps the
   shell runnable now.
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import SheetView from './components/SheetView.svelte';
  import SearchBox from './components/SearchBox.svelte';
  import { findMatches } from './lib/search/findInSheet';

  // `load` (slug => body) is injected later (Task 12). Optional; defaults to a stub loader so
  // the shell is runnable now.
  let {
    load = async () =>
      [
        '# Sample Sheet',
        'This is a sample cheat sheet.',
        '',
        'To find something, type in the box above.',
        'For example, search for "insert" — it matches the line below.',
        '',
        'Insert mode: `i` to enter insert mode in vim.',
      ].join('\n'),
  } = $props();

  // Current sheet.
  let slug = $state('sample');
  // Search text bound to SearchBox.
  let query = $state('');
  // Raw body of the current sheet (for match count).
  let body = $state('');

  // Match count for the current body + query.
  const matchCount = $derived(findMatches(body, query).length);

  // Load the current sheet body, then keep `body` in sync for the search box.
  async function refreshBody(): Promise<void> {
    try {
      const raw = await load(slug);
      body = raw ?? '';
    } catch {
      body = '';
    }
  }

  // Refresh whenever the current sheet changes.
  onMount(() => {
    void refreshBody();
  });

  $effect(() => {
    void refreshBody();
  });
</script>

<main class="overlay">
  <header class="title">
    <h1>Cheat-Sheet HUD</h1>
    <span class="hint">Ctrl-Shift-Q</span>
  </header>

  <SearchBox {query} {matchCount} />

  <div class="sheet">
    <SheetView {slug} {load} {query} />
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
</style>
