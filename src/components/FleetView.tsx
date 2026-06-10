'use client';
// Level 1 — fleet view (v2 §8): the trend board. Ranked by sustained_deviation
// (trend-led, not instantaneous); the AlertRail is a context strip below the
// ranking header, not the page-top hero (greybox position only — final
// placement is Anthony's Figma call). Healthy vessels compress.

import { useState } from 'react';
import type { VesselState } from '../data/types';
import { AlertRail } from './AlertRail';
import { FleetTrend } from './FleetTrend';
import { VesselCard } from './VesselCard';
import { FleetMap } from './FleetMap';
import { Field } from './Field';
import { gb } from './gb';

const NOMINAL_DELTA = 3; // |delta| below this…
const NOMINAL_SD = 2; // …AND |sustained_deviation| below this + no alerts → compress

export function FleetView({ fleet }: { fleet: VesselState[] }) {
  const [showNominal, setShowNominal] = useState(false);

  const ranked = [...fleet].sort(
    (a, b) => Math.abs(b.derived.sustained_deviation) - Math.abs(a.derived.sustained_deviation),
  );
  const nominal = ranked.filter(
    (v) =>
      v.alerts.length === 0 &&
      Math.abs(v.derived.efficiency_delta_pct) < NOMINAL_DELTA &&
      Math.abs(v.derived.sustained_deviation) < NOMINAL_SD,
  );
  const exceptions = ranked.filter((v) => !nominal.includes(v));

  return (
    <main style={{ padding: 12 }}>
      <div style={{ ...gb.label, fontSize: 13, marginBottom: 4 }}>
        trend board — ranked by sustained deviation (drift outranks spikes)
      </div>
      <AlertRail fleet={fleet} />
      <FleetTrend fleet={fleet} />
      <section style={{ marginBottom: 8 }}>
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
              {showNominal ? '▾' : '▸'} {nominal.length} vessels nominal (no alerts, stable trend)
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
