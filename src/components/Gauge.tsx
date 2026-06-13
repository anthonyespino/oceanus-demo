'use client';
// ROUND 28 anatomy: vertical stack — VALUE (hero scale, Plex Mono, tabular)
// on top → arc + needle below → micro label at bottom. The dial interior is
// empty except the needle hub, so the round-27 hard rule (no text intersects
// the dial or the value's bbox) is satisfied by construction and the min/max
// scale labels return at the arc terminals at ALL sizes. Value keeps the
// earned-color rule (round 19, amending ruling 14: status tint only when
// alert-backed; white = static stillness); needle is ink/primary ALWAYS.
// Ruling 11 holds: display-only limits are neutral ink ticks; a colored band
// exists ONLY where alert logic backs it. DORMANT: stopped engine → arc
// dimmed ~30%, no needle, no bands, OFF in muted ink — a dead gauge looks
// dead. Value size rides TYPE.hero scaled by dial size, so the command band
// (96) sits a step above the engine cluster (86) automatically.

import { FONT, NEUTRAL, TYPE } from './probeTokens';
import { layer } from '../learn/layer'; // LEARN MODE — strip before demo week
import { useLearn } from '../learn/LearnProvider'; // EXPERT MODE — strip before demo week

const A0 = -135; // sweep start (degrees, 0 = up)
const A1 = 135; // sweep end — 270° C, opening at bottom

export type Vital = 'still' | 'nominal' | 'watch' | 'degraded';
const VALUE_COLOR: Record<Vital, string> = {
  still: '#ffffff', // static stillness (ruling 14, retained for moored dials)
  nominal: 'var(--color-ink-primary)', // ink — color must be earned
  watch: 'var(--color-alert-caution)',
  degraded: 'var(--color-alert-warning)',
};

const HERO = TYPE.hero.fontSize as number; // type ratio anchor (15 at k=1)

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
  const { expertOn } = useLearn(); // round 44: micro label hides — value/unit/dial identify
  const angle = (v: number) => A0 + (A1 - A0) * Math.min(1, Math.max(0, (v - min) / (max - min)));
  const k = size / 86;
  const r = size * 0.36;
  const cx = size / 2;
  const cy = r + 4 * k; // circle hugs the top of the svg — value lives above it
  const svgH = Math.ceil(cy + 0.707 * (r + 1) + 12 * k); // arc terminals + min/max line
  const needleEnd = polar(cx, cy, angle(value), r - 3 * k);
  const loLbl = polar(cx, cy, A0, r + 1);
  const hiLbl = polar(cx, cy, A1, r + 1);
  const fontScale = Math.max(7, 7.5 * k);
  const [minLabel, maxLabel] = minMaxLabels ?? [String(min), String(max)];
  const valStr = off ? 'OFF' : display ?? `${Math.round(value)}${unit}`;

  return (
    <div style={{ width: size, textAlign: 'center' }}>
      {/* value on top — hero scale, earned color */}
      <div {...layer('Gauge / readout / value.text', 'font/data tabular · type/hero×k · earned color (ruling 14)', '{display ?? round(value)+unit}')} style={{
        fontFamily: FONT.data, fontSize: Math.max(11, Math.round(HERO * k)), fontWeight: 500,
        fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', lineHeight: 1.25, marginBottom: 2 * k,
        color: off ? NEUTRAL.inkMuted : VALUE_COLOR[vital],
      }}>
        {valStr}
      </div>
      <svg width={size} height={svgH} style={{ display: 'block' }}>
        <g opacity={off ? 0.3 : 1}>
          <path {...layer('Gauge / dial / arc.line', 'line/strong · 2.5×k', '{min→max, 270° sweep}')} d={arcPath(cx, cy, A0, A1, r)} fill="none" stroke="var(--color-line-strong)" strokeWidth={2.5 * k} strokeLinecap="round" />
        </g>
        {!off && (
          <>
            {/* scale: 3 intermediate ticks + min/max at the terminals (all sizes) */}
            {[0.25, 0.5, 0.75].map((f) => {
              const a = A0 + (A1 - A0) * f;
              const t1 = polar(cx, cy, a, r - 3 * k);
              const t2 = polar(cx, cy, a, r + 3 * k);
              return <line key={f} {...layer('Gauge / dial / tick.line', 'ink/muted · 1px', '{25 / 50 / 75 %}')} x1={t1.x} y1={t1.y} x2={t2.x} y2={t2.y} stroke={NEUTRAL.inkMuted} strokeWidth={1} />;
            })}
            <text {...layer('Gauge / dial / minLabel.text', 'font/data micro · ink/muted', '{minMaxLabels?.[0] ?? min}')} x={loLbl.x} y={loLbl.y + 8 * k} textAnchor="middle" style={{ fontFamily: FONT.data, fontSize: fontScale }} fill={NEUTRAL.inkMuted}>{minLabel}</text>
            <text {...layer('Gauge / dial / maxLabel.text', 'font/data micro · ink/muted', '{minMaxLabels?.[1] ?? max}')} x={hiLbl.x} y={hiLbl.y + 8 * k} textAnchor="middle" style={{ fontFamily: FONT.data, fontSize: fontScale }} fill={NEUTRAL.inkMuted}>{maxLabel}</text>
            {/* display-only limits: neutral ticks, slightly long */}
            {displayLimits.map((v) => {
              const t1 = polar(cx, cy, angle(v), r - 4 * k);
              const t2 = polar(cx, cy, angle(v), r + 4 * k);
              return <line key={v} {...layer('Gauge / dial / limit.line', 'ink/secondary · neutral tick (ruling 11)', '{displayLimits[]}')} x1={t1.x} y1={t1.y} x2={t2.x} y2={t2.y} stroke={NEUTRAL.inkSecondary} strokeWidth={1.25} />;
            })}
            {/* alert-backed band: the only color on the arc */}
            {band && (
              <path {...layer('Gauge / dial / band.line', 'alert color — alert-backed ONLY (ruling 11)', '{band.from→band.to}')} d={arcPath(cx, cy, angle(band.from), angle(band.to), r)} fill="none" stroke={band.color} strokeWidth={2.5 * k} strokeLinecap="butt" />
            )}
            {/* needle: ink/primary, always; the hub is the dial's only interior mark */}
            <line {...layer('Gauge / dial / needle.line', 'ink/primary — ALWAYS (round 19, amends ruling 14)', '{value→angle(min,max)}')} x1={cx} y1={cy} x2={needleEnd.x} y2={needleEnd.y} stroke={NEUTRAL.ink} strokeWidth={1.5} />
            <circle {...layer('Gauge / dial / hub.dot', 'ink/primary', '—')} cx={cx} cy={cy} r={2.2 * k} fill={NEUTRAL.ink} />
          </>
        )}
      </svg>
      {!expertOn && (
        <div {...layer('Gauge / label / label.text', 'font/data 9 caps letterspaced · ink/muted · hidden in expert mode', '{label}')} style={{ fontFamily: FONT.data, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: NEUTRAL.inkMuted, marginTop: 2 }}>
          {label}
        </div>
      )}
    </div>
  );
}
