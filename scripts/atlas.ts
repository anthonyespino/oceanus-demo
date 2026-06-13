// ROUND 35: generate docs/LAYER_ATLAS.md from the leaf instrumentation.
// Source of truth is the layer() calls in src/ — this runs on every build
// (npm prebuild hook) so the atlas cannot drift from the code. The document
// is Anthony's desk-side reference during the Figma build: per component,
// the full layer tree with tokens + bindings, exactly as the learn-mode
// hover cards report them.

import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'src');
const OUT = join(ROOT, 'docs', 'LAYER_ATLAS.md');
const OUT_FIGMA = join(ROOT, 'docs', 'LAYER_ATLAS_FIGMA.md'); // round 40: sketch cheat sheet
const OUT_JSON = join(ROOT, 'docs', 'atlas.json'); // round 40: scrape match index

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith('.tsx') || p.endsWith('.ts')) out.push(p);
  }
  return out;
}

interface Leaf { path: string; tokens?: string; binds?: string; file: string }

const RE = /layer\(\s*'([^']+)'(?:\s*,\s*'([^']*)')?(?:\s*,\s*'([^']*)')?\s*\)/g;
const leaves: Leaf[] = [];
for (const file of walk(SRC)) {
  if (file.includes(`${join('src', 'learn')}`)) continue; // the system itself, not instrumentation
  const text = readFileSync(file, 'utf8');
  for (const m of text.matchAll(RE)) {
    leaves.push({ path: m[1], tokens: m[2], binds: m[3], file: file.slice(ROOT.length + 1) });
  }
}

// ---- round 49: glyph library registry ----
// The PATHS keys in Glyph.tsx ARE the icon library. Emit them as glyph.{name}
// library entries so the scrape-glyphs command knows which components to pull
// and the cheat sheet lists the nameable icons. `drawn` = an SVG already
// exists in docs/glyphs-import/ (Glyph prefers it over the placeholder).
const glyphSrc = readFileSync(join(SRC, 'components', 'Glyph.tsx'), 'utf8');
const pathsBlock = glyphSrc.slice(glyphSrc.indexOf('const PATHS'), glyphSrc.indexOf('};', glyphSrc.indexOf('const PATHS')));
const glyphNames = [...pathsBlock.matchAll(/^\s*'?([a-zA-Z][\w.-]*)'?\s*:/gm)].map((m) => m[1]).filter((n) => n !== 'PATHS');
const importDir = join(ROOT, 'docs', 'glyphs-import');
const drawn = new Set(
  (existsSync(importDir) ? readdirSync(importDir) : []).filter((f) => f.endsWith('.svg')).map((f) => f.slice(0, -4)),
);
// Figma frame name uses the slash namespace (glyph/wind); code GlyphName is
// the bare {name}; import file is {name}.svg — the three align so a pulled
// SVG wires automatically.
const glyphLibrary = glyphNames.map((name) => ({ component: `glyph/${name}`, name, importFile: `${name}.svg`, drawn: drawn.has(name) }));

// group by component (first path segment), de-dup identical paths
const byComponent = new Map<string, Leaf[]>();
for (const leaf of leaves) {
  const comp = leaf.path.split(' / ')[0];
  let arr = byComponent.get(comp);
  if (!arr) byComponent.set(comp, (arr = []));
  if (!arr.some((l) => l.path === leaf.path)) arr.push(leaf);
}

const lines: string[] = [
  '# LAYER ATLAS',
  '',
  '**Auto-generated on every build from the `layer()` instrumentation — do not edit.**',
  'Per component: the layer tree with tokens + bindings, exactly as the learn-mode',
  'hover cards report. Naming: `Component / region(camelCase) / role.kind`;',
  'kinds: text · line · shape · chart · glyph · chip · status. Click any element',
  'in learn mode (L) to copy its layer path for the Figma layer-name field.',
  '',
];

for (const comp of [...byComponent.keys()].sort()) {
  const items = byComponent.get(comp)!;
  lines.push(`## ${comp}`, '', `*source: ${items[0].file}*`, '');
  // stable order: by region then role
  items.sort((a, b) => a.path.localeCompare(b.path));
  for (const l of items) {
    const rest = l.path.split(' / ').slice(1).join(' / ');
    lines.push(`- \`${rest}\``);
    if (l.tokens) lines.push(`  - TOKENS — ${l.tokens}`);
    if (l.binds) lines.push(`  - BINDS — ${l.binds}`);
  }
  lines.push('');
}

lines.push(`*${leaves.length} instrumented leaves · ${byComponent.size} components · generated ${new Date().toISOString()}*`, '');

mkdirSync(join(ROOT, 'docs'), { recursive: true });
writeFileSync(OUT, lines.join('\n'));

// ---- round 40: Figma cheat sheet (grouped component → region → leaf) ----
// "What can I name today" — Anthony names a Figma layer to match a path here
// and the scrape (Figma → code) recognizes it automatically.
function regionOf(path: string): string {
  const parts = path.split(' / ');
  return parts.length >= 3 ? parts[1] : '(root)';
}
function leafOf(path: string): string {
  const parts = path.split(' / ');
  return parts.length >= 3 ? parts.slice(2).join(' / ') : parts[parts.length - 1];
}

const fig: string[] = [
  '# LAYER ATLAS — FIGMA CHEAT SHEET',
  '',
  '**Auto-generated — do not edit.** The "what can I name today" reference while',
  'sketching. Name a Figma layer to match a path below and `scrape {frame}` binds',
  'it automatically. Unnamed layers are ignored; unrecognized names are noted, not',
  'applied. Convention: `Component / region(camelCase) / role.kind` — name the layer',
  '`region / role.kind` inside a frame named for the component (or use the full path).',
  '',
];
for (const comp of [...byComponent.keys()].sort()) {
  fig.push(`## ${comp}`, '');
  const items = [...byComponent.get(comp)!].sort((a, b) => a.path.localeCompare(b.path));
  let region: string | null = null;
  for (const l of items) {
    const r = regionOf(l.path);
    if (r !== region) { fig.push(`  Region: ${r}`); region = r; }
    const meta = [l.tokens, l.binds].filter(Boolean).join(' · ');
    fig.push(`    • ${leafOf(l.path)}${meta ? `  → ${meta}` : ''}`);
  }
  fig.push('');
}
// round 48: glyph library section — name a Figma frame `glyph/{name}` and
// `scrape glyphs` pulls it to docs/glyphs-import/{name}.svg
fig.push('## Glyph library (icon components)', '',
  '  Name a Figma frame for the matching path; `scrape glyphs` pulls + normalizes it.',
  '  ✓ = a drawn SVG is already in docs/glyphs-import/ (else placeholder pictogram).', '');
for (const g of glyphLibrary) fig.push(`    ${g.drawn ? '✓' : '·'} ${g.component}  → ${g.importFile}`);
fig.push('');
fig.push(`*${leaves.length} leaves · ${byComponent.size} components · ${glyphLibrary.length} glyphs (${glyphLibrary.filter((g) => g.drawn).length} drawn) · generated ${new Date().toISOString()}*`, '');
writeFileSync(OUT_FIGMA, fig.join('\n'));

// ---- round 40: machine-readable index the scrape matches layer names against --
const index = {
  generated: new Date().toISOString(),
  convention: 'Component / region(camelCase) / role.kind',
  kinds: ['text', 'line', 'shape', 'chart', 'glyph', 'chip', 'status'],
  leaves: [...byComponent.entries()].flatMap(([comp, items]) =>
    items.map((l) => ({
      path: l.path,
      component: comp,
      region: regionOf(l.path),
      leaf: leafOf(l.path),
      tokens: l.tokens ?? null,
      binds: l.binds ?? null,
      file: l.file,
    })),
  ),
  // round 48: the icon library — scrape-glyphs targets (glyph/{name})
  glyphLibrary,
};
writeFileSync(OUT_JSON, JSON.stringify(index, null, 2) + '\n');

console.log(`atlas: ${byComponent.size} components, ${leaves.length} leaves, ${glyphLibrary.length} glyphs (${glyphLibrary.filter((g) => g.drawn).length} drawn)`);
