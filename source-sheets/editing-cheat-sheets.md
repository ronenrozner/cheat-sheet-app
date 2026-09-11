---
title: Editing Cheat Sheets
intro: How to write and format the .md files in source-sheets/ so they render correctly in the app.
tags:
  - authoring
  - markdown
  - formatting
categories:
  - Authoring
---

# Editing Cheat Sheets

This doc describes how the source sheets in `source-sheets/` are written and how they render in the
app. Follow it so sheets look right the first time.

The render pipeline is: **front-matter (metadata) → body (Markdown) → sanitized HTML**. Two things
matter: the front-matter the Rust backend reads, and the Markdown the webview renderer accepts.

## The render pipeline

1. Rust (`src-tauri/src/sheets/mod.rs`) reads the file, parses the front-matter, and returns the
   body with front-matter stripped.
2. `src/lib/markdown/render.ts` parses the body with `marked` (GFM), highlights code fences with
   `highlight.js`, then sanitizes with `DOMPurify`.
3. `src/components/SheetView.svelte` renders the result inside a sandboxed iframe.

Everything else is ignored or stripped.

## Front-matter

Put a YAML block at the top of the file, wrapped in `---` lines. The backend reads only four
fields. Keep the block minimal — no Hexo extras.

```yaml
---
title: Bash
intro: Common Bash command-line shortcuts and built-in patterns.
tags:
  - shell
  - linux
categories:
  - Keyboard Shortcuts
---
```

| Field       | Required | Notes                                                        |
| ----------- | -------- | ------------------------------------------------------------ |
| `title`     | Yes      | Sheet name. Shown in the sidebar.                            |
| `intro`     | No       | One-line summary. Falls back to the slug if omitted.         |
| `tags`      | No       | List of keywords.                                          |
| `categories`| No       | Group label, e.g. `Keyboard Shortcuts`.                     |

Do **not** add these (the backend ignores them): `date`, `background`, `plugins`, or any other
Hexo field.

## Supported Markdown

`marked` runs with GFM enabled, plus CommonMark. This renders correctly:

- Headings: `#`, `##`, `###`, …
- **Bold** (`**text**`), _italic_ (`_text_`), `code` (backticks).
- Tables (GFM pipe tables).
- Ordered and unordered lists.
- Links: `[text](url)`.
- Code fences: ```` ```lang ```` with a language tag for syntax highlighting.
- Block quotes, horizontal rules.
- Hard line breaks: two trailing spaces at the end of a line.
- HTML: `<br>`, `<br/>`, `<sub>`, `<sup>`, `<code>`, `<pre>`, `<mark>`, and other tags in the
  HTML profile (see below).

## Supported HTML

`DOMPurify` runs with `USE_PROFILES: { html: true }`, so standard HTML tags render. The app adds
`code`, `pre`, and `mark` explicitly. This renders:

| HTML            | Markdown equivalent | Use                                             |
| --------------- | ------------------- | ----------------------------------------------- |
| `<br>`, `<br/>` | (two trailing spaces) | Force a line break inside a paragraph or cell. |
| `<b>`, `</b>`   | `**text**`          | Bold.                                           |
| `<i>`, `</i>`   | `_text_`            | Italic.                                         |
| `<sub>`, `</sub>` | (no markdown form)  | Subscript. Prefer HTML here.                   |
| `<sup>`, `</sup>` | (no markdown form)  | Superscript. Prefer HTML here.                 |
| `<code>`        | backticks           | Inline code.                                    |
| `<pre>`         | code fence          | Pre-formatted text.                             |
| `<mark>`        | (no standard form)  | Highlight.                                      |
| `<a href="url">`| `[text](url)`       | Link. Prefer Markdown links.                    |

## Not supported — do not write these

These are Hexo-specific or otherwise unsupported. They will render as literal text or be stripped.

| Hexo markup            | What to write instead              |
| ---------------------- | ---------------------------------- |
| `<yel>`, `<pur>`, `<red>` | Plain text (or `<b>`, `<i>`).   |
| `{.class}`, `{#id}`    | Nothing — these are empty attributes. |
| `{data=...}`           | Nothing — drop it from code fences.  |
| `<widget .../>`        | Nothing — widgets are interactive; the app is static. |
| `{{% raw %}}`          | Nothing — not supported.           |
| Pandoc `{.marker-timeline}` | Plain list or table.          |

## Code fences

Use a language tag so `highlight.js` highlights the block. The tag must match a `highlight.js`
language name. Examples:

````markdown
```bash
echo "hello"
```

```python
print("hello")
```

```rust
fn main() {}
```
````

Notes:

- A tag with no known language (e.g. ```` ```shell script ````) renders as plain text. Use a single
  word: ```` ```shell ````.
- Content inside a fence is literal. `<b>`, `<i>`, `<br>` inside a fence are **not** converted —
  they show as literal text.

## Escaped HTML

If you need to show a literal `<b>` or `</b>` (not bold it), escape it with a leading backslash:

```
\<b>bold</\b>
```

The renderer keeps `\<...>` literals as text. Do not escape inside code fences.

## Tables

GFM pipe tables render. Keep cells short and avoid raw `<` in cells unless escaped.

```markdown
| Command | Purpose        |
| ------- | -------------- |
| `ls`    | List files     |
| `cd ..` | Move up a level |
```

## Checklist before saving

- Front-matter has `title` (and `intro` if useful).
- No `date`, `background`, `plugins`, or other Hexo fields.
- No `<yel>`, `<pur>`, `<red>`, `{.class}`, `{#id}`, `{data=...}`, `<widget/>`.
- Code fences use a single-word language tag.
- Bold/italic use `**` / `_` (not `<b>` / `<i>`).
- Subscript/superscript use `<sub>` / `<sup>` (no markdown form).
