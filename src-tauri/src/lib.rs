// Spec module structure (filled in by later tasks): commands, settings, sheets, shortcuts.
mod commands;
pub mod settings;
pub mod sheets;
pub mod shortcuts;
mod seed;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
   tauri::Builder::default()
     .setup(|app| {
       if cfg!(debug_assertions) {
          app
            .handle()
            .plugin(tauri_plugin_log::Builder::default().level(log::LevelFilter::Info).build())?;
        }
    #[cfg(desktop)]
   app.handle().plugin(tauri_plugin_global_shortcut::Builder::new().build())?;
    #[cfg(desktop)]
   // Register the overlay hotkey. A failed grab (Wayland) is reported via the returned
   // status so the UI can flag it; it never aborts `setup`.
   let status = shortcuts::register_overlay_hotkey(app.handle());
   app.manage(status);
    // Settings store (Task 3). Loaded lazily via the get_settings / set_settings commands.
   app.handle().plugin(tauri_plugin_store::Builder::new().build())?;
    // Single-instance + `--toggle` (Task 14). A second `cheatsheet-app --toggle` invocation is
    // routed by this plugin to the running instance, which toggles the overlay. Best-effort on
    // Wayland (the global-grab must path is unavailable there), so it doubles as the fallback.
    let _ = app.handle().plugin(tauri_plugin_single_instance::init(move |app, args, _cwd| {
       if shortcuts::is_toggle_requested(args) {
           if let Some(window) = app.get_webview_window("main") {
               match window.is_visible().unwrap_or(false) {
                   true => {
                       let _ = window.hide();
                   }
                   false => {
                       let _ = window.show();
                       let _ = window.set_focus();
                   }
               }
           }
       }
   }));
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
      crate::commands::sheets::list_sheets,
      crate::commands::sheets::load_sheet,
      crate::commands::sheets::get_online_listing,
      crate::commands::sheets::refresh_online_listing
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
