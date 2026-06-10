'use client';
// Human factors bucket (§6): roster and tenure. The crew-vs-crew efficiency
// comparison is UNDEFINED (sensitive framing) — placeholder, not a guess.

import type { VesselState } from '../data/types';
import { Field } from './Field';
import { gb, fmtDay } from './gb';

export function CrewPanel({ vessel }: { vessel: VesselState }) {
  const now = vessel.history.minutes.at(-1)!.t;
  const lastChange = vessel.history.crewChanges.at(-1);

  return (
    <section style={{ ...gb.box, marginBottom: 8 }}>
      <div style={gb.label}>crew</div>
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
              <Field level="vessel" field="crew.onboard_since">
                <td style={{ ...gb.boxTight, border: 'none', color: 'var(--color-ink-muted)' }}>
                  onboard since {fmtDay(c.onboard_since)} ({Math.floor((now - c.onboard_since) / 86_400_000)}d)
                </td>
              </Field>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 4, ...gb.dim }}>
        last crew change: {lastChange ? `${fmtDay(lastChange)} (${Math.floor((now - lastChange) / 86_400_000)}d ago)` : 'none in history'}
      </div>
      <Field level="vessel" field="crew_efficiency_comparison" />
    </section>
  );
}
