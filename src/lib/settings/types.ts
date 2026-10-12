// Frontend settings model (Task 12).
//
// Mirrors `src-tauri/src/settings/mod.rs` `Settings`. The backend owns the on-disk format; this
// module types it for the UI and the bridge passes it through `get_settings` / `set_settings`.
//
// The enum string values below are the exact JSON the Rust enums serialize to (unit-variant enums
// with no `#[serde(rename)]`), e.g. `Theme::Follow` -> `"Follow"`. Keep them in sync with the Rust
// enum variant names.

/** Persisted UI theme. */
export type Theme = 'Light' | 'Dark' | 'Follow';

/** User-selectable JSON theme entry. */
export interface ThemeDefinition {
  name: string;
  colors: Record<string, string>;
  is_custom: boolean;
}

/** Overlay window size in pixels. */
export interface WinSize {
  width: number;
  height: number;
}

/** Overlay window position in pixels. */
export interface WinPosition {
  x: number;
  y: number;
}

/** Whether to save overlay geometry when the user moves or resizes it. */
export type SaveWindowGeometry = 'Off' | 'On';

/** Overlay trigger key combo, as raw key parts (no aliasing — Task 7 normalizes authored combos). */
export interface TriggerKey {
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  key: string;
}

/** Which sheet sources are visible. */
export type SourceMode = 'Online' | 'Local' | 'Both';

/** UI locale. */
export type Language = 'EnUs' | 'EsEs' | 'FrFr';

/** Whether to show a persistent system tray icon (Task 17). Default off. */
export type ShowTray = 'Off' | 'On';

/** Whether the overlay stays above other windows (Task 18). Default on. */
export type AlwaysOnTop = 'On' | 'Off';

/** Modifier required to open links in sheets. */
export type OpenLinksModifier = 'None' | 'Click' | 'Ctrl' | 'Alt';

/** Full persisted settings snapshot. */
export interface Settings {
  theme: Theme;
  theme_light: string;
  theme_dark: string;
  win_size: WinSize;
  win_position: WinPosition;
  save_window_geometry: SaveWindowGeometry;
  trigger: TriggerKey;
  find_shortcut: TriggerKey;
  source_mode: SourceMode;
  language: Language;
  pinned_slug: string;
  dataDir: string;
  show_tray: ShowTray;
  always_on_top: AlwaysOnTop;
  open_links: OpenLinksModifier;
  /** Editor executable path. Empty means use the system default editor for .md files. */
  editor_path: string;
}

/**
 * Default snapshot. Default trigger is `Ctrl+Shift+Q` (`ctrl=true, alt=false, shift=true,
 * key="q"`), set in `Settings::default()` in Rust. The UI defaults to this. Default `show_tray`
 * is `Off` so a new install keeps the original hidden-window-only behavior. Default `always_on_top`
 * is `On` so a new install keeps the overlay above other windows.
 */
export const DEFAULT_SETTINGS: Settings = {
  theme: 'Follow',
  theme_light: 'Cheatsheet Light',
  theme_dark: 'Cheatsheet',
  win_size: { width: 1000, height: 900 },
  win_position: { x: 0, y: 0 },
  save_window_geometry: 'Off',
  trigger: { ctrl: true, alt: false, shift: true, key: 'q' },
  find_shortcut: { ctrl: true, alt: false, shift: false, key: 'f' },
  source_mode: 'Both',
  language: 'EnUs',
  pinned_slug: '',
  dataDir: 'cheatsheets',
  show_tray: 'Off',
  always_on_top: 'On',
  open_links: 'None',
  editor_path: '',
};
