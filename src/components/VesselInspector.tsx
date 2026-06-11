'use client';
// ROUND 21: stack = chart → header → alerts → instrument band → engine twins
// → efficiency (trend + burn-vs-speed) → fuel → voyage → crew → event log.
// Every panel collapses to header + one summary stat (state persists per
// vessel for the session). Alerts card stays uncollapsible — severity never
// folds. Voyage merges Environment + Route + ModeTimeline (the three cards
// died); their docent annotations are unanchored pending Anthony's copy.

import { useEffect, useState } from 'react';
import type { VesselState } from '../data/types';
import { useFleet, type ColorTreatment } from '../state/FleetProvider';
import { envelopeDeltaPct } from '../data/curve';
import { vesselEvents, EVENT_WINDOW_24H } from '../data/events';
import { PORTS, distanceNm } from '../data/fleet';
import { Collapse } from './Collapse';
import { EfficiencyCurve } from './EfficiencyCurve';
import { EfficiencyPanel } from './EfficiencyPanel';
import { EngineTwinPanel } from './EngineTwinPanel';
import { EventLog } from './EventLog';
import { InspectorChart } from './InspectorChart';
import { TankSchematic } from './TankSchematic';
import { VesselSynoptic } from './VesselSynoptic';
import { VesselHeader } from './VesselHeader';
import { VoyagePanel } from './VoyagePanel';
import { CrewPanel } from './CrewPanel';
import { TelemetryBand } from './TelemetryBand';
import { Label } from './Glyph';
import { ALERT_TEXT_COLOR, NEUTRAL } from './probeTokens';
import { gb, fmtPct, fmtTime } from './gb';
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
  const { tankStyle, stickyBand } = useFleet();
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
  const next = vessel.history.nextPortCalls[0];
  const crewDays = Math.floor((now.t - vessel.history.crew[0].onboard_since) / 86_400_000);
  const lastEvent = vesselEvents(vessel, now.t - EVENT_WINDOW_24H)[0];
  const envDelta = envelopeDeltaPct(vessel.history);

  return (
    <div style={{ flex: 1, minWidth: 0, position: 'relative', '--pad-card': 'var(--pad-card-dense)' } as React.CSSProperties}>
      <div style={{ position: 'relative' }}>
        <Collapse k={`${id}:position`} glyph="route" title="position"
          summary={`${distanceNm(now.position, nearest).toFixed(0)} nm from ${nearest.name}`}>
          <Annotated name="NauticalChart"><InspectorChart vessel={vessel} fleet={fleet} treatment={treatment} height={canvasH} /></Annotated>
        </Collapse>
        <Annotated name="VesselHeader"><VesselHeader vessel={vessel} /></Annotated>
        {vessel.alerts.length > 0 && (
          <section style={{ ...gb.box, marginBottom: 8 }}>
            <Label g="alert-triangle">alerts</Label>
            {vessel.alerts.map((a, i) => (
              <div key={i} style={{ color: ALERT_TEXT_COLOR[a.level] ?? NEUTRAL.inkSecondary }}>
                [{a.level}] {a.message}
              </div>
            ))}
          </section>
        )}
        <div style={stickyBand ? { position: 'sticky', top: 8, zIndex: 5 } : undefined}>
          <Collapse k={`${id}:telemetry`} glyph="gauge" title="telemetry"
            summary={`${now.position.speed_over_ground_kn.toFixed(1)} kn · ${Math.round(d.burn_rate_gph)} gph`}>
            <TelemetryBand vessel={vessel} />
          </Collapse>
        </div>
        <Collapse k={`${id}:twins`} glyph="engine" title="engine twins"
          summary={`gap ${d.egt_twin_gap_f}°F · fuel Δ ${fmtPct(fuelGapPct)}`}>
          <Annotated name="EngineTwinPanel"><EngineTwinPanel vessel={vessel} /></Annotated>
        </Collapse>
        <div className="cardrow">
          <div style={{ flex: '1 1 480px', minWidth: 0 }}>
            <Collapse k={`${id}:curve`} glyph="chart" title="burn vs speed"
              summary={envDelta === null ? 'not in transit' : `${fmtPct(envDelta)} vs envelope`}>
              <Annotated name="EfficiencyCurve"><EfficiencyCurve vessel={vessel} /></Annotated>
            </Collapse>
          </div>
          <div style={{ flex: '1 1 380px', minWidth: 0 }}>
            <Collapse k={`${id}:efficiency`} glyph="chart" title="efficiency"
              summary={`now ${fmtPct(d.efficiency_delta_pct)}`}>
              <Annotated name="EfficiencyPanel"><EfficiencyPanel vessel={vessel} /></Annotated>
            </Collapse>
          </div>
        </div>
        <Collapse k={`${id}:fuel`} glyph="tank" title="fuel"
          summary={`RECON ${d.reconciliation.status} · ${totalGal.toLocaleString()} gal`}>
          {tankStyle === 'synoptic' ? (
            <Annotated name="VesselSynoptic"><VesselSynoptic vessel={vessel} /></Annotated>
          ) : (
            <Annotated name="TankSchematic"><TankSchematic vessel={vessel} /></Annotated>
          )}
        </Collapse>
        <Collapse k={`${id}:voyage`} glyph="route" title="voyage"
          summary={`${next ? `ETA ${fmtTime(next.eta)}` : vessel.derived.mode} · wind ${now.weather.wind_speed_kn} kn`}>
          <VoyagePanel vessel={vessel} />
        </Collapse>
        <Collapse k={`${id}:crew`} glyph="crew" title="crew"
          summary={`${vessel.history.crew.length} aboard · ${crewDays}d`}>
          <Annotated name="CrewPanel"><CrewPanel vessel={vessel} /></Annotated>
        </Collapse>
        <Collapse k={`${id}:log`} glyph="clock" title="event log"
          summary={lastEvent ? `${lastEvent.type} — ${lastEvent.text}` : 'no events 24h'}>
          <Annotated name="EventLog"><EventLog vessel={vessel} /></Annotated>
        </Collapse>
      </div>
    </div>
  );
}
