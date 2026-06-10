'use client';
// Efficiency panel: delta vs mode baseline (the headline), trends, history.
// trend_90d, 1y history and the baseline band live behind Contextual reveals.

import type { VesselState } from '../data/types';
import { Field } from './Field';
import { Sparkline } from './Sparkline';
import { gb, fmtPct } from './gb';

export function EfficiencyPanel({ vessel }: { vessel: VesselState }) {
  const d = vessel.derived;
  return (
    <section style={{ ...gb.box, marginBottom: 8 }}>
      <div style={gb.label}>efficiency — vs mode baseline ({d.mode})</div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <Field level="vessel" field="efficiency_delta_vs_mode_baseline">
          <span style={gb.big}>{fmtPct(d.efficiency_delta_pct)}</span>
          <span style={{ ...gb.dim, marginLeft: 8 }}>
            baseline {d.baseline_value} {d.baseline_metric === 'gal_per_nm' ? 'gal/nm' : 'gph'} · burn {d.burn_rate_gph} gph
          </span>
          <span style={{ marginLeft: 12 }}>
            24h <Sparkline values={d.sparkline_24h} />
          </span>
        </Field>
        <Field level="vessel" field="trend_30d">
          <span>30d trend {fmtPct(d.trend_30d)}</span>
        </Field>
        <Field level="vessel" field="trend_90d" label="90d trend">
          <span>{fmtPct(d.trend_90d)} per 90d</span>
        </Field>
        <Field level="vessel" field="history_1y" label="1y history">
          <Sparkline values={d.daily_delta_1y.map((x) => x.delta)} width={360} height={36} />
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
