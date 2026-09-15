// Overlay hotkey status types (Task 14).
//
// Mirrors the Rust `HotkeyStatus` and `WaylandSnippets` structs exposed via the `get_hotkey_status`
// and `get_wayland_snippets` IPC commands. Tauri serializes the Rust snake_case fields as-is, so
// these DTOs use snake_case too. These are plain DTOs — the component layer reads them to flag the
// Wayland best-effort path and show the `--toggle` compositor snippets.

/** Hotkey snapshot reported by `get_hotkey_status` (Rust `HotkeyStatus`). */
export interface HotkeyStatus {
  /** `windows` / `macos` / `linux` / `other`. */
  platform: string;
  /** Linux session label (`x11` / `wayland` / other), or null off Linux. */
  linux_session: string | null;
  /** Whether the OS-level global hotkey actually registered. */
  hotkey_available: boolean;
  /** Human-readable status, surfaced by the UI. */
  message: string;
}

/** Wayland `--toggle` compositor bind snippets (Rust `WaylandSnippets`). */
export interface WaylandSnippets {
  /** Hyprland `bind =` line. */
  hyprland: string;
  /** Sway `bindsym` line. */
  sway: string;
  /** GNOME: manual *Custom Shortcuts* steps. */
  gnome: string;
}

/** Whether the overlay hotkey path is available on the active platform. */
export function isHotkeyAvailable(status: HotkeyStatus | null): boolean {
  return status?.hotkey_available ?? false;
}

/** Whether the active session is Wayland (drives the best-effort + flagged UI). */
export function isWayland(status: HotkeyStatus | null): boolean {
  return status?.linux_session === 'wayland';
}
