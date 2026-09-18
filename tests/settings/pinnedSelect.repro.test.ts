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

  it('theme select (control): real option click', async () => {
    let saved: Settings | null = null;
    inst = mount(SettingsPanel, {
      target: root,
      props: {
        settings: fakeSettings,
        onSave: (s: Settings) => {
          saved = s;
        },
        sheetsBySlug,
      },
    });
    await flush();

    const themeSelect = [...root.querySelectorAll('select.ctrl')][0] as HTMLSelectElement;
    // jsdom does not fire `change` on the parent select when an option is clicked, so set the
    // value and dispatch `change` to drive the handler, as a real browser would.
    const darkOption = [...root.querySelectorAll('option')].find((o) => o.value === 'Dark');
    darkOption!.click();
    themeSelect.value = 'Dark';
    themeSelect.dispatchEvent(new Event('change', { bubbles: true }));
    await flush();
    // eslint-disable-next-line no-console
    console.log('THEME: value=', themeSelect.value, 'saved theme=', saved?.theme);
    expect(saved?.theme).toBe('Dark');
  });

  it('pinned select: real option click', async () => {
    let saved: Settings | null = null;
    inst = mount(SettingsPanel, {
      target: root,
      props: {
        settings: fakeSettings,
        onSave: (s: Settings) => {
          saved = s;
        },
        sheetsBySlug,
      },
    });
    await flush();

    const pinnedSelect = root.querySelector('select[aria-label="Pinned sheet"]') as HTMLSelectElement;
    const gitOption = [...root.querySelectorAll('option')].find((o) => o.value === 'git');
    gitOption!.click();
    pinnedSelect.value = 'git';
    pinnedSelect.dispatchEvent(new Event('change', { bubbles: true }));
    await flush();
    // eslint-disable-next-line no-console
    console.log('PINNED: value=', pinnedSelect.value, 'saved pinned_slug=', saved?.pinned_slug);
    expect(saved?.pinned_slug).toBe('git');
  });
});
