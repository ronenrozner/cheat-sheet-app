// Spec module structure (filled in by later tasks): commands, settings, sheets, shortcuts.
mod commands;
mod seed;
pub mod settings;
pub mod sheets;
pub mod shortcuts;
pub mod themes;
pub mod tray;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            #[cfg(desktop)]
            app.handle()
                .plugin(tauri_plugin_global_shortcut::Builder::new().build())?;
            #[cfg(desktop)]
            // Register the overlay hotkey. A failed grab (Wayland) is reported via the returned
            // status so the UI can flag it; it never aborts `setup`.
            let status = shortcuts::register_overlay_hotkey(app.handle());
            app.manage(status);
            // Settings store (Task 3). First run creates `<home>/.config/cheatsheet/config.json`
            // and the configured sheet data folder.
            app.handle()
                .plugin(tauri_plugin_store::Builder::new().build())?;
            if let Err(error) = settings::ensure_initialized(app.handle()) {
                log::warn!("settings initialization failed: {error}");
            }
            // Custom theme hot-reload. The watcher must stay alive for the full app lifetime.
            let data_dir = app
                .path()
                .app_data_dir()
                .unwrap_or_else(|_| std::path::PathBuf::from("."));
            if let Some(watcher) = themes::watcher::spawn_watcher(data_dir, app.handle().clone()) {
                app.manage(watcher);
            }
            // System tray (Task 17). Shown only when `show_tray` is On; hidden otherwise.
            let settings = settings::load(app.handle());
            if tray::tray_visible(&settings) {
                if let Err(e) = tray::create_tray(app.handle()) {
                    log::warn!("system tray failed to create: {e:#}");
                } else {
                    log::info!("system tray created");
                }
            }
            // Single-instance + `--toggle` (Task 14). A second `cheatsheet-app --toggle` invocation is
            // routed by this plugin to the running instance, which toggles the overlay. Best-effort on
            // Wayland (the global-grab must path is unavailable there), so it doubles as the fallback.
            let _ = app.handle().plugin(tauri_plugin_single_instance::init(
                move |app, args, _cwd| {
                    if shortcuts::is_toggle_requested(args) {
                        if let Some(window) = app.get_webview_window("main") {
                            match window.is_visible().unwrap_or(false) {
                                true => {
                                    let _ = window.hide();
                                    let _ =
                                        crate::tray::update_overlay_icon(app.app_handle(), false);
                                }
                                false => {
                                    let _ = window.show();
                                    let _ = window.set_focus();
                                    let _ =
                                        crate::tray::update_overlay_icon(app.app_handle(), true);
                                }
                            }
                        }
                    }
                },
            ));
            // Seed a few out-of-box sheets into the user's sheet folder on first run (spec D1). Runs
            // only when the folder is empty/missing, so it never overwrites user sheets.
            let sheet_dir = sheets::sheet_dir(app.handle());
            if seed::seed_bundled(&sheet_dir) {
                log::info!("seeded bundled sheets into {sheet_dir:?}");
            } else {
                log::info!("sheet folder {sheet_dir:?} already populated; skipping seed");
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            shortcuts::get_hotkey_status,
            shortcuts::get_wayland_snippets,
            crate::commands::settings::get_settings,
            crate::commands::settings::set_settings,
            crate::commands::settings::set_tray_visibility,
            crate::commands::settings::set_always_on_top,
            crate::commands::themes::themes_list,
            crate::commands::sheets::list_sheets,
            crate::commands::sheets::load_sheet,
            crate::commands::sheets::get_online_listing,
            crate::commands::sheets::refresh_online_listing
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
