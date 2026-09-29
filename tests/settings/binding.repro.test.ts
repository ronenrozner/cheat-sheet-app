// @vitest-environment jsdom
// Focused regression test for the settings controls.
//
// SettingsPanel receives `settings` as a bindable prop and updates it through explicit handlers.
// User edits must stay visible in the DOM after Svelte flushes updates.

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mount, unmount } from 'svelte';
import SettingsPanel from '../../src/components/SettingsPanel.svelte';
import { DEFAULT_SETTINGS, type Settings } from '../../src/lib/settings/types';

let root: HTMLElement;
let inst: ReturnType<typeof mount>;
let saved: Settings | null = null;

beforeEach(() => {
  saved = null;
  root = document.createElement('div');
  document.body.appendChild(root);
  inst = mount(SettingsPanel, {
    target: root,
    props: {
      settings: { ...DEFAULT_SETTINGS, trigger: { ...DEFAULT_SETTINGS.trigger, key: 'q' } },
      onSave: (s: Settings) => {
        saved = s;
      },
      sheetsBySlug: { vim: 'Vim', git: 'Git' },
    },
  });
});

afterEach(() => {
  unmount(inst);
  document.body.removeChild(root);
});

async function flush(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('SettingsPanel controls', () => {
  it('text input: typing updates the saved state and stays visible', async () => {
    const input = root.querySelector<HTMLInputElement>('input[type="text"]');
    expect(input).toBeTruthy();

    input!.value = '/usr/bin/code';
    input!.dispatchEvent(new Event('change', { bubbles: true }));
    await flush();

    expect(input!.value).toBe('/usr/bin/code');
    expect(saved?.editor_path).toBe('/usr/bin/code');
  });

  it('checkbox: clicking updates the saved state and stays visible', async () => {
    const cb = root.querySelector<HTMLInputElement>('input[type="checkbox"]');
    expect(cb).toBeTruthy();

    cb!.checked = true;
    cb!.dispatchEvent(new Event('change', { bubbles: true }));
    await flush();

    expect(cb!.checked).toBe(true);
    expect(saved?.show_tray).toBe('On');
  });

  it('select: selecting an option updates the saved state and stays visible', async () => {
    const select = root.querySelector<HTMLSelectElement>('select.ctrl');
    expect(select).toBeTruthy();

    select!.value = 'Dark';
    select!.dispatchEvent(new Event('change', { bubbles: true }));
    await flush();

    expect(select!.value).toBe('Dark');
    expect(saved?.theme).toBe('Dark');
  });
});
