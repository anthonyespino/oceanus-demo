'use client';
// ROUND 7: the inspector is "the room you step into" — the ONE place the
// single-vessel cinematic composition is sanctioned. The zoomed chart is the
// ambient canvas (focus vessel + trail hero'd, ghosts faint); panels float
// over its lower half as fully opaque framed cards, with a scrim token
// dimming the chart beneath the card zone. No glassmorphism. Same sections,
// same URL state — render mode only.

import type { VesselState } from '../data/types';
import { useFleet, type ColorTreatment } from '../state/FleetProvider';
import { EfficiencyCurve } from './EfficiencyCurve';
import { EfficiencyPanel } from './EfficiencyPanel';
import { EngineTwinPanel } from './EngineTwinPanel';
import { EventLog } from './EventLog';
import { InspectorChart } from './InspectorChart';
import { ModeTimeline } from './ModeTimeline';
import { TankSchematic } from './TankSchematic';
import { VesselSynoptic } from './VesselSynoptic';
import { FlowReconciliation } from './FlowReconciliation';
import { WeatherPanel } from './WeatherPanel';
import { CrewPanel } from './CrewPanel';
import { RoutePanel } from './RoutePanel';
import { VesselHeader } from './VesselHeader';
import { VesselSitrep } from './VesselSitrep';
import { gb } from './gb';

const CANVAS_H = 480; // ambient chart height
const CLEAR_H = 170; // chart zone left fully clear above the floating cards

export function VesselInspector({
  vessel,
  fleet,
  treatment,
}: {
  vessel: VesselState;
  fleet: VesselState[];
  treatment: ColorTreatment;
}) {
  const { tankStyle } = useFleet();
  const row: React.CSSProperties = { display: 'flex', gap: 8, alignItems: 'stretch', flexWrap: 'wrap' };
  return (
    <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
      {/* ambient canvas: the spatial backdrop of the room */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: CANVAS_H, borderRadius: 6, overflow: 'hidden' }}>
        <InspectorChart vessel={vessel} fleet={fleet} treatment={treatment} height={CANVAS_H} ambient />
        {/* scrim: dims the chart beneath the card zone (legibility guardrail) */}
        <div
          style={{
            position: 'absolute',
            left: 0, right: 0, bottom: 0,
            top: CLEAR_H - 60,
            background: `linear-gradient(to bottom, transparent, var(--color-scrim) 30%, var(--color-scrim))`,
            pointerEvents: 'none',
          }}
        />
      </div>
      {/* floating card grid — fully opaque cards, deliberate row order */}
      <div style={{ position: 'relative', paddingTop: CLEAR_H }}>
        <VesselSitrep />
        <VesselHeader vessel={vessel} />
        {vessel.alerts.length > 0 && (
          <section style={{ ...gb.box, marginBottom: 8 }}>
            <div style={gb.label}>active alerts — this vessel</div>
            {vessel.alerts.map((a, i) => (
              <div key={i}>
                [{a.level}] {a.message}
              </div>
            ))}
          </section>
        )}
        <div style={row}>
          <div style={{ flex: '1 1 480px', minWidth: 0 }}>
            <EfficiencyCurve vessel={vessel} />
          </div>
          <div style={{ flex: '1 1 380px', minWidth: 0 }}>
            <EfficiencyPanel vessel={vessel} />
          </div>
        </div>
        <EngineTwinPanel vessel={vessel} />
        <div style={row}>
          <div style={{ flex: '2 1 520px', minWidth: 0 }}>
            {/* ⚖️ verdict 11: synoptic vs boxes — dev panel "fuel view" */}
            {tankStyle === 'synoptic' ? <VesselSynoptic vessel={vessel} /> : <TankSchematic vessel={vessel} />}
          </div>
          <div style={{ flex: '1 1 280px', minWidth: 0 }}>
            <FlowReconciliation vessel={vessel} />
          </div>
        </div>
        <div style={row}>
          <div style={{ flex: '1 1 280px', minWidth: 0 }}>
            <WeatherPanel vessel={vessel} />
          </div>
          <div style={{ flex: '1 1 320px', minWidth: 0 }}>
            <RoutePanel vessel={vessel} />
          </div>
          <div style={{ flex: '1 1 280px', minWidth: 0 }}>
            <CrewPanel vessel={vessel} />
          </div>
        </div>
        <div style={row}>
          <div style={{ flex: '1 1 380px', minWidth: 0 }}>
            <ModeTimeline vessel={vessel} />
          </div>
          <div style={{ flex: '2 1 520px', minWidth: 0 }}>
            <EventLog vessel={vessel} />
          </div>
        </div>
      </div>
    </div>
  );
}
