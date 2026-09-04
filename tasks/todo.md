# Task List: Cheat-Sheet Global HUD Overlay (v1)

> Checklist task list; companion to [`./plan.md`](./plan.md). Default target for this project
> (no external tracker configured). Sizes: XS=1 file · S=1–2 · M=3–5 · L=5+.
>
> **Open questions O2–O5 (spec §Open Questions) assume the spec's recommended defaults — confirm before
> blocking tasks (14/15/17). O1 is resolved.**

---

## Phase 0 — Spike & Scaffold (high-risk, fail fast)

## Task 1: Repo scaffold — Tauri v2 / Svelte 5 / Vite + git init
**Description:** Initialize the project as a Tauri v2 app with a Svelte 5 + Vite frontend and a Rust backend,
matching the spec's Project Structure (`src-tauri/`, `src/`). Install toolchain bits (Tauri CLI). Run `git init`
and make the first commit. Get a blank overlay window opening in dev.

**Acceptance criteria:**
- [x] `src-tauri/` (Rust) + `src/` (Svelte 5, runes) + `tests/` skeleton exist per spec structure.
- [~] `cargo tauri dev` opens a blank, undecorated window; `npm run build` succeeds.
      (`npm run build` PASS; the undecorated always-on-top window config is in `tauri.conf.json`. The
       visual window-open and the X11 global-hotkey are not confirmable headless — see Result below.)
- [x] `git init` done with a first commit; `node_modules/`/`target/`/`gen/` gitignored.

**Verification:**
- [x] `npm run build` succeeds (Vite → `dist/`, HTTP 200 on :1420 via `npm run dev`).
- [~] `cargo tauri` builds + launches the app (visual render not confirmable headless): `cargo tauri build
      --no-bundle` → `src-tauri/target/release/cheat-sheet-app` (EXIT 0); binary runs 12s, no crash/errors.
- [x] `git status` clean after first commit (no `node_modules`/`target`/`gen`/`dist` leak).

**Result (Task 1 — 2026-08-28, updated after env unblock):** Scaffold complete and committed (`a0d6767` +
`c132a12`). Green baseline: `npm run build` / `npm test` / `npm run lint` / `cargo check` /
`cargo clippy --all-targets -- -D warnings` all PASS. Env now has `libwebkit2gtk-4.1-dev` +
`cargo-tauri 2.11.4`: `cargo tauri build --no-bundle` succeeds (1m28s, 10.7MB release binary) and the binary
launches + stays alive 12s with **no errors** — so the full Tauri pipeline works via the spec's exact command.
Remaining human eyeball: confirm the undecorated/always-on-top window actually *renders*; the X11 `Ctrl-Shift-Q`
bind is Task 2's gate and needs an X11 session (this box is Wayland) or acceptance of the `--toggle` path.

**Dependencies:** None
**Files likely touched:** `src-tauri/Cargo.toml`, `src-tauri/src/main.rs`, `src-tauri/tauri.conf.json`,
`src-tauri/src/lib.rs`, `package.json`, `vite.config.ts`, `src/App.svelte`, `.gitignore`
**Estimated scope:** M

## Task 2: Global-hotkey + always-on-top overlay spike (platform-aware)  ← RISK GATE
**Description:** Wire `tauri-plugin-global-shortcut` to register the default `Ctrl-Shift-Q`, show a
solid, undecorated, always-on-top, centered overlay on trigger, and close on `Esc`. The spike is
**platform-aware**, with one must-path per platform:
- **Windows (must on the current dev box):** the hotkey route is the Win32 `RegisterHotKey` API via
   `global-shortcut`; the overlay is the supported must-path. No session-type detection, no CLI fallback.
- **Linux X11 (must on X11 sessions):** a real global grab via `global-shortcut`.
- **Linux Wayland (best-effort + flagged):** if the grab cannot bind, surface a UI flag and offer the
   `--toggle` CLI route via `tauri-plugin-single-instance` (Task 15).
Add runtime session-type detection (`$XDG_SESSION_TYPE`) for Linux runs only. **Validate the
must-path on the active platform before building UI on top** (Windows on the dev box; X11 when on Linux).

**Acceptance criteria:**
- [~] `Ctrl-Shift-Q` opens the overlay always-on-top, centered, on the active platform's must-path
     (Windows `RegisterHotKey`, or a Linux X11 global grab).
- [~] `Esc` closes it (hides, does not quit).
- [x] On Linux, the session type (`$XDG_SESSION_TYPE`) is read and exposed to the frontend; no panic
     on Wayland; if the Wayland grab cannot bind, the UI flags it and offers `--toggle`.
- [x] A single build runs on Windows and Linux; no platform-specific panic.

**Verification:**
- [~] Manual: hotkey opens / `Esc` closes on the active platform must-path (Windows on the dev box).
- [x] `cargo test` passes a session-detect unit (mocked env): 5 tests in `shortcuts::tests`.
- [x] No silent failure: a failed grab returns a [`HotkeyStatus`] instead of aborting `setup`.

**Result (Task 2 — 2026-09-04):** Platform-aware spike complete and verifiable headlessly.
- `cargo check` / `cargo clippy --all-targets -- -D warnings` / `cargo test` (5 pass) /
  `npm run build` / `npm run lint` all PASS.
- Session detection extracted as pure fn `detect_session_type(env)` (unit-tested, mocked env); wrapped
  by `current_session_type()`; Linux-only, case-insensitive on `$XDG_SESSION_TYPE`.
- `register_overlay_hotkey` now returns `HotkeyStatus` and never aborts `setup` — a failed grab
  (Wayland) is logged (`log::warn`) and surfaced via a new IPC command `get_hotkey_status`
  (`platform` / `linux_session` / `hotkey_available` / `message`). This fixes a latent bug: the old
  code did `register_overlay_hotkey(app)?` in `setup`, so a Wayland registration error would have
  aborted the whole app. Registration now proceeds so the UI can flag it (the `--toggle` single-
  instance route itself is Task 15; not added here).
- Behavior unchanged: `Ctrl-Shift-Q` toggles, `Esc` hides.
- Runtime: `npm run tauri dev` launches and logs
  `overlay hotkey registered (platform=windows, linux_session=None)` — must-path confirmed on the
  dev box; `--toggle` correctly rejected (Task 15).

**Manual gate (human confirm):** `Ctrl-Shift-Q` opens an always-on-top centered overlay; `Esc` hides
  it (does not quit). This box is headless so the visual render is unconfirmable here.

**Dependencies:** Task 1
**Files touched:** `src-tauri/src/shortcuts.rs`, `src-tauri/src/lib.rs`
**Estimated scope:** M

### Checkpoint: Spike
- [x] `cargo test` clean; `npm run build` clean.
- [ ] **Manual: `Ctrl-Shift-Q` opens always-on-top overlay on the active platform must-path (Windows on
   the dev box; X11 on Linux); `Esc` closes.** Human confirms before continuing.

---

## Phase 1 — Content Pipeline

## Task 3: Rust settings load/save (atomic JSON)
**Description:** Implement settings persistence via `tauri-plugin-store` to
`app_config_dir/settings.json` with an atomic write (temp + rename). Define the settings shape
(theme / winSize / trigger / source mode / language / pinned slug).

**Acceptance criteria:**
- [x] `set`/`get` commands round-trip all settings fields; load is safe on first run (defaults).
- [x] Writes are atomic (no partial file on crash); malformed JSON recovers to defaults.

**Verification:**
- [x] `cargo test`: 5 settings tests pass — round-trip JSON, malformed/empty bytes recover to
  defaults, atomic write leaves no temp file. 10 backend tests total (5 settings + 5 shortcuts).
- [x] `cargo clippy --all-targets -- -D warnings` clean; `cargo check` clean.
- [x] `npm run build` + `npm run lint` clean.
- [~] Restart the app; settings persist. (Verified via unit round-trip; on-disk file appears only on
  first `set_settings` — first run loads defaults lazily.)

**Result (Task 3 — 2026-09-04):** Settings persistence complete and verifiable headlessly.
- `Settings` struct with `theme` / `win_size` / `trigger` / `source_mode` / `language` /
  `pinned_slug`; typed enums with sensible v1 defaults (theme=Follow, source=Both, lang=en-US).
- `tauri-plugin-store` registered in `lib.rs`; `get_settings` / `set_settings` IPC commands added
  (registered in `invoke_handler`).
- Atomic write implemented in `settings/mod.rs` (temp file in the same dir + rename); the store
  plugin's own `save` is a plain `fs::write`, so this wraps it. Malformed on-disk JSON recovers to
  defaults; first run loads defaults (no crash).
- `set_settings` returns `Result<(), String>` (Tauri commands must return an `IpcResponse`-able
  error type — `std::io::Error` is not).

**Dependencies:** Task 1
**Files touched:** `src-tauri/src/settings/mod.rs`, `src-tauri/src/commands/settings.rs`,
`src-tauri/src/commands/mod.rs`, `src-tauri/src/lib.rs`
**Estimated scope:** S

## Task 4: Sheet model + front-matter parse + dir scan (Rust) → list IPC
**Description:** Define the sheet model; parse Hexo YAML front-matter (title/intro/tags/categories) and the
body; scan `app_data_dir/cheatsheets/local/` (+ upstream later). Expose a `list_sheets(source_mode)` IPC that
returns slugs + front-matter metadata.

**Acceptance criteria:**
- [ ] Scanning both source dirs returns slug + parsed front-matter, honoring `source_mode` (local/both).
- [ ] Missing/malformed front-matter degrades gracefully (sheet still listed with title fallback).

**Verification:**
- [ ] `cargo test`: dir scan over a temp fixture dir returns expected slugs/metadata.
- [ ] Source-mode filter returns the right subset for `local` vs `both`.

**Dependencies:** Task 3
**Files likely touched:** `src-tauri/src/sheets/mod.rs`, `src-tauri/src/commands/sheets.rs`,
`src/lib/sheets/*`
**Estimated scope:** M

## Task 5: Markdown render (marked + highlight.js + sanitize) + SheetView
**Description:** Render a sheet's Markdown body to HTML in the webview via `marked` + `highlight.js`,
**sanitized**, into an isolated render surface (iframe/sandbox). Keep Tauri's restrictive CSP. Never set raw
`innerHTML` from untrusted content (XSS boundary). Provide a `SheetView` component that renders a given slug.

**Acceptance criteria:**
- [ ] Backticked key tables and ```code``` fences render; XSS payloads in sheet content are neutralized.
- [ ] `SheetView` renders a sheet by slug and updates when the slug changes.

**Verification:**
- [ ] `npm test`: a `<script>`/`<img onerror>` fixture renders inert; legit table/fence render.
- [ ] Manual: a malicious + a normal sheet both display safely.

**Dependencies:** Task 4
**Files likely touched:** `src/lib/markdown/*`, `src/components/SheetView.svelte`
**Estimated scope:** M

## Task 6: Upstream tarball download + extract + contents-API listing/cache
**Description:** Download the upstream snapshot via `GET /repos/Fechin/reference/tarball/main`, extract
`*/source/_posts/*.md` into `…/cheatsheets/upstream/` (D2). Cache the contents-API listing for online listing.
Fetch individual sheets on demand via `raw.githubusercontent.com`.

**Acceptance criteria:**
- [ ] Tarball download + extract populates `upstream/`; idempotent (re-run safe).
- [ ] Online listing returns cached entries offline; on-demand `raw` fetch returns sheet body.

**Verification:**
- [ ] `cargo test`: extract+scan over a mock tarball fixture into a temp dir.
- [ ] Manual: first-run auto-download populates upstream sheets.

**Dependencies:** Task 4
**Files likely touched:** `src-tauri/src/sheets/download.rs`, `src-tauri/src/commands/download.rs`
**Estimated scope:** M

### Checkpoint: Content Pipeline
- [ ] `cargo test` + `npm test` pass.
- [ ] **Manual: a downloaded upstream sheet renders sanitized HTML; a local `.md` renders after Rescan.**

---

## Phase 2 — Two-Way Search

## Task 7: Combo normalizer + unit tests
**Description:** Implement `lib/search/comboNormalize.ts` per the spec alias map (Win/Windows/Super/Mod/`cmd`→
`WIN`, Option/Alt/`⌥`→`ALT`, Control/Ctrl/`⌃`→`CTRL`, Shift/`⇧`→`SHIFT`; `+`/space separators). No
per-platform remap of authored combos in v1.

**Acceptance criteria:**
- [ ] `normalizeCombo("Win+Alt+V")` and `normalizeCombo("Control Shift V")` both yield
  `["WIN","ALT","V"]` (case/alias/separator-insensitive).

**Verification:**
- [ ] `npm test`: alias, separator, and mixed-case cases pass; >80% coverage on the file.

**Dependencies:** None (pure fn; may start in parallel)
**Files likely touched:** `src/lib/search/comboNormalize.ts`, `tests/search/comboNormalize.test.ts`
**Estimated scope:** S

## Task 8: minisearch index builder + two-way query + golden fixtures
**Description:** Build a `minisearch` index over sheets: NL side (title, intro, tags, categories, body
headings) + combo side (normalized backticked key tokens + code tokens). A single query matches either
direction (exact-field > substring > fuzzy). Author a golden fixture set (NL-only / combo-only / mixed →
expected slugs).

**Acceptance criteria:**
- [ ] One query box returns matches by *both* NL description and literal combo.
- [ ] Golden fixture set: NL-only, combo-only, and mixed queries return the expected slugs.

**Verification:**
- [ ] `npm test`: golden set passes; >80% coverage on `lib/search`.
- [ ] Coverage gate enforced for `lib/search`.

**Dependencies:** Task 7, Task 4
**Files likely touched:** `src/lib/search/*`, `tests/search/*.test.ts`, `tests/fixtures/*.md`
**Estimated scope:** M

## Task 9: SearchBox component → switch main pane
**Description:** Add a `SearchBox` in the overlay bound to a single input; results list surfaces matches (both
directions); selecting a result switches the main `SheetView` pane. Escape/blur behavior sane.

**Acceptance criteria:**
- [ ] Typing a NL phrase or a combo both surface the same target sheet; selecting it loads it.
- [ ] Empty/invalid input clears results without error.

**Verification:**
- [ ] `npm test`: integration — query → expected result list.
- [ ] Manual: `Win+Alt+V` and "windows paste plain text" both open the same sheet.

**Dependencies:** Task 8
**Files likely touched:** `src/components/SearchBox.svelte`, `src/App.svelte`
**Estimated scope:** M

### Checkpoint: Search
- [ ] Golden tests pass at >80% coverage on `lib/search`.
- [ ] **Manual: NL and combo queries both surface the same sheet.**

---

## Phase 3 — Overlay UI + Sources

## Task 10: App shell / overlay routing + Sidebar
**Description:** Build the overlay shell that routes the main pane; add a `Sidebar` listing sheets to click
into. Switching a sidebar entry updates `SheetView`.

**Acceptance criteria:**
- [ ] Sidebar lists available sheets; clicking switches the main pane.
- [ ] Selection state is the single source of truth shared with search.

**Verification:**
- [ ] `npm test`: sidebar selection updates the rendered sheet.
- [ ] `npm run build` succeeds.
- [ ] Manual: sidebar switches sheets.

**Dependencies:** Task 5, Task 4
**Files likely touched:** `src/components/Sidebar.svelte`, `src/App.svelte`, `src/lib/overlay/*`
**Estimated scope:** M

## Task 11: Source-mode toggle + first-run auto-download
**Description:** Add the `online / local / both` toggle driving which sheets are visible; on first run,
auto-trigger the local snapshot download (Task 6) so first-run isn't empty.

**Acceptance criteria:**
- [ ] Toggling source mode filters the visible sheet list per the mode.
- [ ] First run with no local snapshot auto-downloads; empty state handles a failed download gracefully.

**Verification:**
- [ ] `npm test`: source-mode filter returns the right subset.
- [ ] `cargo test`: first-run trigger invokes download once.
- [ ] Manual: toggle filters sheets; first run populates locally.

**Dependencies:** Task 6, Task 10
**Files likely touched:** `src/components/*`, `src-tauri/src/sheets/mod.rs`
**Estimated scope:** M

## Task 12: Pinned sheet on open (+ first-run fallback to bundled default)
**Description:** On overlay open, show the user's pinned sheet front-and-center. First run (no pin yet) shows a
bundled app-authored default sheet (CC0/MIT, per D1). The pinned slug persists via settings (Task 3/13).

**Acceptance criteria:**
- [ ] Open shows the pinned sheet if set; otherwise the bundled default.
- [ ] "Pin this sheet" sets the pin and persists across restart.

**Verification:**
- [ ] `npm test`/`cargo test`: pin + fallback resolution.
- [ ] Manual: open shows pinned sheet; after restart the pin sticks.

**Dependencies:** Task 10, Task 3
**Files likely touched:** `src/App.svelte`, `src/components/Sidebar.svelte`, bundled default sheet(s)
**Estimated scope:** M

### Checkpoint: Overlay UI
- [ ] `npm run build` + `cargo test` pass.
- [ ] **Manual: open shows pinned sheet → sidebar switches → source toggle filters.**

---

## Phase 4 — Settings, i18n, Hotkey CLI, License

## Task 13: Persistent settings round-trip (UI ↔ store)
**Description:** Wire the frontend settings surface to the store bridge (Task 3): theme (light/dark/follow),
window size, trigger key, source mode, language, pinned slug. Persist across restart.

**Acceptance criteria:**
- [ ] Changing any setting persists and is reloaded on restart; defaults apply on first run.
- [ ] Malformed on-disk settings recover to defaults (reuse Task 3 behavior).

**Verification:**
- [ ] `npm test` + `cargo test`: round-trip for every field.
- [ ] Manual: change theme + trigger + source; restart; values persist.

**Dependencies:** Task 3, Task 10
**Files likely touched:** `src/lib/settings/*`, `src/components/SettingsPanel.svelte`,
`src-tauri/src/commands/settings.rs`
**Estimated scope:** M

## Task 14: i18n `$: t()` layer + `locales/en-US.json` + graceful no-op  *(assumes O2)*
**Description:** Add a hand-rolled locale layer (O2 assumption): `t(key)` over `locales/en-US.json`, all UI
strings routed through it, a language setting that is a graceful no-op for unimplemented locales. No
`svelte-i18n` dependency.

**Acceptance criteria:**
- [ ] UI strings resolve via `t(key)`; missing key falls back sensibly (key or fallback).
- [ ] Selecting an unimplemented language is a no-op (no crash, stays `en-US`).

**Verification:**
- [ ] `npm test`: `t()` resolves known keys; unknown locale no-ops.
- [ ] Manual: UI is fully string-resolved with `en-US`.

**Dependencies:** Task 10
**Files likely touched:** `src/lib/i18n/*`, `src/locales/en-US.json`
**Estimated scope:** M

## Task 15: `--toggle` single-instance CLI + Wayland flag + snippets  *(assumes O3)*
**Description:** Use `tauri-plugin-single-instance` so `cheatsheet-app --toggle` routes to the running instance
and toggles the overlay. Surface a Wayland "Global hotkey unavailable" flag with per-compositor bind snippets
(Hyprland / Sway / GNOME). On trigger-key change, print the relevant snippet (O3: document, not auto-configure).

**Acceptance criteria:**
- [ ] `cheatsheet-app --toggle` toggles the overlay of the already-running instance.
- [ ] On a non-binding session, the UI flags it and shows the compositor snippets; changing the trigger prints
    the snippet.

**Verification:**
- [ ] `cargo test`: `--toggle` arg parses and routes (mocked single-instance).
- [ ] Manual (X11): `--toggle` toggles the overlay.

**Dependencies:** Task 2, Task 13
**Files likely touched:** `src-tauri/src/shortcuts.rs`, `src-tauri/src/main.rs`, `src/components/SettingsPanel.svelte`
**Estimated scope:** M

## Task 16: License / secret hygiene
**Description:** Ensure GPL upstream sheets carry a `GPL-v3` notice; ship app-authored CC0/MIT default sheets so
first run isn't GPL-entangled (D1); add a `LICENSE` (Apache-2.0) + `NOTICE`; confirm no secrets are committed;
keep license/NOTICE files intact.

**Acceptance criteria:**
- [ ] Upstream sheets display a `GPL-v3` notice; bundled defaults are CC0/MIT.
- [ ] `LICENSE` + `NOTICE` present; no secrets in the tree or in `.env`/gitignore-gaps.

**Verification:**
- [ ] `git log`/manual: no secrets committed; license files present.
- [ ] Manual: upstream sheet shows the GPL notice; first-run default has no GPL entanglement.

**Dependencies:** Task 6, Task 12
**Files likely touched:** `LICENSE`, `NOTICE`, bundled default sheets, `src/components/SheetView.svelte`
**Estimated scope:** S

### Checkpoint: Complete
- [ ] All spec acceptance criteria 1–10 met.
- [ ] `npm test -- --coverage`, `cargo test`, `npm run lint`, `cargo clippy -- -D warnings` all clean.
- [ ] **Manual: hotkey → pinned sheet → search (both directions) → switch source → author local .md → Rescan →
      it appears; restart keeps settings.**
- [ ] **Human review before any PR / ship.**

---

## Phase 5 — Optional / Non-blocking

## Task 17 (optional): Playwright E2E — overlay open/close + pin-on-open  *(assumes O4)*
**Description:** If time allows, add a Playwright E2E for overlay open/close + pin-on-open on the dev machine
(X11, the must path). Non-blocking for v1.

**Acceptance criteria:**
- [ ] E2E drives open → pin-on-open → close; skips gracefully if the environment is unavailable.

**Verification:**
- [ ] E2E passes (X11) or is skipped cleanly elsewhere.

**Dependencies:** Task 12
**Files likely touched:** `e2e/*`
**Estimated scope:** M

---

## Done when
- All Phase 0–4 tasks complete and every Checkpoint box is ticked.
- Open questions O2–O5 confirmed by the human.
- Optional Task 17 is explicitly accepted or deferred.
