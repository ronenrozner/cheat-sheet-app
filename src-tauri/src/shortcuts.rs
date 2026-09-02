//! Global-hotkey registration + overlay show/hide, platform-aware (Tasks 2, 15).
//!
//! - Windows: `tauri-plugin-global-shortcut` maps to the Win32 `RegisterHotKey` API. The default
//!   `Ctrl-Shift-Q` bind works directly and the overlay is the must-path. No session-type detection.
//! - Linux X11: a real global grab via `global-shortcut`. This is the must-path on X11 sessions.
//! - Linux Wayland: best-effort only. If the grab cannot bind, surface a UI flag and offer the
//!   `--toggle` CLI route via `tauri-plugin-single-instance` (Task 15).
//!
//! Session-type detection (`$XDG_SESSION_TYPE`) applies to Linux runs only.
//! Empty in the Task 1 scaffold.
