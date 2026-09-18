//! Global-hotkey registration + overlay show/hide, platform-aware (Task 2; `--toggle` lands in Task 15).
//!
//! - Windows: `tauri-plugin-global-shortcut` maps to the Win32 `RegisterHotKey` API. The default
//!   `Ctrl-Shift-Q` bind works directly and the overlay is the must-path. No session-type detection.
//! - Linux X11: a real global grab via `global-shortcut`. This is the must-path on X11 sessions.
//! - Linux Wayland: best-effort only. If the grab cannot bind, we still launch and surface a UI
//!   flag + the `--toggle` CLI route (Task 15) instead of aborting the app.
//!
//! Session-type detection (`$XDG_SESSION_TYPE`) applies to Linux runs only and drives the
//! Wayland "best-effort + flagged" behavior (spec §Hotkey strategy / D3).
//!
//! Task 2 (spike): register `Ctrl-Shift-Q` to toggle the overlay window (show on trigger, hide if
//! already visible) and `Esc` to hide it. Registration never aborts `setup` — a failed grab
//! (Wayland) is reported via [`HotkeyStatus`] so the UI can flag it.
use tauri::{AppHandle, Manager, State};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};

/// A Linux desktop session type, detected from `$XDG_SESSION_TYPE`.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum LinuxSession {
    /// X11 — the must-path; `global-shortcut` does a real global grab here.
    X11,
    /// Wayland — global grabs are compositor-dependent; best-effort + flagged.
    Wayland,
    /// Any other value (e.g. `tty`, `wayland-xwayland`).
    Other(String),
}

/// Detect the Linux session type from an env iterator.
///
/// Pure and unit-testable: pass a mocked `Vec<(String, String)>`. Returns `None` when the
/// variable is absent (non-Linux, or unset). Case-insensitive on the value.
pub fn detect_session_type(
    env: impl IntoIterator<Item = (String, String)>,
) -> Option<LinuxSession> {
    env.into_iter()
        .find(|(k, _)| k == "XDG_SESSION_TYPE")
        .map(|(_, v)| match v.to_ascii_lowercase().as_str() {
            "x11" => LinuxSession::X11,
            "wayland" => LinuxSession::Wayland,
            other => LinuxSession::Other(other.to_string()),
        })
}

/// Read the current process session type (wrapper around [`detect_session_type`]).
pub fn current_session_type() -> Option<LinuxSession> {
    detect_session_type(std::env::vars())
}

/// Human-readable label for a session, exposed to the frontend.
fn session_label(session: LinuxSession) -> String {
    match session {
        LinuxSession::X11 => "x11".to_string(),
        LinuxSession::Wayland => "wayland".to_string(),
        LinuxSession::Other(o) => o,
    }
}

/// Compositor bind snippets for the `--toggle` fallback (Task 14).
///
/// On Wayland an unprivileged app cannot register a global key combo, so the user re-binds the
/// compositor key to run `cheatsheet-app --toggle`. These are the per-compositor snippets the UI
/// surfaces (spec §Hotkey strategy). Documented, not auto-configured.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize)]
pub struct WaylandSnippets {
    /// Hyprland `bind =` line.
    pub hyprland: String,
    /// Sway `bindsym` line.
    pub sway: String,
    /// GNOME: manual *Custom Shortcuts* steps.
    pub gnome: String,
}

impl Default for WaylandSnippets {
    fn default() -> Self {
        Self {
            hyprland: "bind = SUPER, SHIFT, Q, exec, cheatsheet-app --toggle".to_string(),
            sway: "bindsym $mod+Shift+q exec cheatsheet-app --toggle".to_string(),
            gnome: "Settings \u{2013} Keyboard \u{2013} Custom Shortcuts \u{2013} run ".to_string()
                + "`cheatsheet-app --toggle`",
        }
    }
}

/// Whether `--toggle` was passed on the command line (Task 14).
///
/// The `tauri-plugin-single-instance` routes a second `cheatsheet-app --toggle` invocation to the
/// running instance, which toggles the overlay. This helper decides whether the incoming args are
/// a toggle request so the single-instance callback can act on them. Pure and unit-testable.
pub fn is_toggle_requested(args: impl IntoIterator<Item = impl AsRef<str>>) -> bool {
    args.into_iter().any(|a| a.as_ref() == "--toggle")
}

/// OS label for the running platform.
fn current_platform_label() -> String {
    if cfg!(target_os = "windows") {
        "windows".to_string()
    } else if cfg!(target_os = "macos") {
        "macos".to_string()
    } else if cfg!(target_os = "linux") {
        "linux".to_string()
    } else {
        "other".to_string()
    }
}

/// Snapshot of the overlay hotkey state, exposed to the frontend via [`get_hotkey_status`].
#[derive(Debug, Clone, serde::Serialize)]
pub struct HotkeyStatus {
    /// `windows` / `macos` / `linux` / `other`.
    pub platform: String,
    /// Linux session label (`x11` / `wayland` / other) or `None` off Linux.
    pub linux_session: Option<String>,
    /// Whether the OS-level global hotkey actually registered.
    pub hotkey_available: bool,
    /// Human-readable status, surfaced by the UI (e.g. the Wayland fallback hint).
    pub message: String,
}

/// Register the overlay hotkeys, returning a [`HotkeyStatus`] snapshot.
///
/// `Ctrl-Shift-Q` toggles the `main` window: if it is visible, hide it; otherwise show and focus
/// it. `Esc` only hides the window (it never re-shows it). In debug builds, `Ctrl-Shift-Alt-Q`
/// exits the app so `cargo tauri dev` has a graceful keyboard shutdown path. These are OS-level
/// global shortcuts so they work even when the undecorated overlay window lacks keyboard focus
/// (the frontend `keydown` path could not rely on this).
///
/// Registration errors are **not** fatal: a non-binding session (Wayland) is reported via the
/// returned status so the UI can flag it, instead of aborting `setup` and failing silently.
pub fn register_overlay_hotkey(app: &AppHandle) -> HotkeyStatus {
    let platform = current_platform_label();
    // Session detection drives the Wayland best-effort + flagged behavior; Linux only.
    let linux_session = if cfg!(target_os = "linux") {
        current_session_type().map(session_label)
    } else {
        None
    };

    match try_register(app) {
        Ok(()) => {
            log::info!(
                "overlay hotkey registered (platform={platform}, linux_session={:?})",
                linux_session
            );
            HotkeyStatus {
                platform,
                linux_session,
                hotkey_available: true,
                message: "Global hotkey registered.".to_string(),
            }
        }
        Err(e) => {
            log::warn!(
                "overlay hotkey registration failed (platform={platform}, linux_session={:?}): {e:#}",
                linux_session
            );
            HotkeyStatus {
                platform,
                linux_session,
                hotkey_available: false,
                message: "Global hotkey could not be registered on this session. \
                          Use `cheatsheet-app --toggle` as a fallback (see settings)."
                    .to_string(),
            }
        }
    }
}

/// The actual `global-shortcut` wiring. Returns `Err` on a non-binding session.
fn try_register(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    app.global_shortcut()
        .on_shortcut("ctrl+shift+q", |app, _shortcut, event| {
            if event.state == ShortcutState::Pressed {
                if let Some(window) = app.get_webview_window("main") {
                    if window.is_visible().unwrap_or(false) {
                        let _ = window.hide();
                        let _ = crate::tray::update_overlay_icon(app, false);
                    } else {
                        let _ = window.show();
                        let _ = window.set_focus();
                        let _ = crate::tray::update_overlay_icon(app, true);
                    }
                }
            }
        })?;
    // ESC closes the settings window when it is open; otherwise it hides the overlay.
    // Both are OS-level global shortcuts so they work even when the windows lack keyboard focus.
    app.global_shortcut()
        .on_shortcut("esc", |app, _shortcut, event| {
            if event.state == ShortcutState::Pressed {
                // The settings window is always-on-top, so when it is visible it is the focused
                // one and ESC should close it. Otherwise ESC hides the overlay.
                let settings_visible = app
                    .get_webview_window("settings")
                    .map(|w| w.is_visible().unwrap_or(false))
                    .unwrap_or(false);
                let target_label = if settings_visible { "settings" } else { "main" };
                if let Some(window) = app.get_webview_window(target_label) {
                    let _ = window.hide();
                    let _ = crate::tray::update_overlay_icon(app, false);
                }
            }
        })?;
    register_dev_quit_shortcut(app);
    Ok(())
}

#[cfg(debug_assertions)]
fn register_dev_quit_shortcut(app: &AppHandle) {
    if let Err(e) =
        app.global_shortcut()
            .on_shortcut("ctrl+shift+alt+q", |app, _shortcut, event| {
                if event.state == ShortcutState::Pressed {
                    crate::tray::request_exit(app);
                }
            })
    {
        log::warn!("dev quit shortcut registration failed: {e:#}");
    }
}

#[cfg(not(debug_assertions))]
fn register_dev_quit_shortcut(_app: &AppHandle) {}

/// IPC command: report the current overlay hotkey status to the frontend.
#[tauri::command]
pub fn get_hotkey_status(status: State<'_, HotkeyStatus>) -> HotkeyStatus {
    status.inner().clone()
}

/// IPC command: report the Wayland `--toggle` compositor bind snippets (Task 14).
#[tauri::command]
pub fn get_wayland_snippets() -> WaylandSnippets {
    WaylandSnippets::default()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn detects_x11() {
        assert!(matches!(
            detect_session_type(vec![("XDG_SESSION_TYPE".to_string(), "x11".to_string())]),
            Some(LinuxSession::X11)
        ));
    }

    #[test]
    fn detects_wayland() {
        assert!(matches!(
            detect_session_type(vec![(
                "XDG_SESSION_TYPE".to_string(),
                "wayland".to_string()
            )]),
            Some(LinuxSession::Wayland)
        ));
    }

    #[test]
    fn normalizes_case() {
        assert!(matches!(
            detect_session_type(vec![(
                "XDG_SESSION_TYPE".to_string(),
                "WAYLAND".to_string()
            )]),
            Some(LinuxSession::Wayland)
        ));
    }

    #[test]
    fn unknown_session_is_other() {
        assert!(matches!(
            detect_session_type(vec![("XDG_SESSION_TYPE".to_string(), "tty".to_string())]),
            Some(LinuxSession::Other(ref s)) if s == "tty"
        ));
    }

    #[test]
    fn missing_key_is_none() {
        assert!(detect_session_type(vec![("HOME".to_string(), "/root".to_string())]).is_none());
    }

    #[test]
    fn toggle_requested_with_flag() {
        assert!(is_toggle_requested(["cheatsheet-app", "--toggle"]));
    }

    #[test]
    fn not_toggle_without_flag() {
        assert!(!is_toggle_requested(["cheatsheet-app", "--help"]));
        assert!(!is_toggle_requested(["cheatsheet-app"]));
        assert!(!is_toggle_requested(std::env::args()));
    }

    #[test]
    fn wayland_snippets_are_non_empty() {
        let s = WaylandSnippets::default();
        assert!(s.hyprland.contains("--toggle"));
        assert!(s.sway.contains("--toggle"));
        assert!(s.gnome.contains("--toggle"));
    }
}
