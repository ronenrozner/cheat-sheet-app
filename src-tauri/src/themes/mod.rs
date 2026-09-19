pub mod watcher;

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::Path;

const MAX_THEME_BYTES: u64 = 64 * 1024;

const REQUIRED_KEYS: &[&str] = &[
    "--color-background",
    "--color-background-light",
    "--color-background-lightest",
    "--color-foreground",
    "--color-foreground-darker",
    "--color-foreground-darkest",
    "--color-accent",
];

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Theme {
    pub name: String,
    pub colors: HashMap<String, String>,
    #[serde(default)]
    pub is_custom: bool,
}

const BUNDLED_JSON: &[&str] = &[
    include_str!("../../../static/themes/andromeda.json"),
    include_str!("../../../static/themes/ayu.json"),
    include_str!("../../../static/themes/catppuccin-frappe.json"),
    include_str!("../../../static/themes/catppuccin-latte.json"),
    include_str!("../../../static/themes/catppuccin-macchiato.json"),
    include_str!("../../../static/themes/catppuccin-mocha.json"),
    include_str!("../../../static/themes/city-lights.json"),
    include_str!("../../../static/themes/cobalt2.json"),
    include_str!("../../../static/themes/crimson-white.json"),
    include_str!("../../../static/themes/darcula.json"),
    include_str!("../../../static/themes/dracula.json"),
    include_str!("../../../static/themes/dva.json"),
    include_str!("../../../static/themes/everforest.json"),
    include_str!("../../../static/themes/github-dark.json"),
    include_str!("../../../static/themes/github.json"),
    include_str!("../../../static/themes/graphite.json"),
    include_str!("../../../static/themes/gruvbox-light.json"),
    include_str!("../../../static/themes/gruvbox.json"),
    include_str!("../../../static/themes/horizon.json"),
    include_str!("../../../static/themes/kanagawa.json"),
    include_str!("../../../static/themes/material-palenight.json"),
    include_str!("../../../static/themes/monokai-pro.json"),
    include_str!("../../../static/themes/monokai.json"),
    include_str!("../../../static/themes/night-owl.json"),
    include_str!("../../../static/themes/nord.json"),
    include_str!("../../../static/themes/one-dark.json"),
    include_str!("../../../static/themes/panda.json"),
    include_str!("../../../static/themes/pomotroid-light.json"),
    include_str!("../../../static/themes/pomotroid.json"),
    include_str!("../../../static/themes/popping-and-locking.json"),
    include_str!("../../../static/themes/rose-pine-dawn.json"),
    include_str!("../../../static/themes/rose-pine-moon.json"),
    include_str!("../../../static/themes/rose-pine.json"),
    include_str!("../../../static/themes/solarized-dark.json"),
    include_str!("../../../static/themes/solarized-light.json"),
    include_str!("../../../static/themes/spandex.json"),
    include_str!("../../../static/themes/synthwave.json"),
    include_str!("../../../static/themes/tokyo-night.json"),
];

pub fn load_bundled() -> Vec<Theme> {
    BUNDLED_JSON
        .iter()
        .filter_map(|raw| parse_theme(raw, false))
        .collect()
}

pub fn load_custom(themes_dir: &Path) -> Vec<Theme> {
    let Ok(entries) = std::fs::read_dir(themes_dir) else {
        return Vec::new();
    };

    let mut themes = Vec::new();
    for entry in entries.filter_map(Result::ok) {
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) != Some("json") {
            continue;
        }

        let Ok(metadata) = entry.metadata() else {
            continue;
        };
        if metadata.len() > MAX_THEME_BYTES {
            log::warn!("[themes] skipping large theme file: {}", path.display());
            continue;
        }

        let raw = match std::fs::read_to_string(&path) {
            Ok(raw) => raw,
            Err(error) => {
                log::warn!("[themes] cannot read {}: {error}", path.display());
                continue;
            }
        };

        match parse_theme(&raw, true) {
            Some(theme) => themes.push(theme),
            None => log::warn!("[themes] invalid theme file: {}", path.display()),
        }
    }

    themes
}

pub fn list_all(app_data_dir: &Path) -> Vec<Theme> {
    let mut themes = load_bundled();
    for custom in load_custom(&app_data_dir.join("themes")) {
        if let Some(existing) = themes
            .iter_mut()
            .find(|theme| theme.name.eq_ignore_ascii_case(&custom.name))
        {
            *existing = custom;
        } else {
            themes.push(custom);
        }
    }
    themes.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    themes
}

pub fn find(app_data_dir: &Path, name: &str) -> Option<Theme> {
    list_all(app_data_dir)
        .into_iter()
        .find(|theme| theme.name.eq_ignore_ascii_case(name))
}

fn parse_theme(raw: &str, is_custom: bool) -> Option<Theme> {
    let value = serde_json::from_str::<serde_json::Value>(raw).ok()?;
    let name = value.get("name")?.as_str()?.trim();
    if name.is_empty() {
        return None;
    }

    let colors_obj = value.get("colors")?.as_object()?;
    let mut colors = HashMap::new();
    for (key, value) in colors_obj {
        if !key.starts_with("--color-") && !key.starts_with("--cs-") {
            continue;
        }
        let color = value.as_str()?.trim();
        if !is_hex_color(color) {
            return None;
        }
        colors.insert(key.clone(), color.to_string());
    }

    if REQUIRED_KEYS.iter().any(|key| !colors.contains_key(*key)) {
        return None;
    }

    Some(Theme {
        name: name.to_string(),
        colors,
        is_custom,
    })
}

fn is_hex_color(value: &str) -> bool {
    let hex = value.strip_prefix('#');
    matches!(hex.map(str::len), Some(6 | 8))
        && hex
            .unwrap_or_default()
            .chars()
            .all(|char| char.is_ascii_hexdigit())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::time::{SystemTime, UNIX_EPOCH};

    #[test]
    fn bundled_themes_parse() {
        let themes = load_bundled();
        assert_eq!(themes.len(), 38);
        assert!(themes.iter().any(|theme| theme.name == "Pomotroid"));
        assert!(themes.iter().any(|theme| theme.name == "Pomotroid Light"));
    }

    #[test]
    fn custom_theme_overrides_bundled_case_insensitively() {
        let base = std::env::temp_dir().join(format!(
            "cheat-sheet-themes-{}",
            SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_nanos()
        ));
        let themes_dir = base.join("themes");
        fs::create_dir_all(&themes_dir).unwrap();
        fs::write(
            themes_dir.join("override.json"),
            r##"{
              "name": "pomotroid",
              "colors": {
                "--color-background": "#111111",
                "--color-background-light": "#222222",
                "--color-background-lightest": "#333333",
                "--color-foreground": "#444444",
                "--color-foreground-darker": "#555555",
                "--color-foreground-darkest": "#666666",
                "--color-accent": "#777777"
              }
            }"##,
        )
        .unwrap();

        let theme = find(&base, "Pomotroid").unwrap();
        assert!(theme.is_custom);
        assert_eq!(theme.colors["--color-background"], "#111111");
        let _ = fs::remove_dir_all(base);
    }
}
