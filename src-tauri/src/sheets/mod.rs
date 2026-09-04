//! Sheet model + front-matter parse + directory scan (Task 4).
//!
//! Front-matter (Hexo YAML) + body parsing happens on the JS side per the spec's `lib/sheets`;
//! this module owns the filesystem + slug-listing side and exposes the parsed metadata.
//!
//! Storage dirs (spec):
//! - `app_data_dir/cheatsheets/local/` → user-authored sheets.
//! - `app_data_dir/cheatsheets/upstream/` → downloaded snapshot.

use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

/// Which source a sheet came from.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
pub enum SheetSource {
    Local,
    #[default]
    Upstream,
}

/// One sheet, metadata only (no body — body is on-demand in Task 6).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Sheet {
    /// File stem, e.g. `1password`.
    pub slug: String,
    /// Parsed front-matter `title`, or the slug as a fallback.
    pub title: String,
    /// Front-matter `intro`, empty if absent.
    pub intro: String,
    /// Front-matter `tags`.
    #[serde(default)]
    pub tags: Vec<String>,
    /// Front-matter `categories`.
    #[serde(default)]
    pub categories: Vec<String>,
    /// Source the sheet was read from.
    pub source: SheetSource,
}

/// Split Markdown content into (front-matter YAML block, body).
///
/// Returns `("", content)` when no front-matter is present.
pub fn split_front_matter(content: &str) -> (&str, &str) {
    let trimmed = content.trim_start();
    if !trimmed.starts_with("---") {
        return ("", content);
    }
    // Skip the opening `---`, then find the closing `---`.
    let after_open = &trimmed[3..];
    match after_open.find("---") {
        Some(idx) => {
            let fm = after_open[..idx].trim();
            let body = after_open[idx + 3..].trim_start();
            (fm, body)
        }
        None => ("", content),
    }
}

/// Parse a front-matter YAML block into a `Sheet`.
///
/// Recovers to a fallback title (the slug) on malformed/empty front-matter.
pub fn parse_sheet(slug: &str, content: &str) -> Sheet {
    let (fm, _body) = split_front_matter(content);
    let mut parsed: SheetData = if fm.is_empty() {
        SheetData::default()
    } else {
        serde_yaml::from_str(fm).unwrap_or_default()
    };
    if parsed.title.is_empty() {
        parsed.title = slug.to_string();
    }
    Sheet {
        slug: slug.to_string(),
        title: parsed.title,
        intro: parsed.intro,
        tags: parsed.tags,
        categories: parsed.categories,
        source: SheetSource::Local,
    }
}

/// Front-matter fields we read (Hexo schema — don't invent one).
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
struct SheetData {
    title: String,
    intro: String,
    #[serde(default)]
    tags: Vec<String>,
    #[serde(default)]
    categories: Vec<String>,
}

/// Scan one directory for sheets. Returns metadata for each `.md` file.
///
/// A missing directory yields an empty list (no panic). Malformed front-matter degrades to a
/// fallback title; the sheet is still listed.
pub fn scan_dir(dir: &Path, source: SheetSource) -> Vec<Sheet> {
    let mut sheets = Vec::new();
    let Ok(entries) = std::fs::read_dir(dir) else {
        return sheets;
    };
    for entry in entries.flatten() {
        let path = entry.path();
        if path.extension() != Some("md".as_ref()) {
            continue;
        }
        let Ok(content) = std::fs::read_to_string(&path) else {
            continue;
        };
        let slug = path.file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or_default()
            .to_string();
        let mut sheet = parse_sheet(&slug, &content);
        sheet.source = source;
        sheets.push(sheet);
    }
    sheets
}

/// Resolve the local + upstream sheet directories under `app_data_dir/cheatsheets/`.
pub fn sheet_dirs(app: &AppHandle) -> (PathBuf, PathBuf) {
    let base = app
        .path()
        .resolve("cheatsheets", tauri::path::BaseDirectory::AppData)
        .unwrap_or_else(|_| PathBuf::from("cheatsheets"));
    (base.join("local"), base.join("upstream"))
}

/// List sheets for a source mode (`local` / `both`; `online` lists nothing — online listing is
/// a separate concern in Task 6).
///
/// `local` scans only the local dir; `both` scans local then upstream. A missing dir yields no
/// sheets for that source.
pub fn list_sheets(app: &AppHandle, source_mode: crate::settings::SourceMode) -> Vec<Sheet> {
    let (local, upstream) = sheet_dirs(app);
    match source_mode {
        crate::settings::SourceMode::Local => scan_dir(&local, SheetSource::Local),
        crate::settings::SourceMode::Both => {
            let mut out = scan_dir(&local, SheetSource::Local);
            out.extend(scan_dir(&upstream, SheetSource::Upstream));
            out
        }
        // `online` is resolved via the contents API (Task 6); not part of the dir scan.
        crate::settings::SourceMode::Online => Vec::new(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn fixture(dir: &Path) {
        std::fs::create_dir_all(dir).unwrap();
        std::fs::write(
            dir.join("1password.md"),
            "---\ntitle: 1Password\nintro: A cheat sheet for 1password.\ntags: [tools, login]\ncategories: [Keyboard Shortcuts]\n---\n# Body\n\nSome content.\n",
        )
        .unwrap();
        // Missing front-matter: still listed with the slug as title.
        std::fs::write(dir.join("note.md"), "# Just a body\nno front matter here\n").unwrap();
        // Malformed front-matter: falls back to slug title.
        std::fs::write(
            dir.join("broken.md"),
            "---\n: : : not valid yaml ::: title:\n---\nbody\n",
        )
        .unwrap();
    }

    #[test]
    fn splits_front_matter() {
        let content = "---\ntitle: X\n---\nbody";
        let (fm, body) = split_front_matter(content);
        assert_eq!(fm, "title: X");
        assert_eq!(body, "body");
    }

    #[test]
    fn no_front_matter_returns_empty_block() {
        let (fm, body) = split_front_matter("# just a body");
        assert_eq!(fm, "");
        assert_eq!(body, "# just a body");
    }

    #[test]
    fn parse_reads_all_fields() {
        let sheet = parse_sheet(
            "1password",
            "---\ntitle: 1Password\nintro: A cheat sheet.\ntags: [tools]\ncategories: [Shortcuts]\n---\nbody",
        );
        assert_eq!(sheet.slug, "1password");
        assert_eq!(sheet.title, "1Password");
        assert_eq!(sheet.intro, "A cheat sheet.");
        assert_eq!(sheet.tags, vec!["tools".to_string()]);
        assert_eq!(sheet.categories, vec!["Shortcuts".to_string()]);
        assert_eq!(sheet.source, SheetSource::Local);
    }

    #[test]
    fn parse_missing_title_falls_back_to_slug() {
        let sheet = parse_sheet("note", "---\nintro: only intro\n---\nbody");
        assert_eq!(sheet.title, "note");
    }

    #[test]
    fn parse_malformed_front_matter_recovers_to_slug_title() {
        let sheet = parse_sheet("broken", "---\n: : : ::: ---\nbody");
        assert_eq!(sheet.title, "broken");
    }

    #[test]
    fn scan_returns_expected_slugs() {
        let dir = std::env::temp_dir().join(format!("cs4-scan-{}", std::process::id()));
        fixture(&dir);
        let sheets = scan_dir(&dir, SheetSource::Local);
        let slugs: Vec<String> = sheets.iter().map(|s| s.slug.clone()).collect();
        assert!(slugs.contains(&"1password".to_string()));
        assert!(slugs.contains(&"note".to_string()));
        assert!(slugs.contains(&"broken".to_string()));
        // Front-matter parsed for the well-formed file.
        let pw = sheets.iter().find(|s| s.slug == "1password").unwrap();
        assert_eq!(pw.title, "1Password");
        std::fs::remove_dir_all(&dir).ok();
    }

    #[test]
    fn scan_missing_dir_returns_empty() {
        let missing = PathBuf::from("/definitely/does/not/exist/404");
        assert!(scan_dir(&missing, SheetSource::Local).is_empty());
    }
}
