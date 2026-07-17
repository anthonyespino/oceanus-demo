// Alert evaluation (DATA_MODEL.md §7): WARNING / CAUTION / ADVISORY, alerting
// on conditions requiring action, not raw thresholds.
// Incorporates Session 1 PM rulings: consequence-based reconciliation
// severity, endurance requirement derived from distance-to-next-port, and the
// diverging engine identified by id rather than hardcoded.

import { DAY_MS } from './rng';
import { distanceNm, place } from './fleet';
import type { Alert, DerivedVesselMetrics, VesselHistory, VesselStatic } from './types';

// Efficiency CAUTION is only judged underway/on-station: PORT and STANDBY
// burns are small absolute numbers where % deltas are noise, not action items.
const EFFICIENCY_MODES = new Set(['TRANSIT', 'STATION']);

// Reconciliation severity is consequence-based (PM ruling, Session 1 review):
// endurance is fuel ÷ burn, so a fuel-accounting error propagates ~1:1 into
// the endurance estimate. Above ~7% the estimate drifts by multiple hours
// over a typical 2-3 day leg — enough to corrupt bunkering decisions → the
// engineer must act (CAUTION). Below that it's a sensor-maintenance item
// (ADVISORY). Above 10% the §7 leak interpretation applies (WARNING).
export const RECON_CAUTION_PCT = 7;
export const RECON_WARNING_PCT = 10;

// CAUTION thresholds, exported so UI semantics (e.g. status color tokens)
// derive from the SAME constants as the alert logic — never a second set of
// magic numbers.
export const EFF_DELTA_CAUTION_PCT = 8; // current delta above this…
export const EFF_SUSTAINED_7D_PCT = 5; // …with 7-day mean above this → CAUTION
export const EGT_GAP_CAUTION_F = 40; // twin EGT divergence → CAUTION

// Reserve margin on the endurance-to-next-port requirement: weather, holding,
// and diversion headroom. 50% reserve on remaining steaming time. Exported:
// the PortCallsTimeline BUNKER flag reuses it — no second magic number.
export const ENDURANCE_RESERVE = 1.5;

// Bunkering advisory horizon — exported: the endurance dial's minimum band
// is backed by this same constant.
export const BUNKER_SOON_H = 72;

// Tank-level thresholds (round 20; documented in DATA_MODEL alongside the
// reconciliation thresholds). These back the tank fill/outline tint in the
// fuel views — the ONLY thing that may color a tank.
export const FEEDER_LOW_PCT = 20; // ADVISORY: feeder low while a main runs
export const TANK_CRITICAL_PCT = 5; // CAUTION: any tank critically low

// ROUND 131: operator-facing engine label from the data engine_id ("v01-E3" → "G1"). Alert copy
// must NEVER carry the internal vessel-prefixed id (v01-…) — that's build-time provenance; the
// operator thinks "Meridian / E2". Maps the two gens E3/E4 to their G1/G2 display names (R126).
const ENGINE_DISPLAY: Record<string, string> = { E1: 'E1', E2: 'E2', E3: 'G1', E4: 'G2' };
export function engineLabel(engineId: string): string {
  const suffix = engineId.slice(engineId.indexOf('-') + 1); // "v01-E2" → "E2"
  return ENGINE_DISPLAY[suffix] ?? suffix;
}

export function evaluateAlerts(v: VesselStatic, history: VesselHistory, d: DerivedVesselMetrics): Alert[] {
  const alerts: Alert[] = [];
  const now = history.minutes[history.minutes.length - 1];
  const reconErr = Math.abs(d.reconciliation.error_pct);

  // ---- WARNING ----
  for (const e of now.engines) {
    if (e.running && e.oil_pressure_psi < 30) {
      alerts.push({ level: 'WARNING', code: 'OIL_PRESSURE', message: `${engineLabel(e.engine_id)} oil pressure ${e.oil_pressure_psi} psi` });
    }
  }
  const feederPct = mean(now.tanks.filter((t) => t.type === 'FEEDER').map((t) => t.level_pct));
  if (feederPct < 10 && now.mode !== 'PORT') {
    alerts.push({ level: 'WARNING', code: 'FEEDER_LOW', message: `Feeder tanks ${feederPct.toFixed(0)}% underway` });
  }
  if (reconErr > RECON_WARNING_PCT) {
    alerts.push({ level: 'WARNING', code: 'RECONCILIATION', message: `Fuel reconciliation off ${d.reconciliation.error_pct}% — possible leak` });
  }

  // ---- CAUTION ----
  const recent = d.daily_delta_1y.slice(-7).map((x) => x.delta);
  const sustained = mean(recent) > EFF_SUSTAINED_7D_PCT;
  if (EFFICIENCY_MODES.has(d.mode) && d.efficiency_delta_pct > EFF_DELTA_CAUTION_PCT && sustained) {
    alerts.push({ level: 'CAUTION', code: 'EFF_DELTA', message: `Efficiency ${fmtPct(d.efficiency_delta_pct)} vs mode baseline, sustained 7d` });
  }
  // Twin divergence: name the engine that is actually hot, don't assume E2.
  if (Math.abs(d.egt_twin_gap_f) > EGT_GAP_CAUTION_F) {
    const mains = now.engines.filter((e) => e.role === 'MAIN');
    const hot = d.egt_twin_gap_f > 0 ? mains[1] : mains[0];
    alerts.push({
      level: 'CAUTION',
      code: 'EGT_DIVERGENCE',
      message: `${engineLabel(hot.engine_id)} EGT +${Math.abs(d.egt_twin_gap_f).toFixed(0)}°F over twin at matched load, sustained 30d`,
    });
  }
  // Endurance requirement derived from distance to next port at cruise speed,
  // plus reserve (PM ruling: no microcopy implying computation that doesn't
  // exist). Falls back to a 36 h floor when no port call is in the horizon.
  if (now.mode !== 'PORT') {
    const req = requiredEnduranceH(v, history);
    if (d.endurance_hours < req.hours) {
      alerts.push({ level: 'CAUTION', code: 'ENDURANCE', message: `Endurance ${d.endurance_hours} h below ${req.hours.toFixed(0)} h required (${req.basis})` });
    }
  }
  if (reconErr > RECON_CAUTION_PCT && reconErr <= RECON_WARNING_PCT) {
    alerts.push({ level: 'CAUTION', code: 'RECONCILIATION', message: `Fuel reconciliation off ${d.reconciliation.error_pct}% — endurance estimate unreliable` });
  }

  // Tank levels (round 20): CAUTION when any tank is critical; ADVISORY when
  // a feeder runs low while a main is burning. One alert per tank, worst wins.
  const mainsRunning = now.engines.some((e) => e.role === 'MAIN' && e.running);
  const TANK_LABELS = ['ST1', 'ST2', 'FD1', 'FD2'];
  now.tanks.forEach((t, i) => {
    if (t.level_pct < TANK_CRITICAL_PCT) {
      alerts.push({ level: 'CAUTION', code: 'TANK_LOW', message: `${TANK_LABELS[i]} critically low (${t.level_pct.toFixed(0)}%)` });
    } else if (t.type === 'FEEDER' && t.level_pct < FEEDER_LOW_PCT && mainsRunning) {
      alerts.push({ level: 'ADVISORY', code: 'TANK_LOW', message: `${TANK_LABELS[i]} low — verify transfer from storage.` });
    }
  });

  // ---- ADVISORY ----
  if (d.reconciliation.status === 'DISAGREE' && reconErr <= RECON_CAUTION_PCT) {
    alerts.push({ level: 'ADVISORY', code: 'SENSOR_DISAGREE', message: `Flow meter vs tank drawdown disagree ${d.reconciliation.error_pct}% — sensor check` });
  }
  for (const [stream, f] of Object.entries(d.staleness)) {
    if (f === 'STALE') {
      alerts.push({ level: 'ADVISORY', code: 'STALE_DATA', message: `${stream} stream stale > 30 min` });
    }
  }
  const lastChange = history.crewChanges[history.crewChanges.length - 1];
  if (lastChange && now.t - lastChange < 3 * DAY_MS) {
    alerts.push({ level: 'ADVISORY', code: 'CREW_CHANGE', message: 'Crew change within last 72 h' });
  }
  if (now.mode !== 'PORT' && d.endurance_hours < BUNKER_SOON_H && !alerts.some((a) => a.code === 'ENDURANCE')) {
    alerts.push({ level: 'ADVISORY', code: 'BUNKER_SOON', message: `Bunkering recommended within ${BUNKER_SOON_H} h (endurance ${d.endurance_hours} h)` });
  }
  return alerts;
}

// ROUND 129: exported so the endurance gauge's required-hours threshold mark reads the
// SAME value the CAUTION text cites — gauge and alert are single-sourced, can't disagree.
export function requiredEnduranceH(v: VesselStatic, history: VesselHistory): { hours: number; basis: string } {
  const next = history.nextPortCalls[0];
  if (!next) return { hours: 36, basis: '36 h minimum, no port call in horizon' };
  const pos = history.minutes[history.minutes.length - 1].position;
  const nm = distanceNm(pos, place(next.port));
  const hours = Math.max(24, (nm / v.cruise_kn) * ENDURANCE_RESERVE);
  return { hours, basis: `${nm.toFixed(0)} nm to ${next.port} + 50% reserve` };
}

/**
 * Semantic status for UI color tokens, derived from the alert evaluation
 * itself (not re-derived thresholds): WARNING → degraded, CAUTION → watch,
 * ADVISORY/none → nominal (advisories are informational; coloring them would
 * be noise under the dark-cockpit philosophy).
 */
export type StatusLevel = 'nominal' | 'watch' | 'degraded';
export function vesselStatus(alerts: Alert[]): StatusLevel {
  const worst = worstLevel(alerts);
  if (worst === 'WARNING') return 'degraded';
  if (worst === 'CAUTION') return 'watch';
  return 'nominal';
}

/** Worst active level, for the fleet-view badge. */
export function worstLevel(alerts: Alert[]): Alert['level'] | null {
  if (alerts.some((a) => a.level === 'WARNING')) return 'WARNING';
  if (alerts.some((a) => a.level === 'CAUTION')) return 'CAUTION';
  if (alerts.some((a) => a.level === 'ADVISORY')) return 'ADVISORY';
  return null;
}

function mean(xs: number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}
function fmtPct(x: number): string {
  return `${x > 0 ? '+' : ''}${x.toFixed(1)}%`;
}

// ROUND 100: ALERT ROUTING — each alert is substantiated by a specific panel
// (its evidence). The UI docks the alert to that panel's header so the alert
// lives next to the evidence that fired it; alerts with no clear evidence panel
// fall back to a compact GENERAL area. This is a routing RULE keyed by code (not
// a one-off for the demo seed), so it generalizes across scenarios.
//
// SUBSTANTIATION GUARD: a code maps to a panel ONLY where that panel genuinely
// shows the evidence. Codes with no clear evidence home (staleness/datalink,
// weather) are 'general' — forcing a dock would imply a relationship the data
// does not support.
export type AlertTarget = 'engine-twins' | 'efficiency' | 'fuel' | 'crew' | 'general';

export const ALERT_TARGET: Record<string, AlertTarget> = {
  EGT_DIVERGENCE: 'engine-twins', // EGT gap evidence lives in Engine Twins
  OIL_PRESSURE: 'engine-twins', // engine sensor (InstrumentCluster in Engine Twins)
  EFF_DELTA: 'efficiency', // efficiency-vs-baseline reading
  ENDURANCE: 'fuel', // endurance = fuel ÷ burn — fuel synoptic substantiates it
  FEEDER_LOW: 'fuel', // feeder tanks drawn in the synoptic
  TANK_LOW: 'fuel', // tank levels in the synoptic
  RECONCILIATION: 'fuel', // reconciliation cross-check in the synoptic
  SENSOR_DISAGREE: 'fuel', // flow meter vs tank drawdown — synoptic
  BUNKER_SOON: 'fuel', // bunkering = fuel margin
  CREW_CHANGE: 'crew', // crew & log panel
  STALE_DATA: 'general', // staleness/datalink — no single evidence panel
};

/** Round 100: the panel an alert docks to (its evidence), or 'general' when no
    panel genuinely substantiates it. Unknown codes fall back to 'general'. */
export function alertTarget(a: Alert): AlertTarget {
  return ALERT_TARGET[a.code] ?? 'general';
}
