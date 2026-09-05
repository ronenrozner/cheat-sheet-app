//! IPC command handlers for sheets (Task 4, Task 6).

use crate::settings::SourceMode;
use crate::sheets;
use tauri::AppHandle;

/// List sheet metadata for a source mode. `local` scans the local dir; `both` also scans the
/// downloaded snapshot. `online` lists nothing (online listing is a separate concern).
#[tauri::command]
pub fn list_sheets(app: AppHandle, source_mode: SourceMode) -> Vec<sheets::Sheet> {
    sheets::list_sheets(&app, source_mode)
}

/// Load the cached online listing (offline). No network, no download.
#[tauri::command]
pub fn get_online_listing(app: AppHandle) -> Vec<sheets::Sheet> {
    sheets::online::load_cached(&app)
}

/// Fetch the online listing from the contents API, caching it locally. First call hits the
/// network; later calls return the cache.
#[tauri::command]
pub fn refresh_online_listing(app: AppHandle) -> Vec<sheets::Sheet> {
    sheets::online::fetch_online_listing(&app)
}
