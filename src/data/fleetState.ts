// Fleet entry point: generate all 16 vessels (memoized), attach derived
// metrics and alerts. UI sessions and the verification harness both consume
// this — there is exactly one path into the data.

import { VESSELS } from './fleet';
import { vesselStatus } from './alerts';
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

/**
 * Round 21 A1 / completed round 71–72 — the ONE consequence comparator for
 * board + rail. THREE tiers, top to bottom:
 *   Tier 1 ALERTED — CAUTION or worse, pinned top; worst severity first
 *     (WARNING above CAUTION), then by |deviation|.
 *   Tier 2 ACTIVE  — underway (TRANSIT/STATION), by |deviation| worst-first.
 *   Tier 3 IDLE    — in port / standby, dimmed, settles to the bottom; |deviation|.
 *
 * The deviation key is |trend_30d| — ABSOLUTE (round 72): magnitude is the
 * consequence (a +3% and a −3% both warrant a look), sign is the diagnosis. It
 * is the DISPLAYED hero number on each tile and what the "ranked by sustained
 * deviation" header means, so the rendered order matches what the operator
 * actually reads. The internal `sustained_deviation` weighted score is NO LONGER
 * the sort key (round 21 used it, but it diverged from the shown number — e.g.
 * Marlin Ridge trend +2.8 vs Calcasieu −1.2 inverted under the weighted score —
 * which is exactly what made the active tier look unsorted). NOT ETA, NOT
 * alphabetical, NOT data order. A final vessel-id tiebreak keeps the order
 * stable and deterministic (no jitter on refresh; reorders only when a tier or
 * the rounded |trend| ordering meaningfully changes).
 */
const STATUS_RANK = { degraded: 0, watch: 1, nominal: 2 } as const;
const ACTIVE_MODES = new Set(['TRANSIT', 'STATION']);
function consequenceTier(v: VesselState): number {
  if (vesselStatus(v.alerts) !== 'nominal') return 0; // Tier 1 ALERTED
  return ACTIVE_MODES.has(v.derived.mode) ? 1 : 2;     // Tier 2 ACTIVE · Tier 3 IDLE
}
export function compareVessels(a: VesselState, b: VesselState): number {
  const ta = consequenceTier(a), tb = consequenceTier(b);
  if (ta !== tb) return ta - tb;
  if (ta === 0) { // within ALERTED: worst severity first (WARNING above CAUTION)
    const sev = STATUS_RANK[vesselStatus(a.alerts)] - STATUS_RANK[vesselStatus(b.alerts)];
    if (sev !== 0) return sev;
  }
  const dev = Math.abs(b.derived.trend_30d) - Math.abs(a.derived.trend_30d);
  if (Math.abs(dev) > 1e-9) return dev;
  return a.static.id < b.static.id ? -1 : a.static.id > b.static.id ? 1 : 0; // stable
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
