//! Settings load / save via `tauri-plugin-store` (Task 3; UI wiring in Task 13).
//!
//! Persists `theme` / `theme_light` / `theme_dark` / `win_size` / `trigger` / `source_mode` /
//! `language` / `pinned_slug` / `dataDir` to `<home>/.config/cheatsheet/config.json`.
//!
//! The store plugin's own `save` is a plain `fs::write`; Task 3 requires an **atomic** write
//! (temp file + rename) so a crash mid-write never leaves a partial file. We keep the store cache
//! in sync via `store.set`, then write the serialized [`Settings`] atomically ourselves.

use std::path::{Path, PathBuf};
use std::sync::Arc;

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};
use tauri_plugin_store::{Store, StoreExt};

/// Persisted UI theme.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
pub enum Theme {
    Light,
    Dark,
    #[default]
    Follow,
}

const DEFAULT_WIN_WIDTH: u32 = 800;
const DEFAULT_WIN_HEIGHT: u32 = 900;

/// Overlay window size in pixels.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct WinSize {
    pub width: u32,
    pub height: u32,
}

impl Default for WinSize {
    fn default() -> Self {
        Self {
            width: DEFAULT_WIN_WIDTH,
            height: DEFAULT_WIN_HEIGHT,
        }
    }
}

/// Overlay trigger key combo, as raw key parts (no aliasing — Task 7 normalizes authored combos).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, Default)]
pub struct TriggerKey {
    pub ctrl: bool,
    pub alt: bool,
    pub shift: bool,
    pub key: String,
}

/// Which sheet sources are visible.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
pub enum SourceMode {
    Online,
    Local,
    #[default]
    Both,
}

/// UI locale. v1 ships only `en-US`; any other value is a graceful no-op (Task 14).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
pub enum Language {
    #[default]
    EnUs,
}

/// Whether to show a persistent system tray icon (Task 17). Default off so a new install keeps the
/// original hidden-window-only behavior until the user opts in.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
pub enum ShowTray {
    /// No tray icon; the app runs as a hidden window only.
    #[default]
    Off,
    /// Show a persistent tray icon that toggles the overlay.
    On,
}

/// Full persisted settings snapshot.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Settings {
    pub theme: Theme,
    pub theme_light: String,
    pub theme_dark: String,
    pub win_size: WinSize,
    pub trigger: TriggerKey,
    pub source_mode: SourceMode,
    pub language: Language,
    pub pinned_slug: String,
    #[serde(rename = "dataDir")]
    pub data_dir: String,
    pub show_tray: ShowTray,
    pub always_on_top: bool,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            theme: Theme::Follow,
            theme_light: "Cheatsheet Light".to_string(),
            theme_dark: "Cheatsheet".to_string(),
            win_size: WinSize::default(),
            trigger: TriggerKey {
                ctrl: true,
                alt: false,
                shift: true,
                key: "q".to_string(),
            },
            source_mode: SourceMode::Both,
            language: Language::EnUs,
            pinned_slug: String::new(),
            data_dir: "cheatsheets".to_string(),
            show_tray: ShowTray::Off,
            always_on_top: true,
        }
    }
}

/// Build the config path from a home directory.
pub fn config_path_from_home(home: &Path) -> PathBuf {
    home.join(".config").join("cheatsheet").join("config.json")
}

/// Build the default sheet data directory from a home directory.
pub fn default_data_dir_from_home(home: &Path) -> PathBuf {
    home.join("cheatsheets")
}

/// Resolve the on-disk settings path (`<home>/.config/cheatsheet/config.json`).
pub fn settings_path(app: &AppHandle) -> PathBuf {
    app.path()
        .resolve(
            ".config/cheatsheet/config.json",
            tauri::path::BaseDirectory::Home,
        )
        .unwrap_or_else(|_| {
            PathBuf::from(".config")
                .join("cheatsheet")
                .join("config.json")
        })
}

/// Resolve the default sheet data directory (`<home>/cheatsheets`).
pub fn default_data_dir(app: &AppHandle) -> PathBuf {
    app.path()
        .resolve("cheatsheets", tauri::path::BaseDirectory::Home)
        .unwrap_or_else(|_| PathBuf::from("cheatsheets"))
}

/// Build (or fetch) the settings store at the resolved path.
fn build_store(app: &AppHandle) -> Option<Arc<Store<tauri::Wry>>> {
    let path = settings_path(app);
    app.store(&path).ok()
}

/// Load settings from the store, falling back to defaults on first run.
///
/// Malformed data on disk recovers to defaults (the spec requires no crash on bad on-disk data).
pub fn load(app: &AppHandle) -> Settings {
    let Some(store) = build_store(app) else {
        return settings_with_default_data_dir(app);
    };
    let mut s = settings_with_default_data_dir(app);
    if let Some(v) = store.get("theme") {
        s.theme = serde_json::from_value(v.clone()).unwrap_or_default();
    }
    if let Some(v) = store.get("theme_light") {
        if let Some(name) = v.as_str() {
            s.theme_light = name.to_string();
        }
    }
    if let Some(v) = store.get("theme_dark") {
        if let Some(name) = v.as_str() {
            s.theme_dark = name.to_string();
        }
    }
    if let Some(v) = store.get("win_size") {
        s.win_size = serde_json::from_value(v.clone())
            .map(sanitize_win_size)
            .unwrap_or_default();
    }
    if let Some(v) = store.get("trigger") {
        s.trigger = serde_json::from_value(v.clone()).unwrap_or_default();
    }
    if let Some(v) = store.get("source_mode") {
        s.source_mode = serde_json::from_value(v.clone()).unwrap_or_default();
    }
    if let Some(v) = store.get("language") {
        s.language = serde_json::from_value(v.clone()).unwrap_or_default();
    }
    if let Some(v) = store.get("pinned_slug") {
        if let Some(p) = v.as_str() {
            s.pinned_slug = p.to_string();
        }
    }
    s.data_dir = default_data_dir(app).to_string_lossy().to_string();
    if let Some(v) = store.get("dataDir") {
        if let Some(p) = v.as_str() {
            s.data_dir = p.to_string();
        }
    }
    if let Some(v) = store.get("show_tray") {
        s.show_tray = serde_json::from_value(v.clone()).unwrap_or_default();
    }
    if let Some(v) = store.get("always_on_top") {
        s.always_on_top = v.as_bool().unwrap_or(true);
    }
    s
}

/// Build defaults that include the absolute default sheet data directory.
fn settings_with_default_data_dir(app: &AppHandle) -> Settings {
    let mut settings = Settings::default();
    settings.data_dir = default_data_dir(app).to_string_lossy().to_string();
    settings
}

/// Ensure the config file and configured data directory exist.
///
/// Existing `dataDir` values are kept.
pub fn ensure_initialized(app: &AppHandle) -> Result<Settings, std::io::Error> {
    let path = settings_path(app);
    let existed = path.exists();
    let store = build_store(app);
    let has_data_dir = store.as_ref().and_then(|store| store.get("dataDir")).is_some();
    let has_valid_win_size = store
        .as_ref()
        .and_then(|store| store.get("win_size"))
        .and_then(|value| serde_json::from_value::<WinSize>(value).ok())
        .map(is_valid_win_size)
        .unwrap_or(false);
    let settings = load(app);
    std::fs::create_dir_all(&settings.data_dir)?;
    if !existed || !has_data_dir || !has_valid_win_size {
        save(app, &settings)?;
    }
    Ok(settings)
}

/// Persist settings to the store with an **atomic** write (temp file + rename).
///
/// If the rename fails, the original file is left intact (no partial write).
pub fn save(app: &AppHandle, settings: &Settings) -> Result<(), std::io::Error> {
    let Some(store) = build_store(app) else {
        return Err(std::io::Error::other("settings store not available"));
    };
    // Keep the in-memory store cache in sync with the values we are about to persist.
    store.set(
        "theme",
        serde_json::to_value(settings.theme).unwrap_or_default(),
    );
    store.set(
        "theme_light",
        serde_json::to_value(&settings.theme_light).unwrap_or_default(),
    );
    store.set(
        "theme_dark",
        serde_json::to_value(&settings.theme_dark).unwrap_or_default(),
    );
    store.set(
        "win_size",
        serde_json::to_value(settings.win_size).unwrap_or_default(),
    );
    store.set(
        "trigger",
        serde_json::to_value(settings.trigger.clone()).unwrap_or_default(),
    );
    store.set(
        "source_mode",
        serde_json::to_value(settings.source_mode).unwrap_or_default(),
    );
    store.set(
        "language",
        serde_json::to_value(settings.language).unwrap_or_default(),
    );
    store.set(
        "pinned_slug",
        serde_json::to_value(&settings.pinned_slug).unwrap_or_default(),
    );
    store.set(
        "dataDir",
        serde_json::to_value(&settings.data_dir).unwrap_or_default(),
    );
    store.set(
        "show_tray",
        serde_json::to_value(settings.show_tray).unwrap_or_default(),
    );
    store.set(
        "always_on_top",
        serde_json::to_value(settings.always_on_top).unwrap_or_default(),
    );

    let bytes = settings_to_json(settings);
    let path = settings_path(app);
    atomic_write(&path, &bytes)
}

/// Serialize [`Settings`] to pretty-printed JSON bytes (falls back to a stub object on error).
fn settings_to_json(settings: &Settings) -> Vec<u8> {
    serde_json::to_vec(settings)
        .unwrap_or_else(|_| serde_json::to_vec(&Settings::default()).unwrap_or_else(|_| Vec::new()))
}

/// Write `bytes` to `path` atomically: serialize to a temp file in the same directory, then
/// rename over the target. Returns `Ok(())` on success or an `io::Error` on failure.
fn atomic_write(path: &Path, bytes: &[u8]) -> Result<(), std::io::Error> {
    let dir = path.parent().expect("settings path must have a parent");
    std::fs::create_dir_all(dir)?;
    let tmp = format!("{}.tmp.{}", path.display(), std::process::id());
    let tmp_path = PathBuf::from(&tmp);
    std::fs::write(&tmp_path, bytes)?;
    std::fs::rename(&tmp_path, path)?;
    Ok(())
}

/// Parse settings from raw JSON bytes, recovering to defaults on malformed input.
///
/// Pure and unit-testable: mirrors what [`load`] does after reading the store.
pub fn settings_from_json(bytes: &[u8]) -> Settings {
    serde_json::from_slice(bytes)
        .map(sanitize_settings)
        .unwrap_or_default()
}

/// Apply the persisted always-on-top preference to the main window.
pub fn apply_main_window_always_on_top(app: &AppHandle) -> tauri::Result<()> {
    set_main_window_always_on_top(app, load(app).always_on_top)
}

/// Apply an explicit always-on-top value to the main window.
pub fn set_main_window_always_on_top(app: &AppHandle, always_on_top: bool) -> tauri::Result<()> {
    if let Some(window) = app.get_webview_window("main") {
        window.set_always_on_top(always_on_top)?;
    }
    Ok(())
}

fn sanitize_settings(mut settings: Settings) -> Settings {
    settings.win_size = sanitize_win_size(settings.win_size);
    settings
}

fn sanitize_win_size(win_size: WinSize) -> WinSize {
    if is_valid_win_size(win_size) {
        win_size
    } else {
        WinSize::default()
    }
}

fn is_valid_win_size(win_size: WinSize) -> bool {
    win_size.width > 0 && win_size.height > 0
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env::temp_dir;

    #[test]
    fn defaults_are_sane() {
        let s = Settings::default();
        assert_eq!(s.theme, Theme::Follow);
        assert_eq!(s.theme_light, "Cheatsheet Light");
        assert_eq!(s.theme_dark, "Cheatsheet");
        assert_eq!(s.source_mode, SourceMode::Both);
        assert_eq!(s.language, Language::EnUs);
        assert_eq!(s.win_size, WinSize { width: 800, height: 900 });
        assert!(s.pinned_slug.is_empty());
        assert_eq!(s.data_dir, "cheatsheets");
        assert_eq!(s.show_tray, ShowTray::Off);
        assert!(s.always_on_top);
    }

    #[test]
    fn round_trip_json() {
        let original = Settings {
            theme: Theme::Dark,
            theme_light: "GitHub".to_string(),
            theme_dark: "Dracula".to_string(),
            win_size: WinSize {
                width: 800,
                height: 900,
            },
            trigger: TriggerKey {
                ctrl: true,
                alt: false,
                shift: true,
                key: "q".to_string(),
            },
            source_mode: SourceMode::Local,
            language: Language::EnUs,
            pinned_slug: "1password".to_string(),
            data_dir: temp_dir().join("cheatsheets").to_string_lossy().to_string(),
            show_tray: ShowTray::On,
            always_on_top: false,
        };
        let bytes = settings_to_json(&original);
        let parsed = settings_from_json(&bytes);
        assert_eq!(parsed, original);
    }

    #[test]
    fn zero_win_size_recovers_to_defaults() {
        let mut settings = Settings::default();
        settings.win_size = WinSize { width: 0, height: 0 };
        let parsed = settings_from_json(&settings_to_json(&settings));
        assert_eq!(parsed.win_size, WinSize { width: 800, height: 900 });
    }

    #[test]
    fn malformed_json_recovers_to_defaults() {
        let parsed = settings_from_json(b"{ this is not valid json ]");
        assert_eq!(parsed, Settings::default());
    }

    #[test]
    fn empty_bytes_recovers_to_defaults() {
        assert_eq!(settings_from_json(b""), Settings::default());
    }

    #[test]
    fn config_path_uses_home_dot_config_cheatsheet() {
        let home = PathBuf::from("/home/example");
        assert_eq!(
            config_path_from_home(&home),
            PathBuf::from("/home/example/.config/cheatsheet/config.json")
        );
    }

    #[test]
    fn default_data_dir_uses_home_cheatsheets() {
        let home = PathBuf::from("/home/example");
        assert_eq!(
            default_data_dir_from_home(&home),
            PathBuf::from("/home/example/cheatsheets")
        );
    }

    #[test]
    fn serializes_data_dir_as_camel_case() {
        let settings = Settings {
            data_dir: "/home/example/cheatsheets".to_string(),
            ..Settings::default()
        };
        let json = String::from_utf8(settings_to_json(&settings)).unwrap();
        assert!(json.contains("dataDir"));
        assert!(!json.contains("data_dir"));
    }

    #[test]
    fn atomic_write_leaves_no_temp_file() {
        let dir = temp_dir();
        let target = dir.join("cheat-sheet-settings-test.json");
        let bytes = settings_to_json(&Settings::default());
        atomic_write(&target, &bytes).unwrap();
        assert!(target.exists());
        // The temp file must not linger after a successful rename.
        let tmp = format!("{}.tmp.{}", target.display(), std::process::id());
        assert!(!PathBuf::from(&tmp).exists());
        // The written file must parse back to our settings.
        let written = std::fs::read(&target).unwrap();
        assert_eq!(settings_from_json(&written), Settings::default());
    }
}
