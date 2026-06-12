// ROUND 35: generate docs/LAYER_ATLAS.md from the leaf instrumentation.
// Source of truth is the layer() calls in src/ — this runs on every build
// (npm prebuild hook) so the atlas cannot drift from the code. The document
// is Anthony's desk-side reference during the Figma build: per component,
// the full layer tree with tokens + bindings, exactly as the learn-mode
// hover cards report them.

import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'src');
const OUT = join(ROOT, 'docs', 'LAYER_ATLAS.md');

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
console.log(`LAYER_ATLAS.md: ${byComponent.size} components, ${leaves.length} leaves`);
