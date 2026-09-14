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

/** Full persisted settings snapshot. */
export interface Settings {
  theme: Theme;
  win_size: WinSize;
  trigger: TriggerKey;
  source_mode: SourceMode;
  language: Language;
  pinned_slug: string;
}

/**
 * Default snapshot. Default trigger is `Ctrl+Shift+Q` (`ctrl=true, alt=false, shift=true,
 * key="q"`), set in `Settings::default()` in Rust. The UI defaults to this.
 */
export const DEFAULT_SETTINGS: Settings = {
  theme: 'Follow',
  win_size: { width: 800, height: 900 },
  trigger: { ctrl: true, alt: false, shift: true, key: 'q' },
  source_mode: 'Both',
  language: 'EnUs',
  pinned_slug: '',
};
