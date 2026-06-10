'use client';
// One vessel row on the fleet view. Fleet-level dispositions decide every
// field: VISIBLE renders flat, CONTEXTUAL goes behind one grouped reveal.

import Link from 'next/link';
import type { VesselState } from '../data/types';
import { worstLevel } from '../data/alerts';
import { Field } from './Field';
import { Sparkline } from './Sparkline';
import { gb, fmtDay, fmtPct } from './gb';

export function VesselCard({ vessel }: { vessel: VesselState }) {
  const d = vessel.derived;
  const badge = worstLevel(vessel.alerts);
  const master = vessel.history.crew.find((c) => c.role === 'Master');
  const crewDays = master ? Math.floor((vessel.history.minutes.at(-1)!.t - master.onboard_since) / 86_400_000) : null;
  const nextCall = vessel.history.nextPortCalls[0];
  const wx = vessel.history.minutes.at(-1)!.weather;

  return (
    <div style={{ ...gb.box, display: 'flex', gap: 12, alignItems: 'center', marginBottom: 4 }}>
      <Field level="fleet" field="vessel_name">
        <Link href={`/vessel/${vessel.static.id}`} style={{ textDecoration: 'underline', minWidth: 110, display: 'inline-block' }}>
          {vessel.static.name}
        </Link>
      </Field>
      <Field level="fleet" field="mode">
        <span style={gb.boxTight}>{d.mode}</span>
      </Field>
      <Field level="fleet" field="efficiency_delta">
        <span style={{ fontWeight: 700, minWidth: 56, display: 'inline-block' }}>{fmtPct(d.efficiency_delta_pct)}</span>
      </Field>
      <Field level="fleet" field="alert_badges">
        <span style={{ minWidth: 80, display: 'inline-block' }}>{badge ? `[${badge}]` : ''}</span>
      </Field>
      <Field level="fleet" field="endurance_hours">
        <span style={gb.dim}>endurance {d.endurance_hours} h</span>
      </Field>
      <Field level="fleet" field="efficiency_sparkline_24h">
        <Sparkline values={d.sparkline_24h} />
      </Field>
      {/* Grouped reveal: one Contextual per card, not four hover targets. */}
      <Field level="fleet" field="burn_rate_gph" label="details">
        <span>
          burn {d.burn_rate_gph} gph
          {' · '}next port: {nextCall ? `${nextCall.port} ETA ${fmtDay(nextCall.eta)}` : '—'}
          {' · '}crew: {master?.name ?? '—'}, {crewDays ?? '—'}d since change
          {' · '}wx: wind {wx.wind_speed_kn} kn, waves {wx.wave_height_ft} ft
        </span>
      </Field>
    </div>
  );
}
