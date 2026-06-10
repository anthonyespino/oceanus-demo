'use client';
// Level 1 — fleet view (§8): alert rail, ranked vessel list with healthy-
// vessel compression, fleet map. Exceptions float to the top.

import { useState } from 'react';
import type { VesselState } from '../data/types';
import { AlertRail } from './AlertRail';
import { VesselCard } from './VesselCard';
import { FleetMap } from './FleetMap';
import { Field } from './Field';
import { gb } from './gb';

const NOMINAL_DELTA = 3; // |delta| below this + no alerts → compress

export function FleetView({ fleet }: { fleet: VesselState[] }) {
  const [showNominal, setShowNominal] = useState(false);

  const ranked = [...fleet].sort(
    (a, b) => Math.abs(b.derived.efficiency_delta_pct) - Math.abs(a.derived.efficiency_delta_pct),
  );
  const nominal = ranked.filter((v) => v.alerts.length === 0 && Math.abs(v.derived.efficiency_delta_pct) < NOMINAL_DELTA);
  const exceptions = ranked.filter((v) => !nominal.includes(v));

  return (
    <main style={{ padding: 12 }}>
      <AlertRail fleet={fleet} />
      <section style={{ marginBottom: 8 }}>
        <div style={gb.label}>vessels — ranked by |efficiency delta|</div>
        {exceptions.map((v) => (
          <VesselCard key={v.static.id} vessel={v} />
        ))}
        {/* The "42 friends OK" pattern: healthy vessels earn one row, not N. */}
        {nominal.length > 0 && (
          <div style={{ ...gb.box, background: '#f7f7f7' }}>
            <button
              onClick={() => setShowNominal((s) => !s)}
              style={{ border: '1px solid #999', background: '#fff', padding: '2px 8px', cursor: 'pointer' }}
            >
              {showNominal ? '▾' : '▸'} {nominal.length} vessels nominal (no alerts, |delta| &lt; {NOMINAL_DELTA}%)
            </button>
            {showNominal && (
              <div style={{ marginTop: 6 }}>
                {nominal.map((v) => (
                  <VesselCard key={v.static.id} vessel={v} />
                ))}
              </div>
            )}
          </div>
        )}
      </section>
      <FleetMap fleet={fleet} />
      <Field level="fleet" field="fleet_total_daily_spend" />
    </main>
  );
}
