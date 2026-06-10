// Vessel event extraction (round 5, EventLog). Sources are EXISTING generator
// facts only — mode transitions, crew changes, bunkering (storage rises),
// alert raises reconstructed from the same thresholds the alert logic uses,
// staleness starts. No invented events.

import { DAY_MS, HOUR_MS, MIN_MS } from './rng';
import { PORTS, distanceNm } from './fleet';
import { EFF_DELTA_CAUTION_PCT, EGT_GAP_CAUTION_F } from './alerts';
import type { AlertLevel, VesselSample, VesselState } from './types';

export type EventType = 'MODE' | 'CREW' | 'BUNKER' | 'ALERT' | 'DATALINK';

export interface VesselEvent {
  t: number;
  type: EventType;
  text: string;
  level?: AlertLevel;
}

function samplesInRange(v: VesselState, fromMs: number): VesselSample[] {
  const minuteStart = v.history.minutes[0]?.t ?? Infinity;
  const hourly = v.history.hourly.filter((s) => s.t >= fromMs && s.t < minuteStart);
  const minutes = v.history.minutes.filter((s) => s.t >= fromMs);
  return [...hourly, ...minutes];
}

function nearestPort(s: VesselSample): string {
  const p = PORTS.reduce((a, b) => (distanceNm(s.position, a) < distanceNm(s.position, b) ? a : b));
  return distanceNm(s.position, p) < 5 ? p.name : '—';
}

export function vesselEvents(v: VesselState, fromMs: number): VesselEvent[] {
  const events: VesselEvent[] = [];
  const samples = samplesInRange(v, fromMs);
  const now = v.history.minutes.at(-1)?.t ?? Date.now();

  // Mode transitions + bunkering runs from the sample stream.
  let bunkerRun: { t: number; gal: number; port: string } | null = null;
  for (let i = 1; i < samples.length; i++) {
    const prev = samples[i - 1];
    const cur = samples[i];
    if (prev.mode !== cur.mode) {
      events.push({ t: cur.t, type: 'MODE', text: `${prev.mode} → ${cur.mode}` });
    }
    const storPrev = prev.tanks.filter((t) => t.type === 'STORAGE').reduce((a, t) => a + t.level_gal, 0);
    const storCur = cur.tanks.filter((t) => t.type === 'STORAGE').reduce((a, t) => a + t.level_gal, 0);
    const rise = storCur - storPrev;
    if (rise > 25) {
      if (!bunkerRun) bunkerRun = { t: cur.t, gal: 0, port: nearestPort(cur) };
      bunkerRun.gal += rise;
    } else if (bunkerRun) {
      events.push({ t: bunkerRun.t, type: 'BUNKER', text: `Storage +${Math.round(bunkerRun.gal).toLocaleString()} gal (${bunkerRun.port})` });
      bunkerRun = null;
    }
  }
  if (bunkerRun) {
    events.push({ t: bunkerRun.t, type: 'BUNKER', text: `Storage +${Math.round(bunkerRun.gal).toLocaleString()} gal (${bunkerRun.port})` });
  }

  // Crew changes.
  for (const t of v.history.crewChanges) {
    if (t >= fromMs) events.push({ t, type: 'CREW', text: `Crew change — ${v.history.crew.length} aboard` });
  }

  // Alert raises, reconstructed with the SAME constants the alert logic uses.
  if (v.alerts.some((a) => a.code === 'EFF_DELTA')) {
    const first = v.derived.daily_delta_1y.find((d, i, arr) =>
      d.delta > EFF_DELTA_CAUTION_PCT && arr.slice(i, i + 3).every((x) => x.delta > EFF_DELTA_CAUTION_PCT),
    );
    if (first) {
      const t = first.day * DAY_MS;
      if (t >= fromMs) events.push({ t, type: 'ALERT', level: 'CAUTION', text: 'CAUTION raised — EFF_DELTA' });
    }
  }
  if (v.alerts.some((a) => a.code === 'EGT_DIVERGENCE')) {
    const firstHot = v.history.hourly.find(
      (s) =>
        s.engines[0].running && s.engines[1].running &&
        Math.abs(s.engines[0].load_pct - s.engines[1].load_pct) < 8 &&
        Math.abs(s.engines[1].exhaust_gas_temp_f - s.engines[0].exhaust_gas_temp_f) > EGT_GAP_CAUTION_F,
    );
    if (firstHot && firstHot.t >= fromMs) {
      events.push({ t: firstHot.t, type: 'ALERT', level: 'CAUTION', text: 'CAUTION raised — EGT_DIVERGENCE' });
    }
  }

  // Staleness starts (last_updated + 30 min = the moment STALE began).
  for (const [stream, ts] of Object.entries(v.history.timestamps)) {
    if (now - ts > 30 * MIN_MS) {
      const t = ts + 30 * MIN_MS;
      if (t >= fromMs) events.push({ t, type: 'DATALINK', level: 'ADVISORY', text: `${stream} stream stale (last heard ${new Date(ts).toISOString().slice(11, 16)}Z)` });
    }
  }

  return events.sort((a, b) => b.t - a.t);
}

export const EVENT_WINDOW_24H = 24 * HOUR_MS;
export const EVENT_WINDOW_EARLIER = 8 * DAY_MS;
