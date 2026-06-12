// Shared card/label styles — ROUND 7: instrument-card grammar. Every framed
// component inherits this: surface/raised + 1px hairline (ink at low alpha)
// + the radius token + tokenized padding. Labels whisper (DM Mono micro-caps,
// letterspaced); values shout (see Stat); supporting data keeps DataRow rhythm.

import { RADIUS } from './probeTokens';

export const gb = {
  // Round 37 — fills, not fences: section cards are FILLED surfaces, no
  // stroke. Border tokens survive only for selection states, status
  // borders (severity voice), and table/divider hairlines.
  box: {
    background: 'var(--color-surface-raised)',
    padding: 'var(--pad-card)',
    borderRadius: RADIUS,
  } as React.CSSProperties,
  boxTight: {
    border: '1px solid var(--color-line-strong)',
    padding: '2px 8px',
    borderRadius: RADIUS,
  } as React.CSSProperties,
  dim: { color: 'var(--color-ink-secondary)' } as React.CSSProperties,
  label: {
    fontFamily: 'var(--font-data)',
    fontSize: 'var(--type-label-size)',
    color: 'var(--color-ink-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: 1.2, // ≈ +11% at 11px — labels whisper
    marginBottom: 'var(--pad-section)',
    display: 'block',
  } as React.CSSProperties,
  big: {
    fontSize: 'var(--type-hero-size)',
    fontWeight: 500,
    fontFamily: 'var(--font-data)',
    fontVariantNumeric: 'tabular-nums',
  } as React.CSSProperties,
  row: { display: 'flex', gap: 8, alignItems: 'stretch', flexWrap: 'wrap' as const },
  stale: { color: 'var(--color-data-stale)', background: 'var(--color-surface-overlay)' } as React.CSSProperties,
};

export function fmtPct(x: number): string {
  return `${x > 0 ? '+' : ''}${x.toFixed(1)}%`;
}

export function fmtDay(t: number): string {
  return new Date(t).toISOString().slice(0, 10);
}

export function fmtTime(t: number): string {
  return new Date(t).toISOString().slice(0, 16).replace('T', ' ') + 'Z';
}
