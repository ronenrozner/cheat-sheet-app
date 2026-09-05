//! Online sheet listing via the GitHub contents API, cached locally (Task 6).
//!
//! No download in Task 6. Per-file download to the local folder is a later stage. There is no
//! online viewing — a sheet is viewed only after download. Only `.md` files are listed.
//!
//! The contents API returns `{ name, path, type, sha, ... }` objects (no front-matter). We keep
//! only `.md` files and derive the slug from the file name. The title falls back to the slug
//! (front-matter is not fetched here — that would be one request per sheet).

use std::io::Write;
use std::path::{Path, PathBuf};

use tauri::{AppHandle, Manager};

use crate::sheets::{Sheet, SheetSource};

/// GitHub contents-API URL for the upstream `source/_posts/` directory on branch `main`.
///
/// Paginated with `per_page=100`.
const CONTENTS_API_URL: &str = "https://api.github.com/repos/Fechin/reference/contents/source/_posts?ref=main&per_page=100";

/// Cache file name under `app_config_dir/`.
const CACHE_FILE: &str = "online_listing.json";

/// Parse one page of the contents-API response into online sheets.
///
/// Only entries of type `file` whose name ends in `.md` are kept. The slug is the file name
/// without the `.md` suffix. The title falls back to the slug. Malformed input yields an empty
/// list (no panic), so a bad cache or API response degrades gracefully.
pub fn parse_contents_api_response(body: &str) -> Vec<Sheet> {
    let items: serde_json::Value = serde_json::from_str(body).unwrap_or_else(
        |_| serde_json::Value::Array(Vec::new()),
    );
    let mut sheets = Vec::new();
    if let Some(arr) = items.as_array() {
        for item in arr {
            let Some(name) = item.get("name").and_then(|v| v.as_str()) else {
                continue;
            };
            // Only `.md` files. Skip tarballs and other file types.
            let ext = Path::new(name)
                .extension()
                .and_then(|s| s.to_str())
                .unwrap_or_default();
            if !ext.eq_ignore_ascii_case("md") {
                continue;
            }
            let slug = name.trim_end_matches(".md");
            sheets.push(Sheet {
                slug: slug.to_string(),
                title: slug.to_string(),
                intro: String::new(),
                tags: Vec::new(),
                categories: Vec::new(),
                source: SheetSource::Online,
            });
        }
    }
    sheets
}

/// Read the cache at `path`. Returns an empty list when the file is missing or unreadable.
pub fn read_cache(path: &Path) -> Vec<Sheet> {
    match std::fs::read_to_string(path) {
        Ok(body) => serde_json::from_str(&body).unwrap_or_default(),
        Err(_) => Vec::new(),
    }
}

/// Write the cache at `path` with an atomic write (temp file + rename).
pub fn write_cache(path: &Path, sheets: &[Sheet]) -> Result<(), String> {
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let body = serde_json::to_string_pretty(sheets).map_err(|e| e.to_string())?;
    let tmp = path.with_extension("json.tmp");
    {
        let mut f = std::fs::File::create(&tmp).map_err(|e| e.to_string())?;
        f.write_all(body.as_bytes()).map_err(|e| e.to_string())?;
    }
    std::fs::rename(&tmp, path).map_err(|e| e.to_string())?;
    Ok(())
}

/// Resolve the cache path under `app_config_dir/`.
fn cache_path(app: &AppHandle) -> PathBuf {
    app.path()
        .resolve(CACHE_FILE, tauri::path::BaseDirectory::AppData)
        .unwrap_or_else(|_| PathBuf::from(CACHE_FILE))
}

/// Load the cached online listing (offline). Returns an empty list when the cache is absent.
pub fn load_cached(app: &AppHandle) -> Vec<Sheet> {
    read_cache(&cache_path(app))
}

/// Fetch the online listing from the contents API, caching it locally.
///
/// Cache-first: a non-empty cache is returned without network. Otherwise the API is queried
/// (paginated, `.md` only), the result is cached atomically, and returned. A network failure
/// returns an empty list (no panic).
pub fn fetch_online_listing(app: &AppHandle) -> Vec<Sheet> {
    let cached = load_cached(app);
    if !cached.is_empty() {
        return cached;
    }
    let mut all = Vec::new();
    let mut page = 1;
    loop {
        let url = format!("{}&page={}", CONTENTS_API_URL, page);
        let body = match http_get(&url) {
            Ok(b) => b,
            Err(_) => break,
        };
        let page_sheets = parse_contents_api_response(&body);
        if page_sheets.is_empty() {
            break;
        }
        all.extend(page_sheets.iter().cloned());
        // Stop on the last (partial) page.
        if page_sheets.len() < 100 {
            break;
        }
        page += 1;
    }
    if !all.is_empty() {
        let _ = write_cache(&cache_path(app), &all);
    }
    all
}

/// Minimal HTTPS GET. Returns the response body as a string.
fn http_get(url: &str) -> Result<String, String> {
    let agent = ureq::Agent::new();
    let resp = agent
        .get(url)
        .call()
        .map_err(|e| e.to_string())?;
    resp.into_string().map_err(|e| e.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn page(items: &[(&str, &str)]) -> String {
        let mut arr = Vec::new();
        for (i, (name, item_type)) in items.iter().enumerate() {
            arr.push(serde_json::json!({
                "name": name,
                "path": name,
                "type": item_type,
                "sha": format!("sha{}", i),
            }));
        }
        serde_json::to_string(&arr).unwrap()
    }

    #[test]
    fn parse_keeps_only_md_files() {
        let body = page(&[
            ("1password.md", "file"),
            ("notes.txt", "file"),
            ("archive.tar.gz", "file"),
            ("dir", "dir"),
            ("vim.md", "file"),
        ]);
        let sheets = parse_contents_api_response(&body);
        let slugs: Vec<String> = sheets.iter().map(|s| s.slug.clone()).collect();
        assert_eq!(slugs, vec!["1password".to_string(), "vim".to_string()]);
        // Title falls back to the slug; no body is fetched.
        let pw = sheets.iter().find(|s| s.slug == "1password").unwrap();
        assert_eq!(pw.title, "1password");
        assert_eq!(pw.source, SheetSource::Online);
    }

    #[test]
    fn parse_empty_body_yields_empty_list() {
        assert!(parse_contents_api_response("").is_empty());
        assert!(parse_contents_api_response("not json").is_empty());
    }

    #[test]
    fn cache_round_trip_is_atomic_and_reusable() {
        let dir = std::env::temp_dir().join(format!("cs6-cache-{}", std::process::id()));
        let cache = dir.join(CACHE_FILE);
        std::fs::create_dir_all(&dir).unwrap();

        let input = vec![
            Sheet {
                slug: "a".to_string(),
                title: "a".to_string(),
                intro: String::new(),
                tags: Vec::new(),
                categories: Vec::new(),
                source: SheetSource::Online,
            },
            Sheet {
                slug: "b".to_string(),
                title: "b".to_string(),
                intro: String::new(),
                tags: Vec::new(),
                categories: Vec::new(),
                source: SheetSource::Online,
            },
        ];
        write_cache(&cache, &input).unwrap();

        let loaded = read_cache(&cache);
        let slugs: Vec<String> = loaded.iter().map(|s| s.slug.clone()).collect();
        assert_eq!(slugs, vec!["a".to_string(), "b".to_string()]);

        // No temp file left behind.
        assert!(!dir.join("online_listing.json.tmp").exists());
        std::fs::remove_dir_all(&dir).ok();
    }

    #[test]
    fn read_missing_cache_returns_empty() {
        let missing = PathBuf::from("/definitely/does/not/exist/6/cache.json");
        assert!(read_cache(&missing).is_empty());
    }
}
