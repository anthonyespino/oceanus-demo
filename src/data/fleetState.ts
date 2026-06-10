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

function toState(rt: VesselRuntime): VesselState {
  const derived = computeDerived(rt.history);
  return {
    static: rt.v,
    history: rt.history,
    derived,
    alerts: evaluateAlerts(rt.v, rt.history, derived),
  };
}
