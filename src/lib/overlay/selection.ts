// Overlay sheet selection (Task 10).
//
// The selected sheet (`slug`) is the single source of truth shared across the overlay: the
// Sidebar switches it, the SearchBox highlights matches in it, and SheetView renders it. This
// module owns the switching logic so the component layer stays thin and the logic is unit-testable
// in Node (no DOM/Svelte needed).

/** Minimal selection shape the component layer binds to. */
export interface Selection {
  /** Currently selected sheet slug (empty = nothing selected). */
  slug: string;
  /** List of available slugs to display in the Sidebar. */
  slugs: string[];
}

/** Create an isolated selection store. */
export function createSelection(initial: string = '', slugs: string[] = []): Selection {
  return { slug: initial, slugs };
}

/**
 * Switch the selected sheet.
 *
 * Ignores a slug that is not in `slugs` (returns false). Switching to the current slug is a no-op
 * (returns false). Returns true when the selection actually changed.
 */
export function selectSheet(
  selection: Selection,
  slug: string
): { selection: Selection; changed: boolean } {
  if (!selection.slugs.includes(slug)) {
    return { selection, changed: false };
  }
  if (selection.slug === slug) {
    return { selection, changed: false };
  }
  return { selection: { ...selection, slug }, changed: true };
}

/** Resolve the first available slug, for a default selection. */
export function firstSlug(selection: Selection): string | undefined {
  return selection.slugs[0];
}
