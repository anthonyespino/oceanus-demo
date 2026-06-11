'use client';
// Fuel system: 2 storage → 2 feeder → flow meter → engines, as labeled boxes
// and text arrows. Capacity and transfer state are CONTEXTUAL reveals.

import type { VesselState } from '../data/types';
import { useFleet } from '../state/FleetProvider';
import { Field } from './Field';
import { ReconChip } from './FlowReconciliation';
import { RevealZone } from './Contextual';
import { Stat } from './Stat';
import { FONT, NEUTRAL } from './probeTokens';
import { gb } from './gb';
import { Label } from './Glyph';

// Round 5 dot-matrix experiment: tank fill as a 5×10 dot grid, filled from
// the bottom, DM Mono. Behind the dev-panel toggle vs the row layout —
// Anthony judges; the loser gets deleted.
function DotMatrix({ pct }: { pct: number }) {
  const filled = Math.round(pct / 2); // 50 dots = 100%
  const rows = Array.from({ length: 5 }, (_, r) => {
    const rowFilled = Math.min(10, Math.max(0, filled - (4 - r) * 10));
    return '●'.repeat(rowFilled).padStart(10, '○').split('').reverse().join('');
  });
  return (
    <div style={{ fontFamily: FONT.data, fontSize: 10, letterSpacing: 3, lineHeight: 1.3, color: NEUTRAL.inkSecondary }}>
      {rows.map((row, i) => (
        <div key={i}>{row}</div>
      ))}
    </div>
  );
}

export function TankSchematic({ vessel }: { vessel: VesselState }) {
  const { tankStyle } = useFleet();
  const now = vessel.history.minutes.at(-1)!;
  const storage = now.tanks.filter((t) => t.type === 'STORAGE');
  const feeder = now.tanks.filter((t) => t.type === 'FEEDER');

  const tankBox = (t: (typeof now.tanks)[number]) => (
    <div key={t.tank_id} style={{ ...gb.box, minWidth: 150 }}>
      <Field level="vessel" field="tank.type">
        <div style={gb.label}>
          {t.tank_id} {t.type}
        </div>
      </Field>
      {tankStyle === 'dots' ? (
        <Field level="vessel" field="tank.level_pct">
          <DotMatrix pct={t.level_pct} />
          <div style={{ fontFamily: FONT.data, fontSize: 12, marginTop: 2 }}>
            {t.level_pct}% · {t.level_gal.toLocaleString()} gal
          </div>
        </Field>
      ) : (
        <>
          {/* round 16 cuts: "level"/"volume" labels — % and gal self-describe */}
          <Field level="vessel" field="tank.level_pct">
            <div style={{ fontFamily: 'var(--font-data)', fontSize: 15, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{t.level_pct}%</div>
          </Field>
          <Field level="vessel" field="tank.level_gal">
            <div style={{ fontFamily: 'var(--font-data)', fontSize: 12, color: 'var(--color-ink-secondary)', fontVariantNumeric: 'tabular-nums' }}>{t.level_gal.toLocaleString()} gal</div>
          </Field>
        </>
      )}
    </div>
  );

  return (
    <section style={{ ...gb.box, marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
        <Label g="tank" style={{ marginBottom: 0 }}>fuel</Label>
        <ReconChip vessel={vessel} />
      </div>
      <div style={{ height: 'var(--pad-section)' }} />
      <RevealZone
        reveal={
          <span>
            <Field level="vessel" field="tank.capacity_gal" revealed>
              <span>
                capacity {now.tanks.map((t) => `${t.tank_id.split('-')[1]} ${t.capacity_gal.toLocaleString()}`).join(' · ')} gal
              </span>
            </Field>
            {' — '}
            <Field level="vessel" field="tank.transfer_active" revealed>
              <span>{now.tanks.some((t) => t.transfer_active) ? 'TRANSFER ACTIVE' : 'no transfer in progress'}</span>
            </Field>
          </span>
        }
      >
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <div>{storage.map(tankBox)}</div>
        <div style={{ fontSize: 20 }}>→</div>
        <div>{feeder.map(tankBox)}</div>
        <div style={{ fontSize: 20 }}>→</div>
        <div style={{ ...gb.box, background: 'var(--color-surface-overlay)' }}>
          <div style={gb.label}>flow meter</div>
          <Field level="vessel" field="flow_gps">
            <Stat label="flow" value={`${Math.round(now.flow_gps * 3600)} gph`} size={22} />
            <div style={gb.dim}>{now.flow_gps} gps</div>
          </Field>
        </div>
        <div style={{ fontSize: 20 }}>→</div>
        <div style={gb.boxTight}>engines</div>
      </div>
      </RevealZone>
    </section>
  );
}
