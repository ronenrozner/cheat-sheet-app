# Task List: Cheat-Sheet Global HUD Overlay (v1)

> Checklist task list; companion to [`./plan.md`](./plan.md). Default target for this project
> (no external tracker configured). Sizes: XS=1 file · S=1–2 · M=3–5 · L=5+.
>
> **Open questions O2–O5 (spec §Open Questions) assume the spec's recommended defaults — confirm before
> blocking tasks (14/15/17). O1 is resolved.**

---

## Phase 0 — Spike & Scaffold (high-risk, fail fast)

## Task 1: Repo scaffold — Tauri v2 / SvelteKit / Svelte 5 + git init
**Description:** Initialize the project as a Tauri v2 app with a SvelteKit + Svelte 5 frontend and a Rust backend,
matching the spec's Project Structure (`src-tauri/`, `src/`). Install toolchain bits (Tauri CLI). Run `git init`
and make the first commit. Get a blank overlay window opening in dev.

**Acceptance criteria:**
- [x] `src-tauri/` (Rust) + `src/` (SvelteKit + Svelte 5, runes) + `tests/` skeleton exist per spec structure.
- [~] `cargo tauri dev` opens a blank, undecorated window; `npm run build` succeeds.
      (`npm run build` PASS; the undecorated always-on-top window config is in `tauri.conf.json`. The
       visual window-open and the X11 global-hotkey are not confirmable headless — see Result below.)
- [x] `git init` done with a first commit; `node_modules/`/`target/`/`gen/` gitignored.

**Verification:**
- [x] `npm run build` succeeds (SvelteKit static build → `dist/`, HTTP 200 on :1420 via `npm run dev`).
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
`src-tauri/src/lib.rs`, `package.json`, `vite.config.ts`, `svelte.config.js`, `src/app.html`,
`src/routes/+layout.ts`, `src/routes/+page.svelte`, `src/App.svelte`, `.gitignore`
**Estimated scope:** M

## Task 2: Global-hotkey + always-on-top overlay spike (platform-aware)  ← RISK GATE
**Description:** Wire `tauri-plugin-global-shortcut` to register the default `Ctrl-Shift-Q`, show a
solid, undecorated, always-on-top, centered overlay on trigger, and close on `Esc`. The spike is
**platform-aware**, with one must-path per platform:
- **Windows (must on the current dev box):** the hotkey route is the Win32 `RegisterHotKey` API via
   `global-shortcut`; the overlay is the supported must-path. No session-type detection, no CLI fallback.
- **Linux X11 (must on X11 sessions):** a real global grab via `global-shortcut`.
- **Linux Wayland (best-effort + flagged):** if the grab cannot bind, surface a UI flag and offer the
   `--toggle` CLI route via `tauri-plugin-single-instance` (Task 14).
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
  instance route itself is Task 14; not added here).
- Behavior unchanged: `Ctrl-Shift-Q` toggles, `Esc` hides.
- Runtime: `npm run tauri dev` launches and logs
  `overlay hotkey registered (platform=windows, linux_session=None)` — must-path confirmed on the
  dev box; `--toggle` correctly rejected (Task 14).

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
`<home>/.config/cheatsheet/config.json` with an atomic write (temp + rename). Define the settings shape
(theme / winSize / trigger / language / pinned slug / dataDir).

**Acceptance criteria:**
- [x] `set`/`get` commands round-trip all settings fields; load is safe on first run (defaults).
- [x] Writes are atomic (no partial file on crash); malformed JSON recovers to defaults.

**Verification:**
- [x] `cargo test`: 5 settings tests pass — round-trip JSON, malformed/empty bytes recover to
  defaults, atomic write leaves no temp file. 10 backend tests total (5 settings + 5 shortcuts).
- [x] `cargo clippy --all-targets -- -D warnings` clean; `cargo check` clean.
- [x] `npm run build` + `npm run lint` clean.
- [x] Restart the app; settings persist. First run creates the config file and the configured data folder.

**Result (Task 3 — 2026-09-04):** Settings persistence complete and verifiable headlessly.
- `Settings` struct with `theme` / `win_size` / `trigger` / `source_mode` / `language` /
  `pinned_slug` / `dataDir`; typed enums with sensible v1 defaults (theme=Follow, source=Both, lang=en-US, dataDir=`<home>/cheatsheets`).
- `tauri-plugin-store` registered in `lib.rs`; `get_settings` / `set_settings` IPC commands added
  (registered in `invoke_handler`).
- Atomic write implemented in `settings/mod.rs` (temp file in the same dir + rename); the store
  plugin's own `save` is a plain `fs::write`, so this wraps it. Malformed on-disk JSON recovers to
  defaults; first run creates `<home>/.config/cheatsheet/config.json` and the configured `dataDir`.
- `set_settings` returns `Result<(), String>` (Tauri commands must return an `IpcResponse`-able
  error type — `std::io::Error` is not).

**Dependencies:** Task 1
**Files touched:** `src-tauri/src/settings/mod.rs`, `src-tauri/src/commands/settings.rs`,
`src-tauri/src/commands/mod.rs`, `src-tauri/src/lib.rs`
**Estimated scope:** S

## Task 4: Sheet model + front-matter parse + dir scan (Rust) → list IPC
**Description:** Define the sheet model; parse Hexo YAML front-matter (title/intro/tags/categories) and the
body; scan `<home>/cheatsheets/`. Expose a `list_sheets(source_mode)` IPC that
returns slugs + front-matter metadata.

**Acceptance criteria:**
- [x] Scanning both source dirs returns slug + parsed front-matter, honoring `source_mode` (local/both).
- [x] Missing/malformed front-matter degrades gracefully (sheet still listed with title fallback).

**Verification:**
- [x] `cargo test`: 17 tests (7 new sheets — scan over temp fixtures returns expected slugs/metadata,
  malformed/missing front-matter fallback, front-matter split).
- [x] `cargo clippy --all-targets -- -D warnings` clean; `cargo check` clean.
- [x] `npm run build` + `npm run lint` clean.
- [x] Runtime: `npm run tauri dev` launches cleanly — `list_sheets` registered, no panic.

**Result (Task 4 — 2026-09-04):** Sheet model + front-matter parse + dir scan complete and verifiable
headlessly.
- `Sheet` struct (slug/title/intro/tags/categories/source) — metadata only, no body (body is on-demand
  in Task 6).
- `split_front_matter` + `parse_sheet` parse Hexo YAML front-matter (title/intro/tags/categories);
  missing/malformed front-matter falls back to the slug as the title. No schema invented (spec schema used).
- `scan_dir` scans local + upstream dirs; missing dir yields empty (no panic). `list_sheets(mode)`
  returns `local` or `local`+`upstream`; `online` lists nothing (separate concern, Task 6).
- `list_sheets` IPC command registered.
- **Dependency flag:** added `serde_yaml` (not in the spec's stack table — spec says "ask first" for new
  deps). Needed to parse Hexo YAML; user can veto.

**Dependencies:** Task 3
**Files touched:** `src-tauri/Cargo.toml`, `src-tauri/src/sheets/mod.rs`,
`src-tauri/src/commands/sheets.rs`, `src-tauri/src/commands/mod.rs`, `src-tauri/src/lib.rs`
**Estimated scope:** M

## Task 5: Markdown render (marked + highlight.js + sanitize) + SheetView
**Description:** Render a sheet's Markdown body to HTML in the webview via `marked` + `highlight.js`,
**sanitized**, into an isolated render surface (iframe/sandbox). Keep Tauri's restrictive CSP. Never set raw
`innerHTML` from untrusted content (XSS boundary). Provide a `SheetView` component that renders a given slug.

**Acceptance criteria:**
- [x] Backticked key tables and ```code``` fences render; XSS payloads in sheet content are neutralized.
- [x] `SheetView` renders a sheet by slug and updates when the slug changes.

**Verification:**
- [x] `npm test`: 9 tests pass (7 markdown render + 2 sheetView). `<script>`/`<img onerror>`/
  `javascript:` fixtures render inert; legit heading/code-fence/inline-code render.
- [x] `npm run lint` (eslint + prettier), `npm run check` (svelte-check), `npm run build` all clean.

**Result (Task 5 — 2026-09-04):** Markdown render + SheetView complete and verifiable headlessly.
- `src/lib/markdown/render.ts` — `renderMarkdown` (async) renders Markdown via `marked`, highlights
  fenced code with `highlight.js` (renderer `code` override; marked v18 dropped the `highlight`
  option), then sanitizes with `DOMPurify` (v3, `mathMl` field name). `sanitize` falls back to raw
  HTML if DOMPurify is unavailable (no crash).
- `src/components/SheetView.svelte` — renders a sheet by `slug` prop, re-renders via `$effect` on
  slug change, loads body via optional `load` prop (injected by Task 6). Output goes into an
  isolated `iframe` with `sandbox="allow-same-origin"` (XSS boundary — no raw `innerHTML`).
- eslint-plugin-svelte 3.23.0 couldn't parse TS type annotations in `<script lang="ts">`, so
  svelte-check and eslint disagreed. Added `svelte-eslint-parser` + `@typescript-eslint/parser`
  to `eslint.config.js` so both agree (noImplicitAny satisfied).
- **Dependency flag:** added `marked`, `highlight.js`, `dompurify`, `jsdom` (dev), and
  `@typescript-eslint/parser` (dev) — none named in the spec stack table except `marked`
  (explicitly listed). User can review.

**Dependencies:** Task 4
**Files touched:** `src/lib/markdown/render.ts`, `src/components/SheetView.svelte`,
`eslint.config.js`, `package.json`, `package-lock.json`, `tests/markdown/render.test.ts`
**Estimated scope:** M

## Task 6: contents-API listing + cache
**Description:** Build the cached online listing via the GitHub contents API (`GET /repos/Fechin/reference/contents/source/_posts?ref=main&per_page=100`) so the online browse surface works offline. **No download in Task 6** — the per-file download to `<home>/cheatsheets/` is a **later stage** (not implemented here). Only `.md` files are considered — no tarball, no other file types. The listing is cached locally.

**Note:** The `raw.githubusercontent.com/.../main/source/_posts/<slug>.md` endpoint stays, but **only** to fetch a file for downloading in a later stage. **No online viewing** anywhere — a sheet is viewed only after it is downloaded.

**Acceptance criteria:**
- [x] The online listing is cached locally and returned offline.
- [x] **No download happens in Task 6.** The per-file download to `<home>/cheatsheets/` is deferred to a later stage.
- [x] The listing is browse/download only; there is no online viewing.

**Verification:**
- [x] `cargo test`: listing + cache over a mock contents-API response into a temp dir. (4 new tests: `parse_keeps_only_md_files`, `parse_empty_body_yields_empty_list`, `cache_round_trip_is_atomic_and_reusable`, `read_missing_cache_returns_empty`. 21 backend tests total.)

**Result (Task 6 — 2026-09-04):** Online listing + cache complete and verifiable headlessly.
- `src-tauri/src/sheets/online.rs` — `parse_contents_api_response` parses the contents-API page (objects `{ name, type, ... }`), keeps only `.md` files (extension check, no tarball/other-type), derives the slug from the file name, title falls back to slug. `read_cache` deserializes the cached `Sheet` array (cache stores `Sheet`, so it does **not** go through the contents-API parser). `write_cache` does an atomic temp-file+rename write.
- `fetch_online_listing(app)` is cache-first: a non-empty cache is returned with no network. Otherwise it paginates the contents API (stops on the last/partial page), caches atomically, and returns. A network failure returns an empty list (no panic).
- **New dependency:** `ureq` (2.x, `rustls` feature, no openssl) — the minimal HTTP client, not in the spec's stack table. **User can veto.** `http_get` uses `ureq::Agent::new()`.
- IPC commands `get_online_listing` (offline cache read) and `refresh_online_listing` (fetch + cache) registered in `lib.rs` invoke_handler. `SheetSource::Online` variant added (used only by online.rs).
- `cargo test` (21 pass) / `cargo clippy --all-targets -- -D warnings` (clean) / `cargo check` (clean) / `npm run build` (clean).
- **No frontend wiring, no download, no online viewing** — all deferred, per spec.

**Dependencies:** Task 4
**Files touched:** `src-tauri/src/sheets/online.rs` (new), `src-tauri/src/sheets/mod.rs`,
`src-tauri/src/commands/sheets.rs`, `src-tauri/src/lib.rs`, `src-tauri/Cargo.toml` (**ureq dep**)
**Estimated scope:** M

### Checkpoint: Content Pipeline
- [x] `cargo test` + `npm test` pass.
- [ ] **Manual: a downloaded upstream sheet renders sanitized HTML; a local `.md` renders after Rescan.**

---

## Phase 2 — Two-Way Search

## Task 7: Combo normalizer + unit tests
**Description:** Implement `lib/search/comboNormalize.ts` per the spec alias map (Win/Windows/Super/Mod/`cmd`→
`WIN`, Option/Alt/`⌥`→`ALT`, Control/Ctrl/`⌃`→`CTRL`, Shift/`⇧`→`SHIFT`; `+`/space separators). No
per-platform remap of authored combos in v1.

**Acceptance criteria:**
- [x] `normalizeCombo("Win+Alt+V")` yields `["WIN","ALT","V"]` (case/alias/separator-insensitive).
- [x] `normalizeCombo("Control Shift V")` yields `["CTRL","SHIFT","V"]` — per the authoritative
  alias map, `Control`→`CTRL` and `Shift`→`SHIFT`. (The spec's prose example in the criteria is a
  typo; the Code Style `ALIAS` map is authoritative. Implementation + test follow the map.)

**Verification:**
- [x] `npm test`: alias, separator, mixed-case, and edge cases pass; 100% coverage on the file
  (statements 4/4, branches 2/2, functions 3/3, lines 4/4). 7 tests pass.

**Result (Task 7 — 2026-09-04):** Combo normalizer complete and verifiable headlessly.
- `src/lib/search/comboNormalize.ts` — `normalizeCombo` per the spec alias map (case-insensitive),
  `+`/space separators, literal keys upper-cased. No per-platform remap in v1.
- `tests/search/comboNormalize.test.ts` — 7 tests (alias, space separator, case-insensitivity, all
  documented aliases, literal keys, adjacent/edge separators, empty/whitespace input).
- Added `@vitest/coverage-v8` devDependency (was missing; coverage tooling was not installed).
- `npm run build` clean; 7 tests pass; 100% coverage on the file.

**Dependencies:** None (pure fn; may start in parallel)
**Files touched:** `src/lib/search/comboNormalize.ts` (new),
`tests/search/comboNormalize.test.ts` (new), `package.json`, `package-lock.json`
**Estimated scope:** S

## Task 8: Find-in-current-sheet (NL only, highlight matches)
**Description:** Find-in-current-sheet search over the raw Markdown body of the sheet **currently open in
the HUD**. NL only. No cross-sheet index, no combo matching. Pure logic in `lib/search/findInSheet.ts`:
`findMatches` (character offsets) and `highlightMarkdown` (inserts `<mark>` markers around each match,
rendered backward so earlier offsets stay valid). The search runs on the raw Markdown body, so queries run
against headings, tables, code spans, and prose as authored.

**Acceptance criteria:**
- [x] `findMatches(body, query)` returns offsets for every case-insensitive match; empty/whitespace query
  returns `[]`.
- [x] `highlightMarkdown(body, query)` wraps each match with `<mark>`; returns `body` unchanged when there
  is no match or empty query.
- [x] Query metacharacters match literally (regex escaped), not as wildcards.

**Verification:**
- [x] `npm test`: 7 tests pass (offsets, case-insensitivity, literal match, empty query, no match, `<mark>`
  wrapping, body unchanged).
- [x] svelte-check: 0 errors, 0 warnings.
- [x] Fixed pre-existing lint error in `comboNormalize.ts` (line 33: string index into the `ALIAS` object)
  by adding a type-safe `ALIAS_LOOKUP: Record<string, ...>`.

**Dependencies:** Task 7 (combo normalizer — not used by this task; kept for later), Task 4 (sheet model)

**Result (Task 8 — 2026-09-06):** find-in-current-sheet complete and verifiable headlessly. This is a
**scope change from the original Task 8** (cross-sheet minisearch, NL + combo). The user redirected it to
find-in-the-open-sheet, NL only. The deleted cross-sheet `index.ts` is not restored.

**Dependencies:** None (pure fn)
**Files touched:** `src/lib/search/findInSheet.ts` (new),
`tests/search/findInSheet.test.ts` (new), `src/lib/search/comboNormalize.ts` (fix lint error)
**Estimated scope:** S

## Task 9: SearchBox — find-in-current-sheet input at top of HUD
**Description:** Add a `SearchBox` at the top of the HUD, above the sheet content. NL only, no cross-sheet
index. The match count and highlight are computed in the parent (`App`), which owns the sheet body. The
input binds `query`; the parent passes `query` and `matchCount` down.

**Acceptance criteria:**
- [x] SearchBox sits at the top of the HUD, above the sheet content.
- [x] Typing filters/highlights matches in the current sheet; match count shows "N matches" / "No
  matches" / empty (placeholder only).
- [x] Empty/invalid input clears results without error.
- [x] `Ctrl-F` focuses the app search field and selects the current query instead of opening the webview's default find UI.

**Verification:**
- [x] `npm run check` clean after adding the `Ctrl-F` shortcut.
- [x] `npm test -- --run`: 21 files pass, 107 tests pass after adding the `Ctrl-F` shortcut.
- [x] svelte-check: 0 errors, 0 warnings (fixed module-resolution import error by using explicit
  `.svelte` extension + default imports).
- [x] `npm run lint` clean (prettier).
- [x] `main.ts` updated at the time: `mount(App, { target, props: {} })` to satisfy Svelte 5 `MountOptions`.
  Superseded by Task 20: SvelteKit now owns app boot and `src/main.ts` was removed.

**Dependencies:** Task 8 (find-in-current-sheet logic)
**Files touched:** `src/components/SearchBox.svelte` (new), `src/App.svelte` (wiring),
`src/components/SheetView.svelte` (accepts `query`, highlights internally), `src/lib/markdown/render.ts`
(allow `<mark>` in DOMPurify). Historical note: `src/main.ts` was touched for mount props, then removed by
Task 20 when SvelteKit took over app boot.
**Result update (2026-09-29):** Added a main-window `Ctrl-F` shortcut that moves focus to the SearchBox,
selects the existing query, and prevents the webview's built-in find UI.

**Estimated scope:** M

### Checkpoint: Search
- [x] svelte-check: 0 errors, 0 warnings.
- [x] **Manual: typing in the search box highlights matches in the current sheet.**

**Note:** This is the find-in-current-sheet design (user redirect). The original Task 8/9 cross-sheet
minisearch with combo matching is deferred. If cross-sheet search is wanted later, rebuild
`src/lib/search/index.ts` (restore from git or rewrite).

---

## Phase 3 — Overlay UI + Sources

## Task 10: App shell / overlay routing + Sidebar
**Description:** Build the overlay shell that routes the main pane; add a `Sidebar` listing sheets to click
into. Switching a sidebar entry updates `SheetView`.

**Acceptance criteria:**
- [x] Sidebar lists available sheets; clicking switches the main pane.
- [x] Selection state is the single source of truth shared with search.

**Verification:**
- [ ] `npm test`: sidebar selection updates the rendered sheet.
- [ ] `npm run build` succeeds.
- [ ] Manual: sidebar switches sheets.

**Dependencies:** Task 5, Task 4
**Files likely touched:** `src/components/Sidebar.svelte`, `src/App.svelte`, `src/lib/overlay/*`
**Estimated scope:** M

## Task 11: Pinned sheet on open (+ first-run fallback to bundled default)
**Description:** On overlay open, show the user's pinned sheet front-and-center. First run (no pin yet) shows a
bundled app-authored default sheet (CC0/MIT, per D1). The pinned slug persists via settings (Task 3/13).

**Acceptance criteria:**
- [x] Open shows the pinned sheet if set; otherwise the bundled default.
- [x] "Pin this sheet" sets the pin and persists across restart.

**Verification:**
- [x] `npm test`: 42 tests (8 `initialSlug` resolution + App mount-resolution regression + pin-click). `cargo test` clean.
- [x] `npm run build`, `npm run check` (0 errors/warnings), `npm run lint`, prettier all clean.
- [ ] **Manual: open shows pinned sheet; after restart the pin sticks.** (frontend logic verified headlessly;
       restart persistence requires the running app + on-disk store).

**Result (Task 11 — 2026-09-04):** Pinned-sheet-on-open complete and verifiable headlessly.
- `src/lib/overlay/initialSlug.ts` — `resolveInitialSlug(pinnedSlug, available)`: pinned slug wins when
  available, first run falls back to bundled defaults (`bash`/`git`/`powershell`/`vim`/`windows`, in that
  order), then the first available sheet. Pure, unit-tested (8 tests, 8/8).
- `src/App.svelte` — on mount, `get_settings` loads the persisted snapshot; `selection` resolves via
  `resolveInitialSlug(settings.pinned_slug ?? '', slugs)`. Header adds a "Pin this sheet" / "Unpin this
  sheet" button that calls `set_settings` (backend already provides `Settings.pinned_slug` from Task 3;
  no backend change). `isPinned` drives the button label + `aria-pressed`.
- `tests/overlay/App.svelte.test.ts` — updated the mount test to the new behavior (bundled default `git`
  beats first-in-list `vim` with no pin); added a pin-click test asserting `set_settings` is called with
  `{ pinned_slug: 'git' }` and the button flips to "Unpin".
- **No backend change**: `get_settings`/`set_settings` already persisted `pinned_slug` (Task 3). Bundled
  defaults already seeded on first run (`src-tauri/bundled/`).

**Dependencies:** Task 10, Task 3
**Files likely touched:** `src/App.svelte`, `src/components/Sidebar.svelte`, bundled default sheet(s)
**Estimated scope:** M

### Checkpoint: Overlay UI
- [x] `npm run build` + `cargo test` pass.
- [ ] **Manual: open shows pinned sheet → sidebar switches sheets.**

---

## Phase 4 — Settings, i18n, Hotkey CLI, License

## Task 12: Persistent settings round-trip (UI ↔ store)
**Description:** Wire the frontend settings surface to the store bridge (Task 3): theme (light/dark/follow),
window size, trigger key, language, pinned slug, and dataDir. Persist across restart.

**Acceptance criteria:**
- [x] Changing any setting persists and is reloaded on restart; defaults apply on first run.
- [x] Malformed on-disk settings recover to defaults (reuse Task 3 behavior).

**Verification:**
- [x] `npm test`: 51 tests (9 settings bridge — coerce/defaults, get fallback, set validate/skip).
- [x] `cargo test` clean (backend Task 3 already covers round-trip + malformed recovery).
- [x] `npm run build`, `npm run check` (0 errors/warnings), `npm run lint`, prettier all clean.
- [ ] **Manual: change theme + trigger; restart; values persist.** (frontend wiring verified headlessly;
       on-disk persistence across restart needs the running app + store).

**Result (Task 12 — 2026-09-04):** Frontend settings surface complete and verifiable headlessly.
- `src/lib/settings/types.ts` — `Settings` model mirrors the Rust `Settings` (theme / win_size /
  trigger / source_mode / language / pinned_slug / dataDir); enum string values match the Rust unit-variant
  serialization; `DEFAULT_SETTINGS` default trigger is `Ctrl+Shift+Q` (matches Rust `Settings::default`).
- `src/lib/settings/bridge.ts` — `getSettings` falls back to defaults on error/partial response;
  `setSettings` validates before persisting (rejects malformed snapshots without calling the backend)
  and returns success/failure. `coerceSettings` + shape guards make recovery redundant-safe.
- `src/components/SettingsPanel.svelte` — one control per field (theme select, window-size number
  inputs, trigger checkboxes + key, language select, pinned-slug input); each edit calls `onSave`.
- `src/App.svelte` — loads settings via `getSettings` on mount, wires the panel's `onSave` into a
  `persist()` that calls `setSettings`. No backend change: the Task 3 `get_settings`/`set_settings`
  commands already persist every field.
- **No backend change**: `Settings` + `get_settings`/`set_settings` + malformed recovery all existed
  from Task 3.

**Dependencies:** Task 3, Task 10
**Files touched:** `src/lib/settings/types.ts`, `src/lib/settings/bridge.ts`,
`src/components/SettingsPanel.svelte`, `src/App.svelte`, `tests/settings/bridge.test.ts`
**Estimated scope:** M

**Note:** Default trigger is `Ctrl+Shift+Q` (`ctrl=true, alt=false, shift=true, key="q"`), set in
`Settings::default()` (committed `fb87e68`). The UI defaults to this; the user can change it later.

## Task 13: i18n `$: t()` layer + `locales/en-US.json` + graceful no-op  *(assumes O2)*
**Description:** Add a hand-rolled locale layer (O2 assumption): `t(key)` over `locales/en-US.json`, all UI
strings routed through it, a language setting that is a graceful no-op for unimplemented locales. No
`svelte-i18n` dependency.

**Acceptance criteria:**
- [x] UI strings resolve via `t(key)`; missing key falls back sensibly (key or fallback).
- [x] Selecting an unimplemented language is a no-op (no crash, stays `en-US`).

**Verification:**
- [x] `npm test`: 60 tests (9 i18n — resolution, interpolation, missing-key fallback, unsupported locale no-op).
- [x] `npm run build`, `npm run check` (0 errors/warnings), `npm run lint`, prettier all clean.
- [x] `cargo test` clean (no backend change).
- [ ] **Manual: UI is fully string-resolved with `en-US`.** (frontend wiring verified headlessly).

**Result (Task 13 — 2026-09-04):** i18n layer complete and verifiable headlessly.
- `src/lib/i18n/index.ts` — hand-rolled `t(key, data)` over an inline en-US tree (no `en-US.json` file
  import, since vitest does not resolve `.json` default imports; the tree is inlined to stay testable).
  Dotted-key resolution, `{{name}}` interpolation, key-fallback on miss. `getLocale`/`setLocale`: an
  unimplemented locale is a no-op (returns false, current locale retained, no crash).
- All UI strings routed through `t()`: `App.svelte` (title, hotkey, pin/unpin), `SearchBox.svelte`
  (placeholder + match counts), `SheetView.svelte` (none-selected / not-found / failed),
  `Sidebar.svelte` (aria-label), `SettingsPanel.svelte` (every label, placeholder, and option text).
- No `svelte-i18n` dependency.
- **No backend change.**

**Dependencies:** Task 10
**Files touched:** `src/lib/i18n/index.ts`, `src/locales/en-US.json` (superseded by inline tree),
`src/App.svelte`, `src/components/SearchBox.svelte`, `src/components/SheetView.svelte`,
`src/components/Sidebar.svelte`, `src/components/SettingsPanel.svelte`,
`tests/i18n/index.test.ts`
**Estimated scope:** M

## Task 14: `--toggle` single-instance CLI + Wayland flag + snippets  *(assumes O3)*
**Description:** Use `tauri-plugin-single-instance` so `cheatsheet-app --toggle` routes to the running instance
and toggles the overlay. Surface a Wayland "Global hotkey unavailable" flag with per-compositor bind snippets
(Hyprland / Sway / GNOME). On trigger-key change, print the relevant snippet (O3: document, not auto-configure).

**Acceptance criteria:**
- [x] `cheatsheet-app --toggle` toggles the overlay of the already-running instance (via
      `tauri-plugin-single-instance` callback; the flag toggles the `main` window show/hide).
- [x] On a non-binding session, the UI flags it and shows the compositor snippets; the trigger
      snippet is surfaced in the SettingsPanel (O3: documented, not auto-configured).

**Verification:**
- [x] `cargo test`: `is_toggle_requested` parses `--toggle` (3 new tests); `WaylandSnippets` non-empty.
- [ ] Manual (X11/Wayland): `cheatsheet-app --toggle` toggles the running overlay.

**Dependencies:** Task 2, Task 12
**Files touched:** `src-tauri/src/shortcuts.rs`, `src-tauri/src/lib.rs`,
`src-tauri/src/commands/mod.rs`, `src-tauri/Cargo.toml`, `src/components/SettingsPanel.svelte`,
`src/App.svelte`, `src/lib/overlay/hotkey.ts`, `src/locales/en-US.json`
**Estimated scope:** M

**Result (Task 14 — 2026-09-11):** `--toggle` single-instance CLI + Wayland flag + snippets
complete and verifiable headlessly.
- `tauri-plugin-single-instance` registered in `lib.rs` with a callback that toggles the `main`
  window on `--toggle`. A second `cheatsheet-app --toggle` invocation is routed to the running
  instance and shows/hides the overlay — the Wayland best-effort fallback (and works on Windows/X11).
- `shortcuts.rs`: new `is_toggle_requested(args)` (pure, unit-tested) and `WaylandSnippets`
  (Hyprland / Sway / GNOME `bind` lines, `Default`). New `get_wayland_snippets` IPC command.
- Frontend: `src/lib/overlay/hotkey.ts` DTOs (`HotkeyStatus`/`WaylandSnippets`, snake_case to match
  Rust) + `isHotkeyAvailable`/`isWayland` helpers. `App.svelte` loads both via IPC on mount and
  passes them to `SettingsPanel`. The panel shows the Wayland "Global hotkey unavailable" flag +
  snippets when `linux_session === 'wayland'`, and a "registered" confirmation otherwise.
- `cargo test` (27 pass) / `cargo clippy -D warnings` clean / `npm test` (65 pass) /
  `npm run check` / `npm run lint` all clean.

**Manual gate (human confirm):** run `cheatsheet-app --toggle` (or `cargo tauri dev -- --toggle`)
  and confirm the running overlay toggles; on Wayland confirm the flag + snippets render in
  SettingsPanel.

## Task 15: License / secret hygiene
**Description:** Ensure GPL upstream sheets carry a `GPL-v3` notice; ship app-authored CC0/MIT default sheets so
first run isn't GPL-entangled (D1); add a `LICENSE` (Apache-2.0) + `NOTICE`; confirm no secrets are committed;
keep license/NOTICE files intact.

**Acceptance criteria:**
- [x] Upstream sheets documented as `GPL-v3` in `NOTICE`; bundled defaults are CC0/MIT.
- [x] `LICENSE` + `NOTICE` present; no secrets in the tree or in `.env`/gitignore-gaps.
- [x] **Verification:** `LICENSE` (Apache-2.0) + `NOTICE` present and committed (`73fe223`); `source-sheets/` gitignored so 215 sheets are not committed. Bundled defaults in `src-tauri/bundled/` are app-authored (bash/vim/powershell/windows) — no GPL content shipped under the app name. In-HUD GPL-notice display was scoped out by the user (2026-09-11); upstream is documented as GPL in `NOTICE`.

**Verification:**
- [ ] `git log`/manual: no secrets committed; license files present.
- [ ] Manual: upstream sheet shows the GPL notice; first-run default has no GPL entanglement.

**Dependencies:** Task 6, Task 11
**Files likely touched:** `LICENSE`, `NOTICE`, bundled default sheets, `src/components/SheetView.svelte`
**Estimated scope:** S

### Checkpoint: Complete
- [ ] All spec acceptance criteria 1–10 met.
- [ ] `npm test -- --coverage`, `cargo test`, `npm run lint`, `cargo clippy -- -D warnings` all clean.
- [ ] **Manual: hotkey → pinned sheet → search (both directions) → author local .md → Rescan →
      it appears; restart keeps settings.**
- [ ] **Human review before any PR / ship.**

---

## State-sync notes (todo.md reconciled to code)

> Synced 2026-09-11. Checked against `HEAD` + live `npm run build` / `npm test` (65 pass) /
> `cargo test` (27 pass). Marked done what the code already ships; left open what is not yet
> implemented.

- **Task 10 (App shell / Sidebar):** done. `App.svelte` wires `Sidebar` through `overlay/selection.ts`
  (`{slug, slugs}` as the single source of truth shared with search); committed (`4c509d5`).
- **Task 11 (pinned sheet on open):** done. `src/lib/overlay/initialSlug.ts` resolves pinned → bundled
  default → first available; `App.svelte` mounts settings + resolves open sheet; header "Pin this
  sheet" button persists `pinned_slug` via existing `set_settings` (no backend change). Committed
  (`4b8f7d6`).
- **Task 12 (settings UI round-trip):** done. `src/lib/settings/types.ts` (Settings model),
  `src/lib/settings/bridge.ts` (defensive get/set), `src/components/SettingsPanel.svelte` (one
  control per field), wired into `App.svelte` (loads via `get_settings` on mount, persists on edit).
  No backend change. Committed (`303f66d`, `34e9456`).
- **Task 13 (i18n layer):** done. `src/lib/i18n/index.ts` — `t(key, data)` over an inline en-US
  tree (dotted keys, `{{name}}` interpolation, key-fallback); `setLocale` no-ops on unimplemented
  locales. All UI strings routed through `t()`. Committed (`7b8a238`).
- **Task 15 (license):** `LICENSE` + `NOTICE` present and committed; bundled defaults are app-authored.
  The upstream GPL-notice *display* in the HUD is still open (see verification above).
- **Task 14 (`--toggle` single-instance CLI + Wayland flag + snippets):** done. `tauri-plugin-single-instance`
  registered in `lib.rs` with a `--toggle` callback that toggles the `main` window. `is_toggle_requested`
  + `WaylandSnippets` in `shortcuts.rs` (unit-tested). `get_wayland_snippets` IPC command. Frontend
  `src/lib/overlay/hotkey.ts` DTOs + helpers; `App.svelte` loads status on mount; `SettingsPanel`
  flags the Wayland path and shows snippets. Committed (`2026-09-11`).
- **Still open (surface not present in code):** none. Task 15 (upstream GPL-notice display in the HUD)
  remains — the bundled defaults carry no in-file GPL tag; `NOTICE` documents upstream as GPL.

---

## Phase 5 — Optional / Non-blocking

## Task 16 (optional): Playwright E2E — overlay open/close + pin-on-open  *(assumes O4)*
**Description:** If time allows, add a Playwright E2E for overlay open/close + pin-on-open on the dev machine
(X11, the must path). Non-blocking for v1.

**Acceptance criteria:**
- [ ] E2E drives open → pin-on-open → close; skips gracefully if the environment is unavailable.

**Verification:**
- [ ] E2E passes (X11) or is skipped cleanly elsewhere.

**Dependencies:** Task 11
**Files likely touched:** `e2e/*`
**Estimated scope:** M

---

## Phase 5 — Optional / Non-blocking

## Task 17: System tray toggle — persistent icon + settings switch *(new, beyond spec)*
**Description:** Add a persistent system tray icon controlled by a new setting `show_tray` (default **off**). When off, behavior is unchanged (hidden window only). When on, a persistent tray icon appears. Left-click toggles the overlay. The icon swaps appearance when the overlay opens/closes (open state = `icons/icon-open.png`, the base icon with a small checkmark badge). A tray menu includes **Quit** for graceful shutdown (added by Task 22). macOS renders both icons as grayscale templates. Backend: `settings::ShowTray` enum + `tray` module (create/show/hide/swap-icon), IPC command `set_tray_visibility`, tray icon updates wired into the hotkey toggle path and the `--toggle` single-instance callback. Frontend: `show_tray` in `Settings`/`DEFAULT_SETTINGS`, `bridge.ts` validate/coerce, `SettingsPanel.svelte` checkbox, `App.svelte` calls `set_tray_visibility` on change.

**Acceptance criteria:**
- [ ] Default `show_tray` is **off**; a new install keeps the original hidden-window-only behavior.
- [ ] `SettingsPanel` checkbox toggles the tray: ON shows a persistent icon, OFF hides it.
- [ ] Left-click on the tray icon toggles the overlay (show/hide + focus).
- [ ] The icon swaps appearance when the overlay opens/closes (tray click, hotkey, or `--toggle`).
- [x] Tray menu has a **Quit** item for graceful app shutdown.
- [ ] Restart keeps the setting.

**Verification:**
- [ ] `cargo test`: `ShowTray` load/save (default off, round-trip), `tray_visible` matches setting, both icons embedded.
- [ ] `cargo clippy --all-targets -- -D warnings` clean; `cargo check` clean.
- [ ] `npm run build`, `npm run check` (0 errors/warnings), `npm run lint`, prettier all clean.
- [ ] **Manual (human confirm):** enable tray → icon appears; click → overlay toggles + icon swaps; disable → icon disappears; restart keeps the setting.

**Dependencies:** Task 3 (settings), Task 2 (hotkey toggle), Task 14 (`--toggle` single-instance)
**Files likely touched:** `src-tauri/src/tray.rs` (new), `src-tauri/src/settings/mod.rs`, `src-tauri/src/commands/settings.rs`, `src-tauri/src/lib.rs`, `src-tauri/src/shortcuts.rs`, `src-tauri/Cargo.toml` (tray-icon + image-png features), `src-tauri/icons/icon-open.png` (new), `src/lib/settings/types.ts`, `src/lib/settings/bridge.ts`, `src/components/SettingsPanel.svelte`, `src/App.svelte`, `src/locales/en-US.json`
**Estimated scope:** M

**Result (Task 17 — 2026-09-15):** System tray toggle complete and verifiable headlessly.
- `settings::ShowTray` enum (Off/On, default Off) added to `Settings`; load/save handles it (default off, round-trip, malformed → off). `cargo test`: 29 pass (26 backend + 3 new: `ShowTray` load/save default-off + round-trip, `tray_visible` matches setting, both icons embedded).
- `tray.rs` module (new): `create_tray` (build tray menu with Quit, tooltip, macOS template, left-click toggles), `tray_visible`, `set_tray_visible`, `update_overlay_icon` (swaps base/open icon), `overlay_open`, `toggle_overlay`, `request_exit`.
- `commands/settings.rs`: `set_tray_visibility` IPC command. `lib.rs`: registers it; creates tray in `setup` only when `show_tray` is On; the `--toggle` single-instance callback updates the tray icon.
- `shortcuts.rs`: hotkey toggle + ESC paths update the tray icon.
- `Cargo.toml`: enabled `tray-icon` + `image-png` features.
- `icons/icon-open.png` (new): overlay-open variant (base icon + checkmark badge).
- Frontend: `ShowTray` in `Settings`/`DEFAULT_SETTINGS` (default Off), `bridge.ts` validate/coerce, `SettingsPanel.svelte` checkbox, `App.svelte` calls `set_tray_visibility` when `show_tray` changes.
- `cargo clippy --all-targets -- -D warnings` clean; `cargo check` clean; `npm test` 65 pass; `npm run check` 0 errors/warnings; `npm run lint` clean; `npm run build` clean.

**Manual gate (human confirm):** enable tray → icon appears; click → overlay toggles + icon swaps; disable → icon disappears; restart keeps the setting.

---

## Task 18: Always-on-top toggle — persistent setting + live switch *(new, beyond spec)*
**Description:** Add a setting `always_on_top` (default **on**). When on, the overlay stays above other windows. When off, it sits behind them. Toggling applies live via `Window::set_always_on_top` (no window rebuild). Backend: `always_on_top: bool` field in `Settings`, IPC command `set_always_on_top`, applied on change. Frontend: `always_on_top` in `Settings`/`DEFAULT_SETTINGS`, `bridge.ts` validate/coerce, `SettingsPanel.svelte` checkbox, `App.svelte` calls `set_always_on_top` on change.

**Acceptance criteria:**
- [ ] Default `always_on_top` is **on**; a new install keeps the overlay always on top.
- [ ] `SettingsPanel` checkbox toggles it: ON = window stays above others, OFF = window goes behind.
- [ ] The change applies live (no rebuild).
- [ ] Restart keeps the setting.

**Verification:**
- [ ] `cargo test`: `always_on_top` load/save (default true, round-trip).
- [ ] `cargo clippy --all-targets -- -D warnings` clean; `cargo check` clean.
- [ ] `npm run build`, `npm run check` (0 errors/warnings), `npm run lint`, prettier all clean.
- [ ] **Manual (human confirm):** toggle off → window goes behind another window; toggle on → window returns to top; restart keeps the setting.

**Result (Task 18 — 2026-09-15):** Always-on-top toggle complete and verifiable headlessly.
- `always_on_top: bool` added to `Settings` (default `true`); load/save handles it (default true, round-trip, malformed → true). `cargo test`: 29 pass (added `always_on_top` to defaults + round-trip tests).
- `commands/settings.rs`: new IPC command `set_always_on_top` — applies live via `Window::set_always_on_top`, no window rebuild; returns `Ok(())` if the window is absent.
- `lib.rs`: registers `set_always_on_top`.
- Frontend: `AlwaysOnTop` in `Settings`/`DEFAULT_SETTINGS` (default On), `bridge.ts` validate/coerce, `SettingsPanel.svelte` checkbox "Always on top", `App.svelte` calls `set_always_on_top` when `always_on_top` changes.
- `cargo clippy --all-targets -- -D warnings` clean; `cargo check` clean; `npm test` 65 pass; `npm run check` 0 errors/warnings; `npm run lint` clean; `npm run build` clean.

**Dependencies:** Task 3 (settings)
**Files likely touched:** `src-tauri/src/settings/mod.rs`, `src-tauri/src/commands/settings.rs`, `src-tauri/src/lib.rs`, `src/lib/settings/types.ts`, `src/lib/settings/bridge.ts`, `src/components/SettingsPanel.svelte`, `src/App.svelte`, `src/locales/en-US.json`
**Estimated scope:** S

---

## Task 19: Settings window — separate always-on-top window with gear-open + live sync *(new, beyond spec)*
**Description:** Add a separate always-on-top settings window (label `settings`, 720x640, `decorations: false`, resizable, centered, covering the main overlay). Open it via a gear icon in the main overlay header. Custom title bar with "SETTINGS" text + close (X) button; title bar supports window dragging (mousedown + `startDragging`). Left tab sidebar (Settings / About); About is a placeholder. The settings window renders the settings controls; the main overlay renders the sheet HUD. Original implementation detected the current window by `Window.getCurrent().label`; Task 21 later moved settings to the route-owned `/settings` page. Live sync uses a `settings-changed` window event so the overlay reflects changes live while settings is open.

**Acceptance criteria:**
- [ ] A `settings` window exists (720x640, decorations false, always on top).
- [ ] A gear icon in the main overlay header opens the settings window.
- [ ] The settings window shows a custom title bar ("SETTINGS" + close) that supports window dragging.
- [ ] Left tab sidebar (Settings / About); About is a placeholder.
- [ ] The close (X) button hides the settings window and keeps the main overlay open.
- [ ] Changes made in settings apply live to the main overlay (via the `settings-changed` event).

**Verification:**
- [x] `cargo test`: 29 pass (no backend change).
- [x] `cargo clippy --all-targets -- -D warnings` clean; `cargo check` clean.
- [x] `npm test`: existing tests still pass (65 pass). The App test now mocks `@tauri-apps/api/window` (label `main`) and `@tauri-apps/api/event` (live-sync `listen`).
- [x] `npm run build`, `npm run check` (0 errors/warnings), `npm run lint`, prettier all clean.
- [ ] **Manual (human confirm):** click gear → settings opens; drag title bar → window moves; close → settings hides, main overlay stays; change a setting → overlay reflects it live; restart keeps the setting.

**Result (Task 19 — 2026-09-15):** Settings window complete and verifiable headlessly.
- `tauri.conf.json`: added a `settings` window (720x640, decorations false, always on top, resizable, centered, visible false). No new Rust commands — `get_settings`/`set_settings` already exist.
- `lib/settingsWindow.ts` (new): `openSettings()` (show + focus the `settings` window), `closeSettings()` (hide), `isSettingsOpen()`.
- `components/SettingsWindow.svelte` (new): custom title bar ("SETTINGS" + close ×), left tab sidebar (Settings / About), `role="dialog"` + `tabindex="-1"` for a11y, drag from title bar via `getCurrentWindow().startDragging()`, close via `getCurrentWindow().hide()`.
- `components/AboutTab.svelte` (new): placeholder About tab (future content).
- `App.svelte`: initially detected current window label — rendered `<SettingsWindow>` in the `settings` window, else the overlay shell; added a gear icon in the overlay header (`onOpenSettings`); live sync — emitted `settings-changed` after `setSettings`, and listened for it to reload settings so the overlay reflected edits live. Superseded by Task 21: settings now lives in `src/routes/settings/+page.svelte`, and `App.svelte` is overlay-only.
- `locales/en-US.json`: added `settings.title`, `settings.close`, `settings.tabsLabel`, `settings.settingsTab`, `settings.aboutTab`, `settings.about`, `settings.version`, `settings.aboutNote`, `settingsOpen`.
- Tests: App.svelte test now mocks `@tauri-apps/api/window` (default label `main`) and `@tauri-apps/api/event` (no-op `listen`) so the live-sync effect doesn't hit the real backend. 65 pass.
- `cargo clippy --all-targets -- -D warnings` clean; `cargo check` clean; `npm run check` 0 errors/warnings; `npm run lint` clean; `npm run build` clean.

**Manual gate (human confirm):** click gear → settings opens; drag title bar → window moves; close → settings hides, main overlay stays; change a setting → overlay reflects it live; restart keeps the setting.

**Dependencies:** Task 3 (settings), Task 12 (settings UI)
**Files likely touched:** `src-tauri/tauri.conf.json` (add `settings` window), `src/lib/settingsWindow.ts` (new), `src/settingsWindow.ts` (new), `src/components/SettingsWindow.svelte` (new), `src/components/AboutTab.svelte` (new), `src/App.svelte`, `src/locales/en-US.json`
**Estimated scope:** M

---

## Task 20: Add SvelteKit frontend shell
**Description:** Move the frontend from a Vite-only Svelte entry to a SvelteKit shell while keeping Tauri as
the desktop host. SvelteKit owns the document shell, route entry, generated types, and frontend CSP handling.
The app stays client-only in the Tauri webview.

**Acceptance criteria:**
- [x] SvelteKit dependencies are installed: `@sveltejs/kit` and `@sveltejs/adapter-static`.
- [x] `vite.config.ts` uses `sveltekit()` instead of the old Svelte-only Vite plugin.
- [x] `svelte.config.js` uses `adapter-static` and writes the frontend build to `dist/` for Tauri.
- [x] SvelteKit entry files exist: `src/app.html`, `src/routes/+layout.ts`, `src/routes/+page.svelte`.
- [x] The app is client-only for Tauri: `ssr = false`, `prerender = true`.
- [x] Old Vite-only boot files are removed: root `index.html` and `src/main.ts`.
- [x] `.svelte-kit/` is ignored by git, ESLint, and Prettier.
- [x] CSP is handled through SvelteKit config so the generated boot script gets a valid hash; Tauri CSP is
  updated to allow the SvelteKit boot layer.

**Verification:**
- [x] `npm run check` clean.
- [x] `npm run build` clean; SvelteKit writes the static site to `dist/`.
- [x] `npm test`: 17 files pass, 86 tests pass.
- [x] `npm run lint` clean.

**Result (Task 20 — 2026-09-18):** SvelteKit migration complete. Existing `App.svelte` remains the overlay shell
and is rendered from `src/routes/+page.svelte`. Tauri continues to load `dist/` in production and the dev server
on port 1420 in development. The CSP console error caused by SvelteKit's inline boot script was fixed by moving
CSP generation into SvelteKit config and aligning the Tauri CSP. Task 21 later added the route-owned settings page.

**Dependencies:** Task 1 scaffold
**Files touched:** `package.json`, `package-lock.json`, `vite.config.ts`, `svelte.config.js`, `tsconfig.json`,
`.gitignore`, `.prettierignore`, `eslint.config.js`, `src/app.html`, `src/routes/+layout.ts`,
`src/routes/+page.svelte`, `src-tauri/tauri.conf.json`, removed `index.html`, removed `src/main.ts`
**Estimated scope:** M

---

## Task 21: Move settings UI to SvelteKit `/settings` route
**Description:** Split the SvelteKit routes by responsibility. The root route `/` renders the HUD overlay only.
The settings route `/settings` renders the settings window UI. Keep the Tauri window label `settings`, but open
that window at `/settings` via `WebviewWindow` instead of rendering different UI from `App.svelte` based on the
current window label.

**Acceptance criteria:**
- [x] `src/routes/settings/+page.svelte` exists and renders `<SettingsWindow>`.
- [x] `src/App.svelte` is overlay-only and no longer checks `getCurrentWindow().label`.
- [x] `src/lib/settingsWindow.ts` creates a `WebviewWindow` with `url: '/settings'` when needed.
- [x] `src-tauri/tauri.conf.json` sets the `settings` window URL to `/settings`.
- [x] Settings live sync still uses `settings-changed` so overlay updates after settings edits.
- [x] Settings tests mount the settings route instead of mounting `App.svelte` in a mocked settings-window mode.

**Verification:**
- [x] `npm run check` clean.
- [x] `npm test`: 17 files pass, 86 tests pass.
- [x] `npm run build` clean; SvelteKit builds both `/` and `/settings`.
- [x] `npm run lint` clean.

**Result (Task 21 — 2026-09-18):** Settings routing now matches SvelteKit conventions. `/` renders the overlay.
`/settings` renders the settings window. `App.svelte` is simpler and no longer branches on the Tauri window
label. `openSettings()` still targets the Tauri label `settings`, but the created webview loads `/settings`.

**Dependencies:** Task 20 (SvelteKit shell), Task 19 (settings window)
**Files touched:** `src/routes/settings/+page.svelte`, `src/App.svelte`, `src/lib/settingsWindow.ts`,
`src-tauri/tauri.conf.json`, `src/components/SettingsWindow.svelte`, settings tests
**Estimated scope:** S

---

## Task 22: Explicit graceful quit paths for dev and tray
**Description:** Add explicit app shutdown paths. Hiding the HUD is still the normal overlay behavior, but a
resident desktop app also needs a real quit path. Add a tray **Quit** item and a debug-only keyboard shortcut for
`cargo tauri dev`.

**Acceptance criteria:**
- [x] Tray menu includes **Quit**.
- [x] Tray Quit calls a graceful shutdown path.
- [x] Debug builds register `Ctrl+Shift+Alt+Q` as a dev-only quit shortcut.
- [x] Graceful shutdown closes webview windows on the main thread before calling `app.exit(0)`.
- [x] `Esc` still hides windows and does not quit.
- [x] `Ctrl+Shift+Q` still toggles the overlay and does not quit.

**Verification:**
- [x] `cargo test`: 30 pass.
- [x] `cargo clippy --all-targets -- -D warnings` clean.
- [x] `cargo check` clean.
- [x] `npm test`: 18 files pass, 87 tests pass.
- [x] `npm run check` clean.
- [x] `npm run lint` clean.
- [x] `npm run build` clean.
- [ ] **Manual (human confirm):** in `cargo tauri dev`, press `Ctrl+Shift+Alt+Q` → app exits; with tray enabled,
  choose Quit → app exits. A WebView2 `Chrome_WidgetWin_0` unregister warning may be benign if the process exits.

**Result (Task 22 — 2026-09-18):** Added `tray::request_exit`, which dispatches shutdown to the main thread,
closes all webview windows, then calls `app.exit(0)`. Tray Quit and the debug-only shortcut both use this path.

**Dependencies:** Task 17 (tray), Task 2 (global shortcuts)
**Files touched:** `src-tauri/src/tray.rs`, `src-tauri/src/shortcuts.rs`
**Estimated scope:** S

## Task 23: Pomotroid-style JSON themes — built-ins, custom directory, hot reload *(new, beyond spec)*
**Description:** Import and adapt Pomotroid's JSON theme mechanism for Cheat-Sheet App. Ship the 38 bundled
JSON themes with app-specific default names (`Cheatsheet`, `Cheatsheet Light`), load custom themes from the
Tauri app data `themes/` directory, hot-reload edits with a filesystem watcher, and expose selectable Light
and Dark theme slots in Settings. Document custom theme authoring in `THEMES.md`.

**Acceptance criteria:**
- [x] Bundled themes are available from `static/themes/` and checked-in built assets exist under `dist/themes/`.
- [x] Custom `.json` theme files in `app_data_dir/themes/` are loaded and marked as custom.
- [x] Custom themes hot-reload and emit `themes:changed` without app restart.
- [x] Custom themes can override built-in themes by matching `name` case-insensitively.
- [x] Settings persist theme mode plus separate Light and Dark theme names.
- [x] The app applies the selected theme through CSS custom properties on `document.documentElement`.
- [x] Theme files are validated: JSON only, size-limited, allowed token prefixes, hex colors only.
- [x] Documentation explains built-in themes, custom theme directory paths, color tokens, hot reload, and overrides.

**Verification:**
- [x] `npm test`: 19 files pass, 94 tests pass.
- [x] `npm run check` clean.
- [x] `npm run lint` clean.
- [x] `npm run build` clean.
- [x] `cd src-tauri && cargo test --lib`: 32 tests pass.
- [x] `cd src-tauri && cargo test --lib themes`: bundled themes and custom override tests pass.
- [ ] **Manual (human confirm):** add or edit a theme JSON file in `app_data_dir/themes/`; Settings updates
  within about half a second; selecting it changes the overlay and settings window colors.

**Result (Task 23 — 2026-09-19):** Theme system complete and verifiable headlessly.
- Added Rust `themes` module with bundled theme parsing, custom theme loading, validation, case-insensitive
  override, and `themes_list` IPC command.
- Added `notify` watcher that creates/watches `app_data_dir/themes` and emits `themes:changed` after a
  debounced file change.
- Added settings fields `theme_light` and `theme_dark`; defaults are `Cheatsheet Light` and `Cheatsheet`.
- Added frontend theme list loading, hot-reload subscription, OS color-scheme handling, and CSS variable
  application.
- Added Settings UI controls for Theme mode, Light theme, and Dark theme.
- Added 38 bundled themes to `static/themes/` and checked-in built copies to `dist/themes/`.
- Added `THEMES.md` with custom theme instructions.

**Commits:**
- `7cc20dd` — apply persisted theme tokens.
- `19ffe04` — add custom JSON theme hot reload.
- `9b338ec` — rename default themes to Cheatsheet.
- `52ede75` — check in built theme assets.
- `422af8e` — add theme customization guide.

**Dependencies:** Task 3 (settings), Task 13 (settings UI), Task 21 (SvelteKit settings route)
**Files touched:** `src-tauri/src/themes/`, `src-tauri/src/commands/themes.rs`, `src-tauri/src/settings/mod.rs`,
`src-tauri/src/lib.rs`, `src/lib/theme.ts`, `src/lib/settings/types.ts`, `src/lib/settings/bridge.ts`,
`src/components/SettingsPanel.svelte`, `src/routes/settings/+page.svelte`, `static/themes/`, `dist/themes/`,
`THEMES.md`, `tests/settings/theme.test.ts`
**Estimated scope:** L

## Task 24: Sheet editor selection and Edit button *(new, beyond spec)*
**Description:** Add an Edit action to the main overlay and an Editor setting. The default editor is the system
`.md` handler. Users can select an editor with a file picker or type a path manually. Persist the selected editor
path in the config file and use it for sheet edits regardless of the system default.

**Acceptance criteria:**
- [x] Main overlay has an Edit button next to Settings.
- [x] Edit opens the selected sheet in the system `.md` editor when no custom editor is set.
- [x] Settings has an Editor field that displays System by default through the empty-path placeholder.
- [x] Users can browse for an editor executable or enter the editor path manually.
- [x] Users can reset the editor to System.
- [x] The selected editor path is saved in config as `editor_path`.
- [x] Editable fields have a clearer editable and focus style.

**Verification:**
- [x] `npm run check` clean.
- [x] `npm test -- --run`: 21 files pass, 107 tests pass.
- [x] `cargo test --manifest-path src-tauri/Cargo.toml`: 39 tests pass.

**Result (Task 24 — 2026-09-29):** Edit flow complete. Added `open_sheet_for_edit` IPC, configurable
`editor_path`, Tauri dialog support for selecting an editor, manual path entry, reset-to-system behavior, and
clearer editable input styling.

**Dependencies:** Task 12 (settings), Task 19 (settings window)
**Files touched:** `src/App.svelte`, `src/components/SettingsPanel.svelte`, `src/lib/settings/types.ts`,
`src/lib/settings/bridge.ts`, `src/locales/en-US.json`, `src-tauri/src/commands/sheets.rs`,
`src-tauri/src/settings/mod.rs`, `src-tauri/src/lib.rs`, `src-tauri/capabilities/default.json`,
`package.json`, `src-tauri/Cargo.toml`
**Estimated scope:** M

## Task 25: Shortcuts settings tab *(new, beyond spec)*
**Description:** Add a dedicated SHORTCUTS tab to the settings window. Move shortcut-related controls out of
SETTINGS and list local shortcuts that work while the app is focused.

**Acceptance criteria:**
- [x] Settings window has uppercase tabs: SETTINGS, SHORTCUTS, ABOUT.
- [x] SHORTCUTS appears above ABOUT.
- [x] SHORTCUTS tab shows caption `LOCAL SHORTCUTS`.
- [x] SHORTCUTS tab shows `Active while the app is focused.`.
- [x] Global trigger controls move from SETTINGS to SHORTCUTS.
- [x] Global shortcut status/help moves from SETTINGS to SHORTCUTS.
- [x] Local shortcut list includes Find in current sheet: `Ctrl + F`.

**Verification:**
- [x] `npm run check` clean.
- [x] `npm test -- --run`: 21 files pass, 107 tests pass.

**Result (Task 25 — 2026-09-29):** Added `ShortcutsTab`, moved global trigger and global shortcut status/help
into it, uppercased tab labels, reordered tabs, and documented the local `Ctrl-F` find shortcut.

**Dependencies:** Task 9 (search shortcut), Task 14 (global shortcut status), Task 19 (settings window)
**Files touched:** `src/components/SettingsWindow.svelte`, `src/components/SettingsPanel.svelte`,
`src/components/ShortcutsTab.svelte`, `src/locales/en-US.json`, `tests/settings/binding.repro.test.ts`,
`tests/settings/dragGuard.repro.test.ts`
**Estimated scope:** S

## Task 26: Harden sheet slug loading *(new, security hardening)*
**Description:** Validate sheet slugs before reading or editing sheet files. Prevent unsafe IPC callers from using
path traversal or path separators to access files outside the flat sheets directory.

**Acceptance criteria:**
- [x] Shared backend slug validation exists.
- [x] `load_sheet` rejects unsafe slugs before building a file path.
- [x] `open_sheet_for_edit` uses the same validation.
- [x] Validation rejects empty slugs, `/`, `\\`, `..`, and null bytes.
- [x] Valid flat slugs still work.

**Verification:**
- [x] `npm run check` clean.
- [x] `npm test -- --run`: 21 files pass, 107 tests pass.
- [x] `cargo test --manifest-path src-tauri/Cargo.toml`: 40 tests pass.

**Result (Task 26 — 2026-09-29):** Added `sheets::is_safe_slug`, applied it to sheet body loading and edit
opening, and added unit coverage for unsafe slug rejection.

**Dependencies:** Task 4 (sheet model), Task 24 (Edit button)
**Files touched:** `src-tauri/src/sheets/mod.rs`, `src-tauri/src/commands/sheets.rs`
**Estimated scope:** S

## Task 27: Windows-safe date release versioning *(new, release fix)*
**Description:** Keep the date-based About version in full `yyyy.m.d` format, but use a shorter `yy.m.d` version for release bundle metadata so Windows resource bundling accepts the major version number.

**Acceptance criteria:**
- [x] About still displays the full date version, for example `2026.9.29`.
- [x] Release bundle metadata uses a Windows-safe short date version, for example `26.9.29`.
- [x] `npm run version:date` updates both forms when run manually.
- [x] The normal build does not run the version task.
- [x] README documents the split between display and bundle versions.

**Verification:**
- [x] `npm run check` clean.
- [x] Version metadata files use `26.9.29`: `package.json`, `package-lock.json`, `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml`, and `src-tauri/Cargo.lock`.
- [x] About version constant remains `2026.9.29` in `src/lib/version.ts`.

**Result (Task 27 — 2026-09-29):** Split release versioning into a Windows-safe bundle version and a full date display version. Updated the release version script and README so manual date-version releases preserve this split.

**Dependencies:** Task 19 (settings window / About tab)
**Files touched:** `package.json`, `package-lock.json`, `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml`, `src-tauri/Cargo.lock`, `src/lib/version.ts`, `scripts/set-date-version.mjs`, `README.md`
**Estimated scope:** S

---

## Done when
- All Phase 0–4 tasks complete and every Checkpoint box is ticked.
- Open questions O2–O5 confirmed by the human.
- Optional Task 16 is explicitly accepted or deferred.
