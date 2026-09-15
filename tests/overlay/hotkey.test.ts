// @vitest-environment node
// Task 14: overlay hotkey status helper tests.

import { describe, expect, it } from 'vitest';
import { isHotkeyAvailable, isWayland, type HotkeyStatus } from '../../src/lib/overlay/hotkey';

describe('isHotkeyAvailable', () => {
  it('is false when status is null (no IPC response)', () => {
    expect(isHotkeyAvailable(null)).toBe(false);
  });

  it('reflects the backend-registered flag', () => {
    const s: HotkeyStatus = {
      platform: 'linux',
      linux_session: 'x11',
      hotkey_available: true,
      message: 'ok',
    };
    expect(isHotkeyAvailable(s)).toBe(true);
  });

  it('is false when the hotkey could not register', () => {
    const s: HotkeyStatus = {
      platform: 'linux',
      linux_session: 'wayland',
      hotkey_available: false,
      message: 'unavailable',
    };
    expect(isHotkeyAvailable(s)).toBe(false);
  });
});

describe('isWayland', () => {
  it('is false when status is null', () => {
    expect(isWayland(null)).toBe(false);
  });

  it('is true only when the Linux session is wayland', () => {
    expect(
      isWayland({
        platform: 'linux',
        linux_session: 'wayland',
        hotkey_available: false,
        message: '',
      })
    ).toBe(true);
    expect(
      isWayland({ platform: 'linux', linux_session: 'x11', hotkey_available: true, message: 'ok' })
    ).toBe(false);
    expect(
      isWayland({ platform: 'windows', linux_session: null, hotkey_available: true, message: 'ok' })
    ).toBe(false);
  });
});
