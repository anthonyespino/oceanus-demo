'use client';
// ROUND 11: instrument cluster — DP-console-style dial set for one engine's
// CONTEXTUAL sensor fields (EGT, coolant, oil pressure, oil temp, RPM).
// ROUND 31: every gauge carries the same micro 24h area-trace beneath it
// (uniform — no orphans; the absolute-EGT 30d sparkline moved to the twin
// hero as the GAP trend). Grid centered; selector chips above-right.
// Defaults to the alert-flagged engine when one exists.

import { useState } from 'react';
import type { VesselState } from '../data/types';
import { toggleStyle, NEUTRAL } from './probeTokens';
import { Gauge, type Vital } from './Gauge';
import { gb } from './gb';

const DANGER = 'var(--color-alert-warning)';

/** Index of the engine named in an active alert, else the first main. */
function flaggedEngineIdx(vessel: VesselState): number {
  const now = vessel.history.minutes.at(-1)!;
  for (const a of vessel.alerts) {
    const idx = now.engines.findIndex((e) => a.message.includes(e.engine_id));
    if (idx >= 0) return idx;
  }
  return 0;
}

/** Vital for an engine dial: OFF→still; alert naming the engine inherits its
    level; else per-dial limit check; else nominal (Anthony ruling 14). */
export function engineVital(
  vessel: VesselState,
  engineId: string,
  running: boolean,
  overLimit: boolean,
  limitLevel: Vital = 'watch',
): Vital {
  if (!running) return 'still';
  for (const a of vessel.alerts) {
    if (a.message.includes(engineId)) return a.level === 'WARNING' ? 'degraded' : 'watch';
  }
  return overLimit ? limitLevel : 'nominal';
}

/** Micro 24h area-trace, gauge-cell width — same under EVERY dial. */
function AreaTrace({ values, off }: { values: number[]; off: boolean }) {
  const W = 86; // = gauge cell width
  const H = 18;
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const x = (i: number) => (i / (values.length - 1)) * W;
  const y = (v: number) => 2 + (1 - (v - min) / span) * (H - 4);
  const line = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  return (
    <svg width={W} height={H} style={{ display: 'block', margin: '2px auto 0', opacity: off ? 0.3 : 1 }}>
      <polygon points={`0,${H} ${line} ${W},${H}`} fill="var(--color-fill-level)" />
      <polyline points={line} fill="none" stroke={NEUTRAL.inkMuted} strokeWidth={1} />
    </svg>
  );
}

/** Last-24h minute series for one engine field, sampled to ~96 points. */
function trace24h(vessel: VesselState, idx: number, pick: (e: VesselState['history']['minutes'][number]['engines'][number]) => number): number[] {
  const ms = vessel.history.minutes;
  const stride = Math.max(1, Math.floor(ms.length / 96));
  const out: number[] = [];
  for (let i = 0; i < ms.length; i += stride) out.push(pick(ms[i].engines[idx]));
  return out;
}

export function InstrumentCluster({ vessel }: { vessel: VesselState }) {
  const now = vessel.history.minutes.at(-1)!;
  const [idx, setIdx] = useState(() => flaggedEngineIdx(vessel));
  const e = now.engines[idx];
  const off = !e.running;

  const dials: { label: string; value: number; min: number; max: number; unit?: string; displayLimits?: number[]; band?: { from: number; to: number; color: string }; limitLevel?: Vital; over?: boolean; pick: Parameters<typeof trace24h>[2] }[] = [
    { label: 'EGT', value: e.exhaust_gas_temp_f, min: 400, max: 1000, unit: '°F', displayLimits: [920], pick: (x) => x.exhaust_gas_temp_f },
    { label: 'coolant', value: e.coolant_temp_f, min: 120, max: 220, unit: '°F', displayLimits: [203], pick: (x) => x.coolant_temp_f },
    { label: 'oil', value: e.oil_pressure_psi, min: 0, max: 90, unit: ' psi', band: { from: 0, to: 30, color: DANGER }, over: e.oil_pressure_psi < 30, limitLevel: 'degraded', pick: (x) => x.oil_pressure_psi },
    { label: 'oil temp', value: e.oil_temp_f, min: 120, max: 240, unit: '°F', displayLimits: [226], pick: (x) => x.oil_temp_f },
    { label: 'rpm', value: e.rpm, min: 0, max: 2000, pick: (x) => x.rpm },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <span style={{ ...gb.label, marginBottom: 0 }}>sensors — {['E1', 'E2', 'G1', 'G2'][idx]}</span>
        <span style={{ display: 'inline-flex', gap: 4 }}>
          {now.engines.map((eng, i) => (
            <button key={eng.engine_id} style={toggleStyle(i === idx)} onClick={() => setIdx(i)}>
              {['E1', 'E2', 'G1', 'G2'][i]}
            </button>
          ))}
        </span>
      </div>
      {/* round 19 fixed-cell grid, round 31 centered; display ceilings stay
          NEUTRAL ticks (ruling 11) — only the oil minimum is alert-backed */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))', justifyItems: 'center', justifyContent: 'center', gap: 'var(--pad-section)', marginTop: 'var(--pad-section)' }}>
        {dials.map((d) => (
          <div key={d.label} style={{ width: 86 }}>
            <Gauge label={d.label} value={d.value} min={d.min} max={d.max} unit={d.unit} off={off}
              vital={engineVital(vessel, e.engine_id, e.running, d.over ?? false, d.limitLevel ?? 'watch')}
              displayLimits={d.displayLimits} band={d.band} />
            <AreaTrace values={trace24h(vessel, idx, d.pick)} off={off} />
          </div>
        ))}
      </div>
    </div>
  );
}
