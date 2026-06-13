'use client';
// LAYOUT PROBE (branch: layout-probe — disposable, do not merge): FleetView
// as a responsive grid of vessel tiles. Still ranked by sustained_deviation
// (v2 trend board); center-aligned grid per the alignment probe. Compression
// row suspended: 15 tiles fit one glanceable screen, which is what the probe
// is testing.

import type { VesselState } from '../data/types';
import { vesselStatus } from '../data/alerts';
import { compareVessels } from '../data/fleetState';
import { useFleet } from '../state/FleetProvider';
import { useLearn } from '../learn/LearnProvider'; // EXPERT MODE — strip before demo week
import { Glyph } from './Glyph';
import { layer } from '../learn/layer'; // LEARN/EXPERT MODE — strip before demo week
import { FleetHealthBand } from './FleetHealthBand';
import { VesselTile } from './VesselTile';
import { FleetMap } from './FleetMap';
import { PortCallsTimeline } from './PortCallsTimeline';
import { gb } from './gb';
import { Annotated } from '../learn/Annotated'; // LEARN MODE — strip before demo week

export function FleetView({ fleet }: { fleet: VesselState[] }) {
  const { density, treatment, layoutVariant, censusFilter, tileSizes, setTileSize, chartTop, autoPromote } = useFleet();
  const { expertOn } = useLearn();

  // Round 21 A1: shared activity-aware comparator (board + rail)
  const ranked = [...fleet].sort(compareVessels);
  // Promotion cap: at most 2 auto-promoted 2x tiles (worst by |sd|); further
  // degraded vessels keep full status border + badge at 1x — severity never
  // hidden, size budget never blown.
  const promotedIds = new Set(
    ranked.filter((v) => vesselStatus(v.alerts) !== 'nominal').slice(0, 2).map((v) => v.static.id),
  );

  return (
    <main style={{ padding: 20, maxWidth: 1280, margin: '0 auto' }}>
      {expertOn ? (
        <div {...layer('FleetView / header / header.glyph', 'page header · chart.trend (sorted-bars motif) · glyph-only in expert mode', 'TREND BOARD — RANKED BY SUSTAINED DEVIATION')} style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <Glyph name="chart.trend" size={20} />
        </div>
      ) : (
        <div {...layer('FleetView / header / header.glyph', 'page header · chart.trend (sorted-bars motif) · glyph-only in expert mode', 'TREND BOARD — RANKED BY SUSTAINED DEVIATION')} style={{ ...gb.label, fontSize: 13, marginBottom: 12 }}>
          trend board — ranked by sustained deviation
        </div>
      )}
      {/* round 3.2: FleetTrend band owns the top of the page; board directly
          below; chart below the board (supersedes round 3's chart-on-top) */}
      {/* round 33: the standing ALERTS card is gone — the health band's
          count header summons the alert sheet on demand */}
      <Annotated name="FleetHealthBand"><FleetHealthBand fleet={fleet} /></Annotated>
      {/* round 21 A2 trial: chart above the board, behind the dev toggle so
          the 2s Meridian glance test can be re-run honestly */}
      {chartTop && (
        <Annotated name="NauticalChart">
          <FleetMap fleet={fleet} treatment={treatment} width={1240} height={layoutVariant === 'board-first' ? 480 : 240} />
        </Annotated>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
          gap: 20,
          justifyItems: 'stretch',
          gridAutoFlow: 'row dense', // round 17: mixed manual sizes reflow without orphan gaps (supersedes round 3 no-dense rule)
          marginBottom: 20,
          // default flow, NOT dense: rank order + tier promotion are the only
          // reflow permitted (round 3 brief)
        }}
      >
        {ranked.map((v) => {
          // round 17: manual size overrides auto in BOTH directions; the
          // cap applies only to automatic promotion
          // round 26: auto-promotion OFF by default — the board points, the
          // human zooms. Kept behind the dev flag in case the verdict flips.
          const auto = autoPromote && promotedIds.has(v.static.id) ? 'expanded' : density === 'minimal' ? 'mini' : 'standard';
          const size = tileSizes[v.static.id] ?? auto;
          return (
            <div
              key={v.static.id}
              id={`tile-${v.static.id}`}
              style={{
                ...(size === 'expanded' ? { gridColumn: 'span 2', gridRow: 'span 2' } : {}),
                // census filter (round 12): matching tiles stay full, rest dim
                opacity: censusFilter && vesselStatus(v.alerts) !== censusFilter ? 0.3 : 1,
              }}
            >
              <Annotated name="VesselCard">
                <VesselTile vessel={v} size={size} treatment={treatment} onSize={(next) => setTileSize(v.static.id, next)} />
              </Annotated>
            </div>
          );
        })}
      </div>

      {!chartTop && (
        <Annotated name="NauticalChart">
          <FleetMap fleet={fleet} treatment={treatment} width={1240} height={layoutVariant === 'board-first' ? 560 : 240} />
        </Annotated>
      )}
      {/* round 6 — final probe component: 72h arrivals board */}
      <Annotated name="PortCallsTimeline"><PortCallsTimeline fleet={fleet} /></Annotated>
    </main>
  );
}
