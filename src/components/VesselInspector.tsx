'use client';
// ROUND 16: ambient-canvas experiment RETIRED — containment won. The chart
// is a normal framed card at the top of the stack (height-capped, fit-to-
// content framing), nothing on this page overlaps anything. Stack order:
// chart → header/sitrep slot → alerts → instrument band → efficiency →
// machine → fuel → environment/route/crew → timeline/log.

import { useEffect, useState } from 'react';
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
import { VesselInstrumentBand } from './VesselInstrumentBand';
import { Label } from './Glyph';
import { gb } from './gb';
import { Annotated } from '../learn/Annotated'; // LEARN MODE — strip before demo week

// Round 15 cap retained: the chart card tops out at ~30% viewport / 360px.

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
  const [canvasH, setCanvasH] = useState(300);
  useEffect(() => {
    const fit = () => setCanvasH(Math.min(360, Math.round(window.innerHeight * 0.3)));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  return (
    <div style={{ flex: 1, minWidth: 0, position: 'relative', '--pad-card': 'var(--pad-card-dense)' } as React.CSSProperties}>
      {/* round 15: inspector cards drop one padding step via scoped token
          override — every gb.box inside resolves pad/card to pad/card-dense */}
      <div style={{ position: 'relative' }}>
        {/* contained chart card — height-capped, zero bleed */}
        <Annotated name="NauticalChart"><InspectorChart vessel={vessel} fleet={fleet} treatment={treatment} height={canvasH} /></Annotated>
        {/* VesselSitrep slot: component lands here once designed; the dashed
            placeholder was scaffolding and no longer renders (round 9) */}
        <Annotated name="VesselHeader"><VesselHeader vessel={vessel} /></Annotated>
        {vessel.alerts.length > 0 && (
          <section style={{ ...gb.box, marginBottom: 8 }}>
            <Label g="alert-triangle">alerts</Label>
            {vessel.alerts.map((a, i) => (
              <div key={i}>
                [{a.level}] {a.message}
              </div>
            ))}
          </section>
        )}
        {/* round 16: the marine-console moment, promoted */}
        <VesselInstrumentBand vessel={vessel} />
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
