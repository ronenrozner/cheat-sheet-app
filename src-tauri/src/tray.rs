//! System tray icon (Task 17).
//!
//! When `show_tray` is `On`, a persistent tray icon appears. Clicking it toggles the overlay. The
//! icon swaps appearance when the overlay opens/closes. There is no right-click menu.
//!
//! macOS renders tray icons as grayscale templates, so both icons are marked `icon_as_template`.
//! The open-state variant is `icons/icon-open.png` (the base icon with a small checkmark badge).

use std::sync::Mutex;

use std::io::Error as IoError;

use include_dir::{include_dir, Dir};
use tauri::{AppHandle, Manager};
use tauri::image::Image;
use tauri::menu::Menu;
use tauri::tray::MouseButton;
use tauri::tray::TrayIconEvent;

/// The tray icon id. Shared by the base and open variants so we only have one tray instance.
pub const TRAY_ID: &str = "cheat-sheet-tray";

/// The base (overlay closed) tray icon path in the embedded set.
const ICON_BASE: &str = "icon.png";
/// The overlay-open tray icon path in the embedded set.
const ICON_OPEN: &str = "icon-open.png";

/// The embedded tray icons. Relative to the crate root (`src-tauri/`).
const ICONS: Dir<'_> = include_dir!("icons");

/// Whether the overlay is currently open. Shared mutable state so a hotkey toggle and a tray click
/// can agree on the current appearance.
static OVERLAY_OPEN: Mutex<bool> = Mutex::new(false);

/// Extract an embedded PNG to bytes, or `None` when the icon is missing.
fn embedded_icon(path: &str) -> Option<&[u8]> {
    for file in ICONS.files() {
        if file.path().to_string_lossy() == path {
            return Some(file.contents());
        }
    }
    None
}

/// Load an embedded icon as a Tauri `Image`, or `None` when it is missing.
fn load_icon(path: &str) -> Option<Image<'static>> {
    embedded_icon(path)
        .and_then(|bytes| Image::from_bytes(bytes).ok())
}

/// Create the persistent tray icon. Registered only when `show_tray` is `On`.
pub fn create_tray(app: &AppHandle) -> tauri::Result<()> {
    let Some(base) = load_icon(ICON_BASE) else {
        return Err(tauri::Error::from(IoError::other("tray icon not embedded")));
    };
    // Linux: a tray icon with no menu is invisible. An empty menu makes the icon show and suppress
    // the right-click context menu.
    let menu = Menu::new(app)?;

    let tray = tauri::tray::TrayIconBuilder::with_id(TRAY_ID)
        .icon(base)
        .menu(&menu)
        .tooltip("Cheat-Sheet HUD")
        .build(app)?;

    // macOS: render the icon as a grayscale template.
    tray.set_icon_as_template(true)?;

    // Left click toggles the overlay. No other button does anything.
    tray.on_tray_icon_event(move |_tray, event| {
        if let TrayIconEvent::Click { button, .. } = event {
            if button == MouseButton::Left {
                toggle_overlay(_tray.app_handle());
            }
        }
    });

    Ok(())
}

/// Whether the tray is currently showing. Read at startup from the persisted setting.
pub fn tray_visible(settings: &crate::settings::Settings) -> bool {
    matches!(settings.show_tray, crate::settings::ShowTray::On)
}

/// Show or hide the persistent tray icon. Called from the frontend when the user toggles the
/// setting.
pub fn set_tray_visible(app: &AppHandle, visible: bool) -> tauri::Result<()> {
    match app.tray_by_id(TRAY_ID) {
        Some(tray) => tray.set_visible(visible),
        None => Ok(()),
    }
}

/// Swap the tray icon to signal the overlay state. Called whenever the overlay opens or closes
/// (tray click, hotkey, or `--toggle`).
pub fn update_overlay_icon(app: &AppHandle, open: bool) -> tauri::Result<()> {
    *OVERLAY_OPEN.lock().unwrap() = open;
    let path = if open { ICON_OPEN } else { ICON_BASE };
    let Some(icon) = load_icon(path) else {
        return Ok(());
    };
    match app.tray_by_id(TRAY_ID) {
        Some(tray) => tray.set_icon(Some(icon)).map(|_| ()),
        None => Ok(()),
    }
}

/// Whether the overlay is currently open (drives the tray appearance).
pub fn overlay_open() -> bool {
    *OVERLAY_OPEN.lock().unwrap()
}

/// Toggle the overlay: show/hide the `main` window and update the tray icon.
fn toggle_overlay(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        if window.is_visible().unwrap_or(false) {
            let _ = window.hide();
            let _ = update_overlay_icon(app, false);
        } else {
            let _ = window.show();
            let _ = window.set_focus();
            let _ = update_overlay_icon(app, true);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn tray_visible_matches_setting() {
        let s = crate::settings::Settings {
            show_tray: crate::settings::ShowTray::On,
            ..crate::settings::Settings::default()
        };
        assert!(tray_visible(&s));

        let s_off = crate::settings::Settings {
            show_tray: crate::settings::ShowTray::Off,
            ..crate::settings::Settings::default()
        };
        assert!(!tray_visible(&s_off));
    }

    #[test]
    fn both_tray_icons_are_embedded() {
        assert!(embedded_icon(ICON_BASE).is_some());
        assert!(embedded_icon(ICON_OPEN).is_some());
    }
}
