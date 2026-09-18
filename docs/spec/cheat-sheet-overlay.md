# Spec: Cheat-Sheet Global HUD Overlay (v1)

> Upstream intent: [`../intent/cheat-sheet-overlay.md`](../intent/cheat-sheet-overlay.md) (confirmed, ~95%).
> Status: **Approved** — design baseline for the v1 build (Phase 1 of spec-driven-development).
> Companion artifacts (generated later, in spec order): `../../tasks/plan.md`, `../../tasks/todo.md`.
>
> **Revisions:** *Hotkey constraint revised to **X11-must / Wayland-best-effort-flagged** (was "Wayland must"). This flips the §Hotkey strategy and resolves O1 — it is no longer architecture-blocking.*

  * **Search scope revised (Task 8, 2026-09-06).** Original Task 8 was cross-sheet two-way search (minisearch, NL + combo, golden fixtures). **Redirected to find-in-current-sheet**: NL-only, highlight matches in the sheet currently open in the HUD, no combo matching, no cross-sheet index. The original minisearch two-way search is **deferred**, not deleted from the spec — the spec describes the intended design; Task 8 implements a narrower v1 scope. See `tasks/todo.md` Task 8 for the implementation note. The search index dir (`lib/search`) keeps `comboNormalize.ts` (Task 7) for later use.
  * **Sheet storage folder resolved to `<home>/cheatsheets/` (2026-09-09).** Storage path fixed from the previous `app_data_dir/cheatsheets` to `BaseDirectory::Home/cheatsheets` — a flat, visible folder in the user's home directory, per spec. `src-tauri/src/sheets/mod.rs::sheet_dir` resolves it; `src-tauri/src/seed.rs` seeds it on first run by embedding `src-tauri/bundled/` at compile time (`include_dir!`) and copying every `.md` file when the folder is empty/missing (never overwrites user sheets). New dependency: `include_dir` (Ask-first item per spec).
  * **Frontend shell moved to SvelteKit (2026-09-18).** The frontend is now SvelteKit + Svelte 5. Tauri still serves the built static frontend from `dist`. SvelteKit owns `src/app.html`, `src/routes`, generated types, and CSP hash generation for its boot script. The app runs client-only in the Tauri webview (`ssr = false`, `prerender = true`), uses `@sveltejs/adapter-static`, and no longer uses the old Vite-only root `index.html` or manual `src/main.ts` mount entry.
  * **Settings moved to route-owned page (2026-09-18).** The main route `/` renders the HUD. The settings route `/settings` renders the settings window UI (`src/routes/settings/+page.svelte`). The Tauri window still uses label `settings`, but opens `/settings` via `WebviewWindow`, so `App.svelte` no longer branches on the current window label.

---

## Objective

A global-hotkey **HUD overlay** for Linux that, in one keystroke, surfaces a cheat sheet the user would otherwise have to hunt for. On open it shows a **pinned** sheet front-and-center, a **sidebar** to switch sheets, and a **find-in-current-sheet search** (v1) that highlights matches in the sheet currently open. *(Original v1 design was a two-way search matching either a natural-language description or a literal key combo via a minisearch index — deferred; see §Search scope revision below.)* Sheets load from a **local** folder (`<home>/cheatsheets/`) on launch; on demand the user opens a **cached listing** of all sheets in the online repo and **downloads** any sheet to the local folder. There is **no online viewing** — a sheet is viewed only after it is downloaded. The user can author/edit their own Markdown **locally** via their own editor.

- **User:** general-purpose; primary author is the developer themselves.
- **Why now:** turn "I keep losing track of shortcuts / syntax" into "one key brings it up."
- **Scope (v1):** **Linux first**, **static pinning**, **Markdown**, **Tauri v2 / Rust / SvelteKit (Svelte 5)**. One pinned sheet at a time. No cross-window auto-detection, no contribute-back, no Windows/macOS.

### Acceptance (reframed success criteria)
1. **Toggle overlay (X11 — must).** Press `Ctrl-Shift-Q` → overlay opens **always-on-top**, centered; `Esc` closes it. On **Wayland** the global grab is **best-effort**; if unavailable the UI **flags** it and offers `cheatsheet-app --toggle` (see §Hotkey strategy).
2. **Pinned sheet on open.** The user's pinned sheet renders front-and-center by default; first run falls back to a bundled default.
3. **Switch sheets.** A sidebar lists other sheets; clicking one switches the main pane.
4. **Find-in-current-sheet search.** A single search box highlights matches in the sheet currently open; typing NL text surfaces matches by description. *(v1 scope: NL-only, highlight inline. Original two-way search — NL + combo across all sheets — is deferred.)*
5. **Local sheets on launch.** On launch the app reads `<home>/cheatsheets/` and shows the local sheets; the folder ships with a few **out-of-box** sheets (app-authored, CC0/MIT) so first run isn't empty. **No online viewing** — only local sheets are shown.
6. **Local authoring.** Create/edit a `.md` in `<home>/cheatsheets/` via the user's own editor; it appears after **Rescan** (no in-app editor in v1).
7. **Online listing (cached).** On demand the user opens a listing of all sheets in the online repo; the listing is cached locally (Task 6). **No online viewing** — the listing is browse/download only.
8. **Download from listing (later stage).** The user picks a sheet from the cached listing and downloads it to `<home>/cheatsheets/`. **No online viewing** — a sheet is viewed only after download.
9. **Persistent settings.** Theme (light/dark/follow-system), window size, trigger key, language persist across restarts.
10. **i18n.** UI strings flow through a locale layer; **`en-US` only** in v1; selecting another language is a graceful no-op.
11. **Overlay z-order.** **X11 (must):** the window shows above other windows. **Wayland (best-effort + flagged):** always-on-top / z-order may be limited on some compositors; the UI surfaces which path is active and flags any gap. **Transparency is NOT required in v1** (solid, undecorated window).
12. **No license/secret leakage.** No upstream content is bundled under our name without a license notice; no secrets committed.

---

## Tech Stack

| Concern | Choice | Note |
|---|---|---|
| App shell | **Tauri v2** | Rust backend, system webview |
| Backend | **Rust** (`src-tauri/`) | Commands, hotkey, window, FS, settings, download |
| Frontend | **SvelteKit** + **Svelte 5** | Runes; client-only UI lives in the Tauri webview; static adapter writes to `dist` |
| Global hotkey | `tauri-plugin-global-shortcut` | **X11 must**; X11-only on Linux; Wayland best-effort (see §Hotkey strategy) |
| Cross-instance toggle | `tauri-plugin-single-instance` | `cheatsheet-app --toggle` routes to running app (Wayland best-effort + CLI) |
| Settings | `tauri-plugin-store` → `config/settings.json` | atomic write |
| Markdown render | **`marked`** + **`highlight.js`** | lightweight; alternative `shiki` (deferred, WASM/async) |
| Front-matter | **`gray-matter`** (webview JS) | parses Hexo YAML |
| Search | **`minisearch`** + normalized-combo index *(deferred)* | client-side, no NLP; v1 uses find-in-current-sheet (see §Search scope revision) |
| Front-end test | **Vitest** (unit/integration) | |
| Backend test | **`cargo test`** | |
| E2E *(optional v1)* | **Playwright** | only for overlay open/close if time allows |

---

## Commands

```
Dev (app):        cargo tauri dev
Build (app):      cargo tauri build
Frontend only:    npm run dev             # SvelteKit/Vite dev server
Build frontend:   npm run build           # SvelteKit static build to dist/
Frontend test:    npm test -- --coverage
Backend test:     cargo test
Lint frontend:    npm run lint            # eslint + prettier
Lint backend:     cargo clippy -- -D warnings
CLI toggle:       cargo tauri dev -- --toggle       # or the built binary: cheatsheet-app --toggle
Dev quit:         Ctrl+Shift+Alt+Q                   # debug builds only; graceful shutdown path
```

> Build/test commands assume the scaffold created in Phase 2. The SvelteKit/Vite dev port defaults to Tauri's `1420`.

---

## Project Structure

```
cheat-sheet-app/
├─ src-tauri/                  → Rust backend (Tauri v2)
│   ├─ src/{main.rs,lib.rs}    → entry, plugin wiring, command handlers, arg parsing (--toggle)
│   ├─ src/commands/           → IPC commands (overlay, sheets, settings, download)
│   ├─ src/settings/           → settings load/save (atomic JSON)
│   ├─ src/sheets/             → dir scan, contents-API listing + cache, local-folder resolution
│   ├─ src/shortcuts.rs        → X11 registration + session detect + Wayland CLI toggle wiring
│   ├─ Cargo.toml, tauri.conf.json, build.rs, permissions
├─ src/                        → SvelteKit + Svelte 5 frontend (runes)
│   ├─ app.html                → SvelteKit document shell; CSP is generated from SvelteKit config
│   ├─ routes/                 → SvelteKit routes (`/` overlay, `/settings` settings window)
│   │   ├─ +layout.ts          → client-only Tauri mode (`ssr=false`, `prerender=true`)
│   │   ├─ +page.svelte        → renders the HUD overlay
│   │   └─ settings/+page.svelte → renders the settings window UI
│   ├─ App.svelte              → overlay shell + routing of panes
│   ├─ components/             → Overlay, Sidebar, SheetView, SearchBox, SettingsPanel
│   ├─ lib/
│   │   ├─ sheets/             → load/parse (gray-matter)
│   │   ├─ search/            → combo normalizer (v1) + find-in-current-sheet; minisearch index builder (deferred)
│   │   ├─ markdown/         → marked+highlight.js render + sanitize
│   │   ├─ settings/        → typed settings + tauri-plugin-store bridge
│   │   ├─ overlay/         → show/hide/toggle + Esc handling
│   │   └─ i18n/           → t(key) + locale loader (en-US)
│   ├─ locales/{en-US.json}   → v1 only
│   └─ styles/               → theme tokens (light/dark)
├─ public/                     → static assets (icons, css)
├─ tests/                      → Vitest units (find-in-current-sheet golden set); two-way search fixtures deferred
├─ e2e/                        → optional Playwright (overlay open/close)
├─ docs/{intent,spec}/        → intent + this spec
└─ tasks/                      → plan.md, todo.md
```

**Storage:**
- `<home>/cheatsheets/` → the user's sheets folder (default read location), where `<home>` is the user's home directory (`C:\Users\<user>` on Windows, `/home/<user>` on Linux). On Linux this folder is **not** hidden (no leading dot). The folder is **flat**: every sheet lives directly in it. On first run the app seeds this folder with a few **out-of-box** sheets (app-authored, CC0/MIT, see D1).
  - **Implementation (v1.0).** The folder is resolved as `BaseDirectory::Home/cheatsheets` (see `src-tauri/src/sheets/mod.rs::sheet_dir`). The default is populated by `src-tauri/src/seed.rs`, which embeds the sheets in `src-tauri/bundled/` at compile time (`include_dir!`) and copies every `.md` file into the folder on first run. Seeding runs **only** when the folder is empty or missing, so a user's own sheets are never overwritten. Drop a new `.md` into `src-tauri/bundled/` and rebuild to add a sheet; note the bundled folder is compiled into the binary, so it does not ship at runtime (see `src-tauri/Cargo.toml` — `include_dir` dependency).
- `app_config_dir/settings.json` → user settings (atomic write).
- `app_config_dir/index.cache` → built search index (optional, regenerated on Rescan).
- The online listing is cached locally (Task 6).
- The default location is `<home>/cheatsheets/` until a new location is selected in settings (a later task).

---

## Code Style

TypeScript (no implicit any), Svelte 5 runes, 2-space indent, single quotes, semicolons. Components use `$state`/`$props`/`$derived`. Backend `clippy` pedantic-clean.

```svelte
<!-- lib/search/comboNormalize.ts -->
const ALIAS = { win: "WIN", windows: "WIN", super: "WIN", mod: "WIN", cmd: "WIN" /* Linux→Super */,
  alt: "ALT", option: "ALT", "⌥": "ALT", ctrl: "CTRL", control: "CTRL", "⌃": "CTRL",
  shift: "SHIFT", "⇧": "SHIFT" } as const;

/** "Win+Alt+V" / "Control Shift V" → ["WIN","ALT","V"] */
export function normalizeCombo(input: string): string[] {
  return input.split(/\s*[\s+]+\s*/)
     .map((tok) => (ALIAS[tok.toLowerCase()] ?? tok.toUpperCase()))
     .filter(Boolean);
}
```

---

## Testing Strategy

- **Level-by-concern (Vitest):** combo normalizer, find-in-current-sheet (golden fixture set, deterministic), front-matter parsing, settings round-trip.
- **Backend (`cargo test`):** dir scan, contents-API listing + cache (mock), settings atomic persistence, arg parsing (`--toggle`).
- **Integration:** find-in-current-sheet golden set — fixtures of NL queries returning expected highlights; two-way search fixtures (combo-only, mixed) deferred.
- **Manual/optional E2E (Playwright):** overlay open/close + pin-on-open on the dev machine (X11, the must path).
- **Coverage:** kept **modest** for v1 (early stage); require >80% on `lib/search` and `lib/sheets`, lower elsewhere. No coverage gate on UI chrome.

---

## Boundaries

**Always do:**
- Treat **upstream + user Markdown as untrusted input** — sanitize before rendering into the JS webview (XSS surface). Keep SvelteKit CSP and Tauri CSP aligned; SvelteKit generates the hash for its inline boot script. Route-specific windows must use explicit SvelteKit routes (for example `/settings`) instead of branching UI by Tauri window label. Render Markdown→HTML via `marked`+sanitizer, **never** raw `dangerouslySetInnerHTML`; prefer an isolated render surface.
- Validate/search-input escape before use; persist settings with an atomic write; run tests before commit; follow the naming above.

**Ask first:**
- Changing the source repo/URL, **adding a dependency** (not in the stack table), changing storage dirs, altering GPL handling, or changing the local-sheet schema → confirm before doing.

**Never do:**
- Commit secrets/credentials; edit `node_modules/`/vendor; delete or rewrite a failing test without approval; **bundle GPL content under our name without a license notice**; strip license/NOTICE files.

---

## Data sources & schema

**Source of truth:** `https://github.com/Fechin/reference`, branch `main`, dir `source/_posts/` (~215 `.md` sheets), **GPL-v3** licensed, Hexo front-matter.

- **Online list:** GitHub contents API `GET /repos/Fechin/reference/contents/source/_posts?ref=main&per_page=100` (paginated) — builds the cached online listing (Task 6).
- **Online read (download only):** `GET https://raw.githubusercontent.com/Fechin/reference/main/source/_posts/<slug>.md` (confirmed `200`/`text/plain`) — used **only** to fetch a file for downloading to `<home>/cheatsheets/` (later stage). **Never for online viewing.**

**Out-of-box sheets:** a few app-authored (CC0/MIT) sheets bundled with the app and seeded into `<home>/cheatsheets/` on first run (D1).

**Listing cache:** the contents-API listing cached locally so the online browse surface works offline (Task 6).

**Sheet front-matter (read the upstream schema, don't invent one):**
```yaml
title: 1Password             # identity / NL side
date: 2022-11-23 ...
tags: [tools]               # NL side
categories: [Keyboard Shortcuts]    # NL side
intro: |                    # NL side (also one-line form)
  A cheat sheet for 1password's keyboard shortcuts ...
```
Body carries the **combo/syntax side**: `| `Ctrl+Shift+V` | Paste plain text |` tables (backticked key tokens) and ```` ``` ```` code fences. Upstream uses Tailwind class tokens and pandoc `{.shortcuts}` divs — **ignored**; we render standard Markdown.

**Two-way search index** (single input matches either side): *(deferred — v1 uses find-in-current-sheet)*
- *NL side:* `title`, `intro`, `tags`, `categories` (+ body headings).
- *Combo/syntax side:* backticked key tokens in the body, **normalized** (`normalizeCombo`) + code tokens.
- Match: exact-field > substring > fuzzy. Same query box services both directions → "two-way" by construction.

**Combo normalization (v1, approximate):** alias map Win/Windows/Super/Mod/`cmd`→`WIN` (on Linux maps to Super), Option/Alt/`⌥`→`ALT`, Control/Ctrl/`⌃`→`CTRL`, Shift/`⇧`→`SHIFT`; `+`/space separators; letters/digits as-is. **No per-platform remap of authored combos in v1** (e.g. a Mac sheet showing `cmd` is displayed as-authored).

---

## Hotkey strategy: X11 (must) vs Wayland (best-effort + flagged)   (validate X11 FIRST)

Tauri's `global-shortcut` plugin uses the `global-hotkey` crate, which is **X11-only on Linux**. An unprivileged app **cannot** register an arbitrary global key combo on **Wayland** (compositor security model). v1 constraint: **X11 must work; Wayland is best-effort and flagged, not required.** Design:

- **X11 (must):** register `Ctrl-Shift-Q` via `tauri-plugin-global-shortcut` — a real global grab. **This is the supported path and the load-bearing requirement; it must be validated in the first spike (Plan Phase 1) on the target X11 session.**
- **Wayland (best-effort + flagged):** at startup, detect session type (`$XDG_SESSION_TYPE`) and whether the global registration actually fired. If it cannot bind on Wayland, the UI **flags** "Global hotkey unavailable on this compositor" and offers a best-effort toggle — `cheatsheet-app --toggle` (via `tauri-plugin-single-instance`, so a 2nd invocation routes to the running instance) — with per-compositor bind snippets shipped:
   - **Hyprland:** `bind = SUPER, SHIFT, Q, exec, cheatsheet-app --toggle`
   - **Sway:** `bindsym $mod+Shift+q exec cheatsheet-app --toggle`
   - **GNOME:** *Settings → Keyboard → Custom Shortcuts* → run `cheatsheet-app --toggle`

Neither path fails silently: if the active path is unavailable, the UI says so. See Open Question **O1** *(resolved)*.

**Shutdown paths:** `Esc` and the overlay hotkey hide/toggle windows; they do not quit the resident app. A tray **Quit** menu item calls the graceful shutdown path. Debug builds also register `Ctrl+Shift+Alt+Q` as a development-only graceful quit shortcut for `cargo tauri dev`.

---

## Decisions (recommended defaults — confirm or override)

- **D1 — License / defaults.** Don't bundle GPL upstream sheets as first-party defaults. Ship a small **app-authored** default set (app license **Apache-2.0**; default sheets **CC0/MIT**) so first-run isn't empty without GPL entanglement. Upstream sheets stay fetched/downloaded and show a `GPL-v3` notice.
- **D2 — Listing + cache (download deferred).** The online listing = GitHub contents API cached locally (Task 6). **Per-file download to `<home>/cheatsheets/` is deferred to a later stage** (not part of v1 Task 6). Online *read* (`raw`) is used only to fetch a file for downloading — never for online viewing.
- **D3 — Window.** v1 = **solid, undecorated, always-on-top**, small + centered. Transparency/blur **deferred** (reduces Wayland risk). Adds **runtime session-type detection** (`$XDG_SESSION_TYPE`) to drive the Wayland "best-effort + flagged" behavior.
- **D4 — Render/libs.** `marked` + `highlight.js` (defer `shiki`).
- **D5 — Search.** `minisearch` + normalized-combo index; **no** NLP/embeddings. *(v1 implementation is find-in-current-sheet: NL-only, highlight matches in the open sheet. The minisearch two-way index is deferred — see §Search scope revision.)*
- **D6 — Authoring.** Re-scan local dir on open + on explicit **Rescan**; open the folder in the user's editor (`open`/`xdg-open`). No in-app editor.

---

## Open Questions (need human sign-off to advance to Plan)

1. **O1 — RESOLVED.** Hotkey constraint revised to **X11-must / Wayland-best-effort-flagged**: the X11 `global-shortcut` path is the must; the Wayland `--toggle` + compositor-bind path is best-effort and surfaced via a UI flag (see §Hotkey strategy). No longer blocks architecture.
2. **O2 — i18n locale layer.** Tiny hand-rolled `$: t()` over `locales/en-US.json` vs `svelte-i18n` dep? *(Recommend: hand-rolled; add `svelte-i18n` later if needed.)*
3. **O3 — Trigger-key change surface.** Changing the trigger key in v1 edits the app config only; on Wayland the user must also re-bind the compositor. Document, not auto-configure? *(Recommend: document + print the snippet on change.)*
4. **O4 — E2E scope.** Include Playwright overlay open/close in v1, or manual-only? *(Recommend: manual-only for v1, Playwright optional.)*
5. **O5 — Spec location.** `docs/spec/cheat-sheet-overlay.md` (here). OK?

---

## Verification (Phase-1 exit criteria)

- [ ] All six core areas present (Objective/Commands/Structure/Style/Testing/Boundaries).
- [ ] Acceptance criteria concrete & testable.
- [ ] Boundaries (Always / Ask / Never) defined.
- [ ] Hotkey strategy locked: **X11 must** (`global-shortcut` validated), **Wayland best-effort + flagged** (O1 resolved).
- [ ] D1–D6 defaults confirmed or overridden.
- [ ] Spec saved in-repo (`docs/spec/`).
- [ ] No capability map needed — single cohesive v1 app confirmed (Q1).
