// @vitest-environment node
// Task 13: i18n layer unit tests.

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getLocale, setLocale, t } from '../../src/lib/i18n';

beforeEach(() => {
  // Reset to en-US between tests so order doesn't matter.
  setLocale('en-US');
});

afterEach(() => {
  setLocale('en-US');
});

describe('t resolution', () => {
  it('resolves a known top-level key', () => {
    expect(t('app.title')).toBe('CheatSheet');
  });

  it('resolves a nested key', () => {
    expect(t('sheet.notFound')).toBe('Sheet "{{slug}}" not found.');
  });

  it('interpolates {{name}} placeholders', () => {
    expect(t('sheet.notFound', { slug: 'vim' })).toBe('Sheet "vim" not found.');
  });

  it('interpolates numeric values', () => {
    expect(t('settings.windowSize', { width: 800 })).toBe('Window size');
  });

  it('leaves an unknown placeholder untouched', () => {
    expect(t('sheet.notFound', { missing: 'x' })).toBe('Sheet "{{slug}}" not found.');
  });

  it('returns the key itself when the key is missing', () => {
    expect(t('does.not.exist')).toBe('does.not.exist');
  });

  it('resolves European Spanish strings', () => {
    expect(setLocale('es-ES')).toBe(true);
    expect(t('settings.language')).toBe('Idioma');
    expect(t('settings.optionEsEs')).toBe('Espanol');
  });

  it('returns the key when the value is empty', () => {
    // No such key -> key fallback.
    expect(t('')).toBe('');
  });
});

describe('setLocale', () => {
  it('returns the current locale unchanged (no-op when equal)', () => {
    expect(setLocale('en-US')).toBe(false);
    expect(getLocale()).toBe('en-US');
  });

  it('no-ops on an unsupported locale (stays en-US, no crash)', () => {
    expect(setLocale('fr-FR')).toBe(false);
    expect(getLocale()).toBe('en-US');
  });
});
