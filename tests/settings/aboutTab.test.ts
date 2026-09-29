// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, unmount } from 'svelte';
import AboutTab from '../../src/components/AboutTab.svelte';

const invoke = vi.fn();
vi.mock('@tauri-apps/api/core', () => ({
  invoke: (command: string, args: unknown) => {
    invoke(command, args);
    return Promise.resolve();
  },
}));

async function flush(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe('AboutTab', () => {
  let root: HTMLElement;
  let inst: ReturnType<typeof mount>;

  beforeEach(() => {
    invoke.mockReset();
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  afterEach(() => {
    unmount(inst);
    document.body.removeChild(root);
  });

  it('shows icon, name, version, empty links, build info, and license', async () => {
    inst = mount(AboutTab, { target: root, props: { version: '2026.9.29' } });
    await flush();

    expect(root.querySelector('.app-icon')).toBeTruthy();
    expect(root.textContent).toContain('CheatSheet');
    expect(root.textContent).toContain('Version 2026.9.29');
    expect(root.textContent).toContain('Built with');
    expect(root.textContent).toContain('Built with Tauri, Svelte, and Rust.');
    expect(root.textContent).toContain('Apache-2.0 License');

    const links = [...root.querySelectorAll<HTMLAnchorElement>('.link-card a')];
    expect(links.map((link) => link.textContent?.replace(/\s+/g, ''))).toEqual([
      'ReleaseNotes↗',
      'SourceCode↗',
    ]);
    expect(links[0]?.dataset.url).toBe('');
    expect(links[0]?.getAttribute('aria-disabled')).toBe('true');
    expect(links[1]?.dataset.url).toBe('https://github.com/ronenrozner/cheat-sheet-app');
    expect(links[1]?.getAttribute('href')).toBe('https://github.com/ronenrozner/cheat-sheet-app');
    expect(links[1]?.getAttribute('target')).toBe('_blank');
    expect(links[1]?.getAttribute('rel')).toBe('noreferrer');
    expect(links[1]?.hasAttribute('aria-disabled')).toBe(false);

    links[1]?.click();
    expect(invoke).toHaveBeenCalledWith('open_external_url', {
      url: 'https://github.com/ronenrozner/cheat-sheet-app',
    });
  });
});
