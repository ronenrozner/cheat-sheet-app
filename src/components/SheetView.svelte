<!--
  SheetView: renders one sheet's Markdown in an isolated iframe (sandbox) so untrusted HTML can't
  reach the app shell (Task 5). Takes a `slug` prop and an optional `load` function prop (the
  download layer, Task 6); re-renders when the slug changes.
-->
<script lang="ts">
  import { renderMarkdown } from '../lib/markdown/render';

  // `slug` (required) and optional `load` (slug => body). `load` is injected by the app (Task 6).
  let { slug, load } = $props();

  // Rendered HTML (sanitized).
  let html: string = $state('');
  // Error / empty message.
  let message: string | undefined = $state();

  async function render(slug: string): Promise<void> {
    if (!slug) {
      message = 'No sheet selected.';
      html = '';
      return;
    }
    try {
      const body = load ? await load(slug) : undefined;
      if (!body) {
        message = `Sheet "${slug}" not found.`;
        html = '';
        return;
      }
      message = undefined;
      html = await renderMarkdown(body);
    } catch (err) {
      message = `Failed to load sheet "${slug}".`;
      html = '';
      console.error(err);
    }
  }

  // Re-render whenever the slug changes.
  $effect(() => {
    void render(slug);
  });
</script>

<!-- Isolated render surface: sandbox blocks top-level scripts; the render happens in render.ts. -->
<iframe class="sheet-view" title={slug} srcdoc={html || message} sandbox="allow-same-origin"
></iframe>

{#if message && !html}
  <p class="empty">{message}</p>
{/if}

<style>
  .sheet-view {
    width: 100%;
    height: 100%;
    border: 0;
    box-sizing: border-box;
  }
  .empty {
    padding: 1rem;
    opacity: 0.7;
  }
</style>
