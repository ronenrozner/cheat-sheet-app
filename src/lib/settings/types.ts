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

/** Overlay trigger key combo, as raw key parts (no aliasing — Task 7 normalizes authored combos). */
export interface TriggerKey {
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  key: string;
}

/** Which sheet sources are visible. */
export type SourceMode = 'Online' | 'Local' | 'Both';

/** UI locale. v1 ships only `en-US`; any other value is a graceful no-op (Task 13). */
export type Language = 'EnUs';

/** Whether to show a persistent system tray icon (Task 17). Default off. */
export type ShowTray = 'Off' | 'On';

/** Whether the overlay stays above other windows (Task 18). Default on. */
export type AlwaysOnTop = 'On' | 'Off';

/** Full persisted settings snapshot. */
export interface Settings {
  theme: Theme;
  theme_light: string;
  theme_dark: string;
  win_size: WinSize;
  trigger: TriggerKey;
  source_mode: SourceMode;
  language: Language;
  pinned_slug: string;
  show_tray: ShowTray;
  always_on_top: AlwaysOnTop;
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
  win_size: { width: 800, height: 900 },
  trigger: { ctrl: true, alt: false, shift: true, key: 'q' },
  source_mode: 'Both',
  language: 'EnUs',
  pinned_slug: '',
  show_tray: 'Off',
  always_on_top: 'On',
};
