'use client';
// Figma name: FleetView/FleetTrend (slash-namespaced sub-component).
// Whole-fleet efficiency trajectory over the year — the v2 analytical-first
// posture in one strip. Crude polyline; also context for the UNDEFINED
// fleet_total_daily_spend decision.

import type { VesselState } from '../data/types';
import { fleetDailyTrend } from '../data/fleetState';
import { Field } from './Field';
import { Sparkline } from './Sparkline';
import { gb, fmtPct } from './gb';

export function FleetTrend({ fleet }: { fleet: VesselState[] }) {
  const trend = fleetDailyTrend(fleet);
  const recent = trend.slice(-30).map((d) => d.delta);
  const recentMean = recent.reduce((a, b) => a + b, 0) / (recent.length || 1);

  return (
    <section style={{ ...gb.box, marginBottom: 8 }}>
      <div style={gb.label}>fleet trend — whole-fleet efficiency vs baselines, 1 y</div>
      <Field level="fleet" field="fleet_trend_1y">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Sparkline values={trend.map((d) => d.delta)} width={620} height={40} />
          <span style={gb.dim}>30d fleet mean {fmtPct(recentMean)}</span>
        </div>
      </Field>
    </section>
  );
}
