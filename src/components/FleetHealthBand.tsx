'use client';
// ROUND 12: FleetHealthBand — the FleetTrend band evolved into the fleet
// instrument cluster: [STATUS CENSUS] [30D MEAN + TREND] [FLEET BURN NOW]
// [NEXT 24H]. (Rename FleetTrend → FleetHealthBand recorded for the barrel
// and the Figma library.)
//
// RULE, encoded in this layout: the census and the mean ALWAYS render
// together — an average without its exception counts beside it is how a
// fleet hides a failing ship, because the mean smooths exactly what the
// census surfaces. Both cells are unconditional; do not make either one
// collapsible or toggleable.

import { useState } from 'react';
import type { VesselState } from '../data/types';
import { fleetDailyTrend, fleetBurnNow, fleetBurnSeries24h } from '../data/fleetState';
import { vesselStatus, type StatusLevel } from '../data/alerts';
import { useFleet } from '../state/FleetProvider';
import { collectBlocks } from './PortCallsTimeline';
import { Field } from './Field';
import { Stat } from './Stat';
import { Sparkline } from './Sparkline';
import { useContentWidth } from './NauticalChart';
import { gb, fmtPct } from './gb';
import { Label } from './Glyph';
import { ACCENT, NEUTRAL, RADIUS, STATUS_COLOR, toggleStyle } from './probeTokens';
import { layer } from '../learn/layer'; // LEARN MODE — strip before demo week

type TrendRange = 30 | 90 | 365;
const H = 110;

// Round 41: census leaves as static literals so the atlas generator
// enumerates all three (a templated path wouldn't be captured); the runtime
// spreads the matching one onto each count button.
const CENSUS_LAYER: Record<StatusLevel, Record<string, string>> = {
  degraded: layer('FleetHealthBand / census / degraded.status', 'STATUS_COLOR.degraded (red) · count · click filters board', '{# vessels degraded}'),
  watch: layer('FleetHealthBand / census / watch.status', 'STATUS_COLOR.watch (amber) · count · click filters board', '{# vessels watch}'),
  nominal: layer('FleetHealthBand / census / nominal.status', 'green (automotive) | ink/secondary (quiet) · count · click filters board', '{# vessels nominal}'),
};

function rollingMean(xs: number[], window = 7): number[] {
  return xs.map((_, i) => {
    const slice = xs.slice(Math.max(0, i - window + 1), i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}

const cell: React.CSSProperties = {
  padding: '0 var(--pad-card)',
  borderLeft: '1px solid var(--color-line-hairline)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: 6,
};

export function FleetHealthBand({ fleet }: { fleet: VesselState[] }) {
  const [range, setRange] = useState<TrendRange>(90);
  const { ikbBand, treatment, censusFilter, setCensusFilter } = useFleet();
  const [wrapRef, w] = useContentWidth(560);

  // census
  const counts: Record<StatusLevel, number> = { degraded: 0, watch: 0, nominal: 0 };
  for (const v of fleet) counts[vesselStatus(v.alerts)]++;
  const censusColor = (cls: StatusLevel) =>
    cls === 'nominal' && treatment === 'dark-cockpit' ? NEUTRAL.inkSecondary : STATUS_COLOR[cls];
  const pickCensus = (cls: StatusLevel) => {
    const next = censusFilter === cls ? null : cls;
    setCensusFilter(next);
    if (next) {
      const first = fleet.find((v) => vesselStatus(v.alerts) === next);
      if (first) setTimeout(() => document.getElementById(`tile-${first.static.id}`)?.scrollIntoView({ block: 'center' }), 60);
    }
  };

  // trend
  const daily = fleetDailyTrend(fleet).map((d) => d.delta);
  const smoothed = rollingMean(daily);
  const vals = smoothed.slice(-range);
  const mean30 = daily.slice(-30).reduce((a, b) => a + b, 0) / Math.min(30, daily.length);
  const sorted = [...smoothed].sort((a, b) => a - b);
  const p10 = sorted[Math.floor(sorted.length * 0.1)];
  const p90 = sorted[Math.floor(sorted.length * 0.9)];
  const lo = Math.min(...vals, p10, 0) - 0.3;
  const hi = Math.max(...vals, p90, 0) + 0.3;
  const y = (v: number) => H - ((v - lo) / (hi - lo)) * H;
  const x = (i: number) => (i / Math.max(1, vals.length - 1)) * w;

  // burn + next 24h
  const burnNow = fleetBurnNow(fleet);
  const burn24 = fleetBurnSeries24h(fleet);
  const now = fleet[0].history.minutes.at(-1)!.t;
  const blocks24 = collectBlocks(fleet, now, 24).filter((b) => b.etaMs !== null && b.etaMs > now);
  const arrivals = blocks24.length;
  const bunkers = blocks24.filter((b) => b.bunker).length;

  return (
    // round 37: the header row (label + status header + range) floats
    // above the fill
    <div style={{ marginBottom: 8 }}>
      {/* round 33: the standalone status strip dissolved into this micro
          header row — the counts summon the alert sheet */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, marginBottom: 4, flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', gap: 20, alignItems: 'baseline', minWidth: 0 }}>
          <Label g="vessel" headerAttrs={layer('FleetHealthBand / header / header.glyph', 'section header · vessel glyph · glyph-only in expert mode', 'FLEET')} style={{ marginBottom: 0 }}>fleet</Label>
          {/* round 79: status moved to the GLOBAL top bar (AppHeader) */}
        </span>
        <span style={{ display: 'inline-flex', gap: 4 }}>
          <button style={toggleStyle(range === 30)} onClick={() => setRange(30)}>30d</button>
          <button style={toggleStyle(range === 90)} onClick={() => setRange(90)}>90d</button>
          <button style={toggleStyle(range === 365)} onClick={() => setRange(365)}>1y</button>
        </span>
      </div>
      <section style={gb.box}>
      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        {/* CELL 1 — status census (clickable filters; never separable from the mean) */}
        <div style={{ ...cell, borderLeft: 'none', paddingLeft: 0, flexDirection: 'row', gap: 18, alignItems: 'center' }}>
          {/* round 45 presence rule: degraded/watch render only when present;
              nominal ALWAYS (the affirmative all-clear — the band's own shape
              encodes severity). At rest: just "NOMINAL 15". */}
          {(['degraded', 'watch', 'nominal'] as StatusLevel[]).filter((cls) => cls === 'nominal' || counts[cls] > 0).map((cls) => (
            <button
              key={cls}
              {...CENSUS_LAYER[cls]}
              onClick={() => pickCensus(cls)}
              style={{
                background: censusFilter === cls ? ACCENT.wash : 'none',
                border: `1px solid ${censusFilter === cls ? ACCENT.bright : 'transparent'}`,
                borderRadius: RADIUS,
                padding: '2px 8px',
                cursor: 'pointer',
                color: censusColor(cls),
                textAlign: 'left',
              }}
            >
              <Stat label={cls} value={counts[cls]} />
            </button>
          ))}
        </div>
        {/* CELL 2 — 30d mean + trend curve (the census's other half) */}
        <div style={{ ...cell, flex: '2 1 320px', minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              flexShrink: 0,
              ...(ikbBand ? { background: ACCENT.primary, borderRadius: RADIUS, padding: '8px 12px' } : {}),
            }}
          >
            <span {...layer('FleetHealthBand / mean / value.text', 'type/hero · font/data tabular · ink/primary (IKB fill behind dev toggle)', '{30d fleet mean delta %}')}>
              <Stat label="30d fleet mean" value={fmtPct(mean30)} onFill={ikbBand} />
            </span>
            <Field level="fleet" field="fleet_total_daily_spend" />
            {/* ⚖ #4 spend slot: renders only if/when ruled in (Field → null while UNDEFINED) */}
          </div>
          <div ref={wrapRef} style={{ flex: 1, minWidth: 80 }} {...layer('FleetHealthBand / mean / trend.chart', 'ink/secondary line · surface/overlay p10–p90 band · zero line — census and mean never separate (component rule)', '{rolling-mean daily fleet delta over range} + {p10/p90 envelope}')}>
            <svg width={w} height={H} style={{ display: 'block', border: '1px solid var(--color-line-subtle)', background: 'var(--color-surface-base)' }}>
              <rect x={0} y={y(p90)} width={w} height={Math.max(0, y(p10) - y(p90))} fill="var(--color-surface-overlay)" />
              <line x1={0} y1={y(0)} x2={w} y2={y(0)} stroke="var(--color-line-strong)" strokeWidth={1} />
              <polyline
                points={vals.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')}
                fill="none" stroke="var(--color-ink-secondary)" strokeWidth={1.25}
              />
            </svg>
          </div>
        </div>
        {/* CELL 3 — fleet burn now */}
        <div style={{ ...cell, flexShrink: 0 }}>
          <span {...layer('FleetHealthBand / burn / value.text', 'type/hero · font/data tabular · ink/primary · gph (blue is water-only, never here)', '{sum of live fleet burn} gph')}>
            <Stat label="fleet burn" value={`${burnNow.toLocaleString()} gph`} />
          </span>
          <span {...layer('FleetHealthBand / burn / spark.chart', 'ink/secondary 1px · auto-ranged (never approaches 0)', '{fleet total burn, 24h hourly}')}>
            <Sparkline values={burn24} width={120} height={24} zeroBaseline={false} />
          </span>
        </div>
        {/* CELL 4 — next 24h: arrivals + bunker flags, linking to the board */}
        <a href="#port-calls" style={{ ...cell, flexShrink: 0, textDecoration: 'none', color: NEUTRAL.ink, cursor: 'pointer' }}>
          <span {...layer('FleetHealthBand / arrivals / value.text', 'type/hero · font/data tabular · ink/primary · links to #port-calls', '{# port calls in next 24h}')}>
            <Stat label="arrivals 24h" value={arrivals} />
          </span>
          <span {...layer('FleetHealthBand / arrivals / bunker.text', 'font/data 11 · advisory tint when >0, else ink/muted (advisory is informational, not severity)', '{# bunker-flagged calls in next 24h}')} style={{ fontFamily: 'var(--font-data)', fontSize: 'var(--type-context)', color: bunkers > 0 ? 'var(--color-alert-advisory)' : NEUTRAL.inkMuted }}>
            {bunkers} BUNKER {bunkers === 1 ? 'flag' : 'flags'}
          </span>
        </a>
      </div>
      </section>
    </div>
  );
}
