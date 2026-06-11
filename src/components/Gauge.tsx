'use client';
// ROUND 11: shared radial gauge primitive — marine-bridge instrument style.
// One arc, one needle, DM Mono value, micro label. Neutral ink arcs; a
// status-colored band ONLY where an operating limit exists. No decorative
// color. Five dials, one primitive.

import { FONT, NEUTRAL } from './probeTokens';

const SIZE = 86;
const CX = SIZE / 2;
const CY = SIZE / 2 + 2;
const R = 30;
const A0 = -210; // sweep start (degrees)
const A1 = 30; // sweep end

function polar(deg: number, r: number): { x: number; y: number } {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}
function arcPath(fromDeg: number, toDeg: number, r: number): string {
  const a = polar(fromDeg, r);
  const b = polar(toDeg, r);
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
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  limit?: GaugeLimit;
  off?: boolean;
}) {
  const angle = (v: number) => A0 + (A1 - A0) * Math.min(1, Math.max(0, (v - min) / (max - min)));
  const needleEnd = polar(angle(value), R - 4);

  return (
    <div style={{ width: SIZE, textAlign: 'center' }}>
      <svg width={SIZE} height={SIZE - 14} style={{ display: 'block' }}>
        <path d={arcPath(A0, A1, R)} fill="none" stroke="var(--color-line-strong)" strokeWidth={3} strokeLinecap="round" />
        {limit && (
          <path
            d={arcPath(angle(limit.from), angle(limit.to), R)}
            fill="none" stroke={limit.color} strokeWidth={3} strokeLinecap="butt"
          />
        )}
        {!off && (
          <>
            <line x1={CX} y1={CY} x2={needleEnd.x} y2={needleEnd.y} stroke={NEUTRAL.ink} strokeWidth={1.5} />
            <circle cx={CX} cy={CY} r={2.5} fill={NEUTRAL.ink} />
          </>
        )}
        <text x={CX} y={CY + 22} textAnchor="middle"
          style={{ fontFamily: FONT.data, fontSize: 11, fontVariantNumeric: 'tabular-nums' }}
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
