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
import type { VesselState, Alert } from '../data/types';
import { alertTarget, type AlertTarget } from '../data/alerts';
import { type ColorTreatment } from '../state/FleetProvider';
import { vesselEvents, EVENT_WINDOW_24H } from '../data/events';
import { PORTS, distanceNm } from '../data/fleet';
import { Collapse } from './Collapse';
import { EfficiencyPanel } from './EfficiencyPanel';
import { EngineTwinPanel } from './EngineTwinPanel';
import { InspectorChart } from './InspectorChart';
import { VesselSynoptic } from './VesselSynoptic';
import { VesselCommandBand } from './VesselCommandBand';
import { CrewLogPanel } from './CrewLogPanel';
import { layer } from '../learn/layer'; // LEARN/EXPERT MODE — strip before demo week
import { useLearn } from '../learn/LearnProvider'; // round 107: Expert essentializes alert phrasing
import { ALERT_TEXT_COLOR, NEUTRAL } from './probeTokens';
import { gb, fmtPct, essentialAlert } from './gb';
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
  const { expertOn } = useLearn(); // round 107: Expert essentializes alert phrasing
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

  // ROUND 100: route each alert to the panel that substantiates it (its
  // evidence), or to the compact GENERAL area when nothing does. Routing is by
  // code (data layer), so it generalizes across scenarios; the standalone
  // full-width ALERTS box is gone — routed alerts dock to their panels.
  const routed: Record<AlertTarget, Alert[]> = { 'engine-twins': [], efficiency: [], fuel: [], crew: [], general: [] };
  for (const a of vessel.alerts) routed[alertTarget(a)].push(a);

  return (
    <div style={{ flex: 1, minWidth: 0, position: 'relative', '--pad-card': 'var(--pad-card-dense)' } as React.CSSProperties}>
      <div style={{ position: 'relative' }}>
        <VesselCommandBand vessel={vessel} />
        <Collapse k={`${id}:position`} glyph="route" title="position"
          summary={`${distanceNm(now.position, nearest).toFixed(0)} nm from ${nearest.name}`}>
          <Annotated name="NauticalChart"><InspectorChart vessel={vessel} fleet={fleet} treatment={treatment} height={canvasH} /></Annotated>
        </Collapse>
        {/* ROUND 100: GENERAL alerts only — the compact fallback for alerts with
            no evidence panel (datalink/staleness, etc.). Routed alerts dock to
            their panels below; this renders ONLY when there are general alerts
            (no empty box otherwise). */}
        {routed.general.length > 0 && (
          <section data-panel="general" style={{ ...gb.box, padding: '6px var(--pad-card)', marginBottom: 'var(--pad-stack)', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span {...layer('VesselInspector / generalAlerts / header.text', 'compact GENERAL alerts area · only unroutable alerts (no evidence panel)', 'GENERAL')} style={{ ...gb.label, fontSize: 'var(--type-micro)', marginBottom: 2 }}>general</span>
            {routed.general.map((a, i) => (
              <div key={i} style={{ color: NEUTRAL.inkSecondary, fontSize: 'var(--type-context)', lineHeight: 1.4 }}>
                <span style={{ color: ALERT_TEXT_COLOR[a.level] }}>[{a.level}]</span> {expertOn ? essentialAlert(a.message) : a.message}
              </div>
            ))}
          </section>
        )}
        <Collapse k={`${id}:twins`} glyph="engine" title="engine twins"
          alerts={routed['engine-twins']}
          summary={`gap ${d.egt_twin_gap_f}°F · fuel Δ ${fmtPct(fuelGapPct)}`}>
          <Annotated name="EngineTwinPanel" node="engine-twin"><EngineTwinPanel vessel={vessel} /></Annotated>
        </Collapse>
        {/* round 34: ONE efficiency card (burn-vs-speed merged in) */}
        <Collapse k={`${id}:efficiency`} glyph="chart" title="efficiency"
          alerts={routed.efficiency}
          summary={`now ${fmtPct(d.efficiency_delta_pct)}`}>
          <Annotated name="EfficiencyPanel"><EfficiencyPanel vessel={vessel} /></Annotated>
        </Collapse>
        <Collapse k={`${id}:fuel`} glyph="tank" title="fuel"
          alerts={routed.fuel}
          summary={`RECON ${d.reconciliation.status} · ${totalGal.toLocaleString()} gal`}>
          <Annotated name="VesselSynoptic" node="fuel-synoptic"><VesselSynoptic vessel={vessel} /></Annotated>
        </Collapse>
        <Collapse k={`${id}:crewlog`} glyph="crew" title="crew & log"
          alerts={routed.crew}
          summary={`${vessel.history.crew.length} aboard · ${crewDays}d · ${lastEvent ? lastEvent.type : 'no events 24h'}`}>
          <CrewLogPanel vessel={vessel} />
        </Collapse>
      </div>
    </div>
  );
}
