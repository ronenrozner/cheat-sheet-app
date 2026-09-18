// @vitest-environment jsdom
// Integration test: pinned-sheet dropdown change persists to the backend (Task 11/12).
//
// Mounts App.svelte in settings-window mode (getCurrentWindow().label === 'settings'), so it
// renders SettingsWindow → SettingsPanel. The dropdown options come from `list_sheets` (mocked
// with titles). Selecting an option must call `set_settings` with the new pinned_slug.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, unmount } from 'svelte';
import App from '../../src/App.svelte';

const invoke = vi.fn();
vi.mock('@tauri-apps/api/core', () => ({ invoke: (...args: unknown[]) => invoke(...args) }));

// Settings window.
vi.mock('@tauri-apps/api/window', () => ({
  getCurrentWindow: () => ({ label: 'settings' }),
}));

vi.mock('@tauri-apps/api/event', () => ({
  listen: async () => () => {},
  emit: async () => undefined,
}));

let fakeSettings: Record<string, unknown>;

beforeEach(() => {
  vi.mocked(invoke).mockReset();
  invoke.mockImplementation(async (cmd: string, args: unknown) => {
    switch (cmd) {
      case 'list_sheets':
        return [{ slug: 'vim', title: 'Vim' }, { slug: 'git', title: 'Git' }];
      case 'get_settings':
        return fakeSettings;
      case 'set_settings':
        return undefined;
      case 'get_hotkey_status':
        return { wayland: false };
      case 'get_wayland_snippets':
        return { hyprland: '', sway: '', gnome: '' };
      default:
        return undefined;
    }
  });
  fakeSettings = { pinned_slug: '' };
});

afterEach(() => {
  vi.restoreAllMocks();
});

async function flush(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await Promise.resolve();
  await Promise.resolve();
}

describe('Settings window: pinned-sheet dropdown', () => {
  let root: HTMLElement;
  let inst: ReturnType<typeof mount>;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  afterEach(() => {
    unmount(inst);
    document.body.removeChild(root);
  });

  it('persists the chosen pinned slug when an option is selected', async () => {
    inst = mount(App, { target: root, props: {} });
    await flush();

    // eslint-disable-next-line no-console
    console.log('OPTIONS:', [...root.querySelectorAll('select[aria-label="Pinned sheet"] option')].map((o) => o.value));

    const select = root.querySelector('select[aria-label="Pinned sheet"]') as HTMLSelectElement;
    expect(select).toBeTruthy();

    const gitOption = [...root.querySelectorAll('option')].find((o) => o.value === 'git');
    expect(gitOption).toBeTruthy();
    gitOption!.click();
    await flush();

    // Directly fire change on the select (isolate whether the handler is wired).
    const gitSelect = root.querySelector('select[aria-label="Pinned sheet"]') as HTMLSelectElement;
    gitSelect.value = 'git';
    gitSelect.dispatchEvent(new Event('change', { bubbles: true }));
    await flush();

    const setSettings = invoke.mock.calls.find((c) => c[0] === 'set_settings');
    // eslint-disable-next-line no-console
    console.log('SET_SETTINGS CALLS:', JSON.stringify(invoke.mock.calls.filter((c) => c[0] === 'set_settings').map((c) => c[1])));
    expect(setSettings).toBeTruthy();
    expect((setSettings![1] as { settings: { pinned_slug: string } }).settings.pinned_slug).toBe('git');
  });
});
