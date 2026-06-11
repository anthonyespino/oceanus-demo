'use client';
// ROUND 19 redesign: 270° C-arc opening at the bottom (-135°→+135°), min/max
// labels + 3 intermediate ticks so the arc reads as a scale. Needle is
// ink/primary ALWAYS; the center value takes status color ONLY when an
// alert-backed threshold is crossed (amends ruling 14: green-alive dropped,
// white still = stillness). Ruling 11 enforced — it regressed in round 11's
// own DEV DECISION (display ceilings drawn as colored bands): display-only
// limits are now neutral ink ticks; a colored band exists ONLY where alert
// logic backs it. DORMANT: stopped engine → arc dimmed ~30%, no needle, no
// bands, OFF in muted ink — a dead gauge looks dead.

import { FONT, NEUTRAL } from './probeTokens';

const A0 = -135; // sweep start (degrees, 0 = up)
const A1 = 135; // sweep end — 270° C, opening at bottom

export type Vital = 'still' | 'nominal' | 'watch' | 'degraded';
const VALUE_COLOR: Record<Vital, string> = {
  still: '#ffffff', // static stillness (ruling 14, retained for moored dials)
  nominal: 'var(--color-ink-primary)', // ink — color must be earned
  watch: 'var(--color-alert-caution)',
  degraded: 'var(--color-alert-warning)',
};

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

export interface GaugeBand {
  from: number;
  to: number;
  color: string; // ONLY alert-backed bands may carry color (ruling 11)
}

export function Gauge({
  label,
  value,
  min,
  max,
  unit = '',
  band,
  displayLimits = [],
  off = false,
  size = 86,
  vital = 'nominal',
  display,
  minMaxLabels,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  /** alert-backed colored band (ruling 11) */
  band?: GaugeBand;
  /** display-only limits — neutral ink ticks, never color */
  displayLimits?: number[];
  off?: boolean;
  size?: number;
  vital?: Vital;
  display?: string;
  /** override the printed min/max scale labels (e.g. log dials) */
  minMaxLabels?: [string, string];
}) {
  const angle = (v: number) => A0 + (A1 - A0) * Math.min(1, Math.max(0, (v - min) / (max - min)));
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.36;
  const k = size / 86;
  const needleEnd = polar(cx, cy, angle(value), r - 3 * k);
  const loLbl = polar(cx, cy, A0, r + 1);
  const hiLbl = polar(cx, cy, A1, r + 1);
  const fontScale = Math.max(7, 7.5 * k);
  const [minLabel, maxLabel] = minMaxLabels ?? [String(min), String(max)];

  return (
    <div style={{ width: size, textAlign: 'center' }}>
      <svg width={size} height={size - 6 * k} style={{ display: 'block' }}>
        <g opacity={off ? 0.3 : 1}>
          <path d={arcPath(cx, cy, A0, A1, r)} fill="none" stroke="var(--color-line-strong)" strokeWidth={2.5 * k} strokeLinecap="round" />
        </g>
        {!off && (
          <>
            {/* scale: 3 intermediate ticks + min/max labels */}
            {[0.25, 0.5, 0.75].map((f) => {
              const a = A0 + (A1 - A0) * f;
              const t1 = polar(cx, cy, a, r - 3 * k);
              const t2 = polar(cx, cy, a, r + 3 * k);
              return <line key={f} x1={t1.x} y1={t1.y} x2={t2.x} y2={t2.y} stroke={NEUTRAL.inkMuted} strokeWidth={1} />;
            })}
            <text x={loLbl.x} y={loLbl.y + 8 * k} textAnchor="middle" style={{ fontFamily: FONT.data, fontSize: fontScale }} fill={NEUTRAL.inkMuted}>{minLabel}</text>
            <text x={hiLbl.x} y={hiLbl.y + 8 * k} textAnchor="middle" style={{ fontFamily: FONT.data, fontSize: fontScale }} fill={NEUTRAL.inkMuted}>{maxLabel}</text>
            {/* display-only limits: neutral ticks, slightly long */}
            {displayLimits.map((v) => {
              const t1 = polar(cx, cy, angle(v), r - 4 * k);
              const t2 = polar(cx, cy, angle(v), r + 4 * k);
              return <line key={v} x1={t1.x} y1={t1.y} x2={t2.x} y2={t2.y} stroke={NEUTRAL.inkSecondary} strokeWidth={1.25} />;
            })}
            {/* alert-backed band: the only color on the arc */}
            {band && (
              <path d={arcPath(cx, cy, angle(band.from), angle(band.to), r)} fill="none" stroke={band.color} strokeWidth={2.5 * k} strokeLinecap="butt" />
            )}
            {/* needle: ink/primary, always */}
            <line x1={cx} y1={cy} x2={needleEnd.x} y2={needleEnd.y} stroke={NEUTRAL.ink} strokeWidth={1.5} />
            <circle cx={cx} cy={cy} r={2.2 * k} fill={NEUTRAL.ink} />
          </>
        )}
        <text x={cx} y={cy + r * 0.78 + 4 * k} textAnchor="middle"
          style={{ fontFamily: FONT.data, fontSize: Math.max(9, 11 * k), fontVariantNumeric: 'tabular-nums' }}
          fill={off ? NEUTRAL.inkMuted : VALUE_COLOR[vital]}>
          {off ? 'OFF' : display ?? `${Math.round(value)}${unit}`}
        </text>
      </svg>
      <div style={{ fontFamily: FONT.data, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: NEUTRAL.inkMuted }}>
        {label}
      </div>
    </div>
  );
}
