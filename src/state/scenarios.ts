// ROUND 45 / REARCHITECTED ROUND 110: scenario library → THREE selectable
// whole-fleet states, toggled from the D panel (one active at a time). Each
// scenario is a clean SINGLE-OUTLIER board: one lone caution vessel, all others
// coherent-nominal. `demo` (Scenario 1) is the canonical Meridian story
// (identity — no overlay, no badge); the other two are synthetic and badge
// loudly.
//
// THE ROUND-110 FIX (carry-through): the original overlays patched only
// `alerts` + `derived`, but the INSPECTOR computes its panels from the latest
// `history.minutes` sample (engine EGT/fuel, tank levels, weather) and from
// `history` envelopes — so a synthetic caution's inspector fell back to raw
// seed telemetry and told the wrong story. Scenarios now ALSO override the
// caution vessel's latest sample + the derived trend series, so the computed
// panels (engine-twin, fuel/endurance, efficiency, weather) all read coherently
// — not just the summary numbers. The generated telemetry + demo seed are never
// mutated (clones only).
//
// Vessel picks (Anthony, round 110): S2 = Marlin Ridge (v03), already a clean
// transit OSV with the lowest endurance headroom → smallest, least-fiction
// override. S3 = Osprey Point (v14), already in STATION with the roughest seed
// weather in the fleet → the environment story is substantiated by data already
// present.

import type { VesselState, Alert, Freshness, StreamTimestamps, VesselSample, TankSample } from '../data/types';

export interface Scenario {
  id: string;
  label: string;
  synthetic: boolean; // false only for `demo` — everything else badges loudly
  apply: (fleet: VesselState[]) => VesselState[];
}

const CAUT = (code: string, message: string): Alert => ({ level: 'CAUTION', code, message });
const clamp = (n: number, lim: number) => Math.max(-lim, Math.min(lim, n));

/** Override one vessel's alerts (+ optional derived numbers) on a clone. */
function set(v: VesselState, alerts: Alert[], d: Partial<VesselState['derived']> = {}): VesselState {
  return { ...v, alerts, derived: { ...v.derived, ...d } };
}

/** All streams FRESH (clears the seed's scripted Sabine stale-weather). */
function allFresh(v: VesselState): VesselState {
  const staleness = Object.fromEntries(
    Object.keys(v.derived.staleness).map((k) => [k, 'FRESH' as Freshness]),
  ) as Record<keyof StreamTimestamps, Freshness>;
  return { ...v, derived: { ...v.derived, staleness } };
}

/** ROUND 110: replace the latest minute sample (the inspector's "now") on a
    clone — so the computed panels read the scenario's telemetry, not the seed. */
function setNow(v: VesselState, patch: Partial<VesselSample>): VesselState {
  const minutes = v.history.minutes.slice();
  minutes[minutes.length - 1] = { ...minutes[minutes.length - 1], ...patch };
  return { ...v, history: { ...v.history, minutes } };
}

/** ROUND 110: a NON-caution vessel, made coherent-nominal so nothing from
    another scenario (or the seed anomaly) lingers — the brief's "no Meridian
    trend/twin-gap left on the board" requirement. Alerts cleared, streams fresh,
    elevated performance numbers pulled back into the nominal band, and the
    now-sample MAIN engines matched so a clicked bystander's engine-twin VERDICT
    reads clean. (The seed anomaly vessel's deep 30d EGT-gap HISTORY chart is not
    rewritten — see PROGRESS note; it is a bystander, off the demo path.) */
function clean(v: VesselState): VesselState {
  const now = v.history.minutes.at(-1)!;
  const mains = now.engines.filter((e) => e.role === 'MAIN');
  let base = v;
  if (mains.length === 2 && Math.abs(mains[1].exhaust_gas_temp_f - mains[0].exhaust_gas_temp_f) > 10) {
    const engines = now.engines.map((e) =>
      e.role === 'MAIN' && e.engine_id === mains[1].engine_id
        ? { ...e, exhaust_gas_temp_f: mains[0].exhaust_gas_temp_f, fuel_rate_gph: mains[0].fuel_rate_gph }
        : e);
    base = setNow(v, { engines });
  }
  return set(base, [], {
    efficiency_delta_pct: clamp(v.derived.efficiency_delta_pct, 3),
    trend_30d: clamp(v.derived.trend_30d, 3),
    sustained_deviation: Math.min(3, Math.max(0, v.derived.sustained_deviation)),
    egt_twin_gap_f: 0,
  });
}

/** Apply a per-id transform, leaving unlisted vessels cleaned to nominal. */
function compose(mods: Record<string, (v: VesselState) => VesselState>): (fleet: VesselState[]) => VesselState[] {
  return (fleet) => fleet.map((v) => {
    const m = mods[v.static.id];
    return m ? m(allFresh(v)) : clean(allFresh(v));
  });
}

// ── SCENARIO 2 — Marlin Ridge (v03): FUEL / ENDURANCE RISK → logistics ───────
// Engines stay CLEAN (untouched — v03's seed twins already track) and efficiency
// stays normal. The tanks are drawn down so endurance is tight; endurance is
// recomputed from the drawn-down tanks ÷ the real transit burn, so the
// inspector's fuel÷burn math holds by construction. Causal elimination: machine
// clean + efficiency normal → the only issue is fuel-time / resupply timing.
function marlinEndurance(v: VesselState): VesselState {
  const now = v.history.minutes.at(-1)!;
  const factor = 0.5; // draw tanks to ~half → low-but-not-starved (all > critical 5%)
  const tanks: TankSample[] = now.tanks.map((t) => ({
    ...t,
    level_gal: Math.round(t.level_gal * factor),
    level_pct: Math.round(t.level_pct * factor * 10) / 10,
  }));
  const burn = v.derived.burn_rate_gph; // keep the real transit burn (the BURN gauge)
  const usableGal = tanks.reduce((a, t) => a + t.level_gal, 0) * 0.95;
  const enduranceH = Math.round(usableGal / burn); // = fuel ÷ burn — coherent by construction
  const sog = now.position.speed_over_ground_kn;
  const reqH = 78; // return leg + 1.5 reserve (synthetic — vessel is far out)
  return set(setNow(v, { tanks }), [
    CAUT('ENDURANCE', `Endurance ${enduranceH} h below ${reqH} h required (return + reserve) — plan resupply/return timing`),
  ], {
    endurance_hours: enduranceH,
    endurance_nm: Math.round(enduranceH * sog),
    egt_twin_gap_f: 0, // engines clean — the cause is NOT mechanical
  });
}

// ── SCENARIO 3 — Osprey Point (v14): STATION-KEEPING BURN ANOMALY → environment
// Mode stays STATION, engines stay CLEAN. Sea state is raised to an unmistakably
// elevated level (it is already the roughest in the seed), station-keeping burn
// is elevated to match, and efficiency Δ vs the STATION baseline runs high +
// sustained. The efficiency trend tail + sparkline are lifted too, so the
// inspector's computed efficiency panels read coherently — not just the headline.
// Causal elimination: machine clean + route normal + WEATHER elevated → the
// cause is the environment, not the engine. ("Different culprit, same structure.")
function ospreyEnvironment(v: VesselState): VesselState {
  const now = v.history.minutes.at(-1)!;
  const weather = { ...now.weather, wave_height_ft: 8.0, wind_speed_kn: 24 };
  // lift the last ~14 daily points so the 30d trend chart climbs into the caution
  const daily = v.derived.daily_delta_1y.map((x, i, arr) =>
    i >= arr.length - 14 ? { ...x, delta: Math.round((4 + (i - (arr.length - 14)) * 0.48) * 10) / 10 } : x);
  const spark = v.derived.sparkline_24h.map((_, i, arr) => Math.round((6.5 + (i / Math.max(1, arr.length - 1)) * 4) * 10) / 10);
  const burn = 118; // elevated station-keeping burn, fighting the sea state
  const usableGal = now.tanks.reduce((a, t) => a + t.level_gal, 0) * 0.95;
  return set(setNow(v, { weather }), [
    CAUT('EFF_DELTA', 'Efficiency +10.2% vs mode baseline, sustained 7d — station-keeping in 8 ft seas / 24 kn'),
  ], {
    efficiency_delta_pct: 10.2,
    trend_30d: 6.8,
    sustained_deviation: 7.5,
    burn_rate_gph: burn,
    endurance_hours: Math.round(usableGal / burn), // recomputed from the raised burn — fuel÷burn stays coherent
    endurance_nm: null, // STATION — no underway range
    egt_twin_gap_f: 0, // engines clean — the cause is NOT mechanical
    daily_delta_1y: daily,
    sparkline_24h: spark,
  });
}

export const SCENARIOS: Scenario[] = [
  // Scenario 1 — the canonical Meridian story (identity, the hero). Unchanged.
  { id: 'demo', label: 'MERIDIAN — mechanical', synthetic: false, apply: (fleet) => fleet },
  // Scenario 2 — fuel/endurance risk → logistics.
  { id: 's2-endurance', label: 'MARLIN RIDGE — fuel/endurance', synthetic: true, apply: compose({ v03: marlinEndurance }) },
  // Scenario 3 — station-keeping burn anomaly → environment.
  { id: 's3-environment', label: 'OSPREY POINT — environment', synthetic: true, apply: compose({ v14: ospreyEnvironment }) },
];

export function scenarioById(id: string): Scenario {
  return SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];
}
