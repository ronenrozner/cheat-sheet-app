// @vitest-environment node
// Task 7: combo normalizer unit tests.

import { describe, expect, it } from 'vitest';
import { normalizeCombo } from '../../src/lib/search/comboNormalize';

describe('normalizeCombo', () => {
  it('normalizes aliases and the + separator', () => {
    expect(normalizeCombo('Win+Alt+V')).toEqual(['WIN', 'ALT', 'V']);
  });

  it('normalizes the space separator and long aliases', () => {
    expect(normalizeCombo('Control Shift V')).toEqual(['CTRL', 'SHIFT', 'V']);
  });

  it('is case-insensitive', () => {
    expect(normalizeCombo('win+alt+v')).toEqual(['WIN', 'ALT', 'V']);
    expect(normalizeCombo('WIN+ALT+V')).toEqual(['WIN', 'ALT', 'V']);
    expect(normalizeCombo('WiN+aLt+v')).toEqual(['WIN', 'ALT', 'V']);
  });

  it('maps every documented alias', () => {
    expect(normalizeCombo('windows+option+⌃')).toEqual(['WIN', 'ALT', 'CTRL']);
    expect(normalizeCombo('super+alt+⇧')).toEqual(['WIN', 'ALT', 'SHIFT']);
    expect(normalizeCombo('mod+cmd+ctrl')).toEqual(['WIN', 'WIN', 'CTRL']);
  });

  it('preserves literal (non-alias) keys', () => {
    expect(normalizeCombo('Ctrl+Shift+X')).toEqual(['CTRL', 'SHIFT', 'X']);
    expect(normalizeCombo('A+B+C')).toEqual(['A', 'B', 'C']);
  });

  it('handles adjacent separators without emitting empty tokens', () => {
    expect(normalizeCombo('Win++Alt')).toEqual(['WIN', 'ALT']);
    expect(normalizeCombo('Win   Alt')).toEqual(['WIN', 'ALT']);
    expect(normalizeCombo(' Win+Alt ')).toEqual(['WIN', 'ALT']);
  });

  it('returns an empty array for empty or whitespace-only input', () => {
    expect(normalizeCombo('')).toEqual([]);
    expect(normalizeCombo('   ')).toEqual([]);
    expect(normalizeCombo('+')).toEqual([]);
  });
});
