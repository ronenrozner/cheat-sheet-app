# Implementation Plan: Cheat-Sheet Global HUD Overlay (v1)

> Source spec: [`../docs/spec/cheat-sheet-overlay.md`](../docs/spec/cheat-sheet-overlay.md)
> Upstream intent: [`../docs/intent/cheat-sheet-overlay.md`](../docs/intent/cheat-sheet-overlay.md)
> Task list: [`./todo.md`](./todo.md)

## Overview

Build a Linux-first global-hotkey **HUD overlay** (Tauri v2 / Rust backend / Svelte 5 frontend) that, on one
keystroke (`Ctrl-Shift-Q` default), shows a pinned cheat sheet front-and-center, a sidebar to switch sheets,
and a two-way search (natural-language *or* literal key combo). Sheets stream online, render from a local
snapshot, or both, via a source toggle. Users author/edit Markdown locally. This plan decomposes the v1 spec
into small, verifiable, vertically-sliced tasks with explicit acceptance criteria and checkpoints.

## Architecture Decisions

- **A1 — Spike the hotkey/overlay first, platform-aware.** Per spec §Hotkey strategy, the load-bearing
  risk is `global-shortcut` + always-on-top overlay behavior under Tauri. The **must-path is
  platform-dependent**: on the current Windows dev box it is `RegisterHotKey`; on Linux it is the X11
  global grab (Wayland is best-effort + flagged). Validate the active-platform must-path in the very
  first checkpoint before building feature surface on top of it.
- **A2 — Vertical slices, not horizontal layers.** Each task delivers a working, testable feature path
  (parse + render + a UI surface + a test), so the app is in a runnable state after each slice.
- **A3 — Treat all Markdown as untrusted (XSS).** Upstream (GPL) and user-authored sheets render into the JS
  webview; render Markdown→HTML via `marked` + sanitizer, never raw `innerHTML`, keep Tauri's restrictive
  CSP, prefer an isolated render surface (iframe / sandbox). This is an "Always do" boundary.
- **A4 — License hygiene (D1).** Ship a small **app-authored** default set (app = **Apache-2.0**, default
  sheets **CC0/MIT**) so first-run is non-empty without GPL entanglement. Upstream GPL sheets are
  fetched/downloaded and always carry a `GPL-v3` notice. No upstream content is bundled under our name.
- **A5 — Two-tier storage (D2).** Upstream snapshot = **tarball** extract (one call, no per-file
  rate-limiting). Online *listing* = GitHub contents API (cached). Local authored sheets re-scanned on open +
  on explicit **Rescan**.
- **A6 — Open-question defaults assumed** (confirm or override): **O2** hand-rolled `$: t()` over
  `locales/en-US.json` (no `svelte-i18n` dep); **O3** trigger-key change edits config only + prints the
  compositor snippet on Wayland (document, not auto-configure); **O4** E2E is manual-only in v1 (Playwright
  optional); **O5** spec lives at `docs/spec/cheat-sheet-overlay.md` (done).
- **A7 — i18n scaffolded from the start, `en-US` only.** All UI strings route through a locale layer;
  `en-US` is the only implemented locale; selecting another language is a graceful no-op.
- **A8 — No new dependencies beyond the spec's stack table.** Adding one is an "Ask first" boundary.

## Task List

### Phase 0 — Spike & Scaffold (high-risk, fail fast)
- [x] Task 1: Repo scaffold + Tauri v2 / Svelte 5 / Vite + git init (done 2026-08-28, commit a0d6767)
- [ ] Task 2: global-hotkey + always-on-top overlay open/close spike (platform-aware; Linux session type detect)  ← **risk gate**

### Checkpoint: Spike
- [ ] `cargo test` empty-but-clean; `npm run build` succeeds
- [ ] **Manual: `Ctrl-Shift-Q` opens the overlay always-on-top centered; `Esc` closes it on the active
     platform must-path (Windows on the dev box; X11 when on Linux).**
- [ ] Human confirms the active-platform must-path works before proceeding

### Phase 1 — Content Pipeline (sheets flow end-to-end)
- [ ] Task 3: Rust settings load/save (atomic JSON via `tauri-plugin-store`)
- [ ] Task 4: Sheet model + front-matter parse + dir scan (Rust) → list IPC
- [ ] Task 5: Markdown render (marked + highlight.js + sanitize) in webview + SheetView
- [ ] Task 6: Upstream tarball download + extract + contents-API listing/cache

### Checkpoint: Content Pipeline
- [ ] `cargo test` + `npm test` pass; local dir list + upstream snapshot render in a basic pane
- [ ] **Manual: a downloaded upstream sheet renders sanitized HTML; a local .md renders after Rescan**

### Phase 2 — Two-Way Search
- [ ] Task 7: Combo normalizer (`lib/search/comboNormalize`) + unit tests
- [ ] Task 8: minisearch index builder (NL + normalized-combo) + two-way query + golden fixtures
- [ ] Task 9: SearchBox component wired into overlay; results switch the main pane

### Checkpoint: Search
- [ ] Golden tests pass at >80% coverage on `lib/search`
- [ ] **Manual: `Win+Alt+V` and "windows paste plain text" both surface the same sheet**

### Phase 3 — Overlay UI + Sources
- [ ] Task 10: App shell / overlay pane routing + Sidebar (list + switch)
- [ ] Task 11: Source-mode toggle (online / local / both) + first-run auto-download
- [ ] Task 12: Pinned sheet on open (first-run falls back to bundled default)

### Checkpoint: Overlay UI
- [ ] `npm run build` + `cargo test` pass
- [ ] **Manual: open shows pinned sheet; sidebar switches; source toggle filters visible sheets**

### Phase 4 — Settings, i18n, Hotkey CLI, License
- [ ] Task 13: Persistent settings round-trip (theme / size / trigger / source / language)
- [ ] Task 14: i18n `$: t()` layer + `locales/en-US.json` + graceful no-op for unknown locale
- [ ] Task 15: `--toggle` single-instance CLI route + Wayland flag + compositor-bind snippets
- [ ] Task 16: License/secret hygiene (GPL notice, app-authored defaults, license NOTICE, no secret commit)

### Checkpoint: Complete
- [ ] All spec acceptance criteria 1–10 met
- [ ] `npm test -- --coverage`, `cargo test`, `npm run lint`, `cargo clippy -- -D warnings` all clean
- [ ] **Manual: full happy path — hotkey → pinned sheet → search either direction → switch source → author
      local sheet → Rescan → it appears; restart keeps settings**
- [ ] Human review before any PR / ship

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Global hotkey / overlay fails or behaves oddly under Tauri | High (load-bearing) | Task 2 spikes it **first** and is **platform-aware**; gate on manual validation of the active-platform must-path (Windows `RegisterHotKey` on the dev box; X11 on Linux) before building UI |
| Wayland blocks global grab | Med | Best-effort + flagged; `--toggle` CLI + per-compositor snippets (Task 15); do not expand v1 scope |
| XSS from untrusted Markdown into webview | High | Sanitize + CSP + isolated render surface (A3); golden + manual checks; "Never raw dangerouslySetInnerHTML" |
| GPL upstream entanglement on first run | Med | App-authored CC0/MIT defaults (D1); GPL notice on upstream sheets (Task 16) |
| Two-way search misses a direction | Med | Golden fixture set (NL-only / combo-only / mixed); >80% coverage on `lib/search` |
| Rate-limiting / flaky upstream download | Low | Tarball extract (one call) + cache; source-mode toggle falls back to local |
| New dependency scope creep | Low | Stack table is the allow-list; adding a dep is "Ask first" |

## Open Questions (carried from spec — confirm or override; plan assumes the recommendations)

- **O1 — RESOLVED.** X11 must / Wayland best-effort-flagged.
- **O2 — i18n layer.** *Assumed:* hand-rolled `$: t()` over `locales/en-US.json` (no dep). Confirm.
- **O3 — Trigger-key change surface.** *Assumed:* edits config only; on Wayland prints the compositor snippet,
  does not auto-bind. Confirm.
- **O4 — E2E scope.** *Assumed:* manual-only in v1; Playwright optional (Task 17, not blocking). Confirm.
- **O5 — Spec location.** *Assumed:* `docs/spec/cheat-sheet-overlay.md` (already in place). Confirm.

## Assumptions / Notes

- **Task list target:** default checklist `tasks/todo.md` (no external tracker configured; no project-root
  AGENTS.md/CLAUDE.md overrides it).
- **No git repo yet** — Task 1 performs `git init`.
- **Toolchain present:** Node v26.3.1, cargo 1.98.0. `tauri` CLI not yet installed — Task 1 installs the
  Tauri CLI (via `cargo`/npm as the scaffold decides).
- **E2E (Playwright)** is an optional, non-blocking Task 17 appended after the Complete checkpoint.
- Every "Ask first" boundary in the spec (source repo/URL, new dependency, storage dirs, GPL handling,
  local-sheet schema) must be confirmed before that change lands in a task.
