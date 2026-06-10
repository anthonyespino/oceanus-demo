// Mode schedule builder: port → transit → station/standby → transit → port
// cycles per vessel, deterministic from the vessel's RNG stream.

import { DEMO_EPOCH, DAY_MS, HOUR_MS, Rng } from './rng';
import { PORTS, SITES, place, distanceNm, type Place } from './fleet';
import type { ScheduleLeg, VesselStatic } from './types';

/** Simulation span: 1 year of history plus headroom for live ticks and ETAs. */
export const SIM_START = DEMO_EPOCH - 367 * DAY_MS;
export const SIM_END = DEMO_EPOCH + 16 * DAY_MS;

export function buildSchedule(v: VesselStatic): ScheduleLeg[] {
  // §9 requires the anomaly vessel to be underway at the demo epoch (the
  // CAUTION fires in TRANSIT). Deterministically re-salt its schedule stream
  // until a transit leg covers the epoch with ≥1 h margin either side.
  if (v.scripted.anomaly) {
    for (let salt = 0; salt < 64; salt++) {
      const legs = buildScheduleSalted(v, salt);
      const leg = legAt(legs, DEMO_EPOCH);
      if (leg.mode === 'TRANSIT' && DEMO_EPOCH - leg.startMs > HOUR_MS && leg.endMs - DEMO_EPOCH > HOUR_MS) {
        return legs;
      }
    }
    throw new Error(`no transit-at-epoch schedule found for ${v.id}`);
  }
  return buildScheduleSalted(v, 0);
}

function buildScheduleSalted(v: VesselStatic, salt: number): ScheduleLeg[] {
  const rng = new Rng(`schedule:${v.id}:${salt}`);
  const transitHeavy = v.schedule_profile === 'transit_heavy';
  const legs: ScheduleLeg[] = [];

  let t = SIM_START;
  let here: Place = place(rng.pick(v.home_ports));

  while (t < SIM_END) {
    // PORT call
    const portH = transitHeavy ? rng.range(10, 20) : rng.range(16, 36);
    legs.push({ mode: 'PORT', startMs: t, endMs: t + portH * HOUR_MS, fromPort: here.name, a: here, b: here });
    t += portH * HOUR_MS;

    // TRANSIT out to a work site (transit-heavy boats draw farther sites)
    const site = pickSite(rng, here, transitHeavy);
    t = pushTransit(legs, v, t, here, site);

    // On-site work: STATION (DP) or occasionally STANDBY
    const standby = rng.next() < 0.25;
    const siteH = transitHeavy ? rng.range(10, 28) : rng.range(48, 96);
    legs.push({
      mode: standby ? 'STANDBY' : 'STATION',
      startMs: t,
      endMs: t + siteH * HOUR_MS,
      site: site.name,
      a: site,
      b: site,
    });
    t += siteH * HOUR_MS;

    // TRANSIT back to a (possibly different) home port
    const back = place(rng.pick(v.home_ports));
    t = pushTransit(legs, v, t, site, back);
    here = back;
  }
  return legs;
}

function pickSite(rng: Rng, from: Place, far: boolean): Place {
  // Sort sites by distance and bias selection near/far by profile.
  const sorted = [...SITES].sort((a, b) => distanceNm(from, a) - distanceNm(from, b));
  const idx = far ? rng.int(3, sorted.length - 1) : rng.int(0, 4);
  return sorted[idx];
}

function pushTransit(legs: ScheduleLeg[], v: VesselStatic, t: number, a: Place, b: Place): number {
  const hours = Math.max(2, distanceNm(a, b) / v.cruise_kn);
  legs.push({
    mode: 'TRANSIT',
    startMs: t,
    endMs: t + hours * HOUR_MS,
    fromPort: a.name,
    toPort: b.name,
    a,
    b,
  });
  return t + hours * HOUR_MS;
}

export function legAt(legs: ScheduleLeg[], t: number): ScheduleLeg {
  // Legs are contiguous and sorted; binary search.
  let lo = 0;
  let hi = legs.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (legs[mid].endMs <= t) lo = mid + 1;
    else hi = mid;
  }
  return legs[lo];
}

/** Upcoming PORT arrivals after t — feeds next_port_calls[]. */
export function nextPortCalls(legs: ScheduleLeg[], t: number): { port: string; eta: number }[] {
  const calls: { port: string; eta: number }[] = [];
  for (const leg of legs) {
    if (leg.mode === 'PORT' && leg.startMs > t) {
      calls.push({ port: leg.fromPort!, eta: leg.startMs });
      if (calls.length >= 2) break;
    }
  }
  return calls;
}

export { PORTS };
