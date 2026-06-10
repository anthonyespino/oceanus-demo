'use client';
// LAYOUT PROBE addendum item 6: within data clusters, labels are left-ranged
// and numerals right-ranged with tabular figures — no exceptions. This is the
// single primitive that enforces it; composition around clusters stays
// centered.

import { NEUTRAL } from './probeTokens';

export function DataRow({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
      <span style={{ textAlign: 'left', fontSize: 12, color: NEUTRAL.inkSecondary }}>{label}</span>
      <span style={{ textAlign: 'right', fontSize: 12, fontVariantNumeric: 'tabular-nums', color: NEUTRAL.ink }}>
        {value}
      </span>
    </div>
  );
}
