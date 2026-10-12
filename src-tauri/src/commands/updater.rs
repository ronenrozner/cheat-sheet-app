//! Update check IPC commands.

use tauri::AppHandle;

/// Information about an available update returned to the frontend.
#[derive(serde::Serialize)]
pub struct UpdateInfo {
    pub version: String,
    pub body: Option<String>,
    pub date: Option<String>,
}

/// Check whether a newer version is available.
#[tauri::command]
pub async fn check_update(app: AppHandle) -> Result<Option<UpdateInfo>, String> {
    use tauri_plugin_updater::UpdaterExt;

    log::info!("[updater] checking for updates");
    let updater = app.updater().map_err(|error| {
        log::error!("[updater] failed to build updater: {error}");
        error.to_string()
    })?;

    match updater.check().await {
        Ok(Some(update)) => {
            log::info!("[updater] update available: v{}", update.version);
            Ok(Some(UpdateInfo {
                version: update.version.clone(),
                body: update.body.clone(),
                date: update.date.map(|date| date.to_string()),
            }))
        }
        Ok(None) => {
            log::info!("[updater] already up to date");
            Ok(None)
        }
        Err(error) => {
            log::warn!("[updater] update check failed: {error}");
            Err(error.to_string())
        }
    }
}

/// Download, verify, and install the pending update, then relaunch immediately.
#[tauri::command]
pub async fn install_update(app: AppHandle) -> Result<(), String> {
    use tauri_plugin_updater::UpdaterExt;

    log::info!("[updater] install requested");
    let updater = app.updater().map_err(|error| {
        log::error!("[updater] failed to build updater: {error}");
        error.to_string()
    })?;

    let update = updater
        .check()
        .await
        .map_err(|error| {
            log::error!("[updater] update check failed during install: {error}");
            error.to_string()
        })?
        .ok_or_else(|| {
            log::warn!("[updater] install_update called but no update is available");
            "No update available".to_string()
        })?;

    log::info!("[updater] downloading and installing v{}", update.version);
    update
        .download_and_install(|_, _| {}, || {})
        .await
        .map_err(|error| {
            log::error!("[updater] download/install failed: {error}");
            error.to_string()
        })?;

    log::info!("[updater] install complete; relaunching");
    app.restart();
}
