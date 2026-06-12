'use client';
// ROUND 30: stack = command band (sticky, now holds the voyage row) → chart
// → alerts → engine twins → efficiency (trend + burn-vs-speed) → fuel
// (synoptic + dot quartet) → crew & log. The voyage card dissolved into the
// band; crew and the event log merged into one card.
// Every panel collapses to header + one summary stat (state persists per
// vessel for the session). Alerts card stays uncollapsible — severity never
// folds. Voyage merges Environment + Route + ModeTimeline (the three cards
// died); their docent annotations are unanchored pending Anthony's copy.

import { useEffect, useState } from 'react';
import type { VesselState } from '../data/types';
import { type ColorTreatment } from '../state/FleetProvider';
import { envelopeDeltaPct } from '../data/curve';
import { vesselEvents, EVENT_WINDOW_24H } from '../data/events';
import { PORTS, distanceNm } from '../data/fleet';
import { Collapse } from './Collapse';
import { EfficiencyPanel } from './EfficiencyPanel';
import { EngineTwinPanel } from './EngineTwinPanel';
import { InspectorChart } from './InspectorChart';
import { VesselSynoptic } from './VesselSynoptic';
import { VesselCommandBand } from './VesselCommandBand';
import { CrewLogPanel } from './CrewLogPanel';
import { Label } from './Glyph';
import { ALERT_TEXT_COLOR, NEUTRAL } from './probeTokens';
import { gb, fmtPct } from './gb';
import { Annotated } from '../learn/Annotated'; // LEARN MODE — strip before demo week

export function VesselInspector({
  vessel,
  fleet,
  treatment,
}: {
  vessel: VesselState;
  fleet: VesselState[];
  treatment: ColorTreatment;
}) {
  const [canvasH, setCanvasH] = useState(300);
  useEffect(() => {
    const fit = () => setCanvasH(Math.min(360, Math.round(window.innerHeight * 0.3)));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  const id = vessel.static.id;
  const d = vessel.derived;
  const now = vessel.history.minutes.at(-1)!;
  const [m1, m2] = now.engines.filter((e) => e.role === 'MAIN');
  const fuelGapPct = m1.fuel_rate_gph > 0 ? (m2.fuel_rate_gph / m1.fuel_rate_gph - 1) * 100 : 0;
  const totalGal = now.tanks.reduce((a, t) => a + t.level_gal, 0);
  const nearest = PORTS.reduce((a, b) => (distanceNm(now.position, a) < distanceNm(now.position, b) ? a : b));
  const crewDays = Math.floor((now.t - vessel.history.crew[0].onboard_since) / 86_400_000);
  const lastEvent = vesselEvents(vessel, now.t - EVENT_WINDOW_24H)[0];
  const envDelta = envelopeDeltaPct(vessel.history);

  return (
    <div style={{ flex: 1, minWidth: 0, position: 'relative', '--pad-card': 'var(--pad-card-dense)' } as React.CSSProperties}>
      <div style={{ position: 'relative' }}>
        <VesselCommandBand vessel={vessel} />
        <Collapse k={`${id}:position`} glyph="route" title="position"
          summary={`${distanceNm(now.position, nearest).toFixed(0)} nm from ${nearest.name}`}>
          <Annotated name="NauticalChart"><InspectorChart vessel={vessel} fleet={fleet} treatment={treatment} height={canvasH} /></Annotated>
        </Collapse>
        {vessel.alerts.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <Label g="alert-triangle" style={{ marginBottom: 4 }}>alerts</Label>
            <section style={gb.box}>
              {/* round 33 grammar: one severity voice per line — the tag */}
              {vessel.alerts.map((a, i) => (
                <div key={i} style={{ color: NEUTRAL.inkSecondary }}>
                  <span style={{ color: ALERT_TEXT_COLOR[a.level] }}>[{a.level}]</span> {a.message}
                </div>
              ))}
            </section>
          </div>
        )}
        <Collapse k={`${id}:twins`} glyph="engine" title="engine twins"
          summary={`gap ${d.egt_twin_gap_f}°F · fuel Δ ${fmtPct(fuelGapPct)}`}>
          <Annotated name="EngineTwinPanel"><EngineTwinPanel vessel={vessel} /></Annotated>
        </Collapse>
        {/* round 34: ONE efficiency card (burn-vs-speed merged in) */}
        <Collapse k={`${id}:efficiency`} glyph="chart" title="efficiency"
          summary={`now ${fmtPct(d.efficiency_delta_pct)}${envDelta === null ? '' : ` · ${fmtPct(envDelta)} vs envelope`}`}>
          <Annotated name="EfficiencyPanel"><EfficiencyPanel vessel={vessel} /></Annotated>
        </Collapse>
        <Collapse k={`${id}:fuel`} glyph="tank" title="fuel"
          summary={`RECON ${d.reconciliation.status} · ${totalGal.toLocaleString()} gal`}>
          <Annotated name="VesselSynoptic"><VesselSynoptic vessel={vessel} /></Annotated>
        </Collapse>
        <Collapse k={`${id}:crewlog`} glyph="crew" title="crew & log"
          summary={`${vessel.history.crew.length} aboard · ${crewDays}d · ${lastEvent ? lastEvent.type : 'no events 24h'}`}>
          <CrewLogPanel vessel={vessel} />
        </Collapse>
      </div>
    </div>
  );
}
