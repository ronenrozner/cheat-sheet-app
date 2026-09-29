//! First-run seeding of bundled out-of-box sheets (spec D1).
//!
//! The bundled sheets live in `src-tauri/bundled/` and are embedded into the binary at compile
//! time via `include_dir!`. On first run we extract every `.md` file into the user's sheet folder
//! `<home>/cheatsheets/`. We seed only when the folder is empty (or missing), so a user's own
//! sheets are never overwritten.

use include_dir::{include_dir, Dir};
use std::path::Path;

/// The embedded bundled sheets. Relative to the crate root (`src-tauri/`).
const BUNDLED: Dir<'_> = include_dir!("bundled");

/// Seed the sheet folder with bundled sheets if it is empty or missing.
///
/// Returns `true` when seeding happened, `false` when the folder already had content (or seeding
/// failed — we fail open, never overwrite user sheets).
///
/// Pure and unit-testable: only needs the target directory, no `AppHandle`.
pub fn seed_bundled(dir: &Path) -> bool {
    if dir.exists() {
        let populated = match std::fs::read_dir(dir) {
            Ok(entries) => entries.flatten().next().is_some(),
            Err(_) => false,
        };
        if populated {
            return false;
        }
    }
    // Only `.md` files; ignore any non-markdown file dropped into the bundled folder.
    let mut seeded = false;
    for file in BUNDLED.files() {
        if file.path().extension().and_then(|e| e.to_str()) != Some("md") {
            continue;
        }
        let Some(contents) = file.contents_utf8() else {
            continue;
        };
        let target = dir.join(file.path());
        match std::fs::write(target, contents) {
            Ok(()) => seeded = true,
            Err(_) => return seeded, // fail open: don't overwrite, don't crash
        }
    }
    seeded
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn bundled_has_at_least_one_md_file() {
        assert!(BUNDLED.files().iter().any(|f| f
            .path()
            .extension()
            .map(|e| e == "md")
            .unwrap_or(false)));
    }

    #[test]
    fn seed_creates_files_in_empty_dir() {
        let dir = std::env::temp_dir().join(format!("cs-seed-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        assert!(seed_bundled(&dir));
        assert!(dir.join("vim.md").exists());
        std::fs::remove_dir_all(&dir).ok();
    }

    #[test]
    fn seed_does_not_overwrite_existing() {
        let dir = std::env::temp_dir().join(format!("cs-seed-existing-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        // Pre-existing content: seeding must be a no-op.
        std::fs::write(dir.join("user.md"), "user content").unwrap();
        assert!(!seed_bundled(&dir));
        assert_eq!(
            std::fs::read_to_string(dir.join("user.md")).unwrap(),
            "user content"
        );
        std::fs::remove_dir_all(&dir).ok();
    }
}
