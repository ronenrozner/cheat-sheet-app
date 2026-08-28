//! Sheet pipeline: directory scan, tarball download + extract, source-mode resolution (Tasks 4, 6).
//!
//! Front-matter (Hexo YAML) + body parsing happens on the JS side (`src/lib/sheets`); this module
//! owns filesystem + network + slug-listing. Empty in the Task 1 scaffold.
