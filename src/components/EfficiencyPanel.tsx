'use client';
// Efficiency panel, v2 order: trend history FIRST (the analytical posture),
// then the current delta vs mode baseline as the instantaneous context.
// trend_90d, 1y history and the baseline band stay behind Contextual reveals
// per the vessel-level registry.

import type { VesselState } from '../data/types';
import { Field } from './Field';
import { RevealZone } from './Contextual';
import { Sparkline } from './Sparkline';
import { TrendChartFill } from './TrendChartFill';
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
      {/* fixed stats row */}
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <Field level="vessel" field="trend_30d">
          <Stat label="30d trend" value={fmtPct(d.trend_30d)} />
        </Field>
        <Field level="vessel" field="efficiency_delta_vs_mode_baseline">
          <Stat label="now vs baseline" value={fmtPct(d.efficiency_delta_pct)} />
        </Field>
      </div>
      {/* the ONE elastic element: 30d chart grows to match the row-mate */}
      <div style={{ flex: 1, minHeight: 90, marginTop: 10 }}>
        <TrendChartFill values={d.daily_delta_1y.slice(-30).map((x) => x.delta)} />
      </div>
      {/* footer: 24h strip + baseline context */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--color-ink-muted)', fontFamily: 'var(--font-data)' }}>24h</span>
        <Sparkline values={d.sparkline_24h} width={140} height={20} />
        <span style={{ ...gb.dim, fontSize: 12 }}>
          baseline {d.baseline_value} {d.baseline_metric === 'gal_per_nm' ? 'gal/nm' : 'gph'} · burn {d.burn_rate_gph} gph
        </span>
      </div>
      </RevealZone>
    </section>
  );
}
