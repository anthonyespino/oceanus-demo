// Alert evaluation (DATA_MODEL.md §7): WARNING / CAUTION / ADVISORY, alerting
// on conditions requiring action, not raw thresholds.

import { DAY_MS } from './rng';
import type { Alert, DerivedVesselMetrics, VesselHistory, VesselStatic } from './types';

// Efficiency CAUTION is only judged underway/on-station: PORT and STANDBY
// burns are small absolute numbers where % deltas are noise, not action items.
const EFFICIENCY_MODES = new Set(['TRANSIT', 'STATION']);

export function evaluateAlerts(v: VesselStatic, history: VesselHistory, d: DerivedVesselMetrics): Alert[] {
  const alerts: Alert[] = [];
  const now = history.minutes[history.minutes.length - 1];

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
  if (Math.abs(d.reconciliation.error_pct) > 10) {
    alerts.push({ level: 'WARNING', code: 'RECONCILIATION', message: `Fuel reconciliation off ${d.reconciliation.error_pct}% — possible leak` });
  }

  // ---- CAUTION ----
  const recent = d.daily_delta_1y.slice(-7).map((x) => x.delta);
  const sustained = mean(recent) > 5;
  if (EFFICIENCY_MODES.has(d.mode) && d.efficiency_delta_pct > 8 && sustained) {
    alerts.push({ level: 'CAUTION', code: 'EFF_DELTA', message: `Efficiency ${fmtPct(d.efficiency_delta_pct)} vs mode baseline, sustained 7d` });
  }
  if (d.egt_twin_gap_f > 40) {
    alerts.push({ level: 'CAUTION', code: 'EGT_DIVERGENCE', message: `Engine 2 EGT +${d.egt_twin_gap_f.toFixed(0)}°F over twin at matched load` });
  }
  if (d.endurance_hours < 36 && now.mode !== 'PORT') {
    alerts.push({ level: 'CAUTION', code: 'ENDURANCE', message: `Endurance ${d.endurance_hours} h below route requirement` });
  }

  // ---- ADVISORY ----
  if (d.reconciliation.status === 'DISAGREE' && Math.abs(d.reconciliation.error_pct) <= 10) {
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
  if (d.endurance_hours >= 36 && d.endurance_hours < 72 && now.mode !== 'PORT') {
    alerts.push({ level: 'ADVISORY', code: 'BUNKER_SOON', message: `Bunkering recommended within 72 h (endurance ${d.endurance_hours} h)` });
  }
  return alerts;
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
