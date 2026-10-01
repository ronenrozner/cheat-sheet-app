//! IPC command handlers for settings (Task 3).

use crate::settings::{load, save, Settings};
use crate::tray;
use tauri::AppHandle;

/// Load persisted settings. Falls back to defaults on first run.
#[tauri::command]
pub fn get_settings(app: AppHandle) -> Settings {
    load(&app)
}

/// Persist a settings snapshot (theme / win_size / trigger / source_mode / language / pinned_slug / show_tray).
#[tauri::command]
pub fn set_settings(app: AppHandle, settings: Settings) -> Result<(), String> {
    save(&app, &settings).map_err(|e| e.to_string())?;
    tray::update_menu(&app).map_err(|e| e.to_string())
}

/// Show or hide the persistent system tray icon (Task 17). Called from the frontend when the
/// user toggles the tray setting.
#[tauri::command]
pub fn set_tray_visibility(app: AppHandle, show: bool) -> Result<(), String> {
    tray::set_tray_visible(&app, show).map_err(|e| e.to_string())
}

/// Set whether the overlay window stays above other windows (Task 18). Applies live.
#[tauri::command]
pub fn set_always_on_top(app: AppHandle, always_on_top: bool) -> Result<(), String> {
    crate::settings::set_main_window_always_on_top(&app, always_on_top).map_err(|e| e.to_string())
}
