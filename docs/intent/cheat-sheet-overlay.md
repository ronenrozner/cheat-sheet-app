# Intent: Cheat-Sheet Pop-Up Overlay

A confirmed statement of intent, produced via the `interview-me` skill. This is what the
user wants *before* any spec, plan, or code exists. Downstream work (spec, tasks,
implementation) consumes this.

- **Status:** Confirmed (explicit "yes")
- **Confidence at confirmation:** ~95%

## The intent

- **Outcome:** A global-hotkey HUD overlay that, in one keystroke, shows a cheat sheet the
  user would otherwise have to hunt for — a pinned sheet on open, a sidebar to switch sheets,
  and two-way search (natural-language *or* the literal key combo).
- **User:** Anyone, any role or experience level. The recurring pain is "I can't recall my own
  / an obscure shortcut, or a piece of language/program syntax," without switching context.
  The primary user is the author; the tool is general-purpose.
- **Why now:** Turns "I keep losing track of shortcuts / syntax" into "one hotkey brings it up."
- **Success (how we'll know it worked):**
  - Hit the global hotkey → a compact, always-on-top overlay opens anywhere in the OS; ESC
    closes it.
  - A user-chosen pinned sheet displays on open.
  - The user can switch between sheets via a side list and search by *either* a natural-language
    description ("Windows paste plain text") *or* a literal combo (`Win+Alt+V`).
  - Sheets are available online, locally (after HTTP download), or both via a toggle.
  - The user can create and edit their own Markdown sheets locally.
- **Constraint / binding limits:**
  - Keep v1 honest: **Linux first**, **static pinning**, **Markdown**, **Tauri / Rust / Svelte**.
  - Known hard spot, accepted for v1: global hotkeys + always-on-top (possibly transparent)
    overlays behave differently on **Wayland vs X11** under Tauri — test early; don't let it
    expand v1 scope.
- **Out of scope (v1):**
  - No real-time active-window / language auto-detection — pinning is **static** (user picks the
    sheet; changeable later). *One pinned sheet at a time.*
  - No contribute-back / PR / git login — local editing stays private; upstream sync is a
    *future* consideration, not early-stage.
  - No Windows / macOS builds in v1 is **OVERRIDDEN** (see the revision at the end of this file): Windows support was pulled forward by user request; **macOS** remains last.
  - No UI customization beyond: window size, theme (light / dark / follow-system), retrigger key.

## Decisions captured during the interview

- **Content source:** Pre-authored cheat sheets stored in a **GitHub repository** (the source of
  truth). Contains things like per-app keyboard shortcuts (IDEs, word processors) and
  programming-language / program syntax.
- **Format:** Markdown (`.md`).
- **Delivery / transport:** A regular **HTTP download** from the GitHub repo gives a local copy.
  The user can also view sheets **online**. Two-tier model: **repo = source-of-truth**,
  **local copy = for viewing + private editing / authoring**.
- **Overlay behavior on open:**
  - A **pinned** favorite sheet shown front-and-center (user's static choice, changeable).
  - A **list/sidebar of other sheets** to click into.
  - A **toggle** across **online / local / both** sources.
  - **Search** matching *both* a natural-language description and a literal key combo
    (reverse-lookup both directions).
- **Customization (v1):** window size, theme (light / dark / follow system), trigger key, and a
  **language setting** (see Internationalization below).
- **Default trigger key:** `Ctrl-Shift-Q`.
- **Stack:** Tauri — **Rust backend**, **Svelte frontend**.
- **Platform sequencing:** **Linux first**, then **Windows**, then **macOS** last.
- **Editing/authoring:** The user can create and edit their own cheat sheets **locally in
  Markdown**. Publishing back upstream is parked for later.

## Internationalization (language)

- The app exposes a **language setting** (part of the same customization surface as size/theme/trigger).
- **v1 ships US English (`en-US`) as the only implemented locale.**
- **i18n-scaffolded from the start:** UI strings run through a locale layer so adding another
  language later is *additive* (drop in a locale file) — not a rework. The *mechanism* for
  changing language ships in v1; *additional languages* are future work.

## Suggested next steps (downstream skills)

- Hand off to **`spec-driven-development`** to write the v1 spec from this intent (the "one
  pinned sheet at a time" and "online/local/both toggle" and "two-way search" are concrete enough
  to be acceptance criteria).
- Before coding, flag the **Wayland vs X11 global-hotkey/overlay** risk for early technical
  validation.

## Revision — Windows support pulled forward (added by user request)

- **Override:** the out-of-scope item "No Windows/macOS builds in v1" is overturned for **Windows
   only**. Windows support is now in scope and active; **macOS** remains last.
- **What changes:** Task 2 becomes a **platform-aware** spike. The hotkey must-path is
   platform-dependent — **Windows** uses the Win32 `RegisterHotKey` API through `tauri-plugin-`
   `global-shortcut` (supported, no CLI fallback); **Linux X11** keeps the global grab as the must-
   path, and **Linux Wayland** stays best-effort + flagged with the `--toggle` CLI fallback (Task 15).
- **What does NOT change:** the Linux-first **design baseline** (architecture, storage dirs, the
   X11-must / Wayland-best-effort hotkey strategy, GPL/license handling) is retained. The Tauri shell
   was already cross-platform (`targets: "all"`, `icon.ico`, `windows_subsystem`), so enabling Windows
   needs no rewrite — only the cross-platform design of Task 2 and the docs.
- **Dev environment (confirmed):** the active machine is Windows 11 with WebView2 present; Rust
   `x86_64-pc-windows-msvc` and the MSVC build tools are installed, and a `cargo check` for that
   target compiles clean.
- **Unresolved (flagged to the user):** whether the platform-aware spike **code** is written now or
   reserved for the Task 2 checkpoint itself.
