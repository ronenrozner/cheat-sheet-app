use std::path::{Path, PathBuf};
use std::sync::mpsc;
use std::time::Duration;

use notify::{Event, RecommendedWatcher, RecursiveMode, Watcher};
use tauri::{AppHandle, Emitter};

use super::{list_all, Theme};

const DEBOUNCE: Duration = Duration::from_millis(500);

pub fn spawn_watcher(app_data_dir: PathBuf, app: AppHandle) -> Option<RecommendedWatcher> {
    let themes_dir = app_data_dir.join("themes");
    if let Err(error) = std::fs::create_dir_all(&themes_dir) {
        log::warn!("[themes/watcher] failed to create themes dir: {error}");
        return None;
    }

    let (tx, rx) = mpsc::channel::<notify::Result<Event>>();
    let mut watcher = match RecommendedWatcher::new(tx, notify::Config::default()) {
        Ok(watcher) => watcher,
        Err(error) => {
            log::warn!("[themes/watcher] failed to create watcher: {error}");
            return None;
        }
    };

    if let Err(error) = watcher.watch(&themes_dir, RecursiveMode::NonRecursive) {
        log::warn!(
            "[themes/watcher] failed to watch {}: {error}",
            themes_dir.display()
        );
        return None;
    }

    std::thread::Builder::new()
        .name("themes-watcher".to_string())
        .spawn(move || debounce_loop(rx, &app_data_dir, &app))
        .ok();

    Some(watcher)
}

fn debounce_loop(rx: mpsc::Receiver<notify::Result<Event>>, app_data_dir: &Path, app: &AppHandle) {
    while let Ok(first) = rx.recv() {
        match first {
            Err(error) => {
                log::warn!("[themes/watcher] watch error: {error}");
                continue;
            }
            Ok(event)
                if matches!(
                    event.kind,
                    notify::EventKind::Access(_)
                        | notify::EventKind::Modify(notify::event::ModifyKind::Metadata(_))
                ) =>
            {
                continue;
            }
            Ok(_) => {}
        }

        drain_within(&rx, DEBOUNCE);
        reload_and_emit(app_data_dir, app);
    }
}

fn drain_within(rx: &mpsc::Receiver<notify::Result<Event>>, window: Duration) {
    let deadline = std::time::Instant::now() + window;
    loop {
        let remaining = deadline.saturating_duration_since(std::time::Instant::now());
        if remaining.is_zero() {
            break;
        }
        if rx.recv_timeout(remaining).is_err() {
            break;
        }
    }
}

fn reload_and_emit(app_data_dir: &Path, app: &AppHandle) {
    let themes: Vec<Theme> = list_all(app_data_dir);
    if let Err(error) = app.emit("themes:changed", &themes) {
        log::warn!("[themes/watcher] emit error: {error}");
    }
}
