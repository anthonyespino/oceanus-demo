// Shared card/label styles — ROUND 4: re-pointed at the dark token system.
// Geometry unchanged from the greybox; only values moved to tokens.

export const gb = {
  box: {
    border: '1px solid var(--color-line-subtle)',
    background: 'var(--color-surface-raised)',
    padding: 8,
    borderRadius: 6,
  } as React.CSSProperties,
  boxTight: { border: '1px solid var(--color-line-strong)', padding: '2px 6px', borderRadius: 6 } as React.CSSProperties,
  dim: { color: 'var(--color-ink-secondary)' } as React.CSSProperties,
  label: {
    fontSize: 11,
    color: 'var(--color-ink-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  big: { fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-data)', fontVariantNumeric: 'tabular-nums' } as React.CSSProperties,
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
