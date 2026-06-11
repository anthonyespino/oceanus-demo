'use client';
// ROUND 22: TelemetryBand (evolves VesselInstrumentBand — rename recorded for
// barrel + Figma). Broadcast composition:
//   [SPEED] [BURN] ··· [MISSION CLOCK] ··· [EFF Δ] [ENDURANCE]
// Mission clock is mode-aware (T−countdown in transit, elapsed otherwise),
// DM Mono hero scale, with a 1px route-progress hairline under it in transit.
// Gauges keep round 19 geometry; color stays earned.

import type { VesselState, VesselSample } from '../data/types';
import { EFF_DELTA_CAUTION_PCT, BUNKER_SOON_H } from '../data/alerts';
import { PORTS, distanceNm, place } from '../data/fleet';
import { Gauge } from './Gauge';
import { Label } from './Glyph';
import { ACCENT, FONT, NEUTRAL } from './probeTokens';
import { gb, fmtPct } from './gb';

function maxObservedBurn(v: VesselState): number {
  let max = 0;
  for (const s of v.history.hourly) {
    const b = s.engines.reduce((a, e) => a + e.fuel_rate_gph, 0);
    if (b > max) max = b;
  }
  return Math.max(1, Math.ceil(max / 25) * 25);
}

function modeElapsedMs(v: VesselState): number {
  const ms = v.history.minutes;
  const mode = ms[ms.length - 1].mode;
  let i = ms.length - 1;
  while (i > 0 && ms[i - 1].mode === mode) i--;
  if (i > 0) return ms[ms.length - 1].t - ms[i].t;
  // mode spans the whole minute window — extend through hourly history
  let t0 = ms[0].t;
  for (let h = v.history.hourly.length - 1; h >= 0; h--) {
    const s = v.history.hourly[h];
    if (s.t >= t0) continue;
    if (s.mode !== mode) break;
    t0 = s.t;
  }
  return ms[ms.length - 1].t - t0;
}

function hhmm(ms: number): string {
  const m = Math.max(0, Math.floor(ms / 60000));
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

function lastPortName(v: VesselState): string | null {
  for (let i = v.history.minutes.length - 1; i >= 0; i--) {
    const s: VesselSample = v.history.minutes[i];
    if (s.mode === 'PORT') {
      const p = PORTS.reduce((a, b) => (distanceNm(s.position, a) < distanceNm(s.position, b) ? a : b));
      return p.name;
    }
  }
  return null;
}

const LOG_MIN = Math.log10(12);
const LOG_MAX = Math.log10(2400);

export function TelemetryBand({ vessel }: { vessel: VesselState }) {
  const d = vessel.derived;
  const now = vessel.history.minutes.at(-1)!;
  const sog = now.position.speed_over_ground_kn;
  const speedMax = Math.ceil(vessel.static.cruise_kn * 1.35);
  const endurance = Math.min(2400, Math.max(12, d.endurance_hours));
  const still = now.mode === 'PORT' && sog < 0.5;
  const effVital = still ? 'still' : d.efficiency_delta_pct > EFF_DELTA_CAUTION_PCT ? 'watch' : 'nominal';
  const endVital = still ? 'still' : d.endurance_hours < BUNKER_SOON_H ? 'watch' : 'nominal';
  const aliveVital = still ? 'still' : 'nominal';

  // mission clock
  const next = vessel.history.nextPortCalls[0];
  let clock: string;
  let context: string | null = null;
  let frac: number | null = null;
  if (now.mode === 'TRANSIT' && next) {
    clock = `T−${hhmm(next.eta - now.t)}`;
    context = next.port.replace(',', '').toUpperCase();
    const from = lastPortName(vessel);
    if (from) {
      frac = Math.min(1, Math.max(0,
        distanceNm(place(from), now.position) / Math.max(1, distanceNm(place(from), place(next.port)))));
    }
  } else {
    const elapsed = hhmm(modeElapsedMs(vessel));
    clock = elapsed;
    context = now.mode === 'STATION' ? 'ON STATION' : now.mode === 'PORT' ? 'IN PORT' : 'STANDBY';
  }

  return (
    <section style={{ ...gb.box, marginBottom: 8 }}>
      <Label g="gauge">telemetry</Label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--pad-section)', flexWrap: 'wrap' }}>
        <Gauge size={96} label="speed" value={sog} min={0} max={speedMax} display={`${sog.toFixed(1)} kn`} vital={aliveVital} />
        <Gauge size={96} label="burn" value={d.burn_rate_gph} min={0} max={maxObservedBurn(vessel)}
          display={`${Math.round(d.burn_rate_gph)} gph`} vital={aliveVital} />
        {/* mission clock — the broadcast center */}
        <div style={{ flex: 1, minWidth: 200, textAlign: 'center' }}>
          <div style={{ fontFamily: FONT.data, fontSize: 'var(--type-hero-size)', fontWeight: 500, fontVariantNumeric: 'tabular-nums', color: still ? '#ffffff' : NEUTRAL.ink }}>
            {now.mode === 'TRANSIT' ? clock : `${context} ${clock}`}
            {now.mode === 'TRANSIT' && context && (
              <span style={{ fontSize: 15, color: NEUTRAL.inkSecondary }}> · {context}</span>
            )}
          </div>
          {frac !== null && (
            <div style={{ height: 1, background: NEUTRAL.surfaceDim, marginTop: 8, position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, width: `${(frac * 100).toFixed(1)}%`, background: ACCENT.bright }} />
            </div>
          )}
          <div style={{ fontFamily: FONT.data, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: NEUTRAL.inkMuted, marginTop: 6 }}>
            mission clock
          </div>
        </div>
        <Gauge size={96} label="eff Δ" value={d.efficiency_delta_pct} min={-20} max={20}
          display={fmtPct(d.efficiency_delta_pct)} vital={effVital} minMaxLabels={['-20', '+20']}
          band={{ from: EFF_DELTA_CAUTION_PCT, to: 20, color: 'var(--color-alert-caution)' }} />
        <Gauge size={96} label="endurance" value={Math.log10(endurance)} min={LOG_MIN} max={LOG_MAX}
          display={`${d.endurance_hours} h`} vital={endVital} minMaxLabels={['12', '2.4k']}
          band={{ from: LOG_MIN, to: Math.log10(BUNKER_SOON_H), color: 'var(--color-alert-caution)' }} />
      </div>
    </section>
  );
}
