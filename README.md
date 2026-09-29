# CheatSheet

### This is an AI-Assisted project

CheatSheet is a desktop cheat-sheet HUD. Press one global hotkey and get a fast overlay with your pinned cheat sheet, a sheet list, search, themes, and settings.

It is built with **Tauri v2**, **Rust**, **SvelteKit**, and **Svelte 5**. The app is Linux-first, but the build is configured for all Tauri desktop targets.

## Features

- Global hotkey overlay.
- Pinned sheet on open.
- Sidebar sheet switching.
- Search in the current sheet.
- Markdown rendering with code highlighting.
- Settings window.
- Theme selector with bundled JSON themes.
- Custom sheet directory support.
- Tray and single-instance support.
- Local files only by default.

## Status

**This project is in active development**. The app version uses a date-based SemVer-compatible format: `yyyy.m.d`, for example `2026.9.29`.

Useful project documents:

- [`docs/spec/cheat-sheet-overlay.md`](docs/spec/cheat-sheet-overlay.md) — product and technical spec.
- [`tasks/plan.md`](tasks/plan.md) — implementation plan.
- [`tasks/todo.md`](tasks/todo.md) — task list.
- [`THEMES.md`](THEMES.md) — theme format and custom theme notes.
- [`source-sheets/editing-cheat-sheets.md`](source-sheets/editing-cheat-sheets.md) — Sheet format and syntax.

## Requirements

### Common requirements

- Node.js and npm.
- Rust `1.85` or newer.
- Tauri platform requirements for your operating system.

Install JavaScript dependencies:

```sh
npm install
```

### Linux requirements

On Debian or Ubuntu, install the WebKit and GTK packages that Tauri needs:

```sh
sudo apt install \
  libwebkit2gtk-4.1-dev \
  libgtk-3-dev \
  libjavascriptcoregtk-4.1-dev
```

Other Linux distributions need the equivalent WebKitGTK and GTK development packages.

### Windows requirements

Windows needs:

1. WebView2 runtime. It is included with Windows 11. Windows 10 can need the Evergreen runtime.
2. Microsoft C++ Build Tools, or Visual Studio 2022 with **Desktop development with C++**.
3. Rust with the `x86_64-pc-windows-msvc` target.
4. Node.js and npm.

The default hotkey uses the Tauri global shortcut plugin. On Windows it maps to the Win32 hotkey API.

## Development

Run the frontend only:

```sh
npm run dev
```

Run the full desktop app:

```sh
npm run tauri dev
```

The Tauri dev command starts Vite and opens the app window.

## Build

Build the frontend only:

```sh
npm run build
```

Set the app version to today's date in `yyyy.m.d` format:

```sh
npm run version:date
```

Build the release desktop app and installer bundles:

```sh
npm run tauri build
```

Release artifacts are written under:

```text
src-tauri/target/release/bundle/
```

The exact files depend on the operating system. For example, Linux can produce AppImage, deb, and rpm bundles.

If you prefer the Rust Tauri CLI, install it first:

```sh
cargo install tauri-cli
```

Then run:

```sh
cargo tauri dev
cargo tauri build
```

The npm Tauri CLI and the Rust Tauri CLI run the same Tauri app.

## Quality checks

Run tests:

```sh
npm test
```

Run Svelte and TypeScript checks:

```sh
npm run check
```

Run lint and format checks:

```sh
npm run lint
```

Format the repository:

```sh
npm run format
```

## Project layout

```text
src/                 SvelteKit frontend and app UI
src/components/      Svelte components
src/lib/             Frontend helpers, settings bridge, search, themes, i18n
src-tauri/           Rust backend and Tauri config
static/themes/       Bundled theme JSON files
source-sheets/       Source Markdown cheat sheets
tests/               Vitest tests
docs/                Specs and project documentation
tasks/               Plan and task tracking
```

## User data

Default config file:

```text
~/.config/cheatsheet/config.json
```

Default sheet directory:

```text
~/cheatsheets
```

The app keeps an existing `dataDir` value. It does not move your sheets automatically.

## Themes

Bundled theme source files live in:

```text
static/themes/
```

Built theme assets for packaged/static output live in:

```text
dist/themes/
```

See [`THEMES.md`](THEMES.md) for the theme JSON format and customization notes.

## Sheets

Sheets are Markdown files. The app renders the selected sheet inside the overlay and supports search in the current sheet.

The repository includes source sheet material in `source-sheets/`.

Creating or editing sheets is done manually, using your favorite text editor. See [`source-sheets/editing-cheat-sheets.md`](source-sheets/editing-cheat-sheets.md) for sheet syntax.

## License

The app source code is licensed under Apache-2.0. See [`LICENSE`](LICENSE).

[Parchment icons](https://www.flaticon.com/free-icons/parchment "Parchment icons") created by Assia Benkerroum - Flaticon.

Some bundled or source sheet material can have separate upstream license notices. See [`NOTICE`](NOTICE).

## Thanks

**Splode** Christopher Murphy, developer of [Pomotroid](https://github.com/Splode/pomotroid), the inspiration for CheatSheet.
