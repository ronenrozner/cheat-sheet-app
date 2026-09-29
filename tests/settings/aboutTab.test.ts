// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mount, unmount } from 'svelte';
import AboutTab from '../../src/components/AboutTab.svelte';

async function flush(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe('AboutTab', () => {
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
    expect(links.every((link) => link.dataset.url === '')).toBe(true);
    expect(links.every((link) => link.getAttribute('aria-disabled') === 'true')).toBe(true);
  });
});
