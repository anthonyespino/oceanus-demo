// Crudest possible sparkline: one grey SVG polyline plus a zero axis. No
// chart library — Recharts arrives with the styled UI, not the greybox.

export function Sparkline({
  values,
  width = 120,
  height = 24,
  zeroBaseline = true, // false: auto-range for series that never approach 0 (e.g. EGT)
}: {
  values: number[];
  width?: number;
  height?: number;
  zeroBaseline?: boolean;
}) {
  if (values.length < 2) return null;
  const min = zeroBaseline ? Math.min(...values, 0) : Math.min(...values);
  const max = zeroBaseline ? Math.max(...values, 0) : Math.max(...values);
  const span = max - min || 1;
  const x = (i: number) => (i / (values.length - 1)) * width;
  const y = (v: number) => height - ((v - min) / span) * height;
  const points = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  return (
    <svg width={width} height={height} style={{ border: '1px solid var(--color-line-subtle)', verticalAlign: 'middle' }}>
      {zeroBaseline && <line x1={0} y1={y(0)} x2={width} y2={y(0)} stroke="var(--color-line-subtle)" strokeWidth={1} />}
      <polyline points={points} fill="none" stroke="var(--color-ink-secondary)" strokeWidth={1} />
    </svg>
  );
}
