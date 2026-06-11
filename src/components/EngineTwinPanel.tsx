'use client';
// Machine bucket (§6). The twin comparison is the hero: two MAIN EngineCards
// side by side with the gap explicit between them. Generators sit below,
// smaller — they're context, not the diagnosis.

import type { VesselState } from '../data/types';
import { EngineCard } from './EngineCard';
import { Field } from './Field';
import { Stat } from './Stat';
import { gb, fmtPct } from './gb';

export function EngineTwinPanel({ vessel }: { vessel: VesselState }) {
  const now = vessel.history.minutes.at(-1)!;
  const [m1, m2] = now.engines.filter((e) => e.role === 'MAIN');
  const gens = now.engines.filter((e) => e.role === 'GEN');
  const fuelGapPct = m1.fuel_rate_gph > 0 ? (m2.fuel_rate_gph / m1.fuel_rate_gph - 1) * 100 : 0;
  const egtGapNow = m1.running && m2.running ? m2.exhaust_gas_temp_f - m1.exhaust_gas_temp_f : 0;

  return (
    <section style={{ ...gb.box, marginBottom: 8 }}>
      <div style={gb.label}>machine — engine twin comparison</div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'stretch', flexWrap: 'wrap' }}>
        <EngineCard engine={m1} title="Engine 1" />
        <Field level="vessel" field="twin_comparison_delta">
          <div style={{ ...gb.box, background: 'var(--color-surface-overlay)', textAlign: 'center', alignSelf: 'center' }}>
            <Stat label="E2 vs E1 EGT" value={`${egtGapNow > 0 ? '+' : ''}${egtGapNow} °F`} />
            <div style={{ marginTop: 6 }}>fuel {fmtPct(fuelGapPct)} at matched load</div>
            <div style={gb.dim}>24h avg gap {vessel.derived.egt_twin_gap_f} °F</div>
          </div>
        </Field>
        <EngineCard engine={m2} title="Engine 2" />
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        {gens.map((g, i) => (
          <EngineCard key={g.engine_id} engine={g} title={`Gen ${i + 1}`} />
        ))}
      </div>
    </section>
  );
}
