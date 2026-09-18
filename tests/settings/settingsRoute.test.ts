// @vitest-environment jsdom
// Route-level smoke test for the SvelteKit `/settings` page.
//
// Guards the route split: settings UI is rendered by `src/routes/settings/+page.svelte`, not by
// `App.svelte` branching on the Tauri window label.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, unmount } from 'svelte';
import SettingsPage from '../../src/routes/settings/+page.svelte';
import { DEFAULT_SETTINGS } from '../../src/lib/settings/types';

const invoke = vi.fn();

vi.mock('@tauri-apps/api/core', () => ({ invoke: (...args: unknown[]) => invoke(...args) }));
vi.mock('@tauri-apps/api/window', () => ({
  getCurrentWindow: () => ({ startDragging: vi.fn(), hide: vi.fn() }),
}));
vi.mock('@tauri-apps/api/event', () => ({
  listen: async () => () => {},
  emit: async () => undefined,
}));

async function flush(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await Promise.resolve();
  await Promise.resolve();
}

describe('settings route', () => {
  let root: HTMLElement;
  let inst: ReturnType<typeof mount>;

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
          return { ...DEFAULT_SETTINGS, pinned_slug: 'git' };
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
  });

  afterEach(() => {
    unmount(inst);
    document.body.removeChild(root);
    vi.restoreAllMocks();
  });

  it('renders the settings UI and loads route data', async () => {
    inst = mount(SettingsPage, { target: root, props: {} });
    await flush();

    expect(root.querySelector('[role="dialog"]')?.getAttribute('aria-label')).toBe('SETTINGS');
    expect(root.querySelector('.overlay')).toBeNull();

    const pinnedSelect = root.querySelector<HTMLSelectElement>('select[aria-label="Pinned sheet"]');
    expect(pinnedSelect).toBeTruthy();
    expect(pinnedSelect!.value).toBe('git');

    const optionLabels = [...root.querySelectorAll('option')].map((option) => option.textContent);
    expect(optionLabels).toContain('Git');

    expect(invoke).toHaveBeenCalledWith('list_sheets', {});
    expect(invoke).toHaveBeenCalledWith('get_settings', {});
    expect(invoke).toHaveBeenCalledWith('get_hotkey_status', {});
    expect(invoke).toHaveBeenCalledWith('get_wayland_snippets', {});
  });
});
