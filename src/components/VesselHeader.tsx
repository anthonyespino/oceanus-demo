'use client';
// Vessel view header (§8 Level 2): identity, mode, position (relative
// reference per v2 — nearest port, not raw numerals), next port, crew
// summary, endurance. Registry entries for position/endurance exist as of
// DECISIONS.md ruling 6.

import Link from 'next/link';
import type { VesselState } from '../data/types';
import { PORTS, distanceNm } from '../data/fleet';
import { Field } from './Field';
import { gb, fmtDay } from './gb';
import { Glyph, type GlyphName } from './Glyph';
import { StateMark } from './StateMark';

const MODE_GLYPH: Record<string, GlyphName> = { TRANSIT: 'route', STATION: 'vessel', STANDBY: 'clock', PORT: 'anchor' };

export function VesselHeader({ vessel }: { vessel: VesselState }) {
  const master = vessel.history.crew.find((c) => c.role === 'Master');
  const next = vessel.history.nextPortCalls[0];
  const now = vessel.history.minutes.at(-1)!;
  const nearest = PORTS.reduce((a, b) => (distanceNm(now.position, a) < distanceNm(now.position, b) ? a : b));
  const nearestNm = distanceNm(now.position, nearest);

  return (
    <section style={{ ...gb.box, marginBottom: 8, display: 'flex', gap: 16, alignItems: 'baseline', flexWrap: 'wrap' }}>
      <Link href="/" style={{ textDecoration: 'underline', fontSize: 12 }}>
        ← fleet
      </Link>
      <span style={{ ...gb.big, fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: 1 }}>{vessel.static.name}</span>
      <span style={gb.dim}>
        {vessel.static.length_ft} ft {vessel.static.class}
      </span>
      <Field level="vessel" field="mode">
        <span style={{ ...gb.boxTight, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <Glyph name={MODE_GLYPH[vessel.derived.mode]} size={12} />{vessel.derived.mode}
        </span>
      </Field>
      <Field level="vessel" field="position">
        <span>
          {nearestNm < 3
            ? `alongside ${nearest.name}`
            : `${nearestNm.toFixed(0)} nm from ${nearest.name} · ${now.position.speed_over_ground_kn} kn`}
        </span>
      </Field>
      <Field level="vessel" field="endurance_hours">
        <span>endurance {vessel.derived.endurance_hours} h</span>
      </Field>
      <Field level="vessel" field="next_port_calls">
        <span>next: {next ? <>{next.port} <StateMark port={next.port} /> ETA {fmtDay(next.eta)}</> : '—'}</span>
      </Field>
      <span>master: {master?.name ?? '—'} (since {master ? fmtDay(master.onboard_since) : '—'})</span>
    </section>
  );
}
