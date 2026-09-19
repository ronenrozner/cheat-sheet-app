use crate::themes::{self, Theme};
use tauri::{AppHandle, Manager};

#[tauri::command]
pub fn themes_list(app: AppHandle) -> Vec<Theme> {
    let data_dir = app
        .path()
        .app_data_dir()
        .unwrap_or_else(|_| std::path::PathBuf::from("."));
    themes::list_all(&data_dir)
}
