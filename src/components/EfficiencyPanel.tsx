'use client';
// Efficiency panel, v2 order: trend history FIRST (the analytical posture),
// then the current delta vs mode baseline as the instantaneous context.
// trend_90d, 1y history and the baseline band stay behind Contextual reveals
// per the vessel-level registry.

import type { VesselState } from '../data/types';
import { Field } from './Field';
import { Sparkline } from './Sparkline';
import { Stat } from './Stat';
import { gb, fmtPct } from './gb';

export function EfficiencyPanel({ vessel }: { vessel: VesselState }) {
  const d = vessel.derived;
  return (
    <section style={{ ...gb.box, marginBottom: 8 }}>
      <div style={gb.label}>efficiency — trend history first (v2), then current vs mode baseline ({d.mode})</div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <Field level="vessel" field="trend_30d">
          <Stat label="30d trend" value={fmtPct(d.trend_30d)} />
          <span style={{ marginLeft: 8 }}>
            <Sparkline values={d.daily_delta_1y.slice(-90).map((x) => x.delta)} width={240} height={32} />
          </span>
        </Field>
        <Field level="vessel" field="trend_90d" label="90d trend">
          <span>{fmtPct(d.trend_90d)} per 90d</span>
        </Field>
        <Field level="vessel" field="history_1y" label="1y history">
          <Sparkline values={d.daily_delta_1y.map((x) => x.delta)} width={360} height={36} />
        </Field>
        <Field level="vessel" field="efficiency_delta_vs_mode_baseline">
          <Stat label="now vs baseline" value={fmtPct(d.efficiency_delta_pct)} />
          <span style={{ ...gb.dim, marginLeft: 8 }}>
            now, vs baseline {d.baseline_value} {d.baseline_metric === 'gal_per_nm' ? 'gal/nm' : 'gph'} · burn {d.burn_rate_gph} gph
          </span>
          <span style={{ marginLeft: 12 }}>
            24h <Sparkline values={d.sparkline_24h} />
          </span>
        </Field>
        <Field level="vessel" field="baseline_band_visualization" label="baseline band">
          <span>
            expected range around {d.baseline_value} {d.baseline_metric === 'gal_per_nm' ? 'gal/nm' : 'gph'} — band
            visualization pending design
          </span>
        </Field>
      </div>
    </section>
  );
}
