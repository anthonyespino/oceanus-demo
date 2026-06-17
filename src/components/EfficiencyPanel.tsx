'use client';
// ROUND 34: ONE efficiency card — the burn-vs-speed card merged in.
// ROUND 127: ONE chart, ONE timeframe, ONE reading. The speed-vs-efficiency
// ENVELOPE is cut — it read as time but its X was speed, and its "12-MO NORMAL"
// band fought the panel's "30D TREND" framing. Replaced by a single
// efficiency-over-time view: efficiency delta vs baseline across 30 days
// (X = time −30D→NOW, Y = % vs baseline), with the normal range as a subtle
// shaded band behind the line so "above normal" reads without a second chart.
// header summary numbers (30D TREND · NOW VS BASELINE) + 24h baseline strip kept.

import type { VesselState } from '../data/types';
import { EFF_DELTA_CAUTION_PCT } from '../data/alerts'; // round 127: the band's top edge = this caution threshold (single source)
import { Field } from './Field';
import { Sparkline } from './Sparkline';
import { TrendChartFill } from './TrendChartFill';
import { Stat } from './Stat';
import { gb, fmtPct } from './gb';
import { Label } from './Glyph';
import { layer } from '../learn/layer'; // LEARN MODE — strip before demo week
import { useLearn } from '../learn/LearnProvider'; // round 112: default-show / expert-hide the deeper context

export function EfficiencyPanel({ vessel }: { vessel: VesselState }) {
  const d = vessel.derived;
  const { expertOn } = useLearn();
  // ROUND 127: the NOW point earns yellow only when the vessel actually carries the
  // efficiency caution (current delta caution-level + sustained) — not on any momentary poke.
  const nowCaution = vessel.alerts.some((a) => a.code === 'EFF_DELTA' && a.level === 'CAUTION');
  return (
    // round 37: header floats above the fill
    <div style={{ marginBottom: 'var(--pad-stack)' }}>
      <Label g="chart.efficiency" headerAttrs={layer('EfficiencyPanel / header / header.glyph', 'section header · chart.efficiency (curve motif) · glyph-only in expert mode', 'EFFICIENCY · {mode}')} style={{ marginBottom: 4 }}>efficiency · {d.mode}</Label>
      <section style={{ ...gb.box, display: 'flex', flexDirection: 'column' }}>
      {/* hero row */}
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <Field level="vessel" field="trend_30d">
          <div {...layer('EfficiencyPanel / heroRow / trend30.text', 'Stat: micro-caps label · type/hero numeral tabular', '{derived.trend_30d} %/30d — the primary fleet signal (ruling 13)')}>
            <Stat label="30d trend" value={fmtPct(d.trend_30d)} />
          </div>
        </Field>
        <Field level="vessel" field="efficiency_delta_vs_mode_baseline">
          {/* ROUND 127: earned yellow lives HERE — the current delta (NOW VS BASELINE),
              tinted caution when the vessel carries the EFF_DELTA caution. Same treatment as
              the EngineTwinPanel sustained-gap hero; the numeral inherits, the label stays
              neutral. The chart shows "above normal" by the line breaching the band's top. */}
          <div {...layer('EfficiencyPanel / heroRow / baselineDelta.text', 'Stat: micro-caps label · type/hero numeral tabular · severity yellow when caution-level (round 127)', '{derived.efficiency_delta_pct} vs mode_baseline — mode-wide comparison')} style={{ color: nowCaution ? 'var(--color-alert-caution)' : undefined }}>
            <Stat label="now vs baseline" value={fmtPct(d.efficiency_delta_pct)} />
          </div>
        </Field>
      </div>
      {/* ROUND 127: the single chart — efficiency delta vs baseline over 30 days, time on X,
          normal-range band behind the line. One timeframe, one reading: "how far above
          normal, over the last 30 days." Styling matched to the EGT-gap chart (GapTrend). */}
      <div {...layer('EfficiencyPanel / chart / trend30.chart', 'time-series · X −30D→NOW · Y % vs baseline · subtle normal-range band behind the line · zero ref · NOW point (yellow when caution) — the over-time efficiency read', '{daily_delta_1y[-30d]} % vs baseline · normal range ±{EFF_DELTA_CAUTION_PCT}%')} style={{ marginTop: 10, height: 220, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, minHeight: 0 }}>
          <TrendChartFill
            values={d.daily_delta_1y.slice(-30).map((x) => x.delta)}
            band={{ lo: -EFF_DELTA_CAUTION_PCT, hi: EFF_DELTA_CAUTION_PCT }}
          />
        </div>
        {/* caption parallel to the EGT-gap chart's "EGT GAP · 30D" */}
        <div style={{ fontFamily: 'var(--font-data)', fontSize: 'var(--type-micro)', letterSpacing: 1, color: 'var(--color-ink-muted)', marginTop: 2, textAlign: 'center' }}>EFFICIENCY · 30D</div>
      </div>
      {/* footer: baseline context + 24h strip (burn gph lives in the band) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 'var(--type-micro)', letterSpacing: 1, textTransform: 'uppercase', color: 'var(--color-ink-muted)', fontFamily: 'var(--font-data)' }}>24h</span>
        <span {...layer('EfficiencyPanel / footer / spark24.chart', 'ink/secondary 1px · line/subtle frame', '{derived.sparkline_24h — hourly efficiency_delta}')}>
          <Sparkline values={d.sparkline_24h} width={140} height={20} />
        </span>
        <span {...layer('EfficiencyPanel / footer / baseline.text', 'font/data 12 · ink/secondary', '{derived.baseline_value} {baseline_metric}')} style={{ ...gb.dim, fontSize: 'var(--type-context)' }}>
          baseline {d.baseline_value} {d.baseline_metric === 'gal_per_nm' ? 'gal/nm' : 'gph'}
        </span>
      </div>
      {/* ROUND 112: the reveal CHEVRON is removed — the deeper efficiency context
          (90d trend · 1y history · baseline band) is shown by DEFAULT and stripped
          in EXPERT. No collapse (same ruling as round 106). */}
      {!expertOn && (
        <div style={{ borderTop: '1px solid var(--color-line-hairline)', marginTop: 8, paddingTop: 8, fontSize: 'var(--type-context)' }}>
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
        </div>
      )}
      </section>
    </div>
  );
}
