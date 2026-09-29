//! IPC command handlers for sheets (Task 4, Task 6).

use crate::settings::SourceMode;
use crate::sheets;
use tauri::AppHandle;
use tauri_plugin_opener::OpenerExt;

/// List sheet metadata for a source mode. `local` scans the local dir; `both` also scans the
/// downloaded snapshot. `online` lists nothing (online listing is a separate concern).
///
/// `source_mode` is optional: the backend falls back to its own default (`Both`) when the caller
/// omits it, so the frontend does not need to send a Rust enum.
#[tauri::command]
pub fn list_sheets(app: AppHandle, source_mode: Option<SourceMode>) -> Vec<sheets::Sheet> {
    sheets::list_sheets(&app, source_mode.unwrap_or_default())
}

/// Load the cached online listing (offline). No network, no download.
#[tauri::command]
pub fn get_online_listing(app: AppHandle) -> Vec<sheets::Sheet> {
    sheets::online::load_cached(&app)
}

/// Load the Markdown body of one sheet by slug from `<home>/cheatsheets/<slug>.md`.
///
/// Returns `None` when the sheet is missing, unreadable, or empty — the frontend treats that as
/// "not found" rather than an error. Front-matter is stripped before returning.
#[tauri::command]
pub fn load_sheet(app: AppHandle, slug: String) -> Option<String> {
    sheets::read_sheet_body(&app, &slug)
}

/// Open the selected sheet in the system editor.
#[tauri::command]
pub fn open_sheet_for_edit(app: AppHandle, slug: String) -> Result<(), String> {
    if !sheets::is_safe_slug(&slug) {
        return Err("invalid sheet slug".to_string());
    }

    let path = sheets::sheet_dir(&app).join(format!("{slug}.md"));
    let settings = crate::settings::load(&app);
    let editor = settings.editor_path.trim();
    let editor = if editor.is_empty() {
        None
    } else {
        Some(editor)
    };
    app.opener()
        .open_path(path.to_string_lossy().to_string(), editor)
        .map_err(|error| error.to_string())
}

/// Fetch the online listing from the contents API, caching it locally. First call hits the
/// network; later calls return the cache.
#[tauri::command]
pub fn refresh_online_listing(app: AppHandle) -> Vec<sheets::Sheet> {
    sheets::online::fetch_online_listing(&app)
}
