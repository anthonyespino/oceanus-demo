'use client';
// One engine. VISIBLE: role, running, load, fuel rate. The six sensor fields
// are CONTEXTUAL per the registry; they share ONE grouped reveal per card
// (six separate hover targets per engine would be 24 per vessel). Each row
// still checks the registry, so a reclassified field drops out of the group.

import type { EngineSample } from '../data/types';
import { getDisposition } from './Field';
import { RevealZone } from './Contextual';
import { Gauge } from './Gauge';
import { useFleet } from '../state/FleetProvider';
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
  const { sensorStyle } = useFleet();
  const off = !engine.running;
  const DANGER = 'var(--color-alert-warning)';
  return (
    <div style={{ ...gb.box, minWidth: 190, display: 'flex', flexDirection: 'column' }}>
      <RevealZone
        reveal={
          <>
            {sensorStyle === 'gauges' ? (
              /* round 15: mini-gauges take per-engine reveal duty */
              <span style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Gauge size={62} label="EGT" value={engine.exhaust_gas_temp_f} min={400} max={1000} unit="°" off={off}
                  displayLimits={[920]} />
                <Gauge size={62} label="oil" value={engine.oil_pressure_psi} min={0} max={90} off={off}
                  vital={!off && engine.oil_pressure_psi < 30 ? 'degraded' : 'nominal'}
                  band={{ from: 0, to: 30, color: DANGER }} />
                <Gauge size={62} label="rpm" value={engine.rpm} min={0} max={2000} off={off} />
              </span>
            ) : (
              <span>{contextualRows.map((r) => `${r.label} ${r.value(engine)}`).join(' · ')}</span>
            )}
            {egtTrend30d && egtTrend30d.length > 2 && (
              <span style={{ display: 'block', marginTop: 4 }}>
                <Sparkline values={egtTrend30d} width={150} height={26} zeroBaseline={false} />
                <span style={{ fontSize: 10, color: 'var(--color-ink-muted)', marginLeft: 6 }}>EGT 30d</span>
              </span>
            )}
          </>
        }
      >
      <div style={gb.label}>
        {title} ({engine.role})
      </div>
      {/* data cluster: labels left-ranged, numerals right-ranged (probe item 6) */}
      {/* round 16 cut: "state" label was redundant — the value states itself */}
      <div style={{ fontFamily: 'var(--font-data)', fontSize: 12, color: engine.running ? 'var(--color-ink-primary)' : 'var(--color-ink-muted)' }}>
        {engine.running ? 'RUNNING' : 'STOPPED'}
      </div>
      <DataRow label="load" value={`${engine.load_pct}%`} />
      {/* round 19 cut: "fuel" label — gph on an engine card self-describes */}
      <DataRow label="" value={`${engine.fuel_rate_gph} gph`} />
      </RevealZone>
    </div>
  );
}
