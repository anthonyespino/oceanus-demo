'use client';
// Level 2 — vessel view (§8), sections in causal-chain order so the engineer
// walks the diagnosis: efficiency (what's off) → machine → fuel system →
// environment → human factors → operations → mode context.

import type { VesselState } from '../data/types';
import { VesselCommandBand } from './VesselCommandBand';
import { EfficiencyPanel } from './EfficiencyPanel';
import { EngineTwinPanel } from './EngineTwinPanel';
import { TankSchematic } from './TankSchematic';
import { FlowReconciliation } from './FlowReconciliation';
import { WeatherPanel } from './WeatherPanel';
import { CrewPanel } from './CrewPanel';
import { RoutePanel } from './RoutePanel';
import { ModeTimeline } from './ModeTimeline';
import { gb } from './gb';

export function VesselView({ vessel }: { vessel: VesselState }) {
  return (
    <main style={{ padding: 12, maxWidth: 1100 }}>
      <VesselCommandBand vessel={vessel} />
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
      <EfficiencyPanel vessel={vessel} />
      <EngineTwinPanel vessel={vessel} />
      <TankSchematic vessel={vessel} />
      <FlowReconciliation vessel={vessel} />
      <WeatherPanel vessel={vessel} />
      <CrewPanel vessel={vessel} />
      <RoutePanel vessel={vessel} />
    </main>
  );
}
