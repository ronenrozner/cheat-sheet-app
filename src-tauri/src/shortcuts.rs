//! Global-hotkey registration + overlay show/hide, platform-aware (Tasks 2, 15).
//!
//! - Windows: `tauri-plugin-global-shortcut` maps to the Win32 `RegisterHotKey` API. The default
//!   `Ctrl-Shift-Q` bind works directly and the overlay is the must-path. No session-type detection.
//! - Linux X11: a real global grab via `global-shortcut`. This is the must-path on X11 sessions.
//! - Linux Wayland: best-effort only. If the grab cannot bind, surface a UI flag and offer the
//!   `--toggle` CLI route via `tauri-plugin-single-instance` (Task 15).
//!
//! Session-type detection (`$XDG_SESSION_TYPE`) applies to Linux runs only.
//! Task 2 (minimal spike): register `Ctrl-Shift-Q` to toggle the overlay window
//! (show on trigger, hide if already visible) and `Esc` to hide it. Platform branches
//! land in Task 15.
use tauri::{AppHandle, Manager};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};

/// Register the overlay hotkeys: `Ctrl-Shift-Q` toggles the window, `Esc` hides it.
/// Call once, after the global-shortcut plugin is installed.
///
/// `Ctrl-Shift-Q` toggles the `main` window: if it is visible, hide it; otherwise
/// show and focus it. `Esc` only hides the window (it never re-shows it). Both are
/// OS-level global shortcuts so they work even when the undecorated overlay window
/// lacks keyboard focus (the frontend `keydown` path could not rely on this).
///
/// Registration errors are propagated so a non-binding session surfaces loudly
/// instead of failing silently.
pub fn register_overlay_hotkey(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
  app
    .global_shortcut()
    .on_shortcut("ctrl+shift+q", |app, _shortcut, event| {
      if event.state == ShortcutState::Pressed {
        if let Some(window) = app.get_webview_window("main") {
          if window.is_visible().unwrap_or(false) {
            let _ = window.hide();
          } else {
            let _ = window.show();
            let _ = window.set_focus();
          }
        }
      }
    })?;
  // ESC hides the overlay. Kept as its own handler on the same reliable OS-level path
  // as the toggle so it works without the WebView holding keyboard focus.
  app
    .global_shortcut()
    .on_shortcut("esc", |app, _shortcut, event| {
      if event.state == ShortcutState::Pressed {
        if let Some(window) = app.get_webview_window("main") {
          let _ = window.hide();
        }
      }
    })?;
  Ok(())
}
