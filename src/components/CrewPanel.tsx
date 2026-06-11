'use client';
// Human factors bucket (§6): roster and tenure. The crew-vs-crew efficiency
// comparison is UNDEFINED (sensitive framing) — placeholder, not a guess.

import type { VesselState } from '../data/types';
import { Field } from './Field';
import { gb, fmtDay } from './gb';
import { Label } from './Glyph';

export function CrewPanel({ vessel }: { vessel: VesselState }) {
  const now = vessel.history.minutes.at(-1)!.t;
  // round 19 dedup: whole crews rotate together — when every onboard date
  // matches, the repeated column collapses to one footer line. Per-person
  // dates return automatically the moment dates differ.
  const dates = new Set(vessel.history.crew.map((c) => c.onboard_since));
  const shared = dates.size === 1 ? vessel.history.crew[0].onboard_since : null;

  return (
    <section style={{ ...gb.box, marginBottom: 8 }}>
      <Label g="crew">crew</Label>
      <table style={{ borderCollapse: 'collapse' }}>
        <tbody>
          {vessel.history.crew.map((c) => (
            <tr key={c.crew_member_id}>
              <Field level="vessel" field="crew.roles">
                <td style={{ ...gb.boxTight, border: 'none' }}>{c.role}</td>
              </Field>
              <Field level="vessel" field="crew.names">
                <td style={{ ...gb.boxTight, border: 'none' }}>{c.name}</td>
              </Field>
              {shared === null && (
                <Field level="vessel" field="crew.onboard_since">
                  <td style={{ ...gb.boxTight, border: 'none', color: 'var(--color-ink-muted)' }}>
                    onboard since {fmtDay(c.onboard_since)} ({Math.floor((now - c.onboard_since) / 86_400_000)}d)
                  </td>
                </Field>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {shared !== null && (
        <Field level="vessel" field="crew.onboard_since">
          <div style={{ marginTop: 6, fontFamily: 'var(--font-data)', fontSize: 12, color: 'var(--color-ink-muted)' }}>
            all aboard since {fmtDay(shared)} · {Math.floor((now - shared) / 86_400_000)}d
          </div>
        </Field>
      )}
      <Field level="vessel" field="crew_efficiency_comparison" />
    </section>
  );
}
