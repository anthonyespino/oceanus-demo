'use client';
// ROUND 11: shared radial gauge primitive — marine-bridge instrument style.
// One arc, one needle, DM Mono value, micro label. Neutral ink arcs; a
// status-colored band ONLY where an operating limit exists. No decorative
// color. Five dials, one primitive.

import { FONT, NEUTRAL } from './probeTokens';

const A0 = -210; // sweep start (degrees)
const A1 = 30; // sweep end

function polar(cx: number, cy: number, deg: number, r: number): { x: number; y: number } {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
function arcPath(cx: number, cy: number, fromDeg: number, toDeg: number, r: number): string {
  const a = polar(cx, cy, fromDeg, r);
  const b = polar(cx, cy, toDeg, r);
  const large = toDeg - fromDeg > 180 ? 1 : 0;
  return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
}

export interface GaugeLimit {
  from: number;
  to: number;
  color: string; // a status token — limits are the only color on a gauge
}

export function Gauge({
  label,
  value,
  min,
  max,
  unit = '',
  limit,
  off = false,
  size = 86,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  limit?: GaugeLimit;
  off?: boolean;
  size?: number; // round 15: mini-gauges in per-engine reveals
}) {
  const angle = (v: number) => A0 + (A1 - A0) * Math.min(1, Math.max(0, (v - min) / (max - min)));

  const cx = size / 2;
  const cy = size / 2 + 2;
  const r = size * 0.35;
  const k = size / 86; // scale factor for strokes/text
  const needleEnd = polar(cx, cy, angle(value), r - 4 * k);
  return (
    <div style={{ width: size, textAlign: 'center' }}>
      <svg width={size} height={size - 14 * k} style={{ display: 'block' }}>
        <path d={arcPath(cx, cy, A0, A1, r)} fill="none" stroke="var(--color-line-strong)" strokeWidth={3 * k} strokeLinecap="round" />
        {limit && (
          <path
            d={arcPath(cx, cy, angle(limit.from), angle(limit.to), r)}
            fill="none" stroke={limit.color} strokeWidth={3 * k} strokeLinecap="butt"
          />
        )}
        {!off && (
          <>
            <line x1={cx} y1={cy} x2={needleEnd.x} y2={needleEnd.y} stroke={NEUTRAL.ink} strokeWidth={1.5} />
            <circle cx={cx} cy={cy} r={2.5 * k} fill={NEUTRAL.ink} />
          </>
        )}
        <text x={cx} y={cy + 22 * k} textAnchor="middle"
          style={{ fontFamily: FONT.data, fontSize: Math.max(9, 11 * k), fontVariantNumeric: 'tabular-nums' }}
          fill={off ? NEUTRAL.inkMuted : NEUTRAL.ink}>
          {off ? 'OFF' : `${Math.round(value)}${unit}`}
        </text>
      </svg>
      <div style={{ fontFamily: FONT.data, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: NEUTRAL.inkMuted }}>
        {label}
      </div>
    </div>
  );
}
