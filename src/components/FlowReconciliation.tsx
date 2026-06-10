'use client';
// Trust layer (§5): show stream agreement explicitly — never pick one
// silently. Status is VISIBLE; the error magnitude is one reveal away.

import type { VesselState } from '../data/types';
import { Field } from './Field';
import { gb } from './gb';

export function FlowReconciliation({ vessel }: { vessel: VesselState }) {
  const r = vessel.derived.reconciliation;
  return (
    <section style={{ ...gb.box, marginBottom: 8 }}>
      <div style={gb.label}>reconciliation — tank drawdown vs flow meter</div>
      <Field level="vessel" field="reconciliation_status">
        <span style={{ fontWeight: 700 }}>{r.status}</span>
        {r.status === 'DISAGREE' && <span> — streams disagree; trust neither until resolved</span>}
      </Field>{' '}
      <Field level="vessel" field="reconciliation_error_magnitude" label="error magnitude">
        <span>
          {r.error_pct > 0 ? '+' : ''}
          {r.error_pct}% over {r.window_h} h window
        </span>
      </Field>
    </section>
  );
}
