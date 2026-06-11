'use client';
// One engine. VISIBLE: role, running, load, fuel rate. The six sensor fields
// are CONTEXTUAL per the registry; they share ONE grouped reveal per card
// (six separate hover targets per engine would be 24 per vessel). Each row
// still checks the registry, so a reclassified field drops out of the group.

import type { EngineSample } from '../data/types';
import { getDisposition } from './Field';
import { Contextual } from './Contextual';
import { DataRow } from './DataRow';
import { Sparkline } from './Sparkline';
import { gb } from './gb';

const SENSOR_ROWS: { field: string; label: string; value: (e: EngineSample) => string }[] = [
  { field: 'engine.exhaust_gas_temp_f', label: 'EGT', value: (e) => `${e.exhaust_gas_temp_f} °F` },
  { field: 'engine.coolant_temp_f', label: 'coolant', value: (e) => `${e.coolant_temp_f} °F` },
  { field: 'engine.oil_pressure_psi', label: 'oil', value: (e) => `${e.oil_pressure_psi} psi` },
  { field: 'engine.oil_temp_f', label: 'oil temp', value: (e) => `${e.oil_temp_f} °F` },
  { field: 'engine.rpm', label: 'rpm', value: (e) => `${e.rpm}` },
  { field: 'engine.running_hours', label: 'hours', value: (e) => `${e.running_hours}` },
];

export function EngineCard({
  engine,
  title,
  egtTrend30d,
}: {
  engine: EngineSample;
  title: string;
  /** daily mean EGT, last 30 days — spec v2 §8 trend overlay (round 10) */
  egtTrend30d?: number[];
}) {
  const contextualRows = SENSOR_ROWS.filter(
    (r) => getDisposition('vessel', r.field)?.disposition === 'CONTEXTUAL',
  );
  return (
    <div style={{ ...gb.box, minWidth: 190 }}>
      <div style={gb.label}>
        {title} ({engine.role})
      </div>
      {/* data cluster: labels left-ranged, numerals right-ranged (probe item 6) */}
      <DataRow label="state" value={engine.running ? 'RUNNING' : 'STOPPED'} />
      <DataRow label="load" value={`${engine.load_pct}%`} />
      <DataRow label="fuel" value={`${engine.fuel_rate_gph} gph`} />
      <div style={{ marginTop: 4 }}>
        <Contextual label="sensors">
          <span>{contextualRows.map((r) => `${r.label} ${r.value(engine)}`).join(' · ')}</span>
          {egtTrend30d && egtTrend30d.length > 2 && (
            <span style={{ display: 'block', marginTop: 4 }}>
              <Sparkline values={egtTrend30d} width={150} height={26} zeroBaseline={false} />
              <span style={{ fontSize: 10, color: 'var(--color-ink-muted)', marginLeft: 6 }}>EGT 30d</span>
            </span>
          )}
        </Contextual>
      </div>
    </div>
  );
}
