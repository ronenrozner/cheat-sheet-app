// @vitest-environment jsdom
// Regression test for the settings controls bug (dropdowns/selects/checkboxes/text inputs do
// not register changes). Root cause: the window drag handler called `startDragging()` on EVERY
// mousedown. On a Tauri window with `decorations: false`, a native drag starts on mousedown.
// That (a) swallows the following click so checkboxes/selects never toggle, and (b) steals focus
// from a focused text input, so Svelte's `bind:value` resets it to the stored value on blur.
//
// The drag guard must skip any mousedown that starts on a form control or a label that wraps one.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, unmount } from 'svelte';
import SettingsWindow from '../../src/components/SettingsWindow.svelte';
import { DEFAULT_SETTINGS, type Settings } from '../../src/lib/settings/types';

const startDragging = vi.fn();
const hide = vi.fn();
vi.mock('@tauri-apps/api/window', () => ({
  getCurrentWindow: () => ({ label: 'settings', startDragging, hide }),
}));
vi.mock('@tauri-apps/api/event', () => ({
  listen: async () => () => {},
  emit: async () => undefined,
}));

let fakeSettings: Settings;

beforeEach(() => {
  fakeSettings = { ...DEFAULT_SETTINGS, pinned_slug: '' };
  startDragging.mockReset();
  hide.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

function mountWindow(): { root: HTMLElement; inst: ReturnType<typeof mount> } {
  const root = document.createElement('div');
  document.body.appendChild(root);
  let saved: Settings | null = null;
  const inst = mount(SettingsWindow, {
    target: root,
    props: {
      settings: fakeSettings,
      onSave: (s: Settings) => {
        saved = s;
      },
      sheetsBySlug: { vim: 'Vim', git: 'Git' },
    },
  });
  return { root, inst };
}

describe('SettingsWindow drag guard', () => {
  let root: HTMLElement;
  let inst: ReturnType<typeof mount>;

  beforeEach(async () => {
    ({ root, inst } = mountWindow());
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  afterEach(() => {
    unmount(inst);
    document.body.removeChild(root);
  });

  it('does NOT start a window drag on mousedown over a checkbox', () => {
    const cb = root.querySelector<HTMLInputElement>('input[type="checkbox"]');
    expect(cb).toBeTruthy();
    cb!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(startDragging).not.toHaveBeenCalled();
  });

  it('does NOT start a window drag on mousedown over a select', () => {
    const select = root.querySelector<HTMLSelectElement>('select[aria-label="Pinned sheet"]');
    expect(select).toBeTruthy();
    select!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(startDragging).not.toHaveBeenCalled();
  });

  it('does NOT start a window drag on mousedown over a text input', () => {
    const input = root.querySelector<HTMLInputElement>('input[type="text"]');
    expect(input).toBeTruthy();
    input!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(startDragging).not.toHaveBeenCalled();
  });

  it('does NOT start a window drag on mousedown over the label of a control', () => {
    const label = root.querySelector<HTMLLabelElement>('label');
    expect(label).toBeTruthy();
    label!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(startDragging).not.toHaveBeenCalled();
  });

  it('still starts a drag on mousedown over the title bar', () => {
    const title = root.querySelector<HTMLSpanElement>('.titlebar .title');
    expect(title).toBeTruthy();
    title!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(startDragging).toHaveBeenCalledTimes(1);
  });
});
