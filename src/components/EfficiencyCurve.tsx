'use client';
// ROUND 5: burn-vs-speed envelope from the vessel's OWN 1y transit history.
// Quiet grey IQR band + median line, optimal-speed bracket, live operating
// point (accent ring; status fill when watch/degraded), and the payoff: a
// dotted drop-line measuring the point's vertical displacement from the
// envelope ("+14% vs envelope") — degradation as geometry. ROUND 34: chart
// only — EfficiencyPanel is the one efficiency card and embeds this. The
// "vs envelope" annotation stays here: a speed-specific comparison, distinct
// from the panel's mode-wide vs-baseline number; both are labeled.

import type { VesselState } from '../data/types';
import { vesselStatus } from '../data/alerts';
import { transitEnvelope, liveOperatingPoint, envelopeMedianAt, MIN_TRANSIT_HOURS } from '../data/curve';
import { useContentWidth } from './NauticalChart';
import { ACCENT, FONT, NEUTRAL, RADIUS, STATUS_COLOR } from './probeTokens';
import { fmtPct } from './gb';
import { layer } from '../learn/layer'; // LEARN MODE — strip before demo week

const H = 250;
// Round 11 axis hygiene: titles get reserved gutters (y rotated far-left,
// x in its own row below the ticks); ticks never overprint.
const M = { l: 58, r: 16, t: 14, b: 52 }; // round 21 B1: bottom gains a bracket lane

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
  const mono = { fontFamily: FONT.data, fontSize: 'var(--type-micro)', fill: '#6e7681' };

  if (env.bins.length < 3) {
    return (
      <div style={{ fontFamily: FONT.data, fontSize: 'var(--type-context)', color: NEUTRAL.inkMuted, padding: 24, textAlign: 'center' }}>
        INSUFFICIENT TRANSIT HISTORY
      </div>
    );
  }

  // ROUND 121: the X domain bounds ALL plotted X-elements — the envelope, the
  // optimal-speed bracket, AND the live NOW point — with only minimal breathing
  // padding, so there's no stretch of axis where nothing is drawn. The old domain
  // (envelope + point only, padded a wide max(0.25, 18%)) left empty bands left/right
  // and stranded the OPTIMAL bracket + NOW dot out in the dead right region. X-ONLY:
  // the NOW dot's vertical gap above the envelope (the +X% vs-envelope reading — the
  // whole chart's payoff) is set by the SEPARATE Y domain below and is unchanged.
  const speeds = [
    ...env.bins.map((b) => b.speed),
    ...(pt ? [pt.speed] : []),
    ...(env.optimal ? [env.optimal.lo, env.optimal.hi] : []),
  ];
  const spanX = Math.max(0.5, Math.max(...speeds) - Math.min(...speeds));
  const padX = Math.max(0.08, spanX * 0.05); // minimal breathing room, not the old wide bands
  const xLo = Math.min(...speeds) - padX;
  const xHi = Math.max(...speeds) + padX;
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
    <div ref={wrapRef} style={{ position: 'relative', overflow: 'hidden' }}>
        <svg width={w} height={H} style={{ display: 'block', background: 'var(--color-surface-base)', borderRadius: RADIUS }}>
          <g opacity={sparse ? 0.4 : 1}>
            <path {...layer('EfficiencyCurve / plot / envelope.shape', 'surface/overlay fill — 12-mo IQR band', '{transit envelope p25→p75 by speed bin}')} d={bandD} fill="var(--color-surface-overlay)" />
            <polyline {...layer('EfficiencyCurve / plot / median.line', 'ink/secondary 1.25px', '{envelope median by speed bin}')} points={medianPts} fill="none" stroke="var(--color-ink-secondary)" strokeWidth={1.25} />
          </g>
          {/* axes: ticks in their row, titles in their own gutters */}
          {xTicks.map((s) => (
            <g key={s}>
              <line x1={x(s)} y1={H - M.b} x2={x(s)} y2={H - M.b + 4} stroke="#3d4651" />
              <text x={x(s)} y={H - M.b + 15} textAnchor="middle" {...mono}>{s}</text>
            </g>
          ))}
          <text x={w - M.r} y={H - 6} textAnchor="end" {...mono} letterSpacing="0.2em">KN</text>
          {yTicks.map((v) => (
            <g key={v}>
              <line x1={M.l - 4} y1={y(v)} x2={M.l} y2={y(v)} stroke="#3d4651" />
              <text x={M.l - 8} y={y(v) + 3} textAnchor="end" {...mono}>{v}</text>
            </g>
          ))}
          <text x={14} y={M.t + (H - M.t - M.b) / 2} textAnchor="middle" {...mono} letterSpacing="0.2em"
            transform={`rotate(-90 14 ${M.t + (H - M.t - M.b) / 2})`}>GAL/NM</text>
          {/* optimal-speed bracket: its own lane BELOW the axis (round 21 B1 —
              never over plot content) */}
          {env.optimal && !sparse && (
            <g stroke="#4a535e" fill="none">
              <line x1={x(env.optimal.lo)} y1={H - 30} x2={x(env.optimal.lo)} y2={H - 25} />
              <line x1={x(env.optimal.hi)} y1={H - 30} x2={x(env.optimal.hi)} y2={H - 25} />
              <line x1={x(env.optimal.lo)} y1={H - 25} x2={x(env.optimal.hi)} y2={H - 25} />
              <text x={(x(env.optimal.lo) + x(env.optimal.hi)) / 2} y={H - 15} textAnchor="middle" {...mono} stroke="none">
                OPTIMAL {env.optimal.lo.toFixed(1)}–{env.optimal.hi.toFixed(1)} KN
              </text>
            </g>
          )}
          {/* on-chart micro labels (round 21 B1) */}
          {!sparse && env.bins.length > 0 && (
            <text x={x(env.bins[0].speed) + 4} y={y(env.bins[0].p75) - 5} {...mono} style={{ fontSize: 'var(--type-micro)' }}>
              12-MO NORMAL
            </text>
          )}
          {/* live operating point + drop-line to its own envelope */}
          {pt && medianAtPt && (
            <g>
              <line
                {...layer('EfficiencyCurve / plot / drop.line', 'ink/muted dashed — degradation as geometry', '{live point → envelope median at same speed}')}
                x1={x(pt.speed)} y1={y(pt.galNm)} x2={x(pt.speed)} y2={y(medianAtPt)}
                stroke={NEUTRAL.inkMuted} strokeWidth={1} strokeDasharray="2 3"
              />
              <circle
                {...layer('EfficiencyCurve / plot / now.dot', 'accent ring (identity) · status fill when watch/degraded (status outranks accent)', '{live gal/nm @ speed_over_ground}')}
                cx={x(pt.speed)} cy={y(pt.galNm)} r={6}
                fill={status !== 'nominal' ? STATUS_COLOR[status] : 'none'}
                stroke={ACCENT.bright} strokeWidth={2}
              />
              <text x={x(pt.speed)} y={y(pt.galNm) - 10} textAnchor="middle" {...mono} style={{ fontSize: 'var(--type-micro)' }}>NOW</text>
              <text
                {...layer('EfficiencyCurve / plot / delta.text', 'font/data 10 · status tint (earned) — labeled: speed-specific, distinct from vs-baseline', '{live gal/nm / envelope median − 1} vs envelope')}
                x={x(pt.speed) + 130 > w - M.r ? x(pt.speed) - 11 : x(pt.speed) + 11}
                y={(y(pt.galNm) + y(medianAtPt)) / 2 + 3}
                textAnchor={x(pt.speed) + 130 > w - M.r ? 'end' : 'start'}
                {...mono} style={{ fontSize: 'var(--type-micro)' }}
                fill={status !== 'nominal' ? STATUS_COLOR[status] : '#a9b1ba'}
              >
                {fmtPct(deltaPct!)} vs envelope
              </text>
            </g>
          )}
          {sparse && (
            <text x={w / 2} y={H / 2} textAnchor="middle" {...mono} style={{ fontSize: 'var(--type-context)' }}>
              INSUFFICIENT TRANSIT HISTORY
            </text>
          )}
        </svg>
      {!pt && !sparse && (
        <div style={{ position: 'absolute', right: 10, top: 8, fontFamily: FONT.data, fontSize: 'var(--type-micro)', color: NEUTRAL.inkMuted }}>
          NO LIVE POINT — NOT IN TRANSIT
        </div>
      )}
    </div>
  );
}
