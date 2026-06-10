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
import { NEUTRAL, RADIUS } from './probeTokens';

export function FleetView({ fleet }: { fleet: VesselState[] }) {
  const {
    density, setDensity, treatment, setTreatment,
    motion, setMotion, layoutVariant, setLayoutVariant,
  } = useFleet();

  const ranked = [...fleet].sort(
    (a, b) => Math.abs(b.derived.sustained_deviation) - Math.abs(a.derived.sustained_deviation),
  );

  const toggle = (active: boolean): React.CSSProperties => ({
    border: `1px solid ${NEUTRAL.border}`,
    borderRadius: RADIUS,
    background: active ? NEUTRAL.surfaceDim : NEUTRAL.surface,
    color: NEUTRAL.ink,
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
          <span style={{ width: 12 }} />
          <button style={toggle(motion === 'off')} onClick={() => setMotion('off')}>
            motion off
          </button>
          <button style={toggle(motion === 'ripple')} onClick={() => setMotion('ripple')}>
            ripple
          </button>
          <button style={toggle(motion === 'breathe')} onClick={() => setMotion('breathe')}>
            breathe
          </button>
          <span style={{ width: 12 }} />
          <button style={toggle(layoutVariant === 'board-first')} onClick={() => setLayoutVariant('board-first')}>
            a · board first
          </button>
          <button style={toggle(layoutVariant === 'chart-band')} onClick={() => setLayoutVariant('chart-band')}>
            b · chart band
          </button>
        </span>
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
