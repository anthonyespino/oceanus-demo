'use client';
// Trust layer (§5): show stream agreement explicitly — never pick one
// silently. Status is VISIBLE; the error magnitude is one reveal away.

import type { VesselState } from '../data/types';
import { RECON_CAUTION_PCT } from '../data/alerts';
import { Field } from './Field';
import { Stat } from './Stat';
import { FONT, NEUTRAL, RADIUS, STATUS_COLOR } from './probeTokens';
import { gb } from './gb';

/**
 * Round 11: the reconciliation card dissolved into the fuel-system card —
 * this chip is its surviving form (status + magnitude in the card header).
 */
export function ReconChip({ vessel }: { vessel: VesselState }) {
  const r = vessel.derived.reconciliation;
  const color =
    r.status === 'OK' ? NEUTRAL.inkSecondary
    : Math.abs(r.error_pct) > RECON_CAUTION_PCT ? STATUS_COLOR.watch
    : 'var(--color-alert-advisory)';
  return (
    <Field level="vessel" field="reconciliation_status">
      <span
        style={{
          fontFamily: FONT.data, fontSize: 'var(--type-context)', whiteSpace: 'nowrap',
          border: `1px solid ${color}`, color, borderRadius: RADIUS, padding: '1px 8px',
        }}
        title={`tank drawdown vs flow meter, ${r.window_h} h window`}
      >
        RECON {r.status} · {r.error_pct > 0 ? '+' : ''}{r.error_pct}%
      </span>
    </Field>
  );
}

export function FlowReconciliation({ vessel }: { vessel: VesselState }) {
  const r = vessel.derived.reconciliation;
  return (
    <section style={{ ...gb.box, marginBottom: 8 }}>
      <div style={gb.label}>reconciliation — tank drawdown vs flow meter</div>
      <Field level="vessel" field="reconciliation_status">
        <Stat label="tank vs meter" value={r.status} />
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
