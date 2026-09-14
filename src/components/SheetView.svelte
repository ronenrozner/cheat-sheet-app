<!--
  SheetView: renders one sheet's Markdown in an isolated iframe (sandbox) so untrusted HTML can't
  reach the app shell (Task 5). Takes a `slug` prop, an optional `load` function prop (the
  download layer, Task 6), and an optional `query` string (Task 8: highlight matches in the body).
  Re-renders when the slug or query changes.
-->
<script lang="ts">
  import { renderMarkdown } from '../lib/markdown/render';
  import { highlightMarkdown } from '../lib/search/findInSheet';
  import { t } from '../lib/i18n';

  // `slug` (required), optional `load` (slug => body), and optional `query` (Task 8).
  let { slug, load, query = '' } = $props();

  // Rendered HTML (sanitized).
  let html: string = $state('');
  // Error / empty message.
  let message: string | undefined = $state();

  async function render(slug: string, query: string): Promise<void> {
    if (!slug) {
      message = t('sheet.noneSelected');
      html = '';
      return;
    }
    try {
      const body = load ? await load(slug) : undefined;
      if (!body) {
        message = t('sheet.notFound', { slug });
        html = '';
        return;
      }
      message = undefined;
      // Render Markdown to sanitized HTML, then wrap query matches with <mark>.
      const rawHtml = await renderMarkdown(body);
      html = highlightMarkdown(rawHtml, query);
    } catch (err) {
      message = t('sheet.failed', { slug });
      html = '';
      console.error(err);
    }
  }

  // Re-render whenever the slug or query changes.
  $effect(() => {
    void render(slug, query);
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
