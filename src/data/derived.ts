// Derived metrics (DATA_MODEL.md §4) — computed strictly from generated
// history, in a separate layer from raw generation. mode_baseline is built
// from the vessel's own 1-year history, bucketed by mode and weather band, so
// every efficiency judgment is mode-aware (§2).

import { DAY_MS } from './rng';
import { PORTS, distanceNm } from './fleet';
import { requiredEnduranceH } from './alerts'; // round 129: single-source the required endurance (gauge + caution read it)
import type {
  DerivedVesselMetrics,
  Freshness,
  Mode,
  ReconciliationResult,
  StreamTimestamps,
  VesselHistory,
  VesselSample,
  VesselStatic,
} from './types';

const STALE_AFTER_MS = 30 * 60_000; // global rule: >30 min → STALE

export type BaselineKey = `${Mode}:${0 | 1 | 2}`;
export type Baselines = Map<BaselineKey, number>;

function windBand(windKn: number): 0 | 1 | 2 {
  return windKn < 10 ? 0 : windKn < 18 ? 1 : 2;
}

function burnGph(s: VesselSample): number {
  return s.engines.reduce((a, e) => a + e.fuel_rate_gph, 0);
}

/**
 * Efficiency metric per sample (§4): gal/nm in TRANSIT (the headline number
 * underway); in STATION, gph normalized against weather loading (DP thrust
 * scales with wind and current), then judged within its weather band; plain
 * gph in STANDBY/PORT.
 */
function metricOf(s: VesselSample): number | null {
  const burn = burnGph(s);
  if (s.mode === 'TRANSIT') {
    const sog = s.position.speed_over_ground_kn;
    return sog > 2 ? burn / sog : null;
  }
  if (s.mode === 'STATION') {
    const wxLoading = 1 + 0.04 * s.weather.wind_speed_kn + 0.3 * s.weather.current_kn;
    return burn > 0 ? burn / wxLoading : null;
  }
  return burn > 0 ? burn : null;
}

export function buildBaselines(history: VesselHistory): Baselines {
  const buckets = new Map<BaselineKey, number[]>();
  for (const s of history.hourly) {
    const m = metricOf(s);
    if (m === null) continue;
    const key: BaselineKey = `${s.mode}:${windBand(s.weather.wind_speed_kn)}`;
    let arr = buckets.get(key);
    if (!arr) buckets.set(key, (arr = []));
    arr.push(m);
  }
  // Median — robust to the anomaly weeks polluting the tail of the history.
  const out: Baselines = new Map();
  for (const [key, arr] of buckets) {
    arr.sort((a, b) => a - b);
    out.set(key, arr[Math.floor(arr.length / 2)]);
  }
  return out;
}

function baselineFor(baselines: Baselines, s: VesselSample): number | null {
  const band = windBand(s.weather.wind_speed_kn);
  // Fall back to adjacent weather bands when a bucket is thin.
  for (const b of [band, band === 2 ? 1 : band + 1, 0]) {
    const v = baselines.get(`${s.mode}:${b as 0 | 1 | 2}`);
    if (v !== undefined) return v;
  }
  return null;
}

function sampleDelta(baselines: Baselines, s: VesselSample): number | null {
  const m = metricOf(s);
  const base = baselineFor(baselines, s);
  if (m === null || base === null || base <= 0) return null;
  return ((m - base) / base) * 100;
}

function mean(xs: number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}

/** OLS slope over (index, value), scaled to % per `span` indices. */
function slope(values: number[], span: number): number {
  const n = values.length;
  if (n < 2) return 0;
  const mx = (n - 1) / 2;
  const my = mean(values);
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - mx) * (values[i] - my);
    den += (i - mx) ** 2;
  }
  return den ? (num / den) * span : 0;
}

/**
 * Fallback mode derivation (v2 §2): mode is a REPORTED telemetry field; this
 * inference from speed + position + engine load is retained as a validation
 * cross-check (and the documented fallback for absent/stale status feeds).
 */
export function deriveMode(s: VesselSample): Mode {
  if (s.position.speed_over_ground_kn > 4) return 'TRANSIT';
  const inPortGeofence = PORTS.some((p) => distanceNm(s.position, p) < 3);
  if (inPortGeofence) return 'PORT';
  const mainsActive = s.engines.some((e) => e.role === 'MAIN' && e.running);
  return mainsActive ? 'STATION' : 'STANDBY';
}

/**
 * sustained_deviation (v2 §4): trend-weighted ranking score that sorts the
 * fleet view — sustained drift outranks momentary spikes.
 *
 * Formula (proposed, DECISIONS.md ruling 11): over the last 30 daily deltas,
 * a recency-weighted mean (linear weights, today counts 30× day-30) times a
 * persistence factor (fraction of days whose sign agrees with the weighted
 * mean). A 3-week monotonic drift keeps both terms high; a one-day spike is
 * diluted ~30:1 by the weights AND halved by persistence (noise days carry
 * random signs), so it cannot outrank a stable drifter.
 */
export function sustainedDeviation(dailyDeltas: number[]): number {
  const window = dailyDeltas.slice(-30);
  if (window.length < 2) return 0;
  let wSum = 0;
  let num = 0;
  for (let i = 0; i < window.length; i++) {
    const w = i + 1;
    wSum += w;
    num += w * window[i];
  }
  const wmean = num / wSum;
  if (wmean === 0) return 0;
  const agreeing = window.filter((d) => Math.sign(d) === Math.sign(wmean)).length;
  return wmean * (agreeing / window.length);
}

function reconcile(history: VesselHistory): ReconciliationResult {
  // Tank-side fuel use vs metered flow over the trailing window. Walk back
  // from "now" and stop at any bunkering minute (total level rising), since
  // fuel added shoreside isn't burn.
  const ms = history.minutes;
  let meteredGal = 0;
  let startIdx = ms.length - 1;
  for (let i = ms.length - 1; i > 0 && ms.length - i <= 360; i--) {
    const totalNow = ms[i].tanks.reduce((a, t) => a + t.level_gal, 0);
    const totalPrev = ms[i - 1].tanks.reduce((a, t) => a + t.level_gal, 0);
    if (totalNow > totalPrev + 1) break; // bunkering
    meteredGal += ms[i].flow_gps * 60;
    startIdx = i - 1;
  }
  // Below ~150 gal of metered flow (hotel loads in port), integer-gallon tank
  // level resolution dominates any real disagreement — don't judge.
  const windowMin = ms.length - 1 - startIdx;
  if (windowMin < 60 || meteredGal < 150) {
    return { status: 'OK', error_pct: 0, window_h: Math.round((windowMin / 60) * 10) / 10 };
  }
  const drawdown =
    ms[startIdx].tanks.reduce((a, t) => a + t.level_gal, 0) -
    ms[ms.length - 1].tanks.reduce((a, t) => a + t.level_gal, 0);
  const errPct = ((drawdown - meteredGal) / meteredGal) * 100;
  return {
    status: Math.abs(errPct) > 2 ? 'DISAGREE' : 'OK',
    error_pct: Math.round(errPct * 100) / 100,
    window_h: Math.round((windowMin / 60) * 10) / 10,
  };
}

export function computeDerived(history: VesselHistory, v: VesselStatic): DerivedVesselMetrics {
  const baselines = buildBaselines(history);
  const ms = history.minutes;
  const now = ms[ms.length - 1];
  const mode = now.mode;

  // Current window: last 6 h of 1-min samples in the current mode (a fresh
  // mode change just uses what the leg has so far).
  const windowSamples = ms.slice(-360).filter((s) => s.mode === mode);
  const deltas = windowSamples.map((s) => sampleDelta(baselines, s)).filter((d): d is number => d !== null);
  const burnNow = mean(ms.slice(-15).map(burnGph));

  // Daily efficiency_delta over the year (trend charts, trend_30d/90d).
  const daily = new Map<number, number[]>();
  for (const s of history.hourly) {
    const d = sampleDelta(baselines, s);
    if (d === null) continue;
    const day = Math.floor(s.t / DAY_MS);
    let arr = daily.get(day);
    if (!arr) daily.set(day, (arr = []));
    arr.push(d);
  }
  const dailyDelta = [...daily.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([day, arr]) => ({ day, delta: Math.round(mean(arr) * 100) / 100 }));
  const dailyVals = dailyDelta.map((d) => d.delta);

  // 24h sparkline: hourly mean of per-minute deltas.
  const sparkline: number[] = [];
  for (let h = 0; h < 24; h++) {
    const hour = ms.slice(h * 60, (h + 1) * 60);
    const ds = hour.map((s) => sampleDelta(baselines, s)).filter((d): d is number => d !== null);
    sparkline.push(ds.length ? Math.round(mean(ds) * 10) / 10 : 0);
  }

  // Endurance: usable fuel ÷ OPERATING burn. ROUND 130: the divisor is the burn this vessel
  // sustains while UNDERWAY, not the instantaneous load. Dividing a full (just-bunkered) tank by
  // an idle PORT/STANDBY hotel load (≈7 gph) produced thousands of implausible hours, and at 60x
  // a vessel cycling into port made endurance "race upward" (8900h seen). Underway, burnNow
  // already exceeds the operating floor, so the value is unchanged and still counts DOWN as fuel
  // depletes; idle, it's bounded to a realistic operating-hours-remaining figure (fuel ÷ the burn
  // it will resume). The floor falls back to a spec-based transit burn when the 24h window holds
  // no underway samples (a long-moored vessel).
  const usableGal = now.tanks.reduce((a, t) => a + t.level_gal, 0) * 0.95;
  const activeBurns = ms.filter((s) => s.mode === 'TRANSIT' || s.mode === 'STATION').map(burnGph);
  const operatingBurn = activeBurns.length >= 30
    ? mean(activeBurns)
    : 2 * v.main_max_gph * 0.62 + v.gen_max_gph * 0.36; // representative transit burn from spec
  const enduranceDivisor = Math.max(burnNow, operatingBurn);
  const enduranceH = enduranceDivisor > 0 ? usableGal / enduranceDivisor : Infinity;

  // Twin comparison: MAIN E2 − E1 EGT at matched load, 24h average (§6
  // Machine bucket signature).
  const gaps = ms
    .filter((s) => s.engines[0].running && s.engines[1].running && Math.abs(s.engines[0].load_pct - s.engines[1].load_pct) < 8)
    .map((s) => s.engines[1].exhaust_gas_temp_f - s.engines[0].exhaust_gas_temp_f);

  // Cross-check: reported mode (status feed) vs fallback derivation, last 24h.
  const agree = ms.filter((s) => deriveMode(s) === s.mode).length;

  const staleness = {} as Record<keyof StreamTimestamps, Freshness>;
  for (const k of Object.keys(history.timestamps) as (keyof StreamTimestamps)[]) {
    staleness[k] = now.t - history.timestamps[k] > STALE_AFTER_MS ? 'STALE' : 'FRESH';
  }

  const baseNow = baselineFor(baselines, now);
  return {
    mode,
    burn_rate_gph: Math.round(burnNow * 10) / 10,
    efficiency_delta_pct: Math.round(mean(deltas) * 10) / 10,
    baseline_value: baseNow ? Math.round(baseNow * 100) / 100 : 0,
    baseline_metric: mode === 'TRANSIT' ? 'gal_per_nm' : 'gph',
    trend_30d: Math.round(slope(dailyVals.slice(-30), 30) * 10) / 10,
    trend_90d: Math.round(slope(dailyVals.slice(-90), 90) * 10) / 10,
    sustained_deviation: Math.round(sustainedDeviation(dailyVals) * 100) / 100,
    mode_agreement_pct: Math.round((agree / ms.length) * 1000) / 10,
    endurance_hours: Math.round(enduranceH),
    endurance_nm: mode === 'TRANSIT' ? Math.round(enduranceH * now.position.speed_over_ground_kn) : null,
    // ROUND 129: required endurance for this leg (same fn the ENDURANCE caution uses). null in
    // PORT (no mission requirement → gauge stays plain). Scenario overrides re-patch this.
    endurance_required_hours: mode !== 'PORT' ? Math.round(requiredEnduranceH(v, history).hours) : null,
    sparkline_24h: sparkline,
    daily_delta_1y: dailyDelta,
    reconciliation: reconcile(history),
    staleness,
    egt_twin_gap_f: Math.round(mean(gaps) * 10) / 10,
  };
}
