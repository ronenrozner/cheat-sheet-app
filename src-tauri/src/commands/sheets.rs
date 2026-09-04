//! IPC command handlers for sheets (Task 4).

use crate::settings::SourceMode;
use crate::sheets;
use tauri::AppHandle;

/// List sheet metadata for a source mode. `local` scans the local dir; `both` also scans the
/// downloaded snapshot. `online` lists nothing (online listing is a separate concern).
#[tauri::command]
pub fn list_sheets(app: AppHandle, source_mode: SourceMode) -> Vec<sheets::Sheet> {
    sheets::list_sheets(&app, source_mode)
}
