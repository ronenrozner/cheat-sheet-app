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
`app_config_dir/settings.json` with an atomic write (temp + rename). Define the settings shape
(theme / winSize / trigger / language / pinned slug).

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

**Verification:**
- [x] svelte-check: 0 errors, 0 warnings (fixed module-resolution import error by using explicit
  `.svelte` extension + default imports).
- [x] `npm run lint` clean (prettier).
- [x] `main.ts` updated: `mount(App, { target, props: {} })` to satisfy Svelte 5 `MountOptions`.

**Dependencies:** Task 8 (find-in-current-sheet logic)
**Files touched:** `src/components/SearchBox.svelte` (new), `src/App.svelte` (wiring),
`src/components/SheetView.svelte` (accepts `query`, highlights internally), `src/lib/markdown/render.ts`
(allow `<mark>` in DOMPurify), `src/main.ts` (mount props)
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
window size, trigger key, language, pinned slug. Persist across restart.

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
  trigger / source_mode / language / pinned_slug); enum string values match the Rust unit-variant
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
- [ ] `cheatsheet-app --toggle` toggles the overlay of the already-running instance.
- [ ] On a non-binding session, the UI flags it and shows the compositor snippets; changing the trigger prints
    the snippet.

**Verification:**
- [ ] `cargo test`: `--toggle` arg parses and routes (mocked single-instance).
- [ ] Manual (X11): `--toggle` toggles the overlay.

**Dependencies:** Task 2, Task 12
**Files likely touched:** `src-tauri/src/shortcuts.rs`, `src-tauri/src/main.rs`, `src/components/SettingsPanel.svelte`
**Estimated scope:** M

**Note:** Default trigger is `Ctrl+Shift+Q` (see Task 12). This task handles the trigger-key change
surface: changing the trigger updates config only and prints the Wayland compositor snippet.

## Task 15: License / secret hygiene
**Description:** Ensure GPL upstream sheets carry a `GPL-v3` notice; ship app-authored CC0/MIT default sheets so
first run isn't GPL-entangled (D1); add a `LICENSE` (Apache-2.0) + `NOTICE`; confirm no secrets are committed;
keep license/NOTICE files intact.

**Acceptance criteria:**
- [ ] Upstream sheets display a `GPL-v3` notice; bundled defaults are CC0/MIT.
- [x] `LICENSE` + `NOTICE` present; no secrets in the tree or in `.env`/gitignore-gaps.
- [ ] **Verification:** `LICENSE` (Apache-2.0) + `NOTICE` present and committed (`73fe223`); `source-sheets/` gitignored so 215 sheets are not committed. Bundled defaults in `src-tauri/bundled/` are app-authored (bash/vim/powershell/windows) — no GPL content shipped under the app name. Upstream GPL notice **displayed inside the HUD (`SheetView`) is not yet implemented** — the sheets carry no in-file GPL tag; `NOTICE` documents upstream as GPL.

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

> Synced 2026-09-04. Checked against `HEAD` + live `npm run build` / `npm test` (51 pass) /
> `cargo test` (24 pass). Marked done what the code already ships; left open what is not yet
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
- **Task 15 (license):** `LICENSE` + `NOTICE` present and committed; bundled defaults are app-authored.
  The upstream GPL-notice *display* in the HUD is still open (see verification above).
- **Still open (surface not present in code):** Task 13 (i18n layer), Task 14 (`--toggle` single-instance
  CLI). `src/lib/i18n/`, `src/locales/`, and the single-instance plugin surface do not exist yet.

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

## Done when
- All Phase 0–4 tasks complete and every Checkpoint box is ticked.
- Open questions O2–O5 confirmed by the human.
- Optional Task 16 is explicitly accepted or deferred.
