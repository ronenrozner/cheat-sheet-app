// @vitest-environment jsdom
// Full-app regression test for settings controls in the settings window.
//
// This tests the parent -> child -> binding data flow as it runs in the app. User edits must stay
// visible after Svelte flushes updates.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, unmount } from 'svelte';
import App from '../../src/App.svelte';

const invoke = vi.fn();
vi.mock('@tauri-apps/api/core', () => ({ invoke: (...args: unknown[]) => invoke(...args) }));
vi.mock('@tauri-apps/api/window', () => ({
  getCurrentWindow: () => ({ label: 'settings', startDragging: vi.fn(), hide: vi.fn() }),
}));
vi.mock('@tauri-apps/api/event', () => ({
  listen: async () => () => {},
  emit: async () => undefined,
}));

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
        return { pinned_slug: '' };
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

describe('Full App: settings controls', () => {
  let root: HTMLElement;
  let inst: ReturnType<typeof mount>;

  beforeEach(async () => {
    root = document.createElement('div');
    document.body.appendChild(root);
    inst = mount(App, { target: root, props: {} });
    await flush();
  });

  afterEach(() => {
    unmount(inst);
    document.body.removeChild(root);
  });

  it('text input: typed value persists', async () => {
    const input = root.querySelector<HTMLInputElement>('input[type="text"]');
    expect(input).toBeTruthy();

    input!.value = 'hello';
    input!.dispatchEvent(new Event('input', { bubbles: true }));
    input!.dispatchEvent(new Event('change', { bubbles: true }));
    await flush();

    expect(input!.value).toBe('hello');
  });

  it('checkbox: checked persists', async () => {
    const cb = root.querySelector<HTMLInputElement>('input[type="checkbox"]');
    expect(cb).toBeTruthy();

    cb!.checked = true;
    cb!.dispatchEvent(new Event('change', { bubbles: true }));
    await flush();

    expect(cb!.checked).toBe(true);
  });

  it('select: selected value persists', async () => {
    const select = root.querySelector<HTMLSelectElement>('select.ctrl');
    expect(select).toBeTruthy();

    select!.value = 'Dark';
    select!.dispatchEvent(new Event('change', { bubbles: true }));
    await flush();

    expect(select!.value).toBe('Dark');
  });
});
