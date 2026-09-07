// @vitest-environment node
// Task 10: overlay selection unit tests.

import { describe, expect, it } from 'vitest';
import {
  createSelection,
  selectSheet,
  firstSlug,
  type Selection,
} from '../../src/lib/overlay/selection';

describe('createSelection', () => {
  it('defaults to empty slug and empty slugs', () => {
    const s = createSelection();
    expect(s.slug).toBe('');
    expect(s.slugs).toEqual([]);
  });

  it('accepts an initial slug and slugs', () => {
    const s = createSelection('vim', ['vim', 'git']);
    expect(s.slug).toBe('vim');
    expect(s.slugs).toEqual(['vim', 'git']);
  });
});

describe('selectSheet', () => {
  const sel = createSelection('vim', ['vim', 'git', 'python']);

  it('switches to a valid slug', () => {
    const { selection, changed } = selectSheet(sel, 'git');
    expect(selection.slug).toBe('git');
    expect(changed).toBe(true);
  });

  it('ignores a slug that is not available', () => {
    const { selection, changed } = selectSheet(sel, 'emacs');
    expect(selection.slug).toBe('vim');
    expect(changed).toBe(false);
  });

  it('is a no-op when switching to the current slug', () => {
    const { selection, changed } = selectSheet(sel, 'vim');
    expect(selection.slug).toBe('vim');
    expect(changed).toBe(false);
  });

  it('does not mutate the original selection', () => {
    const { selection } = selectSheet(sel, 'python');
    expect(selection).not.toBe(sel);
    expect(sel.slug).toBe('vim');
  });
});

describe('firstSlug', () => {
  it('returns the first slug', () => {
    expect(firstSlug(createSelection('', ['a', 'b']))).toBe('a');
  });

  it('returns undefined when empty', () => {
    expect(firstSlug(createSelection('', []))).toBeUndefined();
  });
});
