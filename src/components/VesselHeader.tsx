'use client';
// Vessel view header (§8 Level 2): identity, mode, next port, crew summary.
// NOTE: §8 also wants position and endurance here, but neither is registered
// at vessel level in the disposition registry — the Field router surfaces
// that gap as a literal placeholder instead of guessing. Logged for Anthony.

import Link from 'next/link';
import type { VesselState } from '../data/types';
import { Field } from './Field';
import { gb, fmtDay } from './gb';

export function VesselHeader({ vessel }: { vessel: VesselState }) {
  const master = vessel.history.crew.find((c) => c.role === 'Master');
  const next = vessel.history.nextPortCalls[0];

  return (
    <section style={{ ...gb.box, marginBottom: 8, display: 'flex', gap: 16, alignItems: 'baseline', flexWrap: 'wrap' }}>
      <Link href="/" style={{ textDecoration: 'underline', fontSize: 12 }}>
        ← fleet
      </Link>
      <span style={gb.big}>{vessel.static.name}</span>
      <span style={gb.dim}>
        {vessel.static.length_ft} ft {vessel.static.class}
      </span>
      <Field level="vessel" field="mode">
        <span style={gb.boxTight}>{vessel.derived.mode}</span>
      </Field>
      <Field level="vessel" field="next_port_calls">
        <span>next: {next ? `${next.port} ETA ${fmtDay(next.eta)}` : '—'}</span>
      </Field>
      <span>master: {master?.name ?? '—'} (since {master ? fmtDay(master.onboard_since) : '—'})</span>
      <Field level="vessel" field="position" />
      <Field level="vessel" field="endurance_hours" />
    </section>
  );
}
