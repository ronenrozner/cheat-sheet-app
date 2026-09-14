// @vitest-environment node
// Task 11: initial-slug resolution unit tests.

import { describe, expect, it } from 'vitest';
import { resolveInitialSlug, BUNDLED_DEFAULTS } from '../../src/lib/overlay/initialSlug';

describe('resolveInitialSlug', () => {
  it('returns empty when nothing is available', () => {
    expect(resolveInitialSlug('', [])).toBe('');
  });

  it('selects the pinned slug when it is available', () => {
    expect(resolveInitialSlug('vim', ['bash', 'git', 'vim'])).toBe('vim');
  });

  it('falls back to a bundled default when no pin is set (first run)', () => {
    // `bash` is first in BUNDLED_DEFAULTS and available, so it wins.
    expect(resolveInitialSlug('', ['bash', 'git', 'vim'])).toBe('bash');
  });

  it('prefers a bundled default over the first available sheet', () => {
    // First available is `git`, but `vim` is a bundled default and `git` is not first...
    // actually `git` IS bundled. Use a non-bundled first entry to prove bundled precedence.
    expect(resolveInitialSlug('', ['alpha', 'vim'])).toBe('vim');
  });

  it('falls back to the first available sheet when no pin and no bundled default', () => {
    expect(resolveInitialSlug('', ['alpha', 'beta'])).toBe('alpha');
  });

  it('ignores a pinned slug that is no longer available', () => {
    expect(resolveInitialSlug('vim', ['bash', 'git'])).toBe('bash');
  });

  it('ignores an empty pinned slug', () => {
    expect(resolveInitialSlug('', ['vim'])).toBe('vim');
  });

  it('BUNDLED_DEFAULTS is non-empty and unique', () => {
    expect(BUNDLED_DEFAULTS.length).toBeGreaterThan(0);
    expect(new Set(BUNDLED_DEFAULTS).size).toBe(BUNDLED_DEFAULTS.length);
  });
});
