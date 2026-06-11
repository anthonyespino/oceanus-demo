'use client';
// ROUND 5: inspector hero — burn-vs-speed envelope from the vessel's OWN 1y
// transit history. Quiet grey IQR band + median line, optimal-speed bracket,
// live operating point (accent ring; status fill when watch/degraded), and
// the payoff: a dotted drop-line measuring the point's vertical displacement
// from the envelope ("+14% vs envelope") — degradation as geometry.

import type { VesselState } from '../data/types';
import { vesselStatus } from '../data/alerts';
import { transitEnvelope, liveOperatingPoint, envelopeMedianAt, MIN_TRANSIT_HOURS } from '../data/curve';
import { useContentWidth } from './NauticalChart';
import { ACCENT, FONT, NEUTRAL, RADIUS, STATUS_COLOR } from './probeTokens';
import { gb, fmtPct } from './gb';
import { Label } from './Glyph';

const H = 250;
// Round 11 axis hygiene: titles get reserved gutters (y rotated far-left,
// x in its own row below the ticks); ticks never overprint.
const M = { l: 58, r: 16, t: 14, b: 38 };

function tickStep(span: number, pxPerUnit: number, minGapPx: number, steps: number[]): number {
  return steps.find((st) => st * pxPerUnit >= minGapPx) ?? steps[steps.length - 1];
}
function ticksFor(lo: number, hi: number, step: number): number[] {
  const out: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(Math.round(v * 100) / 100);
  return out;
}

export function EfficiencyCurve({ vessel }: { vessel: VesselState }) {
  const [wrapRef, w] = useContentWidth(560);
  const env = transitEnvelope(vessel.history);
  const pt = liveOperatingPoint(vessel.history);
  const status = vesselStatus(vessel.alerts);
  const sparse = env.transitHours < MIN_TRANSIT_HOURS;
  const mono = { fontFamily: FONT.data, fontSize: 9, fill: '#6e7681' };

  if (env.bins.length < 3) {
    return (
      <section style={{ ...gb.box, marginBottom: 8 }}>
        <Label g="chart">burn vs speed</Label>
        <div style={{ fontFamily: FONT.data, fontSize: 11, color: NEUTRAL.inkMuted, padding: 24, textAlign: 'center' }}>
          INSUFFICIENT TRANSIT HISTORY
        </div>
      </section>
    );
  }

  // Domain fits the content (envelope + live point), padded ~15-18% — the
  // data occupies ~70-80% of the plot, never a corner.
  const speeds = [...env.bins.map((b) => b.speed), ...(pt ? [pt.speed] : [])];
  const spanX = Math.max(0.5, Math.max(...speeds) - Math.min(...speeds));
  const xLo = Math.min(...speeds) - Math.max(0.25, spanX * 0.18);
  const xHi = Math.max(...speeds) + Math.max(0.25, spanX * 0.18);
  const yVals = [...env.bins.flatMap((b) => [b.p25, b.p75]), ...(pt ? [pt.galNm] : [])].filter((v) => v > 0);
  // Round 15: band + point own the vertical middle two-thirds, not a
  // stripe in empty air.
  const spanY = Math.max(0.05, Math.max(...yVals) - Math.min(...yVals));
  const yLo = Math.min(...yVals) - spanY * 0.08;
  const yHi = Math.max(...yVals) + spanY * 0.1;
  const x = (s: number) => M.l + ((s - xLo) / (xHi - xLo)) * (w - M.l - M.r);
  const y = (v: number) => M.t + (1 - (v - yLo) / (yHi - yLo)) * (H - M.t - M.b);

  const bandD =
    `M ${env.bins.map((b) => `${x(b.speed).toFixed(1)} ${y(b.p75).toFixed(1)}`).join(' L ')}` +
    ` L ${[...env.bins].reverse().map((b) => `${x(b.speed).toFixed(1)} ${y(b.p25).toFixed(1)}`).join(' L ')} Z`;
  const medianPts = env.bins.map((b) => `${x(b.speed).toFixed(1)},${y(b.median).toFixed(1)}`).join(' ');
  const medianAtPt = pt ? envelopeMedianAt(env, pt.speed) : null;
  const deltaPct = pt && medianAtPt ? (pt.galNm / medianAtPt - 1) * 100 : null;
  // Min-gap tick rule: drop ticks before overlapping them.
  const xStep = tickStep(xHi - xLo, (w - M.l - M.r) / (xHi - xLo), 44, [0.25, 0.5, 1, 2, 5]);
  const xTicks = ticksFor(xLo, xHi, xStep);
  const yStep = tickStep(yHi - yLo, (H - M.t - M.b) / (yHi - yLo), 26, [0.02, 0.05, 0.1, 0.2, 0.25, 0.5, 1, 2]);
  const yTicks = ticksFor(yLo, yHi, yStep);

  return (
    <section style={{ ...gb.box, marginBottom: 8 }}>
      <Label g="chart">burn vs speed</Label>
      <div ref={wrapRef} style={{ position: 'relative', overflow: 'hidden' }}>
        <svg width={w} height={H} style={{ display: 'block', background: 'var(--color-surface-base)', borderRadius: RADIUS }}>
          <g opacity={sparse ? 0.4 : 1}>
            <path d={bandD} fill="var(--color-surface-overlay)" />
            <polyline points={medianPts} fill="none" stroke="var(--color-ink-secondary)" strokeWidth={1.25} />
          </g>
          {/* axes: ticks in their row, titles in their own gutters */}
          {xTicks.map((s) => (
            <g key={s}>
              <line x1={x(s)} y1={H - M.b} x2={x(s)} y2={H - M.b + 4} stroke="#3d4651" />
              <text x={x(s)} y={H - M.b + 15} textAnchor="middle" {...mono}>{s}</text>
            </g>
          ))}
          <text x={M.l + (w - M.l - M.r) / 2} y={H - 6} textAnchor="middle" {...mono} letterSpacing="0.2em">KN</text>
          {yTicks.map((v) => (
            <g key={v}>
              <line x1={M.l - 4} y1={y(v)} x2={M.l} y2={y(v)} stroke="#3d4651" />
              <text x={M.l - 8} y={y(v) + 3} textAnchor="end" {...mono}>{v}</text>
            </g>
          ))}
          <text x={14} y={M.t + (H - M.t - M.b) / 2} textAnchor="middle" {...mono} letterSpacing="0.2em"
            transform={`rotate(-90 14 ${M.t + (H - M.t - M.b) / 2})`}>GAL/NM</text>
          {/* optimal-speed bracket */}
          {env.optimal && !sparse && (
            <g stroke="#4a535e" fill="none">
              <line x1={x(env.optimal.lo)} y1={H - M.b - 8} x2={x(env.optimal.lo)} y2={H - M.b} />
              <line x1={x(env.optimal.hi)} y1={H - M.b - 8} x2={x(env.optimal.hi)} y2={H - M.b} />
              <line x1={x(env.optimal.lo)} y1={H - M.b - 8} x2={x(env.optimal.hi)} y2={H - M.b - 8} />
              <text x={(x(env.optimal.lo) + x(env.optimal.hi)) / 2} y={H - M.b - 13} textAnchor="middle" {...mono} stroke="none">
                OPTIMAL {env.optimal.lo.toFixed(1)}–{env.optimal.hi.toFixed(1)} KN
              </text>
            </g>
          )}
          {/* live operating point + drop-line to its own envelope */}
          {pt && medianAtPt && (
            <g>
              <line
                x1={x(pt.speed)} y1={y(pt.galNm)} x2={x(pt.speed)} y2={y(medianAtPt)}
                stroke={NEUTRAL.inkMuted} strokeWidth={1} strokeDasharray="2 3"
              />
              <circle
                cx={x(pt.speed)} cy={y(pt.galNm)} r={6}
                fill={status !== 'nominal' ? STATUS_COLOR[status] : 'none'}
                stroke={ACCENT.bright} strokeWidth={2}
              />
              <text
                x={x(pt.speed) + 130 > w - M.r ? x(pt.speed) - 11 : x(pt.speed) + 11}
                y={(y(pt.galNm) + y(medianAtPt)) / 2 + 3}
                textAnchor={x(pt.speed) + 130 > w - M.r ? 'end' : 'start'}
                {...mono} fontSize={10}
                fill={status !== 'nominal' ? STATUS_COLOR[status] : '#a9b1ba'}
              >
                {fmtPct(deltaPct!)} vs envelope
              </text>
            </g>
          )}
          {sparse && (
            <text x={w / 2} y={H / 2} textAnchor="middle" {...mono} fontSize={11}>
              INSUFFICIENT TRANSIT HISTORY
            </text>
          )}
        </svg>
        {!pt && !sparse && (
          <div style={{ position: 'absolute', right: 10, top: 8, fontFamily: FONT.data, fontSize: 10, color: NEUTRAL.inkMuted }}>
            NO LIVE POINT — NOT IN TRANSIT
          </div>
        )}
      </div>
    </section>
  );
}
