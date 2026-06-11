// Fleet entry point: generate all 16 vessels (memoized), attach derived
// metrics and alerts. UI sessions and the verification harness both consume
// this — there is exactly one path into the data.

import { VESSELS } from './fleet';
import { advanceMinutes, simulateVessel, type VesselRuntime } from './generator';
import { computeDerived } from './derived';
import { evaluateAlerts } from './alerts';
import type { VesselState } from './types';

let runtimes: VesselRuntime[] | null = null;

export function getRuntimes(): VesselRuntime[] {
  if (!runtimes) runtimes = VESSELS.map(simulateVessel);
  return runtimes;
}

export function getFleet(): VesselState[] {
  return getRuntimes().map(toState);
}

/** Live mode: advance the whole fleet by n 1-minute ticks and re-derive. */
export function advanceFleet(n: number): VesselState[] {
  const rts = getRuntimes();
  for (const rt of rts) advanceMinutes(rt, n);
  return rts.map(toState);
}

/** Drop the memoized fleet (verification harness uses this to prove determinism). */
export function resetFleet(): void {
  runtimes = null;
}

/**
 * Whole-fleet efficiency trajectory over the year (v2 §8 fleet trend strip):
 * per-day mean of every vessel's daily efficiency_delta.
 */
export function fleetDailyTrend(states: VesselState[]): { day: number; delta: number }[] {
  const byDay = new Map<number, number[]>();
  for (const v of states) {
    for (const { day, delta } of v.derived.daily_delta_1y) {
      let arr = byDay.get(day);
      if (!arr) byDay.set(day, (arr = []));
      arr.push(delta);
    }
  }
  return [...byDay.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([day, arr]) => ({ day, delta: Math.round((arr.reduce((x, y) => x + y, 0) / arr.length) * 100) / 100 }));
}

/** Fleet-total burn right now, gph (sum of per-vessel burn_rate). */
export function fleetBurnNow(states: VesselState[]): number {
  return Math.round(states.reduce((a, v) => a + v.derived.burn_rate_gph, 0));
}

/** Hourly fleet-total burn over the last 24h, gph (round 12 band sparkline). */
export function fleetBurnSeries24h(states: VesselState[]): number[] {
  const out: number[] = [];
  for (let h = 0; h < 24; h++) {
    let total = 0;
    for (const v of states) {
      const slice = v.history.minutes.slice(h * 60, h * 60 + 60);
      if (slice.length === 0) continue;
      const mean =
        slice.reduce((a, s) => a + s.engines.reduce((x, e) => x + e.fuel_rate_gph, 0), 0) / slice.length;
      total += mean;
    }
    out.push(Math.round(total));
  }
  return out;
}

function toState(rt: VesselRuntime): VesselState {
  const derived = computeDerived(rt.history);
  return {
    static: rt.v,
    history: rt.history,
    derived,
    alerts: evaluateAlerts(rt.v, rt.history, derived),
  };
}
