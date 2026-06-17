'use client';
// ROUND 13: fill-parent trend chart for the expanded tile — the chart takes
// whatever space has nothing else to say (round 3.3 rule). Measures its flex
// box with a ResizeObserver and scales the PLOT, never a fixed pixel height.
// At tile-hero size it earns real axes: labeled zero baseline + y ticks under
// the min-gap rule.
//
// ROUND 127: optional NORMAL-RANGE band (efficiency panel). The tile keeps
// calling this with just `values` → renders exactly as before. When `band` is
// passed the chart becomes the efficiency panel's single over-time view: a
// subtle shaded "normal range" behind the line, so "above normal" reads (the
// line breaching the band's top) without a second chart. Styling stays matched
// to the EGT-gap chart (GapTrend).
//
// ROUND 128: a live NOW dot (`nowValue`) sits at the right edge (NOW on a time
// axis) at the TRUE CURRENT delta — the live efficiency value, NOT the noisy
// daily series endpoint (same posture as the EngineTwin hero: report the real
// current figure, not the jittery sample). It's emphasized + earns yellow at
// caution level, so it reads as "this instant" and visibly breaches the band.
// SIGNAL → kept in Expert; the "normal range" label is ORIENTATION → the caller
// drops it in Expert via `bandLabel`. The live dot is also what differentiates
// this chart from the EGT-gap trend at a glance (they were reading as twins).

import { useEffect, useRef, useState } from 'react';
import { FONT, NEUTRAL } from './probeTokens';

// ROUND 124: margins + treatment matched to the EGT-gap chart (GapTrend) — bottom lane
// for the −30D/NOW endpoints, 8px-floor axis numbers, fill-level area under the line.
const ML = 34; // y-label gutter (matches GapTrend M.l)
const MR = 8;
const MT = 8;
const MB = 18; // endpoint label lane (−30D / NOW)

function yTickStep(span: number, pxPerUnit: number): number {
  const steps = [0.5, 1, 2, 5, 10, 20, 50];
  return steps.find((st) => st * pxPerUnit >= 22) ?? steps[steps.length - 1];
}

export function TrendChartFill({
  values,
  band,
  bandLabel,
  nowValue,
  nowCaution = false,
}: {
  values: number[];
  /** ROUND 127: normal-range envelope (% vs baseline), shaded behind the line. */
  band?: { lo: number; hi: number };
  /** ROUND 128: the band's text label ("normal range") — ORIENTATION, so the caller
      drops it in Expert (undefined) while the band itself, SIGNAL, always stays. */
  bandLabel?: string;
  /** ROUND 128: live NOW value (% vs baseline) — the TRUE current delta, drawn as an
      emphasized dot at the right edge. Distinct from the daily series endpoint. */
  nowValue?: number;
  /** ROUND 128: earn yellow on the NOW dot only when the current delta is caution-level. */
  nowCaution?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 300, h: 110 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { w, h } = size;
  // ROUND 127: the domain spans the data, the zero baseline AND the normal band (when
  // present), so the band's edges are always in frame — "above normal" is the line
  // breaking out the top of the shaded zone.
  // ROUND 128: include the live NOW value in the domain so the dot — which sits at the
  // true current delta, above the daily line — is always in frame with headroom.
  const domMin = Math.min(...values, 0, band ? band.lo : 0, nowValue ?? 0);
  const domMax = Math.max(...values, 0, band ? band.hi : 0, nowValue ?? 0);
  const pad = Math.max(0.4, (domMax - domMin) * 0.08);
  const lo = domMin - pad;
  const hi = domMax + pad;
  const x = (i: number) => ML + (i / Math.max(1, values.length - 1)) * (w - ML - MR);
  const y = (v: number) => MT + (1 - (v - lo) / (hi - lo)) * (h - MT - MB);
  const step = yTickStep(hi - lo, (h - MT - MB) / (hi - lo));
  const ticks: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) ticks.push(Math.round(v * 10) / 10);

  // ROUND 124: axis numbers + endpoints in the EGT-gap chart's style — 8px floor, ink/muted.
  const tick: React.CSSProperties = { fontFamily: FONT.data, fontSize: 'var(--type-micro-floor)' };
  const linePts = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  return (
    <div ref={ref} style={{ width: '100%', height: '100%', minHeight: 90 }}>
      {values.length > 1 && (
        <svg width={w} height={h} style={{ display: 'block' }}>
          {/* ROUND 127: normal-range band behind everything — subtle fill + faint edges,
              its TOP edge is the EFF_DELTA caution threshold (sourced by the caller). */}
          {band && (
            <g>
              <rect x={ML} y={y(band.hi)} width={Math.max(0, w - ML - MR)} height={Math.max(0, y(band.lo) - y(band.hi))}
                fill="var(--color-fill-level)" />
              <line x1={ML} y1={y(band.hi)} x2={w - MR} y2={y(band.hi)} stroke="var(--color-line-subtle)" strokeWidth={1} />
              <line x1={ML} y1={y(band.lo)} x2={w - MR} y2={y(band.lo)} stroke="var(--color-line-subtle)" strokeWidth={1} />
              {/* ROUND 128: the text is ORIENTATION — dropped in Expert (bandLabel undefined). */}
              {bandLabel && (
                <text x={ML + 4} y={y(band.hi) + 11} style={{ fontFamily: FONT.data, fontSize: 'var(--type-micro-floor)', letterSpacing: 0.5 }} fill={NEUTRAL.inkMuted}>
                  {bandLabel}
                </text>
              )}
            </g>
          )}
          {ticks.map((v) => (
            <g key={v}>
              {/* gridlines match GapTrend: line/strong at zero, line/subtle elsewhere, 1px */}
              <line x1={ML} y1={y(v)} x2={w - MR} y2={y(v)}
                stroke={v === 0 ? 'var(--color-line-strong)' : 'var(--color-line-subtle)'} strokeWidth={1} />
              {/* % vs baseline — "0" = at baseline, the delta read against zero */}
              <text x={ML - 4} y={y(v) + 3} textAnchor="end" style={tick} fill={NEUTRAL.inkMuted}>
                {v === 0 ? '0' : `${v > 0 ? '+' : ''}${v}%`}
              </text>
            </g>
          ))}
          {/* ROUND 127: when a band is shown the band IS the reference plane, so the line
              stands alone (no fill-to-zero competing with the shaded band). The tile path
              (no band) keeps its fill/level area to zero — unchanged. */}
          {!band && (
            <polygon points={`${ML},${y(0).toFixed(1)} ${linePts} ${x(values.length - 1).toFixed(1)},${y(0).toFixed(1)}`} fill="var(--color-fill-level)" />
          )}
          <polyline points={linePts} fill="none" stroke="var(--color-ink-secondary)" strokeWidth={1.2} />
          {/* ROUND 128: live NOW dot at the right edge (NOW), at the TRUE current delta —
              above the daily line, visibly breaching the band. Emphasized (outer ring +
              filled core) so it reads as "this instant"; earns yellow at caution. This is
              the chart's live signal and what distinguishes it from the EGT-gap trend. */}
          {nowValue !== undefined && (() => {
            const c = nowCaution ? 'var(--color-alert-caution)' : 'var(--color-ink-secondary)';
            return (
              <g>
                <circle cx={w - MR} cy={y(nowValue)} r={6} fill="none" stroke={c} strokeWidth={1} opacity={0.4} />
                <circle cx={w - MR} cy={y(nowValue)} r={3.5} fill={c} />
              </g>
            );
          })()}
          {/* X-span endpoints, parallel to the EGT-gap chart's −30D / NOW */}
          <text x={ML} y={h - 4} style={tick} fill={NEUTRAL.inkMuted}>−30D</text>
          <text x={w - MR} y={h - 4} textAnchor="end" style={tick} fill={NEUTRAL.inkMuted}>NOW</text>
        </svg>
      )}
    </div>
  );
}
