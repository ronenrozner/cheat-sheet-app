// @vitest-environment node
// Task 19: settings window management tests.
//
// Guards the fix where `openSettings()` only called `show()` on an assumed-existing window, so
// the window never opened when the config-declared `settings` window was absent.

import { afterEach, describe, expect, it, vi } from 'vitest';

// Lift the mock + its state above the hoisted vi.mock() call so the factory can close over them.
const h = vi.hoisted(() => {
  let getByStub: (() => unknown) | undefined;
  let created: { label: string; options: Record<string, unknown> } | undefined;
  let createdCount = 0;
  const shown: string[] = [];
  const focused: string[] = [];
  const hidden: string[] = [];

  const WindowMock = vi.fn(function (label: string, options: Record<string, unknown>) {
    createdCount += 1;
    created = { label, options };
    return {
      label,
      show: async () => {
        shown.push(label);
      },
      setFocus: async () => {
        focused.push(label);
      },
      hide: async () => {
        hidden.push(label);
      },
    };
  });

  // Attach the static getByLabel method to the constructor for correct typing.
  (WindowMock as unknown as { getByLabel: ReturnType<typeof vi.fn> }).getByLabel = vi.fn(
    async () => (getByStub ? getByStub() : null)
  );

  return {
    WindowMock,
    get state() {
      return {
        getByStub: () => getByStub,
        created: () => created,
        createdCount: () => createdCount,
        shown,
        focused,
        hidden,
      };
    },
    setByStub: (fn: (() => unknown) | undefined) => {
      getByStub = fn;
    },
    reset: () => {
      created = undefined;
      createdCount = 0;
      shown.length = 0;
      focused.length = 0;
      hidden.length = 0;
      getByStub = undefined;
    },
  };
});

vi.mock('@tauri-apps/api/window', () => ({ Window: h.WindowMock }));

import {
  openSettings,
  isSettingsOpen,
  closeSettings,
  SETTINGS_WINDOW_LABEL,
} from '../../src/lib/settingsWindow';

const st = () => h.state;

afterEach(() => {
  h.reset();
});

function makeWindowStub(label: string) {
  return {
    label,
    show: async () => {
      st().shown.push(label);
    },
    setFocus: async () => {
      st().focused.push(label);
    },
    hide: async () => {
      st().hidden.push(label);
    },
  };
}

describe('openSettings', () => {
  it('creates the window when getByLabel returns null, then shows and focuses it', async () => {
    const ok = await openSettings();
    const s = st();

    expect(ok).toBe(true);
    expect(s.createdCount()).toBe(1);
    expect(s.created()).toEqual({
      label: SETTINGS_WINDOW_LABEL,
      options: { title: 'Settings', width: 720, height: 640 },
    });
    expect(s.shown).toEqual([SETTINGS_WINDOW_LABEL]);
    expect(s.focused).toEqual([SETTINGS_WINDOW_LABEL]);
  });

  it('does not create a window when one already exists', async () => {
    h.setByStub(() => makeWindowStub(SETTINGS_WINDOW_LABEL));

    const ok = await openSettings();
    const s = st();

    expect(ok).toBe(true);
    expect(s.createdCount()).toBe(0);
    expect(s.shown).toEqual([SETTINGS_WINDOW_LABEL]);
    expect(s.focused).toEqual([SETTINGS_WINDOW_LABEL]);
  });
});

describe('isSettingsOpen', () => {
  it('returns false when the window does not exist', async () => {
    h.setByStub(() => null);
    expect(await isSettingsOpen()).toBe(false);
  });

  it('returns true when the window exists', async () => {
    h.setByStub(() => makeWindowStub(SETTINGS_WINDOW_LABEL));
    expect(await isSettingsOpen()).toBe(true);
  });
});

describe('closeSettings', () => {
  it('hides the window when it exists', async () => {
    h.setByStub(() => makeWindowStub(SETTINGS_WINDOW_LABEL));

    await closeSettings();

    expect(st().hidden).toEqual([SETTINGS_WINDOW_LABEL]);
  });

  it('does nothing when the window does not exist', async () => {
    h.setByStub(() => null);
    await expect(closeSettings()).resolves.toBeUndefined();
    expect(st().hidden).toEqual([]);
  });
});
