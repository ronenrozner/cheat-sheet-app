// Combo normalizer (Task 7).
//
// Spec alias map (case-insensitive):
//   win / windows / super / mod / cmd -> WIN (Linux→Super)
//   alt / option / ⌥ -> ALT
//   ctrl / control / ⌃ -> CTRL
//   shift / ⇧ -> SHIFT
// Separators: `+` or whitespace.
//
// Tokens not in the alias map are upper-cased (literal keys like `V`). No per-platform remap of
// authored combos in v1.

const ALIAS = {
  win: "WIN",
  windows: "WIN",
  super: "WIN",
  mod: "WIN",
  cmd: "WIN",
  alt: "ALT",
  option: "ALT",
  "⌥": "ALT",
  ctrl: "CTRL",
  control: "CTRL",
  "⌃": "CTRL",
  shift: "SHIFT",
  "⇧": "SHIFT",
} as const;

/** "Win+Alt+V" / "Control Shift V" → ["WIN","ALT","V"] */
export function normalizeCombo(input: string): string[] {
  return input
    .split(/\s*[\s+]+\s*/)
    .map((tok) => ALIAS[tok.toLowerCase()] ?? tok.toUpperCase())
    .filter((tok) => tok.length > 0);
}
