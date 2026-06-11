'use client';
// Machine bucket (§6). The twin comparison is the hero: two MAIN EngineCards
// side by side with the gap explicit between them. Generators sit below,
// smaller — they're context, not the diagnosis.

import type { VesselState } from '../data/types';
import { EngineCard } from './EngineCard';
import { Field } from './Field';
import { Stat } from './Stat';
import { InstrumentCluster } from './InstrumentCluster';
import { gb, fmtPct } from './gb';
import { Label } from './Glyph';
import { Annotated } from '../learn/Annotated'; // LEARN MODE — strip before demo week

export function EngineTwinPanel({ vessel }: { vessel: VesselState }) {
  const now = vessel.history.minutes.at(-1)!;
  const [m1, m2] = now.engines.filter((e) => e.role === 'MAIN');
  const gens = now.engines.filter((e) => e.role === 'GEN');
  const fuelGapPct = m1.fuel_rate_gph > 0 ? (m2.fuel_rate_gph / m1.fuel_rate_gph - 1) * 100 : 0;
  const egtGapNow = m1.running && m2.running ? m2.exhaust_gas_temp_f - m1.exhaust_gas_temp_f : 0;

  return (
    <section style={{ ...gb.box, marginBottom: 8 }}>
      <Label g="engine">engine twins</Label>
      <div style={{ display: 'flex', gap: 8, alignItems: 'stretch', flexWrap: 'wrap' }}>
        <Annotated name="EngineCard"><EngineCard engine={m1} title="Engine 1" /></Annotated>
        <Field level="vessel" field="twin_comparison_delta">
          <div style={{ ...gb.box, background: 'var(--color-surface-overlay)', textAlign: 'center', alignSelf: 'center' }}>
            <Stat label="E2 vs E1 EGT" value={`${egtGapNow > 0 ? '+' : ''}${egtGapNow} °F`} />
            <div style={{ marginTop: 6 }}>fuel {fmtPct(fuelGapPct)} at matched load</div>
            <div style={gb.dim}>24h avg gap {vessel.derived.egt_twin_gap_f} °F</div>
          </div>
        </Field>
        <Annotated name="EngineCard"><EngineCard engine={m2} title="Engine 2" /></Annotated>
      </div>
      {/* gens: one slim two-column row (round 21 A4) */}
      <div style={{ display: 'flex', gap: 'var(--pad-card)', marginTop: 8, flexWrap: 'wrap', fontFamily: 'var(--font-data)', fontSize: 12 }}>
        {gens.map((g, i) => (
          <span key={g.engine_id} style={{ flex: '1 1 200px', display: 'flex', justifyContent: 'space-between', gap: 8, borderTop: '1px solid var(--color-line-hairline)', paddingTop: 6 }}>
            <span style={{ color: 'var(--color-ink-muted)' }}>G{i + 1} GEN</span>
            <span style={{ color: g.running ? 'var(--color-ink-primary)' : 'var(--color-ink-muted)' }}>
              {g.running ? `RUNNING · ${Math.round(g.load_pct)}% · ${g.fuel_rate_gph} gph` : 'OFF'}
            </span>
          </span>
        ))}
      </div>
      {/* gauge cluster, bound to the E1/E2/G1/G2 selector (verdict 13: gauges won) */}
      <div style={{ marginTop: 'var(--pad-section)', borderTop: '1px solid var(--color-line-hairline)', paddingTop: 'var(--pad-section)' }}>
        <InstrumentCluster vessel={vessel} />
      </div>
    </section>
  );
}
