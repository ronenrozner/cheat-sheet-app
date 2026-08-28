# Spec: Cheat-Sheet Global HUD Overlay (v1)

> Upstream intent: [`../intent/cheat-sheet-overlay.md`](../intent/cheat-sheet-overlay.md) (confirmed, ~95%).
> Status: **Draft for human review** — Phase 1 of spec-driven-development. Not approved yet.
> Companion artifacts (generated later, in spec order): `../../tasks/plan.md`, `../../tasks/todo.md`.
>
> **Revisions:** *Hotkey constraint revised to **X11-must / Wayland-best-effort-flagged** (was "Wayland must"). This flips the §Hotkey strategy and resolves O1 — it is no longer architecture-blocking.*

---

## Objective

A global-hotkey **HUD overlay** for Linux that, in one keystroke, surfaces a cheat sheet the user would otherwise have to hunt for. On open it shows a **pinned** sheet front-and-center, a **sidebar** to switch sheets, and a **two-way search** that matches *either* a natural-language description ("Windows paste plain text") *or* a literal key combo (`Ctrl+Shift+V`). Sheets stream **online**, render from a **local** snapshot, or both, via a toggle. The user can author/edit their own Markdown **locally** via their own editor.

- **User:** general-purpose; primary author is the developer themselves.
- **Why now:** turn "I keep losing track of shortcuts / syntax" into "one key brings it up."
- **Scope (v1):** **Linux first**, **static pinning**, **Markdown**, **Tauri v2 / Rust / Svelte 5**. One pinned sheet at a time. No cross-window auto-detection, no contribute-back, no Windows/macOS.

### Acceptance (reframed success criteria)
1. **Toggle overlay (X11 — must).** Press `Ctrl-Shift-Q` → overlay opens **always-on-top**, centered; `Esc` closes it. On **Wayland** the global grab is **best-effort**; if unavailable the UI **flags** it and offers `cheatsheet-app --toggle` (see §Hotkey strategy).
2. **Pinned sheet on open.** The user's pinned sheet renders front-and-center by default; first run falls back to a bundled default.
3. **Switch sheets.** A sidebar lists other sheets; clicking one switches the main pane.
4. **Two-way search.** A single search box surfaces matches by *both* NL description and literal combo; typing either direction works. *(verified by golden tests on a fixtures set)*
5. **Source toggle.** `online` / `local` / `both` switches which sheets are visible; **first run auto-downloads a local snapshot.**
6. **Local authoring.** Create/edit a `.md` in the local folder via the user's own editor; it appears after **Rescan** (no in-app editor in v1).
7. **Persistent settings.** Theme (light/dark/follow-system), window size, trigger key, source mode, language persist across restarts.
8. **i18n.** UI strings flow through a locale layer; **`en-US` only** in v1; selecting another language is a graceful no-op.
9. **Overlay z-order.** **X11 (must):** the window shows above other windows. **Wayland (best-effort + flagged):** always-on-top / z-order may be limited on some compositors; the UI surfaces which path is active and flags any gap. **Transparency is NOT required in v1** (solid, undecorated window).
10. **No license/secret leakage.** No upstream content is bundled under our name without a license notice; no secrets committed.

---

## Tech Stack

| Concern | Choice | Note |
|---|---|---|
| App shell | **Tauri v2** | Rust backend, system webview |
| Backend | **Rust** (`src-tauri/`) | Commands, hotkey, window, FS, settings, download |
| Frontend | **Svelte 5** + **Vite** | Runes; UI lives in the webview |
| Global hotkey | `tauri-plugin-global-shortcut` | **X11 must**; X11-only on Linux; Wayland best-effort (see §Hotkey strategy) |
| Cross-instance toggle | `tauri-plugin-single-instance` | `cheatsheet-app --toggle` routes to running app (Wayland best-effort + CLI) |
| Settings | `tauri-plugin-store` → `config/settings.json` | atomic write |
| Markdown render | **`marked`** + **`highlight.js`** | lightweight; alternative `shiki` (deferred, WASM/async) |
| Front-matter | **`gray-matter`** (webview JS) | parses Hexo YAML |
| Search | **`minisearch`** + normalized-combo index | client-side, no NLP |
| Front-end test | **Vitest** (unit/integration) | |
| Backend test | **`cargo test`** | |
| E2E *(optional v1)* | **Playwright** | only for overlay open/close if time allows |

---

## Commands

```
Dev (app):        cargo tauri dev
Build (app):      cargo tauri build
Frontend only:    npm run dev             # Vite dev server
Build frontend:   npm run build
Frontend test:    npm test -- --coverage
Backend test:     cargo test
Lint frontend:    npm run lint            # eslint + prettier
Lint backend:     cargo clippy -- -D warnings
CLI toggle:       cargo tauri dev -- --toggle       # or the built binary: cheatsheet-app --toggle
```

> Build/test commands assume the scaffold created in Phase 2. Vite dev port defaults to Tauri's `1420`.

---

## Project Structure

```
cheat-sheet-app/
├─ src-tauri/                  → Rust backend (Tauri v2)
│   ├─ src/{main.rs,lib.rs}    → entry, plugin wiring, command handlers, arg parsing (--toggle)
│   ├─ src/commands/           → IPC commands (overlay, sheets, settings, download)
│   ├─ src/settings/           → settings load/save (atomic JSON)
│   ├─ src/sheets/             → dir scan, tarball download+extract, source-mode resolution
│   ├─ src/shortcuts.rs        → X11 registration + session detect + Wayland CLI toggle wiring
│   ├─ Cargo.toml, tauri.conf.json, build.rs, permissions
├─ src/                        → Svelte 5 frontend (runes)
│   ├─ App.svelte              → overlay shell + routing of panes
│   ├─ components/             → Overlay, Sidebar, SheetView, SearchBox, SettingsPanel
│   ├─ lib/
│   │   ├─ sheets/             → load/parse (gray-matter), source-mode filter
│   │   ├─ search/            → minisearch index builder + combo normalizer
│   │   ├─ markdown/         → marked+highlight.js render + sanitize
│   │   ├─ settings/        → typed settings + tauri-plugin-store bridge
│   │   ├─ overlay/         → show/hide/toggle + Esc handling
│   │   └─ i18n/           → t(key) + locale loader (en-US)
│   ├─ locales/{en-US.json}   → v1 only
│   └─ styles/               → theme tokens (light/dark)
├─ public/                     → static assets (icons, css)
├─ tests/                      → Vitest units + fixtures (two-way search golden set)
├─ e2e/                        → optional Playwright (overlay open/close)
├─ docs/{intent,spec}/        → intent + this spec
└─ tasks/                      → plan.md, todo.md
```

**Storage (Tauri dirs):**
- `app_data_dir/cheatsheets/upstream/` → local snapshot downloaded from the source repo.
- `app_data_dir/cheatsheets/local/` → user-authored/edited sheets (re-scanned).
- `app_config_dir/settings.json` → user settings (atomic write).
- `app_config_dir/index.cache` → built search index (optional, regenerated on Rescan).

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

- **Level-by-concern (Vitest):** combo normalizer & two-way search (golden fixture set, deterministic), front-matter parsing, source-mode filtering, settings round-trip.
- **Backend (`cargo test`):** dir scan, tarball download+extract (mock), settings atomic persistence, arg parsing (`--toggle`).
- **Integration:** two-way search golden set — fixtures of NL-only, combo-only, and mixed queries returning expected slugs.
- **Manual/optional E2E (Playwright):** overlay open/close + pin-on-open on the dev machine (X11, the must path).
- **Coverage:** kept **modest** for v1 (early stage); require >80% on `lib/search` and `lib/sheets`, lower elsewhere. No coverage gate on UI chrome.

---

## Boundaries

**Always do:**
- Treat **upstream + user Markdown as untrusted input** — sanitize before rendering into the JS webview (XSS surface). Keep Tauri's restrictive CSP; render Markdown→HTML via `marked`+sanitizer, **never** raw `dangerouslySetInnerHTML`; prefer an isolated render surface.
- Validate/search-input escape before use; persist settings with an atomic write; run tests before commit; follow the naming above.

**Ask first:**
- Changing the source repo/URL, **adding a dependency** (not in the stack table), changing storage dirs, altering GPL handling, or changing the local-sheet schema → confirm before doing.

**Never do:**
- Commit secrets/credentials; edit `node_modules/`/vendor; delete or rewrite a failing test without approval; **bundle GPL content under our name without a license notice**; strip license/NOTICE files.

---

## Data sources & schema

**Source of truth:** `https://github.com/Fechin/reference`, branch `main`, dir `source/_posts/` (~215 `.md` sheets), **GPL-v3** licensed, Hexo front-matter.

- **Online read:** `GET https://raw.githubusercontent.com/Fechin/reference/main/source/_posts/<slug>.md` (confirmed `200`/`text/plain`).
- **Online list:** GitHub contents API `GET /repos/Fechin/reference/contents/source/_posts?ref=main&per_page=100` (paginated) — used for online *listing*; cached locally.
- **Local snapshot (download):** `GET /repos/Fechin/reference/tarball/main` → extract `*/source/_posts/*.md` into `…/cheatsheets/upstream/`.
- **Source mode:** `online` | `local` | `both` (settings); first run auto-triggers a snapshot download.

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

**Two-way search index** (single input matches either side):
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

---

## Decisions (recommended defaults — confirm or override)

- **D1 — License / defaults.** Don't bundle GPL upstream sheets as first-party defaults. Ship a small **app-authored** default set (app license **Apache-2.0**; default sheets **CC0/MIT**) so first-run isn't empty without GPL entanglement. Upstream sheets stay fetched/downloaded and show a `GPL-v3` notice.
- **D2 — Download mechanism.** Local snapshot = **tarball** extract (one call, no per-file rate-limit); online *listing* = contents API (cached) / on-demand per-file `raw` fetch.
- **D3 — Window.** v1 = **solid, undecorated, always-on-top**, small + centered. Transparency/blur **deferred** (reduces Wayland risk). Adds **runtime session-type detection** (`$XDG_SESSION_TYPE`) to drive the Wayland "best-effort + flagged" behavior.
- **D4 — Render/libs.** `marked` + `highlight.js` (defer `shiki`).
- **D5 — Search.** `minisearch` + normalized-combo index; **no** NLP/embeddings.
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
