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
  import { DEFAULT_SETTINGS, type TriggerKey } from '../lib/settings/types';

  // `slug` (required), optional `load` (slug => body), optional `query` (Task 8), and optional
  // `onctrlfind` callback for forwarding the find shortcut from the focused iframe to the app shell.
  let {
    slug,
    load,
    query = '',
    findShortcut = DEFAULT_SETTINGS.find_shortcut,
    onctrlfind,
  }: {
    slug: string;
    load?: (slug: string) => Promise<string | null>;
    query?: string;
    findShortcut?: TriggerKey;
    onctrlfind?: () => void;
  } = $props();

  let iframe: HTMLIFrameElement | undefined;

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

  function onIframeLoad() {
    const win = iframe?.contentWindow;
    if (!win) return;
    win.onkeydown = (event: KeyboardEvent) => {
      if (
        event.ctrlKey !== findShortcut.ctrl ||
        event.altKey !== findShortcut.alt ||
        event.shiftKey !== findShortcut.shift ||
        event.metaKey ||
        event.key.toLowerCase() !== findShortcut.key.toLowerCase()
      )
        return;
      event.preventDefault();
      onctrlfind?.();
    };
  }

  // Re-render whenever the slug or query changes.
  $effect(() => {
    void render(slug, query);
  });
</script>

<!-- Isolated render surface: sandbox blocks top-level scripts; the render happens in render.ts. -->
<iframe
  bind:this={iframe}
  class="sheet-view"
  title={slug}
  srcdoc={html || message}
  sandbox="allow-same-origin"
  onload={onIframeLoad}
></iframe>

{#if message && !html}
  <p class="empty">{message}</p>
{/if}

<style>
  .sheet-view {
    width: 100%;
    height: 100%;
    display: block;
    border: 0;
    box-sizing: border-box;
  }
  .empty {
    padding: 1rem;
    opacity: 0.7;
  }
</style>
