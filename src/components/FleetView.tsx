'use client';
// LAYOUT PROBE (branch: layout-probe — disposable, do not merge): FleetView
// as a responsive grid of vessel tiles. Still ranked by sustained_deviation
// (v2 trend board); center-aligned grid per the alignment probe. Compression
// row suspended: 15 tiles fit one glanceable screen, which is what the probe
// is testing.

import type { VesselState } from '../data/types';
import { vesselStatus } from '../data/alerts';
import { useFleet } from '../state/FleetProvider';
import { AlertRail } from './AlertRail';
import { FleetTrend } from './FleetTrend';
import { VesselTile } from './VesselTile';
import { FleetMap } from './FleetMap';
import { gb } from './gb';

export function FleetView({ fleet }: { fleet: VesselState[] }) {
  const { density, treatment, layoutVariant } = useFleet();

  const ranked = [...fleet].sort(
    (a, b) => Math.abs(b.derived.sustained_deviation) - Math.abs(a.derived.sustained_deviation),
  );

  return (
    <main style={{ padding: 20, maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ ...gb.label, fontSize: 13, marginBottom: 12 }}>
        trend board — ranked by sustained deviation
      </div>
      {/* round 3.2: FleetTrend band owns the top of the page; board directly
          below; chart below the board (supersedes round 3's chart-on-top) */}
      <FleetTrend fleet={fleet} />
      <AlertRail fleet={fleet} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
          gap: 20,
          justifyItems: 'stretch',
          marginBottom: 20,
          // default flow, NOT dense: rank order + tier promotion are the only
          // reflow permitted (round 3 brief)
        }}
      >
        {ranked.map((v) => {
          const promoted = vesselStatus(v.alerts) !== 'nominal'; // same constants as color/badges
          return (
            <div key={v.static.id} style={promoted ? { gridColumn: 'span 2', gridRow: 'span 2' } : undefined}>
              <VesselTile vessel={v} density={density} treatment={treatment} />
            </div>
          );
        })}
      </div>

      {/* chart below the board; the layout toggle now selects its depth only
          (a: large anchor, b: shallow band). spend slot moved into FleetTrend. */}
      <FleetMap fleet={fleet} treatment={treatment} width={1240} height={layoutVariant === 'board-first' ? 560 : 240} />
    </main>
  );
}
