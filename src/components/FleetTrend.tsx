'use client';
// LAYOUT PROBE round 3.2: FleetTrend promoted to the full-width band at the
// top of the page (Figma name: FleetView/FleetTrend). Hero numeral lives IN
// the band (left), chart fills the rest — no orphaned space. Same treatment
// as the tile sparklines: single grey stroke, zero-baseline reference, plus
// 7-day smoothing and a subtle 1y normal-range band. The (still UNDEFINED)
// fleet_total_daily_spend has its reserved slot here under the hero numeral.

import { useState } from 'react';
import type { VesselState } from '../data/types';
import { fleetDailyTrend } from '../data/fleetState';
import { Field } from './Field';
import { Stat } from './Stat';
import { useContentWidth } from './NauticalChart';
import { gb, fmtPct } from './gb';
import { NEUTRAL, RADIUS } from './probeTokens';

type TrendRange = 30 | 90 | 365;
const H = 124;

function rollingMean(xs: number[], window = 7): number[] {
  return xs.map((_, i) => {
    const slice = xs.slice(Math.max(0, i - window + 1), i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}

export function FleetTrend({ fleet }: { fleet: VesselState[] }) {
  const [range, setRange] = useState<TrendRange>(90); // default 90d
  const [wrapRef, w] = useContentWidth(900);

  const daily = fleetDailyTrend(fleet).map((d) => d.delta);
  const smoothed = rollingMean(daily); // daily-mean series, 7d smoothing
  const vals = smoothed.slice(-range);
  const mean30 = daily.slice(-30).reduce((a, b) => a + b, 0) / Math.min(30, daily.length);

  // Normal range: p10-p90 of the FULL year of smoothed values — a constant
  // reference envelope, independent of the selected zoom range.
  const sorted = [...smoothed].sort((a, b) => a - b);
  const p10 = sorted[Math.floor(sorted.length * 0.1)];
  const p90 = sorted[Math.floor(sorted.length * 0.9)];

  const lo = Math.min(...vals, p10, 0) - 0.3;
  const hi = Math.max(...vals, p90, 0) + 0.3;
  const y = (v: number) => H - ((v - lo) / (hi - lo)) * H;
  const x = (i: number) => (i / Math.max(1, vals.length - 1)) * w;

  const toggle = (active: boolean): React.CSSProperties => ({
    border: `1px solid ${NEUTRAL.border}`,
    borderRadius: RADIUS,
    background: active ? NEUTRAL.surfaceDim : NEUTRAL.surface,
    color: NEUTRAL.ink,
    padding: '1px 8px',
    fontSize: 11,
    cursor: 'pointer',
  });

  return (
    <section style={{ ...gb.box, marginBottom: 8, borderRadius: RADIUS }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <span style={gb.label}>fleet trend — whole-fleet efficiency vs baselines (7d smoothed)</span>
        <span style={{ display: 'inline-flex', gap: 4 }}>
          <button style={toggle(range === 30)} onClick={() => setRange(30)}>30d</button>
          <button style={toggle(range === 90)} onClick={() => setRange(90)}>90d</button>
          <button style={toggle(range === 365)} onClick={() => setRange(365)}>1y</button>
        </span>
      </div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
        {/* hero numeral, instrument treatment: label above, display face */}
        <div style={{ width: 190, flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Stat label="30d fleet mean" value={fmtPct(mean30)} size={46} face="display" />
          {/* reserved slot: if Anthony rules fleet_total_daily_spend in, it lives here */}
          <div style={{ marginTop: 10 }}>
            <Field level="fleet" field="fleet_total_daily_spend" />
          </div>
        </div>
        <div ref={wrapRef} style={{ flex: 1, minWidth: 0 }}>
          <svg width={w} height={H} style={{ display: 'block', border: '1px solid var(--color-line-subtle)', background: 'var(--color-surface-base)' }}>
            {/* subtle normal-range band (1y p10-p90) */}
            <rect x={0} y={y(p90)} width={w} height={Math.max(0, y(p10) - y(p90))} fill="var(--color-surface-overlay)" />
            {/* zero-baseline reference */}
            <line x1={0} y1={y(0)} x2={w} y2={y(0)} stroke="var(--color-line-strong)" strokeWidth={1} />
            <polyline
              points={vals.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')}
              fill="none" stroke="var(--color-ink-secondary)" strokeWidth={1.25}
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
