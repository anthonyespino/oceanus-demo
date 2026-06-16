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
import { fmtPct, glassFill } from './gb';
import { Glyph } from './Glyph';
import { ACCENT, NEUTRAL, RADIUS, STATUS_COLOR, toggleStyle } from './probeTokens';
import { layer } from '../learn/layer'; // LEARN MODE — strip before demo week
import { useLearn } from '../learn/LearnProvider'; // round 90: Learn surfaces descriptor names
import { Annotated } from '../learn/Annotated'; // round 109: Learn exposes the trend's full meaning (ia-model node)
import { IA_BAND_DESCRIPTORS } from '../ia/ia-model'; // round 90: single source for descriptor glyph + name

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

// ROUND 94: the borderLeft is the STRUCTURAL section divider (a hairline,
// distinct from a severity outline — outlines stay severity-reserved on
// interactive/status elements; this is a section rule). With the panel fill
// removed (float), these thin verticals separate the regions on the gradient.
const cell: React.CSSProperties = {
  padding: '0 var(--pad-card)',
  borderLeft: '1px solid var(--color-line-hairline)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center', // round 94: center descriptor + value (column cells)
  gap: 6,
};

export function FleetHealthBand({ fleet }: { fleet: VesselState[] }) {
  const [range, setRange] = useState<TrendRange>(90);
  const { treatment, censusFilter, setCensusFilter, surfaceGlass } = useFleet();
  const [wrapRef, w] = useContentWidth(560);
  // ROUND 94: three descriptor states (resolves the round-52 thread where
  // default absorbed glyphs and blurred the modes):
  //   DEFAULT + LEARN → TEXT LABELS (legible words, centered)
  //   EXPERT (E)      → GLYPHS only (the round-90 placeholders, centered)
  // Learn still exposes the full IA name on hover (round 92, the band node).
  // Names + glyphs both come from the shared ia-model (single source).
  const { expertOn } = useLearn();
  const D = IA_BAND_DESCRIPTORS;
  const dGlyph = (id: string) => (expertOn ? D[id].glyph : undefined);
  const dLabel = (id: string) => (expertOn ? undefined : D[id].name);

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
  // round 109: span label for the line's window (the toggleable range). DEFAULT +
  // LEARN only — Expert stays bare (operator competence). Context/micro register.
  const spanLabel = range === 365 ? '1Y' : `${range}D`;

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
      {/* ROUND 98: the "FLEET" scope label + its ship glyph are REMOVED (redundant
          mode/scope noise, in default AND Expert). The header row now carries only
          the range toggle, right-aligned; no orphan gap where the label sat. */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'baseline', gap: 16, marginBottom: 4, flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', gap: 4 }}>
          <button style={toggleStyle(range === 30)} onClick={() => setRange(30)}>30d</button>
          <button style={toggleStyle(range === 90)} onClick={() => setRange(90)}>90d</button>
          <button style={toggleStyle(range === 365)} onClick={() => setRange(365)}>1y</button>
        </span>
      </div>
      {/* ROUND 94: FLOAT — the panel fill (gb.box surface-raised) is removed so
          the band floats directly on the Calm Sea gradient; the gradient shows
          through where the fill was. Regions are separated by the cells' vertical
          hairline dividers only (structural, not severity).
          ROUND 97: SURFACE GLASS dev toggle — near-opaque fill + subtle blur when on. */}
      <section style={surfaceGlass ? glassFill : undefined}>
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
                textAlign: 'center',
              }}
            >
              <Stat glyph={dGlyph(cls)} label={dLabel(cls)} value={counts[cls]} center />
            </button>
          ))}
        </div>
        {/* CELL 2 — 30d mean + trend curve (the census's other half) */}
        <div style={{ ...cell, flex: '2 1 320px', minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <div style={{ flexShrink: 0 }}>
            <span {...layer('FleetHealthBand / mean / value.text', 'type/hero · font/data tabular · ink/primary (round 108: IKB fill removed entirely)', '{30d fleet mean delta %}')}>
              <Stat glyph={dGlyph('fleet-mean')} label={dLabel('fleet-mean')} value={fmtPct(mean30)} center />
            </span>
            <Field level="fleet" field="fleet_total_daily_spend" />
            {/* ⚖ #4 spend slot: renders only if/when ruled in (Field → null while UNDEFINED) */}
          </div>
          <div ref={wrapRef} style={{ flex: 1, minWidth: 80 }} {...layer('FleetHealthBand / mean / trend.chart', 'ink/secondary line · surface/overlay p10–p90 band · zero ref line — census and mean never separate (component rule) · round 109: default/learn add a 0 + span label, Expert bare', '{rolling-mean daily fleet delta over range} + {p10/p90 envelope}')}>
            {/* ROUND 109: Learn exposes the FULL meaning of the fleet-mean trend
                (metric, zero-read, span, units, me-vs-everybody) from the shared
                ia-model node. Passthrough (zero-cost) when Learn is off. */}
            <Annotated name="FleetMeanTrend" node="fleet-trend">
            <svg width={w} height={H} style={{ display: 'block', border: '1px solid var(--color-line-subtle)', background: 'var(--color-surface-base)' }}>
              <rect x={0} y={y(p90)} width={w} height={Math.max(0, y(p10) - y(p90))} fill="var(--color-surface-overlay)" />
              {/* zero reference line — the anchor; up = worse (over-burn). Unchanged
                  across modes (Expert keeps it bare, just unlabeled). */}
              <line x1={0} y1={y(0)} x2={w} y2={y(0)} stroke="var(--color-line-strong)" strokeWidth={1} />
              <polyline
                points={vals.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')}
                fill="none" stroke="var(--color-ink-secondary)" strokeWidth={1.25}
              />
              {/* ROUND 109: DEFAULT + LEARN minimal anchors — a "0" on the zero ref
                  line (so the line reads as zero + direction is legible: above = worse)
                  and a span label (the line's window). NOT a full axis: no Y ticks,
                  no X time ticks. Expert (E) strips both — bare strip. Greyscale only. */}
              {!expertOn && (
                <>
                  <text x={3} y={y(0) - 3} fontFamily="var(--font-data)" fontSize={10} fill="var(--color-ink-muted)" letterSpacing={0.5}>0</text>
                  <text x={w - 3} y={12} textAnchor="end" fontFamily="var(--font-data)" fontSize={10} fill="var(--color-ink-muted)" letterSpacing={0.5}>{spanLabel}</text>
                </>
              )}
            </svg>
            </Annotated>
          </div>
        </div>
        {/* CELL 3 — fleet burn now */}
        <div style={{ ...cell, flexShrink: 0 }}>
          <span {...layer('FleetHealthBand / burn / value.text', 'type/hero · font/data tabular · ink/primary · gph (blue is water-only, never here)', '{sum of live fleet burn} gph')}>
            <Stat glyph={dGlyph('fleet-burn')} label={dLabel('fleet-burn')} value={`${burnNow.toLocaleString()} gph`} center />
          </span>
          <span {...layer('FleetHealthBand / burn / spark.chart', 'ink/secondary 1px · auto-ranged (never approaches 0)', '{fleet total burn, 24h hourly}')}>
            <Sparkline values={burn24} width={120} height={24} zeroBaseline={false} />
          </span>
        </div>
        {/* CELL 4 — next 24h: arrivals + bunker flags, linking to the board */}
        <a href="#port-calls" style={{ ...cell, flexShrink: 0, textDecoration: 'none', color: NEUTRAL.ink, cursor: 'pointer' }}>
          <span {...layer('FleetHealthBand / arrivals / value.text', 'type/hero · font/data tabular · ink/primary · links to #port-calls', '{# port calls in next 24h}')}>
            <Stat glyph={dGlyph('arrivals')} label={dLabel('arrivals')} value={arrivals} center />
          </span>
          {/* ROUND 94: BUNKER descriptor — TEXT in default/learn, GLYPH in expert
              (centered); count keeps its advisory tint (advisory is informational,
              not severity). Name from the shared ia-model. */}
          <span {...layer('FleetHealthBand / arrivals / bunker.text', 'descriptor: TEXT label (default/learn) | placeholder glyph (expert), centered · count advisory tint when >0 else ink/muted · name from ia-model', '{# bunker-flagged calls in next 24h}')} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontFamily: 'var(--font-data)', fontSize: 'var(--type-context)' }}>
            {expertOn && <span style={{ lineHeight: 0, color: NEUTRAL.inkMuted, flexShrink: 0 }}><Glyph name={D['bunker'].glyph} size={14} /></span>}
            <span style={{ color: bunkers > 0 ? 'var(--color-alert-advisory)' : NEUTRAL.inkMuted }}>
              {bunkers}{!expertOn ? ` ${D['bunker'].name}` : ''} {bunkers === 1 ? 'flag' : 'flags'}
            </span>
          </span>
        </a>
      </div>
      </section>
    </div>
  );
}
