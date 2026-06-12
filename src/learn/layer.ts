// LEARN MODE v2 (round 35): leaf instrumentation. layer() returns inert
// data-* attributes — zero behavior in production; LayerLens (learn mode
// only) reads them for hover cards and click-to-copy. STRIP BEFORE DEMO
// WEEK with the rest of src/learn/ (remove the marked imports + spreads).
//
// Naming convention (FIGMA_STANDARD §7):
//   Component / region(camelCase) / role.kind
// kinds: text · line · shape · chart · glyph · chip · status
// roles are data-meaningful (name, value, label, needle, arc, track,
// fill, dot, …) — never styling words.

export function layer(path: string, tokens?: string, binds?: string): Record<string, string> {
  const attrs: Record<string, string> = { 'data-layer': path };
  if (tokens) attrs['data-layer-tokens'] = tokens;
  if (binds) attrs['data-layer-binds'] = binds;
  return attrs;
}
