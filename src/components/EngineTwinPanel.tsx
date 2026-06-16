'use client';
// Machine bucket (§6) — ROUND 34 newsroom layout, every row spans the panel:
//   ROW 1: verdict block LEFT (~30%): micro label → gap °F (panel hero,
//          largest type in the section) → fuel Δ% → 24h avg (micro)
//          | EGT GAP 30D chart RIGHT (fills remaining width — evidence)
//   ROW 2: E1/E2 + G1/G2 one-liners, two columns (round 31 grammar)
//   ROW 3: sensors cluster, centered (round 31)
// Type ratios: gap hero > band gauge values > fuel Δ > rows > micro.
// The gap trend is the demo's "three weeks early" graphic. Text/gauge
// contract: state/load/fuel ONLY in rows; sensor internals ONLY in the
// cluster. Nothing repeats. EngineCard died round 31.

import type { VesselState } from '../data/types';
import { EGT_GAP_CAUTION_F } from '../data/alerts'; // round 118: severity threshold for the sustained-gap hero
import { Field } from './Field';
import { InstrumentCluster } from './InstrumentCluster';
import { useContentWidth } from './NauticalChart';
import { FONT, NEUTRAL } from './probeTokens';
import { gb, fmtPct } from './gb';
import { Label } from './Glyph';
import { layer } from '../learn/layer'; // LEARN MODE — strip before demo week

/** Daily mean E2−E1 EGT gap (both mains running), last 30 days. */
function gapTrend30d(vessel: VesselState): number[] {
  const now = vessel.history.minutes.at(-1)!.t;
  const cutoff = now - 30 * 86_400_000;
  const byDay = new Map<number, number[]>();
  for (const h of vessel.history.hourly) {
    if (h.t < cutoff) continue;
    const [m1, m2] = h.engines.filter((e) => e.role === 'MAIN');
    if (!m1.running || !m2.running) continue;
    const day = Math.floor(h.t / 86_400_000);
    let arr = byDay.get(day);
    if (!arr) byDay.set(day, (arr = []));
    arr.push(m2.exhaust_gas_temp_f - m1.exhaust_gas_temp_f);
  }
  return [...byDay.entries()].sort((a, b) => a[0] - b[0]).map(([, a]) => a.reduce((x, y) => x + y, 0) / a.length);
}

/** 30d gap area chart: axis ticks, zero line, low-alpha fill. The y-domain
    floors at ±20°F so a nominal twin reads CALM near zero, not as amplified
    noise filling the frame. Round 34: fills its container width — the
    panel-wide evidence beside the verdict block. */
function GapTrend({ values }: { values: number[] }) {
  const [wrapRef, W] = useContentWidth(560);
  const H = 120;
  const M = { l: 34, r: 8, t: 8, b: 18 };
  if (values.length < 2) return null;
  const lo = Math.min(-20, Math.floor(Math.min(...values) / 10) * 10);
  const hi = Math.max(20, Math.ceil(Math.max(...values) / 10) * 10);
  const x = (i: number) => M.l + (i / (values.length - 1)) * (W - M.l - M.r);
  const y = (v: number) => M.t + (1 - (v - lo) / (hi - lo)) * (H - M.t - M.b);
  const line = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const area = `${M.l},${y(0).toFixed(1)} ${line} ${x(values.length - 1).toFixed(1)},${y(0).toFixed(1)}`;
  const tick: React.CSSProperties = { fontFamily: FONT.data, fontSize: 'var(--type-micro-floor)' }; // round 86: documented 8px floor — the single smallest label
  return (
    <div ref={wrapRef} style={{ width: '100%' }}>
    <svg width={W} height={H} style={{ display: 'block' }}>
      {[lo, 0, hi].map((v) => (
        <g key={v}>
          <line x1={M.l} y1={y(v)} x2={W - M.r} y2={y(v)} stroke={v === 0 ? 'var(--color-line-strong)' : 'var(--color-line-subtle)'} strokeWidth={1} />
          <text x={M.l - 4} y={y(v) + 3} textAnchor="end" style={tick} fill={NEUTRAL.inkMuted}>{v > 0 ? `+${v}` : v}</text>
        </g>
      ))}
      <polygon points={area} fill="var(--color-fill-level)" />
      <polyline points={line} fill="none" stroke={NEUTRAL.inkSecondary} strokeWidth={1.2} />
      <text x={M.l} y={H - 4} style={tick} fill={NEUTRAL.inkMuted}>−30D</text>
      <text x={W - M.r} y={H - 4} textAnchor="end" style={tick} fill={NEUTRAL.inkMuted}>NOW</text>
    </svg>
    </div>
  );
}

export function EngineTwinPanel({ vessel }: { vessel: VesselState }) {
  const now = vessel.history.minutes.at(-1)!;
  const [m1, m2] = now.engines.filter((e) => e.role === 'MAIN');
  const mainsRunning = m1.running && m2.running;
  const fuelGapPct = mainsRunning && m1.fuel_rate_gph > 0 ? (m2.fuel_rate_gph / m1.fuel_rate_gph - 1) * 100 : 0;
  // ROUND 118: the panel HERO is the SUSTAINED divergence (the figure the caution is
  // about) — never the raw live gap. The live gap is 0 when both mains are OFF (no
  // differential when neither runs), which would misread as "all clear" while the
  // caution still says +58. So the hero shows the 24h-averaged sustained gap (yellow
  // when caution-level), and the live gap is a dim secondary that attributes its 0 to
  // "mains off". This is a divergence at matched load (efficiency degradation), a
  // trend — NOT acute overheating.
  const sustainedGap = vessel.derived.egt_twin_gap_f;
  const liveGap = mainsRunning ? m2.exhaust_gas_temp_f - m1.exhaust_gas_temp_f : null;
  const divergent = Math.abs(sustainedGap) > EGT_GAP_CAUTION_F;
  const fmtGap = (n: number) => `${n > 0 ? '+' : ''}${Math.round(n)}`;
  const ids = ['E1', 'E2', 'G1', 'G2'];

  return (
    // round 37: header floats above the fill
    <div style={{ marginBottom: 'var(--pad-stack)' }}>
      <Label g="engine" headerAttrs={layer('EngineTwinPanel / header / header.glyph', 'section header · engine glyph · glyph-only in expert mode', 'ENGINE TWINS')} style={{ marginBottom: 4 }}>engine twins</Label>
      <section style={gb.box}>
      {/* ROW 1 — verdict left, panel-wide evidence right */}
      <div style={{ display: 'flex', gap: 'var(--pad-card)', alignItems: 'center', flexWrap: 'wrap' }}>
        <Field level="vessel" field="twin_comparison_delta">
          <div style={{ flex: '0 1 30%', minWidth: 210 }}>
            <div {...layer('EngineTwinPanel / verdict / label.text', 'gb.label micro-caps · ink/muted · SUSTAINED qualifier (round 118)', 'E2 VS E1 EGT · SUSTAINED')} style={{ ...gb.label, marginBottom: 4 }}>E2 vs E1 EGT · sustained</div>
            {/* ROUND 118: HERO = sustained divergence (24h-avg gap), severity-YELLOW when
                caution-level — this is the number the caution is about, no longer the
                quietest element. Never the raw live gap (0 when mains off → false all-clear). */}
            <div {...layer('EngineTwinPanel / verdict / gap.text', 'type/hero · font/data tabular — largest type in the section · severity yellow when divergent (round 118)', '{derived.egt_twin_gap_f} — sustained 24h-avg gap at matched load')} style={{ fontFamily: FONT.data, fontSize: 'var(--type-hero)', fontWeight: 500, fontVariantNumeric: 'tabular-nums', color: divergent ? 'var(--color-alert-caution)' : undefined }}>
              {fmtGap(sustainedGap)} °F
            </div>
            {/* live state — dim secondary; when both mains OFF the live 0 is attributed
                to "mains off", never presented as the headline finding. */}
            <div {...layer('EngineTwinPanel / verdict / live.text', 'font/data 12 · ink/dim · live instantaneous gap + fuel Δ, or "mains off" when neither main runs (round 118)', '{E2.egt − E1.egt} live · {fuel Δ at matched load} | mains off')} style={{ ...gb.dim, fontFamily: FONT.data, fontSize: 'var(--type-context)', marginTop: 4 }}>
              {mainsRunning ? `live ${fmtGap(liveGap!)} °F · fuel ${fmtPct(fuelGapPct)} at matched load` : 'live — · mains off'}
            </div>
          </div>
        </Field>
        <div {...layer('EngineTwinPanel / gapTrend / area.chart', 'fill/level area · ink/secondary line · zero line · y floors ±20°F (calm-not-empty)', '{daily mean E2−E1 EGT, 30d, both running} — the "three weeks early" graphic')} style={{ flex: '1 1 320px', minWidth: 0 }}>
          <GapTrend values={gapTrend30d(vessel)} />
          <div style={{ fontFamily: FONT.data, fontSize: 'var(--type-micro)', letterSpacing: 1, color: NEUTRAL.inkMuted, marginTop: 2, textAlign: 'center' }}>EGT GAP · 30D</div>
        </div>
      </div>
      {/* ROW 2 — mains and gens share ONE grammar, two columns wide.
          State/load/fuel live here and nowhere else. */}
      <div style={{ display: 'flex', gap: '0 var(--pad-card)', marginTop: 'var(--pad-section)', flexWrap: 'wrap', fontFamily: FONT.data, fontSize: 'var(--type-context)' }}>
        {now.engines.map((e, i) => (
          <span key={e.engine_id} {...layer('EngineTwinPanel / rows / engine.text', 'font/data 12 · id+role ink/muted left · state tabular right · hairline divider', '{id role · RUNNING load% fuel gph | OFF} — state/load/fuel live HERE only')} style={{ flex: '1 1 40%', minWidth: 280, display: 'flex', justifyContent: 'space-between', gap: 8, borderTop: '1px solid var(--color-line-hairline)', padding: '6px 0' }}>
            <span style={{ color: NEUTRAL.inkMuted }}>{ids[i]} {e.role}</span>
            <span style={{ color: e.running ? NEUTRAL.ink : NEUTRAL.inkMuted, fontVariantNumeric: 'tabular-nums' }}>
              {e.running ? `RUNNING · ${Math.round(e.load_pct)}% · ${e.fuel_rate_gph} gph` : 'OFF'}
            </span>
          </span>
        ))}
      </div>
      {/* ROW 3 — sensor cluster (verdict 13: gauges won), internals ONLY.
          ROUND 99: bottom divider removed — separation by spacing alone (consistent
          with the round-94/96 divider cleanup; not a stroke). */}
      <div style={{ marginTop: 'var(--pad-section)', paddingTop: 'var(--pad-section)' }}>
        <InstrumentCluster vessel={vessel} />
      </div>
      </section>
    </div>
  );
}
