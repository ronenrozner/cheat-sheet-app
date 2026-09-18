// @vitest-environment jsdom
// Regression test: settings edits must stay visible even when the backend store fails.
// The settings window also receives its own `settings-changed` event. It must use the event
// payload, not reload the old persisted snapshot and reset the controls.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, unmount } from 'svelte';
import SettingsPage from '../../src/routes/settings/+page.svelte';
import { DEFAULT_SETTINGS, type Settings } from '../../src/lib/settings/types';

type Listener = (event: { payload: Settings }) => void | Promise<void>;

const h = vi.hoisted(() => {
  const invoke = vi.fn();
  const listeners: Listener[] = [];
  return {
    invoke,
    listeners,
    reset: () => {
      invoke.mockReset();
      listeners.length = 0;
    },
  };
});

vi.mock('@tauri-apps/api/core', () => ({ invoke: (...args: unknown[]) => h.invoke(...args) }));
vi.mock('@tauri-apps/api/window', () => ({
  getCurrentWindow: () => ({ startDragging: vi.fn(), hide: vi.fn() }),
}));
vi.mock('@tauri-apps/api/event', () => ({
  listen: async (_event: string, callback: Listener) => {
    h.listeners.push(callback);
    return () => {};
  },
  emit: async (_event: string, payload: Settings) => {
    await Promise.all(h.listeners.map((callback) => callback({ payload })));
  },
}));

async function flush(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await Promise.resolve();
  await Promise.resolve();
}

describe('settings persistence fallback', () => {
  let root: HTMLElement;
  let inst: ReturnType<typeof mount>;

  beforeEach(async () => {
    h.reset();
    h.invoke.mockImplementation(async (cmd: string) => {
      switch (cmd) {
        case 'list_sheets':
          return [{ slug: 'vim', title: 'Vim' }];
        case 'get_settings':
          return { ...DEFAULT_SETTINGS, theme: 'Follow' };
        case 'set_settings':
          throw new Error('store unavailable');
        case 'get_hotkey_status':
          return { wayland: false };
        case 'get_wayland_snippets':
          return { hyprland: '', sway: '', gnome: '' };
        default:
          return undefined;
      }
    });

    root = document.createElement('div');
    document.body.appendChild(root);
    inst = mount(SettingsPage, { target: root, props: {} });
    await flush();
  });

  afterEach(() => {
    unmount(inst);
    document.body.removeChild(root);
    vi.restoreAllMocks();
  });

  it('keeps a changed select value visible when saving fails', async () => {
    const themeSelect = root.querySelector<HTMLSelectElement>('select.ctrl');
    expect(themeSelect).toBeTruthy();

    themeSelect!.value = 'Dark';
    themeSelect!.dispatchEvent(new Event('change', { bubbles: true }));
    await flush();

    expect(themeSelect!.value).toBe('Dark');
  });
});
