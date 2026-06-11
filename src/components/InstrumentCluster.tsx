'use client';
// ROUND 11: instrument cluster — DP-console-style dial set for one engine's
// CONTEXTUAL sensor fields (EGT, coolant, oil pressure, oil temp, RPM).
// Ships against the text sensor rows as a dev-panel toggle; Anthony verdicts
// which survives. Defaults to the alert-flagged engine when one exists.

import { useState } from 'react';
import type { VesselState } from '../data/types';
import { toggleStyle } from './probeTokens';
import { Gauge } from './Gauge';
import { DataRow } from './DataRow';
import { gb } from './gb';
import { Label } from './Glyph';

const WATCH = 'var(--color-alert-caution)';
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
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', marginTop: 'var(--pad-section)' }}>
        <Gauge label="EGT" value={e.exhaust_gas_temp_f} min={400} max={1000} unit="°F" off={off}
          limit={{ from: 920, to: 1000, color: WATCH }} />
        <Gauge label="coolant" value={e.coolant_temp_f} min={120} max={220} unit="°F" off={off}
          limit={{ from: 203, to: 220, color: WATCH }} />
        <Gauge label="oil" value={e.oil_pressure_psi} min={0} max={90} unit=" psi" off={off}
          limit={{ from: 0, to: 30, color: DANGER }} />
        <Gauge label="oil temp" value={e.oil_temp_f} min={120} max={240} unit="°F" off={off}
          limit={{ from: 226, to: 240, color: WATCH }} />
        <Gauge label="rpm" value={e.rpm} min={0} max={main ? 2000 : 2000} off={off} />
      </div>
    </section>
  );
}
