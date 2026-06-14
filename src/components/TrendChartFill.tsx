'use client';
// ROUND 13: fill-parent trend chart for the expanded tile — the chart takes
// whatever space has nothing else to say (round 3.3 rule). Measures its flex
// box with a ResizeObserver and scales the PLOT, never a fixed pixel height.
// At tile-hero size it earns real axes: labeled zero baseline + y ticks under
// the min-gap rule.

import { useEffect, useRef, useState } from 'react';
import { FONT } from './probeTokens';

const ML = 30; // y-label gutter
const MR = 6;
const MT = 8;
const MB = 8;

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

  return (
    <div ref={ref} style={{ width: '100%', height: '100%', minHeight: 90 }}>
      {values.length > 1 && (
        <svg width={w} height={h} style={{ display: 'block' }}>
          {ticks.map((v) => (
            <g key={v}>
              <line x1={ML} y1={y(v)} x2={w - MR} y2={y(v)}
                stroke={v === 0 ? 'var(--color-line-strong)' : 'var(--color-line-subtle)'} strokeWidth={v === 0 ? 1.25 : 0.5} />
              <text x={ML - 5} y={y(v) + 3} textAnchor="end"
                style={{ fontFamily: FONT.data, fontSize: 'var(--type-micro)' }} fill="var(--color-ink-muted)">
                {v === 0 ? '0' : `${v > 0 ? '+' : ''}${v}`}
              </text>
            </g>
          ))}
          <polyline
            points={values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')}
            fill="none" stroke="var(--color-ink-secondary)" strokeWidth={1.5}
          />
        </svg>
      )}
    </div>
  );
}
