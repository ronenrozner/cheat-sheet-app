// Find-in-current-sheet search (Task 8).
//
// Searches the raw Markdown body of the sheet currently open in the HUD. NL only. No cross-sheet
// index, no combo matching. Highlights matches inline by inserting <mark> markers into the Markdown
// before it is rendered (render.ts allows <mark>).
//
// The search runs on the raw Markdown body, so query matches run against headings, tables, code
// spans, and prose as authored. Plain-text queries work best; queries containing Markdown syntax
// (e.g. backticks) may render oddly because the <mark> wrapper is inserted around Markdown text.

/** Escape regex metacharacters so the query matches literally. */
function escapeForRegex(query: string): string {
  return query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Find all match offsets of `query` in `body`.
 *
 * Returns character offsets into `body`. Case-insensitive. Trims the query first, so surrounding
 * whitespace does not change what matches. Empty/whitespace query returns [].
 */
export function findMatches(body: string, query: string): number[] {
  const q = query.trim();
  if (!q) return [];
  const re = new RegExp(escapeForRegex(q), 'gi');
  const offsets: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    offsets.push(m.index);
  }
  return offsets;
}

/**
 * Highlight all matches of `query` in `body`.
 *
 * Returns Markdown with <mark> markers around each match. Empty/whitespace query, or no match,
 * returns `body` unchanged. Markers are inserted from the last match backward so earlier offsets
 * stay valid.
 */
export function highlightMarkdown(body: string, query: string): string {
  const q = query.trim();
  if (!q) return body;
  const matches = findMatches(body, query);
  if (matches.length === 0) return body;
  let result = body;
  for (let i = matches.length - 1; i >= 0; i--) {
    const start = matches[i] ?? 0;
    const end = start + q.length;
    result =
      result.slice(0, start) + `<mark>${result.slice(start, end)}</mark>` + result.slice(end);
  }
  return result;
}
