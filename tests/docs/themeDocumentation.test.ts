import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function read(path: string): string {
  return readFileSync(path, 'utf8');
}

describe('theme documentation', () => {
  it('links the theme guide from the README', () => {
    const readme = read('README.md');

    expect(readme).toContain('[`THEMES.md`](THEMES.md)');
    expect(readme).toContain('static/themes/');
    expect(readme).toContain('dist/themes/');
  });

  it('documents custom theme authoring for Cheat-Sheet App', () => {
    const themes = read('THEMES.md');

    expect(themes).toContain('# Cheat-Sheet App Themes');
    expect(themes).toContain('Cheatsheet (default dark)');
    expect(themes).toContain('Cheatsheet Light (default light)');
    expect(themes).toContain('~/.local/share/dev.cheatsheet.overlay/themes');
    expect(themes).toContain('Hot-reload');
    expect(themes).toContain('static/themes/');
    expect(themes).toContain('dist/themes/');
  });

  it('records Task 23 in the plan and todo list', () => {
    const plan = read('tasks/plan.md');
    const todo = read('tasks/todo.md');

    expect(plan).toContain('Task 23: Pomotroid-style JSON themes');
    expect(todo).toContain('## Task 23: Pomotroid-style JSON themes');
    expect(todo).toContain('Custom themes hot-reload and emit `themes:changed`');
    expect(todo).toContain('`52ede75` — check in built theme assets.');
  });

  it('updates the spec with theme storage and hot-reload behavior', () => {
    const spec = read('docs/spec/cheat-sheet-overlay.md');

    expect(spec).toContain('Theme system expanded (Task 23');
    expect(spec).toContain('app_data_dir/themes');
    expect(spec).toContain('38 bundled themes');
    expect(spec).toContain('hot reload');
  });
});
