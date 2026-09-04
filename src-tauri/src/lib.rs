// Spec module structure (filled in by later tasks): commands, settings, sheets, shortcuts.
mod commands;
mod settings;
mod sheets;
mod shortcuts;

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
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![shortcuts::get_hotkey_status])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
