use tauri_plugin_opener::OpenerExt;

const SOURCE_CODE_URL: &str = "https://github.com/ronenrozner/cheat-sheet-app";

fn is_allowed_external_url(url: &str) -> bool {
    url == SOURCE_CODE_URL
}

#[tauri::command]
pub fn open_external_url(app: tauri::AppHandle, url: String) -> Result<(), String> {
    if !is_allowed_external_url(&url) {
        return Err("external URL is not allowed".to_string());
    }

    app.opener()
        .open_url(url, None::<&str>)
        .map_err(|error| error.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn source_code_url_is_allowed() {
        assert!(is_allowed_external_url(SOURCE_CODE_URL));
    }

    #[test]
    fn other_urls_are_rejected() {
        assert!(!is_allowed_external_url("https://example.com"));
        assert!(!is_allowed_external_url("file:///etc/passwd"));
    }
}
