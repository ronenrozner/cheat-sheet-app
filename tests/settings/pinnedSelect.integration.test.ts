// @vitest-environment jsdom
// Integration test: pinned-sheet dropdown change persists to the backend (Task 11/12).
//
// Mounts the SvelteKit `/settings` page, which renders SettingsWindow → SettingsPanel. The
// dropdown options come from `list_sheets` (mocked with titles). Selecting an option must call
// `set_settings` with the new pinned_slug.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, unmount } from 'svelte';
import SettingsPage from '../../src/routes/settings/+page.svelte';

const invoke = vi.fn();
vi.mock('@tauri-apps/api/core', () => ({ invoke: (...args: unknown[]) => invoke(...args) }));

// Settings window.
vi.mock('@tauri-apps/api/window', () => ({
  getCurrentWindow: () => ({ startDragging: vi.fn(), hide: vi.fn() }),
}));

vi.mock('@tauri-apps/api/event', () => ({
  listen: async () => () => {},
  emit: async () => undefined,
}));

let fakeSettings: Record<string, unknown>;

beforeEach(() => {
  vi.mocked(invoke).mockReset();
  invoke.mockImplementation(async (cmd: string) => {
    switch (cmd) {
      case 'list_sheets':
        return [
          { slug: 'vim', title: 'Vim' },
          { slug: 'git', title: 'Git' },
        ];
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

  it('calls always-on-top command with camelCase args when toggled', async () => {
    fakeSettings = { always_on_top: true };
    inst = mount(SettingsPage, { target: root, props: {} });
    await flush();

    const alwaysOnTopLabel = [...root.querySelectorAll<HTMLLabelElement>('label.row')].find(
      (label) => label.textContent?.includes('Always on top')
    );
    expect(alwaysOnTopLabel).toBeTruthy();
    const checkbox = alwaysOnTopLabel!.querySelector<HTMLInputElement>('input[type="checkbox"]');
    expect(checkbox).toBeTruthy();

    checkbox!.checked = false;
    checkbox!.dispatchEvent(new Event('change', { bubbles: true }));
    await flush();

    expect(invoke).toHaveBeenCalledWith('set_always_on_top', { alwaysOnTop: false });
  });

  it('persists the chosen pinned slug when an option is selected', async () => {
    inst = mount(SettingsPage, { target: root, props: {} });
    await flush();

    const select = root.querySelector<HTMLSelectElement>('select[aria-label="Pinned sheet"]');
    expect(select).toBeTruthy();

    const gitOption = [...root.querySelectorAll<HTMLOptionElement>('option')].find(
      (option) => option.value === 'git'
    );
    expect(gitOption).toBeTruthy();

    gitOption!.click();
    select!.value = 'git';
    select!.dispatchEvent(new Event('change', { bubbles: true }));
    await flush();

    const setSettings = invoke.mock.calls.find((call) => call[0] === 'set_settings');
    expect(setSettings).toBeTruthy();
    expect((setSettings![1] as { settings: { pinned_slug: string } }).settings.pinned_slug).toBe(
      'git'
    );
  });
});
