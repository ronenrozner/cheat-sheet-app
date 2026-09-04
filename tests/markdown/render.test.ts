// @vitest-environment jsdom
// Markdown render tests (Task 5). Runs in jsdom so DOMPurify has a DOM to sanitize against.

import { describe, it, expect } from 'vitest';
import { renderMarkdown, sanitize } from '../../src/lib/markdown/render';

describe('renderMarkdown', () => {
  it('renders headings and paragraphs', async () => {
    const html = await renderMarkdown('# Title\n\nHello world.');
    expect(html).toContain('<h1');
    expect(html).toContain('Hello world.');
  });

  it('renders code fences with a class (highlight.js)', async () => {
    const html = await renderMarkdown('```js\nconst x = 1;\n```');
    expect(html).toContain('hljs');
  });

  it('renders inline code', async () => {
    const html = await renderMarkdown('use `Ctrl+Shift+V` to paste.');
    expect(html).toContain('<code');
  });

  it('neutralizes a script tag (XSS)', async () => {
    const html = await renderMarkdown('<script>alert(1)</script>');
    expect(html).not.toContain('<script>alert(1)</script>');
  });

  it('neutralizes an onerror handler (XSS)', async () => {
    const html = await renderMarkdown('<img src=x onerror="alert(1)">');
    expect(html).not.toContain('onerror');
  });

  it('neutralizes a javascript: URL (XSS)', async () => {
    const html = await renderMarkdown('[x](javascript:alert(1))');
    expect(html).not.toContain('javascript:');
  });
});

describe('sanitize', () => {
  it('strips inline scripts from raw HTML', () => {
    const html = sanitize('<b>ok</b><script>evil()</script>');
    expect(html).toContain('<b>ok</b>');
    expect(html).not.toContain('evil()');
  });

  it('is a no-op on safe HTML', () => {
    const html = sanitize('<p>plain</p>');
    expect(html).toContain('<p>plain</p>');
  });
});
