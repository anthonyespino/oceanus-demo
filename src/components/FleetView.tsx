'use client';
// LAYOUT PROBE (branch: layout-probe — disposable, do not merge): FleetView
// as a responsive grid of vessel tiles. Still ranked by sustained_deviation
// (v2 trend board); center-aligned grid per the alignment probe. Compression
// row suspended: 15 tiles fit one glanceable screen, which is what the probe
// is testing.

import type { VesselState } from '../data/types';
import { useFleet } from '../state/FleetProvider';
import { AlertRail } from './AlertRail';
import { FleetTrend } from './FleetTrend';
import { VesselTile } from './VesselTile';
import { FleetMap } from './FleetMap';
import { Field } from './Field';
import { gb } from './gb';
import { NEUTRAL, RADIUS } from './probeTokens';

export function FleetView({ fleet }: { fleet: VesselState[] }) {
  const { density, setDensity, treatment, setTreatment } = useFleet();

  const ranked = [...fleet].sort(
    (a, b) => Math.abs(b.derived.sustained_deviation) - Math.abs(a.derived.sustained_deviation),
  );

  const toggle = (active: boolean): React.CSSProperties => ({
    border: `1px solid ${NEUTRAL.border}`,
    borderRadius: RADIUS,
    background: active ? '#e8e8e8' : NEUTRAL.surface,
    padding: '2px 10px',
    fontSize: 12,
    cursor: 'pointer',
  });

  return (
    <main style={{ padding: 20, maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <span style={{ ...gb.label, fontSize: 13 }}>
          trend board — ranked by sustained deviation · layout probe
        </span>
        <span style={{ display: 'inline-flex', gap: 6 }}>
          <button style={toggle(density === 'minimal')} onClick={() => setDensity('minimal')}>
            minimal
          </button>
          <button style={toggle(density === 'standard')} onClick={() => setDensity('standard')}>
            standard
          </button>
          <span style={{ width: 12 }} />
          <button style={toggle(treatment === 'automotive')} onClick={() => setTreatment('automotive')}>
            A · automotive
          </button>
          <button style={toggle(treatment === 'dark-cockpit')} onClick={() => setTreatment('dark-cockpit')}>
            B · dark cockpit
          </button>
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
          gap: 20,
          justifyItems: 'stretch',
          marginBottom: 20,
        }}
      >
        {ranked.map((v) => (
          <VesselTile key={v.static.id} vessel={v} density={density} treatment={treatment} />
        ))}
      </div>

      <AlertRail fleet={fleet} />
      <FleetTrend fleet={fleet} />
      <FleetMap fleet={fleet} />
      <Field level="fleet" field="fleet_total_daily_spend" />
    </main>
  );
}
