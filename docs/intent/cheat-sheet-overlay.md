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
  - No Windows / macOS builds in v1 (sequenced after Linux).
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
