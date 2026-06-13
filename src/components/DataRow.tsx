'use client';
// LAYOUT PROBE addendum item 6: within data clusters, labels are left-ranged
// and numerals right-ranged with tabular figures — no exceptions. This is the
// single primitive that enforces it; composition around clusters stays
// centered.

import { NEUTRAL } from './probeTokens';
import { useLearn } from '../learn/LearnProvider'; // EXPERT MODE — strip before demo week

export function DataRow({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  // round 44 expert mode: the left label hides — value + unit carry the row,
  // right-aligned into the freed space
  const { expertOn } = useLearn();
  return (
    <div style={{ display: 'flex', justifyContent: expertOn ? 'flex-end' : 'space-between', alignItems: 'baseline', gap: 12 }}>
      {!expertOn && <span style={{ textAlign: 'left', fontSize: 12, color: NEUTRAL.inkMuted }}>{label}</span>}
      <span style={{ textAlign: 'right', fontSize: 12, fontVariantNumeric: 'tabular-nums', color: NEUTRAL.ink }}>
        {value}
      </span>
    </div>
  );
}
