'use client';
// ROUND 46: Calm Sea. A slow horizontal wave field behind the fleet view,
// BOUND TO FLEET METRICS — not decoration. The fleet's baseline state is
// information: every other instrument reports exceptions; this one reports the
// calm. Amplitude = f(|fleet mean delta|), frequency = f(avg burn fraction),
// tint = worst active severity at very low alpha. Drift is a constant slow
// translateX (GPU compositor); the metric values feed registered CSS custom
// properties that ease over 5s — JS writes 3 values, geometry never
// re-tessellates per frame. Governance: off in expert mode, off under
// prefers-reduced-motion, paused when the page is hidden, and a settings
// switch (default on).

import { useEffect, useMemo, useState } from 'react';
import { vesselStatus } from '../data/alerts';
import { useFleet } from '../state/FleetProvider';
import { useLearn } from '../learn/LearnProvider';

const VB_W = 2400; // tile space; repeats every 1200 so translateX(-50%) loops seamlessly
const VB_H = 220;
const BASE = 70; // waterline from top of the viewBox
const UNIT = 22; // unit amplitude (scaled by --wave-amp)

/** Periodic sine sum: integer cycles over the 1200 half-tile → seamless loop. */
function buildWavePath(): string {
  const pts: string[] = [];
  for (let x = 0; x <= VB_W; x += 16) {
    const u = (x / 1200) * Math.PI * 2;
    const y = BASE + UNIT * (Math.sin(u * 3) + 0.4 * Math.sin(u * 7 + 1.3) + 0.25 * Math.sin(u * 2 - 0.6));
    pts.push(`${x === 0 ? 'M' : 'L'} ${x} ${y.toFixed(1)}`);
  }
  return `${pts.join(' ')} L ${VB_W} ${VB_H} L 0 ${VB_H} Z`;
}

export function AmbientSea() {
  const { fleet, ambientSea } = useFleet();
  const { expertOn } = useLearn();
  const path = useMemo(() => buildWavePath(), []);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMq = () => setReduced(mq.matches);
    onMq();
    mq.addEventListener('change', onMq);
    const onVis = () => setPaused(document.hidden); // Page Visibility — free perf
    document.addEventListener('visibilitychange', onVis);
    return () => { mq.removeEventListener('change', onMq); document.removeEventListener('visibilitychange', onVis); };
  }, []);

  // off in expert (dense register), off when toggled off, off under reduced-motion
  if (!ambientSea || expertOn || reduced || !fleet) return null;

  // ---- metric bindings (the reason it earns its place) ----
  const meanAbsDelta = fleet.reduce((a, v) => a + Math.abs(v.derived.efficiency_delta_pct), 0) / fleet.length;
  const burnFrac = fleet.reduce((a, v) => {
    const cap = v.static.main_max_gph * 2 + v.static.gen_max_gph * 2;
    return a + Math.min(1, v.derived.burn_rate_gph / cap);
  }, 0) / fleet.length;
  const worst = fleet.reduce<'nominal' | 'watch' | 'degraded'>((w, v) => {
    const s = vesselStatus(v.alerts);
    return s === 'degraded' || w === 'degraded' ? 'degraded' : s === 'watch' || w === 'watch' ? 'watch' : 'nominal';
  }, 'nominal');

  const amp = Math.min(1.3, 0.35 + meanAbsDelta * 0.06); // calm → flat; drift → swells; capped so casualties don't churn
  const freq = Math.min(1.5, 0.85 + burnFrac * 0.6); // busier fleet → more passes; subtle
  const tint = worst === 'degraded' ? 'var(--color-alert-warning)'
    : worst === 'watch' ? 'var(--color-alert-caution)'
    : '#2b3a44'; // neutral cool — the calm

  const seaVars = { '--wave-amp': amp, '--wave-freq': freq, '--wave-tint': tint } as React.CSSProperties;

  return (
    <div className={`sea${paused ? ' paused' : ''}`} style={seaVars} aria-hidden>
      {(['a', 'b'] as const).map((k) => (
        <div key={k} className={`sea-drift ${k}`}>
          <svg className={`sea-shape ${k}`} width="100%" height="100%" viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="none">
            <path d={path} fill="var(--wave-tint)" />
          </svg>
        </div>
      ))}
    </div>
  );
}
