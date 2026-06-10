// Shared greybox style tokens. Greyscale only — color semantics are Anthony's
// design decision and do not exist in this codebase.

export const gb = {
  box: { border: '1px solid #999', padding: 8 } as React.CSSProperties,
  boxTight: { border: '1px solid #999', padding: '2px 6px' } as React.CSSProperties,
  dim: { color: '#777' } as React.CSSProperties,
  label: { fontSize: 11, color: '#777', textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  big: { fontSize: 22, fontWeight: 700 } as React.CSSProperties,
  row: { display: 'flex', gap: 8, alignItems: 'stretch', flexWrap: 'wrap' as const },
  stale: { color: '#999', background: '#f2f2f2' } as React.CSSProperties,
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
