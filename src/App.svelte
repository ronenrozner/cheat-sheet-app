<!--
   Overlay shell (Task 1 scaffold). Replaced by the full Overlay/Sidebar/SheetView/SearchBox tree
   in Tasks 9-12. v1 window is solid, undecorated, always-on-top (window config lives in
   src-tauri/tauri.conf.json).
-->
<script lang="ts">
  import { onMount } from 'svelte';
  // $state/$effect etc. land with the real overlay (Task 10).

  onMount(() => {
    console.log('[cheat-sheet] overlay shell mounted');
  });
</script>

<main class="overlay">
  <header class="title">
    <h1>Cheat-Sheet HUD</h1>
    <span class="hint">Ctrl-Shift-Q placeholder — wired in Task 2</span>
  </header>
  <p class="scaffold">Svelte 5 overlay scaffold. UI surfaces land in Tasks 9-12.</p>
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
  .scaffold {
    font-size: 0.9rem;
    opacity: 0.85;
    margin: 0;
  }
</style>
