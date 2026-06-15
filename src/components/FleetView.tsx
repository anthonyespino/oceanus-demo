'use client';
// LAYOUT PROBE (branch: layout-probe — disposable, do not merge): FleetView
// as a responsive grid of vessel tiles. Ranked by the consequence comparator
// (round 71-72): alert → active → idle tiers, |trend_30d| worst-first within
// each (the displayed hero). Center-aligned grid per the alignment probe. Compression
// row suspended: 15 tiles fit one glanceable screen, which is what the probe
// is testing.

import { useState } from 'react';
import type { VesselState } from '../data/types';
import { vesselStatus } from '../data/alerts';
import { compareVessels } from '../data/fleetState';
import { useFleet } from '../state/FleetProvider';
import { useLearn } from '../learn/LearnProvider'; // round 105: sort thesis is Learn-layer docent
import { IA_SORT_THESIS } from '../ia/ia-model'; // round 105: single source for the Learn docent text
import { Glyph } from './Glyph';
import { layer } from '../learn/layer'; // LEARN/EXPERT MODE — strip before demo week
import { FleetHealthBand } from './FleetHealthBand';
import { StatusHeader } from './AlertSheet';
import { VesselTile } from './VesselTile';
import { FleetMap } from './FleetMap';
import { PortCallsTimeline } from './PortCallsTimeline';
import { gb } from './gb';
import { Annotated } from '../learn/Annotated'; // LEARN MODE — strip before demo week

export function FleetView({ fleet }: { fleet: VesselState[] }) {
  const { density, treatment, censusFilter, tileSizes, setTileSize, autoPromote } = useFleet();
  const { learnOn } = useLearn(); // round 105: sort thesis shows only in Learn mode
  // ROUND 68: chart-band maximize — a TRANSIENT resize, local to the view (not a
  // persisted layout mode). Default load is always the standard band size.
  const [chartMax, setChartMax] = useState(false);
  const [chartHot, setChartHot] = useState(false); // round 88: maximize button shows on hover only

  // Round 21 A1: shared activity-aware comparator (board + rail)
  const ranked = [...fleet].sort(compareVessels);
  // Promotion cap: at most 2 auto-promoted 2x tiles (worst by |sd|); further
  // degraded vessels keep full status border + badge at 1x — severity never
  // hidden, size budget never blown.
  const promotedIds = new Set(
    ranked.filter((v) => vesselStatus(v.alerts) !== 'nominal').slice(0, 2).map((v) => v.static.id),
  );

  return (
    // round 50: Calm Sea lives in the layout now (persistent across routes so
    // the scope change eases); board content sits above it (z-index:1)
    <main style={{ padding: 20, maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
      {/* ROUND 105: the sort thesis ("ranked by sustained deviation") is REMOVED
          from default — it was a permanent header block for a one-line explanation.
          It now lives in LEARN mode only, inline with the global status bar below
          the map (a docent layer, single source ia-model). Default top-fold is
          tighter; no orphan gap (the band now owns the top). */}
      {/* round 3.2: FleetTrend band owns the top of the page; board directly
          below; chart below the board (supersedes round 3's chart-on-top) */}
      {/* round 33: the standing ALERTS card is gone — the health band's
          count header summons the alert sheet on demand */}
      <Annotated name="FleetHealthBand" node="fleet-health-band"><FleetHealthBand fleet={fleet} /></Annotated>
      {/* ROUND 68: chart-band is the sole FleetView layout — the FleetMap is a
          shallow band on top, board directly below. board-first removed; the
          layout-mode toggle (and the chart-position toggle) are retired. A
          TRANSIENT maximize control (resize posture — acknowledge/note/pin/
          resize/watch) grows the band within the view; the tiles below stay
          visible and simply reflow down. One-elastic-element: ONLY the band
          flexes (240 → 520); tiles hold their size. Not persisted. */}
      <Annotated name="NauticalChart" node="fleet-plot">
        {/* round 88: maximize button shows on HOVER only (control affordance, not
            a data reveal — consistent with the hover ruling) */}
        <div style={{ position: 'relative' }} onMouseEnter={() => setChartHot(true)} onMouseLeave={() => setChartHot(false)}>
          <FleetMap fleet={fleet} treatment={treatment} width={1240} height={chartMax ? 520 : 240} />
          {chartHot && (
            <button
              {...layer('FleetView / chartBand / maximize.glyph', 'transient resize (hover-shown) — grows the chart band, tiles hold + reflow down (one-elastic-element) · not persisted', '{chartMax} toggle')}
              aria-label={chartMax ? 'restore chart band' : 'maximize chart band'}
              onClick={() => setChartMax((m) => !m)}
              style={{ position: 'absolute', top: 6, right: 6, zIndex: 2, background: 'var(--color-surface-overlay)', border: '1px solid var(--color-line-strong)', borderRadius: 1, padding: 3, cursor: 'pointer', color: 'var(--color-ink-secondary)', lineHeight: 0 }}
            >
              <Glyph name={chartMax ? 'collapse' : 'expand'} size={14} />
            </button>
          )}
        </div>
      </Annotated>

      {/* ROUND 88: global STATUS CLUSTER relocated here — centered, below the
          fleet-plot map and directly above the thumbcards, bolder (prominent →
          PRIMARY tier). DATALINK/SYNC + CAUTION·ADVISORY; the round-79 breath
          binding rides along (still breathes only when LIVE, static in the
          DEGRADED demo seed). CAUTION·ADVISORY stay clickable DetailChips. */}
      {/* ROUND 105: status bar centered below the map; the sort-thesis DOCENT
          appears INLINE here ONLY in Learn mode (single source ia-model). */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 16, flexWrap: 'wrap', margin: '14px 0 18px' }}>
        <Annotated name="SystemStatusStrip" node="status-cluster" inline><StatusHeader prominent /></Annotated>
        {learnOn && (
          <span {...layer('FleetView / status / sort.docent', 'Learn-only docent · CONTEXT dimmed (gb.label) · the consequence-sort thesis, inline with the status bar (round 105, from ia-model)', '{IA_SORT_THESIS}')} style={{ ...gb.label, fontSize: 'var(--type-context)', marginBottom: 0 }}>
            {IA_SORT_THESIS}
          </span>
        )}
      </div>

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
              <Annotated name="VesselCard" node="vessel-tile">
                <VesselTile vessel={v} size={size} treatment={treatment} onSize={(next) => setTileSize(v.static.id, next)} />
              </Annotated>
            </div>
          );
        })}
      </div>

      {/* round 6 — final probe component: 72h arrivals board */}
      <Annotated name="PortCallsTimeline"><PortCallsTimeline fleet={fleet} /></Annotated>
    </main>
  );
}
