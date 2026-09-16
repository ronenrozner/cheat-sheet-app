// @vitest-environment jsdom
// App overlay component test (regression guard for the sheet-switch bug).
//
// Reproduces the bug where selecting a different sheet did not refresh the view below the list:
// the Sidebar emits a *string* slug, but App's `onSelect` destructured `{ slug }` from it, so
// `selection.slug` never changed. This test mounts App, clicks a second sheet, and asserts the
// SheetView iframe body updates to the new sheet.
//
// Also guards Task 11: on mount, no pin + a bundled default list resolves to the bundled default
// (git), not the first-in-list sheet (vim).

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, unmount } from 'svelte';
import App from '../../src/App.svelte';

// Mock the Tauri IPC layer so the default loader and `loadSheets` don't hit the real backend.
const invoke = vi.fn();
vi.mock('@tauri-apps/api/core', () => ({ invoke: (...args: unknown[]) => invoke(...args) }));

// Mock the Tauri window layer so `getCurrentWindow()` doesn't read the real `__TAURI_INTERNALS__`
// global (absent in the jsdom test environment). Default label is `main` (the overlay), so the
// component renders the overlay shell, not the settings window.
vi.mock('@tauri-apps/api/window', () => ({
  getCurrentWindow: () => ({ label: 'main' }),
}));

// Mock the Tauri event layer so the live-sync effect (`listen('settings-changed', ...)`) doesn't
// hit the real backend. `listen` returns a no-op unlisten.
vi.mock('@tauri-apps/api/event', () => ({
  listen: async () => () => {},
}));

// Fake loader keyed by slug. Swapped per test via the `load` prop.
let fakeLoad: (slug: string) => Promise<string | null>;

// Settings returned by `get_settings`. Swapped per test.
let fakeSettings: Record<string, unknown>;

beforeEach(() => {
  vi.mocked(invoke).mockReset();
  fakeLoad = async (slug: string) => {
    const bodies: Record<string, string> = {
      vim: '# Vim\n\nSome vim text.',
      git: '# Git\n\nSome git text.',
    };
    return bodies[slug] ?? null;
  };
  // Default list_sheets response.
  invoke.mockImplementation(async (cmd: string, args: unknown) => {
    switch (cmd) {
      case 'list_sheets':
        return [{ slug: 'vim' }, { slug: 'git' }];
      case 'get_settings':
        return fakeSettings;
      case 'set_settings':
        return undefined;
      default:
        return undefined;
    }
  });
  // No pin: first run.
  fakeSettings = { pinned_slug: '' };
});

afterEach(() => {
  vi.restoreAllMocks();
});

// Flush pending microtasks (effects, awaited loaders) with a macrotask so the full
// async chain settles: loadSheets resolves -> selection.slug updates -> refreshBody runs
// -> load resolves -> body updates.
async function flush(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await Promise.resolve();
  await Promise.resolve();
}

describe('App sheet switching', () => {
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

  it('renders a bundled default on mount (Task 11: bundled default beats first-in-list)', async () => {
    inst = mount(App, {
      target: root,
      props: { load: fakeLoad },
    });

    await flush();

    // No pin. `git` is a bundled default and beats `vim` (first in the list) on open.
    const iframe = root.querySelector('iframe.sheet-view') as HTMLIFrameElement;
    expect(iframe.srcdoc).toContain('Git');
  });

  it('refreshes the view when a different sheet is selected', async () => {
    inst = mount(App, {
      target: root,
      props: { load: fakeLoad },
    });

    await flush();

    // Click the second sidebar item (Git).
    const gitBtn = root.querySelectorAll('button.sheet-item')[1];
    expect(gitBtn).toBeTruthy();
    (gitBtn as HTMLElement).click();

    await flush();

    const iframe = root.querySelector('iframe.sheet-view') as HTMLIFrameElement;
    expect(iframe.srcdoc).toContain('Git');
    expect(iframe.srcdoc).not.toContain('Vim');
  });

  it('pins the current sheet on click (Task 11)', async () => {
    fakeSettings = { pinned_slug: '' };
    inst = mount(App, {
      target: root,
      props: { load: fakeLoad },
    });

    await flush();

    // No pin: mount resolves to the bundled default `git`.
    const pinBtn = root.querySelector('button.pin') as HTMLButtonElement;
    expect(pinBtn).toBeTruthy();
    expect(pinBtn.textContent).toBe('Pin this sheet');

    pinBtn.click();
    await flush();

    // set_settings was called with the pinned slug, and the button flips to "Unpin".
    const setSettings = invoke.mock.calls.find((c) => c[0] === 'set_settings');
    expect(setSettings).toBeTruthy();
    expect((setSettings![1] as { settings: { pinned_slug: string } }).settings.pinned_slug).toBe(
      'git'
    );
    expect(pinBtn.textContent).toBe('Unpin this sheet');
    expect(pinBtn.getAttribute('aria-pressed')).toBe('true');
  });
});
