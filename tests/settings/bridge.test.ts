// @vitest-environment node
// Task 12: settings bridge unit tests.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { coerceSettings, getSettings, setSettings } from '../../src/lib/settings/bridge';
import { DEFAULT_SETTINGS, type Settings } from '../../src/lib/settings/types';

const invoke = vi.fn();
vi.mock('@tauri-apps/api/core', () => ({ invoke: (...args: unknown[]) => invoke(...args) }));

afterEach(() => {
  invoke.mockReset();
});

describe('coerceSettings', () => {
  it('returns defaults for non-object input', () => {
    expect(coerceSettings(undefined)).toEqual(DEFAULT_SETTINGS);
    expect(coerceSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(coerceSettings([1, 2])).toEqual(DEFAULT_SETTINGS);
  });

  it('fills missing fields with defaults', () => {
    const out = coerceSettings({ theme: 'Dark' });
    expect(out.theme).toBe('Dark');
    expect(out.trigger).toEqual(DEFAULT_SETTINGS.trigger);
    expect(out.pinned_slug).toBe('');
  });

  it('replaces a bad trigger with the default trigger', () => {
    const out = coerceSettings({ trigger: { ctrl: 'yes' } } as never);
    expect(out.trigger).toEqual(DEFAULT_SETTINGS.trigger);
  });

  it('replaces a bad win_size with the default win_size', () => {
    const out = coerceSettings({ win_size: { width: 'big' } as never });
    expect(out.win_size).toEqual(DEFAULT_SETTINGS.win_size);
  });
});

describe('getSettings', () => {
  it('returns defaults when the backend errors', async () => {
    invoke.mockRejectedValue(new Error('store unavailable'));
    const s = await getSettings();
    expect(s).toEqual(DEFAULT_SETTINGS);
  });

  it('coerces a partial backend response', async () => {
    invoke.mockResolvedValue({ theme: 'Dark' });
    const s = await getSettings();
    expect(s.theme).toBe('Dark');
    expect(s.trigger).toEqual(DEFAULT_SETTINGS.trigger);
  });
});

describe('setSettings', () => {
  it('persists a well-formed snapshot and returns true', async () => {
    invoke.mockResolvedValue(undefined);
    const result = await setSettings({ ...DEFAULT_SETTINGS, theme: 'Dark' });
    expect(result).toBe(true);
    expect(invoke).toHaveBeenCalledWith('set_settings', {
      settings: { ...DEFAULT_SETTINGS, theme: 'Dark' },
    });
  });

  it('rejects a malformed snapshot without calling the backend', async () => {
    const result = await setSettings({
      ...DEFAULT_SETTINGS,
      theme: 'NotATheme',
    } as unknown as Settings);
    expect(result).toBe(false);
    expect(invoke).not.toHaveBeenCalled();
  });

  it('returns false when the backend errors', async () => {
    invoke.mockRejectedValue(new Error('store unavailable'));
    const result = await setSettings({ ...DEFAULT_SETTINGS });
    expect(result).toBe(false);
  });
});
