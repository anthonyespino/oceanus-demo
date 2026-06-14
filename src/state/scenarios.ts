// ROUND 45: scenario library. Named, deterministic SYNTHETIC overlays on top
// of the base seed — performative states for demo rehearsal and edge-case
// validation. Each `apply` returns cloned VesselStates with only alert /
// derived / staleness / mode fields overridden; the generated telemetry and
// the demo seed are never mutated. `demo` is the canonical Meridian story
// (identity — no overlay, no badge). The dev panel / settings sheet reads
// this array, so adding a scenario is one entry here.

import type { VesselState, Alert, Freshness, StreamTimestamps } from '../data/types';

export interface Scenario {
  id: string;
  label: string;
  synthetic: boolean; // false only for `demo` — everything else badges loudly
  apply: (fleet: VesselState[]) => VesselState[];
}

const WARN = (code: string, message: string): Alert => ({ level: 'WARNING', code, message });
const CAUT = (code: string, message: string): Alert => ({ level: 'CAUTION', code, message });
const ADV = (code: string, message: string): Alert => ({ level: 'ADVISORY', code, message });

/** Override one vessel's alerts (+ optional derived numbers) on a clone. */
function set(v: VesselState, alerts: Alert[], d: Partial<VesselState['derived']> = {}): VesselState {
  return { ...v, alerts, derived: { ...v.derived, ...d } };
}
const clean = (v: VesselState): VesselState => set(v, [], { efficiency_delta_pct: v.derived.efficiency_delta_pct });

/** All streams FRESH (clears the seed's scripted Sabine stale-weather). */
function allFresh(v: VesselState): VesselState {
  const staleness = Object.fromEntries(
    Object.keys(v.derived.staleness).map((k) => [k, 'FRESH' as Freshness]),
  ) as Record<keyof StreamTimestamps, Freshness>;
  return { ...v, derived: { ...v.derived, staleness } };
}
function staleStreams(v: VesselState, streams: (keyof StreamTimestamps)[]): VesselState {
  const staleness = { ...v.derived.staleness };
  for (const s of streams) staleness[s] = 'STALE';
  return { ...v, derived: { ...v.derived, staleness } };
}

/** Apply a per-id transform, leaving unlisted vessels cleaned to nominal. */
function compose(mods: Record<string, (v: VesselState) => VesselState>, restClean = true): (fleet: VesselState[]) => VesselState[] {
  return (fleet) => fleet.map((v) => {
    const m = mods[v.static.id];
    if (m) return m(allFresh(v));
    return restClean ? clean(allFresh(v)) : v;
  });
}

export const SCENARIOS: Scenario[] = [
  { id: 'demo', label: 'DEMO — MERIDIAN', synthetic: false, apply: (fleet) => fleet },

  { id: 'all-nominal', label: 'ALL NOMINAL', synthetic: true,
    apply: (fleet) => fleet.map((v) => set(allFresh(v), [], { efficiency_delta_pct: 0.4, trend_30d: 0.2, sustained_deviation: 0.3 })) },

  { id: 'one-watch', label: 'ONE WATCH', synthetic: true,
    apply: compose({
      v01: (v) => set(v, [
        CAUT('EFF_DELTA', 'Efficiency +13.7% vs mode baseline, sustained 7d'),
        CAUT('EGT_DIVERGENCE', 'v01-E2 EGT +58°F over twin at matched load'),
      ], { efficiency_delta_pct: 13.7, trend_30d: 7.6, sustained_deviation: 8.1 }),
    }) },

  { id: 'multi-watch', label: 'MULTI-WATCH', synthetic: true,
    apply: compose({
      v01: (v) => set(v, [CAUT('EFF_DELTA', 'Efficiency +13.7% vs mode baseline, sustained 7d')], { efficiency_delta_pct: 13.7, trend_30d: 7.6, sustained_deviation: 8.1 }),
      v03: (v) => set(v, [CAUT('EFF_DELTA', 'Efficiency +8.4% vs mode baseline, sustained 7d')], { efficiency_delta_pct: 8.4, trend_30d: 5.1, sustained_deviation: 5.4 }),
      v08: (v) => set(v, [CAUT('EGT_DIVERGENCE', 'v08-E1 EGT +46°F over twin at matched load')], { efficiency_delta_pct: 7.2, trend_30d: 4.3, sustained_deviation: 4.6 }),
      v15: (v) => set(v, [CAUT('EFF_DELTA', 'Efficiency +9.1% vs mode baseline, sustained 7d')], { efficiency_delta_pct: 9.1, trend_30d: 5.6, sustained_deviation: 5.9 }),
    }) },

  { id: 'one-degraded', label: 'ONE DEGRADED', synthetic: true,
    apply: compose({
      v04: (v) => set(v, [WARN('EFF_DELTA', 'Efficiency +11.8% vs mode baseline, sustained 10d')], { efficiency_delta_pct: 11.8, trend_30d: 9.4, sustained_deviation: 11.2 }),
    }) },

  { id: 'multi-casualty', label: 'MULTI-CASUALTY', synthetic: true,
    apply: compose({
      v02: (v) => set(v, [WARN('FEEDER_LOW', 'Feeder tanks 8% underway')], { efficiency_delta_pct: 12.8, trend_30d: 9.2, sustained_deviation: 7.4 }),
      v04: (v) => set(v, [WARN('EGT_DIVERGENCE', 'v04-E2 EGT +71°F over twin at matched load')], { efficiency_delta_pct: 14.1, trend_30d: 9.8, sustained_deviation: 9.1 }),
      v01: (v) => set(v, [CAUT('EFF_DELTA', 'Efficiency +13.7% vs mode baseline, sustained 7d')], { efficiency_delta_pct: 13.7, trend_30d: 7.6, sustained_deviation: 8.1 }),
      v08: (v) => set(v, [CAUT('EGT_DIVERGENCE', 'v08-E1 EGT +44°F over twin at matched load')], { efficiency_delta_pct: 7.1, trend_30d: 4.4, sustained_deviation: 3.2 }),
    }) },

  { id: 'datalink-blackout', label: 'DATALINK BLACKOUT', synthetic: true,
    apply: (fleet) => fleet.map((v, i) => {
      if (!['v01', 'v05', 'v09', 'v13', 'v14'].includes(v.static.id)) return clean(allFresh(v));
      const streams: (keyof StreamTimestamps)[] = i % 2 === 0 ? ['weather', 'position'] : ['weather'];
      // ROUND 100: a stale stream raises a STALE_DATA advisory that has NO
      // evidence panel → it routes to the compact GENERAL area (datalink/
      // staleness has no panel home; forcing a dock would be dishonest).
      return staleStreams(set(v, streams.map((s) => ADV('STALE_DATA', `${s} stream stale > 30 min`))), streams);
    }) },

  { id: 'port-weekend', label: 'PORT WEEKEND', synthetic: true,
    apply: (fleet) => fleet.map((v) =>
      // most in PORT; leave three underway for contrast
      set(allFresh(v), [], { mode: ['v01', 'v03', 'v07'].includes(v.static.id) ? 'TRANSIT' : 'PORT', efficiency_delta_pct: 0.5 })) },

  { id: 'fuel-emergency', label: 'FUEL EMERGENCY', synthetic: true,
    apply: compose({
      v07: (v) => set(v, [CAUT('TANK_LOW', 'FD1 feeder 4% — fuel starvation risk')], { endurance_hours: 11, efficiency_delta_pct: 2.1 }),
    }) },

  { id: 'efficiency-drift', label: 'EFFICIENCY DRIFT', synthetic: true,
    apply: compose({
      v06: (v) => set(v, [CAUT('EFF_DELTA', 'Efficiency +8.9% vs mode baseline, sustained 9d — no engine fault')], { efficiency_delta_pct: 8.9, trend_30d: 6.7, sustained_deviation: 7.0 }),
    }) },
];

export function scenarioById(id: string): Scenario {
  return SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];
}
