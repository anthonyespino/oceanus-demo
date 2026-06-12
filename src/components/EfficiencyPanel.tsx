'use client';
// ROUND 34: ONE efficiency card — the burn-vs-speed card merged in.
// header → hero row (30d trend · now vs baseline) → chart row (envelope
// left ~60% + 30d trend right ~40%, equal height) → footer (baseline ·
// 24h strip). Dedup: "vs envelope" stays on the envelope chart — a
// speed-specific comparison, distinct from the mode-wide vs-baseline
// number (both labeled). Burn gph left the footer — the band gauge owns
// it. trend_90d / 1y history / baseline band stay behind the reveal.

import type { VesselState } from '../data/types';
import { Field } from './Field';
import { RevealZone } from './Contextual';
import { Sparkline } from './Sparkline';
import { TrendChartFill } from './TrendChartFill';
import { EfficiencyCurve } from './EfficiencyCurve';
import { Stat } from './Stat';
import { gb, fmtPct } from './gb';
import { Label } from './Glyph';

export function EfficiencyPanel({ vessel }: { vessel: VesselState }) {
  const d = vessel.derived;
  return (
    <section style={{ ...gb.box, marginBottom: 8, display: 'flex', flexDirection: 'column' }}>
      <RevealZone
        reveal={
          <span style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <Field level="vessel" field="trend_90d" revealed>
              <span>{fmtPct(d.trend_90d)} per 90d</span>
            </Field>
            <Field level="vessel" field="history_1y" revealed>
              <Sparkline values={d.daily_delta_1y.map((x) => x.delta)} width={360} height={36} />
            </Field>
            <Field level="vessel" field="baseline_band_visualization" revealed>
              <span>expected range around {d.baseline_value} {d.baseline_metric === 'gal_per_nm' ? 'gal/nm' : 'gph'}</span>
            </Field>
          </span>
        }
      >
      <Label g="chart">efficiency · {d.mode}</Label>
      {/* hero row */}
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <Field level="vessel" field="trend_30d">
          <Stat label="30d trend" value={fmtPct(d.trend_30d)} />
        </Field>
        <Field level="vessel" field="efficiency_delta_vs_mode_baseline">
          <Stat label="now vs baseline" value={fmtPct(d.efficiency_delta_pct)} />
        </Field>
      </div>
      {/* chart row: envelope (left) + 30d trend (right), equal height */}
      <div style={{ display: 'flex', gap: 'var(--pad-card)', marginTop: 10, alignItems: 'stretch', flexWrap: 'wrap' }}>
        <div style={{ flex: '3 1 380px', minWidth: 0 }}>
          <EfficiencyCurve vessel={vessel} />
        </div>
        <div style={{ flex: '2 1 260px', minWidth: 0, height: 250, display: 'flex', flexDirection: 'column' }}>
          <TrendChartFill values={d.daily_delta_1y.slice(-30).map((x) => x.delta)} />
        </div>
      </div>
      {/* footer: baseline context + 24h strip (burn gph lives in the band) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--color-ink-muted)', fontFamily: 'var(--font-data)' }}>24h</span>
        <Sparkline values={d.sparkline_24h} width={140} height={20} />
        <span style={{ ...gb.dim, fontSize: 12 }}>
          baseline {d.baseline_value} {d.baseline_metric === 'gal_per_nm' ? 'gal/nm' : 'gph'}
        </span>
      </div>
      </RevealZone>
    </section>
  );
}
