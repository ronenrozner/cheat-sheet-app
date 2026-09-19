# Cheat-Sheet Global HUD Overlay

A Linux-first global-hotkey **HUD overlay** that, in one keystroke, surfaces a cheat sheet you'd
otherwise have to hunt for: a pinned sheet on open, a sidebar to switch sheets, and two-way search
(natural-language _or_ literal key combo). Ships as a Tauri v2 / Rust / Svelte 5 desktop app.

Status: **active v1 implementation**. See [`tasks/plan.md`](tasks/plan.md) and
[`tasks/todo.md`](tasks/todo.md) for the roadmap; design in
[`docs/spec/cheat-sheet-overlay.md`](docs/spec/cheat-sheet-overlay.md). Theme customization is documented in
[`THEMES.md`](THEMES.md).

## Prerequisites (Linux)

Tauri's system webview needs the WebKit stack. Debian/Ubuntu:

```sh
sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev libjavascriptcoregtk-4.1-dev
```

## Prerequisites (Windows)

Tauri's shell is already cross-platform (build config uses `targets: "all"`, `icon.ico` is
shipped, and `main.rs` carries the `windows_subsystem` attribute). Windows needs no code changes
at this stage — only these system bits:

1. **WebView2 runtime** — the webview on Windows. It is bundled with Windows 11; on Windows 10 it
   may need the standalone [Evergreen runtime](https://developer.microsoft.com/microsoft-edge/webview2/).
2. **Microsoft C++ build tools** — Tauri links C/C++ glue through MSVC. Install the **VS 2022
   “Desktop development with C++”** workload, or the
   [Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with “C++
   build tools.” This provides the MSVC linker the `x86_64-pc-windows-msvc` Rust target requires.
3. **Rust + Node** — as in this repo (Rust `>= 1.85`, active `msvc` target; Node for the build).

> **Hotkey note (Windows):** Tauri's `global-shortcut` plugin maps to the Win32
> `RegisterHotKey` API on Windows, so the default `Ctrl-Shift-Q` bind works **without** the
> X11/Wayland special-casing that Linux needs. That Linux-only logic (session-type detection,
> `--toggle` fallback, `xdg-open`) is built in later tasks and is **not** Windows-specific.

> Build/run on Windows via the npm CLI: `npm run tauri dev` and `npm run tauri build`.

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

- `src-tauri/` — Rust backend (Tauri v2): overlay window shell, IPC commands, settings,
  sheets, shortcuts, tray, and JSON theme loading/hot-reload.
- `src/` — SvelteKit + Svelte 5 frontend: overlay route, settings route, settings bridge,
  markdown renderer, search helpers, i18n, and theme application.
- `static/themes/` — bundled JSON theme source files.
- `dist/themes/` — checked-in built theme assets for packaged/static output.
- `tests/` — Vitest units + golden fixtures.

## License

App = Apache-2.0. Bundled default sheets will be CC0/MIT; upstream sheets are GPL-v3 and carry a
notice (license hygiene lands in Task 16).
