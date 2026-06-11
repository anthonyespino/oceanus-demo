'use client';
// ROUND 16: VesselInstrumentBand — the marine-console moment, promoted to a
// full-width band under the vessel header. Four dials from the shared Gauge
// primitive. Color is EARNED: the EFF Δ band starts at the same constant the
// EFF_DELTA alert fires on, and the endurance minimum band is the exported
// BUNKER_SOON_H horizon. Speed and burn carry no bands (no operating limit
// exists in the alert logic — no decorative color).

import type { VesselState } from '../data/types';
import { EFF_DELTA_CAUTION_PCT, BUNKER_SOON_H } from '../data/alerts';
import { Gauge } from './Gauge';
import { Label } from './Glyph';
import { gb, fmtPct } from './gb';

function burnGph(v: VesselState): number {
  return v.derived.burn_rate_gph;
}

/** Max observed vessel burn over the 1y hourly history — scales the dial. */
function maxObservedBurn(v: VesselState): number {
  let max = 0;
  for (const s of v.history.hourly) {
    const b = s.engines.reduce((a, e) => a + e.fuel_rate_gph, 0);
    if (b > max) max = b;
  }
  return Math.max(1, Math.ceil(max / 25) * 25);
}

const LOG_MIN = Math.log10(12);
const LOG_MAX = Math.log10(2400);

export function VesselInstrumentBand({ vessel }: { vessel: VesselState }) {
  // Anthony ruling 14: at PORT and not moving, the whole band reads white
  // (static stillness); otherwise dials are alive — green unless their own
  // alert-backed band says sub-nominal.
  const d = vessel.derived;
  const now = vessel.history.minutes.at(-1)!;
  const sog = now.position.speed_over_ground_kn;
  const speedMax = Math.ceil(vessel.static.cruise_kn * 1.35);
  const endurance = Math.min(2400, Math.max(12, d.endurance_hours));
  const still = now.mode === 'PORT' && sog < 0.5;
  const effVital = still ? 'still' : d.efficiency_delta_pct > EFF_DELTA_CAUTION_PCT ? 'watch' : 'nominal';
  const endVital = still ? 'still' : d.endurance_hours < BUNKER_SOON_H ? 'watch' : 'nominal';
  const aliveVital = still ? 'still' : 'nominal';

  return (
    <section style={{ ...gb.box, marginBottom: 8 }}>
      <Label g="gauge">instruments</Label>
      <div style={{ display: 'flex', justifyContent: 'space-evenly', flexWrap: 'wrap', gap: 8 }}>
        <Gauge size={96} label="speed" value={sog} min={0} max={speedMax} display={`${sog.toFixed(1)} kn`} vital={aliveVital} />
        <Gauge size={96} label="burn" value={burnGph(vessel)} min={0} max={maxObservedBurn(vessel)}
          display={`${Math.round(burnGph(vessel))} gph`} vital={aliveVital} />
        <Gauge size={96} label="eff Δ" value={d.efficiency_delta_pct} min={-20} max={20}
          display={fmtPct(d.efficiency_delta_pct)} vital={effVital}
          limit={{ from: EFF_DELTA_CAUTION_PCT, to: 20, color: 'var(--color-alert-caution)' }} />
        <Gauge size={96} label="endurance" value={Math.log10(endurance)} min={LOG_MIN} max={LOG_MAX}
          display={`${d.endurance_hours} h`} vital={endVital}
          limit={{ from: LOG_MIN, to: Math.log10(BUNKER_SOON_H), color: 'var(--color-alert-advisory)' }} />
      </div>
    </section>
  );
}
