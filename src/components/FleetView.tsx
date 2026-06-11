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
import { FleetHealthBand } from './FleetHealthBand';
import { VesselTile } from './VesselTile';
import { FleetMap } from './FleetMap';
import { PortCallsTimeline } from './PortCallsTimeline';
import { gb } from './gb';
import { Annotated } from '../learn/Annotated'; // LEARN MODE — strip before demo week

export function FleetView({ fleet }: { fleet: VesselState[] }) {
  const { density, treatment, layoutVariant, censusFilter } = useFleet();

  // Scale safety (round 11): status class first, then |sustained_deviation| —
  // degraded vessels group at the top regardless of tile size.
  const statusRank = { degraded: 0, watch: 1, nominal: 2 } as const;
  const ranked = [...fleet].sort((a, b) => {
    const sa = statusRank[vesselStatus(a.alerts)];
    const sb = statusRank[vesselStatus(b.alerts)];
    if (sa !== sb) return sa - sb;
    return Math.abs(b.derived.sustained_deviation) - Math.abs(a.derived.sustained_deviation);
  });
  // Promotion cap: at most 2 auto-promoted 2x tiles (worst by |sd|); further
  // degraded vessels keep full status border + badge at 1x — severity never
  // hidden, size budget never blown.
  const promotedIds = new Set(
    ranked.filter((v) => vesselStatus(v.alerts) !== 'nominal').slice(0, 2).map((v) => v.static.id),
  );

  return (
    <main style={{ padding: 20, maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ ...gb.label, fontSize: 13, marginBottom: 12 }}>
        trend board — ranked by sustained deviation
      </div>
      {/* round 3.2: FleetTrend band owns the top of the page; board directly
          below; chart below the board (supersedes round 3's chart-on-top) */}
      <Annotated name="FleetHealthBand"><FleetHealthBand fleet={fleet} /></Annotated>
      <Annotated name="AlertRail"><AlertRail fleet={fleet} /></Annotated>

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
          const promoted = promotedIds.has(v.static.id);
          return (
            <div
              key={v.static.id}
              id={`tile-${v.static.id}`}
              style={{
                ...(promoted ? { gridColumn: 'span 2', gridRow: 'span 2' } : {}),
                // census filter (round 12): matching tiles stay full, rest dim
                opacity: censusFilter && vesselStatus(v.alerts) !== censusFilter ? 0.3 : 1,
              }}
            >
              <Annotated name="VesselCard">
                <VesselTile vessel={v} density={density} treatment={treatment} promoted={promoted} />
              </Annotated>
            </div>
          );
        })}
      </div>

      {/* chart below the board; the layout toggle now selects its depth only
          (a: large anchor, b: shallow band). spend slot moved into FleetTrend. */}
      <Annotated name="NauticalChart">
        <FleetMap fleet={fleet} treatment={treatment} width={1240} height={layoutVariant === 'board-first' ? 560 : 240} />
      </Annotated>
      {/* round 6 — final probe component: 72h arrivals board */}
      <Annotated name="PortCallsTimeline"><PortCallsTimeline fleet={fleet} treatment={treatment} /></Annotated>
    </main>
  );
}
