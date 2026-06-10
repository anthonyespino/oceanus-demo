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
// and diversion headroom. 50% reserve on remaining steaming time.
const ENDURANCE_RESERVE = 1.5;

export function evaluateAlerts(v: VesselStatic, history: VesselHistory, d: DerivedVesselMetrics): Alert[] {
  const alerts: Alert[] = [];
  const now = history.minutes[history.minutes.length - 1];
  const reconErr = Math.abs(d.reconciliation.error_pct);

  // ---- WARNING ----
  for (const e of now.engines) {
    if (e.running && e.oil_pressure_psi < 30) {
      alerts.push({ level: 'WARNING', code: 'OIL_PRESSURE', message: `${e.engine_id} oil pressure ${e.oil_pressure_psi} psi` });
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
      message: `${hot.engine_id} EGT +${Math.abs(d.egt_twin_gap_f).toFixed(0)}°F over twin at matched load`,
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
  if (now.mode !== 'PORT' && d.endurance_hours < 72 && !alerts.some((a) => a.code === 'ENDURANCE')) {
    alerts.push({ level: 'ADVISORY', code: 'BUNKER_SOON', message: `Bunkering recommended within 72 h (endurance ${d.endurance_hours} h)` });
  }
  return alerts;
}

function requiredEnduranceH(v: VesselStatic, history: VesselHistory): { hours: number; basis: string } {
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
