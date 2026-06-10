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

function toState(rt: VesselRuntime): VesselState {
  const derived = computeDerived(rt.history);
  return {
    static: rt.v,
    history: rt.history,
    derived,
    alerts: evaluateAlerts(rt.v, rt.history, derived),
  };
}
