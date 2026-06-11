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
import { WeatherPanel } from './WeatherPanel';
import { CrewPanel } from './CrewPanel';
import { RoutePanel } from './RoutePanel';
import { VesselHeader } from './VesselHeader';
import { gb } from './gb';
import { Annotated } from '../learn/Annotated'; // LEARN MODE — strip before demo week

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
        {/* VesselSitrep slot: component lands here once designed; the dashed
            placeholder was scaffolding and no longer renders (round 9) */}
        <Annotated name="VesselHeader"><VesselHeader vessel={vessel} /></Annotated>
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
        <div className="cardrow">
          <div style={{ flex: '1 1 480px', minWidth: 0 }}>
            <Annotated name="EfficiencyCurve"><EfficiencyCurve vessel={vessel} /></Annotated>
          </div>
          <div style={{ flex: '1 1 380px', minWidth: 0 }}>
            <Annotated name="EfficiencyPanel"><EfficiencyPanel vessel={vessel} /></Annotated>
          </div>
        </div>
        <Annotated name="EngineTwinPanel"><EngineTwinPanel vessel={vessel} /></Annotated>
        {/* one fuel truth, one card (round 11): reconciliation rides the
            fuel-card header chip; the synoptic's in-diagram RECON badge is
            the only in-diagram instance */}
        {tankStyle === 'synoptic' ? (
          <Annotated name="VesselSynoptic"><VesselSynoptic vessel={vessel} /></Annotated>
        ) : (
          <Annotated name="TankSchematic"><TankSchematic vessel={vessel} /></Annotated>
        )}
        <div className="cardrow">
          <div style={{ flex: '1 1 280px', minWidth: 0 }}>
            <Annotated name="WeatherPanel"><WeatherPanel vessel={vessel} /></Annotated>
          </div>
          <div style={{ flex: '1 1 320px', minWidth: 0 }}>
            <Annotated name="RoutePanel"><RoutePanel vessel={vessel} /></Annotated>
          </div>
          <div style={{ flex: '1 1 280px', minWidth: 0 }}>
            <Annotated name="CrewPanel"><CrewPanel vessel={vessel} /></Annotated>
          </div>
        </div>
        <div className="cardrow">
          <div style={{ flex: '1 1 380px', minWidth: 0 }}>
            <Annotated name="ModeTimeline"><ModeTimeline vessel={vessel} /></Annotated>
          </div>
          <div style={{ flex: '2 1 520px', minWidth: 0 }}>
            <Annotated name="EventLog"><EventLog vessel={vessel} /></Annotated>
          </div>
        </div>
      </div>
    </div>
  );
}
