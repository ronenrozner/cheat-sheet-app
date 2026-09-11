// @vitest-environment jsdom
// App overlay component test (regression guard for the sheet-switch bug).
//
// Reproduces the bug where selecting a different sheet did not refresh the view below the list:
// the Sidebar emits a *string* slug, but App's `onSelect` destructured `{ slug }` from it, so
// `selection.slug` never changed. This test mounts App, clicks a second sheet, and asserts the
// SheetView iframe body updates to the new sheet.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, unmount } from 'svelte';
import App from '../../src/App.svelte';

// Mock the Tauri IPC layer so the default loader and `loadSheets` don't hit the real backend.
const invoke = vi.fn();
vi.mock('@tauri-apps/api/core', () => ({ invoke: (...args: unknown[]) => invoke(...args) }));

// Fake loader keyed by slug. Swapped per test via the `load` prop.
let fakeLoad: (slug: string) => Promise<string | null>;

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
  invoke.mockResolvedValue([{ slug: 'vim' }, { slug: 'git' }]);
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

  it('renders the first sheet on mount', async () => {
    inst = mount(App, {
      target: root,
      props: { load: fakeLoad },
    });

    await flush();

    const iframe = root.querySelector('iframe.sheet-view') as HTMLIFrameElement;
    expect(iframe.srcdoc).toContain('Vim');
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
    gitBtn.click();

    await flush();

    const iframe = root.querySelector('iframe.sheet-view') as HTMLIFrameElement;
    expect(iframe.srcdoc).toContain('Git');
    expect(iframe.srcdoc).not.toContain('Vim');
  });
});
