# Cheat-Sheet Global HUD Overlay

A Linux-first global-hotkey **HUD overlay** that, in one keystroke, surfaces a cheat sheet you'd
otherwise have to hunt for: a pinned sheet on open, a sidebar to switch sheets, and two-way search
(natural-language _or_ literal key combo). Ships as a Tauri v2 / Rust / Svelte 5 desktop app.

Status: **v1 scaffold** (Task 1). See [`tasks/plan.md`](tasks/plan.md) and
[`tasks/todo.md`](tasks/todo.md) for the roadmap; design in
[`docs/spec/cheat-sheet-overlay.md`](docs/spec/cheat-sheet-overlay.md).

## Prerequisites (Linux)

Tauri's system webview needs the WebKit stack. Debian/Ubuntu:

```sh
sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev libjavascriptcoregtk-4.1-dev
```

## Commands

```sh
npm run dev         # Vite dev server (front-end only) on :1420
npm run build       # Vite production build -> dist/
npm run test        # Vitest (unit + golden sets later)
npm run lint        # eslint + prettier (format with: npm run format)
npm run tauri dev   # full app via the npm Tauri CLI (window opens here)
npm run tauri build # full release build + bundle
```

> The spec also lists `cargo tauri dev` / `cargo tauri build`. That requires the separate Rust
> CLI: `cargo install tauri-cli`. The npm `@tauri-apps/cli` (used by `npm run tauri ...`) is
> equivalent and is what this scaffold drives.

## Project layout

- `src-tauri/` — Rust backend (Tauri v2): overlay window shell + module stubs for
  `commands/`, `settings/`, `sheets/`, `shortcuts` (filled by later tasks).
- `src/` — Svelte 5 (runes) frontend: overlay shell; `lib/` holds the forthcoming
  `search/`, `sheets/`, `markdown/`, `settings/`, `overlay/`, `i18n/` modules.
- `tests/` — Vitest units + golden fixtures.

## License

App = Apache-2.0. Bundled default sheets will be CC0/MIT; upstream sheets are GPL-v3 and carry a
notice (license hygiene lands in Task 16).
