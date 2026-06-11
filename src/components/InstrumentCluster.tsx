'use client';
// ROUND 11: instrument cluster — DP-console-style dial set for one engine's
// CONTEXTUAL sensor fields (EGT, coolant, oil pressure, oil temp, RPM).
// Ships against the text sensor rows as a dev-panel toggle; Anthony verdicts
// which survives. Defaults to the alert-flagged engine when one exists.

import { useState } from 'react';
import type { VesselState } from '../data/types';
import { toggleStyle } from './probeTokens';
import { Gauge, type Vital } from './Gauge';
import { DataRow } from './DataRow';
import { gb } from './gb';
import { Label } from './Glyph';

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

/**
 * Round 15: when the gauges move into per-engine reveal duty, the engine-grid
 * cell falls back to this compact summary — the cell is never empty.
 */
export function EnginesSummary({ vessel }: { vessel: VesselState }) {
  const now = vessel.history.minutes.at(-1)!;
  return (
    <section style={{ ...gb.box, marginBottom: 8, height: '100%', boxSizing: 'border-box' }}>
      <Label g="engine">engines</Label>
      {now.engines.map((e, i) => (
        <DataRow
          key={e.engine_id}
          label={`${['E1', 'E2', 'G1', 'G2'][i]} ${e.role}`}
          value={e.running ? `RUNNING · ${Math.round(e.load_pct)}%` : 'OFF'}
        />
      ))}
    </section>
  );
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

export function InstrumentCluster({ vessel }: { vessel: VesselState }) {
  const now = vessel.history.minutes.at(-1)!;
  const [idx, setIdx] = useState(() => flaggedEngineIdx(vessel));
  const e = now.engines[idx];
  const main = e.role === 'MAIN';
  const off = !e.running;

  return (
    <section style={{ ...gb.box, marginBottom: 8, height: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <Label g="gauge" style={{ marginBottom: 0 }}>instruments</Label>
        <span style={{ display: 'inline-flex', gap: 4 }}>
          {now.engines.map((eng, i) => (
            <button key={eng.engine_id} style={toggleStyle(i === idx)} onClick={() => setIdx(i)}>
              {['E1', 'E2', 'G1', 'G2'][i]}
            </button>
          ))}
        </span>
      </div>
      {/* round 19: fixed-cell grid — equal cells, consistent gutters, panel
          height = content. Display ceilings are NEUTRAL ticks (ruling 11
          enforced); only the oil minimum is alert-backed and colored. */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', justifyItems: 'center', gap: 'var(--pad-section)', marginTop: 'var(--pad-section)' }}>
        <Gauge label="EGT" value={e.exhaust_gas_temp_f} min={400} max={1000} unit="°F" off={off}
          vital={engineVital(vessel, e.engine_id, e.running, false)}
          displayLimits={[920]} />
        <Gauge label="coolant" value={e.coolant_temp_f} min={120} max={220} unit="°F" off={off}
          vital={engineVital(vessel, e.engine_id, e.running, false)}
          displayLimits={[203]} />
        <Gauge label="oil" value={e.oil_pressure_psi} min={0} max={90} unit=" psi" off={off}
          vital={engineVital(vessel, e.engine_id, e.running, e.oil_pressure_psi < 30, 'degraded')}
          band={{ from: 0, to: 30, color: DANGER }} />
        <Gauge label="oil temp" value={e.oil_temp_f} min={120} max={240} unit="°F" off={off}
          vital={engineVital(vessel, e.engine_id, e.running, false)}
          displayLimits={[226]} />
        <Gauge label="rpm" value={e.rpm} min={0} max={main ? 2000 : 2000} off={off}
          vital={engineVital(vessel, e.engine_id, e.running, false)} />
      </div>
    </section>
  );
}
