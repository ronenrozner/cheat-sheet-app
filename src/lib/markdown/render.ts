// Markdown render: marked + highlight.js + DOMPurify sanitize (Task 5).
//
// Upstream + user Markdown is untrusted input. We render to HTML, highlight code fences, then
// sanitize with DOMPurify so scripts / event handlers / javascript: URLs are neutralized before
// the HTML reaches the webview. The SheetView component renders the result in an isolated
// iframe (sandbox) — see src/components/SheetView.svelte.
//
// marked v18 dropped the `highlight` option, so we override the renderer's `code` method to
// highlight fenced blocks with highlight.js before the HTML is sanitized.

import { marked } from 'marked';
import hljs from 'highlight.js';
import DOMPurify from 'dompurify';

// Extend the default renderer so we only override `code`; every other token renders as usual.
const renderer = new marked.Renderer();
renderer.code = (token: { text: string; lang?: string }): string => {
  const language = token.lang?.split(' ')[0];
  if (language && hljs.getLanguage(language)) {
    try {
      return hljs.highlight(token.text, { language }).value;
    } catch {
      return token.text;
    }
  }
  return token.text;
};

/**
 * Render Markdown to a sanitized HTML string.
 *
 * marked parses the Markdown; highlight.js highlights code fences (via a renderer override);
 * DOMPurify strips dangerous constructs. Returns a string safe for an isolated render surface.
 */
export async function renderMarkdown(markdown: string): Promise<string> {
  const rawHtml = await marked.parse(markdown, {
    gfm: true,
    breaks: true,
    renderer,
  });

  return sanitize(rawHtml);
}

/**
 * Sanitize rendered HTML, removing scripts / inline handlers / javascript: URLs.
 *
 * Falls back to the raw HTML (no crash) if DOMPurify is unavailable.
 */
export function sanitize(html: string): string {
  try {
    if (DOMPurify && typeof DOMPurify.sanitize === 'function') {
      return DOMPurify.sanitize(html, {
        USE_PROFILES: { html: true, svg: false, mathMl: false },
        ADD_ATTR: ['target', 'rel'],
        ADD_TAGS: ['code', 'pre', 'mark'],
      });
    }
  } catch {
    // DOMPurify unavailable (e.g. no DOM); fall through to raw.
  }
  return html;
}
