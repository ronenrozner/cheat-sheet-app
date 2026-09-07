// @vitest-environment jsdom
// Task 8: find-in-current-sheet unit tests.

import { describe, expect, it } from 'vitest';
import { findMatches, highlightMarkdown } from '../../src/lib/search/findInSheet';

const body = [
  '# Vim',
  'Quick reference for vim.',
  '',
  'Insert mode: `i` to enter insert mode.',
  'Save: `:w` to write. `:q` to quit.',
  '',
  'The word "vim" appears here too.',
].join('\n');

describe('findMatches', () => {
  it('returns offsets for every case-insensitive match', () => {
    const offsets = findMatches(body, 'vim');
    expect(offsets.length).toBeGreaterThan(1);
    // First match is the heading "# Vim" (capital V, case-insensitive).
    const first = offsets[0] ?? 0;
    const ch = body[first] ?? '';
    expect(ch.toLowerCase()).toBe('v');
    // Every offset actually contains "vim" (case-insensitive).
    for (const off of offsets) {
      expect(body.slice(off, off + 3).toLowerCase()).toBe('vim');
    }
  });

  it('matches literal query characters, not regex metacharacters', () => {
    // A literal dot in the body. A regex "." would match any char; our escape must not.
    const src = 'a.b and a.b';
    expect(findMatches(src, '.')).toEqual([1, 9]);
  });

  it('returns an empty array for empty or whitespace query', () => {
    expect(findMatches(body, '')).toEqual([]);
    expect(findMatches(body, '   ')).toEqual([]);
  });

  it('returns an empty array when there is no match', () => {
    expect(findMatches(body, 'emacs')).toEqual([]);
  });
});

describe('highlightMarkdown', () => {
  it('wraps each match with <mark>', () => {
    const out = highlightMarkdown(body, 'vim');
    expect((out.match(/<mark>/g) ?? []).length).toBeGreaterThan(0);
    expect((out.match(/<\/mark>/g) ?? []).length).toBeGreaterThan(0);
    // The query still appears once per mark (no leftover raw text outside marks).
    const inner = out.replace(/<mark>/g, '').replace(/<\/mark>/g, '');
    expect(inner).toBe(body);
  });

  it('returns the body unchanged for empty query', () => {
    expect(highlightMarkdown(body, '')).toBe(body);
    expect(highlightMarkdown(body, '   ')).toBe(body);
  });

  it('returns the body unchanged when there is no match', () => {
    expect(highlightMarkdown(body, 'emacs')).toBe(body);
  });
});
