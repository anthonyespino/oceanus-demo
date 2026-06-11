'use client';
// Active WARNING/CAUTION alerts fleet-wide, each linking to its vessel.
// Levels are text labels in brackets — no alert colors in the greybox.

import Link from 'next/link';
import type { VesselState } from '../data/types';
import { gb } from './gb';
import { Glyph, Label } from './Glyph';

export function AlertRail({ fleet }: { fleet: VesselState[] }) {
  const active = fleet.flatMap((v) =>
    v.alerts
      .filter((a) => a.level === 'WARNING' || a.level === 'CAUTION')
      .map((a) => ({ vessel: v.static, alert: a })),
  );
  // WARNING outranks CAUTION at the top of the rail (§7).
  active.sort((a, b) => (a.alert.level === b.alert.level ? 0 : a.alert.level === 'WARNING' ? -1 : 1));

  return (
    <section id="alert-strip" style={{ ...gb.box, marginBottom: 8 }} aria-label="active alerts">
      <Label g="alert-triangle">alerts</Label>
      {active.length === 0 ? (
        <div style={gb.dim}>no active warnings or cautions</div>
      ) : (
        active.map(({ vessel, alert }, i) => (
          <div key={`${vessel.id}-${alert.code}-${i}`}>
            <Glyph name="alert-triangle" size={12} /> [{alert.level}]{' '}
            <Link href={`/vessel/${vessel.id}`} style={{ textDecoration: 'underline', color: 'var(--color-accent-bright)' }}>
              {vessel.name}
            </Link>{' '}
            — {alert.message}
          </div>
        ))
      )}
    </section>
  );
}
