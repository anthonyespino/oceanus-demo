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

const H = 240;
const M = { l: 46, r: 14, t: 12, b: 26 };

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
        <div style={gb.label}>burn vs speed — 12mo transit envelope</div>
        <div style={{ fontFamily: FONT.data, fontSize: 11, color: NEUTRAL.inkMuted, padding: 24, textAlign: 'center' }}>
          INSUFFICIENT TRANSIT HISTORY
        </div>
      </section>
    );
  }

  const speeds = env.bins.map((b) => b.speed);
  const xLo = Math.min(...speeds) - 0.5;
  const xHi = Math.max(...speeds, pt?.speed ?? 0) + 0.5;
  const yVals = [...env.bins.flatMap((b) => [b.p25, b.p75]), pt?.galNm ?? 0].filter((v) => v > 0);
  const yLo = Math.min(...yVals) * 0.88;
  const yHi = Math.max(...yVals) * 1.08;
  const x = (s: number) => M.l + ((s - xLo) / (xHi - xLo)) * (w - M.l - M.r);
  const y = (v: number) => M.t + (1 - (v - yLo) / (yHi - yLo)) * (H - M.t - M.b);

  const bandD =
    `M ${env.bins.map((b) => `${x(b.speed).toFixed(1)} ${y(b.p75).toFixed(1)}`).join(' L ')}` +
    ` L ${[...env.bins].reverse().map((b) => `${x(b.speed).toFixed(1)} ${y(b.p25).toFixed(1)}`).join(' L ')} Z`;
  const medianPts = env.bins.map((b) => `${x(b.speed).toFixed(1)},${y(b.median).toFixed(1)}`).join(' ');
  const medianAtPt = pt ? envelopeMedianAt(env, pt.speed) : null;
  const deltaPct = pt && medianAtPt ? (pt.galNm / medianAtPt - 1) * 100 : null;
  const xTicks = [];
  for (let s = Math.ceil(xLo); s <= xHi; s += 2) xTicks.push(s);

  return (
    <section style={{ ...gb.box, marginBottom: 8 }}>
      <div style={gb.label}>burn vs speed — 12mo transit envelope · {env.transitHours} h</div>
      <div ref={wrapRef} style={{ position: 'relative', overflow: 'hidden' }}>
        <svg width={w} height={H} style={{ display: 'block', background: 'var(--color-surface-base)', borderRadius: RADIUS }}>
          <g opacity={sparse ? 0.4 : 1}>
            <path d={bandD} fill="var(--color-surface-overlay)" />
            <polyline points={medianPts} fill="none" stroke="var(--color-ink-secondary)" strokeWidth={1.25} />
          </g>
          {/* axes */}
          {xTicks.map((s) => (
            <g key={s}>
              <line x1={x(s)} y1={H - M.b} x2={x(s)} y2={H - M.b + 4} stroke="#3d4651" />
              <text x={x(s)} y={H - M.b + 14} textAnchor="middle" {...mono}>{s}</text>
            </g>
          ))}
          <text x={w - M.r} y={H - M.b + 14} textAnchor="end" {...mono}>KN</text>
          {[yLo, (yLo + yHi) / 2, yHi].map((v, i) => (
            <text key={i} x={M.l - 6} y={y(v) + 3} textAnchor="end" {...mono}>{v.toFixed(1)}</text>
          ))}
          <text x={M.l - 6} y={M.t + 2} textAnchor="end" {...mono}>GAL/NM</text>
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
                x={x(pt.speed) + 11} y={(y(pt.galNm) + y(medianAtPt)) / 2 + 3}
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
