//! IPC command handlers for settings (Task 3).

use crate::settings::{load, save, Settings};
use tauri::AppHandle;

/// Load persisted settings. Falls back to defaults on first run.
#[tauri::command]
pub fn get_settings(app: AppHandle) -> Settings {
    load(&app)
}

/// Persist a settings snapshot (theme / win_size / trigger / source_mode / language / pinned_slug).
#[tauri::command]
pub fn set_settings(app: AppHandle, settings: Settings) -> Result<(), String> {
    save(&app, &settings).map_err(|e| e.to_string())
}
