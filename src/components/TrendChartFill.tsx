'use client';
// ROUND 13: fill-parent trend chart for the expanded tile — the chart takes
// whatever space has nothing else to say (round 3.3 rule). Measures its flex
// box with a ResizeObserver and scales the PLOT, never a fixed pixel height.
// At tile-hero size it earns real axes: labeled zero baseline + y ticks under
// the min-gap rule.

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

export function TrendChartFill({ values }: { values: number[] }) {
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
  const lo = Math.min(...values, 0) - Math.max(0.4, (Math.max(...values) - Math.min(...values)) * 0.08);
  const hi = Math.max(...values, 0) + Math.max(0.4, (Math.max(...values) - Math.min(...values)) * 0.08);
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
          {/* fill/level area to the zero baseline, then the line — same treatment as the EGT-gap chart */}
          <polygon points={`${ML},${y(0).toFixed(1)} ${linePts} ${x(values.length - 1).toFixed(1)},${y(0).toFixed(1)}`} fill="var(--color-fill-level)" />
          <polyline points={linePts} fill="none" stroke="var(--color-ink-secondary)" strokeWidth={1.2} />
          {/* X-span endpoints, parallel to the EGT-gap chart's −30D / NOW */}
          <text x={ML} y={h - 4} style={tick} fill={NEUTRAL.inkMuted}>−30D</text>
          <text x={w - MR} y={h - 4} textAnchor="end" style={tick} fill={NEUTRAL.inkMuted}>NOW</text>
        </svg>
      )}
    </div>
  );
}
