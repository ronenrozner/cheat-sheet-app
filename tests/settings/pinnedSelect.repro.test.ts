// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, unmount } from 'svelte';
import SettingsPanel from '../../src/components/SettingsPanel.svelte';
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

describe('SettingsPanel controls', () => {
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
        sheetsBySlug,
      },
    });
    await flush();

    const themeSelect = root.querySelectorAll<HTMLSelectElement>('select.ctrl')[0];
    expect(themeSelect).toBeTruthy();

    const darkOption = [...root.querySelectorAll<HTMLOptionElement>('option')].find(
      (option) => option.value === 'Dark'
    );
    expect(darkOption).toBeTruthy();

    darkOption!.click();
    themeSelect!.value = 'Dark';
    themeSelect!.dispatchEvent(new Event('change', { bubbles: true }));
    await flush();

    expect(saved.current?.theme).toBe('Dark');
  });

  it('window size inputs keep the previous positive value when cleared or set to zero', async () => {
    const saved: { current: Settings | null } = { current: null };
    inst = mount(SettingsPanel, {
      target: root,
      props: {
        settings: { ...fakeSettings, win_size: { width: 800, height: 900 } },
        onSave: (s: Settings) => {
          saved.current = s;
        },
        sheetsBySlug,
      },
    });
    await flush();

    const inputs = root.querySelectorAll<HTMLInputElement>('input[type="number"]');
    const widthInput = inputs[0];
    const heightInput = inputs[1];
    expect(widthInput).toBeTruthy();
    expect(heightInput).toBeTruthy();

    widthInput!.value = '0';
    widthInput!.dispatchEvent(new Event('change', { bubbles: true }));
    await flush();
    expect(saved.current?.win_size.width).toBe(800);

    heightInput!.value = '';
    heightInput!.dispatchEvent(new Event('change', { bubbles: true }));
    await flush();
    expect(saved.current?.win_size.height).toBe(900);
  });

  it('pinned select: saves the selected slug', async () => {
    const saved: { current: Settings | null } = { current: null };
    inst = mount(SettingsPanel, {
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

    const gitOption = [...root.querySelectorAll<HTMLOptionElement>('option')].find(
      (option) => option.value === 'git'
    );
    expect(gitOption).toBeTruthy();

    gitOption!.click();
    pinnedSelect!.value = 'git';
    pinnedSelect!.dispatchEvent(new Event('change', { bubbles: true }));
    await flush();

    expect(saved.current?.pinned_slug).toBe('git');
  });
});
