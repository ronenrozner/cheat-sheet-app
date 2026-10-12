// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, unmount } from 'svelte';
import SettingsPanel from '../../src/components/SettingsPanel.svelte';
import SheetsTab from '../../src/components/SheetsTab.svelte';
import { DEFAULT_SETTINGS, type Settings } from '../../src/lib/settings/types';

let fakeSettings: Settings;
let sheetsBySlug: Record<string, string>;

beforeEach(() => {
  fakeSettings = { ...DEFAULT_SETTINGS, pinned_slug: 'vim' };
  sheetsBySlug = { vim: 'Vim', git: 'Git' };
});

afterEach(() => {
  vi.restoreAllMocks();
});

async function flush(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('settings tabs controls', () => {
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

  it('theme select: saves the selected option', async () => {
    const saved: { current: Settings | null } = { current: null };
    inst = mount(SettingsPanel, {
      target: root,
      props: {
        settings: fakeSettings,
        onSave: (s: Settings) => {
          saved.current = s;
        },
      },
    });
    await flush();

    const themeSelect = root.querySelectorAll<HTMLSelectElement>('select.ctrl')[0];
    expect(themeSelect).toBeTruthy();

    themeSelect!.value = 'Dark';
    themeSelect!.dispatchEvent(new Event('change', { bubbles: true }));
    await flush();

    expect(saved.current?.theme).toBe('Dark');
  });

  it('window geometry toggle saves without editing stored geometry values', async () => {
    const saved: { current: Settings | null } = { current: null };
    inst = mount(SettingsPanel, {
      target: root,
      props: {
        settings: { ...fakeSettings, win_size: { width: 800, height: 900 } },
        onSave: (s: Settings) => {
          saved.current = s;
        },
      },
    });
    await flush();

    expect(root.querySelector<HTMLInputElement>('input[aria-label="width"]')).toBeNull();
    expect(root.querySelector<HTMLInputElement>('input[aria-label="height"]')).toBeNull();

    const toggle = root.querySelector<HTMLInputElement>(
      'input[aria-label="Save window size and position"]'
    );
    expect(toggle).toBeTruthy();

    toggle!.checked = true;
    toggle!.dispatchEvent(new Event('change', { bubbles: true }));
    await flush();

    expect(saved.current?.save_window_geometry).toBe('On');
    expect(saved.current?.win_size).toEqual({ width: 800, height: 900 });
  });

  it('pinned select: saves the selected slug', async () => {
    const saved: { current: Settings | null } = { current: null };
    inst = mount(SheetsTab, {
      target: root,
      props: {
        settings: fakeSettings,
        onSave: (s: Settings) => {
          saved.current = s;
        },
        sheetsBySlug,
      },
    });
    await flush();

    const pinnedSelect = root.querySelector<HTMLSelectElement>('select[aria-label="Pinned sheet"]');
    expect(pinnedSelect).toBeTruthy();

    pinnedSelect!.value = 'git';
    pinnedSelect!.dispatchEvent(new Event('change', { bubbles: true }));
    await flush();

    expect(saved.current?.pinned_slug).toBe('git');
  });
});
