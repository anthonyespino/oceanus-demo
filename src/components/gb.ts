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
    fontSize: 'var(--type-hero)', /* round 86: was --type-hero-size (30); HERO tier now 20 */
    fontWeight: 500,
    fontFamily: 'var(--font-data)',
    fontVariantNumeric: 'tabular-nums',
  } as React.CSSProperties,
  row: { display: 'flex', gap: 8, alignItems: 'stretch', flexWrap: 'wrap' as const },
  stale: { color: 'var(--color-data-stale)', background: 'var(--color-surface-overlay)' } as React.CSSProperties,
};

// ROUND 97: SURFACE GLASS (dev toggle, attempt #5) for the floating sections
// (CommandBand, voyage bar, Fleet Plot, FleetHealthBand — backgrounds removed in
// 94/96). HARD bounds = instrument-glass, not SaaS:
//   · near-OPAQUE fill (0.82) — the surface reads as matter-of-fact SOLID;
//   · VERY subtle backdrop-blur — the Calm Sea gradient diffracts through as a
//     faint cue, never a clear translucent pane;
//   · NO glow, NO bright edge, NO stroke (borderless-fills holds — the edge is
//     just fill meeting blur).
// Severity stays SHARP: backdrop-filter blurs only what is BEHIND the panel,
// never the panel's own content (gold values / arcs render full-strength on top).
export const glassFill: React.CSSProperties = {
  background: 'rgba(24, 24, 24, 0.82)', // surface-raised (#181818) near-opaque
  backdropFilter: 'blur(3px)',
  WebkitBackdropFilter: 'blur(3px)',
  borderRadius: RADIUS,
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
