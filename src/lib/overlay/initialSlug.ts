// Overlay initial-slug resolution (Task 11).
//
// When the overlay opens, decide which sheet to show front-and-center:
//   1. the user's pinned sheet (if pinned AND still available), else
//   2. a bundled app-authored default (CC0/MIT, spec D1), if any is available, else
//   3. the first available sheet.
//
// This is pure and unit-testable in Node (no DOM/Svelte). The component layer reads
// `settings.pinned_slug` and calls `resolveInitialSlug` once on mount.

/**
 * Bundled app-authored default slugs, in preferred order.
 *
 * Mirrors `src-tauri/bundled/` (seeded into `<home>/cheatsheets/` on first run). This is the only
 * place the frontend knows the bundled set, so keep it in sync with that folder.
 */
export const BUNDLED_DEFAULTS = ['bash', 'git', 'powershell', 'vim', 'windows'] as const;

/**
 * Resolve the sheet to show on overlay open.
 *
 * @param pinnedSlug - the user's pinned slug. Empty/absent means no pin yet (first run).
 * @param available - the slugs currently in the overlay.
 * @returns the slug to select, or `''` when nothing is available.
 */
export function resolveInitialSlug(pinnedSlug: string, available: string[]): string {
  const availableSet = new Set(available);
  // Nothing to show.
  if (availableSet.size === 0) {
    return '';
  }
  // The user's pin wins when it is still a real, available sheet.
  if (pinnedSlug && availableSet.has(pinnedSlug)) {
    return pinnedSlug;
  }
  // First run (no pin): prefer a bundled app-authored default, in configured order.
  const bundled = BUNDLED_DEFAULTS.find((slug) => availableSet.has(slug));
  if (bundled) {
    return bundled;
  }
  // No pin and no bundled default: fall back to the first available sheet.
  return available[0] ?? '';
}
