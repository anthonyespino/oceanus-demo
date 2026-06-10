'use client';
// LAYOUT PROBE round 2: single-surface expand model. The inspector is the
// existing VesselView sections reflowed into the main area next to the fleet
// rail — render mode changes, not state architecture. No new data work, no
// animation: instant expand/collapse (choreography is a Figma-stage call).

import type { VesselState } from '../data/types';
import type { ColorTreatment } from '../state/FleetProvider';
import { InspectorChart } from './InspectorChart';
import { VesselHeader } from './VesselHeader';
import { EfficiencyPanel } from './EfficiencyPanel';
import { EngineTwinPanel } from './EngineTwinPanel';
import { TankSchematic } from './TankSchematic';
import { FlowReconciliation } from './FlowReconciliation';
import { WeatherPanel } from './WeatherPanel';
import { CrewPanel } from './CrewPanel';
import { RoutePanel } from './RoutePanel';
import { ModeTimeline } from './ModeTimeline';
import { gb } from './gb';

export function VesselInspector({
  vessel,
  fleet,
  treatment,
}: {
  vessel: VesselState;
  fleet: VesselState[];
  treatment: ColorTreatment;
}) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
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
      <ModeTimeline vessel={vessel} />
      {/* causal-chain order preserved, reflowed to two columns to fit the
          single surface: diagnosis chain left, supporting context right */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 460px', minWidth: 0 }}>
          <EfficiencyPanel vessel={vessel} />
          <EngineTwinPanel vessel={vessel} />
          <TankSchematic vessel={vessel} />
        </div>
        <div style={{ flex: '1 1 340px', minWidth: 0 }}>
          <InspectorChart vessel={vessel} fleet={fleet} treatment={treatment} />
          <FlowReconciliation vessel={vessel} />
          <WeatherPanel vessel={vessel} />
          <CrewPanel vessel={vessel} />
          <RoutePanel vessel={vessel} />
        </div>
      </div>
    </div>
  );
}
