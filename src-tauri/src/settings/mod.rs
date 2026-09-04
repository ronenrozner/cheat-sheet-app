//! Settings load / save via `tauri-plugin-store` (Task 3; UI wiring in Task 13).
//!
//! Persists `theme` / `win_size` / `trigger` / `source_mode` / `language` / `pinned_slug` to
//! `app_config_dir/settings.json`.
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

/// Overlay window size in pixels.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
pub struct WinSize {
    pub width: u32,
    pub height: u32,
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

/// Full persisted settings snapshot.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Settings {
    pub theme: Theme,
    pub win_size: WinSize,
    pub trigger: TriggerKey,
    pub source_mode: SourceMode,
    pub language: Language,
    pub pinned_slug: String,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            theme: Theme::Follow,
            win_size: WinSize::default(),
            trigger: TriggerKey::default(),
            source_mode: SourceMode::Both,
            language: Language::EnUs,
            pinned_slug: String::new(),
        }
    }
}

/// Resolve the on-disk settings path (`app_config_dir/settings.json`).
pub fn settings_path(app: &AppHandle) -> PathBuf {
    app.path()
        .resolve("settings.json", tauri::path::BaseDirectory::AppConfig)
        .unwrap_or_else(|_| PathBuf::from("settings.json"))
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
        return Settings::default();
    };
    let mut s = Settings::default();
    if let Some(v) = store.get("theme") {
        s.theme = serde_json::from_value(v.clone()).unwrap_or_default();
    }
    if let Some(v) = store.get("win_size") {
        s.win_size = serde_json::from_value(v.clone()).unwrap_or_default();
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
    s
}

/// Persist settings to the store with an **atomic** write (temp file + rename).
///
/// If the rename fails, the original file is left intact (no partial write).
pub fn save(app: &AppHandle, settings: &Settings) -> Result<(), std::io::Error> {
    let Some(store) = build_store(app) else {
        return Err(std::io::Error::other(
            "settings store not available",
        ));
    };
    // Keep the in-memory store cache in sync with the values we are about to persist.
    store.set("theme", serde_json::to_value(settings.theme).unwrap_or_default());
    store.set("win_size", serde_json::to_value(settings.win_size).unwrap_or_default());
    store.set("trigger", serde_json::to_value(settings.trigger.clone()).unwrap_or_default());
    store.set("source_mode", serde_json::to_value(settings.source_mode).unwrap_or_default());
    store.set("language", serde_json::to_value(settings.language).unwrap_or_default());
    store.set("pinned_slug", serde_json::to_value(&settings.pinned_slug).unwrap_or_default());

    let bytes = settings_to_json(settings);
    let path = settings_path(app);
    atomic_write(&path, &bytes)
}

/// Serialize [`Settings`] to pretty-printed JSON bytes (falls back to a stub object on error).
fn settings_to_json(settings: &Settings) -> Vec<u8> {
    serde_json::to_vec(settings).unwrap_or_else(|_| {
        serde_json::to_vec(&Settings::default())
            .unwrap_or_else(|_| Vec::new())
    })
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
    serde_json::from_slice(bytes).unwrap_or_default()
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env::temp_dir;

    #[test]
    fn defaults_are_sane() {
        let s = Settings::default();
        assert_eq!(s.theme, Theme::Follow);
        assert_eq!(s.source_mode, SourceMode::Both);
        assert_eq!(s.language, Language::EnUs);
        assert!(s.pinned_slug.is_empty());
    }

    #[test]
    fn round_trip_json() {
        let original = Settings {
            theme: Theme::Dark,
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
        };
        let bytes = settings_to_json(&original);
        let parsed = settings_from_json(&bytes);
        assert_eq!(parsed, original);
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
